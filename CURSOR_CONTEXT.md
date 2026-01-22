# SmythOS SDK Practice Project - Cursor Context

> এই file টি অন্য device এ Cursor এ দিলে full context পাবে এবং কাজ continue করতে পারবে।

## Project Overview

এটি একটি **Next.js** project যেখানে **SmythOS SDK** এর chat-related examples practice করা হচ্ছে। মূল উদ্দেশ্য হলো `sre/examples` folder এর examples গুলো Next.js app হিসেবে implement করা।

### Project Location
```
/media/salman/NVME/codes/work/smyth-os/projects/sdk-agent
```

### Reference Examples Location
```
/media/salman/NVME/codes/work/smyth-os/sre/examples/01-agent-code-skill/
```

---

## Current Status

### Completed Examples (7/7)

| # | Example | Source File | Status | Route |
|---|---------|-------------|--------|-------|
| 01 | Basic Chat | `03-chat.ts` | ✅ Done | `/practice/01-basic-chat` |
| 02 | Streaming Chat | `03.1-chat-streaming.ts` | ✅ Done | `/practice/02-streaming-chat` |
| 03 | Persistent Chat | `04-chat-interactive-persistent.ts` | ✅ Done | `/practice/03-persistent-chat` |
| 04 | Planner Coder | `04.1-chat-planner-coder.ts` | ✅ Done | `/practice/04-planner-chat` |
| 05 | MCP Integration | `05-mcp.ts` | ✅ Done | `/practice/05-mcp` |
| 06 | Attachment Handling | `06-*.ts` | ✅ Done | `/practice/06-attachments` |
| 07 | Vector Storage | `10-llm-storage-vectors.ts` | ✅ Done | `/practice/07-vector-storage` |

---

## Project Structure

```
sdk-agent/
├── src/
│   └── app/
│       ├── practice/
│       │   ├── page.tsx                    # Index page - lists all examples
│       │   ├── 01-basic-chat/
│       │   ├── 02-streaming-chat/
│       │   ├── 03-persistent-chat/
│       │   ├── 04-planner-chat/
│       │   ├── 05-mcp/                     # New: MCP Server Hosting
│       │   ├── 06-attachments/             # New: Multi-modal Support
│       │   └── 07-vector-storage/          # New: RAG & RAMVectorDB
│       └── api/
│           └── practice/
│               ├── 01-basic-chat/
│               ├── 02-streaming-chat/
│               ├── 03-persistent-chat/
│               ├── 04-planner-chat/
│               ├── 05-mcp/
│               ├── 06-attachments/
│               └── 07-vector-storage/
├── package.json
└── CURSOR_CONTEXT.md                       # এই file
```

---

## Key Technical Decisions

### 1. Model Selection
- **Model**: `gpt-4o-mini` (OpenAI)
- **Reason**: Cheapest & fastest OpenAI model, কম token খরচ
- **Alternative tried**: Groq (free) - rate limit issues ছিল

### 2. Architecture Pattern
- **Frontend**: Client Components (`"use client"`)
- **Backend**: Next.js API Routes (`/api/practice/...`)
- **Streaming**: Server-Sent Events (SSE) via `ReadableStream`

### 3. State Management
- In-memory Maps for session management (demo purposes)
- `streamingContentRef` (useRef) for accumulating streaming content
- Proper React state updates to avoid duplication issues

### 4. Vector Storage
- Used **RAMVectorDB** for the practice project to avoid external dependencies like Pinecone.

---

## Code Patterns

### API Route Pattern (Streaming)
```typescript
import { Agent, TLLMEvent } from "@smythos/sdk";

const agents = new Map<string, Agent>();
const chatSessions = new Map<string, ReturnType<Agent["chat"]>>();

function getOrCreateAgent(sessionId: string): Agent {
  if (!agents.has(sessionId)) {
    const agent = new Agent({
      id: `agent-${sessionId}`,  // Required for persistence
      name: "Agent Name",
      behavior: "Agent behavior description",
      model: "gpt-4o-mini",
    });

    agent.addSkill({
      name: "SkillName",
      description: "Skill description",
      process: async ({ param }) => { /* logic */ },
    });

    agents.set(sessionId, agent);
  }
  return agents.get(sessionId)!;
}
// ... streaming logic using ReadableStream
```

---

## Next Steps

1. **Explore Advanced Workflows**: Port examples from `sre/examples/03-agent-workflow-components/`.
2. **Local Models**: Try integrating with local models using `Ollama` or similar as shown in `sre/examples/12-local-models/`.
3. **Vault Integration**: Practice secret management with `agent.vault`.

---

*Last Updated: January 22, 2026*
*Context for: SmythOS SDK Practice Project*
