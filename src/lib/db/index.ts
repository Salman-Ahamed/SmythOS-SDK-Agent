import {
    BrainIcon,
    ChartIcon,
    ChatBubbleIcon,
    CodeIcon,
    CubeIcon,
    DatabaseIcon,
    DocumentIcon,
    GitHubOctocatIcon,
    GlobeIcon,
    ImageIcon,
    LinkedInIcon,
    MailIcon,
    PlannerIcon,
    ServerIcon,
    ShieldIcon,
    SparklesIcon,
    StreamIcon,
    WorkflowIcon,
    ZapIcon,
} from "@/components/icons";

import { FooterLinks } from "@/types/data";

// Complexity levels (strict type)
export type ComplexityLevel = 1 | 2 | 3 | 4 | 5;
export type ExampleStatus = "completed" | "in-progress" | "upcoming";

// SmythOS SDK Examples Data
export const sdkExamples = [
    {
        id: "01",
        slug: "01-basic-chat",
        title: "Basic Chat",
        description: "Learn the fundamentals of creating an AI agent with simple chat functionality.",
        complexity: 1 as ComplexityLevel,
        features: ["Agent Creation", "Skill Integration", "Chat API", "Memory"],
        sourceFile: "01-agent-code-skill/03-chat.ts",
        icon: ChatBubbleIcon,
        gradient: "from-indigo-500 to-purple-500",
        status: "completed" as ExampleStatus,
        featured: true,
    },
    {
        id: "02",
        slug: "02-streaming-chat",
        title: "Streaming Chat",
        description: "Real-time streaming responses with Server-Sent Events (SSE).",
        complexity: 2 as ComplexityLevel,
        features: ["SSE Streaming", "Event Handlers", "Real-time UI", "TLLMEvent"],
        sourceFile: "01-agent-code-skill/03.1-chat-streaming.ts",
        icon: StreamIcon,
        gradient: "from-cyan-500 to-teal-500",
        status: "completed" as ExampleStatus,
        featured: true,
    },
    {
        id: "03",
        slug: "03-persistent-chat",
        title: "Persistent Chat",
        description: "Chat sessions with memory persistence across conversations.",
        complexity: 3 as ComplexityLevel,
        features: ["Session Persistence", "Multiple Skills", "Data Isolation", "Agent ID"],
        sourceFile: "01-agent-code-skill/04-chat-interactive-persistent.ts",
        icon: DatabaseIcon,
        gradient: "from-purple-500 to-pink-500",
        status: "completed" as ExampleStatus,
        featured: false,
    },
    {
        id: "04",
        slug: "04-local-model",
        title: "Local Model",
        description: "Run AI agents with local models like Ollama for offline capability.",
        complexity: 3 as ComplexityLevel,
        features: ["Ollama Integration", "Offline AI", "Custom Models", "Model.Local()"],
        sourceFile: "12-local-models/01-ollama-chat.ts",
        icon: ServerIcon,
        gradient: "from-orange-500 to-red-500",
        status: "completed" as ExampleStatus,
        featured: false,
    },
    {
        id: "05",
        slug: "05-observability",
        title: "Observability",
        description: "OpenTelemetry integration for tracing, monitoring, and debugging.",
        complexity: 3 as ComplexityLevel,
        features: ["OpenTelemetry", "Tracing", "Metrics", "SRE.init()"],
        sourceFile: "14-observability/02-opentelemetry-chat-interactive.ts",
        icon: ChartIcon,
        gradient: "from-green-500 to-emerald-500",
        status: "completed" as ExampleStatus,
        featured: false,
    },
    {
        id: "06",
        slug: "06-planner-chat",
        title: "Planner Coder",
        description: "Advanced planner mode for multi-step task execution and code generation.",
        complexity: 5 as ComplexityLevel,
        features: ["Planner Mode", "Code Generation", "Multi-step", "Task Board"],
        sourceFile: "01-agent-code-skill/04.1-chat-planner-coder.ts",
        icon: PlannerIcon,
        gradient: "from-violet-500 to-fuchsia-500",
        status: "completed" as ExampleStatus,
        featured: true,
    },
    {
        id: "07",
        slug: "07-image-analyzer",
        title: "Image Analyzer",
        description: "Vision model integration for analyzing and describing images using GPT-4o.",
        complexity: 2 as ComplexityLevel,
        features: ["Vision Model", "Image Upload", "Multimodal", "GPT-4o"],
        sourceFile: "01-agent-code-skill/06-handle-attachment-with-agent-llm.ts",
        icon: ImageIcon,
        gradient: "from-rose-500 to-amber-500",
        status: "completed" as ExampleStatus,
        featured: true,
    },
    {
        id: "08",
        slug: "08-document-qa",
        title: "Document Q&A",
        description: "RAG-based document assistant with vector embeddings and semantic search.",
        complexity: 4 as ComplexityLevel,
        features: ["RAG", "VectorDB", "Embeddings", "Document Parsing"],
        sourceFile: "05-VectorDB-with-agent/01-upsert-and-search.ts",
        icon: DocumentIcon,
        gradient: "from-blue-500 to-cyan-500",
        status: "completed" as ExampleStatus,
        featured: true,
    },
    {
        id: "09",
        slug: "09-github-assistant",
        title: "GitHub Assistant",
        description: "Multi-skill agent with GitHub API integration for repos, issues, and PRs.",
        complexity: 3 as ComplexityLevel,
        features: ["REST API", "Multiple Skills", "GitHub API", "Data Formatting"],
        sourceFile: "Custom implementation",
        icon: GitHubOctocatIcon,
        gradient: "from-gray-600 to-gray-800",
        status: "completed" as ExampleStatus,
        featured: false,
    },
    {
        id: "10",
        slug: "10-multi-agent",
        title: "Multi-Agent Workflow",
        description: "Orchestrate multiple specialized agents working together on complex tasks.",
        complexity: 5 as ComplexityLevel,
        features: ["Multi-Agent", "Orchestration", "Sequential Workflow", "WebSearch"],
        sourceFile: "03-agent-workflow-components/01-workflow.ts",
        icon: WorkflowIcon,
        gradient: "from-purple-500 to-pink-500",
        status: "completed" as ExampleStatus,
        featured: true,
    },
];

// Featured examples for home page (subset of sdkExamples)
export const featuredExamples = sdkExamples.filter((example) => example.featured);

// SDK Capabilities/Features
export const features = [
    {
        icon: BrainIcon,
        title: "Intelligent Agents",
        description:
            "Create AI agents with custom behaviors, personalities, and domain expertise using simple configuration.",
    },
    {
        icon: SparklesIcon,
        title: "Skill System",
        description:
            "Extend agent capabilities with custom skills - from API calls to complex business logic.",
    },
    {
        icon: StreamIcon,
        title: "Real-time Streaming",
        description:
            "Stream responses in real-time with event handlers for content, tool calls, and errors.",
    },
    {
        icon: DatabaseIcon,
        title: "Persistent Memory",
        description:
            "Enable agents to remember conversations across sessions with built-in persistence.",
    },
    {
        icon: ChartIcon,
        title: "Observability",
        description:
            "Built-in OpenTelemetry support for tracing, metrics, and debugging your AI applications.",
    },
    {
        icon: ShieldIcon,
        title: "Enterprise Ready",
        description:
            "Production-grade SDK with access control, security, and scalability built-in.",
    },
];

// Terminal commands for SDK setup
export const terminalCommands = [
    { command: "npm install @smythos/sdk", description: "Install SmythOS SDK" },
    { command: "import { Agent } from '@smythos/sdk'", description: "Import Agent class" },
    { command: "const agent = new Agent({ name: 'My Agent', model: 'gpt-4o' })", description: "Create agent" },
    { command: "agent.addSkill({ name: 'Search', process: async (q) => {...} })", description: "Add skills" },
    { command: "const chat = agent.chat()", description: "Start chat session" },
    { command: "const response = await chat.prompt('Hello!')", description: "Send message" },
];

// SDK Stats
export const sdkStats = [
    { value: "10", label: "Practice Examples", suffix: "" },
    { value: "15", label: "SDK Features", suffix: "+" },
    { value: "100", label: "Type Safe", suffix: "%" },
];

// Technology stack
export const techStack = [
    { name: "Next.js 15", icon: CubeIcon },
    { name: "SmythOS SDK", icon: BrainIcon },
    { name: "TypeScript", icon: CodeIcon },
    { name: "Tailwind CSS", icon: SparklesIcon },
    { name: "OpenAI", icon: ZapIcon },
    { name: "OpenTelemetry", icon: ChartIcon },
];

export const footerLinks: FooterLinks = {
    quickLinks: [
        { id: 1, name: "Practice Examples", path: "/practice" },
        { id: 2, name: "SmythOS Documentation", path: "https://docs.smythos.com" },
        { id: 3, name: "GitHub Repository", path: "https://github.com/smythos/sre" },
    ],
    resources: [
        { id: 1, name: "Next.js Docs", path: "https://nextjs.org/docs" },
        { id: 2, name: "TypeScript Docs", path: "https://www.typescriptlang.org/docs" },
        { id: 3, name: "OpenAI API", path: "https://platform.openai.com/docs" },
        { id: 4, name: "OpenTelemetry", path: "https://opentelemetry.io/docs/" },
    ],
    contact: [
        {
            id: 1,
            name: "GitHub",
            Icon: GitHubOctocatIcon,
            path: "https://github.com/Salman-Ahamed",
        },
        {
            id: 2,
            name: "LinkedIn",
            Icon: LinkedInIcon,
            path: "https://www.linkedin.com/in/salman-ahamad-as/",
        },
        { id: 3, name: "Portfolio", Icon: GlobeIcon, path: "https://salman-ahamed.vercel.app" },
        { id: 4, name: "Email", Icon: MailIcon, path: "mailto:salman.0210.as@gmail.com" },
    ],
    privacy: [
        { id: 1, name: "SmythOS Platform", path: "https://smythos.com" },
        { id: 2, name: "MIT License", path: "https://github.com/smythos/sre/blob/main/LICENSE" },
    ],
};
