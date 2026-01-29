import {
  BrainIcon,
  ChartIcon,
  ChatBubbleIcon,
  CodeIcon,
  CubeIcon,
  DatabaseIcon,
  GlobeIcon,
  LinkedInIcon,
  MailIcon,
  PlannerIcon,
  ServerIcon,
  ShieldIcon,
  SparklesIcon,
  StreamIcon,
  ZapIcon,
} from "@/components/icons";

import { FooterLinks } from "@/types/data";

// SmythOS SDK Examples Data
export const sdkExamples = [
  {
    id: "01",
    slug: "01-basic-chat",
    title: "Basic Chat",
    description: "Learn the fundamentals of creating an AI agent with simple chat functionality.",
    complexity: 1,
    features: ["Agent Creation", "Skill Integration", "Chat API"],
    icon: ChatBubbleIcon,
    gradient: "from-indigo-500 to-purple-500",
    status: "completed" as const,
  },
  {
    id: "02",
    slug: "02-streaming-chat",
    title: "Streaming Chat",
    description: "Real-time streaming responses with Server-Sent Events (SSE).",
    complexity: 2,
    features: ["SSE Streaming", "Event Handlers", "Real-time UI"],
    icon: StreamIcon,
    gradient: "from-cyan-500 to-teal-500",
    status: "completed" as const,
  },
  {
    id: "03",
    slug: "03-persistent-chat",
    title: "Persistent Chat",
    description: "Chat sessions with memory persistence across conversations.",
    complexity: 3,
    features: ["Session Persistence", "Multiple Skills", "Data Isolation"],
    icon: DatabaseIcon,
    gradient: "from-purple-500 to-pink-500",
    status: "completed" as const,
  },
  {
    id: "04",
    slug: "04-local-model",
    title: "Local Model",
    description: "Run AI agents with local models like Ollama for offline capability.",
    complexity: 3,
    features: ["Ollama Integration", "Offline AI", "Custom Models"],
    icon: ServerIcon,
    gradient: "from-orange-500 to-red-500",
    status: "completed" as const,
  },
  {
    id: "05",
    slug: "05-observability",
    title: "Observability",
    description: "OpenTelemetry integration for tracing, monitoring, and debugging.",
    complexity: 3,
    features: ["OpenTelemetry", "Tracing", "Performance Metrics"],
    icon: ChartIcon,
    gradient: "from-green-500 to-emerald-500",
    status: "completed" as const,
  },
  {
    id: "06",
    slug: "06-planner-chat",
    title: "Planner Coder",
    description: "Advanced planner mode for multi-step task execution and code generation.",
    complexity: 5,
    features: ["Planner Mode", "Code Generation", "Multi-step Workflows"],
    icon: PlannerIcon,
    gradient: "from-violet-500 to-fuchsia-500",
    status: "completed" as const,
  },
];

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
  { value: "6", label: "Practice Examples", suffix: "" },
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

export const author = {
  name: "Salman Ahamed",
  img: "https://avatars.githubusercontent.com/u/96829173?v=4",
  role: "Full-Stack Developer",
  bio: "Full-Stack Developer with 3+ years of experience in building modern web apps using Next.js, TypeScript, and Node.js. Passionate about clean code, performance, and developer experience.",
  social: [
    { id: "1", name: "GitHub", link: "https://github.com/Salman-Ahamed" },
    { id: "2", name: "LinkedIn", link: "https://www.linkedin.com/in/salman-ahamad-as/" },
    { id: "3", name: "Email", link: "mailto:shahriyar.hosen.dev@gmail.com" },
  ],
};

export const teamMembers = [
  {
    name: "Eyachir Arafat",
    img: "https://avatars.githubusercontent.com/u/177961704?v=4",
    role: "Front-End Developer",
    bio: "Crafting beautiful web experiences with React and Next.js. Dedicated to building intuitive interfaces that users love.",
    social: [
      { id: "1", name: "GitHub", link: "https://github.com/EyachirArafat" },
      { id: "2", name: "LinkedIn", link: "https://linkedin.com/in/eyachirarafat" },
      { id: "3", name: "Email", link: "mailto:me.eyachirarafat@gmail.com" },
    ],
  },
  {
    name: "Sheikh Hasibul Alam",
    img: "https://avatars.githubusercontent.com/u/145800508?v=4",
    role: "Front-End Developer",
    bio: "Building modern web applications with React and Next.js. Focused on performance, accessibility, and clean code.",
    social: [
      { id: "1", name: "GitHub", link: "https://github.com/Hashibul-Alam" },
      { id: "2", name: "LinkedIn", link: "https://www.linkedin.com/in/hasibul231/" },
      { id: "3", name: "Email", link: "mailto:sha31417@gmail.com" },
    ],
  },
  {
    name: "Md Amzad Hossain Omor",
    img: "https://avatars.githubusercontent.com/u/139708044?v=4",
    role: "Front-End Developer",
    bio: "Creating responsive web applications with React and Tailwind CSS. Passionate about modern UI/UX design.",
    social: [
      { id: "1", name: "GitHub", link: "https://github.com/mdamzadhossainomor" },
      { id: "2", name: "LinkedIn", link: "https://www.linkedin.com/in/md-amzad-hossain-omor" },
      { id: "3", name: "Email", link: "mailto:mdamzadhossainomor@gmail.com" },
    ],
  },
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
      name: "LinkedIn",
      Icon: LinkedInIcon,
      path: "https://www.linkedin.com/in/salman-ahamad-as/",
    },
    { id: 2, name: "Portfolio", Icon: GlobeIcon, path: "https://eyachirarafat.vercel.app/" },
    { id: 3, name: "Email", Icon: MailIcon, path: "mailto:shahriyar.hosen.dev@gmail.com" },
  ],
  privacy: [
    { id: 1, name: "SmythOS Platform", path: "https://smythos.com" },
    { id: 2, name: "MIT License", path: "https://github.com/smythos/sre/blob/main/LICENSE" },
  ],
};
