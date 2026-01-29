"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface AgentState {
    id: string;
    role: string;
    emoji: string;
    status: "idle" | "working" | "completed" | "error";
    content: string;
}

/**
 * Practice 10: Multi-Agent Workflow
 * Features:
 * - 3 specialized agents (Researcher, Writer, Editor)
 * - Sequential workflow execution
 * - Real-time progress visualization
 * - Agent-to-agent handoff
 */
export default function MultiAgentPage() {
    const [topic, setTopic] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [agents, setAgents] = useState<AgentState[]>([
        { id: "researcher", role: "Researcher", emoji: "🔍", status: "idle", content: "" },
        { id: "writer", role: "Writer", emoji: "✍️", status: "idle", content: "" },
        { id: "editor", role: "Editor", emoji: "📝", status: "idle", content: "" },
    ]);
    const [currentAgent, setCurrentAgent] = useState<string | null>(null);
    const [sessionId] = useState(() => `multi-${Date.now()}`);
    const [finalContent, setFinalContent] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    const contentRefs = useRef<Record<string, string>>({
        researcher: "",
        writer: "",
        editor: "",
    });

    const agentPanelRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to current agent
    useEffect(() => {
        if (currentAgent && agentPanelRef.current) {
            const agentElement = document.getElementById(`agent-${currentAgent}`);
            agentElement?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [currentAgent]);

    const runWorkflow = async () => {
        if (!topic.trim() || isRunning) return;

        setIsRunning(true);
        setIsComplete(false);
        setFinalContent("");
        contentRefs.current = { researcher: "", writer: "", editor: "" };

        // Reset agents
        setAgents([
            { id: "researcher", role: "Researcher", emoji: "🔍", status: "idle", content: "" },
            { id: "writer", role: "Writer", emoji: "✍️", status: "idle", content: "" },
            { id: "editor", role: "Editor", emoji: "📝", status: "idle", content: "" },
        ]);

        try {
            const response = await fetch("/api/practice/10-multi-agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: topic.trim(), sessionId }),
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
                                case "agent_start":
                                    setCurrentAgent(event.data.agent);
                                    setAgents((prev) =>
                                        prev.map((a) =>
                                            a.id === event.data.agent ? { ...a, status: "working", content: "" } : a
                                        )
                                    );
                                    break;

                                case "agent_content":
                                    contentRefs.current[event.data.agent] += event.data.content;
                                    setAgents((prev) =>
                                        prev.map((a) =>
                                            a.id === event.data.agent
                                                ? { ...a, content: contentRefs.current[event.data.agent] }
                                                : a
                                        )
                                    );
                                    break;

                                case "agent_complete":
                                    setAgents((prev) =>
                                        prev.map((a) =>
                                            a.id === event.data.agent ? { ...a, status: "completed" } : a
                                        )
                                    );
                                    break;

                                case "agent_error":
                                    setAgents((prev) =>
                                        prev.map((a) =>
                                            a.id === event.data.agent
                                                ? { ...a, status: "error", content: event.data.error }
                                                : a
                                        )
                                    );
                                    break;

                                case "workflow_complete":
                                    setIsComplete(true);
                                    setCurrentAgent(null);
                                    // Set final content from editor
                                    setFinalContent(contentRefs.current.editor);
                                    break;

                                case "workflow_error":
                                    console.error("Workflow error:", event.data.error);
                                    break;
                            }
                        } catch {
                            // Ignore parse errors
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Workflow error:", error);
        } finally {
            setIsRunning(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            runWorkflow();
        }
    };

    const sampleTopics = [
        "The future of artificial intelligence",
        "Climate change solutions in 2025",
        "How blockchain is changing finance",
        "The impact of remote work on productivity",
    ];

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
                <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
                <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-purple-500/20 bg-slate-900/80 px-6 py-4 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/practice"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 transition-all hover:border-purple-500/50 hover:text-white"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Multi-Agent Workflow</h1>
                            <p className="text-sm text-purple-300/70">Practice 10 - Agent Orchestration</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1.5">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
                            <span className="text-xs font-medium text-purple-300">3 Agents</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex flex-1 flex-col lg:flex-row">
                {/* Left: Input & Controls */}
                <div className="flex flex-col border-b border-purple-500/20 p-6 lg:w-1/3 lg:border-b-0 lg:border-r">
                    <div className="mb-6">
                        <h2 className="mb-2 text-lg font-semibold text-white">Research Topic</h2>
                        <p className="text-sm text-slate-400">
                            Enter a topic and watch 3 AI agents collaborate to create content.
                        </p>
                    </div>

                    <div className="mb-4">
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter a topic to research and write about..."
                            disabled={isRunning}
                            className="h-24 w-full resize-none rounded-xl border border-purple-500/30 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                        />
                    </div>

                    <button
                        onClick={runWorkflow}
                        disabled={isRunning || !topic.trim()}
                        className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 disabled:opacity-50"
                    >
                        {isRunning ? (
                            <>
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                <span>Running Workflow...</span>
                            </>
                        ) : (
                            <>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Start Workflow</span>
                            </>
                        )}
                    </button>

                    {/* Sample Topics */}
                    <div className="mb-6">
                        <h3 className="mb-2 text-sm font-medium text-slate-400">Try these topics:</h3>
                        <div className="flex flex-wrap gap-2">
                            {sampleTopics.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTopic(t)}
                                    disabled={isRunning}
                                    className="rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs text-purple-300 transition-all hover:border-purple-500/40 hover:bg-purple-500/10 disabled:opacity-50"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Workflow Diagram */}
                    <div className="mt-auto rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                        <h3 className="mb-3 text-sm font-semibold text-purple-300">Workflow Pipeline</h3>
                        <div className="flex items-center justify-between gap-2">
                            {agents.map((agent, idx) => (
                                <div key={agent.id} className="flex items-center">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all ${agent.status === "completed"
                                                ? "bg-green-500/20 ring-2 ring-green-500"
                                                : agent.status === "working"
                                                    ? "bg-purple-500/20 ring-2 ring-purple-500 animate-pulse"
                                                    : agent.status === "error"
                                                        ? "bg-red-500/20 ring-2 ring-red-500"
                                                        : "bg-slate-800"
                                            }`}
                                    >
                                        {agent.emoji}
                                    </div>
                                    {idx < agents.length - 1 && (
                                        <div className="mx-1 h-0.5 w-4 bg-purple-500/30" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-slate-500">
                            <span>Research</span>
                            <span>Write</span>
                            <span>Edit</span>
                        </div>
                    </div>
                </div>

                {/* Right: Agent Panels */}
                <div ref={agentPanelRef} className="flex-1 overflow-y-auto p-6">
                    {!isRunning && agents.every((a) => a.status === "idle") && !isComplete && (
                        <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur-2xl" />
                                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-purple-500/30 bg-slate-900 shadow-2xl">
                                    <span className="text-5xl">🤖</span>
                                </div>
                            </div>
                            <h2 className="mb-2 text-2xl font-bold text-white">Multi-Agent Research Team</h2>
                            <p className="mb-6 max-w-md text-slate-400">
                                Watch 3 specialized AI agents work together to research, write, and edit content on any topic.
                            </p>

                            <div className="grid grid-cols-3 gap-4">
                                {agents.map((agent) => (
                                    <div
                                        key={agent.id}
                                        className="rounded-xl border border-purple-500/20 bg-slate-900/50 p-4 text-center"
                                    >
                                        <div className="mb-2 text-3xl">{agent.emoji}</div>
                                        <div className="font-medium text-white">{agent.role}</div>
                                        <div className="text-xs text-slate-500">
                                            {agent.id === "researcher" && "Gathers info"}
                                            {agent.id === "writer" && "Creates content"}
                                            {agent.id === "editor" && "Polishes output"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Agent Output Panels */}
                    {(isRunning || isComplete) && (
                        <div className="space-y-6">
                            {agents.map((agent) => (
                                <div
                                    key={agent.id}
                                    id={`agent-${agent.id}`}
                                    className={`rounded-xl border transition-all ${agent.status === "working"
                                            ? "border-purple-500 bg-purple-500/5"
                                            : agent.status === "completed"
                                                ? "border-green-500/50 bg-green-500/5"
                                                : agent.status === "error"
                                                    ? "border-red-500/50 bg-red-500/5"
                                                    : "border-slate-800 bg-slate-900/50"
                                        }`}
                                >
                                    {/* Agent Header */}
                                    <div className="flex items-center justify-between border-b border-inherit p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{agent.emoji}</span>
                                            <div>
                                                <div className="font-semibold text-white">{agent.role}</div>
                                                <div className="text-xs text-slate-500">
                                                    {agent.status === "idle" && "Waiting..."}
                                                    {agent.status === "working" && "Processing..."}
                                                    {agent.status === "completed" && "Completed"}
                                                    {agent.status === "error" && "Error"}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${agent.status === "completed"
                                                    ? "bg-green-500"
                                                    : agent.status === "working"
                                                        ? "animate-spin border-2 border-purple-500 border-t-transparent"
                                                        : agent.status === "error"
                                                            ? "bg-red-500"
                                                            : "bg-slate-700"
                                                }`}
                                        >
                                            {agent.status === "completed" && (
                                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            {agent.status === "error" && <span className="text-white">!</span>}
                                        </div>
                                    </div>

                                    {/* Agent Content */}
                                    {agent.content && (
                                        <div className="max-h-64 overflow-y-auto p-4">
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <p className="whitespace-pre-wrap text-slate-300">{agent.content}</p>
                                            </div>
                                        </div>
                                    )}

                                    {agent.status === "working" && !agent.content && (
                                        <div className="flex items-center gap-2 p-4 text-purple-300">
                                            <div className="h-2 w-2 animate-ping rounded-full bg-purple-500" />
                                            <span className="text-sm">Working...</span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Completion Message */}
                            {isComplete && (
                                <div className="rounded-xl border border-green-500/50 bg-green-500/10 p-6 text-center">
                                    <div className="mb-2 text-4xl">🎉</div>
                                    <h3 className="mb-2 text-xl font-bold text-white">Workflow Complete!</h3>
                                    <p className="text-green-300">
                                        All 3 agents have finished their tasks. The final edited content is ready above.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
