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
- Keep answers short — usually 2-5 sentences, or a short bullet list.
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : []
    const userMessage = messages.findLast?.((m) => m.role === 'user') ? messages.filter((m) => m.role === 'user').pop() : messages.filter((m) => m.role === 'user').pop()

    if (!userMessage || !userMessage.content?.trim()) {
      return NextResponse.json({ error: 'No user message provided.' }, { status: 400 })
    }

    const systemPrompt = await buildSystemPrompt()

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage.content },
      ],
      thinking: { type: 'disabled' },
      temperature: 0.4,
      max_tokens: 800,
    })

    const reply = completion.choices[0]?.message?.content ?? 'Sorry, I could not generate a response. Please try again.'

    return NextResponse.json({ reply })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[chat] error:', msg)
    return NextResponse.json(
      { reply: `I'm sorry — I had trouble responding just now. Please try again, or contact the Bishoftu Tourism Office at +251 22 111 0101. (Error: ${msg})` },
      { status: 200 }
    )
  }
}
