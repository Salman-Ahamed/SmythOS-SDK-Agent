import Link from "next/link";

interface PracticeExample {
  id: string;
  title: string;
  description: string;
  complexity: number;
  features: string[];
  sourceFile: string;
  href: string;
}

const practiceExamples: PracticeExample[] = [
  {
    id: "01",
    title: "Basic Chat",
    description:
      "Simple synchronous chat with agent memory. The simplest example to start learning.",
    complexity: 1,
    features: ["Basic chat", "Agent skill", "Session memory"],
    sourceFile: "03-chat.ts",
    href: "/practice/01-basic-chat",
  },
  {
    id: "02",
    title: "Chat with Streaming",
    description: "Real-time streaming responses with event handlers.",
    complexity: 2,
    features: ["Streaming", "Event handlers", "Real-time display"],
    sourceFile: "03.1-chat-streaming.ts",
    href: "/practice/02-streaming-chat",
  },
  {
    id: "03",
    title: "Interactive Persistent Chat",
    description: "Interactive chat with persistence across sessions.",
    complexity: 3,
    features: ["Interactive", "Persistent", "Multiple skills"],
    sourceFile: "04-chat-interactive-persistent.ts",
    href: "/practice/03-persistent-chat",
  },
  {
    id: "04",
    title: "Local Model Chat",
    description: "Chat using a local model (Ollama or LM Studio).",
    complexity: 3,
    features: ["Local Model", "Ollama", "Offline capable"],
    sourceFile: "04-chat-with-local-model.ts",
    href: "/practice/04-local-model",
  },
];

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-white">SmythOS SDK Practice</h1>
          <p className="mt-2 text-gray-400">
            Practice examples based on{" "}
            <code className="rounded bg-gray-800 px-2 py-1">sre/examples</code>
          </p>
        </div>
      </header>

      {/* Examples Grid */}
      <main className="p-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6">
            {practiceExamples.map((example) => (
              <Link
                key={example.id}
                href={example.href}
                className="group block rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:border-indigo-500 hover:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold">
                        {example.id}
                      </span>
                      <h2 className="text-xl font-semibold text-white group-hover:text-indigo-400">
                        {example.title}
                      </h2>
                    </div>
                    <p className="mt-2 text-gray-400">{example.description}</p>

                    {/* Features */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {example.features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Complexity */}
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Complexity</p>
                    <div className="mt-1 flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${star <= example.complexity ? "text-yellow-500" : "text-gray-700"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 font-mono text-xs text-gray-600">{example.sourceFile}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Coming Soon */}
          <div className="mt-8 rounded-xl border border-dashed border-gray-700 p-6 text-center">
            <p className="text-gray-500">More practice examples coming soon...</p>
            <p className="mt-1 text-sm text-gray-600">
              Local Models, Observability, Planner Mode, and more!
                      </p>

                      <a href="">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Delectus vitae ratione sint magnam. Quis voluptas dolorem quas minima sit quisquam vitae fugiat, in omnis, dolor fuga ratione nostrum, perferendis iusto.</a>
          </div>
        </div>
      </main>
    </div>
  );
}
