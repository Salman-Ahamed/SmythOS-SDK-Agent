"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ToolInfo {
  name: string;
  result?: any;
}

export default function VectorStoragePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `vector-${Date.now()}`);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [toolResults, setToolResults] = useState<ToolInfo[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTool, toolResults]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setActiveTool(null);
    setToolResults([]);
    streamingContentRef.current = "";

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);

    // Add empty assistant message for streaming
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
    ]);

    try {
      const response = await fetch("/api/practice/07-vector-storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
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
                      return [
                        ...newMessages.slice(0, -1),
                        { ...lastMsg, content: streamingContentRef.current },
                      ];
                    }
                    return newMessages;
                  });
                  break;

                case "tool_call":
                  setActiveTool(event.data);
                  break;

                case "tool_result":
                  setToolResults((prev) => [...prev, { name: activeTool || "Tool", result: event.data }]);
                  setActiveTool(null);
                  break;

                case "end":
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg) {
                      return [
                        ...newMessages.slice(0, -1),
                        { ...lastMsg, content: streamingContentRef.current, isStreaming: false },
                      ];
                    }
                    return newMessages;
                  });
                  break;

                case "error":
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg) {
                      return [
                        ...newMessages.slice(0, -1),
                        { ...lastMsg, content: `Error: ${event.data}`, isStreaming: false },
                      ];
                    }
                    return newMessages;
                  });
                  break;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg) {
          return [
            ...newMessages.slice(0, -1),
            {
              ...lastMsg,
              content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
              isStreaming: false,
            },
          ];
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      setActiveTool(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "Add knowledge: Bitcoin was created by Satoshi Nakamoto in 2008.",
    "Search knowledge: Who created Bitcoin?",
    "Generate a poem about space and save it as space.txt",
    "What's in my knowledge base?"
  ];

  return (
    <div className="flex h-screen bg-orange-950/5 text-gray-300 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-orange-500/10 bg-orange-950/20 flex flex-col shrink-0">
        <div className="p-6 border-b border-orange-500/10">
          <h2 className="text-sm font-bold text-orange-400 uppercase tracking-widest">Practice 07</h2>
          <h1 className="text-xl font-bold text-white mt-1">Vector DB</h1>
        </div>
        <div className="p-6 flex-1">
          <p className="text-xs text-orange-300/60 leading-relaxed mb-6">
            Demonstrating RAG (Retrieval-Augmented Generation) with RAMVectorDB and Local Storage.
          </p>
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Storage Types</h3>
            <ul className="text-[11px] space-y-2 text-orange-200/50">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.5)]"></div>
                RAMVectorDB (Vectors)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50"></div>
                LocalStorage (Files)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50"></div>
                Memory (Session)
              </li>
            </ul>
          </div>
        </div>
        <div className="p-6 mt-auto">
          <Link
            href="/practice"
            className="flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col bg-[#0a0a0b]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center border border-orange-500/20 mb-8 relative">
                  <div className="absolute inset-0 bg-orange-500/5 blur-xl rounded-full"></div>
                  <svg className="w-10 h-10 text-orange-500 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Knowledge Assistant</h2>
                <p className="text-gray-500 max-w-sm mb-10">
                  I can learn new information and store it in a vector database for perfect recall later.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(s)}
                      className="text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-orange-500/30 transition-all text-xs text-gray-400 hover:text-orange-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex gap-6 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border ${
                      msg.role === "user" ? "bg-white/5 border-white/10" : "bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                    }`}>
                      {msg.role === "user" ? (
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>
                    <div className={`flex flex-col gap-3 max-w-[85%] ${msg.role === "user" ? "items-end text-right" : "items-start text-left"}`}>
                      <div className={`text-[15px] leading-relaxed ${msg.role === "user" ? "text-white" : "text-gray-300"}`}>
                        {msg.content}
                        {msg.isStreaming && !msg.content && (
                          <div className="flex gap-1.5 items-center mt-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]"></div>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Tool Status */}
                {activeTool && (
                  <div className="ml-14 flex items-center gap-3 py-2 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-xs font-mono text-orange-500/70 uppercase tracking-widest">
                      Using {activeTool}...
                    </span>
                  </div>
                )}

                {/* Tool Results */}
                {toolResults.map((tr, i) => (
                  <div key={i} className="ml-14 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{tr.name} Result</span>
                      <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <pre className="text-[11px] font-mono text-orange-200/60 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(tr.result, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Footer */}
        <footer className="p-8 bg-[#0a0a0b] border-t border-white/5">
          <div className="max-w-3xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the knowledge assistant..."
              className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-[15px] text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all pr-16 shadow-2xl"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-3 h-8 w-10 rounded-xl bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center disabled:opacity-30 transition-all shadow-lg shadow-orange-600/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
