"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, loginWithOAuth } from "../actions/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") || "/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(formData, redirectTo);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setIsOAuthLoading(provider);
    setError(null);

    try {
      const result = await loginWithOAuth(provider);
      if (result.error) {
        setError(result.error);
        setIsOAuthLoading(null);
      } else if (result.url) {
        router.push(result.url);
      }
    } catch {
      setError("An unexpected error occurred");
      setIsOAuthLoading(null);
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-stone-900">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Sign in to your account to continue
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-stone-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            className="mt-1.5 block w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-700"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            required
            autoComplete="current-password"
            className="mt-1.5 block w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 font-semibold text-white hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-stone-200" />
        <span className="px-4 text-sm text-stone-400">or continue with</span>
        <div className="flex-1 border-t border-stone-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={isOAuthLoading !== null}
          className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {isOAuthLoading === "google" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
          ) : (
            <GoogleIcon />
          )}
          Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("apple")}
          disabled={isOAuthLoading !== null}
          className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {isOAuthLoading === "apple" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
          ) : (
            <AppleIcon />
          )}
          Apple
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-stone-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-orange-600 hover:text-orange-700"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50">
      <div className="mb-8 text-center">
        <div className="mx-auto h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500" />
        <h1 className="mt-6 text-2xl font-bold text-stone-900">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Sign in to your account to continue
        </p>
      </div>
      <div className="animate-pulse space-y-4">
        <div className="h-11 rounded-xl bg-stone-100" />
        <div className="h-11 rounded-xl bg-stone-100" />
        <div className="h-11 rounded-xl bg-stone-100" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFBF7] px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}
