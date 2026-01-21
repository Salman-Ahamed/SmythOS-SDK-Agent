# SmythOS SDK Practice Project - Cursor Context

> এই file টি অন্য device এ Cursor এ দিলে full context পাবে এবং কাজ continue করতে পারবে।

## Project Overview

এটি একটি **Next.js** project যেখানে **SmythOS SDK** এর chat-related examples practice করা হচ্ছে। মূল উদ্দেশ্য হলো `sre/examples` folder এর examples গুলো Next.js app হিসেবে implement করা।

### Project Location
```
d:\codes\work\smyth-os\projects\sdk-agent
```

### Reference Examples Location
```
d:\codes\work\smyth-os\sre\examples\01-agent-code-skill\
```

---

## Current Status

### Completed Examples (3/6+)

| # | Example | Source File | Status | Route |
|---|---------|-------------|--------|-------|
| 01 | Basic Chat | `03-chat.ts` | ✅ Done | `/practice/01-basic-chat` |
| 02 | Streaming Chat | `03.1-chat-streaming.ts` | ✅ Done | `/practice/02-streaming-chat` |
| 03 | Persistent Chat | `04-chat-interactive-persistent.ts` | ✅ Done | `/practice/03-persistent-chat` |

### Pending Examples

| # | Example | Source File | Status | Notes |
|---|---------|-------------|--------|-------|
| 04 | Planner Coder | `04.1-chat-planner-coder.ts` | ⏳ Pending | Planner mode with coder |
| 05 | MCP Integration | `05-mcp.ts` | ⏳ Pending | Model Context Protocol |
| 06 | Attachment Handling | `06-*.ts` | ⏳ Pending | File/image attachments |
| 07 | Vector Storage | `10-llm-storage-vectors.ts` | ⏳ Pending | Vector embeddings |

---

## Project Structure

```
sdk-agent/
├── src/
│   └── app/
│       ├── practice/
│       │   ├── page.tsx                    # Index page - lists all examples
│       │   ├── 01-basic-chat/
│       │   │   └── page.tsx                # Basic chat UI
│       │   ├── 02-streaming-chat/
│       │   │   └── page.tsx                # Streaming chat UI (SSE)
│       │   └── 03-persistent-chat/
│       │       └── page.tsx                # Persistent chat UI
│       └── api/
│           └── practice/
│               ├── 01-basic-chat/
│               │   └── route.ts            # Basic chat API
│               ├── 02-streaming-chat/
│               │   └── route.ts            # Streaming API (SSE)
│               └── 03-persistent-chat/
│                   └── route.ts            # Persistent chat API
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

### 4. Styling
- Tailwind CSS
- Different color themes per example:
  - 01: Indigo/Purple
  - 02: Cyan/Teal
  - 03: Purple/Pink

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

export async function POST(request: NextRequest) {
  const { message, sessionId } = await request.json();
  const chat = getOrCreateChat(sessionId);
  
  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;
      const safeEnqueue = (data: string) => { /* safe enqueue */ };
      const safeClose = () => { /* safe close */ };
      
      const streamResult = await chat.prompt(message).stream();
      
      streamResult.on(TLLMEvent.Content, (content) => { /* handle */ });
      streamResult.on(TLLMEvent.ToolCall, (toolCall) => { /* handle */ });
      streamResult.on(TLLMEvent.ToolResult, (result) => { /* handle */ });
      streamResult.on(TLLMEvent.End, () => { safeClose(); });
      streamResult.on(TLLMEvent.Error, (error) => { /* handle */ });
    },
  });
  
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
```

### Frontend Streaming Pattern
```typescript
"use client";

const streamingContentRef = useRef("");

const sendMessage = async () => {
  streamingContentRef.current = "";
  
  const response = await fetch("/api/practice/XX-example", {
    method: "POST",
    body: JSON.stringify({ message, sessionId }),
  });
  
  const reader = response.body?.getReader();
  
  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");
    
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const event = JSON.parse(line.slice(6));
        
        switch (event.type) {
          case "content":
            streamingContentRef.current += event.data;
            setMessages((prev) => {
              // Create NEW object to trigger re-render
              return [...prev.slice(0, -1), { ...lastMsg, content: streamingContentRef.current }];
            });
            break;
          // ... other cases
        }
      }
    }
  }
};
```

---

## Known Issues & Solutions

### 1. Streaming State Update Issue
**Problem**: Text duplicating (e.g., "TheThe currentcurrent")
**Solution**: Use `useRef` to accumulate content, then create new object in `setMessages`

### 2. Controller Already Closed Error
**Problem**: `TypeError: Invalid state: Controller is already closed`
**Solution**: Add `isClosed` flag and `safeEnqueue`/`safeClose` helpers

### 3. Rate Limiting
**Problem**: Groq/OpenAI rate limits
**Solution**: Use smaller models (`gpt-4o-mini`, `llama-3.1-8b-instant`)

---

## Next Steps (Priority Order)

### 1. Add Example 04: Planner Coder
- Source: `04.1-chat-planner-coder.ts`
- Features: Planner mode, code generation
- Create: 
  - `/practice/04-planner-chat/page.tsx`
  - `/api/practice/04-planner-chat/route.ts`

### 2. Add Example 05: MCP Integration
- Source: `05-mcp.ts`
- Features: Model Context Protocol

### 3. Add Example 06: Attachment Handling
- Source: `06-handle-attachment-with-agent-llm.ts`, `06-handle-attachment-with-agent-skill.ts`
- Features: Image/file attachments

### 4. Update Practice Index Page
- Update `/practice/page.tsx` with new examples

---

## Environment Setup

### Required Environment Variables
```env
OPENAI_API_KEY=sk-...
# Optional alternatives:
GROQ_API_KEY=gsk_...
```

### Run Development Server
```bash
cd d:\codes\work\smyth-os\projects\sdk-agent
bun dev
# or npm run dev
```

### Access
- Practice Index: `http://localhost:3000/practice`
- Basic Chat: `http://localhost:3000/practice/01-basic-chat`
- Streaming Chat: `http://localhost:3000/practice/02-streaming-chat`
- Persistent Chat: `http://localhost:3000/practice/03-persistent-chat`

---

## Reference Files

### SRE Examples to Study
```
d:\codes\work\smyth-os\sre\examples\01-agent-code-skill\
├── 03-chat.ts                      # ✅ Implemented as 01
├── 03.1-chat-streaming.ts          # ✅ Implemented as 02
├── 04-chat-interactive-persistent.ts # ✅ Implemented as 03
├── 04.1-chat-planner-coder.ts      # ⏳ Next to implement
├── 05-mcp.ts                       # ⏳ Pending
├── 06-handle-attachment-*.ts       # ⏳ Pending
└── 10-llm-storage-vectors.ts       # ⏳ Pending
```

---

## How to Continue

1. Open this project in Cursor
2. Read the pending example source file (e.g., `04.1-chat-planner-coder.ts`)
3. Create API route in `/api/practice/04-planner-chat/route.ts`
4. Create frontend page in `/practice/04-planner-chat/page.tsx`
5. Update `/practice/page.tsx` to add new example to list
6. Test at `http://localhost:3000/practice/04-planner-chat`

---

*Last Updated: January 2026*
*Context for: SmythOS SDK Practice Project*
