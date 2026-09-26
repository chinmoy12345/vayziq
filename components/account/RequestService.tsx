"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RequestService({ itemId, returns, replacements }: { itemId: number; returns: boolean; replacements: boolean }) {
  const router = useRouter();
  const [kind, setKind] = useState(returns ? "return" : "replacement");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  if (!returns && !replacements) return null;
  return <div className="mt-3"><button type="button" onClick={() => setOpen(!open)} className="min-h-11 rounded-xl border px-4 text-sm font-medium">{returns && replacements ? "Return / Replace" : returns ? "Request return" : "Request replacement"}</button>{open && <form className="mt-3 space-y-3" onSubmit={async e => { e.preventDefault(); setBusy(true); try { const response = await fetch("/api/account/service-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderItemId: itemId, kind, reason }) }); const data = await response.json(); if (!response.ok) setMessage(data.message); else { setOpen(false); router.refresh(); } } catch { setMessage("Unable to submit. Please try again."); } finally { setBusy(false); } }}><label className="block text-sm">Request type<select value={kind} onChange={e => setKind(e.target.value)} className="mt-1 block w-full rounded-lg border p-3">{returns && <option value="return">Return</option>}{replacements && <option value="replacement">Replacement</option>}</select></label><label className="block text-sm">Reason<textarea required minLength={10} maxLength={1000} value={reason} onChange={e => setReason(e.target.value)} className="mt-1 block w-full rounded-lg border p-3" rows={3} /></label><button disabled={busy} className="rounded-lg bg-[#9b5c5c] px-4 py-3 text-sm text-white disabled:opacity-50">{busy ? "Submitting…" : "Submit request"}</button>{message && <p role="alert" className="text-sm text-red-700">{message}</p>}</form>}</div>;
}
