import { Agent, Component, TLLMEvent } from "@smythos/sdk";
import { NextRequest } from "next/server";

/**
 * Practice 10: Multi-Agent Workflow
 *
 * Features demonstrated:
 * - Multiple specialized agents
 * - Agent-to-agent orchestration
 * - Sequential workflow execution
 * - Real-time progress streaming
 *
 * Workflow:
 * 1. Researcher Agent - Gathers information via WebSearch
 * 2. Writer Agent - Creates content from research
 * 3. Editor Agent - Reviews and polishes content
 */

// Agent definitions
interface WorkflowAgent {
    agent: Agent;
    role: string;
    emoji: string;
}

// Create specialized agents
function createAgents(sessionId: string): Record<string, WorkflowAgent> {
    // 1. RESEARCHER AGENT
    const researcher = new Agent({
        id: `researcher-${sessionId}`,
        name: "Research Specialist",
        behavior: `You are an expert researcher. Your job is to:
      1. Search the web for comprehensive information
      2. Gather relevant facts, statistics, and insights
      3. Organize findings in a structured format

      Always provide sources when available.
      Focus on accuracy and relevance.
      Return your findings as bullet points.`,
        model: "gpt-4o-mini",
    });

    // Add WebSearch skill to researcher
    const searchSkill = researcher.addSkill({
        name: "WebSearch",
        description: "Search the web for information",
    });

    searchSkill.in({
        query: { description: "The search query" },
    });

    const tavily = Component.TavilyWebSearch({
        searchTopic: "general",
        sourcesLimit: 5,
    });

    tavily.in({ SearchQuery: searchSkill.out.query });

    const searchOutput = Component.APIOutput({ format: "minimal" });
    searchOutput.in({ Results: tavily.out.Results });

    // 2. WRITER AGENT
    const writer = new Agent({
        id: `writer-${sessionId}`,
        name: "Content Writer",
        behavior: `You are a skilled content writer. Your job is to:
      1. Take research findings and transform them into engaging content
      2. Write clear, well-structured paragraphs
      3. Use appropriate headings and formatting (markdown)
      4. Make complex topics accessible

      Write in a professional but approachable tone.
      Use examples to illustrate points.
      Keep the content focused and relevant.`,
        model: "gpt-4o-mini",
    });

    // 3. EDITOR AGENT
    const editor = new Agent({
        id: `editor-${sessionId}`,
        name: "Content Editor",
        behavior: `You are a meticulous editor. Your job is to:
      1. Review content for clarity and flow
      2. Fix any grammar or style issues
      3. Improve readability and engagement
      4. Add a quality assessment (1-10 scale)

      Be constructive and specific.
      Suggest improvements inline.
      Return the final polished version with your assessment.`,
        model: "gpt-4o-mini",
    });

    return {
        researcher: { agent: researcher, role: "Researcher", emoji: "🔍" },
        writer: { agent: writer, role: "Writer", emoji: "✍️" },
        editor: { agent: editor, role: "Editor", emoji: "📝" },
    };
}

// Workflow execution
async function runWorkflow(
    topic: string,
    agents: Record<string, WorkflowAgent>,
    sendEvent: (event: object) => void
) {
    const results: Record<string, string> = {};

    // STEP 1: Research
    sendEvent({
        type: "agent_start",
        data: { agent: "researcher", status: "working", message: "Searching the web..." },
    });

    try {
        const researcherChat = agents.researcher.agent.chat();
        let researchContent = "";

        const researchStream = await researcherChat
            .prompt(`Research the following topic thoroughly and provide key findings: "${topic}"`)
            .stream();

        await new Promise<void>((resolve, reject) => {
            researchStream.on(TLLMEvent.Content, (content: string) => {
                researchContent += content;
                sendEvent({
                    type: "agent_content",
                    data: { agent: "researcher", content },
                });
            });

            researchStream.on(TLLMEvent.End, () => {
                results.research = researchContent;
                sendEvent({
                    type: "agent_complete",
                    data: { agent: "researcher", status: "completed" },
                });
                resolve();
            });

            researchStream.on(TLLMEvent.Error, (error: unknown) => {
                reject(error);
            });
        });
    } catch (error) {
        sendEvent({
            type: "agent_error",
            data: {
                agent: "researcher",
                error: error instanceof Error ? error.message : "Research failed",
            },
        });
        throw error;
    }

    // STEP 2: Write
    sendEvent({
        type: "agent_start",
        data: { agent: "writer", status: "working", message: "Writing content..." },
    });

    try {
        const writerChat = agents.writer.agent.chat();
        let writerContent = "";

        const writerStream = await writerChat
            .prompt(
                `Based on the following research, write a comprehensive and engaging article about "${topic}":\n\n${results.research}`
            )
            .stream();

        await new Promise<void>((resolve, reject) => {
            writerStream.on(TLLMEvent.Content, (content: string) => {
                writerContent += content;
                sendEvent({
                    type: "agent_content",
                    data: { agent: "writer", content },
                });
            });

            writerStream.on(TLLMEvent.End, () => {
                results.draft = writerContent;
                sendEvent({
                    type: "agent_complete",
                    data: { agent: "writer", status: "completed" },
                });
                resolve();
            });

            writerStream.on(TLLMEvent.Error, (error: unknown) => {
                reject(error);
            });
        });
    } catch (error) {
        sendEvent({
            type: "agent_error",
            data: {
                agent: "writer",
                error: error instanceof Error ? error.message : "Writing failed",
            },
        });
        throw error;
    }

    // STEP 3: Edit
    sendEvent({
        type: "agent_start",
        data: { agent: "editor", status: "working", message: "Reviewing and polishing..." },
    });

    try {
        const editorChat = agents.editor.agent.chat();
        let editorContent = "";

        const editorStream = await editorChat
            .prompt(
                `Review and improve the following article. Provide the final polished version with a quality score (1-10):\n\n${results.draft}`
            )
            .stream();

        await new Promise<void>((resolve, reject) => {
            editorStream.on(TLLMEvent.Content, (content: string) => {
                editorContent += content;
                sendEvent({
                    type: "agent_content",
                    data: { agent: "editor", content },
                });
            });

            editorStream.on(TLLMEvent.End, () => {
                results.final = editorContent;
                sendEvent({
                    type: "agent_complete",
                    data: { agent: "editor", status: "completed" },
                });
                resolve();
            });

            editorStream.on(TLLMEvent.Error, (error: unknown) => {
                reject(error);
            });
        });
    } catch (error) {
        sendEvent({
            type: "agent_error",
            data: {
                agent: "editor",
                error: error instanceof Error ? error.message : "Editing failed",
            },
        });
        throw error;
    }

    return results;
}

export async function POST(request: NextRequest) {
    try {
        const { topic, sessionId } = await request.json();

        if (!topic || !sessionId) {
            return new Response(JSON.stringify({ error: "Topic and sessionId are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const encoder = new TextEncoder();
        const agents = createAgents(sessionId);

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

                const sendEvent = (event: object) => {
                    safeEnqueue(`data: ${JSON.stringify(event)}\n\n`);
                };

                try {
                    // Send workflow start
                    sendEvent({
                        type: "workflow_start",
                        data: {
                            topic,
                            agents: Object.entries(agents).map(([key, val]) => ({
                                id: key,
                                role: val.role,
                                emoji: val.emoji,
                            })),
                        },
                    });

                    // Run the workflow
                    await runWorkflow(topic, agents, sendEvent);

                    // Send workflow complete
                    sendEvent({ type: "workflow_complete" });
                } catch (error) {
                    sendEvent({
                        type: "workflow_error",
                        data: { error: error instanceof Error ? error.message : "Workflow failed" },
                    });
                } finally {
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
