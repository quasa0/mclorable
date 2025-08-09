"use client";

import { useEffect, useRef, useState } from "react";
import { UIMessage } from "ai";
import { useQuery } from "@tanstack/react-query";
import { chatState } from "@/actions/chat-streaming";
import { CompressedImage } from "@/lib/image-compression";
import { useChatSafe } from "./use-chat";

export default function Chat(props: {
  appId: string;
  initialMessages: UIMessage[];
  isLoading?: boolean;
  topBar?: React.ReactNode;
  running: boolean;
}) {
  const { data: chat } = useQuery({
    queryKey: ["stream", props.appId],
    queryFn: async () => {
      return chatState(props.appId);
    },
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
  });

  const { messages, sendMessage } = useChatSafe({
    messages: props.initialMessages,
    id: props.appId,
    resume: props.running && chat?.state === "running",
  });

  const [input, setInput] = useState("");
  const [isFeedOpen, setIsFeedOpen] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    if (!input.trim()) return;
    sendMessage(
      {
        parts: [
          {
            type: "text",
            text: input,
          },
        ],
      },
      {
        headers: {
          "Adorable-App-Id": props.appId,
        },
      }
    );
    setInput("");
  };

  const onSubmitWithImages = (text: string, images: CompressedImage[]) => {
    const parts: Parameters<typeof sendMessage>[0]["parts"] = [];

    if (text.trim()) {
      parts.push({
        type: "text",
        text: text,
      });
    }

    images.forEach((image) => {
      parts.push({
        type: "file",
        mediaType: image.mimeType,
        url: image.data,
      });
    });

    sendMessage(
      {
        parts,
      },
      {
        headers: {
          "Adorable-App-Id": props.appId,
        },
      }
    );
    setInput("");
  };

  async function handleStop() {
    await fetch("/api/chat/" + props.appId + "/stream", {
      method: "DELETE",
      headers: {
        "Adorable-App-Id": props.appId,
      },
    });
  }

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="relative h-full w-full" style={{ transform: "translateZ(0)" }}>
      {/* Messages feed */}
      {isFeedOpen && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-10 flex justify-center px-4">
          <div className="pointer-events-auto origin-bottom w-full max-w-3xl overflow-hidden">
            <div
              ref={feedRef}
              className="relative space-y-2 max-h-[40vh] overflow-y-auto overscroll-contain overflow-x-visible pb-2 pr-1 pl-1 no-scrollbar"
            >
              {messages.map((message: any) => {
                const text = Array.isArray(message.parts)
                  ? message.parts
                      .filter((p: any) => p.type === "text")
                      .map((p: any) => p.text)
                      .join("")
                  : "";
                if (!text) return null;
                const isUser = message.role === "user";
                return (
                  <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[85%] rounded-2xl border px-4 py-4 text-[14px] leading-relaxed shadow-sm backdrop-blur-sm bg-white/45 border-white/30 text-black/70">
                      <div className="whitespace-pre-wrap">{text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Prompt bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] flex justify-center px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="pointer-events-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl border border-white/20 bg-white/60 p-2 backdrop-blur-2xl shadow-xl shadow-slate-700/5 hover:scale-[103%] transition-all duration-200"
          aria-label="Prompt input"
        >
          <input
            type="text"
            name="prompt"
            placeholder="Type your edits here..."
            autoComplete="off"
            spellCheck
            className="flex-1 bg-transparent px-3 py-2 text-[15px] leading-6 text-black/75 placeholder:text-black/40 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              title={isFeedOpen ? "Collapse messages" : "Show messages"}
              aria-label={isFeedOpen ? "Collapse messages" : "Show messages"}
              onClick={() => setIsFeedOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/50 transition active:translate-y-px active:scale-95 hover:bg-black/25"
            >
              {isFeedOpen ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={() => {}} />
            <button
              type="button"
              title="Attach"
              aria-label="Attach file"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/50 transition active:translate-y-px active:scale-95 hover:bg-black/25"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M7 12l5-5a3.5 3.5 0 115 5l-6.5 6.5a5 5 0 11-7.07-7.07L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="submit"
              title="Send"
              aria-label="Send"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/50 transition active:translate-y-px active:scale-95 hover:bg-black/25 disabled:opacity-50"
              disabled={!input.trim()}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M4 12l16-8-6 16-2-6-8-2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          width: 0;
          height: 0;
          background: transparent; /* Chrome/Safari/Webkit */
        }
      `}</style>
    </div>
  );
}
