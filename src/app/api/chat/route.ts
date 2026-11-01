import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

// Preload a concise knowledge base about Bishoftu that the AI can rely on,
// supplemented with live database figures at request time.
async function buildSystemPrompt(): Promise<string> {
  const hotels = await db.hotel.findMany({ orderBy: { starRating: 'desc' } })
  const attractions = await db.attraction.findMany()
  const news = await db.newsPost.findMany({ orderBy: { publishedAt: 'desc' }, take: 4 })

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

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const maxDuration = 30 // allow up to 30s for the AI reply (Vercel/serverless friendly)

export async function POST(req: NextRequest) {
  // 1. Parse the body safely — handle invalid JSON without throwing
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    )
  }

  // 2. Validate the messages array
  const messages: ChatMessage[] =
    Array.isArray((body as { messages?: unknown })?.messages)
      ? ((body as { messages: ChatMessage[] }).messages)
      : []

  // 3. Take the LAST user message as the current prompt.
  //    (findLast is available in Node 18+/modern browsers; fall back to filter().pop().)
  const userMessages = messages.filter((m) => m && m.role === 'user' && typeof m.content === 'string')
  const userMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null

  if (!userMessage || !userMessage.content.trim()) {
    return NextResponse.json(
      { error: 'No user message provided.' },
      { status: 400 }
    )
  }

  // 4. Build the conversation history EXCLUDING the last user message (we append it separately).
  //    Keep only the last 6 messages to stay within token limits, and strip out any empty content.
  const history = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-7, -1) // drop the last user message; keep up to 6 prior turns

  try {
    const systemPrompt = await buildSystemPrompt()

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage.content },
      ],
      thinking: { type: 'disabled' },
      temperature: 0.4,
      // Generous token budget so replies are not cut off mid-sentence.
      max_tokens: 1500,
    })

    const reply =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "I'm sorry, I couldn't generate a response just now. Could you rephrase your question?"

    return NextResponse.json({ reply })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[chat] error:', msg)
    // Return 200 with a friendly user-facing message so the chat keeps working,
    // but include a clear `error` flag the client can detect if needed.
    return NextResponse.json({
      reply:
        "I'm having trouble responding right now — please try again in a moment. " +
        'If the problem persists, contact the Bishoftu Tourism Office at +251 22 111 0101.',
      error: true,
    })
  }
}
