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

## Example Ranking (Complexity Order)

নিচে সব chat-related examples গুলো **সরল থেকে জটিল** ক্রমে সাজানো হয়েছে:

| Rank | Example File | Features | Complexity | Lines | Best For | Status |
|:----:|--------------|----------|:----------:|:-----:|----------|:------:|
| 1 | `03-chat.ts` | 3 | ⭐ | 39 | Beginners, quick test | ✅ Done |
| 2 | `03.1-chat-streaming.ts` | 5 | ⭐⭐ | 53 | Learning streaming | ✅ Done |
| 3 | `04-chat-interactive-persistent.ts` | 8 | ⭐⭐⭐ | 134 | Production chat app | ✅ Done |
| 4 | `04-chat-with-local-model.ts` | 9 | ⭐⭐⭐ | 158 | Local model usage | ⏳ Pending |
| 5 | `02-opentelemetry-chat-interactive.ts` | 9 | ⭐⭐⭐ | 151 | Monitoring & observability | ⏳ Pending |
| 6 | `04.1-chat-planner-coder.ts` | 15+ | ⭐⭐⭐⭐⭐ | 619 | Advanced workflows | ⏳ Pending |

### Detailed Feature Breakdown

#### 1. `03-chat.ts` - Basic Chat (⭐ সবচেয়ে সরল)
```
Lines: 39 | Features: 3
```
**কী শেখা যাবে:**
- Agent তৈরি করা (name, behavior, model)
- একটি Skill যোগ করা
- `agent.chat()` দিয়ে conversation করা
- Agent memory (session এ remember করে)

**Code Pattern:**
```typescript
const agent = new Agent({
  name: 'CryptoMarket Assistant',
  behavior: 'You are a crypto price tracker...',
  model: 'gpt-4o',
});
agent.addSkill({ name: 'Price', process: async ({ coin_id }) => { ... } });
const chat = agent.chat();
const response = await chat.prompt('Hi, my name is John...');
```

---

#### 2. `03.1-chat-streaming.ts` - Streaming Chat (⭐⭐)
```
Lines: 53 | Features: 5
```
**কী শেখা যাবে:**
- Real-time streaming responses
- Event handlers: `TLLMEvent.Content`, `TLLMEvent.End`, `TLLMEvent.Error`
- Tool call events: `TLLMEvent.ToolCall`, `TLLMEvent.ToolResult`
- Character-by-character output

**Code Pattern:**
```typescript
const streamResult = await chat.prompt('...').stream();
streamResult.on(TLLMEvent.Content, (content) => process.stdout.write(content));
streamResult.on(TLLMEvent.ToolCall, (toolCall) => console.log(toolCall));
streamResult.on(TLLMEvent.End, () => console.log('Done'));
```

---

#### 3. `04-chat-interactive-persistent.ts` - Persistent Chat (⭐⭐⭐)
```
Lines: 134 | Features: 8
```
**কী শেখা যাবে:**
- Agent ID দিয়ে persistence enable করা
- `agent.chat({ id: '...', persist: true })`
- Multiple skills (SearchCoin, Price, MarketData)
- Interactive readline interface
- Data isolation per agent

**Code Pattern:**
```typescript
const agent = new Agent({
  id: 'crypto-market-assistant',  // Required for persistence!
  name: 'CryptoMarket Assistant',
  ...
});
agent.addSkill({ name: 'SearchCoin', ... });
agent.addSkill({ name: 'Price', ... });
agent.addSkill({ name: 'MarketData', ... });
const chat = agent.chat({ id: 'my-chat-0001', persist: true });
```

---

#### 4. `04-chat-with-local-model.ts` - Local Model (⭐⭐⭐)
```
Lines: 158 | Features: 9
```
**কী শেখা যাবে:**
- Local model integration (Ollama, LMStudio, etc.)
- Custom model configuration
- Offline-capable AI
- Model.Local() usage

**Code Pattern:**
```typescript
const agent = new Agent({
  name: 'Local Assistant',
  model: Model.Local('llama3.2'),  // Or any local model
  ...
});
```

---

#### 5. `02-opentelemetry-chat-interactive.ts` - Observability (⭐⭐⭐)
```
Lines: 151 | Features: 9
```
**কী শেখা যাবে:**
- OpenTelemetry integration
- Tracing and monitoring
- Performance metrics
- Debugging production apps
- Span creation and context

**Code Pattern:**
```typescript
import { trace } from '@opentelemetry/api';
const tracer = trace.getTracer('my-app');
// Agent calls are automatically traced
const span = tracer.startSpan('chat-request');
// ... agent logic
span.end();
```

---

#### 6. `04.1-chat-planner-coder.ts` - Planner Coder (⭐⭐⭐⭐⭐ সবচেয়ে জটিল)
```
Lines: 619 | Features: 15+
```
**কী শেখা যাবে:**
- Planner mode with automatic task decomposition
- Code generation capabilities
- Multi-step workflow execution
- File system operations
- Advanced skill chaining
- Error recovery and retry logic
- Context management across steps

**Code Pattern:**
```typescript
const agent = new Agent({
  name: 'Planner Coder',
  behavior: 'You are an AI that plans and executes coding tasks...',
  planner: true,  // Enable planner mode
  ...
});
agent.addSkill({ name: 'WriteFile', ... });
agent.addSkill({ name: 'ReadFile', ... });
agent.addSkill({ name: 'ExecuteCode', ... });
// Agent will automatically plan multi-step tasks
```

---

## Current Implementation Status

### Completed Examples (3/6)

| # | Example | Source File | Status | Route |
|---|---------|-------------|--------|-------|
| 01 | Basic Chat | `03-chat.ts` | ✅ Done | `/practice/01-basic-chat` |
| 02 | Streaming Chat | `03.1-chat-streaming.ts` | ✅ Done | `/practice/02-streaming-chat` |
| 03 | Persistent Chat | `04-chat-interactive-persistent.ts` | ✅ Done | `/practice/03-persistent-chat` |

### Pending Examples (3/6)

| # | Example | Source File | Status | Priority |
|---|---------|-------------|--------|----------|
| 04 | Local Model Chat | `04-chat-with-local-model.ts` | ⏳ Pending | Medium |
| 05 | Observability Chat | `02-opentelemetry-chat-interactive.ts` | ⏳ Pending | Medium |
| 06 | Planner Coder | `04.1-chat-planner-coder.ts` | ⏳ Pending | High (most complex) |

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
  - 01 Basic Chat: Indigo/Purple gradient
  - 02 Streaming Chat: Cyan/Teal gradient
  - 03 Persistent Chat: Purple/Pink gradient

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

### 1. Add Example 04: Local Model Chat
- **Source**: `04-chat-with-local-model.ts`
- **Features**: Local model (Ollama), offline capable
- **Create**:
  - `/practice/04-local-model/page.tsx`
  - `/api/practice/04-local-model/route.ts`

### 2. Add Example 05: Observability Chat
- **Source**: `02-opentelemetry-chat-interactive.ts`
- **Features**: OpenTelemetry, tracing, monitoring

### 3. Add Example 06: Planner Coder (Most Complex)
- **Source**: `04.1-chat-planner-coder.ts`
- **Features**: Planner mode, code generation, multi-step workflows

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

## How to Continue

1. Open this project in Cursor
2. Provide this `CURSOR_CONTEXT.md` file to Cursor AI
3. Read the pending example source file (e.g., `04-chat-with-local-model.ts`)
4. Create API route in `/api/practice/04-local-model/route.ts`
5. Create frontend page in `/practice/04-local-model/page.tsx`
6. Update `/practice/page.tsx` to add new example to list
7. Test at `http://localhost:3000/practice/04-local-model`

---

## Reference Files

### SRE Examples Location
```
d:\codes\work\smyth-os\sre\examples\01-agent-code-skill\
├── 03-chat.ts                              # ✅ Implemented as 01
├── 03.1-chat-streaming.ts                  # ✅ Implemented as 02
├── 04-chat-interactive-persistent.ts       # ✅ Implemented as 03
├── 04-chat-with-local-model.ts             # ⏳ Next to implement
├── 02-opentelemetry-chat-interactive.ts    # ⏳ Pending
└── 04.1-chat-planner-coder.ts              # ⏳ Most complex, last
```

---

*Last Updated: January 23, 2026*
*Context for: SmythOS SDK Practice Project*
