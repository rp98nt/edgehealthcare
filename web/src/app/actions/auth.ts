"use server";

import { signOut } from "@/auth";
import { redirect } from "next/navigation";

/** Avoid next-auth `redirect(res.redirect)` when `res.redirect` is missing (becomes `/undefined`). */
export async function signOutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
