'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, X, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { ChatMessage } from '@/lib/types'

const QUICK_PROMPTS = [
  'Find a lakeside resort under 10,000 ETB',
  'What is there to do in Bishoftu?',
  'When is the Irecha festival?',
  'Best hotel for families with kids?',
]

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    "👋 Hi! I'm the Bishoftu AI Tourism Assistant. Ask me about hotels, crater lakes, attractions, restaurants, getting around, or planning your visit — I'll answer using real information from this platform.",
}

const REQUEST_TIMEOUT_MS = 25_000

export function AiChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [error, setError] = useState<string | null>(null)
  // Ref to the scrollable messages container (a plain div with overflow-y-auto).
  const scrollRef = useRef<HTMLDivElement>(null)
  // Queue of pending user messages to send (prevents the race condition where
  // a second message was silently dropped while the first was in flight).
  const queueRef = useRef<string[]>([])
  // Currently-active AbortController, so we can cancel an in-flight request
  // when the user closes the chat.
  const abortRef = useRef<AbortController | null>(null)

  // Auto-scroll to bottom on new message / status change.
  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, sending, scrollToBottom])

  // Abort any in-flight request when the widget unmounts
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const processQueue = useCallback(async () => {
    if (sending) return
    const next = queueRef.current.shift()
    if (!next) return

    setSending(true)
    setError(null)

    // Snapshot the conversation state at send time so we don't depend on
    // a possibly-stale `messages` closure.
    setMessages((prev) => {
      const withUser = [...prev, { role: 'user' as const, content: next }]
      // Fire the request using this snapshot.
      fire(withUser)
      return withUser
    })
  }, [sending])

  const fire = useCallback(async (conversation: ChatMessage[]) => {
    const controller = new AbortController()
    abortRef.current = controller
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation }),
        signal: controller.signal,
      })

      let data: { reply?: string; error?: string } = {}
      try {
        data = await res.json()
      } catch {
        // Server returned non-JSON (e.g. 500 HTML page) — fall through to error handler
      }

      if (!res.ok || !data.reply) {
        const friendly =
          res.status === 400
            ? 'Please enter a question first.'
            : res.status === 429
              ? 'Too many requests — please wait a moment and try again.'
              : "I'm having trouble responding right now. Please try again, or contact the Bishoftu Tourism Office at +251 22 111 0101."
        setError(friendly)
        setMessages((m) => [...m, { role: 'assistant', content: friendly }])
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: data.reply! }])
      }
    } catch (err: unknown) {
      // Aborted (user closed chat or timeout) — don't pollute the conversation
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      const friendly =
        "I'm having trouble connecting right now. Please try again, or contact the Bishoftu Tourism Office at +251 22 111 0101."
      setError(friendly)
      setMessages((m) => [...m, { role: 'assistant', content: friendly }])
    } finally {
      clearTimeout(timeout)
      abortRef.current = null
      setSending(false)
      // If more messages were queued while this one was in flight, process the next.
      if (queueRef.current.length > 0) {
        void processQueue()
      }
    }
  }, [processQueue])

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      queueRef.current.push(trimmed)
      setInput('')
      void processQueue()
    },
    [processQueue]
  )

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    send(input)
  }

  function handleClose() {
    // Cancel any in-flight request and clear the queue so stale replies
    // don't appear after the user closes the widget.
    abortRef.current?.abort()
    queueRef.current = []
    setSending(false)
    setOpen(false)
  }

  return (
    <>
      {/* Floating toggle button */}
      <Button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-lg gap-0 p-0 transition-transform hover:scale-105 ${
          open ? 'rotate-90' : ''
        }`}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </Button>

      {/* Online badge when closed */}
      {!open && (
        <span className="fixed bottom-[5.5rem] right-6 z-40 hidden sm:flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur border px-3 py-1 text-xs font-medium shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          AI Assistant · Online
        </span>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-3 left-3 sm:left-auto sm:right-5 z-50 sm:w-[400px] max-h-[75vh] sm:max-h-[600px] flex flex-col rounded-2xl border bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-3 fade-in duration-200">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/15">
              <Bot className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold leading-tight">Bishoftu AI Tourism Assistant</p>
              <p className="text-xs text-primary-foreground/80 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Online · Ask me anything about Bishoftu
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15"
              onClick={handleClose}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            <div className="p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      m.role === 'user'
                        ? 'bg-secondary text-secondary-foreground'
                        : m.content.startsWith("I'm having trouble") || m.content.startsWith('Please enter')
                          ? 'bg-rose-500/15 text-rose-700'
                          : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : m.content.startsWith("I'm having trouble") || m.content.startsWith('Please enter') ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </span>
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : m.content.startsWith("I'm having trouble") || m.content.startsWith('Please enter')
                          ? 'bg-rose-500/10 text-rose-900 rounded-tl-sm'
                          : 'bg-secondary text-secondary-foreground rounded-tl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="rounded-2xl rounded-tl-sm bg-secondary px-3.5 py-2.5 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                    </span>
                  </div>
                </div>
              )}

              {/* Quick prompts when only the welcome message is shown */}
              {messages.length === 1 && !sending && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-left text-xs rounded-full border bg-card px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={onSubmit} className="border-t p-3 bg-card">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send(input)
                  }
                }}
                placeholder="Ask about hotels, lakes, things to do…"
                className="min-h-[44px] max-h-32 resize-none text-sm"
                rows={1}
                aria-label="Message"
              />
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 shrink-0"
                disabled={!input.trim() || sending}
                aria-label="Send message"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground text-center">
              AI-generated answers, based only on verified information from this platform.
            </p>
          </form>
        </div>
      )}
    </>
  )
}
