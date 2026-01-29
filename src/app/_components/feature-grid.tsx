"use client";

import { FC, useState } from "react";

import { features } from "@/lib/db";

import { GlowCard } from "./glow-card";

export const FeatureGrid: FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative z-10 border-y border-gray-800/50 bg-gradient-to-b from-gray-950 via-gray-900/50 to-gray-950 py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 -translate-y-1/2 rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 translate-y-1/2 rounded-full bg-fuchsia-500/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-6">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2">
            <span className="text-sm font-medium text-cyan-400">SDK Capabilities</span>
          </div>
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Everything You Need to Build{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI Agents
            </span>
          </h2>
          <p className="text-lg text-gray-400">
            The SmythOS SDK provides a comprehensive set of tools for building intelligent,
            production-ready AI applications.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <GlowCard
              key={index}
              className="group h-full"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative h-full p-6">
                {/* Icon */}
                <div
                  className={`mb-5 inline-flex rounded-xl bg-gradient-to-br p-3 transition-all duration-500 ${
                    hoveredIndex === index
                      ? "from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
                      : "from-gray-800 to-gray-800 text-violet-400"
                  }`}
                >
                  <feature.icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                </div>

                {/* Title */}
                <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>

                {/* Description */}
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                {/* Decorative line */}
                <div
                  className={`absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ${
                    hoveredIndex === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
};
