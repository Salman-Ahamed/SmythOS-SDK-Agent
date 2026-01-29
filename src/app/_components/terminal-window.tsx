import { terminalCommands } from "@/lib/db";

interface Command {
  command: string;
  description?: string;
}

const TerminalWindow = ({ commands }: { commands: Command[] }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
      <div className="flex items-center gap-2 border-b border-gray-700 bg-gray-800 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <div className="ml-2 text-sm text-gray-400">terminal</div>
      </div>
      <div className="p-6 font-mono">
        {commands.map((cmd, i) => (
          <div key={i} className="mb-4 last:mb-0">
            {cmd.command.split("\n").map((line, lineIndex) => (
              <div key={lineIndex} className="flex items-start">
                {line.trim().startsWith("#") ? (
                  <span className="text-gray-500">{line}</span>
                ) : line.trim() === "" ? (
                  <br />
                ) : (
                  <>
                    <span className="mr-2 text-green-400">$</span>
                    <span className="text-gray-300">{line}</span>
                  </>
                )}
              </div>
            ))}
            {cmd.description && (
              <div className="mt-1 ml-5 text-sm text-gray-500">{cmd.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const TerminalSection = () => {
  return (
    <section className="relative z-10 container mx-auto max-w-4xl px-6 py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold">Get Started in Seconds</h2>
        <p className="mx-auto max-w-2xl text-gray-400">
          Everything you need to start building production-ready applications
        </p>
      </div>
      <TerminalWindow commands={terminalCommands} />
    </section>
  );
};
