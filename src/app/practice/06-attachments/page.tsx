"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  attachments?: string[];
}

export default function AttachmentHandlingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `attachment-${Date.now()}`);
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; url: string; base64: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamingContentRef = useRef("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            url: URL.createObjectURL(file),
            base64: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Clear the input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;

    const userMessage = input.trim() || (selectedFiles.length > 0 ? "Describe this image" : "");
    const currentFiles = [...selectedFiles];

    setInput("");
    setSelectedFiles([]);
    setIsLoading(true);
    streamingContentRef.current = "";

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date(),
        attachments: currentFiles.map(f => f.url)
      }
    ]);

    // Add empty assistant message for streaming
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
    ]);

    try {
      const response = await fetch("/api/practice/06-attachments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          files: currentFiles.map(f => f.base64)
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

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

                case "end":
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg) {
                      return [
                        ...newMessages.slice(0, -1),
                        { ...lastMsg, content: streamingContentRef.current, isStreaming: false },
                      ];
                    }
                    return newMessages;
                  });
                  break;

                case "error":
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg) {
                      return [
                        ...newMessages.slice(0, -1),
                        { ...lastMsg, content: `Error: ${event.data}`, isStreaming: false },
                      ];
                    }
                    return newMessages;
                  });
                  break;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg) {
          return [
            ...newMessages.slice(0, -1),
            {
              ...lastMsg,
              content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
              isStreaming: false,
            },
          ];
        }
        return newMessages;
      });
    } finally {
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
    <div className="flex h-screen bg-indigo-950/10 text-gray-300 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-indigo-500/10 bg-indigo-950/20 flex flex-col shrink-0">
        <div className="p-6 border-b border-indigo-500/10">
          <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Practice 06</h2>
          <h1 className="text-xl font-bold text-white mt-1">Attachments</h1>
        </div>
        <div className="p-6 flex-1">
          <p className="text-xs text-indigo-300/60 leading-relaxed mb-6">
            This example demonstrates how to send images to a SmythOS agent for visual analysis.
          </p>
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Features</h3>
            <ul className="text-[11px] space-y-2 text-indigo-200/50">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                Image Upload
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                Base64 Conversion
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                Visual QA
              </li>
            </ul>
          </div>
        </div>
        <div className="p-6 mt-auto">
          <Link
            href="/practice"
            className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-[#0a0a0b]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 mb-6">
                  <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Visual Assistant</h2>
                <p className="text-gray-500 max-w-sm">
                  Upload an image and ask me anything about it. I can describe scenes, read text, or identify objects.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                    msg.role === "user" ? "bg-white/5 border-white/10" : "bg-indigo-500/10 border-indigo-500/20"
                  }`}>
                    {msg.role === "user" ? (
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21.48V22" />
                      </svg>
                    )}
                  </div>
                  <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`p-4 rounded-2xl text-[14px] leading-relaxed ${
                      msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white/[0.03] border border-white/5 text-gray-300 rounded-tl-none"
                    }`}>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {msg.attachments.map((url, i) => (
                            <img key={i} src={url} alt="Attachment" className="max-w-[200px] rounded-lg border border-white/10" />
                          ))}
                        </div>
                      )}
                      {msg.content || (msg.isStreaming && <span className="animate-pulse">Analyzing...</span>)}
                    </div>
                    <span className="text-[10px] text-gray-600 uppercase tracking-tighter">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="px-6 py-3 border-t border-white/5 bg-black/40 backdrop-blur-md flex gap-3 overflow-x-auto max-w-3xl mx-auto w-full rounded-t-xl">
            {selectedFiles.map((file, i) => (
              <div key={i} className="relative shrink-0 group">
                <img src={file.url} alt={file.name} className="w-16 h-16 object-cover rounded-lg border border-indigo-500/30" />
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Footer */}
        <footer className="p-6 bg-[#0a0a0b] border-t border-white/5">
          <div className="max-w-3xl mx-auto relative flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-12 w-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/[0.05] transition-all text-gray-500 hover:text-indigo-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              multiple
            />

            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedFiles.length > 0 ? "Describe these images..." : "Ask a question..."}
                className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all pr-12"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
                className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center disabled:opacity-30 transition-all"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
