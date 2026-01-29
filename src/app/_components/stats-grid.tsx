"use client";

import { useEffect, useState } from "react";

import { BrainIcon, CheckIcon, CodeIcon, ZapIcon } from "@/components/icons";

const stats = [
  {
    value: 6,
    label: "Practice Examples",
    suffix: "",
    icon: <CodeIcon className="h-6 w-6" />,
    color: "from-violet-500 to-purple-500",
  },
  {
    value: 15,
    label: "SDK Features",
    suffix: "+",
    icon: <BrainIcon className="h-6 w-6" />,
    color: "from-cyan-500 to-blue-500",
  },
  {
    value: 100,
    label: "Type Safe",
    suffix: "%",
    icon: <CheckIcon className="h-6 w-6" />,
    color: "from-emerald-500 to-green-500",
  },
  {
    value: 10,
    label: "Faster with SDK",
    suffix: "x",
    icon: <ZapIcon className="h-6 w-6" />,
    color: "from-amber-500 to-orange-500",
  },
];

export const StatsGrid = () => {
  const [counters, setCounters] = useState(stats.map(() => 0));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCounters((prev) =>
        prev.map((count, index) => {
          const target = stats[index].value;
          if (count >= target) return target;
          const increment = Math.ceil(target / 50);
          return Math.min(count + increment, target);
        })
      );
    }, 30);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section className="relative z-10 py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-gray-900/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-gray-700/50 hover:bg-gray-900/80"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.5s ease ${index * 0.1}s`,
              }}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity duration-500 group-hover:opacity-5`}
              />

              {/* Icon */}
              <div
                className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${stat.color} p-3 text-white shadow-lg`}
              >
                {stat.icon}
              </div>

              {/* Counter */}
              <div className="mb-1 text-3xl font-bold text-white md:text-4xl">
                {counters[index]}
                <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.suffix}
                </span>
              </div>

              {/* Label */}
              <p className="text-sm text-gray-400 md:text-base">{stat.label}</p>

              {/* Hover glow */}
              <div
                className={`absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br ${stat.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
