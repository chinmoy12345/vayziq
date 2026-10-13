"use client";

import { useEffect, useState } from "react";
import type { ChatbotConfig } from "@/lib/chatbot-settings";

export default function ChatbotSettingsPage() {
  const [config, setConfig] = useState<ChatbotConfig>({ enabled: true, name: "Arya", greeting: "Hi! I’m {name}, your shopping assistant. What can I help you find?", model: "gpt-4.1-mini", knowledge: "" });
  const [configured, setConfigured] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [removeKey, setRemoveKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/admin/chatbot", { cache: "no-store", signal: controller.signal }).then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Could not load chatbot settings.");
      if (!controller.signal.aborted) { setConfig(body.config); setConfigured(body.configured); setLoaded(true); }
    }).catch(err => { if (!controller.signal.aborted) setMessage(err instanceof Error ? err.message : "Could not load settings."); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  async function save() {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/chatbot", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ config, apiKey, removeKey }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Could not save settings.");
      setConfig(body.config); setConfigured(body.configured); setApiKey(""); setRemoveKey(false); setMessage(body.message);
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not save settings."); }
    finally { setSaving(false); }
  }
  const disabled = loading || saving || !loaded;
  return <main className="min-h-screen bg-[#faf8f6] p-4 sm:p-8"><div className="mx-auto max-w-3xl"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold text-[#292321]">AI Shopping Assistant</h1><p className="mt-2 text-sm text-[#857974]">Manage {config.name}’s name, visibility and OpenAI connection.</p></div><button disabled={disabled} onClick={() => void save()} className="rounded-lg bg-[#292321] px-5 py-3 text-sm text-white disabled:opacity-40">{saving ? "Saving…" : "Save changes"}</button></div>
    {message && <p role="status" className="mt-5 rounded-lg border bg-white p-4 text-sm">{message}</p>}
    <fieldset disabled={disabled} className="mt-6 space-y-5 rounded-xl border bg-white p-5 disabled:opacity-50"><label className="flex items-center justify-between gap-3 text-sm font-medium"><span>Show chatbot on storefront</span><input type="checkbox" role="switch" checked={config.enabled} onChange={event => setConfig({ ...config, enabled: event.target.checked })} className="h-5 w-9 accent-[#9b5c5c]" /></label><label className="block text-sm">Assistant name<input maxLength={40} value={config.name} onChange={event => setConfig({ ...config, name: event.target.value })} className="mt-2 w-full rounded-lg border p-3" /></label><label className="block text-sm">Welcome message<textarea maxLength={500} rows={3} value={config.greeting} onChange={event => setConfig({ ...config, greeting: event.target.value })} className="mt-2 w-full rounded-lg border p-3" /><span className="mt-1 block text-xs text-[#857974]">Use {"{name}"} to automatically include the current assistant name.</span></label><label className="block text-sm">Store information & policies<textarea maxLength={6000} rows={6} value={config.knowledge} onChange={event => setConfig({ ...config, knowledge: event.target.value })} placeholder="Add verified delivery details, shipping fees and other information Arya should use." className="mt-2 w-full rounded-lg border p-3" /></label><p className="text-xs leading-5 text-[#857974]">The assistant uses active products, current prices, stock, product return rules and published category size guides. It cannot access customer accounts or place orders.</p></fieldset>
    <fieldset disabled={disabled} className="mt-5 space-y-4 rounded-xl border bg-white p-5 disabled:opacity-50"><h2 className="font-semibold">OpenAI connection</h2><p className={`text-sm ${configured ? "text-green-700" : "text-amber-700"}`}>{configured ? "API key configured" : "Add an API key to enable AI replies"}</p><label className="block text-sm">OpenAI API key<input type="password" autoComplete="new-password" maxLength={500} value={apiKey} onChange={event => setApiKey(event.target.value)} placeholder={configured ? "Leave blank to keep the saved key" : "Paste your OpenAI API key"} className="mt-2 w-full rounded-lg border p-3" /></label><p className="text-xs leading-5 text-[#857974]">Keys are encrypted and kept on the server. OpenAI API usage is billed to your OpenAI account. Request limits: 10 messages per minute per network, 500 per day for the store.</p><label className="block text-sm">OpenAI model<input maxLength={80} value={config.model} onChange={event => setConfig({ ...config, model: event.target.value })} className="mt-2 w-full rounded-lg border p-3" /></label>{configured && <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={removeKey} onChange={event => setRemoveKey(event.target.checked)} />Remove saved API key on save (server environment key, if present, remains available)</label>}</fieldset>
  </div></main>;
}
