"use client";

import { signInAction } from "@/app/actions/auth";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export function LoginForm() {
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/dashboard";
  const [state, formAction, pending] = useActionState(signInAction, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
      <p className="mt-2 text-sm text-slate-600">
        Demo account after <code className="rounded bg-slate-100 px-1">db:seed</code>
        .
      </p>
      <form className="mt-8 flex flex-col gap-4" action={formAction}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <label className="block text-sm">
          <span className="text-slate-700">Email</span>
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            type="email"
            name="email"
            defaultValue="demo@local.test"
            autoComplete="username"
          />
        </label>
        <div className="block text-sm">
          <label className="text-slate-700" htmlFor="login-password">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="login-password"
              className="w-full rounded border border-slate-300 py-2 pl-3 pr-11"
              type={showPassword ? "text" : "password"}
              name="password"
              defaultValue="demo-demo-demo"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOffIcon className="block" />
              ) : (
                <EyeIcon className="block" />
              )}
            </button>
          </div>
        </div>
        {state?.error ? (
          <p className="text-sm text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-sky-700 py-2.5 font-medium text-white disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
