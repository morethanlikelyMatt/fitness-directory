import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-stone-900">
          Authentication Error
        </h1>
        <p className="mb-6 text-stone-600">
          There was a problem verifying your email. The link may have expired or
          already been used.
        </p>
        <div className="space-y-3">
          <Link
            href="/signup"
            className="block w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 font-semibold text-white hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            Try signing up again
          </Link>
          <Link
            href="/login"
            className="block w-full rounded-xl border border-stone-200 bg-white px-6 py-3 font-semibold text-stone-700 hover:bg-stone-50 transition-all"
          >
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}
