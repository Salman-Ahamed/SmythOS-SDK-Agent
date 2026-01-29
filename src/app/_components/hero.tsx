"use client";

import Link from "next/link";

import { ArrowRightIcon, BrainIcon, GitHubIcon, PlayIcon, StarIcon } from "@/components/icons";
import { sdkExamples, techStack } from "@/lib/db";

export const HeroSection = () => {
  const completedExamples = sdkExamples.filter((e) => e.status === "completed").length;
  const totalExamples = sdkExamples.length;

  return (
    <section className="relative z-10 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Badge */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-400">
              {completedExamples}/{totalExamples} Examples Completed
            </span>
          </div>
          <div className="hidden items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2 backdrop-blur-sm sm:flex">
            <StarIcon className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Production Ready</span>
          </div>
        </div>

        {/* Main heading */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 bg-clip-text text-transparent">
              Master AI Agents with
            </span>
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                SmythOS SDK
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 10C50 4 150 2 298 10"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#D946EF" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl">
            Interactive examples to learn building intelligent AI agents. From basic chat to
            advanced planner mode with real-time streaming, persistence, and observability.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/practice"
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40 sm:w-auto"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <PlayIcon className="relative h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="relative">Start Learning</span>
              <ArrowRightIcon className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="https://github.com/smythos/sre"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900/50 px-8 py-4 font-semibold text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-600 hover:bg-gray-800/50 hover:text-white sm:w-auto"
            >
              <GitHubIcon className="h-5 w-5" />
              <span>View on GitHub</span>
            </Link>
          </div>
        </div>

        {/* Code preview */}
        <div className="mx-auto mt-16 max-w-3xl">
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-gray-900/80 shadow-2xl shadow-violet-500/10 backdrop-blur-xl transition-all duration-500 hover:border-violet-500/30 hover:shadow-violet-500/20">
            {/* Terminal header */}
            <div className="flex items-center justify-between border-b border-gray-800/50 bg-gray-950/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <BrainIcon className="h-4 w-4" />
                <span>agent.ts</span>
              </div>
            </div>

            {/* Code content */}
            <div className="p-6 font-mono text-sm leading-relaxed">
              <div className="space-y-2">
                <div>
                  <span className="text-purple-400">import</span>
                  <span className="text-gray-300"> {"{ "}</span>
                  <span className="text-cyan-400">Agent</span>
                  <span className="text-gray-300">{" }"} </span>
                  <span className="text-purple-400">from</span>
                  <span className="text-amber-400"> &apos;@smythos/sdk&apos;</span>
                  <span className="text-gray-500">;</span>
                </div>
                <div className="h-2" />
                <div>
                  <span className="text-purple-400">const</span>
                  <span className="text-cyan-400"> agent</span>
                  <span className="text-gray-300"> = </span>
                  <span className="text-purple-400">new</span>
                  <span className="text-yellow-400"> Agent</span>
                  <span className="text-gray-300">({"{"}</span>
                </div>
                <div className="pl-4">
                  <span className="text-gray-300">name: </span>
                  <span className="text-amber-400">&apos;AI Assistant&apos;</span>
                  <span className="text-gray-500">,</span>
                </div>
                <div className="pl-4">
                  <span className="text-gray-300">model: </span>
                  <span className="text-amber-400">&apos;gpt-4o&apos;</span>
                  <span className="text-gray-500">,</span>
                </div>
                <div className="pl-4">
                  <span className="text-gray-300">behavior: </span>
                  <span className="text-amber-400">&apos;Helpful AI assistant&apos;</span>
                </div>
                <div>
                  <span className="text-gray-300">{"})"}</span>
                  <span className="text-gray-500">;</span>
                </div>
                <div className="h-2" />
                <div>
                  <span className="text-purple-400">const</span>
                  <span className="text-cyan-400"> response</span>
                  <span className="text-gray-300"> = </span>
                  <span className="text-purple-400">await</span>
                  <span className="text-gray-300"> agent.</span>
                  <span className="text-yellow-400">chat</span>
                  <span className="text-gray-300">().</span>
                  <span className="text-yellow-400">prompt</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-amber-400">&apos;Hello!&apos;</span>
                  <span className="text-gray-300">)</span>
                  <span className="text-gray-500">;</span>
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>
        </div>

        {/* Tech stack */}
        <div className="mt-16 text-center">
          <p className="mb-6 text-sm font-medium uppercase tracking-wider text-gray-500">
            Built with modern technologies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="group flex items-center gap-2 text-gray-500 transition-all duration-300 hover:text-gray-300"
              >
                <tech.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-sm font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
