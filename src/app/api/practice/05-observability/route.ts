import { Agent, TLLMEvent } from "@smythos/sdk";
import { SRE } from "@smythos/sdk/core";
import { NextRequest } from "next/server";

/**
 * Practice 05: Observability Chat API Route
 * Based on sre/examples/14-observability/02-opentelemetry-chat-interactive.ts
 * 
 * Features demonstrated:
 * - Enabling OpenTelemetry observability with SRE.init()
 * - Tracing agent operations and tool calls
 * - Monitoring performance and errors
 */

// Initialize SRE with Telemetry configuration
// In a production app, this would be in a separate initialization file
SRE.init({
  Telemetry: {
    Connector: 'OTel',
    Settings: {
      endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
      serviceName: 'sdk-agent-practice',
    },
  },
});

const agents = new Map<string, Agent>();
const chatSessions = new Map<string, ReturnType<Agent["chat"]>>();

function getOrCreateAgent(sessionId: string): Agent {
  if (!agents.has(sessionId)) {
    const agent = new Agent({
      id: `observability-assistant-${sessionId}`,
      name: "Observability Assistant",
      behavior: "You are a helpful assistant with observability enabled. You answer questions about crypto prices.",
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
    const chat = agent.chat({ id: `chat-otel-${sessionId}`, persist: true });
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
                data: { name: toolCall?.tool?.name, id: toolCall?.tool?.id },
              })}\n\n`
            );
          });

          streamResult.on(TLLMEvent.End, () => {
            safeEnqueue(`data: ${JSON.stringify({ type: "end" })}\n\n`);
            safeClose();
          });

          streamResult.on(TLLMEvent.Error, (error: any) => {
            safeEnqueue(`data: ${JSON.stringify({ type: "error", data: error?.message || "OTel error" })}\n\n`);
            safeClose();
          });
        } catch (error: any) {
          safeEnqueue(`data: ${JSON.stringify({ type: "error", data: error?.message || "Failed to start streaming" })}\n\n`);
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
