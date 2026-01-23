"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

/**
 * Practice 05: Observability Chat (Based on 02-opentelemetry-chat-interactive.ts)
 * 
 * Features:
 * - OpenTelemetry integration (via API)
 * - Monitoring dashboard style UI
 * - Real-time streaming
 * - Tool call tracking
 */
export default function ObservabilityChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `otel-${Date.now()}`);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTool]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);
    setActiveTool(null);
    streamingContentRef.current = "";

    // Add empty assistant message for streaming
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
    ]);

    try {
      const response = await fetch("/api/practice/05-observability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));

              switch (event.type) {
                case "content":
                  streamingContentRef.current += event.data;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.role === "assistant") {
                      newMessages[newMessages.length - 1] = {
                        ...lastMsg,
                        content: streamingContentRef.current,
                      };
                    }
                    return newMessages;
                  });
                  break;

                case "tool_call":
                  setActiveTool(event.data.name);
                  break;

                case "end":
                  setIsLoading(false);
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg) lastMsg.isStreaming = false;
                    return newMessages;
                  });
                  break;

                case "error":
                  throw new Error(event.data);
              }
            } catch (e) {
              console.error("Error parsing SSE:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.isStreaming) {
          newMessages[newMessages.length - 1] = {
            ...lastMsg,
            content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            isStreaming: false,
          };
        }
        return newMessages;
      });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-emerald-500 font-mono">
      {/* Matrix-like Header */}
      <header className="border-b border-emerald-900/50 bg-black/80 px-6 py-4 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/practice" className="text-emerald-700 hover:text-emerald-400 transition flex items-center gap-2">
              <span className="text-xl">«</span> BACK
            </Link>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tighter flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                SRE_OBSERVABILITY_NODE
              </h1>
              <p className="text-[10px] text-emerald-800">STATUS: ACTIVE • COLLECTOR: OPEN_TELEMETRY</p>
            </div>
          </div>
          
          <div className="hidden md:flex gap-4 text-[10px] text-emerald-900">
            <div>MEM: 42.1MB</div>
            <div>CPU: 1.2%</div>
            <div>UP: 14h 22m</div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row mx-auto max-w-7xl w-full">
        {/* Sidebar / Stats */}
        <aside className="w-full md:w-64 border-r border-emerald-900/30 p-6 hidden md:block">
          <h2 className="text-xs font-bold text-emerald-700 mb-4 border-b border-emerald-900/30 pb-2">METRICS_LOG</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-[10px] text-emerald-800 uppercase">Latency Avg</div>
              <div className="text-sm font-bold">142ms</div>
              <div className="h-1 w-full bg-emerald-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 w-[60%]" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-emerald-800 uppercase">Success Rate</div>
              <div className="text-sm font-bold">99.8%</div>
              <div className="h-1 w-full bg-emerald-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[99%]" />
              </div>
            </div>
            <div className="mt-8">
              <div className="text-[10px] text-emerald-800 uppercase mb-2">Live Spans</div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-emerald-600">
                  <span>llm.inference</span>
                  <span className="animate-pulse">RUNNING</span>
                </div>
                <div className="flex justify-between text-[9px] text-emerald-700">
                  <span>skill.price_check</span>
                  <span>IDLE</span>
                </div>
                <div className="flex justify-between text-[9px] text-emerald-700">
                  <span>otel.export</span>
                  <span>PENDING</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Chat Console */}
        <main className="flex-1 flex flex-col min-h-0 bg-black/20">
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="opacity-40 space-y-2 border border-emerald-900/30 p-6 rounded bg-emerald-950/5">
                <p className="text-xs underline mb-4">SYSTEM_INIT_COMPLETE</p>
                <p className="text-[10px]">OpenTelemetry collector initialized at http://localhost:4318</p>
                <p className="text-[10px]">Ready for inference tracing...</p>
                <div className="pt-4 flex flex-wrap gap-2">
                  {["Price of Bitcoin?", "Analyze Ethereum", "Debug Session"].map(t => (
                    <button key={t} onClick={() => setInput(t)} className="text-[10px] border border-emerald-900/50 px-2 py-1 hover:bg-emerald-500 hover:text-black transition">
                      [{t}]
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className="text-[9px] mb-1 text-emerald-800">
                  [{msg.role.toUpperCase()}] @ {msg.timestamp.toLocaleTimeString()}
                </div>
                <div className={`max-w-[90%] px-4 py-2 border ${
                  msg.role === "user" 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                    : "bg-emerald-950/20 border-emerald-900/50 text-emerald-500"
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}

            {activeTool && (
              <div className="flex items-center gap-3 text-xs text-emerald-400 bg-emerald-500/5 p-3 border border-emerald-500/20 animate-pulse">
                <span className="text-emerald-500">»</span> EXECUTING_SKILL: <span className="underline font-bold">{activeTool}</span>
                <span className="ml-auto text-[9px]">SPAN_ID: {Math.random().toString(36).substring(7)}</span>
              </div>
            )}

            {isLoading && !activeTool && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 italic">
                <span className="animate-spin text-lg">◌</span> PROCESSING_INFERENCE...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Interface */}
          <footer className="p-6 bg-black/40 border-t border-emerald-900/30">
            <div className="mx-auto max-w-4xl relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">{'>'}</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="EXECUTE_COMMAND..."
                disabled={isLoading}
                className="w-full bg-emerald-950/10 border border-emerald-900/50 pl-10 pr-24 py-3 text-sm focus:outline-none focus:border-emerald-500 transition placeholder:text-emerald-900"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-black px-4 py-1 text-xs font-bold hover:bg-emerald-400 disabled:opacity-30 transition"
              >
                {isLoading ? "BUSY" : "SEND"}
              </button>
            </div>
            <div className="mt-2 text-[9px] text-center text-emerald-900 uppercase">
              Secure_Stream // OTel_Enabled // Tracing_Active
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
