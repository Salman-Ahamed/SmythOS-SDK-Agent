"use client";

import Link from "next/link";

import { BrainIcon, GitHubIcon, LinkedInIcon, MailIcon } from "@/components/icons";
import { footerLinks } from "@/lib/db";

export const Footer = () => {
  const { quickLinks, resources, contact, privacy } = footerLinks;

  return (
    <footer className="relative z-10 border-t border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
      <div className="container mx-auto px-6">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-12 py-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <BrainIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">SmythOS SDK</h3>
                <p className="text-xs text-gray-500">Practice Examples</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Learn to build intelligent AI agents with interactive examples. From basic chat to
              advanced planner mode.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="https://github.com/smythos/sre"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 transition-all duration-300 hover:bg-violet-500/20 hover:text-violet-400"
              >
                <GitHubIcon className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/smythos"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 transition-all duration-300 hover:bg-violet-500/20 hover:text-violet-400"
              >
                <LinkedInIcon className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:support@smythos.com"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 transition-all duration-300 hover:bg-violet-500/20 hover:text-violet-400"
              >
                <MailIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.path}
                    target={link.path.startsWith("http") ? "_blank" : undefined}
                    rel={link.path.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-gray-400 transition-colors duration-300 hover:text-violet-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Resources
            </h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 transition-colors duration-300 hover:text-violet-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Contact
            </h3>
            <ul className="space-y-3">
              {contact.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 transition-colors duration-300 hover:text-violet-400"
                  >
                    {link.Icon && <link.Icon className="h-4 w-4" />}
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800/50 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} SmythOS. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {privacy.map((link) => (
                <Link
                  key={link.id}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 transition-colors duration-300 hover:text-violet-400"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
