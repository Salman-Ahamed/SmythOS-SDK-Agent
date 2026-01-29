import { Agent, TLLMEvent } from "@smythos/sdk";
import { NextRequest } from "next/server";

/**
 * Practice 09: GitHub Assistant API Route
 *
 * Features demonstrated:
 * - Multiple REST API skills
 * - GitHub API integration
 * - Real-world API handling
 * - Data formatting and presentation
 */

const agents = new Map<string, Agent>();
const chatSessions = new Map<string, ReturnType<Agent["chat"]>>();

// GitHub API helper
async function githubFetch(endpoint: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "SmythOS-SDK-Agent",
  };

  // Add auth token if available (increases rate limit from 60 to 5000 req/hr)
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com${endpoint}`, { headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `GitHub API error: ${response.status}`);
  }

  return response.json();
}

function getOrCreateAgent(sessionId: string): Agent {
  if (!agents.has(sessionId)) {
    const agent = new Agent({
      id: `github-assistant-${sessionId}`,
      name: "GitHub Assistant",
      behavior: `You are a helpful GitHub assistant. You can:
        - Get repository information (stars, forks, description)
        - List issues and pull requests
        - Search for repositories
        - Get user profiles
        - View file contents
        
        Always format your responses nicely using markdown.
        When showing repository info, include relevant stats.
        When listing issues/PRs, show the most important ones.
        Be concise but informative.`,
      model: "gpt-4o-mini",
    });

    // Skill 1: Get Repository Info
    agent.addSkill({
      name: "GetRepoInfo",
      description: "Get detailed information about a GitHub repository including stars, forks, description, and more",
      process: async ({ owner, repo }: { owner: string; repo: string }) => {
        try {
          const data = await githubFetch(`/repos/${owner}/${repo}`);
          return {
            name: data.full_name,
            description: data.description,
            stars: data.stargazers_count,
            forks: data.forks_count,
            watchers: data.watchers_count,
            language: data.language,
            topics: data.topics,
            open_issues: data.open_issues_count,
            license: data.license?.name,
            created_at: data.created_at,
            updated_at: data.updated_at,
            homepage: data.homepage,
            default_branch: data.default_branch,
          };
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Failed to get repo info" };
        }
      },
    });

    // Skill 2: List Issues
    agent.addSkill({
      name: "ListIssues",
      description: "List issues in a repository. Can filter by state (open, closed, all)",
      process: async ({ owner, repo, state = "open", limit = 10 }: { owner: string; repo: string; state?: string; limit?: number }) => {
        try {
          const data = await githubFetch(`/repos/${owner}/${repo}/issues?state=${state}&per_page=${limit}`);
          return data
            .filter((issue: { pull_request?: unknown }) => !issue.pull_request) // Filter out PRs
            .map((issue: { number: number; title: string; state: string; user: { login: string }; labels: { name: string }[]; created_at: string; comments: number }) => ({
              number: issue.number,
              title: issue.title,
              state: issue.state,
              author: issue.user.login,
              labels: issue.labels.map((l) => l.name),
              created_at: issue.created_at,
              comments: issue.comments,
            }));
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Failed to list issues" };
        }
      },
    });

    // Skill 3: List Pull Requests
    agent.addSkill({
      name: "ListPullRequests",
      description: "List pull requests in a repository. Can filter by state (open, closed, all)",
      process: async ({ owner, repo, state = "open", limit = 10 }: { owner: string; repo: string; state?: string; limit?: number }) => {
        try {
          const data = await githubFetch(`/repos/${owner}/${repo}/pulls?state=${state}&per_page=${limit}`);
          return data.map((pr: { number: number; title: string; state: string; user: { login: string }; created_at: string; draft: boolean; head: { ref: string }; base: { ref: string } }) => ({
            number: pr.number,
            title: pr.title,
            state: pr.state,
            author: pr.user.login,
            created_at: pr.created_at,
            draft: pr.draft,
            head: pr.head.ref,
            base: pr.base.ref,
          }));
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Failed to list PRs" };
        }
      },
    });

    // Skill 4: Get User Profile
    agent.addSkill({
      name: "GetUserProfile",
      description: "Get a GitHub user's profile information",
      process: async ({ username }: { username: string }) => {
        try {
          const data = await githubFetch(`/users/${username}`);
          return {
            login: data.login,
            name: data.name,
            bio: data.bio,
            company: data.company,
            location: data.location,
            blog: data.blog,
            public_repos: data.public_repos,
            public_gists: data.public_gists,
            followers: data.followers,
            following: data.following,
            created_at: data.created_at,
            avatar_url: data.avatar_url,
          };
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Failed to get user profile" };
        }
      },
    });

    // Skill 5: Search Repositories
    agent.addSkill({
      name: "SearchRepositories",
      description: "Search for repositories on GitHub by keywords, language, or topic",
      process: async ({ query, limit = 5 }: { query: string; limit?: number }) => {
        try {
          const data = await githubFetch(`/search/repositories?q=${encodeURIComponent(query)}&per_page=${limit}&sort=stars`);
          return data.items.map((repo: { full_name: string; description: string; stargazers_count: number; language: string; topics: string[] }) => ({
            name: repo.full_name,
            description: repo.description,
            stars: repo.stargazers_count,
            language: repo.language,
            topics: repo.topics?.slice(0, 5),
          }));
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Failed to search repos" };
        }
      },
    });

    // Skill 6: Get File Contents
    agent.addSkill({
      name: "GetFileContents",
      description: "Get the contents of a file from a repository. Useful for reading README, package.json, etc.",
      process: async ({ owner, repo, path }: { owner: string; repo: string; path: string }) => {
        try {
          const data = await githubFetch(`/repos/${owner}/${repo}/contents/${path}`);
          if (data.type !== "file") {
            return { error: "Path is not a file" };
          }
          const content = Buffer.from(data.content, "base64").toString("utf-8");
          // Limit content size
          return {
            path: data.path,
            size: data.size,
            content: content.length > 3000 ? content.slice(0, 3000) + "\n...(truncated)" : content,
          };
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Failed to get file" };
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
    const chat = agent.chat({ id: `chat-github-${sessionId}`, persist: false });
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

          streamResult.on(TLLMEvent.ToolCall, (toolCall: { tool?: { name?: string } }) => {
            if (toolCall?.tool?.name) {
              safeEnqueue(
                `data: ${JSON.stringify({ type: "tool_call", data: { name: toolCall.tool.name } })}\n\n`
              );
            }
          });

          streamResult.on(TLLMEvent.ToolResult, () => {
            safeEnqueue(`data: ${JSON.stringify({ type: "tool_result" })}\n\n`);
          });

          streamResult.on(TLLMEvent.End, () => {
            safeEnqueue(`data: ${JSON.stringify({ type: "end" })}\n\n`);
            safeClose();
          });

          streamResult.on(TLLMEvent.Error, (error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : "GitHub API error";
            safeEnqueue(`data: ${JSON.stringify({ type: "error", data: errorMessage })}\n\n`);
            safeClose();
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to process request";
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
