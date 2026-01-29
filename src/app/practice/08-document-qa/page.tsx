"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface UploadedDoc {
  name: string;
  chunks: number;
}

/**
 * Practice 08: Document Q&A (RAG)
 * Features:
 * - Document upload (PDF, TXT, MD)
 * - Vector embeddings
 * - Semantic search
 * - Context-aware answers
 */
export default function DocumentQAPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [sessionId] = useState(() => `doc-qa-${Date.now()}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamingContentRef = useRef("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (file: File) => {
    const validTypes = [".pdf", ".txt", ".md", ".markdown"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validTypes.includes(fileExt)) {
      alert("Please upload a PDF, TXT, or Markdown file");
      return;
    }

    setIsUploading(true);

    // Add system message
    setMessages((prev) => [
      ...prev,
      { role: "system", content: `Uploading ${file.name}...`, timestamp: new Date() },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", sessionId);

      const response = await fetch("/api/practice/08-document-qa?action=upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setDocuments((prev) => [...prev, { name: data.fileName, chunks: data.chunks }]);

      // Update system message
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === "system") {
          newMessages[newMessages.length - 1] = {
            ...lastMsg,
            content: `✓ Uploaded "${data.fileName}" (${data.chunks} chunks indexed)`,
          };
        }
        return newMessages;
      });
    } catch (error) {
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === "system") {
          newMessages[newMessages.length - 1] = {
            ...lastMsg,
            content: `✗ Failed to upload: ${error instanceof Error ? error.message : "Unknown error"}`,
          };
        }
        return newMessages;
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [sessionId]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const askQuestion = async () => {
    if (!input.trim() || isLoading) return;

    if (documents.length === 0) {
      alert("Please upload a document first");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    streamingContentRef.current = "";

    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
    ]);

    try {
      const formData = new FormData();
      formData.append("message", userMessage);
      formData.append("sessionId", sessionId);

      const response = await fetch("/api/practice/08-document-qa", {
        method: "POST",
        body: formData,
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
                  // Show searching indicator
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.role === "assistant" && !lastMsg.content) {
                      newMessages[newMessages.length - 1] = {
                        ...lastMsg,
                        content: "🔍 Searching documents...",
                      };
                    }
                    return newMessages;
                  });
                  break;

                case "tool_result":
                  // Clear searching indicator
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.content === "🔍 Searching documents...") {
                      newMessages[newMessages.length - 1] = { ...lastMsg, content: "" };
                    }
                    return newMessages;
                  });
                  streamingContentRef.current = "";
                  break;

                case "end":
                  setIsLoading(false);
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
      console.error("Question error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.isStreaming) {
          newMessages[newMessages.length - 1] = {
            ...lastMsg,
            content: `Error: ${error instanceof Error ? error.message : "Failed to get answer"}`,
            isStreaming: false,
          };
        }
        return newMessages;
      });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Sidebar - Documents */}
      <aside className="relative z-10 hidden w-80 flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl lg:flex">
        <div className="border-b border-slate-800 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              📚
            </span>
            Documents
          </h2>
          <p className="mt-1 text-sm text-slate-500">{documents.length} uploaded</p>
        </div>

        {/* Upload Zone */}
        <div className="p-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : "border-slate-700 hover:border-slate-600"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,.markdown"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            {isUploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
                <span className="text-sm text-blue-400">Processing...</span>
              </div>
            ) : (
              <>
                <div className="mb-2 text-2xl">📄</div>
                <p className="text-sm font-medium text-slate-300">Drop files here</p>
                <p className="text-xs text-slate-500">PDF, TXT, MD</p>
              </>
            )}
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4">
          {documents.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p className="text-sm">No documents yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3"
                >
                  <span className="text-lg">
                    {doc.name.endsWith(".pdf") ? "📕" : doc.name.endsWith(".md") ? "📝" : "📄"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.chunks} chunks</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="relative z-10 flex flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/practice"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 transition-all hover:border-slate-600 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Document Q&A</h1>
                <p className="text-sm text-slate-400">Practice 08 - RAG with VectorDB</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-blue-400">RAMVec + GPT-4o-mini</span>
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.length === 0 && (
              <div className="py-12 text-center">
                <div className="relative mb-6 inline-block">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur-2xl" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-slate-700 bg-slate-800 text-5xl shadow-2xl">
                    📚
                  </div>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">Document Q&A Assistant</h2>
                <p className="mb-6 text-slate-400">
                  Upload documents and ask questions about their content.
                </p>

                <div className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-300">How it works:</h3>
                  <ol className="space-y-2 text-left text-sm text-slate-400">
                    <li className="flex gap-2">
                      <span className="font-bold text-blue-400">1.</span>
                      Upload a document (PDF, TXT, or Markdown)
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-blue-400">2.</span>
                      Document is split into chunks and embedded
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-blue-400">3.</span>
                      Ask questions about the content
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-blue-400">4.</span>
                      AI finds relevant passages and answers
                    </li>
                  </ol>
                </div>

                {/* Mobile upload button */}
                <div className="mt-6 lg:hidden">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white"
                  >
                    Upload Document
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${
                  msg.role === "user" ? "flex-row-reverse" : msg.role === "system" ? "justify-center" : ""
                }`}
              >
                {msg.role === "system" ? (
                  <div className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-400">
                    {msg.content}
                  </div>
                ) : (
                  <>
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                          : "border border-slate-700 bg-slate-800"
                      }`}
                    >
                      {msg.role === "user" ? "👤" : "🤖"}
                    </div>
                    <div
                      className={`max-w-[80%] ${
                        msg.role === "user"
                          ? "rounded-2xl rounded-tr-none bg-gradient-to-br from-blue-500 to-cyan-500 px-4 py-3 text-white"
                          : "flex-1"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <div
                        className={`mt-2 text-xs ${
                          msg.role === "user" ? "text-white/60" : "text-slate-500"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString()}
                        {msg.isStreaming && (
                          <span className="ml-2 animate-pulse text-blue-400">Generating...</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-lg">
                  🤖
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 animate-ping rounded-full bg-blue-500" />
                  <span className="text-sm text-slate-400">Searching documents...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <footer className="border-t border-slate-800 bg-slate-900/80 p-4 backdrop-blur-xl">
          <div className="mx-auto max-w-3xl">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  documents.length === 0
                    ? "Upload a document first..."
                    : "Ask a question about your documents..."
                }
                disabled={isLoading || documents.length === 0}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={askQuestion}
                disabled={isLoading || !input.trim() || documents.length === 0}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:opacity-50"
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
                <span className="hidden sm:inline">Ask</span>
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">
              {documents.length === 0
                ? "Upload a document to start asking questions"
                : `${documents.length} document(s) indexed. Ask anything!`}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
