import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/data'
import type { Hotel, Attraction, NewsPost } from '@/lib/data'

// ─────────────────────────────────────────────────────────────────────────────
// Bishoftu AI Tourism Assistant — multi-provider chat route
//
// Tries providers in this order:
//   1. OpenAI-compatible API (if LLM_API_KEY + LLM_BASE_URL env vars are set)
//      — works with OpenAI, Groq, OpenRouter, Together, Ollama, etc.
//   2. Z.ai SDK (only works inside the Z.ai sandbox — /etc/.z-ai-config)
//   3. Local keyword-search responder (always available, no API key needed)
//
// To enable a real LLM on Vercel, set these env vars in your Vercel project:
//   LLM_API_KEY  = your API key (e.g. gsk_... for Groq, sk-... for OpenAI)
//   LLM_BASE_URL = https://api.groq.com/openai/v1   (or your provider's /v1)
//   LLM_MODEL    = llama-3.3-70b-versatile           (default if not set)
// ─────────────────────────────────────────────────────────────────────────────

export const maxDuration = 30
// Always render as dynamic — never cache AI responses
export const dynamic = 'force-dynamic'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// ── Knowledge base ───────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  const hotels = store.hotels.findMany().sort((a, b) => b.starRating - a.starRating)
  const attractions = store.attractions.findMany()
  const news = store.news.findMany({ take: 4 })

  const hotelLines = hotels
    .map(
      (h) =>
        `- ${h.name} (${h.starRating}★ ${h.type}, ${h.subCity}, ${h.totalRooms} rooms, from ${h.pricePerNight ?? 'n/a'} ETB/night, ${h.phone ?? 'no phone'})`
    )
    .join('\n')

  const attractionLines = attractions
    .map((a) => `- ${a.name} [${a.category}] — ${a.description}`)
    .join('\n')

  const newsLines = news
    .map((n) => `- ${n.title} (${n.hotelName ?? 'Bishoftu Tourism'})`)
    .join('\n')

  return `You are the Bishoftu AI Tourism Assistant, the official virtual concierge for Bishoftu City (formerly Debre Zeit), Oromia, Ethiopia.

Your role:
- Help visitors, residents, and businesses with questions about Bishoftu — hotels, lakes, attractions, restaurants, getting around, cultural events, and trip planning.
- Be friendly, concise, and practical. Use short paragraphs and bullet points where useful.
- Base your answers ONLY on the verified platform data provided below. If you don't have enough information, say so honestly and suggest the user contact the Bishoftu City Culture & Tourism Office at +251 22 111 0101 or info@bishoftu.gov.et.
- Do not invent hotels, prices, phone numbers, or events that are not in the data.
- Keep answers short — usually 2-5 sentences, or a short bullet list of at most 6 items.
- If the user asks in Afaan Oromoo or Amharic, respond in the same language.

About Bishoftu (use this context):
- Bishoftu is a city in the Oromia region of Ethiopia, ~47 km southeast of Addis Ababa along the Addis–Adama expressway.
- Famous for its seven crater lakes: Bishoftu (deepest), Hora (site of the Irecha festival), Babiogaya, Kuriftu, Kilole, Meskel, and Green Lake.
- Home to the Ethiopian Air Force and its aviation museum.
- Major tourism draws: lakeside resorts, bird-watching at Cheleleka Wetland, Sodre hot springs, Irecha thanksgiving festival (late September / early October).
- Sub-cities / areas: Kuriftu, Cheleleka, Tullu Dimtu, Bole Bishoftu, and numbered kebeles.

Current registered hotels on the platform:
${hotelLines}

Current attractions on the platform:
${attractionLines}

Latest tourism updates:
${newsLines}

Emergency contacts (provide if asked):
- Bishoftu City Police: 9141
- Bishoftu Tourist Police: +251 11 433 0099
- National Ambulance: 902
- Fire Brigade: 939
- Bishoftu Referral Hospital: +251 11 433 1100
- Bishoftu Tourism Office: +251 22 111 0101`
}

// ── Provider 1: OpenAI-compatible API (Groq, OpenAI, OpenRouter, etc.) ──────

async function callOpenAICompatible(messages: ChatMessage[], userMessage: string): Promise<string> {
  const apiKey = process.env.LLM_API_KEY
  const baseUrl = process.env.LLM_BASE_URL
  if (!apiKey || !baseUrl) throw new Error('LLM env vars not set')

  const model = process.env.LLM_MODEL || 'llama-3.3-70b-versatile'
  const systemPrompt = buildSystemPrompt()

  const history = messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content?.trim())
    .slice(-7, -1)

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`LLM API ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const reply = data?.choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error('LLM returned empty response')
  return reply
}

// ── Provider 2: Z.ai SDK (only works in the Z.ai sandbox) ────────────────────

async function callZaiSdk(messages: ChatMessage[], userMessage: string): Promise<string> {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()
  const systemPrompt = buildSystemPrompt()
  const history = messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content?.trim())
    .slice(-7, -1)

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ],
    thinking: { type: 'disabled' },
    temperature: 0.4,
    max_tokens: 1500,
  })

  const reply = completion?.choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error('Z.ai returned empty response')
  return reply
}

// ── Provider 3: Local keyword-search responder (no API key needed) ───────────

function localResponder(userMessage: string): string {
  const q = userMessage.toLowerCase()
  const hotels = store.hotels.findMany()
  const attractions = store.attractions.findMany()
  const news = store.news.findMany({ take: 4 })

  // Greetings
  if (/^(hi|hello|hey|salam|selam|good (morning|afternoon|evening))\b/.test(q.trim())) {
    return "👋 Hello! I'm the Bishoftu AI Tourism Assistant. I can help you with hotels, crater lakes, attractions, and trip planning. Try asking:\n• \"Find a lakeside resort under 10,000 ETB\"\n• \"What lakes can I visit?\"\n• \"When is the Irecha festival?\"\n• \"Best hotel for families?\""
  }

  // Thanks
  if (/\b(thank|thanks|thx|gracias|merci)\b/.test(q)) {
    return "You're welcome! Is there anything else you'd like to know about Bishoftu?"
  }

  // Emergency contacts
  if (/\b(emergency|police|ambulance|fire|hospital|help.*number|call)\b/.test(q)) {
    return "Bishoftu Emergency Services:\n• City Police: 9141\n• Tourist Police: +251 11 433 0099\n• Ambulance: 902\n• Fire Brigade: 939\n• Bishoftu Referral Hospital: +251 11 433 1100\n• Tourism Office: +251 22 111 0101"
  }

  // Irecha festival
  if (/\b(irecha|festival|event|celebrat)\b/.test(q)) {
    const hora = attractions.find((a) => a.name.toLowerCase().includes('hora'))
    return `The Irecha festival is the Oromo people's most important thanksgiving celebration, held each September on the shores of Lake Hora in Bishoftu. It draws over 100,000 visitors who gather to give thanks by the lake.${hora ? `\n\n${hora.name}: ${hora.description}` : ''}\n\nUpcoming events on the platform:\n${news.slice(0, 2).map((n) => `• ${n.title}`).join('\n')}`
  }

  // Hot springs
  if (/\b(hot spring|sodre|spa|wellness|relax)\b/.test(q)) {
    const springs = attractions.filter((a) => a.category === 'hot_spring')
    const spaHotels = hotels.filter((h) => /spa/i.test(h.description))
    let out = ''
    if (springs.length) {
      out += `Hot springs in Bishoftu:\n${springs.map((s) => `• ${s.name} — ${s.description}`).join('\n')}\n\n`
    }
    if (spaHotels.length) {
      out += `Hotels with spa facilities:\n${spaHotels.slice(0, 3).map((h) => `• ${h.name} (${h.starRating}★, ${h.subCity}) — from ${h.pricePerNight?.toLocaleString() ?? 'n/a'} ETB/night`).join('\n')}`
    }
    return out || "Sodre Hot Springs on the outskirts of Bishoftu offer natural geothermal relaxation. Several resorts also have spa facilities."
  }

  // Bird watching / wetland
  if (/\b(bird|wetland|cheleleka|flamingo|pelican|wildlife)\b/.test(q)) {
    const wetland = attractions.find((a) => a.category === 'wetland')
    return wetland
      ? `${wetland.name}: ${wetland.description}\n\nBest visited during the dry season (October–March) when migratory waterfowl are present. Guided birding tours are available through Babiogaya Birding Tours.`
      : "Cheleleka Wetland is a recognized Important Bird Area hosting flamingos, pelicans, and migratory waterfowl — best visited October to March."
  }

  // Air force / museum / aviation
  if (/\b(air ?force|museum|aviation|aircraft|plane)\b/.test(q)) {
    const museum = attractions.find((a) => a.category === 'museum')
    return museum
      ? `${museum.name}: ${museum.description}\n\nBishoftu is the headquarters of the Ethiopian Air Force. The museum is open to visitors — contact the Tourism Office for current hours.`
      : "The Ethiopian Air Force Museum in Bishoftu displays historic aircraft and aviation artifacts. Contact the Tourism Office at +251 22 111 0101 for visiting hours."
  }

  // Lakes
  if (/\b(lake|crater|kayak|boat|water|swim)\b/.test(q)) {
    const lakes = attractions.filter((a) => a.category === 'lake')
    return `Bishoftu has seven crater lakes. The main ones on this platform:\n${lakes.map((l) => `• ${l.name} — ${l.description}`).join('\n')}\n\nFor lakeside resorts, see our hotel listings — try asking "find a lakeside resort".`
  }

  // Hotels by price — "under X" / "cheap" / "budget" / "affordable"
  const priceMatch = q.match(/(\d[\d,]*)\s*(etb|birr|usd|\$)?/)
  if (/\b(under|below|cheap|budget|affordable|cheapest|inexpensive)\b/.test(q) && priceMatch) {
    const max = parseInt(priceMatch[1].replace(/,/g, ''), 10)
    const matches = hotels.filter((h) => h.pricePerNight !== null && h.pricePerNight <= max).sort((a, b) => (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0))
    if (matches.length) {
      return `Hotels under ${max.toLocaleString()} ETB/night:\n${matches.slice(0, 6).map((h) => `• ${h.name} (${h.starRating}★ ${h.type}, ${h.subCity}) — ${h.pricePerNight?.toLocaleString()} ETB/night`).join('\n')}`
    }
    return `No hotels found under ${max.toLocaleString()} ETB/night. The most affordable option is ${[...hotels].sort((a, b) => (a.pricePerNight ?? Infinity) - (b.pricePerNight ?? Infinity))[0]?.name}.`
  }

  // Family-friendly
  if (/\b(family|families|kid|child|children)\b/.test(q)) {
    const familyHotels = hotels.filter((h) => /family|kid|child|pool/i.test(h.description)).slice(0, 4)
    return familyHotels.length
      ? `Family-friendly hotels in Bishoftu:\n${familyHotels.map((h) => `• ${h.name} (${h.starRating}★, ${h.subCity}) — ${h.pricePerNight?.toLocaleString() ?? 'n/a'} ETB/night\n  ${h.description.slice(0, 100)}…`).join('\n')}\n\nLake Kuriftu also offers kayaking and beach activities for families.`
      : "Kuriftu Resort & Spa and Bishoftu Resort Lodge are both excellent for families — they offer pools, gardens, and lakeside activities. Lake Kuriftu also has kayaking and beach clubs."
  }

  // Lakeside / resort
  if (/\b(lakeside|lake view|lakefront|resort|waterfront)\b/.test(q)) {
    const resorts = hotels.filter((h) => h.type === 'resort' || /lake/i.test(h.description)).slice(0, 5)
    return `Lakeside resorts in Bishoftu:\n${resorts.map((h) => `• ${h.name} (${h.starRating}★, ${h.subCity}) — from ${h.pricePerNight?.toLocaleString() ?? 'n/a'} ETB/night`).join('\n')}`
  }

  // General hotel query
  if (/\b(hotel|stay|accommodation|lodging|where to stay)\b/.test(q)) {
    return `We have ${hotels.length} registered hotels in Bishoftu. Top picks:\n${hotels.slice(0, 5).map((h) => `• ${h.name} (${h.starRating}★ ${h.type}, ${h.subCity}) — from ${h.pricePerNight?.toLocaleString() ?? 'n/a'} ETB/night`).join('\n')}\n\nAsk me for "lakeside resorts", "family-friendly hotels", or "hotels under X ETB" for tailored recommendations.`
  }

  // Things to do
  if (/\b(things to do|activities|what to do|visit|see|do in)\b/.test(q)) {
    return `Top things to do in Bishoftu:\n• Visit the crater lakes (Bishoftu, Hora, Babiogaya, Kuriftu)\n• Bird-watching at Cheleleka Wetland\n• Kayaking & water sports at Lake Kuriftu\n• Hike the Crater Rim Trail\n• Ethiopian Air Force Museum\n• Sodre Hot Springs\n• Irecha Festival (September) at Lake Hora\n\nAsk me about any of these for more details!`
  }

  // How to get there
  if (/\b(get there|getting there|how to (get|reach|go)|directions|transport|from addis|distance)\b/.test(q)) {
    return "Bishoftu is about 47 km southeast of Addis Ababa, a 1-hour drive on the Addis–Adama expressway. Taxis, ride-hailing (RIDE, Feres), and minibuses run regularly between Addis and Bishoftu."
  }

  // Contact
  if (/\b(contact|phone|email|reach|office|tourism office)\b/.test(q)) {
    return "Bishoftu City Culture & Tourism Office:\n• Phone: +251 22 111 0101\n• Email: info@bishoftu.gov.et\n• Address: Bole Road, Bishoftu, Oromia, Ethiopia"
  }

  // Default fallback — list attractions and hotels as a starting point
  return `I can help you with hotels, crater lakes, attractions, and trip planning in Bishoftu. Here's a quick overview:\n\n🏨 ${hotels.length} registered hotels (try "find a lakeside resort")\n🌊 ${attractions.length} attractions including crater lakes, wetlands & hot springs\n🎉 Latest news: ${news[0]?.title ?? 'Irecha Festival 2026'}\n\nTry asking:\n• "What lakes can I visit?"\n• "Find a hotel under 5,000 ETB"\n• "When is the Irecha festival?"\n• "Things to do in Bishoftu"\n\nOr contact the Tourism Office at +251 22 111 0101.`
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse the body safely
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const messages: ChatMessage[] =
    Array.isArray((body as { messages?: unknown })?.messages)
      ? ((body as { messages: ChatMessage[] }).messages)
      : []

  const userMessages = messages.filter((m) => m && m.role === 'user' && typeof m.content === 'string')
  const userMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null

  if (!userMessage || !userMessage.content.trim()) {
    return NextResponse.json({ error: 'No user message provided.' }, { status: 400 })
  }

  // 2. Try providers in order: OpenAI-compatible → Z.ai SDK → local fallback
  //    OpenAI-compatible is tried first because it works on Vercel.
  //    Z.ai SDK only works inside the Z.ai sandbox.
  //    Local fallback always works.
  const hasLlmEnv = !!(process.env.LLM_API_KEY && process.env.LLM_BASE_URL)

  if (hasLlmEnv) {
    try {
      const reply = await callOpenAICompatible(messages, userMessage.content)
      return NextResponse.json({ reply })
    } catch (err) {
      console.error('[chat] OpenAI-compatible provider failed:', err instanceof Error ? err.message : err)
      // fall through to next provider
    }
  }

  // Try Z.ai SDK (only works in sandbox where /etc/.z-ai-config exists)
  try {
    const reply = await callZaiSdk(messages, userMessage.content)
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[chat] Z.ai SDK provider failed:', err instanceof Error ? err.message : err)
    // fall through to local fallback
  }

  // Local keyword-search responder — always works, no external API needed
  try {
    const reply = localResponder(userMessage.content)
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[chat] local responder failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({
      reply: "I'm sorry, I'm having trouble responding right now. Please try again, or contact the Bishoftu Tourism Office at +251 22 111 0101.",
      error: true,
    })
  }
}
