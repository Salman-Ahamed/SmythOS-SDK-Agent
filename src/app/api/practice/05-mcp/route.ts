import { Agent, MCPTransport } from "@smythos/sdk";
import { NextRequest, NextResponse } from "next/server";

/**
 * Practice 05: MCP Integration API Route
 * Based on sre/examples/01-agent-code-skill/05-mcp.ts
 *
 * Features demonstrated:
 * - Exposing an Agent as an MCP (Model Context Protocol) server
 * - Using agent.mcp() with SSE transport
 * - Defining skill inputs with skill.in() for better MCP discovery
 */

// Keep track of the MCP server status
let mcpServerUrl: string | null = null;
let agentInstance: Agent | null = null;

function getOrCreateAgent() {
  if (!agentInstance) {
    const agent = new Agent({
      name: "CryptoMarket Assistant",
      behavior: "You are a crypto price tracker. You are given a coin id and you need to get the price of the coin in USD",
      model: "gpt-4o-mini",
    });

    const skill = agent.addSkill({
      name: "Price",
      description: "Use this skill to get the price of a cryptocurrency",
      process: async ({ coin_id }: { coin_id: string }) => {
        const url = `https://api.coingecko.com/api/v3/coins/${coin_id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
        const response = await fetch(url);
        const data = await response.json();
        return data.market_data?.current_price || "Price data not available";
      },
    });

    // Describe the input parameters for the skill using skill.in() method
    // This is important for MCP so the client knows what arguments to send
    skill.in({
      coin_id: {
        type: "Text",
        description: "The id of the coin to get the price of (e.g., 'bitcoin', 'ethereum')",
      },
    });

    agentInstance = agent;
  }
  return agentInstance;
}

export async function GET() {
  return NextResponse.json({
    status: mcpServerUrl ? "running" : "stopped",
    url: mcpServerUrl
  });
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === "start") {
      if (mcpServerUrl) {
        return NextResponse.json({
          message: "MCP server already running",
          url: mcpServerUrl
        });
      }

      const agent = getOrCreateAgent();

      // Run the agent as an MCP server on port 3399
      // Note: In a real Next.js app, this might be tricky in serverless environments,
      // but works fine for local development practice.
      mcpServerUrl = await agent.mcp(MCPTransport.SSE, 3399);

      console.log(`MCP server started on ${mcpServerUrl}`);

      return NextResponse.json({
        message: "MCP server started successfully",
        url: mcpServerUrl
      });
    }

    if (action === "stop") {
      // The SDK doesn't currently expose a direct 'stop' on the agent's mcp return if we just use the shorthand
      // but we can manage the server URL state here.
      // In a real scenario, you'd want to close the express server.
      mcpServerUrl = null;
      return NextResponse.json({ message: "MCP server stopped (state cleared)" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("MCP Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
