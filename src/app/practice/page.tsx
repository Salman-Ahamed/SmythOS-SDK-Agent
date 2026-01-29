"use client";

import Link from "next/link";
import { useState } from "react";

import {
    ArrowRightIcon,
    BrainIcon,
    ChartIcon,
    ChatBubbleIcon,
    CheckIcon,
    DatabaseIcon,
    DocumentIcon,
    GitHubOctocatIcon,
    HomeIcon,
    ImageIcon,
    PlannerIcon,
    ServerIcon,
    StarIcon,
    StreamIcon,
    WorkflowIcon,
} from "@/components/icons";

interface PracticeExample {
    id: string;
    slug: string;
    title: string;
    description: string;
    complexity: number;
    features: string[];
    sourceFile: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    bgGradient: string;
}

const practiceExamples: PracticeExample[] = [
    {
        id: "01",
        slug: "01-basic-chat",
        title: "Basic Chat",
        description:
            "Learn the fundamentals of creating an AI agent with simple chat functionality and session memory.",
        complexity: 1,
        features: ["Agent Creation", "Skill Integration", "Chat API", "Memory"],
        sourceFile: "03-chat.ts",
        icon: ChatBubbleIcon,
        gradient: "from-indigo-500 to-purple-500",
        bgGradient: "from-indigo-500/10 to-purple-500/10",
    },
    {
        id: "02",
        slug: "02-streaming-chat",
        title: "Streaming Chat",
        description:
            "Real-time streaming responses with Server-Sent Events (SSE) and event handlers.",
        complexity: 2,
        features: ["SSE Streaming", "Event Handlers", "Real-time UI", "TLLMEvent"],
        sourceFile: "03.1-chat-streaming.ts",
        icon: StreamIcon,
        gradient: "from-cyan-500 to-teal-500",
        bgGradient: "from-cyan-500/10 to-teal-500/10",
    },
    {
        id: "03",
        slug: "03-persistent-chat",
        title: "Persistent Chat",
        description:
            "Chat sessions with memory persistence across conversations and multiple skills.",
        complexity: 3,
        features: ["Session Persistence", "Multiple Skills", "Data Isolation", "Agent ID"],
        sourceFile: "04-chat-interactive-persistent.ts",
        icon: DatabaseIcon,
        gradient: "from-purple-500 to-pink-500",
        bgGradient: "from-purple-500/10 to-pink-500/10",
    },
    {
        id: "04",
        slug: "04-local-model",
        title: "Local Model",
        description:
            "Run AI agents with local models like Ollama or LM Studio for offline capability.",
        complexity: 3,
        features: ["Ollama Integration", "Offline AI", "Custom Models", "Model.Local()"],
        sourceFile: "04-chat-with-local-model.ts",
        icon: ServerIcon,
        gradient: "from-orange-500 to-red-500",
        bgGradient: "from-orange-500/10 to-red-500/10",
    },
    {
        id: "05",
        slug: "05-observability",
        title: "Observability",
        description:
            "OpenTelemetry integration for tracing, monitoring, and debugging AI applications.",
        complexity: 3,
        features: ["OpenTelemetry", "Tracing", "Metrics", "SRE.init()"],
        sourceFile: "02-opentelemetry-chat-interactive.ts",
        icon: ChartIcon,
        gradient: "from-green-500 to-emerald-500",
        bgGradient: "from-green-500/10 to-emerald-500/10",
    },
    {
        id: "06",
        slug: "06-planner-chat",
        title: "Planner Coder",
        description:
            "Advanced planner mode for multi-step task execution and code generation workflows.",
        complexity: 5,
        features: ["Planner Mode", "Code Generation", "Multi-step", "Task Board"],
        sourceFile: "04.1-chat-planner-coder.ts",
        icon: PlannerIcon,
        gradient: "from-violet-500 to-fuchsia-500",
        bgGradient: "from-violet-500/10 to-fuchsia-500/10",
    },
    {
        id: "07",
        slug: "07-image-analyzer",
        title: "Image Analyzer",
        description:
            "Vision model integration for analyzing and describing images using GPT-4o.",
        complexity: 2,
        features: ["Vision Model", "Image Upload", "Multimodal", "GPT-4o"],
        sourceFile: "06-handle-attachment-with-agent-llm.ts",
        icon: ImageIcon,
        gradient: "from-rose-500 to-amber-500",
        bgGradient: "from-rose-500/10 to-amber-500/10",
    },
    {
        id: "08",
        slug: "08-document-qa",
        title: "Document Q&A",
        description:
            "RAG-based document assistant with vector embeddings and semantic search.",
        complexity: 4,
        features: ["RAG", "VectorDB", "Embeddings", "Document Parsing"],
        sourceFile: "05-VectorDB-with-agent/01-upsert-and-search.ts",
        icon: DocumentIcon,
        gradient: "from-blue-500 to-cyan-500",
        bgGradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
        id: "09",
        slug: "09-github-assistant",
        title: "GitHub Assistant",
        description:
            "Multi-skill agent with GitHub API integration for repos, issues, PRs, and users.",
        complexity: 3,
        features: ["REST API", "Multiple Skills", "GitHub API", "Data Formatting"],
        sourceFile: "Custom implementation",
        icon: GitHubOctocatIcon,
        gradient: "from-gray-600 to-gray-800",
        bgGradient: "from-gray-600/10 to-gray-800/10",
    },
    {
        id: "10",
        slug: "10-multi-agent",
        title: "Multi-Agent Workflow",
        description:
            "Orchestrate multiple specialized agents (Researcher, Writer, Editor) working together.",
        complexity: 5,
        features: ["Multi-Agent", "Orchestration", "Sequential Workflow", "WebSearch"],
        sourceFile: "03-agent-workflow-components/",
        icon: WorkflowIcon,
        gradient: "from-purple-500 to-pink-500",
        bgGradient: "from-purple-500/10 to-pink-500/10",
    },
];

const ComplexityStars = ({ level }: { level: number }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
                key={i}
                className={`h-4 w-4 transition-all duration-300 ${i < level ? "text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]" : "text-gray-700"
                    }`}
            />
        ))}
    </div>
);

export default function PracticePage() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            {/* Background effects */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-full bg-[linear-gradient(to_right,rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
                <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
                <div className="absolute top-1/2 right-1/4 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
            </div>

            {/* Gradient top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

            {/* Header */}
            <header className="relative z-10 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
                <div className="mx-auto max-w-6xl px-6 py-8">
                    {/* Breadcrumb */}
                    <div className="mb-6 flex items-center gap-2 text-sm">
                        <Link
                            href="/"
                            className="flex items-center gap-1 text-gray-500 transition-colors hover:text-violet-400"
                        >
                            <HomeIcon className="h-4 w-4" />
                            <span>Home</span>
                        </Link>
                        <span className="text-gray-700">/</span>
                        <span className="text-gray-300">Practice Examples</span>
                    </div>

                    {/* Title section */}
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
                                    <BrainIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white md:text-4xl">
                                        Practice Examples
                                    </h1>
                                    <p className="text-gray-500">SmythOS SDK Learning Path</p>
                                </div>
                            </div>
                            <p className="max-w-2xl text-gray-400">
                                Interactive examples from{" "}
                                <code className="rounded-md bg-gray-800/80 px-2 py-1 text-sm text-violet-400">
                                    sre/examples
                                </code>{" "}
                                - progress from basic chat to advanced planner mode.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">10</div>
                                <div className="text-xs text-gray-500">Examples</div>
                            </div>
                            <div className="h-10 w-px bg-gray-800" />
                            <div className="text-center">
                                <div className="flex items-center gap-1 text-2xl font-bold text-emerald-400">
                                    <CheckIcon className="h-5 w-5" />10
                                </div>
                                <div className="text-xs text-gray-500">Completed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="relative z-10 px-6 py-12">
                <div className="mx-auto max-w-6xl">
                    {/* Examples Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {practiceExamples.map((example, index) => (
                            <Link
                                key={example.id}
                                href={`/practice/${example.slug}`}
                                className="group relative"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* Card */}
                                <div
                                    className={`relative h-full overflow-hidden rounded-2xl border transition-all duration-500 ${hoveredIndex === index
                                            ? "border-transparent bg-gray-900 shadow-2xl"
                                            : "border-gray-800/50 bg-gray-900/50"
                                        }`}
                                >
                                    {/* Gradient border on hover */}
                                    <div
                                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${example.gradient} opacity-0 transition-opacity duration-500 ${hoveredIndex === index ? "opacity-100" : ""
                                            }`}
                                        style={{ padding: "1px" }}
                                    >
                                        <div className="h-full w-full rounded-2xl bg-gray-900" />
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10 flex h-full flex-col p-6">
                                        {/* Header */}
                                        <div className="mb-4 flex items-start justify-between">
                                            <div
                                                className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${example.gradient} text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl`}
                                            >
                                                <example.icon className="h-7 w-7" />
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                                                    <CheckIcon className="h-3 w-3" />
                                                    <span>Done</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Title & ID */}
                                        <div className="mb-2">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`bg-gradient-to-r ${example.gradient} bg-clip-text text-sm font-bold text-transparent`}
                                                >
                                                    #{example.id}
                                                </span>
                                                <h2 className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-white">
                                                    {example.title}
                                                </h2>
                                            </div>
                                        </div>

                                        {/* Complexity */}
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Complexity:</span>
                                            <ComplexityStars level={example.complexity} />
                                        </div>

                                        {/* Description */}
                                        <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-400">
                                            {example.description}
                                        </p>

                                        {/* Features */}
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            {example.features.slice(0, 3).map((feature, i) => (
                                                <span
                                                    key={i}
                                                    className="rounded-full bg-gray-800/80 px-2.5 py-1 text-xs font-medium text-gray-300 transition-colors duration-300 group-hover:bg-gray-700/80"
                                                >
                                                    {feature}
                                                </span>
                                            ))}
                                            {example.features.length > 3 && (
                                                <span className="rounded-full bg-gray-800/80 px-2.5 py-1 text-xs font-medium text-gray-500">
                                                    +{example.features.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between border-t border-gray-800/50 pt-4">
                                            <code className="text-xs text-gray-600">{example.sourceFile}</code>
                                            <div className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors duration-300 group-hover:text-violet-400">
                                                <span>Try it</span>
                                                <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Background glow */}
                                    <div
                                        className={`absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${example.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Learning Path section */}
                    <div className="mt-16">
                        <div className="rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/80 to-gray-900/50 p-8 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
                                    <BrainIcon className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="mb-2 text-xl font-bold text-white">Recommended Learning Path</h3>
                                    <p className="text-gray-400">
                                        Start with Basic Chat to understand fundamentals, then progress through
                                        Streaming, Persistence, and finally master the Planner Coder for advanced
                                        workflows.
                                    </p>
                                </div>
                                <Link
                                    href="/practice/01-basic-chat"
                                    className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40"
                                >
                                    <span>Start Learning</span>
                                    <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Progress indicators */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        {practiceExamples.map((example, index) => (
                            <div
                                key={example.id}
                                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${index === 0
                                        ? `bg-gradient-to-r ${example.gradient} text-white shadow-lg`
                                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
                                    }`}
                            >
                                <span className="font-bold">{example.id}</span>
                                <span className="hidden sm:inline">{example.title}</span>
                                <CheckIcon className="h-4 w-4 text-emerald-400" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
