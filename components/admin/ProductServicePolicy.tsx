"use client";
import { useEffect, useState } from "react";
import type { ItemPolicy } from "@/lib/fulfillment";

export default function ProductServicePolicy({ productId }: { productId: string }) {
  const [policy, setPolicy] = useState<ItemPolicy | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { fetch(`/api/products/${productId}/service-policy`).then(async response => { if (!response.ok) throw new Error("Unable to load policy."); setPolicy(await response.json()); }).catch(error => setMessage(error.message)); }, [productId]);
  async function save() {
    setSaving(true); setMessage("");
    try { const response = await fetch(`/api/products/${productId}/service-policy`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(policy) }); const data = await response.json(); setMessage(response.ok ? "Policy saved for future orders." : data.message); } catch { setMessage("Unable to save. Please try again."); } finally { setSaving(false); }
  }
  return <section className="m-5 rounded-xl border border-[#E8DADA] bg-white p-5"><h2 className="text-lg font-semibold">Returns & replacements</h2><p className="mt-1 text-sm text-gray-500">Windows start at shipment delivery. Changes apply to future purchases; existing orders keep their purchase-time policy.</p>{policy && <div className="mt-5 grid gap-4 sm:grid-cols-2">{(["return", "replacement"] as const).map(kind => <div key={kind} className="rounded-lg border p-4"><label className="flex items-center gap-2 capitalize"><input type="checkbox" checked={policy[`${kind}Enabled`]} onChange={e => setPolicy({ ...policy, [`${kind}Enabled`]: e.target.checked })} />{kind} available</label><label className="mt-3 block text-sm">Window in days<input type="number" min={1} max={365} value={policy[`${kind}Days`]} onChange={e => setPolicy({ ...policy, [`${kind}Days`]: Number(e.target.value) })} className="mt-1 block h-11 w-full rounded-lg border px-3" /></label></div>)}</div>}<button type="button" disabled={!policy || saving} onClick={() => void save()} className="mt-4 rounded-lg bg-[#9b5c5c] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save policy"}</button>{message && <p role="status" className="mt-3 text-sm">{message}</p>}</section>;
}
