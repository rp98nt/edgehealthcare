"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";

export type SignInState = { error: string } | undefined;

/**
 * Server-side credentials sign-in so the session cookie is set via `cookies()`
 * (client `signIn(..., { redirect: false })` + `window.location` often yields 401
 * on `/api/readings` on Vercel).
 */
export async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = String(formData.get("callbackUrl") || "/dashboard");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Missing email or password." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (e) {
    if (isRedirectError(e)) throw e;
    if (
      e instanceof CredentialsSignin ||
      e instanceof AuthError
    ) {
      return { error: "Invalid email or password." };
    }
    throw e;
  }
}

/** Avoid next-auth `redirect(res.redirect)` when `res.redirect` is missing (becomes `/undefined`). */
export async function signOutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
