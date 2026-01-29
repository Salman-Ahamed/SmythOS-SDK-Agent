"use client";

import Link from "next/link";

import { ArrowRightIcon, BrainIcon, GitHubIcon, RocketIcon } from "@/components/icons";

export const CTASection = () => (
  <section className="relative z-10 overflow-hidden py-20 md:py-32">
    {/* Background */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-violet-950/20 to-gray-950" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 blur-3xl" />
    </div>

    <div className="container relative mx-auto px-6">
      <div className="mx-auto max-w-4xl">
        {/* Main CTA card */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-800/50 bg-gray-900/80 p-8 backdrop-blur-xl md:p-12">
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/20 via-transparent to-fuchsia-500/20" />

          <div className="relative z-10">
            {/* Icon */}
            <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-4 shadow-lg shadow-violet-500/25">
              <BrainIcon className="h-8 w-8 text-white" />
            </div>

            {/* Heading */}
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              Ready to Build{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Intelligent AI Agents?
              </span>
            </h2>

            {/* Description */}
            <p className="mb-8 max-w-2xl text-lg text-gray-400">
              Start with our practice examples and learn how to create production-ready AI agents
              using the SmythOS SDK. From basic chat to advanced multi-step workflows.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/practice"
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <RocketIcon className="relative h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                <span className="relative">Start Practicing</span>
                <ArrowRightIcon className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="https://docs.smythos.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800/50 px-8 py-4 font-semibold text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-600 hover:bg-gray-700/50 hover:text-white"
              >
                <span>Read Documentation</span>
                <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* GitHub link */}
            <div className="mt-8 flex items-center gap-4 border-t border-gray-800/50 pt-8">
              <Link
                href="https://github.com/smythos/sre"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-gray-400 transition-colors duration-300 hover:text-white"
              >
                <GitHubIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Star us on GitHub</span>
              </Link>
              <span className="text-gray-700">•</span>
              <span className="text-sm text-gray-500">Open Source & MIT Licensed</span>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
        </div>
      </div>
    </div>
  </section>
);
