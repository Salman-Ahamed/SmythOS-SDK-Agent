"use client";

import Link from "next/link";
import { FC, useState } from "react";

import { ArrowRightIcon, CheckIcon, StarIcon } from "@/components/icons";
import { sdkExamples } from "@/lib/db";

const ComplexityStars: FC<{ level: number }> = ({ level }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <StarIcon
        key={i}
        className={`h-3.5 w-3.5 ${
          i < level ? "text-amber-400" : "text-gray-700"
        } transition-colors duration-300`}
      />
    ))}
  </div>
);

export const ExamplesShowcase = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative z-10 py-20 md:py-32">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2">
            <span className="text-sm font-medium text-violet-400">Practice Examples</span>
          </div>
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Learn by Building{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Real Examples
            </span>
          </h2>
          <p className="text-lg text-gray-400">
            Progress from simple chat to advanced planner mode. Each example builds on the previous
            one, teaching you new SDK features step by step.
          </p>
        </div>

        {/* Examples grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sdkExamples.map((example, index) => (
            <Link
              key={example.id}
              href={`/practice/${example.slug}`}
              className="group relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Card */}
              <div
                className={`relative h-full overflow-hidden rounded-2xl border transition-all duration-500 ${
                  hoveredIndex === index
                    ? "border-transparent bg-gray-900"
                    : "border-gray-800/50 bg-gray-900/50"
                }`}
              >
                {/* Gradient border on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${example.gradient} opacity-0 transition-opacity duration-500 ${
                    hoveredIndex === index ? "opacity-100" : ""
                  }`}
                  style={{ padding: "1px" }}
                >
                  <div className="h-full w-full rounded-2xl bg-gray-900" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${example.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    >
                      <example.icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      {example.status === "completed" && (
                        <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                          <CheckIcon className="h-3.5 w-3.5" />
                          Done
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Example number and title */}
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`text-sm font-bold bg-gradient-to-r ${example.gradient} bg-clip-text text-transparent`}
                    >
                      #{example.id}
                    </span>
                    <h3 className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-white">
                      {example.title}
                    </h3>
                  </div>

                  {/* Complexity */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Complexity:</span>
                    <ComplexityStars level={example.complexity} />
                  </div>

                  {/* Description */}
                  <p className="mb-4 text-sm leading-relaxed text-gray-400">
                    {example.description}
                  </p>

                  {/* Features */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {example.features.map((feature, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-gray-800/80 px-3 py-1 text-xs font-medium text-gray-300"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors duration-300 group-hover:text-white">
                    <span>Try Example</span>
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
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

        {/* View all link */}
        <div className="mt-12 text-center">
          <Link
            href="/practice"
            className="group inline-flex items-center gap-2 text-lg font-medium text-violet-400 transition-colors duration-300 hover:text-violet-300"
          >
            <span>View All Examples</span>
            <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};
