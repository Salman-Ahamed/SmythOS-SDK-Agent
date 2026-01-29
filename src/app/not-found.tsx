import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-4 text-gray-100">
      <div className="text-center">
        <h1 className="mb-2 text-8xl font-bold text-indigo-500">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-8 max-w-md text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-md bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Go Home
          </Link>
          <Link
            href="/practice"
            className="rounded-md border border-gray-700 bg-gray-800/50 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-700/50"
          >
            View Examples
          </Link>
        </div>
      </div>
    </div>
  );
}
