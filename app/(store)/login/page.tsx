"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const getReturnPath = () => {
    const returnTo = new URLSearchParams(window.location.search).get("returnTo");
    if (returnTo?.startsWith("/") && !returnTo.startsWith("//") && !returnTo.startsWith("/login")) return returnTo;

    if (document.referrer) {
      const referrer = new URL(document.referrer);
      if (referrer.origin === window.location.origin && !referrer.pathname.startsWith("/login")) return `${referrer.pathname}${referrer.search}${referrer.hash}`;
    }

    return "/";
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setLoading(true); setError(""); try { const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, password }) }); const payload = await response.json(); if (!response.ok || !payload.success) throw new Error(payload.message ?? "Unable to sign in."); router.replace(getReturnPath()); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to sign in."); } finally { setLoading(false); } };
  return <main className="min-h-screen bg-[#faf8f6] px-4 py-12 sm:py-20"><section className="mx-auto max-w-md rounded-2xl border border-[#e8dfda] bg-white p-6 shadow-sm sm:p-9"><p className="text-center text-xs font-semibold tracking-[0.2em] text-[#b56f6f]">THE SUSMITA COLLECTION</p><h1 className="mt-3 text-center font-serif text-3xl text-[#292321]">Welcome back</h1><p className="mt-2 text-center text-sm text-[#7a706b]">Sign in to manage your orders and saved collection.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm font-medium text-[#4f4541]">Email or mobile number<input value={identifier} onChange={(event) => setIdentifier(event.target.value)} required className="mt-2 h-12 w-full rounded-xl border border-[#ded6d1] px-4 outline-none focus:border-[#b56f6f]" /></label><label className="block text-sm font-medium text-[#4f4541]">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-2 h-12 w-full rounded-xl border border-[#ded6d1] px-4 outline-none focus:border-[#b56f6f]" /></label>{error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button disabled={loading} className="h-12 w-full rounded-xl bg-[#b56f6f] text-sm font-semibold text-white transition hover:bg-[#9f5e5e] disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}</button></form><p className="mt-6 text-center text-sm text-[#7a706b]">New here? <Link href="/register" className="font-semibold text-[#b56f6f] hover:underline">Create an account</Link></p></section></main>;
}
