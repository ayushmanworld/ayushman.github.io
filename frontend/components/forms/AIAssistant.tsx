'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { aiApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ name: string; url?: string }>
  timestamp: Date
}

const SUGGESTED_QUERIES = [
  'My 4-year-old just got diagnosed with autism. What should I do first?',
  'Schools are refusing my child. What are my legal rights?',
  'Which therapy is best for non-verbal autism in Bangalore?',
  'What government schemes are available for autism in India?',
  'How do I manage severe meltdowns at home?',
]

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Ayushman's AI assistant. I'm here to help you find resources, understand your child's needs, and navigate the autism support system in India. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [sessionId] = useState(() => crypto.randomUUID())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (query: string) =>
      aiApi.query({
        query,
        sessionId,
        language: 'en',
      }),
    onSuccess: (res) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.answer,
          sources: res.data.sources,
          timestamp: new Date(),
        },
      ])
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologise — I encountered an issue. Please try again or call us directly at +91 82800 56665.',
          timestamp: new Date(),
        },
      ])
    },
  })

  const handleSend = (text?: string) => {
    const query = text || input.trim()
    if (!query) return
    setInput('')
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: query, timestamp: new Date() },
    ])
    sendMessage(query)
  }

  return (
    <div className="bg-cream border border-border rounded-3xl overflow-hidden shadow-warm">
      {/* Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4 scroll-smooth">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'flex gap-3 animate-fade-in',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center text-white text-sm flex-shrink-0 mt-1">
                A
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3',
                msg.role === 'user'
                  ? 'bg-amber text-white rounded-tr-sm'
                  : 'bg-white text-navy border border-border rounded-tl-sm'
              )}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted font-semibold mb-1">Sources:</p>
                  {msg.sources.map((s, si) => (
                    <div key={si} className="text-xs text-teal">
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          → {s.name}
                        </a>
                      ) : (
                        <span>→ {s.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs opacity-40 mt-1">
                {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-sm flex-shrink-0 mt-1">
                You
              </div>
            )}
          </div>
        ))}

        {isPending && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center text-white text-sm flex-shrink-0">A</div>
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-3">
          <p className="text-xs text-muted font-semibold mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs bg-white border border-border rounded-full px-3 py-1.5 text-muted hover:border-amber hover:text-amber transition-colors"
              >
                {q.length > 60 ? q.slice(0, 60) + '…' : q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4 flex gap-3 bg-white">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about therapy, schools, diagnosis, government schemes…"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="flex-1"
        />
        <Button
          onClick={() => handleSend()}
          disabled={!input.trim() || isPending}
          className="bg-amber hover:bg-amber-dark text-white px-5"
        >
          Send →
        </Button>
      </div>
    </div>
  )
}
