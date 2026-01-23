import { Agent, Component, Model, TAgentMode, TLLMEvent } from "@smythos/sdk";
import { NextRequest } from "next/server";

/**
 * Practice 06: Planner Coder API Route
 * Based on sre/examples/01-agent-code-skill/04.1-chat-planner-coder.ts
 * 
 * Features:
 * - Planner Mode (TAgentMode.PLANNER)
 * - Automatic task decomposition and execution
 * - Web Search (Tavily) and Web Scrape (Scrapfly) skills
 * - Real-time task and status updates via SSE
 */

const agents = new Map<string, Agent>();
const chatSessions = new Map<string, ReturnType<Agent["chat"]>>();

function getOrCreateAgent(sessionId: string): Agent {
  if (!agents.has(sessionId)) {
    const agent = new Agent({
      id: `planner-coder-${sessionId}`,
      name: "Smyth Planner Assistant",
      behavior: `You are a sophisticated planner assistant. You are given a complex task and you need to:
        1. Break it down into logical steps.
        2. Execute each step using your skills.
        3. Provide a final summary.
        Code blocks should be formatted with markdown.`,
      model: Model.Anthropic("claude-haiku-4-5"), // or gpt-4o-mini
      mode: TAgentMode.PLANNER,
    });

    // --- Web Search Skill ---
    const wsSkill = agent.addSkill({
      name: "WebSearch",
      description: "Use this skill to get comprehensive web search results",
    });

    wsSkill.in({
      userQuery: { description: "The search query" },
    });

    const wsTavily = Component.TavilyWebSearch({
      searchTopic: "general",
      sourcesLimit: 5,
    });

    wsTavily.in({ SearchQuery: wsSkill.out.userQuery });

    const wsOutput = Component.APIOutput({ format: "minimal" });
    wsOutput.in({ WebSearch: wsTavily.out.Results });

    // --- Web Scrape Skill ---
    const wScrapeSkill = agent.addSkill({
      name: "WebScrape",
      description: "Use this skill to scrape web pages",
    });

    wScrapeSkill.in({
      URLs: { description: "Array of URLs to scrape" },
    });

    const wscrapeFly = Component.ScrapflyWebScrape({});
    wscrapeFly.in({ URLs: wScrapeSkill.out.URLs });

    const wScrapeOutput = Component.APIOutput({ format: "minimal" });
    wScrapeOutput.in({ WebScrape: wscrapeFly.out.Results });

    agents.set(sessionId, agent);
  }
  return agents.get(sessionId)!;
}

function getOrCreateChat(sessionId: string): ReturnType<Agent["chat"]> {
  if (!chatSessions.has(sessionId)) {
    const agent = getOrCreateAgent(sessionId);
    const chat = agent.chat({ id: `chat-planner-${sessionId}`, persist: false });
    chatSessions.set(sessionId, chat);
  }
  return chatSessions.get(sessionId)!;
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || !sessionId) {
      return new Response(JSON.stringify({ error: "Message and sessionId are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const agent = getOrCreateAgent(sessionId);
    const chat = getOrCreateChat(sessionId);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;

        const safeEnqueue = (data: string) => {
          if (!isClosed) {
            try {
              controller.enqueue(encoder.encode(data));
            } catch {
              isClosed = true;
            }
          }
        };

        const safeClose = () => {
          if (!isClosed) {
            isClosed = true;
            try {
              controller.close();
            } catch {
              // Already closed
            }
          }
        };

        // --- Task and Status Event Listeners ---
        const sendTasks = (tasks: any) => {
          safeEnqueue(`data: ${JSON.stringify({ type: "tasks", data: tasks })}\n\n`);
        };

        agent.on("TasksAdded", (list, tasks) => sendTasks(tasks));
        agent.on("SubTasksAdded", (id, list, tasks) => sendTasks(tasks));
        agent.on("TasksUpdated", (id, status, tasks) => sendTasks(tasks));
        agent.on("TasksCompleted", (tasks) => sendTasks(tasks));
        agent.on("StatusUpdated", (status) => {
          safeEnqueue(`data: ${JSON.stringify({ type: "status", data: status })}\n\n`);
        });

        try {
          const streamResult = await chat.prompt(message).stream();

          streamResult.on(TLLMEvent.Content, (content: string) => {
            safeEnqueue(`data: ${JSON.stringify({ type: "content", data: content })}\n\n`);
          });

          streamResult.on(TLLMEvent.ToolCall, (toolCall: any) => {
            if (!toolCall?.tool?.name.startsWith("_sre_")) {
              safeEnqueue(`data: ${JSON.stringify({ 
                type: "tool_call", 
                data: { name: toolCall?.tool?.name, id: toolCall?.tool?.id } 
              })}\n\n`);
            }
          });

          streamResult.on(TLLMEvent.ToolResult, (toolResult: any) => {
            if (!toolResult?.tool?.name.startsWith("_sre_")) {
              safeEnqueue(`data: ${JSON.stringify({ 
                type: "tool_result", 
                data: { name: toolResult?.tool?.name, id: toolResult?.tool?.id } 
              })}\n\n`);
            }
          });

          streamResult.on(TLLMEvent.End, () => {
            safeEnqueue(`data: ${JSON.stringify({ type: "end" })}\n\n`);
            safeClose();
          });

          streamResult.on(TLLMEvent.Error, (error: any) => {
            safeEnqueue(`data: ${JSON.stringify({ type: "error", data: error?.message || "Planner error" })}\n\n`);
            safeClose();
          });
        } catch (error: any) {
          safeEnqueue(`data: ${JSON.stringify({ type: "error", data: error?.message || "Failed to start planner" })}\n\n`);
          safeClose();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
