"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  isStreaming?: boolean;
}

/**
 * Practice 07: Image Analyzer
 * Features:
 * - Drag & drop image upload
 * - URL input for remote images
 * - Vision model analysis
 * - Streaming responses
 */
export default function ImageAnalyzerPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sessionId] = useState(() => `image-${Date.now()}`);
  const [inputMode, setInputMode] = useState<"file" | "url">("file");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamingContentRef = useRef("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setImageFile(file);
    setImageUrl("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setImageFile(null);
    setImagePreview(url || null);
  };

  const clearImage = () => {
    setImageFile(null);
    setImageUrl("");
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeImage = async () => {
    if (!imageFile && !imageUrl) {
      alert("Please upload an image or provide a URL");
      return;
    }

    setIsLoading(true);
    streamingContentRef.current = "";

    const userMessage = input.trim() || "Analyze this image";

    // Add user message with image
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date(),
        imageUrl: imagePreview || undefined,
      },
    ]);

    // Add empty assistant message for streaming
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
    ]);

    setInput("");

    try {
      const formData = new FormData();
      formData.append("message", userMessage);
      formData.append("sessionId", sessionId);

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      const response = await fetch("/api/practice/07-image-analyzer", {
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

                case "end":
                  setIsLoading(false);
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg) lastMsg.isStreaming = false;
                    return newMessages;
                  });
                  // Clear image after successful analysis
                  clearImage();
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
      console.error("Analysis error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.isStreaming) {
          newMessages[newMessages.length - 1] = {
            ...lastMsg,
            content: `Error: ${error instanceof Error ? error.message : "Failed to analyze image"}`,
            isStreaming: false,
          };
        }
        return newMessages;
      });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && (imageFile || imageUrl)) {
      e.preventDefault();
      analyzeImage();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-slate-900/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/practice"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 transition-all hover:border-slate-600 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 shadow-lg shadow-rose-500/25">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Image Analyzer</h1>
              <p className="text-sm text-slate-400">Practice 07 - Vision Model</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-400">GPT-4o Vision</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
          {/* Messages Area */}
          <div className="flex-1 space-y-6 overflow-y-auto pb-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-rose-500 to-amber-500 opacity-20 blur-2xl" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-slate-700 bg-slate-800 text-5xl shadow-2xl">
                    🖼️
                  </div>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">Image Analyzer</h2>
                <p className="mb-6 max-w-md text-slate-400">
                  Upload an image or paste a URL, and I&apos;ll analyze it using GPT-4 Vision.
                </p>

                {/* Sample Images */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/VanGogh-starry_night_ballance1.jpg/960px-VanGogh-starry_night_ballance1.jpg",
                      label: "Starry Night",
                    },
                    {
                      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
                      label: "Mona Lisa",
                    },
                    {
                      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Ocelot_%28Leopardus_pardalis%29-8.jpg/1200px-Ocelot_%28Leopardus_pardalis%29-8.jpg",
                      label: "Wildlife",
                    },
                    {
                      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
                      label: "Test Image",
                    },
                  ].map((sample) => (
                    <button
                      key={sample.label}
                      onClick={() => {
                        setInputMode("url");
                        handleUrlChange(sample.url);
                      }}
                      className="group overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-2 transition-all hover:border-rose-500/50 hover:bg-slate-800"
                    >
                      <div className="mb-2 h-16 overflow-hidden rounded-lg bg-slate-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sample.url}
                          alt={sample.label}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <span className="text-xs text-slate-400 group-hover:text-white">{sample.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-rose-500 to-amber-500"
                      : "border border-slate-700 bg-slate-800"
                  }`}
                >
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>
                <div
                  className={`max-w-[80%] ${
                    msg.role === "user"
                      ? "rounded-2xl rounded-tr-none bg-gradient-to-br from-rose-500 to-amber-500 px-4 py-3 text-white"
                      : "flex-1"
                  }`}
                >
                  {/* Image preview for user messages */}
                  {msg.imageUrl && msg.role === "user" && (
                    <div className="mb-2 overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={msg.imageUrl} alt="Uploaded" className="max-h-48 rounded-lg object-contain" />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <div
                    className={`mt-2 flex items-center gap-2 text-xs ${
                      msg.role === "user" ? "text-white/60" : "text-slate-500"
                    }`}
                  >
                    <span>{msg.timestamp.toLocaleTimeString()}</span>
                    {msg.isStreaming && <span className="animate-pulse text-rose-400">Analyzing...</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-lg">
                  🤖
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 animate-ping rounded-full bg-rose-500" />
                  <span className="text-sm text-slate-400">Analyzing image...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Upload Area */}
          <div className="border-t border-slate-800 pt-4">
            {/* Input Mode Toggle */}
            <div className="mb-4 flex justify-center gap-2">
              <button
                onClick={() => setInputMode("file")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  inputMode === "file"
                    ? "bg-rose-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setInputMode("url")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  inputMode === "url"
                    ? "bg-rose-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Paste URL
              </button>
            </div>

            {/* File Upload */}
            {inputMode === "file" && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`mb-4 cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                  isDragging
                    ? "border-rose-500 bg-rose-500/10"
                    : imagePreview
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="flex items-center justify-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg object-contain" />
                    <div className="text-left">
                      <p className="font-medium text-emerald-400">Image ready!</p>
                      <p className="text-sm text-slate-400">{imageFile?.name || "URL image"}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                        className="mt-2 text-sm text-rose-400 hover:text-rose-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-2 text-4xl">📁</div>
                    <p className="font-medium text-white">Drag & drop an image here</p>
                    <p className="text-sm text-slate-400">or click to browse</p>
                  </div>
                )}
              </div>
            )}

            {/* URL Input */}
            {inputMode === "url" && (
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="Paste image URL here..."
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                  />
                  {imageUrl && (
                    <button
                      onClick={clearImage}
                      className="rounded-xl bg-slate-800 px-4 text-slate-400 hover:text-rose-400"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {imagePreview && inputMode === "url" && (
                  <div className="mt-3 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg object-contain" />
                  </div>
                )}
              </div>
            )}

            {/* Message Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={imagePreview ? "Ask about this image... (optional)" : "Upload an image first"}
                disabled={isLoading || !imagePreview}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={analyzeImage}
                disabled={isLoading || (!imageFile && !imageUrl)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:shadow-rose-500/40 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Analyzing</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-slate-500">
              Supports JPG, PNG, GIF, WebP. Max file size depends on your API limits.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
