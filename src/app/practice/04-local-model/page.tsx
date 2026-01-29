"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
}

interface ToolCall {
    name: string;
    arguments: unknown;
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
    const [currentToolCall, setCurrentToolCall] = useState<ToolCall | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamingContentRef = useRef("");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, currentToolCall]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
        setIsLoading(true);
        setCurrentToolCall(null);
        streamingContentRef.current = "";

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
                            content: `Error: ${error instanceof Error ? error.message : "Unknown error"}. Make sure Ollama is running on localhost:11434.`,
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
        setCurrentToolCall(null);
    };

    const suggestions = [
        "What's the price of Bitcoin?",
        "Tell me about yourself",
        "What can you do?",
        "Hello, how are you?",
    ];

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            {/* Background Effects */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-orange-500/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-red-500/5 blur-3xl" />
            </div>

            {/* Header */}
            <header className="border-b border-orange-500/20 bg-black/40 px-6 py-4 backdrop-blur-xl">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/practice"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 transition hover:bg-orange-500/30"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Local Model Chat</h1>
                                <p className="text-sm text-orange-300">Ollama / LM Studio integration</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1.5">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-orange-400"></div>
                            <span className="text-xs text-orange-300">Local Instance</span>
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
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl shadow-orange-500/30">
                                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                                    />
                                </svg>
                            </div>
                            <h2 className="mb-2 text-2xl font-bold text-white">Local Model Chat</h2>
                            <p className="mb-4 max-w-md text-center text-gray-400">
                                Run AI agents locally with Ollama or LM Studio. Complete privacy with offline capability.
                            </p>

                            {/* Connection Info */}
                            <div className="mb-6 rounded-xl border border-orange-500/20 bg-orange-500/10 px-5 py-3">
                                <div className="flex items-center gap-3 text-sm text-orange-300">
                                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>
                                        Ensure Ollama is running at{" "}
                                        <code className="rounded bg-orange-500/20 px-1.5 py-0.5 font-mono text-orange-200">
                                            localhost:11434
                                        </code>
                                    </span>
                                </div>
                            </div>

                            {/* Feature badges */}
                            <div className="mb-8 flex flex-wrap justify-center gap-2">
                                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-300">Model.Local()</span>
                                <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-300">Offline Capable</span>
                                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-300">Privacy First</span>
                                <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs text-yellow-300">Streaming</span>
                            </div>

                            {/* Suggestions */}
                            <div className="flex flex-wrap justify-center gap-3">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300 transition hover:border-orange-500/40 hover:bg-orange-500/20"
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
                                            ? "order-2 bg-gradient-to-br from-orange-500 to-red-600"
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
                                                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                        msg.role === "user"
                                            ? "order-1 bg-gradient-to-r from-orange-600 to-red-600 text-white"
                                            : "border border-gray-700/50 bg-gray-800/50 text-gray-100 backdrop-blur-sm"
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">
                                        {msg.content}
                                        {msg.isStreaming && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-orange-400"></span>}
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
                            <div className="flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20">
                                    <svg className="h-4 w-4 animate-spin text-orange-400" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-orange-300">Calling: {currentToolCall.name}</p>
                                    <p className="text-xs text-orange-400/70">
                                        {typeof currentToolCall.arguments === "object"
                                            ? JSON.stringify(currentToolCall.arguments)
                                            : String(currentToolCall.arguments)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className="border-t border-orange-500/20 bg-black/40 p-4 backdrop-blur-xl">
                <div className="mx-auto flex max-w-4xl gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message your local model..."
                        className="flex-1 rounded-xl border border-orange-500/20 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/25 transition hover:shadow-orange-500/40 disabled:opacity-50"
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
