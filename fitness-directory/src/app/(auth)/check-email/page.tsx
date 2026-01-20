"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const isBusiness = searchParams.get("type") === "business";

  return (
    <div className="w-full max-w-md text-center">
      <div className={`rounded-2xl border ${isBusiness ? 'border-purple-200' : 'border-stone-200'} bg-white p-8 shadow-xl shadow-stone-200/50`}>
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${isBusiness ? 'bg-purple-100' : 'bg-green-100'}`}>
          {isBusiness ? (
            <svg
              className="h-7 w-7 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          ) : (
            <svg
              className="h-7 w-7 text-green-600"
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
          )}
        </div>

        {isBusiness && (
          <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 mb-4">
            Business Account
          </span>
        )}

        <h1 className="text-2xl font-bold text-stone-900">
          {isBusiness ? "Verify Your Business Email" : "Check your email"}
        </h1>

        <p className="mt-4 text-stone-600">
          {isBusiness ? (
            <>
              We&apos;ve sent a confirmation link to your business email.
              Please verify your email to complete your business account setup.
            </>
          ) : (
            <>
              We&apos;ve sent you a confirmation link. Please check your email and
              click the link to activate your account.
            </>
          )}
        </p>

        {isBusiness && (
          <div className="mt-6 rounded-xl bg-purple-50 border border-purple-100 p-4 text-left">
            <h3 className="font-medium text-purple-900 text-sm">What happens next?</h3>
            <ol className="mt-2 text-sm text-purple-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-200 text-xs font-medium text-purple-700">1</span>
                <span>Click the confirmation link in your email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-200 text-xs font-medium text-purple-700">2</span>
                <span>Complete your business profile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-200 text-xs font-medium text-purple-700">3</span>
                <span>Start adding your fitness centers</span>
              </li>
            </ol>
          </div>
        )}

        <p className="mt-4 text-sm text-stone-500">
          Didn&apos;t receive the email? Check your spam folder or{" "}
          <Link
            href={isBusiness ? "/signup/business" : "/signup"}
            className="text-stone-900 underline hover:no-underline"
          >
            try again
          </Link>
          .
        </p>

        <div className="mt-8">
          <Link
            href={isBusiness ? "/login?next=/owner/business-profile" : "/login"}
            className={`inline-block rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all ${
              isBusiness
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-stone-900 hover:bg-stone-800'
            }`}
          >
            {isBusiness ? "Sign In to Business Account" : "Back to Sign In"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function CheckEmailFallback() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-stone-100 animate-pulse" />
        <div className="h-8 bg-stone-100 rounded animate-pulse mx-auto max-w-[200px]" />
        <div className="mt-4 h-16 bg-stone-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFBF7] px-4">
      <Suspense fallback={<CheckEmailFallback />}>
        <CheckEmailContent />
      </Suspense>
    </div>
  );
}
