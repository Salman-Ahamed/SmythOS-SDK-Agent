import { Agent, TLLMEvent } from "@smythos/sdk";
import { NextRequest } from "next/server";

/**
 * Practice 06: Attachment Handling API Route
 * Based on sre/examples/01-agent-code-skill/06-handle-attachment-with-agent-llm.ts
 *
 * Features demonstrated:
 * - Sending attachments (images/files) to the agent
 * - Using agent.prompt() with the 'files' option
 * - Native LLM image analysis
 */

const chatSessions = new Map<string, ReturnType<Agent["chat"]>>();
const agents = new Map<string, Agent>();

function getOrCreateAgent(sessionId: string): Agent {
  if (!agents.has(sessionId)) {
    const agent = new Agent({
      id: `attachment-analyser-${sessionId}`,
      name: "Visual Assistant",
      behavior: "You are a helpful assistant that can see and analyze images. Describe them accurately and answer questions about them.",
      model: "gpt-4o-mini",
    });

    agents.set(sessionId, agent);
  }
  return agents.get(sessionId)!;
}

function getOrCreateChat(sessionId: string): ReturnType<Agent["chat"]> {
  if (!chatSessions.has(sessionId)) {
    const agent = getOrCreateAgent(sessionId);
    const chat = agent.chat({ id: `chat-attachment-${sessionId}`, persist: true });
    chatSessions.set(sessionId, chat);
  }
  return chatSessions.get(sessionId)!;
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, files } = await request.json();

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
          // Pass the files to the prompt - SmythOS SDK handles URLs, base64, etc.
          const streamResult = await chat.prompt(message, { files }).stream();

          streamResult.on(TLLMEvent.Content, (content: string) => {
            safeEnqueue(`data: ${JSON.stringify({ type: "content", data: content })}\n\n`);
          });

          streamResult.on(TLLMEvent.End, () => {
            safeEnqueue(`data: ${JSON.stringify({ type: "end" })}\n\n`);
            safeClose();
          });

          streamResult.on(TLLMEvent.Error, (error: unknown) => {
            safeEnqueue(
              `data: ${JSON.stringify({
                type: "error",
                data: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`
            );
            safeClose();
          });
        } catch (error) {
          safeEnqueue(
            `data: ${JSON.stringify({
              type: "error",
              data: error instanceof Error ? error.message : "Unknown error",
            })}\n\n`
          );
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
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
