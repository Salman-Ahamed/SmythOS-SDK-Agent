"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
    traceId?: string;
}

interface Span {
    name: string;
    status: "running" | "completed" | "error";
    duration?: number;
}

/**
 * Practice 05: Observability Chat (Based on 02-opentelemetry-chat-interactive.ts)
 *
 * Features:
 * - OpenTelemetry integration (via API)
 * - Monitoring dashboard style UI
 * - Real-time streaming
 * - Trace visualization
 */
export default function ObservabilityChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => `otel-${Date.now()}`);
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [spans, setSpans] = useState<Span[]>([]);
    const [metrics, setMetrics] = useState({ latency: 0, requests: 0, successRate: 100 });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamingContentRef = useRef("");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeTool]);

    // Simulate metrics update
    useEffect(() => {
        if (messages.length > 0) {
            setMetrics(prev => ({
                latency: Math.floor(Math.random() * 200) + 50,
                requests: prev.requests + 1,
                successRate: Math.min(100, Math.floor(Math.random() * 5) + 95)
            }));
        }
    }, [messages.length]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        const traceId = Math.random().toString(36).substring(2, 10);
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date(), traceId }]);
        setIsLoading(true);
        setActiveTool(null);
        streamingContentRef.current = "";

        // Add span for this request
        setSpans(prev => [...prev.slice(-4), { name: "llm.inference", status: "running" }]);

        setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "", timestamp: new Date(), isStreaming: true, traceId },
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
                                    setSpans(prev => [...prev.slice(-4), { name: `skill.${event.data.name}`, status: "running" }]);
                                    break;

                                case "tool_result":
                                    setSpans(prev => prev.map(s => s.status === "running" ? { ...s, status: "completed", duration: Math.floor(Math.random() * 100) + 20 } : s));
                                    setActiveTool(null);
                                    break;

                                case "end":
                                    setIsLoading(false);
                                    setSpans(prev => prev.map(s => s.status === "running" ? { ...s, status: "completed", duration: Math.floor(Math.random() * 200) + 50 } : s));
                                    setMessages((prev) => {
                                        const newMessages = [...prev];
                                        const lastMsg = newMessages[newMessages.length - 1];
                                        if (lastMsg) lastMsg.isStreaming = false;
                                        return newMessages;
                                    });
                                    break;

                                case "error":
                                    setSpans(prev => prev.map(s => s.status === "running" ? { ...s, status: "error" } : s));
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

    const clearSession = () => {
        setMessages([]);
        setSpans([]);
        setActiveTool(null);
        setMetrics({ latency: 0, requests: 0, successRate: 100 });
    };

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 text-emerald-400">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-green-500/5 blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-emerald-900/30 bg-black/80 px-6 py-4 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Back Button */}
                        <Link
                            href="/practice"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition hover:bg-emerald-500/20 hover:text-emerald-400"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        {/* Logo */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-white">Observability Chat</h1>
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <p className="text-sm text-emerald-700 font-mono">Practice 05: OpenTelemetry Integration</p>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-700">LATENCY:</span>
                                <span className="text-emerald-400">{metrics.latency}ms</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-700">REQUESTS:</span>
                                <span className="text-emerald-400">{metrics.requests}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-700">SUCCESS:</span>
                                <span className="text-emerald-400">{metrics.successRate}%</span>
                            </div>
                        </div>
                        {messages.length > 0 && (
                            <button
                                onClick={clearSession}
                                className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-500/20 hover:text-emerald-400"
                            >
                                Clear Session
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="relative z-10 flex flex-1 overflow-hidden">
                {/* Sidebar - Spans/Traces */}
                <aside className="hidden lg:flex w-72 flex-col border-r border-emerald-900/30 bg-black/40">
                    <div className="border-b border-emerald-900/30 p-4">
                        <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Live Traces</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {spans.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-3xl mb-2 opacity-20">📊</div>
                                <p className="text-xs text-emerald-800">No traces yet</p>
                            </div>
                        ) : (
                            spans.map((span, idx) => (
                                <div
                                    key={idx}
                                    className={`rounded-lg border p-3 font-mono text-xs transition-all ${
                                        span.status === "running"
                                            ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
                                            : span.status === "error"
                                            ? "border-red-500/30 bg-red-500/5 text-red-400"
                                            : "border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold">{span.name}</span>
                                        <span className={`h-2 w-2 rounded-full ${
                                            span.status === "running" ? "bg-amber-500 animate-pulse" :
                                            span.status === "error" ? "bg-red-500" : "bg-emerald-500"
                                        }`} />
                                    </div>
                                    <div className="flex items-center justify-between text-emerald-700">
                                        <span>{span.status.toUpperCase()}</span>
                                        {span.duration && <span>{span.duration}ms</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Metrics Panel */}
                    <div className="border-t border-emerald-900/30 p-4 space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-emerald-700">Success Rate</span>
                                <span className="text-emerald-400">{metrics.successRate}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-emerald-950 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-600 to-green-500 transition-all duration-500"
                                    style={{ width: `${metrics.successRate}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-[10px] text-emerald-800 text-center font-mono">
                            COLLECTOR: OTEL_HTTP
                        </div>
                    </div>
                </aside>

                {/* Main Chat Area */}
                <main className="flex flex-1 flex-col min-w-0">
                    <div className="flex-1 overflow-y-auto px-6 py-8">
                        <div className="mx-auto max-w-3xl space-y-6">
                            {/* Welcome */}
                            {messages.length === 0 && (
                                <div className="rounded-2xl border border-emerald-900/30 bg-emerald-950/20 p-8 text-center">
                                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25">
                                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h2 className="mb-2 text-xl font-bold text-white">Observability Enabled</h2>
                                    <p className="mb-6 text-sm text-emerald-600">
                                        This chat is instrumented with OpenTelemetry. Watch traces and metrics in real-time.
                                    </p>

                                    {/* Feature badges */}
                                    <div className="mb-6 flex flex-wrap justify-center gap-2">
                                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">OpenTelemetry</span>
                                        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400">Tracing</span>
                                        <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs text-teal-400">Metrics</span>
                                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">SRE.init()</span>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-2">
                                        {["Price of Bitcoin?", "Analyze ETH", "Debug Session"].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setInput(t)}
                                                className="rounded-lg border border-emerald-900/50 bg-emerald-950/50 px-4 py-2 text-sm text-emerald-500 transition hover:border-emerald-500/50 hover:bg-emerald-500/10"
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Messages */}
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                                        msg.role === "user"
                                            ? "bg-gradient-to-br from-emerald-500 to-green-600"
                                            : "bg-gradient-to-br from-zinc-700 to-zinc-800"
                                    }`}>
                                        {msg.role === "user" ? (
                                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        )}
                                    </div>

                                    <div className={`max-w-[75%] ${msg.role === "user" ? "" : ""}`}>
                                        {msg.traceId && (
                                            <div className={`mb-1 font-mono text-[10px] ${msg.role === "user" ? "text-right" : ""} text-emerald-800`}>
                                                trace_id: {msg.traceId}
                                            </div>
                                        )}
                                        <div className={`rounded-2xl px-5 py-3 ${
                                            msg.role === "user"
                                                ? "bg-gradient-to-br from-emerald-600 to-green-600 text-white"
                                                : "border border-emerald-900/30 bg-zinc-900/80 text-emerald-100"
                                        }`}>
                                            <p className="whitespace-pre-wrap leading-relaxed">
                                                {msg.content}
                                                {msg.isStreaming && (
                                                    <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-emerald-400" />
                                                )}
                                            </p>
                                        </div>
                                        {!msg.isStreaming && (
                                            <div className={`mt-1 font-mono text-[10px] ${msg.role === "user" ? "text-right" : ""} text-emerald-800`}>
                                                {msg.timestamp.toLocaleTimeString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Tool Call */}
                            {activeTool && (
                                <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 font-mono">
                                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                                    <span className="text-sm text-amber-400">EXECUTING: {activeTool}</span>
                                    <span className="ml-auto text-xs text-amber-600">span_active</span>
                                </div>
                            )}

                            {/* Loading */}
                            {isLoading && !activeTool && messages[messages.length - 1]?.content === "" && (
                                <div className="flex items-center gap-3 text-sm text-emerald-600">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
                                    <span className="font-mono">processing_inference...</span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input */}
                    <footer className="border-t border-emerald-900/30 bg-black/60 p-4 backdrop-blur-xl">
                        <div className="mx-auto max-w-3xl">
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-900/30 bg-zinc-900/50 p-2 transition focus-within:border-emerald-500/50">
                                <span className="pl-2 text-emerald-600 font-mono">{">"}</span>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter command..."
                                    disabled={isLoading}
                                    className="flex-1 bg-transparent py-2 text-emerald-100 placeholder-emerald-800 focus:outline-none disabled:opacity-50 font-mono"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={isLoading || !input.trim()}
                                    className="flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-6 font-mono text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 disabled:opacity-50"
                                >
                                    {isLoading ? "BUSY" : "SEND"}
                                </button>
                            </div>
                            <div className="mt-2 text-center font-mono text-[10px] text-emerald-900">
                                SECURE_STREAM • OTEL_ENABLED • TRACING_ACTIVE
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
