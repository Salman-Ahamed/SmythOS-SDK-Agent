"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
}

/**
 * Practice 04: Local Model Chat (Based on 04-chat-with-local-model.ts)
 *
 * Features:
 * - Integration with local LLMs (Ollama/LM Studio)
 * - Persistent chat sessions
 * - Real-time streaming
 * - Tool call visualization
 */
export default function LocalModelChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => `local-${Date.now()}`);
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
            const response = await fetch("/api/practice/04-local-model", {
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
                        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}. Make sure your local model (Ollama) is running.`,
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
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 backdrop-blur-md">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/practice" className="text-slate-400 hover:text-white transition">
                            ← Back
                        </Link>
                        <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
                            <span className="text-xl font-bold">🏠</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Local Model Chat</h1>
                            <p className="text-xs text-slate-500 font-mono">practice/04-local-model • Ollama/LM Studio</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs">
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-slate-400 font-medium uppercase tracking-wider">Local Instance</span>
                    </div>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 overflow-y-auto px-4 py-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    {messages.length === 0 && (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
                                🤖
                            </div>
                            <h2 className="text-xl font-bold text-white">Local Model Chat</h2>
                            <p className="mx-auto mt-2 max-w-md text-slate-400">
                                This example connects to a local LLM instance (like Ollama).
                                Make sure your local server is running on <code className="text-orange-400">localhost:11434</code>.
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                {["Price of Bitcoin?", "What can you do?", "Hello!"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setInput(s)}
                                        className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-sm hover:border-orange-500/50 hover:bg-orange-500/10 transition"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-xl shadow-lg ${msg.role === "user" ? "bg-orange-600" : "bg-slate-800"
                                }`}>
                                {msg.role === "user" ? "👤" : "🏠"}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${msg.role === "user"
                                    ? "bg-orange-600 text-white"
                                    : "bg-slate-900 border border-slate-800 text-slate-200"
                                }`}>
                                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                <div className={`mt-2 text-[10px] ${msg.role === "user" ? "text-orange-200" : "text-slate-500"}`}>
                                    {msg.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}

                    {activeTool && (
                        <div className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                                ⚙️
                            </div>
                            <div className="flex items-center gap-3 rounded-full border border-orange-500/30 bg-orange-500/5 px-4 py-2 text-sm text-orange-400">
                                <span className="h-2 w-2 animate-ping rounded-full bg-orange-500" />
                                Calling tool: <span className="font-mono font-bold">{activeTool}</span>
                            </div>
                        </div>
                    )}

                    {isLoading && !activeTool && (
                        <div className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-800 flex items-center justify-center text-xl animate-pulse">
                                🏠
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-3">
                                <div className="flex gap-1">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.3s]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.15s]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500" />
                                </div>
                                <span className="text-xs text-slate-500 uppercase tracking-tighter">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className="border-t border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
                <div className="mx-auto max-w-4xl">
                    <div className="relative flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/50 p-2 transition-all focus-within:border-orange-500/50 focus-within:bg-slate-800 focus-within:ring-1 focus-within:ring-orange-500/20">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message local model..."
                            disabled={isLoading}
                            className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-lg shadow-orange-900/20 transition hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                                <span className="text-lg">↑</span>
                            )}
                        </button>
                    </div>
                    <p className="mt-3 text-center text-[10px] text-slate-600 uppercase tracking-widest">
                        Local Chat • Persistence Enabled • Streaming SSE
                    </p>
                </div>
            </footer>
        </div>
    );
}
