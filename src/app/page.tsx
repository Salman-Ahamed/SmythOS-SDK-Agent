import { NextPage } from "next";

import {
  CTASection,
  ExamplesShowcase,
  FeatureGrid,
  Footer,
  HeroSection,
  StatsGrid,
} from "@/app/_components";

const Home: NextPage = () => (
  <div className="min-h-screen overflow-hidden bg-gray-950 text-gray-100">
    {/* Background grid pattern */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute top-0 left-0 h-full w-full bg-[linear-gradient(to_right,rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>

    {/* Gradient top bar */}
    <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

    {/* Main content */}
    <main>
      <HeroSection />
      <StatsGrid />
      <ExamplesShowcase />
      <FeatureGrid />
      <CTASection />
    </main>

    <Footer />
  </div>
);

export default Home;
