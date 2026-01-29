"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  toolCalls?: string[];
}

/**
 * Practice 09: GitHub Assistant
 * Features:
 * - Multiple GitHub API skills
 * - Repository info, issues, PRs
 * - User profiles, search
 * - GitHub-themed UI
 */
export default function GitHubAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `github-${Date.now()}`);
  const [currentTools, setCurrentTools] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    streamingContentRef.current = "";
    setCurrentTools([]);

    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", timestamp: new Date(), isStreaming: true, toolCalls: [] },
    ]);

    try {
      const response = await fetch("/api/practice/09-github-assistant", {
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

                case "tool_call":
                  if (event.data?.name) {
                    setCurrentTools((prev) => [...prev, event.data.name]);
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastMsg = newMessages[newMessages.length - 1];
                      if (lastMsg && lastMsg.role === "assistant") {
                        newMessages[newMessages.length - 1] = {
                          ...lastMsg,
                          toolCalls: [...(lastMsg.toolCalls || []), event.data.name],
                        };
                      }
                      return newMessages;
                    });
                  }
                  break;

                case "end":
                  setIsLoading(false);
                  setCurrentTools([]);
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
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error("GitHub Assistant error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.isStreaming) {
          newMessages[newMessages.length - 1] = {
            ...lastMsg,
            content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
            isStreaming: false,
          };
        }
        return newMessages;
      });
      setIsLoading(false);
      setCurrentTools([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: "facebook/react", query: "Tell me about facebook/react repository" },
    { label: "vercel/next.js", query: "What are the latest issues in vercel/next.js?" },
    { label: "microsoft/vscode", query: "Show me the PRs in microsoft/vscode" },
    { label: "torvalds", query: "Tell me about the user torvalds" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-[#238636]/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-[#1f6feb]/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#30363d] bg-[#161b22] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/practice"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#30363d] bg-[#21262d] text-[#8b949e] transition-all hover:border-[#8b949e] hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#21262d] border border-[#30363d]">
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">GitHub Assistant</h1>
              <p className="text-sm text-[#8b949e]">Practice 09 - REST API Skills</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-[#238636]/20 px-3 py-1.5 border border-[#238636]/30">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#238636]" />
              <span className="text-xs font-medium text-[#3fb950]">6 Skills Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6">
          {/* Messages Area */}
          <div className="flex-1 space-y-6 overflow-y-auto pb-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-[#238636] opacity-20 blur-2xl" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#30363d] bg-[#161b22]">
                    <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">GitHub Assistant</h2>
                <p className="mb-6 max-w-md text-[#8b949e]">
                  Ask me about any GitHub repository, user, or search for projects!
                </p>

                {/* Skills Grid */}
                <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { icon: "📦", name: "Repo Info" },
                    { icon: "🐛", name: "Issues" },
                    { icon: "🔀", name: "Pull Requests" },
                    { icon: "👤", name: "User Profile" },
                    { icon: "🔍", name: "Search Repos" },
                    { icon: "📄", name: "File Contents" },
                  ].map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-2"
                    >
                      <span>{skill.icon}</span>
                      <span className="text-sm text-[#8b949e]">{skill.name}</span>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap justify-center gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => setInput(action.query)}
                      className="rounded-full border border-[#30363d] bg-[#21262d] px-4 py-2 text-sm text-[#8b949e] transition-all hover:border-[#8b949e] hover:text-white"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    msg.role === "user"
                      ? "bg-[#1f6feb]"
                      : "border border-[#30363d] bg-[#21262d]"
                  }`}
                >
                  {msg.role === "user" ? (
                    "👤"
                  ) : (
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                  )}
                </div>
                <div
                  className={`max-w-[80%] ${
                    msg.role === "user"
                      ? "rounded-2xl rounded-tr-none bg-[#1f6feb] px-4 py-3 text-white"
                      : "flex-1"
                  }`}
                >
                  {/* Tool calls indicator */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && msg.role === "assistant" && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {msg.toolCalls.map((tool, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full bg-[#238636]/20 px-2 py-0.5 text-xs text-[#3fb950]"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed text-[#c9d1d9]">{msg.content}</p>
                  </div>
                  <div
                    className={`mt-2 text-xs ${
                      msg.role === "user" ? "text-white/60" : "text-[#8b949e]"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString()}
                    {msg.isStreaming && (
                      <span className="ml-2 animate-pulse text-[#1f6feb]">Generating...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading with tool calls */}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#30363d] bg-[#21262d]">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  {currentTools.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {currentTools.map((tool, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full bg-[#1f6feb]/20 px-2 py-0.5 text-xs text-[#58a6ff]"
                        >
                          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#58a6ff]" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 animate-ping rounded-full bg-[#238636]" />
                    <span className="text-sm text-[#8b949e]">
                      {currentTools.length > 0 ? "Fetching from GitHub..." : "Thinking..."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-[#30363d] pt-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about any GitHub repo, user, or search..."
                disabled={isLoading}
                className="flex-1 rounded-lg border border-[#30363d] bg-[#0d1117] px-4 py-3 text-white placeholder-[#8b949e] focus:border-[#1f6feb] focus:outline-none focus:ring-1 focus:ring-[#1f6feb] disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="flex items-center gap-2 rounded-lg bg-[#238636] px-6 py-3 font-semibold text-white transition-all hover:bg-[#2ea043] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-[#8b949e]">
              Try: &quot;Tell me about facebook/react&quot; or &quot;Search for machine learning repos&quot;
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
