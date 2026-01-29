import { FC } from "react";

import { geistMono, geistSans } from "@/config";

import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "SmythOS SDK Practice",
    template: "%s | SmythOS SDK",
  },
  description:
    "Learn to build AI Agents with SmythOS SDK through hands-on examples. From basic chat to advanced planner-coder workflows.",
  keywords: ["SmythOS", "SDK", "AI", "Agents", "LLM", "OpenAI", "Next.js", "TypeScript"],
  authors: [{ name: "SmythOS Team" }],
};

type TProps = Readonly<IChildren>;
const RootLayout: FC<TProps> = ({ children }) => (
  <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
  </html>
);

export default RootLayout;
