import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function App() {
  const [messages, setMessages] = useState([])
  const [isFeedOpen, setIsFeedOpen] = useState(true)
  const messageQueueRef = useRef([
    { role: 'assistant', text: 'Welcome to GlassVibe. I can help refactor code, design UIs, and more.' },
    { role: 'assistant', text: 'Try: “Make the hero section glassmorphic and add a gradient border.”' },
    { role: 'assistant', text: 'Tip: Paste code here and I’ll propose focused edits.' },
  ])
  const nextIdRef = useRef(1)
  const feedRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const queue = messageQueueRef.current
      if (queue.length === 0) return
      const next = queue.shift()
      setMessages((prev) => [...prev, { id: nextIdRef.current++, ...next, appearedAt: Date.now() }])
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll feed to bottom when new messages arrive
  useEffect(() => {
    const el = feedRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const input = form.querySelector('input[name="prompt"]')
    const value = input?.value?.trim()
    if (!value) return
    setMessages((prev) => [...prev, { id: nextIdRef.current++, role: 'user', text: value, appearedAt: Date.now() }])
    if (input) input.value = ''
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextIdRef.current++, role: 'assistant', text: 'Got it. Staging changes and previewing.', appearedAt: Date.now() }])
    }, 900)
  }

  return (
    <div className="relative h-svh w-svw overflow-hidden bg-slate-900">
      {/* Background site */}
      <div className="absolute inset-0">
        <iframe
          title="Golden Doodles site"
          src="https://cluely.com/"
          className="absolute inset-0 h-full w-full border-0"
          referrerPolicy="no-referrer"
          allow="fullscreen"
        />
      </div>

      {/* Gradient underlay pinned to bottom */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[250px] mix-blend-normal"
        aria-hidden
      >
        <div
          className="absolute inset-0 h-[250px] bg-gradient-to-t from-black/10 to-transparent"
          style={{
            mask: 'linear-gradient(rgba(255, 255, 255, 0.25), black, black)',
            maskSize: 'auto',
            maskComposite: 'add',
            maskMode: 'match-source',
            backdropFilter: 'blur(8px)'
          }}
        />
      </div>

      {/* Messages feed */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-10 flex justify-center px-4">
        <AnimatePresence initial={false}>
          {isFeedOpen && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 16, scaleY: 0.92 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: 16, scaleY: 0.92 }}
              transition={{ type: 'spring', stiffness: 520, damping: 30, bounce: 0.22 }}
              className="pointer-events-auto origin-bottom w-full max-w-3xl overflow-hidden"
            >
              <div
                ref={feedRef}
                className="relative space-y-2 max-h-[40vh] overflow-y-auto overscroll-contain overflow-x-visible pb-2 pr-1 pl-1"
              >
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 26, mass: 0.7, bounce: 0.25 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <motion.div
                        layout
                        className={`pointer-events-auto max-w-[85%] rounded-2xl border px-4 py-4 text-[14px] leading-relaxed shadow-sm backdrop-blur-sm ${
                          m.role === 'user'
                            ? 'bg-black/30 border-black/10 text-white/85'
                            : 'bg-white/45 border-white/30 text-black/70'
                        }`}
                        transition={{ type: 'spring', stiffness: 520, damping: 26, bounce: 0.2 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        {m.text}
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prompt bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] flex justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="pointer-events-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl border border-white/20 bg-white/60 p-2 backdrop-blur-lg shadow-xl shadow-slate-700/5 hover:scale-[103%] transition-all duration-200"
          aria-label="Prompt input"
        >
          <input
            type="text"
            name="prompt"
            placeholder="Type your edits here..."
            autoComplete="off"
            spellCheck
            className="flex-1 bg-transparent px-3 py-2 text-[15px] leading-6 text-black/75 placeholder:text-black/40 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              title={isFeedOpen ? 'Collapse messages' : 'Show messages'}
              aria-label={isFeedOpen ? 'Collapse messages' : 'Show messages'}
              onClick={() => setIsFeedOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/50 transition active:translate-y-px active:scale-95 hover:bg-black/25"
            >
              {isFeedOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <button
              type="button"
              title="Attach"
              aria-label="Attach file"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/50 transition active:translate-y-px active:scale-95 hover:bg-black/25"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M7 12l5-5a3.5 3.5 0 115 5l-6.5 6.5a5 5 0 11-7.07-7.07L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              type="submit"
              title="Send"
              aria-label="Send"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/50 transition active:translate-y-px active:scale-95 hover:bg-black/25"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M4 12l16-8-6 16-2-6-8-2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
