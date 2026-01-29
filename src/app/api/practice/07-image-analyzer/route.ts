import { Agent, TLLMEvent } from "@smythos/sdk";
import { NextRequest } from "next/server";

/**
 * Practice 07: Image Analyzer API Route
 * Based on sre/examples/01-agent-code-skill/06-handle-attachment-with-agent-llm.ts
 *
 * Features demonstrated:
 * - Vision model integration (gpt-4o)
 * - Image attachment handling
 * - Multimodal prompts
 * - Streaming responses with image analysis
 */

const agents = new Map<string, Agent>();
const chatSessions = new Map<string, ReturnType<Agent["chat"]>>();

function getOrCreateAgent(sessionId: string): Agent {
  if (!agents.has(sessionId)) {
    const agent = new Agent({
      id: `image-analyzer-${sessionId}`,
      name: "Image Analyzer",
      behavior: `You are an expert image analyzer. When given an image, you should:
        1. Describe what you see in detail
        2. Identify objects, people, text, colors, and patterns
        3. Note any interesting or notable features
        4. Provide context if you recognize the subject
        Be descriptive but concise. Use markdown formatting for better readability.`,
      model: "gpt-4o", // Vision-capable model
    });

    agents.set(sessionId, agent);
  }
  return agents.get(sessionId)!;
}

function getOrCreateChat(sessionId: string): ReturnType<Agent["chat"]> {
  if (!chatSessions.has(sessionId)) {
    const agent = getOrCreateAgent(sessionId);
    const chat = agent.chat({ id: `chat-image-${sessionId}`, persist: false });
    chatSessions.set(sessionId, chat);
  }
  return chatSessions.get(sessionId)!;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const message = formData.get("message") as string;
    const sessionId = formData.get("sessionId") as string;
    const imageUrl = formData.get("imageUrl") as string | null;
    const imageFile = formData.get("image") as File | null;

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "sessionId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const chat = getOrCreateChat(sessionId);
    const encoder = new TextEncoder();

    // Prepare files array for the agent
    const files: string[] = [];

    if (imageUrl) {
      // Remote URL
      files.push(imageUrl);
    } else if (imageFile) {
      // Convert File to base64 data URL
      const bytes = await imageFile.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = imageFile.type || "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${base64}`;
      files.push(dataUrl);
    }

    const promptMessage = message || "Please analyze this image and describe what you see.";

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
          // Use the prompt with files attachment
          const streamResult = await chat
            .prompt(promptMessage, {
              files: files.length > 0 ? files : undefined,
            })
            .stream();

          streamResult.on(TLLMEvent.Content, (content: string) => {
            safeEnqueue(`data: ${JSON.stringify({ type: "content", data: content })}\n\n`);
          });

          streamResult.on(TLLMEvent.End, () => {
            safeEnqueue(`data: ${JSON.stringify({ type: "end" })}\n\n`);
            safeClose();
          });

          streamResult.on(TLLMEvent.Error, (error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : "Image analysis failed";
            safeEnqueue(`data: ${JSON.stringify({ type: "error", data: errorMessage })}\n\n`);
            safeClose();
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to analyze image";
          safeEnqueue(`data: ${JSON.stringify({ type: "error", data: errorMessage })}\n\n`);
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
