"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function MCPIntegrationPage() {
  const [status, setStatus] = useState<"running" | "stopped">("stopped");
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/practice/05-mcp");
      const data = await response.json();
      setStatus(data.status);
      setUrl(data.url);
    } catch (err) {
      console.error("Failed to fetch status:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAction = async (action: "start" | "stop") => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/practice/05-mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to perform action");

      if (action === "start") {
        setStatus("running");
        setUrl(data.url);
      } else {
        setStatus("stopped");
        setUrl(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-300 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <div className={`w-3 h-3 rounded-full ${status === "running" ? "bg-emerald-500 animate-pulse" : "bg-gray-700"}`}></div>
            <h1 className="text-3xl font-bold text-white tracking-tight">MCP Integration</h1>
          </div>
          <p className="text-gray-500 max-w-2xl">
            Practice 05: Exposing a SmythOS Agent as a Model Context Protocol (MCP) server using SSE transport.
            This allows other MCP-compatible clients to discover and use the agent's skills.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Server Control Card */}
          <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Server Control</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-sm text-gray-400">Status</span>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                    status === "running" ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-500"
                  }`}>
                    {status}
                  </span>
                </div>
                {url && (
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                    <span className="text-xs text-gray-500 block mb-1">MCP SSE URL</span>
                    <code className="text-[11px] text-emerald-400 break-all">{url}</code>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {status === "stopped" ? (
                <button
                  onClick={() => handleAction("start")}
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {isLoading ? "Starting Server..." : "Start MCP Server"}
                </button>
              ) : (
                <button
                  onClick={() => handleAction("stop")}
                  disabled={isLoading}
                  className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {isLoading ? "Stopping..." : "Stop MCP Server"}
                </button>
              )}
              {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            </div>
          </div>

          {/* Agent Information Card */}
          <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-white mb-4">Agent Configuration</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Agent Name</h3>
                <p className="text-sm text-gray-300">CryptoMarket Assistant</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Exposed Skills</h3>
                <div className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Price</p>
                    <p className="text-xs text-gray-500">Get current cryptocurrency price via CoinGecko API.</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/10">coin_id: string</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Implementation Note</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  The agent uses <code>agent.mcp(MCPTransport.SSE, 3399)</code> which starts an Express server internal to the process.
                  In a production environment, you would typically run this as a standalone microservice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Console / Logs area */}
        <div className="bg-[#050505] border border-white/5 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
          <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/20"></div>
              </div>
              <span className="text-[10px] font-mono text-gray-500 ml-4 uppercase tracking-widest">MCP Server Console</span>
            </div>
          </div>
          <div className="p-6 font-mono text-xs leading-relaxed space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
            {status === "running" ? (
              <>
                <p className="text-emerald-500/80">[INFO] Initializing CryptoMarket Assistant Agent...</p>
                <p className="text-emerald-500/80">[INFO] Registered skill: Price (coin_id: string)</p>
                <p className="text-emerald-500/80">[INFO] Starting MCP Server with SSE transport on port 3399...</p>
                <p className="text-emerald-500">[SUCCESS] MCP server listening at http://localhost:3399/mcp</p>
                <p className="text-gray-500">[WAIT] Awaiting client connection...</p>
              </>
            ) : (
              <p className="text-gray-600 italic">No logs available. Start the server to see activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
