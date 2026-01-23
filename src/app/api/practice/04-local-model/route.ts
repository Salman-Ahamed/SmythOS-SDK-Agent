import { Agent, Model, TLLMEvent } from "@smythos/sdk";
import { NextRequest } from "next/server";

/**
 * Practice 04: Local Model Chat API Route
 * Based on sre/examples/12-local-models/04-chat-with-local-model.ts
 * 
 * Features demonstrated:
 * - Integration with local models (Ollama, LM Studio)
 * - Using Model.Ollama and Model.OpenAI with custom baseURL
 * - Persistent chat with local model
 */

const agents = new Map<string, Agent>();
const chatSessions = new Map<string, ReturnType<Agent["chat"]>>();

function getOrCreateAgent(sessionId: string): Agent {
  if (!agents.has(sessionId)) {
    const agent = new Agent({
      id: `local-model-assistant-${sessionId}`,
      name: "Local Crypto Assistant",
      behavior: "You are a crypto price tracker running on a local model. You are given a coin id and you need to get the price of the coin in USD.",
      
      // Default to Ollama (common for local development)
      // In a real app, these values would come from environment variables
      model: Model.Ollama('llama3', {
        baseURL: process.env.LOCAL_MODEL_BASE_URL || 'http://localhost:11434/api/',
        inputTokens: 4096,
        outputTokens: 2048,
      }),
    });

    // Add skills (same as in the example)
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
    // Persist: true as in example
    const chat = agent.chat({ id: `chat-local-${sessionId}`, persist: true });
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

        try {
          const streamResult = await chat.prompt(message).stream();

          streamResult.on(TLLMEvent.Content, (content: string) => {
            safeEnqueue(`data: ${JSON.stringify({ type: "content", data: content })}\n\n`);
          });

          streamResult.on(TLLMEvent.ToolCall, (toolCall: any) => {
            safeEnqueue(
              `data: ${JSON.stringify({
                type: "tool_call",
                data: { name: toolCall?.tool?.name, arguments: toolCall?.tool?.arguments },
              })}\n\n`
            );
          });

          streamResult.on(TLLMEvent.End, () => {
            safeEnqueue(`data: ${JSON.stringify({ type: "end" })}\n\n`);
            safeClose();
          });

          streamResult.on(TLLMEvent.Error, (error: any) => {
            safeEnqueue(`data: ${JSON.stringify({ type: "error", data: error?.message || "Local model error" })}\n\n`);
            safeClose();
          });
        } catch (error: any) {
          safeEnqueue(`data: ${JSON.stringify({ type: "error", data: error?.message || "Failed to connect to local model" })}\n\n`);
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
