"use client";

import { useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Practice 01: Basic Chat (Based on 03-chat.ts)
 *
 * This is the simplest chat example demonstrating:
 * - Basic chat conversation with an agent
 * - Agent memory within a session
 * - Synchronous (non-streaming) responses
 */
export default function BasicChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/practice/01-basic-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });
      console.log(response);

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ]);
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

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <h1 className="text-xl font-bold text-white">Practice 01: Basic Chat</h1>
        <p className="text-sm text-gray-400">
          Based on 03-chat.ts - Simple synchronous chat with agent memory
        </p>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center">
              <p className="text-gray-400">Start a conversation with the CryptoMarket Assistant!</p>
              <p className="mt-2 text-sm text-gray-500">
                Try: &quot;Hi, my name is John. Give me the current price of Bitcoin?&quot;
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-100"
                }`}
              >
                <p className="text-xs font-medium tracking-wide uppercase opacity-70">
                  {msg.role === "user" ? "You" : "Assistant"}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-gray-800 px-4 py-3">
                <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
                  Assistant
                </p>
                <p className="mt-1 text-gray-300">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-gray-800 bg-gray-900 p-4">
        <div className="mx-auto flex max-w-3xl gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}
