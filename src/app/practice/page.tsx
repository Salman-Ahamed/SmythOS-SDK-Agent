"use client";

import Link from "next/link";
import { FC, useState } from "react";

import {
    ArrowRightIcon,
    BrainIcon,
    CheckIcon,
    HomeIcon,
    SparklesIcon,
    StarIcon,
} from "@/components/icons";
import { sdkExamples } from "@/lib/db";

// Constants
const MAX_VISIBLE_FEATURES = 3;

// Types
type SdkExample = (typeof sdkExamples)[number];

// Complexity Stars Component with Accessibility
const ComplexityStars: FC<{ level: number }> = ({ level }) => (
    <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`Complexity: ${level} out of 5`}
    >
        {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
                key={i}
                className={`h-3.5 w-3.5 transition-all duration-300 ${i < level
                        ? "text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]"
                        : "text-gray-700/50"
                    }`}
            />
        ))}
    </div>
);

// Status Badge Component
const StatusBadge: FC<{ status: string; id: string }> = ({ status, id }) => {
    if (status === "completed") {
        return (
            <div
                className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20"
                role="status"
                aria-label={`Example ${id} completed`}
            >
                <CheckIcon className="h-3 w-3" />
                <span>Done</span>
            </div>
        );
    }
    return null;
};

// Practice Card Component
const PracticeCard: FC<{
    example: SdkExample;
    index: number;
    isHovered: boolean;
    onHover: (index: number | null) => void;
}> = ({ example, index, isHovered, onHover }) => (
    <Link
        href={`/practice/${example.slug}`}
        className="group relative block"
        onMouseEnter={() => onHover(index)}
        onMouseLeave={() => onHover(null)}
    >
        <article
            className={`relative h-full overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-500 ${isHovered
                    ? "scale-[1.02] border-white/10 bg-gray-900/90 shadow-2xl shadow-black/50"
                    : "border-gray-800/50 bg-gray-900/40 hover:bg-gray-900/60"
                }`}
            aria-labelledby={`example-${example.id}-title`}
        >
            {/* Animated gradient border */}
            <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${example.gradient} opacity-0 transition-all duration-500 ${isHovered ? "opacity-100" : ""
                    }`}
                style={{ padding: "1px" }}
            >
                <div className="h-full w-full rounded-2xl bg-gray-900" />
            </div>

            {/* Animated corner glow */}
            <div
                className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${example.gradient} opacity-0 blur-2xl transition-all duration-700 ${isHovered ? "opacity-40" : ""
                    }`}
            />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col p-6">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                    {/* Icon with animation */}
                    <div className="relative">
                        <div
                            className={`absolute inset-0 rounded-xl bg-gradient-to-br ${example.gradient} opacity-50 blur-lg transition-all duration-500 ${isHovered ? "opacity-80 blur-xl" : ""
                                }`}
                        />
                        <div
                            className={`relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${example.gradient} text-white shadow-lg transition-all duration-500 ${isHovered ? "scale-110 shadow-2xl" : ""
                                }`}
                        >
                            <example.icon className="h-7 w-7" />
                        </div>
                    </div>

                    {/* Status badge */}
                    <StatusBadge status={example.status} id={example.id} />
                </div>

                {/* Title & ID */}
                <div className="mb-3">
                    <div className="flex items-center gap-2">
                        <span
                            className={`bg-gradient-to-r ${example.gradient} bg-clip-text text-sm font-bold text-transparent`}
                        >
                            #{example.id}
                        </span>
                        <h2
                            id={`example-${example.id}-title`}
                            className="text-xl font-bold text-white"
                        >
                            {example.title}
                        </h2>
                    </div>
                </div>

                {/* Complexity */}
                <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Complexity</span>
                    <ComplexityStars level={example.complexity} />
                </div>

                {/* Description */}
                <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-400">
                    {example.description}
                </p>

                {/* Features */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {example.features.slice(0, MAX_VISIBLE_FEATURES).map((feature, i) => (
                        <span
                            key={i}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-300 ${isHovered
                                    ? "bg-white/10 text-white"
                                    : "bg-gray-800/60 text-gray-400"
                                }`}
                        >
                            {feature}
                        </span>
                    ))}
                    {example.features.length > MAX_VISIBLE_FEATURES && (
                        <span className="rounded-full bg-gray-800/40 px-2.5 py-1 text-xs font-medium text-gray-500">
                            +{example.features.length - MAX_VISIBLE_FEATURES}
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-gray-800/50 pt-4">
                    <code className="max-w-[60%] truncate text-xs text-gray-600">
                        {example.sourceFile}
                    </code>
                    <div
                        className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-300 ${isHovered ? "text-white" : "text-gray-500"
                            }`}
                    >
                        <span>Try it</span>
                        <ArrowRightIcon
                            className={`h-4 w-4 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""
                                }`}
                        />
                    </div>
                </div>
            </div>

            {/* Background glow */}
            <div
                className={`absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br ${example.gradient} opacity-0 blur-3xl transition-all duration-700 ${isHovered ? "opacity-20" : ""
                    }`}
            />
        </article>
    </Link>
);

// Progress Pill Component
const ProgressPill: FC<{
    example: SdkExample;
    isFirst: boolean;
}> = ({ example, isFirst }) => (
    <Link
        href={`/practice/${example.slug}`}
        className={`group flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-300 ${isFirst
                ? `bg-gradient-to-r ${example.gradient} text-white shadow-lg hover:shadow-xl`
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
            }`}
    >
        <span className="font-bold">{example.id}</span>
        <span className="hidden sm:inline">{example.title}</span>
        <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
    </Link>
);

// Main Page Component
export default function PracticePage() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const completedCount = sdkExamples.filter(
        (e) => e.status === "completed"
    ).length;

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            {/* Background effects */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

                {/* Floating orbs */}
                <div className="absolute -left-40 top-20 h-[500px] w-[500px] animate-pulse rounded-full bg-violet-500/10 blur-[100px]" />
                <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] animate-pulse rounded-full bg-fuchsia-500/10 blur-[100px]" />
                <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] animate-pulse rounded-full bg-cyan-500/5 blur-[100px]" />
            </div>

            {/* Gradient top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

            {/* Header */}
            <header className="relative z-10 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    {/* Breadcrumb */}
                    <nav className="mb-6" aria-label="Breadcrumb">
                        <ol className="flex items-center gap-2 text-sm">
                            <li>
                                <Link
                                    href="/"
                                    className="flex items-center gap-1.5 text-gray-500 transition-colors hover:text-violet-400"
                                >
                                    <HomeIcon className="h-4 w-4" />
                                    <span>Home</span>
                                </Link>
                            </li>
                            <li className="text-gray-700">/</li>
                            <li className="text-gray-300">Practice Examples</li>
                        </ol>
                    </nav>

                    {/* Title section */}
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex items-start gap-4">
                            {/* Animated icon */}
                            <div className="relative">
                                <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-xl" />
                                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-2xl shadow-violet-500/30">
                                    <BrainIcon className="h-8 w-8 text-white" />
                                </div>
                            </div>

                            <div>
                                <h1 className="mb-1 text-3xl font-bold text-white md:text-4xl">
                                    Practice Examples
                                </h1>
                                <p className="mb-2 text-gray-500">SmythOS SDK Learning Path</p>
                                <p className="max-w-xl text-sm text-gray-400">
                                    Interactive examples from{" "}
                                    <code className="rounded bg-gray-800/80 px-1.5 py-0.5 text-violet-400">
                                        sre/examples
                                    </code>{" "}
                                    — progress from basic chat to advanced multi-agent workflows.
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 rounded-2xl border border-gray-800/50 bg-gray-900/50 px-6 py-4 backdrop-blur-sm">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">
                                    {sdkExamples.length}
                                </div>
                                <div className="text-xs text-gray-500">Examples</div>
                            </div>
                            <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-3xl font-bold text-emerald-400">
                                    <CheckIcon className="h-6 w-6" />
                                    {completedCount}
                                </div>
                                <div className="text-xs text-gray-500">Completed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="relative z-10 px-6 py-12">
                <div className="mx-auto max-w-7xl">
                    {/* Examples Grid */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {sdkExamples.map((example, index) => (
                            <PracticeCard
                                key={example.id}
                                example={example}
                                index={index}
                                isHovered={hoveredIndex === index}
                                onHover={setHoveredIndex}
                            />
                        ))}
                    </div>

                    {/* Learning Path CTA */}
                    <section className="mt-16" aria-labelledby="learning-path-title">
                        <div className="relative overflow-hidden rounded-3xl border border-gray-800/50 bg-gradient-to-br from-gray-900/90 via-gray-900/70 to-gray-900/90 p-8 backdrop-blur-xl lg:p-10">
                            {/* Background decoration */}
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-3xl" />

                            <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
                                {/* Icon */}
                                <div className="relative shrink-0">
                                    <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-xl" />
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-2xl">
                                        <SparklesIcon className="h-10 w-10 text-white" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3
                                        id="learning-path-title"
                                        className="mb-3 text-2xl font-bold text-white"
                                    >
                                        Recommended Learning Path
                                    </h3>
                                    <p className="text-gray-400">
                                        Start with{" "}
                                        <span className="font-medium text-white">Basic Chat</span>{" "}
                                        to understand fundamentals, progress through{" "}
                                        <span className="font-medium text-white">Streaming</span>{" "}
                                        and{" "}
                                        <span className="font-medium text-white">Persistence</span>,
                                        then master{" "}
                                        <span className="font-medium text-white">
                                            Multi-Agent Workflows
                                        </span>{" "}
                                        for advanced orchestration.
                                    </p>
                                </div>

                                {/* CTA Button */}
                                <Link
                                    href="/practice/01-basic-chat"
                                    className="group relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <span>Start Learning</span>
                                        <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Progress indicators */}
                    <nav className="mt-10" aria-label="Example progress">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {sdkExamples.map((example, index) => (
                                <ProgressPill
                                    key={example.id}
                                    example={example}
                                    isFirst={index === 0}
                                />
                            ))}
                        </div>
                    </nav>
                </div>
            </main>
        </div>
    );
}
