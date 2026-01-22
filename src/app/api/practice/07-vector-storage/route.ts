import { Agent, TLLMEvent, Model, Doc } from "@smythos/sdk";
import { NextRequest } from "next/server";

/**
 * Practice 07: Vector Storage & Advanced Tools API Route
 * Based on sre/examples/01-agent-code-skill/10-llm-storage-vectors.ts
 * and 05-VectorDB-with-agent/01-upsert-and-search.ts
 *
 * Features demonstrated:
 * - Using RAMVectorDB for in-memory vector search
 * - Using agent.storage.LocalStorage for file persistence
 * - Directly accessing LLM providers via agent.llm
 * - Document parsing and indexing
 */

const chatSessions = new Map<string, ReturnType<Agent["chat"]>>();
const agents = new Map<string, Agent>();

function getOrCreateAgent(sessionId: string): Agent {
  if (!agents.has(sessionId)) {
    const agent = new Agent({
      id: `vector-agent-${sessionId}`,
      name: "Knowledge Assistant",
      behavior: "You are a knowledgeable assistant with access to a vector database and local storage. Use your skills to help the user.",
      model: "gpt-4o-mini",
    });

    // VectorDB Settings using RAMVec (no API key required)
    const ramVecSettings = {
      embeddings: {
        model: Model.OpenAI("text-embedding-3-small"),
        dimensions: 1536,
      },
    };

    // Skill to add information to the knowledge base
    agent.addSkill({
      name: "AddKnowledge",
      description: "Save information to the vector database for later retrieval.",
      process: async ({ title, content }: { title: string; content: string }) => {
        const vec = agent.vectorDB.RAMVec("practice-ns", ramVecSettings);

        // Parse raw text into a document
        const doc = await Doc.text.parse(content, { title });

        // Insert into VectorDB
        await vec.insertDoc(title, doc);

        return { status: "success", message: `Knowledge about '${title}' has been indexed.` };
      },
    });

    // Skill to search the knowledge base
    agent.addSkill({
      name: "SearchKnowledge",
      description: "Search the vector database for relevant information.",
      process: async ({ query }: { query: string }) => {
        const vec = agent.vectorDB.RAMVec("practice-ns", ramVecSettings);
        const results = await vec.search(query, { topK: 3 });

        return results;
      },
    });

    // Skill demonstrated in 10-llm-storage-vectors.ts: direct LLM usage and storage
    agent.addSkill({
      name: "GenerateAndSave",
      description: "Generate a creative text using a specific model and save it to local storage.",
      process: async ({ topic, filename }: { topic: string; filename: string }) => {
        // Direct LLM usage
        const miniLlm = agent.llm.OpenAI("gpt-4o-mini");
        const content = await miniLlm.prompt(`Write a short creative poem about ${topic}`);

        // Local storage usage
        const storage = agent.storage.LocalStorage();
        const uri = await storage.write(filename || "creative_work.txt", content);

        return {
          message: "Generation complete and saved.",
          uri,
          preview: content.substring(0, 100) + "..."
        };
      },
    });

    agents.set(sessionId, agent);
  }
  return agents.get(sessionId)!;
}

function getOrCreateChat(sessionId: string): ReturnType<Agent["chat"]> {
  if (!chatSessions.has(sessionId)) {
    const agent = getOrCreateAgent(sessionId);
    const chat = agent.chat({ id: `chat-vector-${sessionId}`, persist: true });
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
            safeEnqueue(`data: ${JSON.stringify({ type: "tool_call", data: toolCall?.tool?.name })}\n\n`);
          });

          streamResult.on(TLLMEvent.ToolResult, (toolResult: any) => {
            safeEnqueue(`data: ${JSON.stringify({ type: "tool_result", data: toolResult?.result })}\n\n`);
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
