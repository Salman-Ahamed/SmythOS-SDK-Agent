import { Agent, TLLMEvent } from "@smythos/sdk";
import { NextRequest } from "next/server";

/**
 * Practice 03: Interactive Persistent Chat API Route
 * Based on sre/examples/01-agent-code-skill/04-chat-interactive-persistent.ts
 *
 * Features demonstrated:
 * - Agent with ID for persistence
 * - Chat persistence with persist: true
 * - Multiple skills (SearchCoin, Price, MarketData)
 * - Streaming responses
 *
 * Using OpenAI gpt-4o-mini (cheapest and fastest)
 */

// Store chat sessions in memory
const chatSessions = new Map<string, ReturnType<Agent["chat"]>>();
const agents = new Map<string, Agent>();

function getOrCreateAgent(sessionId: string): Agent {
  if (!agents.has(sessionId)) {
    // Create a new agent with ID for persistence - as shown in 04-chat-interactive-persistent.ts
    const agent = new Agent({
      // IMPORTANT: id is required for persistence
      id: `crypto-assistant-${sessionId}`,
      name: "CryptoMarket Assistant",
      behavior:
        "You are a crypto price tracker. You can search for coins, get prices, and provide market data. Be concise and helpful.",
      model: "gpt-4o-mini",
    });

    // Skill 1: SearchCoin - search for cryptocurrencies by name
    agent.addSkill({
      name: "SearchCoin",
      description: "Use this skill to search for a cryptocurrency by name",
      process: async ({ search_term }: { search_term: string }) => {
        const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(search_term)}`;
        const response = await fetch(url);
        const data = await response.json();
        // Return simplified results
        return (
          data.coins?.slice(0, 5).map((coin: { id: string; name: string; symbol: string }) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
          })) || []
        );
      },
    });

    // Skill 2: Price - get the current price of a cryptocurrency
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

    // Skill 3: MarketData - get comprehensive market statistics
    agent.addSkill({
      name: "MarketData",
      description: "Use this skill to get comprehensive market data and statistics for a cryptocurrency",
      process: async ({ coin_id }: { coin_id: string }) => {
        const url = `https://api.coingecko.com/api/v3/coins/${coin_id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
        const response = await fetch(url);
        const data = await response.json();
        // Return relevant market data
        return {
          name: data.name,
          symbol: data.symbol,
          current_price: data.market_data?.current_price?.usd,
          market_cap: data.market_data?.market_cap?.usd,
          price_change_24h: data.market_data?.price_change_percentage_24h,
          high_24h: data.market_data?.high_24h?.usd,
          low_24h: data.market_data?.low_24h?.usd,
          total_volume: data.market_data?.total_volume?.usd,
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
    // Create a persistent chat session - as shown in 04-chat-interactive-persistent.ts
    // Using persist: true for data persistence
    const chat = agent.chat({ id: `chat-${sessionId}`, persist: true });
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

          streamResult.on(TLLMEvent.ToolCall, (toolCall: unknown) => {
            const tc = toolCall as { tool?: { name?: string; arguments?: unknown } };
            safeEnqueue(
              `data: ${JSON.stringify({
                type: "tool_call",
                data: {
                  name: tc?.tool?.name,
                  arguments: tc?.tool?.arguments,
                },
              })}\n\n`
            );
          });

          streamResult.on(TLLMEvent.ToolResult, (toolResult: unknown) => {
            const tr = toolResult as { result?: unknown };
            safeEnqueue(`data: ${JSON.stringify({ type: "tool_result", data: tr?.result })}\n\n`);
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
