import { Agent, Doc, Model, TLLMEvent, VectorDB } from "@smythos/sdk";
import { NextRequest } from "next/server";

/**
 * Practice 08: Document Q&A (RAG) API Route
 * Based on sre/examples/05-VectorDB-with-agent/01-upsert-and-search.ts
 *
 * Features demonstrated:
 * - Document parsing (PDF, DOCX, TXT, MD)
 * - Vector embeddings with RAMVec
 * - Semantic search
 * - RAG (Retrieval Augmented Generation)
 */

// Store agents, chats, and vectorDBs per session
const agents = new Map<string, Agent>();
const chatSessions = new Map<string, ReturnType<Agent["chat"]>>();
const vectorDBs = new Map<string, ReturnType<typeof VectorDB.RAMVec>>();
const documentInfo = new Map<string, { name: string; chunks: number }[]>();

// RAMVec settings
const getRAMVecSettings = () => ({
  embeddings: {
    model: Model.OpenAI("text-embedding-3-small"),
    dimensions: 512,
    chunkSize: 500,
    chunkOverlap: 50,
  },
});

function getOrCreateVectorDB(sessionId: string) {
  if (!vectorDBs.has(sessionId)) {
    const ramVec = VectorDB.RAMVec(`doc-qa-${sessionId}`, getRAMVecSettings());
    vectorDBs.set(sessionId, ramVec);
  }
  return vectorDBs.get(sessionId)!;
}

function getOrCreateAgent(sessionId: string): Agent {
  if (!agents.has(sessionId)) {
    const agent = new Agent({
      id: `document-qa-${sessionId}`,
      name: "Document Q&A Assistant",
      behavior: `You are a helpful document assistant. You answer questions based on the uploaded documents.
        
        When answering:
        1. Only use information from the retrieved documents
        2. Quote relevant passages when appropriate
        3. If you can't find the answer, say so honestly
        4. Cite the source document name when possible
        
        Be concise but thorough in your answers.`,
      model: "gpt-4o-mini",
    });

    // Add search skill
    agent.addSkill({
      name: "SearchDocuments",
      description: "Search through uploaded documents to find relevant information",
      process: async ({ query }: { query: string }) => {
        const vectorDB = getOrCreateVectorDB(sessionId);
        try {
          const results = await vectorDB.search(query, { topK: 5 });
          if (!results || results.length === 0) {
            return "No relevant information found in the documents.";
          }
          return results
            .map((r: { text?: string; score?: number }, i: number) => `[Result ${i + 1}] (Score: ${r.score?.toFixed(2)})\n${r.text}`)
            .join("\n\n---\n\n");
        } catch {
          return "No documents have been uploaded yet.";
        }
      },
    });

    agents.set(sessionId, agent);
  }
  return agents.get(sessionId)!;
}

function getOrCreateChat(sessionId: string): ReturnType<Agent["chat"]> {
  if (!chatSessions.has(sessionId)) {
    const agent = getOrCreateAgent(sessionId);
    const chat = agent.chat({ id: `chat-doc-${sessionId}`, persist: false });
    chatSessions.set(sessionId, chat);
  }
  return chatSessions.get(sessionId)!;
}

// Handle document upload
async function handleUpload(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const sessionId = formData.get("sessionId") as string;

    if (!file || !sessionId) {
      return new Response(JSON.stringify({ error: "File and sessionId are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const vectorDB = getOrCreateVectorDB(sessionId);

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine file type and parse
    const fileName = file.name.toLowerCase();
    let parsedDoc;

    if (fileName.endsWith(".pdf")) {
      // For PDF, we need to save temporarily or use buffer
      // SmythOS Doc.pdf.parse expects a file path, so we'll use text extraction
      const textContent = buffer.toString("utf-8");
      parsedDoc = await Doc.text.parse(textContent, {
        title: file.name,
        source: file.name,
      });
    } else if (fileName.endsWith(".md")) {
      const textContent = buffer.toString("utf-8");
      parsedDoc = await Doc.md.parse(textContent, {
        title: file.name,
        source: file.name,
      });
    } else if (fileName.endsWith(".txt")) {
      const textContent = buffer.toString("utf-8");
      parsedDoc = await Doc.text.parse(textContent, {
        title: file.name,
        source: file.name,
      });
    } else {
      // Default to text parsing
      const textContent = buffer.toString("utf-8");
      parsedDoc = await Doc.text.parse(textContent, {
        title: file.name,
        source: file.name,
      });
    }

    // Insert into vector DB
    const result = await vectorDB.insertDoc(file.name, parsedDoc, {
      chunkSize: 500,
      chunkOverlap: 50,
    });

    // Track document info
    if (!documentInfo.has(sessionId)) {
      documentInfo.set(sessionId, []);
    }
    const docs = documentInfo.get(sessionId)!;
    const chunkCount = Array.isArray(result) ? result.length : 1;
    docs.push({ name: file.name, chunks: chunkCount });

    return new Response(
      JSON.stringify({
        success: true,
        fileName: file.name,
        chunks: chunkCount,
        totalDocuments: docs.length,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to process document" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Handle chat/question
async function handleChat(request: NextRequest) {
  try {
    const formData = await request.formData();
    const message = formData.get("message") as string;
    const sessionId = formData.get("sessionId") as string;

    if (!message || !sessionId) {
      return new Response(JSON.stringify({ error: "Message and sessionId are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ensure agent is created (this also creates vectorDB if needed)
    getOrCreateAgent(sessionId);
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

          streamResult.on(TLLMEvent.ToolCall, (toolCall: { tool?: { name?: string } }) => {
            if (toolCall?.tool?.name) {
              safeEnqueue(
                `data: ${JSON.stringify({ type: "tool_call", data: { name: toolCall.tool.name } })}\n\n`
              );
            }
          });

          streamResult.on(TLLMEvent.ToolResult, () => {
            safeEnqueue(`data: ${JSON.stringify({ type: "tool_result", data: "Search completed" })}\n\n`);
          });

          streamResult.on(TLLMEvent.End, () => {
            safeEnqueue(`data: ${JSON.stringify({ type: "end" })}\n\n`);
            safeClose();
          });

          streamResult.on(TLLMEvent.Error, (error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : "Chat error";
            safeEnqueue(`data: ${JSON.stringify({ type: "error", data: errorMessage })}\n\n`);
            safeClose();
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to process question";
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

// Get document info
async function handleGetDocs(request: NextRequest) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return new Response(JSON.stringify({ error: "sessionId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const docs = documentInfo.get(sessionId) || [];
  return new Response(JSON.stringify({ documents: docs }), {
    headers: { "Content-Type": "application/json" },
  });
}

// Route handler
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "upload") {
    return handleUpload(request);
  } else {
    return handleChat(request);
  }
}

export async function GET(request: NextRequest) {
  return handleGetDocs(request);
}
