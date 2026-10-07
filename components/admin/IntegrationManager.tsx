"use client";

import { useEffect, useState } from "react";

type ProviderStatus = { enabled: boolean; configured: boolean; accountSid?: string; fromNumber?: string; keyId?: string };
type Data = { twilio: ProviderStatus; razorpay: ProviderStatus };
const empty: Data = { twilio: { enabled: false, configured: false }, razorpay: { enabled: false, configured: false } };

export default function IntegrationManager() {
  const [data, setData] = useState<Data>(empty);
  const [twilio, setTwilio] = useState({ accountSid: "", authToken: "", fromNumber: "" });
  const [razorpay, setRazorpay] = useState({ keyId: "", keySecret: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"twilio" | "razorpay" | null>(null);
  const [status, setStatus] = useState("");

  const load = async () => { try { const response = await fetch("/api/admin/integrations", { cache: "no-store" }); const body = await response.json(); if (!response.ok) throw new Error(body.message); setData(body.data); } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to load integrations."); } finally { setLoading(false); } };
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);
  const save = async (provider: "twilio" | "razorpay") => {
    setSaving(provider); setStatus("");
    try {
      const response = await fetch("/api/admin/integrations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(provider === "twilio" ? { twilio: { ...twilio, enabled: data.twilio.enabled } } : { razorpay: { ...razorpay, enabled: data.razorpay.enabled } }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.message);
      setData(body.data); if (provider === "twilio") setTwilio({ accountSid: "", authToken: "", fromNumber: "" }); else setRazorpay({ keyId: "", keySecret: "" });
      setStatus(`${provider === "twilio" ? "Twilio" : "Razorpay"} settings saved securely.`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to save settings."); } finally { setSaving(null); }
  };
  const toggle = async (provider: "twilio" | "razorpay", enabled: boolean) => {
    setSaving(provider); setStatus("");
    try {
      const response = await fetch("/api/admin/integrations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(provider === "twilio" ? { twilio: { enabled } } : { razorpay: { enabled } }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.message); setData(body.data); setStatus(`${provider === "twilio" ? "Twilio SMS" : "Razorpay payments"} ${enabled ? "enabled" : "disabled"}.`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to update settings."); } finally { setSaving(null); }
  };
  return <main className="min-h-[calc(100vh-72px)] bg-[#faf8f6] px-5 py-7 lg:px-8"><div className="mx-auto max-w-5xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#a87567]">Store settings</p><h1 className="mt-1 text-3xl font-semibold text-[#292321]">Payments & SMS</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[#756b66]">Connect Twilio for login OTP and Razorpay for checkout. Credentials are encrypted before they are saved and are never displayed again.</p>{status && <p role="status" className="mt-5 rounded-xl border border-[#e7d3cb] bg-white px-4 py-3 text-sm text-[#7d5e57]">{status}</p>}
    <section className="mt-7 rounded-2xl border border-[#eee6e1] bg-white shadow-sm"><ProviderHeader title="Twilio SMS OTP" description="Sends sign-in and registration codes to Indian mobile numbers." enabled={data.twilio.enabled} configured={data.twilio.configured} disabled={saving !== null || loading} onToggle={(checked) => void toggle("twilio", checked)} /><div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6"><Field label="Account SID"><input value={twilio.accountSid} onChange={event => setTwilio(current => ({ ...current, accountSid: event.target.value }))} placeholder={data.twilio.accountSid === "Saved" ? "Saved — enter to replace" : "AC…"} autoComplete="off" /></Field><Field label="Auth Token"><input value={twilio.authToken} onChange={event => setTwilio(current => ({ ...current, authToken: event.target.value }))} placeholder="Saved — enter to replace" type="password" autoComplete="new-password" /></Field><Field label="Twilio sender number"><input value={twilio.fromNumber} onChange={event => setTwilio(current => ({ ...current, fromNumber: event.target.value }))} placeholder={data.twilio.fromNumber === "Saved" ? "Saved — enter to replace" : "+1415…"} autoComplete="off" /></Field></div><div className="border-t border-[#eee6e1] px-5 py-4 sm:px-6"><button type="button" disabled={saving !== null || loading} onClick={() => void save("twilio")} className="rounded-lg bg-[#292321] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving === "twilio" ? "Saving…" : "Save Twilio credentials"}</button></div></section>
    <section className="mt-6 rounded-2xl border border-[#eee6e1] bg-white shadow-sm"><ProviderHeader title="Razorpay Payments" description="Creates secure Razorpay orders and verifies payments before confirming stock." enabled={data.razorpay.enabled} configured={data.razorpay.configured} disabled={saving !== null || loading} onToggle={(checked) => void toggle("razorpay", checked)} /><div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6"><Field label="Key ID"><input value={razorpay.keyId} onChange={event => setRazorpay(current => ({ ...current, keyId: event.target.value }))} placeholder={data.razorpay.keyId === "Saved" ? "Saved — enter to replace" : "rzp_live_…"} autoComplete="off" /></Field><Field label="Key Secret"><input value={razorpay.keySecret} onChange={event => setRazorpay(current => ({ ...current, keySecret: event.target.value }))} placeholder="Saved — enter to replace" type="password" autoComplete="new-password" /></Field></div><div className="border-t border-[#eee6e1] px-5 py-4 sm:px-6"><button type="button" disabled={saving !== null || loading} onClick={() => void save("razorpay")} className="rounded-lg bg-[#292321] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving === "razorpay" ? "Saving…" : "Save Razorpay credentials"}</button></div></section></div></main>;
}
function ProviderHeader({ title, description, enabled, configured, disabled, onToggle }: { title: string; description: string; enabled: boolean; configured: boolean; disabled: boolean; onToggle: (checked: boolean) => void }) { return <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eee6e1] px-5 py-5 sm:px-6"><div><div className="flex items-center gap-2"><h2 className="font-semibold text-[#292321]">{title}</h2><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${configured ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>{configured ? "Configured" : "Not configured"}</span></div><p className="mt-1 text-xs text-[#958b86]">{description}</p></div><label className="flex items-center gap-2 text-sm font-medium text-[#403936]"><input type="checkbox" checked={enabled} disabled={disabled} onChange={event => onToggle(event.target.checked)} /> Enable</label></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-[#403936]"><span className="mb-2 block">{label}</span><span className="block [&>input]:h-11 [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-[#ddd4cf] [&>input]:px-3.5 [&>input]:text-sm [&>input]:outline-none [&>input]:focus:border-[#a9837a]">{children}</span></label>; }
