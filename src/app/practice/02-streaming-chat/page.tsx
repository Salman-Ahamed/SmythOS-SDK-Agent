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
 * Practice 02: Chat with Streaming (Based on 03.1-chat-streaming.ts)
 *
 * This example demonstrates:
 * - Real-time streaming responses
 * - Event handlers (Content, End, Error, ToolCall, ToolResult)
 * - Live content display as it arrives
 */
export default function StreamingChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => `session-${Date.now()}`);
    const [currentToolCall, setCurrentToolCall] = useState<ToolCall | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // Use ref to accumulate streaming content
    const streamingContentRef = useRef("");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
        setIsLoading(true);

        // Reset streaming content ref
        streamingContentRef.current = "";

        // Add empty assistant message for streaming
        setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
        ]);

        try {
            const response = await fetch("/api/practice/02-streaming-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage, sessionId }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("No reader available");
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n\n").filter((line) => line.startsWith("data: "));

                for (const line of lines) {
                    const jsonStr = line.replace("data: ", "");
                    try {
                        const event = JSON.parse(jsonStr);

                        switch (event.type) {
                            case "content":
                                // Accumulate content in ref, then update state
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
                                setIsLoading(false);
                                break;

                            case "error":
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastMsg = newMessages[newMessages.length - 1];
                                    if (lastMsg && lastMsg.role === "assistant") {
                                        return [
                                            ...newMessages.slice(0, -1),
                                            { ...lastMsg, content: `Error: ${event.data}`, isStreaming: false },
                                        ];
                                    }
                                    return newMessages;
                                });
                                setIsLoading(false);
                                break;
                        }
                    } catch {
                        // Skip invalid JSON
                    }
                }
            }
        } catch (error) {
            setMessages((prev) => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg && lastMsg.role === "assistant") {
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
    };

    return (
        <div className="flex min-h-screen flex-col bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Animated Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-1/4 -left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute -right-1/4 -bottom-1/4 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/10 bg-slate-900/80 px-6 py-4 backdrop-blur-xl">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Back Button */}
                        <Link
                            href="/practice"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/25">
                            <svg
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Streaming Chat</h1>
                            <p className="text-sm text-gray-400">Practice 02: Real-time streaming responses</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
                            </span>
                            <span className="text-xs font-medium text-cyan-400">Streaming</span>
                        </div>
                        {messages.length > 0 && (
                            <button
                                onClick={clearChat}
                                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:bg-white/10 hover:text-white"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Chat Messages */}
            <main className="relative z-10 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-4xl px-4 py-6">
                    {/* Welcome Message */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-cyan-500 to-teal-600 shadow-2xl shadow-cyan-500/30">
                                <svg
                                    className="h-10 w-10 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <h2 className="mb-2 text-2xl font-bold text-white">Real-time Streaming</h2>
                            <p className="mb-8 max-w-md text-center text-gray-400">
                                Watch responses appear character by character! This uses Server-Sent Events for
                                real-time streaming.
                            </p>

                            <div className="flex flex-wrap justify-center gap-3">
                                {[
                                    "What's the price of Bitcoin?",
                                    "Tell me about Solana",
                                    "Compare BTC and ETH prices",
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-white"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="space-y-6">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                            >
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${msg.role === "user"
                                        ? "bg-linear-to-br from-cyan-500 to-teal-600"
                                        : "bg-linear-to-br from-emerald-500 to-green-600"
                                        }`}
                                >
                                    {msg.role === "user" ? (
                                        <svg
                                            className="h-5 w-5 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="h-5 w-5 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    )}
                                </div>

                                <div
                                    className={`group relative max-w-[75%] rounded-2xl px-5 py-3 ${msg.role === "user"
                                        ? "bg-linear-to-br from-cyan-600 to-teal-600 text-white"
                                        : "border border-white/10 bg-white/5 text-gray-100 backdrop-blur-sm"
                                        }`}
                                >
                                    <p className="leading-relaxed whitespace-pre-wrap">
                                        {msg.content}
                                        {msg.isStreaming && (
                                            <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-cyan-400" />
                                        )}
                                    </p>
                                    {!msg.isStreaming && (
                                        <p
                                            className={`mt-2 text-xs ${msg.role === "user" ? "text-white/60" : "text-gray-500"}`}
                                        >
                                            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Tool Call Indicator */}
                        {currentToolCall && (
                            <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                                    <svg
                                        className="h-4 w-4 animate-spin text-amber-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-amber-300">
                                        Calling: {currentToolCall.name}
                                    </p>
                                    <p className="text-xs text-amber-400/70">
                                        {typeof currentToolCall.arguments === "object"
                                            ? JSON.stringify(currentToolCall.arguments)
                                            : String(currentToolCall.arguments)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading Indicator */}
                        {isLoading && !messages.find((m) => m.isStreaming) && (
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-green-600">
                                    <svg
                                        className="h-5 w-5 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.3s]" />
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.15s]" />
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500" />
                                        </div>
                                        <span className="text-sm text-gray-400">Connecting...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className="relative z-10 border-t border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl">
                <div className="mx-auto max-w-4xl">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 transition focus-within:border-cyan-500/50 focus-within:bg-white/10">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask something and watch it stream..."
                            disabled={isLoading}
                            className="flex-1 bg-transparent px-4 py-2 text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? (
                                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                    <p className="mt-2 text-center text-xs text-gray-500">
                        Streaming enabled • Watch responses appear in real-time
                    </p>
                </div>
            </footer>
        </div>
    );
}
