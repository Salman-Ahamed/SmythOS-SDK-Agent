import { Agent, TLLMEvent } from "@smythos/sdk";
import { NextRequest } from "next/server";

/**
 * Practice 02: Chat with Streaming API Route
 * Based on sre/examples/01-agent-code-skill/03.1-chat-streaming.ts
 *
 * Features demonstrated:
 * - Streaming responses using .stream()
 * - Event handlers: Content, End, Error, ToolCall, ToolResult
 * - Real-time content display
 *
 * Using OpenAI gpt-4o-mini (cheapest and fastest)
 */

// Store chat sessions in memory
const chatSessions = new Map<string, ReturnType<Agent["chat"]>>();
const agents = new Map<string, Agent>();

function getOrCreateAgent(sessionId: string): Agent {
  if (!agents.has(sessionId)) {
    const agent = new Agent({
      name: "CryptoMarket Assistant",
      behavior:
        "You are a crypto price tracker. You are given a coin id and you need to get the price of the coin in USD. Be very concise - respond in 1-2 sentences max.",
      // Using gpt-4o-mini - cheapest and fastest OpenAI model
      model: "gpt-4o-mini",
    });

    agent.addSkill({
      name: "Price",
      description: "Use this skill to get the price of a cryptocurrency",
      process: async ({ coin_id }: { coin_id: string }) => {
        const url = `https://api.coingecko.com/api/v3/coins/${coin_id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
        const response = await fetch(url);
        const data = await response.json();
        return data.market_data?.current_price || "Price data not available";
      },
    });

    agents.set(sessionId, agent);
  }

  return agents.get(sessionId)!;
}

function getOrCreateChat(sessionId: string): ReturnType<Agent["chat"]> {
  if (!chatSessions.has(sessionId)) {
    const agent = getOrCreateAgent(sessionId);
    const chat = agent.chat();
    chatSessions.set(sessionId, chat);
  }

  return chatSessions.get(sessionId)!;
}

export async function POST(request: NextRequest) {
  const { message, sessionId } = await request.json();

  if (!message || !sessionId) {
    return new Response(JSON.stringify({ error: "Message and sessionId are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const chat = getOrCreateChat(sessionId);

  // Create a readable stream for SSE (Server-Sent Events)
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

      try {
        // Get streaming response - same as 03.1-chat-streaming.ts
        const streamResult = await chat.prompt(message).stream();

        // Handle content chunks - TLLMEvent.Content
        streamResult.on(TLLMEvent.Content, (content: string) => {
          const data = JSON.stringify({ type: "content", data: content });
          safeEnqueue(`data: ${data}\n\n`);
        });

        // Handle tool calls - TLLMEvent.ToolCall
        streamResult.on(TLLMEvent.ToolCall, (toolCall: unknown) => {
          const tc = toolCall as { tool?: { name?: string; arguments?: unknown } };
          const data = JSON.stringify({
            type: "tool_call",
            data: {
              name: tc?.tool?.name,
              arguments: tc?.tool?.arguments,
            },
          });
          safeEnqueue(`data: ${data}\n\n`);
        });

        // Handle tool results - TLLMEvent.ToolResult
        streamResult.on(TLLMEvent.ToolResult, (toolResult: unknown) => {
          const tr = toolResult as { result?: unknown };
          const data = JSON.stringify({
            type: "tool_result",
            data: tr?.result,
          });
          safeEnqueue(`data: ${data}\n\n`);
        });

        // Handle end - TLLMEvent.End
        streamResult.on(TLLMEvent.End, () => {
          const data = JSON.stringify({ type: "end" });
          safeEnqueue(`data: ${data}\n\n`);
          safeClose();
        });

        // Handle errors - TLLMEvent.Error
        streamResult.on(TLLMEvent.Error, (error: unknown) => {
          const data = JSON.stringify({
            type: "error",
            data: error instanceof Error ? error.message : "Unknown error",
          });
          safeEnqueue(`data: ${data}\n\n`);
          safeClose();
        });
      } catch (error) {
        const data = JSON.stringify({
          type: "error",
          data: error instanceof Error ? error.message : "Unknown error",
        });
        safeEnqueue(`data: ${data}\n\n`);
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
}
