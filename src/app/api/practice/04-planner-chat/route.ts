import { Agent, Component, Model, TAgentMode, TLLMEvent } from "@smythos/sdk";
import { NextRequest } from "next/server";

/**
 * Practice 04: Planner Coder API Route (Exact Mirror of Example)
 * Based on: sre/examples/01-agent-code-skill/04.1-chat-planner-coder.ts
 */

const agents = new Map<string, Agent>();
const chatSessions = new Map<string, ReturnType<Agent["chat"]>>();

function getOrCreateAgent(sessionId: string): Agent {
  if (!agents.has(sessionId)) {
    const agent = new Agent({
      id: "smyth-code-assistant",
      name: "Smyth Code Assistant",
      behavior: `You are a code assistant. You are given a code task and you need to complete it.
        Code blocks should be preceeded with \`\`\`lang tags and closed with \`\`\` where lang is the language of the code.
        When the user asks about a framework or a library that you do not know, make sure to perform a web search to get the information you need.
        NEVER make up information, if you don't know the answer.
        `,
      // Exact model from example
      model: Model.Anthropic("claude-haiku-4-5"),
      mode: TAgentMode.PLANNER,
    });

    // --- Web Search Skill (Exact copy from example) ---
    const wsSkill = agent.addSkill({
      name: "WebSearch",
      description: "Use this skill to get comprehensive web search results",
    });

    wsSkill.in({
      userQuery: {
        description: "The search query to get the web search results of",
      },
    });

    const wsTavily = Component.TavilyWebSearch({
      searchTopic: "general",
      sourcesLimit: 10,
      includeImages: false,
      includeQAs: false,
      timeRange: "None",
    });

    wsTavily.in({
      SearchQuery: wsSkill.out.userQuery,
    });

    const wsOutput = Component.APIOutput({ format: "minimal" });
    wsOutput.in({ WebSearch: wsTavily.out.Results });

    // --- Web Search Scrape (Exact copy from example) ---
    const wScrapeSkill = agent.addSkill({
      name: "WebScrape",
      description: "Use this skill to scrape web pages",
    });

    wScrapeSkill.in({
      URLs: {
        description: "The URLs to scrape in a JS array",
      },
    });

    const wscrapeFly = Component.ScrapflyWebScrape({});
    wscrapeFly.in({
      URLs: wScrapeSkill.out.URLs,
    });

    const wScrapeOutput = Component.APIOutput({ format: "minimal" });
    wScrapeOutput.in({ WebScrape: wscrapeFly.out.Results });

    agents.set(sessionId, agent);
  }
  return agents.get(sessionId)!;
}

function getOrCreateChat(sessionId: string): ReturnType<Agent["chat"]> {
  if (!chatSessions.has(sessionId)) {
    const agent = getOrCreateAgent(sessionId);
    // persist: false as in example
    const chat = agent.chat({ id: "my-chat-" + Date.now(), persist: false });
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

        // Task Event Handlers
        agent.on("TasksAdded", (tasksList: any, tasks: any) => {
          safeEnqueue(`data: ${JSON.stringify({ type: "tasks", data: tasks })}\n\n`);
        });
        agent.on("SubTasksAdded", (taskId: string, subTasksList: any, tasks: any) => {
          safeEnqueue(`data: ${JSON.stringify({ type: "tasks", data: tasks })}\n\n`);
        });
        agent.on("TasksUpdated", (taskId: string, status: string, tasks: any) => {
          safeEnqueue(`data: ${JSON.stringify({ type: "tasks", data: tasks })}\n\n`);
        });
        agent.on("TasksCompleted", (tasks: any) => {
          safeEnqueue(`data: ${JSON.stringify({ type: "tasks", data: tasks })}\n\n`);
        });
        agent.on("StatusUpdated", (status: string) => {
          safeEnqueue(`data: ${JSON.stringify({ type: "status", data: status })}\n\n`);
        });

        try {
          const streamResult = await chat.prompt(message).stream();

          streamResult.on(TLLMEvent.Content, (content: string) => {
            safeEnqueue(`data: ${JSON.stringify({ type: "content", data: content })}\n\n`);
          });

          streamResult.on(TLLMEvent.ToolCall, (toolCall: any) => {
            if (!toolCall?.tool?.name.startsWith("_sre_")) {
              safeEnqueue(
                `data: ${JSON.stringify({
                  type: "tool_call",
                  data: { name: toolCall?.tool?.name, id: toolCall?.tool?.id, arguments: toolCall?.tool?.arguments },
                })}\n\n`
              );
            }
          });

          streamResult.on(TLLMEvent.ToolResult, (toolResult: any) => {
            if (!toolResult?.tool?.name.startsWith("_sre_")) {
              safeEnqueue(
                `data: ${JSON.stringify({
                  type: "tool_result",
                  data: { name: toolResult?.tool?.name, id: toolResult?.tool?.id, result: toolResult?.result },
                })}\n\n`
              );
            }
          });

          streamResult.on(TLLMEvent.End, () => {
            safeEnqueue(`data: ${JSON.stringify({ type: "end" })}\n\n`);
            safeClose();
          });

          streamResult.on(TLLMEvent.Error, (error: any) => {
            safeEnqueue(`data: ${JSON.stringify({ type: "error", data: error?.message || "Unknown error" })}\n\n`);
            safeClose();
          });
        } catch (error: any) {
          safeEnqueue(`data: ${JSON.stringify({ type: "error", data: error?.message || "Unknown error" })}\n\n`);
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
