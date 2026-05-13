import { handlers } from "@/auth";

/** Neon + bcrypt + JWT need Node; Edge can surface opaque /api/auth errors on Vercel. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
