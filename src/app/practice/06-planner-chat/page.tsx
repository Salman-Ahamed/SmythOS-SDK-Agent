"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
}

interface Task {
    summary: string;
    description: string;
    status: "planned" | "ongoing" | "completed" | "failed" | string;
    subtasks?: Record<string, Task>;
}

/**
 * Improved Practice 06: Planner Coder UI
 * Features a robust streaming parser for <thinking>, <planning>, and code tags.
 */
export default function PlannerChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(() => `planner-${Date.now()}`);
    const [currentTasks, setCurrentTasks] = useState<Record<string, Task>>({});
    const [status, setStatus] = useState<string>("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamingContentRef = useRef("");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, status, currentTasks]);

    const resetSession = () => {
        setMessages([]);
        setCurrentTasks({});
        setStatus("");
        setIsLoading(false);
        streamingContentRef.current = "";
        setSessionId(`planner-${Date.now()}`);
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
        setIsLoading(true);
        streamingContentRef.current = "";
        setCurrentTasks({});
        setStatus("Initializing planner...");

        // Add empty assistant message for streaming
        setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
        ]);

        try {
            const response = await fetch("/api/practice/06-planner-chat", {
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

                                case "tasks":
                                    setCurrentTasks(event.data);
                                    break;

                                case "status":
                                    setStatus(event.data);
                                    break;

                                case "end":
                                    setIsLoading(false);
                                    setStatus("Mission accomplished");
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
                            // Ignore parse errors for partial chunks
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Planner error:", error);
            setMessages((prev) => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg && lastMsg.isStreaming) {
                    newMessages[newMessages.length - 1] = {
                        ...lastMsg,
                        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}.
            Check if TAVILY_API_KEY and SCRAPFLY_API_KEY are configured in your .env file.`,
                        isStreaming: false,
                    };
                }
                return newMessages;
            });
            setIsLoading(false);
            setStatus("Operation failed");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Improved recursive task rendering with better hierarchy
    const renderTasks = (tasks: Record<string, Task>, level = 0) => {
        return Object.entries(tasks).map(([id, task]) => (
            <div key={id} className={`flex flex-col ${level > 0 ? "ml-4 border-l border-indigo-900/30 pl-4" : "mb-6"}`}>
                <div className="flex items-start gap-3 group">
                    <div className="mt-1 flex flex-col items-center">
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow-sm transition-colors ${task.status === "completed" ? "bg-emerald-500 text-black" :
                                task.status === "ongoing" ? "bg-amber-500 text-black animate-pulse" :
                                    task.status === "failed" ? "bg-red-500 text-white" :
                                        "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}>
                            {task.status === "completed" ? "✓" :
                                task.status === "ongoing" ? "○" :
                                    task.status === "failed" ? "!" : level + 1}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold transition-colors ${task.status === "completed" ? "text-slate-500 line-through" :
                                task.status === "ongoing" ? "text-amber-400" : "text-slate-200"
                            }`}>
                            {task.summary}
                        </h4>
                        {task.description && level === 0 && (
                            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{task.description}</p>
                        )}
                    </div>
                </div>
                {task.subtasks && <div className="mt-3">{renderTasks(task.subtasks, level + 1)}</div>}
            </div>
        ));
    };

    // Robust streaming content parser
    const renderFormattedContent = (text: string) => {
        if (!text) return null;

        // Use regex to find tags and code blocks
        const pattern = /(<thinking>[\s\S]*?<\/thinking>|<planning>[\s\S]*?<\/planning>|```[\s\S]*?```|[^<`]+)/g;
        const parts = text.match(pattern) || [text];

        return parts.map((part, i) => {
            // Handle Thinking
            if (part.startsWith("<thinking>")) {
                const content = part.replace(/<\/?thinking>/g, "").trim();
                return (
                    <div key={i} className="my-4 rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
                        <div className="bg-slate-800/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                            Internal Cognition
                        </div>
                        <div className="p-4 italic text-slate-400 text-sm leading-relaxed">{content}</div>
                    </div>
                );
            }

            // Handle Planning
            if (part.startsWith("<planning>")) {
                const content = part.replace(/<\/?planning>/g, "").trim();
                return (
                    <div key={i} className="my-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 overflow-hidden">
                        <div className="bg-indigo-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Strategy Development
                        </div>
                        <div className="p-4 text-indigo-200 text-sm leading-relaxed">{content}</div>
                    </div>
                );
            }

            // Handle Code Blocks
            if (part.startsWith("```")) {
                const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
                const lang = match?.[1] || "code";
                const code = match?.[2] || part.replace(/```/g, "");
                return (
                    <div key={i} className="my-4 rounded-xl border border-emerald-500/20 bg-black overflow-hidden group">
                        <div className="bg-zinc-900 px-4 py-1.5 text-[10px] font-mono text-emerald-500 flex justify-between items-center border-b border-zinc-800">
                            <span>{lang.toUpperCase()}</span>
                            <span className="text-zinc-600">READ_ONLY</span>
                        </div>
                        <pre className="p-4 overflow-x-auto font-mono text-xs text-emerald-400 leading-relaxed">
                            <code>{code.trim()}</code>
                        </pre>
                    </div>
                );
            }

            // Plain text (handle potential incomplete tags at the end of stream)
            if (part.includes("<") || part.includes("`")) {
                // Cleaning up any leaked tags that weren't caught by the main blocks
                const cleaned = part.replace(/<(thinking|planning)>|<\/(thinking|planning)>|```/g, "").trim();
                if (!cleaned) return null;
                return <p key={i} className="mb-4 whitespace-pre-wrap leading-relaxed text-slate-300">{cleaned}</p>;
            }

            return <p key={i} className="mb-4 whitespace-pre-wrap leading-relaxed text-slate-300">{part}</p>;
        });
    };

    return (
        <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden">
            {/* Sidebar - Task Panel */}
            <aside className="w-[350px] border-r border-slate-800/60 bg-slate-900/20 hidden xl:flex flex-col">
                <div className="p-8 border-b border-slate-800/60">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                        <h2 className="text-xl font-black tracking-tight text-white uppercase">Roadmap</h2>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Live Task Orchestration</p>
                </div>

                <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700">
                    {Object.keys(currentTasks).length > 0 ? (
                        renderTasks(currentTasks)
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl opacity-20">
                                📋
                            </div>
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">System Idle</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-black/40 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">
                        <span>Core_Status</span>
                        <span className={isLoading ? "text-amber-400 animate-pulse" : "text-emerald-500"}>
                            {status || "Standby"}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-indigo-500 transition-all duration-700 shadow-[0_0_10px_rgba(99,102,241,0.5)] ${isLoading ? "w-[60%] animate-[shimmer_2s_infinite]" : "w-full"
                            }`} />
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-slate-950 to-[#020617]">
                {/* Header */}
                <header className="h-20 border-b border-slate-800/60 px-8 flex items-center justify-between backdrop-blur-xl bg-slate-950/50 sticky top-0 z-10">
                    <div className="flex items-center gap-6">
                        <Link href="/practice" className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </Link>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-black text-white tracking-tight uppercase">Planner Coder</h1>
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Agent_Active // TLS_Secure</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={resetSession}
                            className="text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-900/50"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Reset_Session
                        </button>
                        <div className="hidden sm:flex flex-col items-end mr-4">
                            <span className="text-[10px] font-bold text-slate-600 uppercase">Provider</span>
                            <span className="text-xs font-mono text-slate-400">ANTHROPIC_HAIKU</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                            🤖
                        </div>
                    </div>
                </header>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto px-8 py-10 space-y-10 scrollbar-thin scrollbar-thumb-slate-800">
                    {messages.length === 0 && (
                        <div className="max-w-3xl mx-auto py-12 text-center space-y-8">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-indigo-500 blur-[50px] opacity-20 animate-pulse" />
                                <div className="relative h-24 w-24 mx-auto flex items-center justify-center rounded-[2rem] bg-slate-900 border border-slate-800 text-5xl shadow-2xl">
                                    🧠
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-white tracking-tight">Autonomous Planner</h2>
                                <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
                                    I specialize in complex, multi-step problem solving. I will research, plan, and execute tasks using my integrated toolset.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
                                {[
                                    "Research Bitcoin's origin and explain the SHA-256 algorithm.",
                                    "Find the latest developments in Fusion Energy and write a summary.",
                                    "Plan a React component architecture for a real-time dashboard.",
                                    "Analyze the current state of AI agents and provide a technical outlook."
                                ].map(t => (
                                    <button key={t} onClick={() => setInput(t)} className="group text-left p-5 rounded-2xl border border-slate-800/60 bg-slate-900/20 hover:border-indigo-500/40 hover:bg-indigo-500/[0.03] transition-all duration-300">
                                        <p className="text-xs font-bold text-slate-400 group-hover:text-indigo-400 transition-colors leading-relaxed">{t}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-8 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                            <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl shadow-2xl transition-transform hover:scale-105 ${msg.role === "user"
                                    ? "bg-indigo-600 shadow-indigo-500/20"
                                    : "bg-slate-900 border border-slate-800 shadow-black/40"
                                }`}>
                                {msg.role === "user" ? "👤" : "🤖"}
                            </div>
                            <div className={`max-w-[85%] ${msg.role === "user" ? "bg-indigo-600/90 text-white px-6 py-4 rounded-[2rem] rounded-tr-none shadow-xl" : "flex-1"}`}>
                                {msg.role === "user" ? (
                                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                ) : (
                                    <div className="space-y-2">
                                        {renderFormattedContent(msg.content)}
                                    </div>
                                )}
                                <div className={`mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] ${msg.role === "user" ? "text-indigo-200/60" : "text-slate-600"
                                    }`}>
                                    <span className="h-1 w-1 rounded-full bg-current opacity-40" />
                                    {msg.timestamp.toLocaleTimeString()}
                                    {msg.isStreaming && <span className="ml-2 text-indigo-400 animate-pulse">Stream_Incoming</span>}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && messages[messages.length - 1]?.content === "" && (
                        <div className="flex gap-8 items-start">
                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shadow-xl">
                                🤖
                            </div>
                            <div className="flex-1 space-y-4 py-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                                        Agent_Processing: <span className="text-slate-400">{status || "Analyzing_Logic"}</span>
                                    </div>
                                </div>
                                <div className="space-y-3 opacity-20">
                                    <div className="h-3 w-full bg-gradient-to-r from-slate-800 to-transparent rounded-full animate-pulse" />
                                    <div className="h-3 w-[90%] bg-gradient-to-r from-slate-800 to-transparent rounded-full animate-pulse [animation-delay:0.2s]" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <footer className="p-8 bg-slate-950/80 border-t border-slate-800/60 backdrop-blur-xl">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
                            <div className="relative flex items-center gap-3 rounded-[1.8rem] border border-slate-700/50 bg-slate-900/80 p-3 pl-6 transition-all focus-within:border-indigo-500/50">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Dispatch autonomous command..."
                                    disabled={isLoading}
                                    className="flex-1 bg-transparent py-2 text-sm text-white placeholder-slate-600 focus:outline-none disabled:opacity-50"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={isLoading || !input.trim()}
                                    className="h-12 w-12 flex items-center justify-center rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-900/40 disabled:opacity-20 disabled:scale-95"
                                >
                                    {isLoading ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    ) : (
                                        <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-center gap-6">
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                <span className="h-1 w-1 rounded-full bg-emerald-500" /> Web_Search
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                <span className="h-1 w-1 rounded-full bg-emerald-500" /> Web_Scrape
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                <span className="h-1 w-1 rounded-full bg-indigo-500" /> Multi_Step_Logic
                            </div>
                        </div>
                    </div>
                </footer>
            </main>

            <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
        </div>
    );
}
