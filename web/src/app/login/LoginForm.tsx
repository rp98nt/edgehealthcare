"use client";

import { signInAction } from "@/app/actions/auth";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

export function LoginForm() {
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/dashboard";
  const [state, formAction, pending] = useActionState(signInAction, undefined);

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
        <label className="block text-sm">
          <span className="text-slate-700">Password</span>
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            type="password"
            name="password"
            defaultValue="demo-demo-demo"
            autoComplete="current-password"
          />
        </label>
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
