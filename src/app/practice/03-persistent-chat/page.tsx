"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ToolCall {
  name: string;
  arguments: unknown;
}

interface ToolResult {
  data: unknown;
}

export default function PersistentChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `persistent-${Date.now()}`);
  const [currentToolCall, setCurrentToolCall] = useState<ToolCall | null>(null);
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentToolCall, toolResults]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setCurrentToolCall(null);
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
      const response = await fetch("/api/practice/03-persistent-chat", {
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
                  const newContent = streamingContentRef.current;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.role === "assistant") {
                      return [...newMessages.slice(0, -1), { ...lastMsg, content: newContent }];
                    }
                    return newMessages;
                  });
                  break;

                case "tool_call":
                  setCurrentToolCall(event.data);
                  break;

                case "tool_result":
                  setCurrentToolCall(null);
                  setToolResults((prev) => [...prev, { data: event.data }]);
                  break;

                case "end":
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg) {
                      return [...newMessages.slice(0, -1), { ...lastMsg, isStreaming: false }];
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
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setToolResults([]);
    setCurrentToolCall(null);
  };

  const suggestions = [
    "Search for Bitcoin",
    "What's the price of Ethereum?",
    "Show me market data for Solana",
    "Find top trending coins",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-black/40 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/practice"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 transition hover:bg-purple-500/30"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Persistent Chat</h1>
                <p className="text-sm text-purple-300">Multi-skill agent with data persistence</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1.5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-purple-400"></div>
              <span className="text-xs text-purple-300">Persistent</span>
            </div>
            <button
              onClick={clearChat}
              className="rounded-xl bg-gray-800/50 px-4 py-2 text-sm text-gray-400 transition hover:bg-gray-700/50 hover:text-white"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-2xl shadow-purple-500/30">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-white">Interactive Persistent Chat</h2>
              <p className="mb-4 max-w-md text-center text-gray-400">
                This agent has multiple skills and persistent memory. Try searching for coins, getting prices, or
                viewing market data!
              </p>

              {/* Feature badges */}
              <div className="mb-8 flex flex-wrap justify-center gap-2">
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300">SearchCoin</span>
                <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs text-pink-300">Price</span>
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300">MarketData</span>
                <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-300">Persistent</span>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap justify-center gap-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 transition hover:border-purple-500/40 hover:bg-purple-500/20"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    msg.role === "user"
                      ? "order-2 bg-gradient-to-br from-purple-500 to-pink-600"
                      : "bg-gradient-to-br from-gray-700 to-gray-800"
                  }`}
                >
                  {msg.role === "user" ? (
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      />
                    </svg>
                  )}
                </div>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "order-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "border border-gray-700/50 bg-gray-800/50 text-gray-100 backdrop-blur-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {msg.content}
                    {msg.isStreaming && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-purple-400"></span>}
                  </p>
                  {!msg.isStreaming && (
                    <p className={`mt-2 text-xs ${msg.role === "user" ? "text-white/60" : "text-gray-500"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Tool Call Indicator */}
          {currentToolCall && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                  <svg className="h-4 w-4 animate-spin text-purple-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-300">Calling: {currentToolCall.name}</p>
                  <p className="text-xs text-purple-400/70">
                    {typeof currentToolCall.arguments === "object"
                      ? JSON.stringify(currentToolCall.arguments)
                      : String(currentToolCall.arguments)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tool Results */}
          {toolResults.length > 0 && (
            <div className="space-y-3">
              {toolResults.map((result, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-green-500/20 bg-green-500/10 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/20">
                      <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-green-300">Tool Result</p>
                      <pre className="mt-1 overflow-x-auto text-xs text-green-400/70">
                        {typeof result.data === "object" ? JSON.stringify(result.data, null, 2) : String(result.data)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t border-purple-500/20 bg-black/40 p-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search coins, get prices, or ask about market data..."
            className="flex-1 rounded-xl border border-purple-500/20 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 transition hover:shadow-purple-500/40 disabled:opacity-50"
          >
            {isLoading ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
