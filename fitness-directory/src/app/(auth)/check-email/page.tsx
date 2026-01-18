import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check Your Email",
  description: "Please check your email to confirm your account.",
};

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md text-center">
        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-6 w-6 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Check your email
          </h1>

          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            We&apos;ve sent you a confirmation link. Please check your email and
            click the link to activate your account.
          </p>

          <p className="mt-4 text-sm text-zinc-500">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <Link
              href="/signup"
              className="text-zinc-900 underline hover:no-underline dark:text-white"
            >
              try again
            </Link>
            .
          </p>

          <div className="mt-8">
            <Link
              href="/login"
              className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
