# SmythOS SDK Practice

<p align="center">
  <img src="https://img.shields.io/badge/SmythOS-SDK-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyYTEwIDEwIDAgMSAwIDEwIDEwQTEwIDEwIDAgMCAwIDEyIDJ6Ii8+PC9zdmc+" alt="SmythOS SDK" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

<p align="center">
  <strong>Learn to build AI Agents with SmythOS SDK through hands-on examples</strong>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-practice-examples">Examples</a> •
  <a href="#-features">Features</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-environment-setup">Setup</a>
</p>

---

## Overview

This is an interactive learning project for the **SmythOS SDK** - a powerful toolkit for building AI agents. The project provides 6 progressively complex examples, from basic chat to advanced planner-coder workflows.

Each example is a fully working Next.js application with:
- Modern, dark-themed UI
- Real-time streaming responses
- Interactive chat interface
- Source code you can study and modify

---

## Quick Start

### Prerequisites

- **Node.js** 20.9.0 or higher
- **pnpm** (recommended) or npm/yarn/bun
- **API Keys** for LLM providers (OpenAI, Anthropic, Groq, etc.)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/smythos/sdk-agent.git
cd sdk-agent

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API keys

# 4. Start the development server
pnpm dev
```

### Open in Browser

```
http://localhost:3000          # Home page
http://localhost:3000/practice # All practice examples
```

---

## Practice Examples

### Learning Path (Beginner to Advanced)

| # | Example | Complexity | Description | Key Concepts |
|:-:|---------|:----------:|-------------|--------------|
| 01 | **Basic Chat** | ⭐ | Simple chat with crypto price skill | Agent creation, Skills, `agent.chat()` |
| 02 | **Streaming Chat** | ⭐⭐ | Real-time streaming responses | SSE, Event handlers, `TLLMEvent` |
| 03 | **Persistent Chat** | ⭐⭐⭐ | Chat history that persists | Session management, Multiple skills |
| 04 | **Local Model** | ⭐⭐⭐ | Use Ollama/LMStudio models | `Model.Local()`, Offline AI |
| 05 | **Observability** | ⭐⭐⭐ | OpenTelemetry tracing | Monitoring, Debugging, Metrics |
| 06 | **Planner Coder** | ⭐⭐⭐⭐⭐ | AI that plans and executes tasks | Multi-step workflows, Code generation |

### Example Details

#### 01 - Basic Chat
```typescript
const agent = new Agent({
  name: 'CryptoMarket Assistant',
  behavior: 'You are a crypto price tracker...',
  model: 'gpt-4o-mini',
});

agent.addSkill({
  name: 'Price',
  description: 'Get cryptocurrency price',
  process: async ({ coin_id }) => {
    // Fetch price from CoinGecko API
  },
});

const chat = agent.chat();
const response = await chat.prompt('What is the price of Bitcoin?');
```

#### 02 - Streaming Chat
```typescript
const streamResult = await chat.prompt('Tell me about Ethereum').stream();

streamResult.on(TLLMEvent.Content, (content) => {
  process.stdout.write(content); // Real-time output
});

streamResult.on(TLLMEvent.ToolCall, (toolCall) => {
  console.log('Tool called:', toolCall.name);
});

streamResult.on(TLLMEvent.End, () => {
  console.log('Stream complete');
});
```

#### 03 - Persistent Chat
```typescript
const agent = new Agent({
  id: 'crypto-assistant',  // Required for persistence
  name: 'CryptoMarket Assistant',
  model: 'gpt-4o-mini',
});

// Create persistent chat session
const chat = agent.chat({
  id: 'user-session-123',
  persist: true,  // Enable persistence
});
```

#### 04 - Local Model
```typescript
import { Model } from '@smythos/sdk';

const agent = new Agent({
  name: 'Local Assistant',
  model: Model.Local('llama3.2'),  // Uses Ollama
  // or: Model.Local('your-model', { baseUrl: 'http://localhost:1234/v1' })
});
```

#### 05 - Observability
```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('my-app');
const span = tracer.startSpan('chat-request');

// All agent operations are automatically traced
const response = await chat.prompt('Hello');

span.end();
```

#### 06 - Planner Coder
```typescript
const agent = new Agent({
  name: 'Planner Coder',
  behavior: 'You plan and execute coding tasks...',
  planner: true,  // Enable planner mode
});

agent.addSkill({ name: 'WriteFile', ... });
agent.addSkill({ name: 'ReadFile', ... });
agent.addSkill({ name: 'ExecuteCode', ... });

// Agent automatically breaks down complex tasks
const response = await chat.prompt('Create a REST API for user management');
```

---

## Features

### SDK Features Demonstrated

- **Agent Creation** - Configure name, behavior, and model
- **Skills** - Add custom capabilities to agents
- **Streaming** - Real-time token-by-token responses
- **Persistence** - Save and restore chat sessions
- **Local Models** - Use Ollama, LMStudio, or any OpenAI-compatible endpoint
- **Observability** - OpenTelemetry integration for monitoring
- **Planner Mode** - Multi-step task decomposition and execution

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Styling |
| **SmythOS SDK** | AI agent development |
| **Server-Sent Events** | Real-time streaming |

---

## Environment Setup

### Step 1: Create `.env.local`

```bash
cp .env.example .env.local
```

### Step 2: Add API Keys

```env
# Required: At least one LLM provider
OPENAI_API_KEY=sk-proj-xxx...
ANTHROPIC_API_KEY=sk-ant-xxx...
GROQ_API_KEY=gsk_xxx...

# Optional: Additional providers
GOOGLE_AI_API_KEY=
TOGETHER_API_KEY=
XAI_API_KEY=
DEEPSEEK_API_KEY=
TAVILY_API_KEY=
SCRAPFLY_API_KEY=
```

### Step 3: Vault Configuration

The `.smyth/vault.json` file uses environment variable references:

```json
{
  "default": {
    "openai": "$env(OPENAI_API_KEY)",
    "anthropic": "$env(ANTHROPIC_API_KEY)",
    "groq": "$env(GROQ_API_KEY)"
  }
}
```

The SDK automatically resolves `$env(VARIABLE_NAME)` at runtime.

### Getting API Keys

| Provider | Free Tier | Get Key |
|----------|:---------:|---------|
| OpenAI | No | [platform.openai.com](https://platform.openai.com/api-keys) |
| Anthropic | No | [console.anthropic.com](https://console.anthropic.com/) |
| Groq | Yes | [console.groq.com](https://console.groq.com/keys) |
| Google AI | Yes | [aistudio.google.com](https://aistudio.google.com/apikey) |

---

## Project Structure

```
sdk-agent/
├── .smyth/
│   └── vault.json              # API keys vault (uses env vars)
├── src/
│   ├── app/
│   │   ├── page.tsx            # Home page
│   │   ├── practice/
│   │   │   ├── page.tsx        # Practice examples index
│   │   │   ├── 01-basic-chat/
│   │   │   │   └── page.tsx    # Basic chat UI
│   │   │   ├── 02-streaming-chat/
│   │   │   │   └── page.tsx    # Streaming chat UI
│   │   │   ├── 03-persistent-chat/
│   │   │   │   └── page.tsx    # Persistent chat UI
│   │   │   ├── 04-local-model/
│   │   │   │   └── page.tsx    # Local model UI
│   │   │   ├── 05-observability/
│   │   │   │   └── page.tsx    # Observability UI
│   │   │   └── 06-planner-chat/
│   │   │       └── page.tsx    # Planner coder UI
│   │   └── api/
│   │       └── practice/
│   │           ├── 01-basic-chat/
│   │           │   └── route.ts    # Basic chat API
│   │           ├── 02-streaming-chat/
│   │           │   └── route.ts    # Streaming API (SSE)
│   │           ├── 03-persistent-chat/
│   │           │   └── route.ts    # Persistent API
│   │           ├── 04-local-model/
│   │           │   └── route.ts    # Local model API
│   │           ├── 05-observability/
│   │           │   └── route.ts    # Observability API
│   │           └── 06-planner-chat/
│   │               └── route.ts    # Planner API
│   ├── components/             # Shared components
│   ├── lib/                    # Utilities and data
│   └── styles/                 # Global styles
├── .env.local                  # Environment variables (create this)
├── .env.example                # Example env file
└── package.json
```

---

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting

# Maintenance
pnpm clear-cache      # Clear Next.js cache and reinstall
```

---

## Local Model Setup (Example 04)

To use the Local Model example, you need a local LLM server:

### Option 1: Ollama (Recommended)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull llama3.2

# Start Ollama (runs on port 11434)
ollama serve
```

### Option 2: LM Studio

1. Download from [lmstudio.ai](https://lmstudio.ai/)
2. Load any model
3. Start the local server (default: `http://localhost:1234/v1`)

---

## Troubleshooting

### Common Issues

#### "Rate limit exceeded"
- **Solution**: Use a smaller model like `gpt-4o-mini` or switch to Groq (free tier)

#### "API key not found"
- **Solution**: Check `.env.local` has correct keys and restart dev server

#### "Cannot connect to local model"
- **Solution**: Ensure Ollama/LMStudio is running and accessible

#### "Module not found: styled-jsx"
- **Solution**: Remove any `<style jsx>` blocks; use Tailwind CSS instead

#### "OS file watch limit reached" (Linux)
```bash
# Temporary fix
sudo sysctl fs.inotify.max_user_watches=524288

# Permanent fix
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## Learn More

### SmythOS Resources

- [SmythOS Documentation](https://docs.smythos.com)
- [SmythOS SDK Reference](https://docs.smythos.com/sdk)
- [SmythOS GitHub](https://github.com/smythos)

### Technologies Used

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenTelemetry](https://opentelemetry.io/docs/)

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by the SmythOS Team
</p>
