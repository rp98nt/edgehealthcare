import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/alerts", label: "Alerts" },
  { href: "/medications", label: "Medications" },
  { href: "/thesis", label: "Thesis alignment" },
];

export function AppNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard" className="font-semibold text-slate-900">
          Healthcare demo
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-slate-600 hover:text-sky-800"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-sm text-slate-500 underline hover:text-slate-800"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
