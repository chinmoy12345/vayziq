"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminNotification } from "@/lib/admin-notifications";

type Feed = { notifications: AdminNotification[]; unreadCount: number };

export default function AdminNotificationBell() {
  const [feed, setFeed] = useState<Feed>({ notifications: [], unreadCount: 0 });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notifications", { cache: "no-store" });
      const data = await response.json() as Feed & { message?: string };
      if (!response.ok) throw new Error(data.message || "Could not load notifications.");
      setFeed(data); setError("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load notifications."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => { void refresh(); }, 0);
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    window.addEventListener("focus", refresh);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);

  async function markRead(key?: string) {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(key ? { key } : { all: true }) });
      const data = await response.json() as Feed & { message?: string };
      if (!response.ok) throw new Error(data.message || "Could not update notifications.");
      setFeed(data); setError("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update notifications."); }
    finally { setBusy(false); }
  }

  return <div ref={root} className="relative">
    <button type="button" onClick={() => { setOpen(value => !value); if (!open) void refresh(); }} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#eee6e1] text-[#665b56] transition hover:bg-[#faf8f6]" aria-label={feed.unreadCount ? `Notifications, ${feed.unreadCount} unread` : "Notifications"} aria-expanded={open} aria-controls="admin-notification-panel">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
      {feed.unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#a87567] px-1 text-[9px] font-bold leading-none text-white">{feed.unreadCount > 99 ? "99+" : feed.unreadCount}</span>}
    </button>
    {open && <section id="admin-notification-panel" aria-label="Admin notifications" className="absolute right-[-78px] top-12 z-50 w-[min(92vw,380px)] overflow-hidden rounded-xl border border-[#e9e2de] bg-white shadow-2xl shadow-black/15 sm:right-0">
      <div className="flex items-center justify-between gap-3 border-b border-[#f0e9e5] px-4 py-3"><div><h2 className="text-sm font-semibold text-[#292321]">Notifications</h2><p className="text-[11px] text-[#857974]">{feed.unreadCount} unread</p></div>{feed.unreadCount > 0 && <button type="button" disabled={busy} onClick={() => void markRead()} className="text-xs font-semibold text-[#8c6356] disabled:opacity-50">Mark all read</button>}</div>
      {error && <div role="alert" className="border-b border-[#f0e9e5] bg-red-50 px-4 py-2 text-xs text-red-700">{error}<button type="button" onClick={() => void refresh()} className="ml-2 underline">Retry</button></div>}
      <div className="max-h-[min(65vh,440px)] overflow-y-auto">
        {loading ? <p className="p-5 text-center text-xs text-[#857974]">Loading notifications…</p> : feed.notifications.length === 0 ? <p className="p-6 text-center text-xs text-[#857974]">You’re all caught up.</p> : feed.notifications.map(item => <div key={item.key} className={`flex gap-2 border-b border-[#f5f0ed] px-4 py-3 last:border-0 ${item.read ? "bg-white" : "bg-[#fffaf2]"}`}><Link href={item.href} onClick={() => { if (!item.read) void markRead(item.key); setOpen(false); }} className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-[10px] font-semibold uppercase tracking-wide text-[#a87567]">{item.source}</span>{!item.read && <i aria-label="Unread" className="h-1.5 w-1.5 rounded-full bg-[#d58b34]" />}</div><p className="mt-1 text-xs font-semibold text-[#292321]">{item.title}</p><p className="mt-1 truncate text-[11px] text-[#655b56]">{item.detail}</p><time dateTime={item.createdAt} className="mt-1 block text-[10px] text-[#958b86]">{new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</time></Link>{!item.read && <button type="button" disabled={busy} onClick={() => void markRead(item.key)} aria-label={`Mark ${item.title} as read`} className="self-start whitespace-nowrap text-[10px] text-[#8c6356] disabled:opacity-50">Mark read</button>}</div>)}
      </div>
      <div className="border-t border-[#f0e9e5] px-4 py-2 text-center text-[10px] text-[#958b86]">Updates automatically every 30 seconds</div>
    </section>}
  </div>;
}
