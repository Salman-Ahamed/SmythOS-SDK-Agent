import { Agent } from "@smythos/sdk";
import { NextRequest, NextResponse } from "next/server";

/**
 * Practice 01: Basic Chat API Route
 * Based on sre/examples/01-agent-code-skill/03-chat.ts
 *
 * Features demonstrated:
 * - Creating an Agent with name, behavior, and model
 * - Adding a skill to the agent
 * - Using agent.chat() for conversation
 * - Agent memory within a session
 *
 * Using OpenAI gpt-4o-mini (cheapest and fastest)
 */

// Store chat sessions in memory (for demo purposes)
// In production, you'd want to use a database or Redis
const chatSessions = new Map<string, ReturnType<Agent["chat"]>>();
const agents = new Map<string, Agent>();

function getOrCreateAgent(sessionId: string): Agent {
    if (!agents.has(sessionId)) {
        // Create a new agent - using OpenAI gpt-4o-mini (cheapest)
        const agent = new Agent({
            name: "CryptoMarket Assistant",
            behavior:
                "You are a crypto price tracker. You are given a coin id and you need to get the price of the coin in USD. Be concise.",
            // Using gpt-4o-mini - cheapest and fastest OpenAI model
            model: "gpt-4o-mini",
        });

        // Add the Price skill - same as 03-chat.ts example
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
        // Create a chat session - same as 03-chat.ts
        // The chat remembers conversation within the session
        const chat = agent.chat();
        chatSessions.set(sessionId, chat);
    }

    return chatSessions.get(sessionId)!;
}

export async function POST(request: NextRequest) {
    try {
        const { message, sessionId } = await request.json();

        if (!message || !sessionId) {
            return NextResponse.json({ error: "Message and sessionId are required" }, { status: 400 });
        }

        // Get or create chat session
        const chat = getOrCreateChat(sessionId);

        // Send message and get response - same as 03-chat.ts
        // const chatResult = await chat.prompt('Hi, my name is John...');
        const response = await chat.prompt(message);

        return NextResponse.json({ response });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
