"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface Task {
  summary: string;
  description: string;
  status: "planned" | "ongoing" | "completed" | "failed" | string;
  subtasks?: Record<string, Task>;
}

interface ToolLog {
  id: string;
  name: string;
  startTime: number;
  duration?: number;
  args?: any;
  status: "calling" | "completed";
}

export default function PlannerChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `planner-${Date.now()}`);
  const [currentTasks, setCurrentTasks] = useState<Record<string, Task>>({});
  const [status, setStatus] = useState<string>("");
  const [toolLogs, setToolLogs] = useState<ToolLog[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, toolLogs]);

  // Handle stream parsing with tag-based styling (mimicking TokenLoom)
  const renderContent = (text: string) => {
    if (!text) return null;

    // This is a simplified regex-based parser to mimic the TokenLoom behavior
    // It splits content by tags: <thinking>, <planning>, <code>, and code fences ```
    const parts = text.split(/(<thinking>|<\/thinking>|<planning>|<\/planning>|<code>|<\/code>|```[\s\S]*?```)/g);

    let currentTag: string | null = null;

    return parts.map((part, i) => {
      if (part === "<thinking>") { currentTag = "thinking"; return null; }
      if (part === "</thinking>") { currentTag = null; return null; }
      if (part === "<planning>") { currentTag = "planning"; return null; }
      if (part === "</planning>") { currentTag = null; return null; }
      if (part === "<code>") { currentTag = "code"; return null; }
      if (part === "</code>") { currentTag = null; return null; }

      if (part.startsWith("```")) {
        const lang = part.match(/```(\w+)/)?.[1] || "code";
        const code = part.replace(/```\w*\n?/, "").replace(/```$/, "");
        return (
          <div key={i} className="my-4 border border-white/10 rounded-lg overflow-hidden bg-[#050505]">
            <div className="bg-white/5 px-4 py-1.5 text-[10px] font-mono text-gray-500 flex justify-between uppercase tracking-widest">
              <span>{lang}</span>
              <span>Block</span>
            </div>
            <pre className="p-4 text-[13px] font-mono text-cyan-400 overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      if (currentTag === "thinking") return <span key={i} className="text-gray-500 italic">{part}</span>;
      if (currentTag === "planning") return <span key={i} className="text-emerald-500">{part}</span>;
      if (currentTag === "code") return <span key={i} className="text-cyan-400 font-mono">{part}</span>;

      return <span key={i}>{part}</span>;
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    streamingContentRef.current = "";
    setToolLogs([]);

    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
    ]);

    try {
      const response = await fetch("/api/practice/04-planner-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
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
                      return [
                        ...newMessages.slice(0, -1),
                        { ...lastMsg, content: streamingContentRef.current },
                      ];
                    }
                    return newMessages;
                  });
                  break;

                case "tasks":
                  setCurrentTasks(event.data);
                  break;

                case "status":
                  setStatus(event.data);
                  break;

                case "tool_call":
                  setToolLogs((prev) => [
                    ...prev,
                    {
                      id: event.data.id,
                      name: event.data.name,
                      args: event.data.arguments,
                      startTime: Date.now(),
                      status: "calling",
                    },
                  ]);
                  break;

                case "tool_result":
                  setToolLogs((prev) =>
                    prev.map((log) =>
                      log.id === event.data.id
                        ? { ...log, status: "completed", duration: Date.now() - log.startTime }
                        : log
                    )
                  );
                  break;

                case "end":
                  setIsLoading(false);
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg) {
                      return [
                        ...newMessages.slice(0, -1),
                        { ...lastMsg, isStreaming: false },
                      ];
                    }
                    return newMessages;
                  });
                  break;
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-gray-300 font-mono text-[13px] selection:bg-blue-500/30">
      {/* Sidebar - Task Panel (Mimicking Sticky Panel) */}
      <aside className="w-[350px] border-l border-white/5 bg-[#0d0d0f] flex flex-col order-2">
        <div className="p-4 border-b border-white/5">
          <div className="text-cyan-400 font-bold mb-1">┌─ 📋 Tasks ────────────────┐</div>
          <div className="text-cyan-400/50 text-[10px] uppercase tracking-widest">Smyth Code Assistant v1.0</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {Object.keys(currentTasks).length === 0 ? (
            <div className="opacity-20 text-center py-20">
              <div>│  (Empty Panel)       │</div>
              <div>└────────────────────────┘</div>
            </div>
          ) : (
            Object.entries(currentTasks).map(([id, task]) => (
              <TaskBox key={id} task={task} />
            ))
          )}
        </div>

        {/* Panel Footer / Stats */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="text-cyan-400 font-bold">├────────────────────────────┤</div>
          <div className="flex justify-around py-2">
            <span className="text-emerald-500">✅ {Object.values(currentTasks).filter(t => t.status === 'completed').length}</span>
            <span className="text-yellow-500">⏳ {Object.values(currentTasks).filter(t => t.status === 'ongoing').length}</span>
            <span className="text-blue-500">📝 {Object.values(currentTasks).filter(t => t.status === 'planned').length}</span>
          </div>
          <div className="text-cyan-400 font-bold">└────────────────────────────┘</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 order-1">
        {/* Header */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0b]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <span className="text-emerald-500 animate-pulse">🚀</span>
            <h1 className="text-emerald-500 font-bold uppercase tracking-tighter">Smyth Code Assistant</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm("Reset session? This will clear everything.")) {
                  setMessages([]);
                  setToolLogs([]);
                  setCurrentTasks({});
                  setStatus("");
                  setSessionId(`planner-${Date.now()}`);
                }
              }}
              className="text-gray-500 hover:text-red-400 transition-colors border border-white/10 px-2 py-1 rounded text-[10px] font-bold"
            >
              RESET SESSION
            </button>
             <Link href="/practice" className="text-gray-500 hover:text-white transition-colors border border-white/10 px-2 py-1 rounded text-[10px] font-bold">
              DASHBOARD
            </Link>
          </div>
        </header>

        {/* Scrollable Chat Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="space-y-2 mb-8">
                <div className="text-emerald-500">🚀 Smyth Code Assistant is ready!</div>
                <div className="text-yellow-500">Ask me about code, search for code, or get code.</div>
                <div className="text-gray-500">Type your query below to end the conversation.</div>
                <div className="text-gray-500">Tasks will appear in the panel on the right →</div>
              </div>
            )}

            <div className="space-y-8">
              {messages.map((msg, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0 font-bold">
                    {msg.role === "user" ? (
                      <span className="text-blue-500">You:</span>
                    ) : (
                      <span className="text-emerald-500">🤖 Assistant:</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="leading-relaxed">
                      {renderContent(msg.content)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Tool Logs (Mimicking terminal output) */}
              <div className="space-y-1">
                {toolLogs.map((log, idx) => (
                  <div key={idx} className="text-[11px] font-mono">
                    <div className="text-gray-500">
                      [Calling Tool] <span className="text-gray-300">{log.name}</span> {log.args && <span className="opacity-50 text-[9px]">{JSON.stringify(log.args)}</span>}
                    </div>
                    {log.status === "completed" && (
                      <div className="text-gray-500 pl-4">
                        <span className="text-gray-300">{log.name}</span> Took: <span className="text-blue-400">{log.duration}ms</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {status && (
                <div className="text-gray-500 italic">
                   {`>>> ${status}`}
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Footer Input */}
        <footer className="p-6 border-t border-white/5 bg-[#0a0a0b]">
          <div className="max-w-4xl mx-auto flex gap-4 items-center">
            <span className="text-blue-500 font-bold shrink-0">You:</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="..."
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-800"
              disabled={isLoading}
            />
            {isLoading && <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>}
          </div>
        </footer>
      </div>
    </div>
  );
}

function TaskBox({ task, depth = 0 }: { task: Task; depth?: number }) {
  const isCompleted = task.status === "completed" || task.status === "done";
  const isOngoing = task.status === "ongoing" || task.status === "in progress";

  const icon = isCompleted ? "✅" : isOngoing ? "⏳" : "📝";
  const statusColor = isCompleted ? "text-emerald-500" : isOngoing ? "text-yellow-500" : "text-blue-500";

  return (
    <div className={`space-y-1 ${depth > 0 ? "ml-4 border-l border-white/5 pl-2" : ""}`}>
      <div className="flex items-start gap-2">
        <span className="shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-bold uppercase text-[10px] ${statusColor}`}>
            {task.status.toUpperCase()}
          </div>
          <div className="text-white text-[11px] leading-tight mb-1">{task.summary}</div>
          <div className="text-gray-600 text-[10px] leading-tight italic">{task.description}</div>
        </div>
      </div>

      {task.subtasks && Object.entries(task.subtasks).map(([id, sub]) => (
        <TaskBox key={id} task={sub} depth={depth + 1} />
      ))}
    </div>
  );
}
