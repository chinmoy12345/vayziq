"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Send, X } from "lucide-react";
import type { ChatMessage } from "@/lib/shopping-chat";

function Reply({ text }: { text: string }) {
  return <>{text.split(/(\[[^\]\n]+\]\(\/(?:product\/[a-zA-Z0-9%_-]+|shipping|returns|contact|account|shop)\))/g).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\((\/[^)]+)\)$/);
    return link ? <Link key={index} href={link[2]} className="font-semibold underline underline-offset-2">{link[1]}</Link> : <span key={index}>{part}</span>;
  })}</>;
}
export default function ShoppingChat({ name, greeting, enabled, supportUrl }: { name: string; greeting: string; enabled: boolean; supportUrl: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); buttonRef.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [messages, pending, error]);
  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;
    const next: ChatMessage[] = [...messages.slice(-10), { role: "user", content }];
    setPending(content); setInput(""); setError("");
    const controller = new AbortController(); controllerRef.current = controller;
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next, pagePath: window.location.pathname }), signal: controller.signal });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Please try again or contact our team.");
      setMessages([...next, { role: "assistant", content: body.reply }]);
    } catch (err) { if (!controller.signal.aborted) { setError(err instanceof Error ? err.message : "Please try again."); setInput(content); } }
    finally { if (!controller.signal.aborted) setPending(""); }
  }
  if (!enabled) return null;
  return <>
    <button ref={buttonRef} type="button" aria-label={`Chat with ${name}`} aria-expanded={open} aria-controls="shopping-chat-panel" onClick={() => setOpen(value => !value)} className="fixed bottom-24 right-4 z-[190] flex h-14 items-center gap-2 rounded-full bg-[#171717] px-4 text-sm font-bold text-white shadow-xl transition hover:bg-[#353535] focus-visible:ring-4 focus-visible:ring-[#fbb606] sm:right-7"><Bot className="h-6 w-6" /><span>{name}</span></button>
    {open && <section id="shopping-chat-panel" role="dialog" aria-label={`Chat with ${name}`} className="fixed bottom-40 right-3 z-[195] flex h-[520px] max-h-[calc(100dvh-180px)] w-[calc(100vw-24px)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-[#e8e3dc] bg-white text-[#292321] shadow-2xl sm:right-7">
      <header className="flex shrink-0 items-center justify-between gap-3 bg-[#171717] p-4 text-white"><div className="flex items-center gap-3"><Bot className="h-7 w-7 text-[#fbb606]" /><div><h2 className="font-bold">{name}</h2><p className="text-xs text-white/70">AI shopping assistant</p></div></div><button type="button" aria-label="Close chat" onClick={() => { setOpen(false); buttonRef.current?.focus(); }} className="rounded-full p-2 hover:bg-white/15"><X className="h-5 w-5" /></button></header>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#faf8f5] p-4"><p className="rounded-xl bg-white p-3 text-sm leading-6">{greeting.replaceAll("{name}", name)}</p>{messages.map((message, index) => <div key={index} className={`whitespace-pre-wrap rounded-xl p-3 text-sm leading-6 ${message.role === "user" ? "ml-7 bg-[#fff0be]" : "mr-4 bg-white"}`}><span className="sr-only">{message.role === "user" ? "You" : name}: </span><Reply text={message.content} /></div>)}{pending && <><p className="ml-7 whitespace-pre-wrap rounded-xl bg-[#fff0be] p-3 text-sm">{pending}</p><p role="status" className="text-xs text-[#857974]">{name} is thinking…</p></>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-700">{error}</p>}<div ref={bottomRef} /></div>
      {!messages.length && !pending && <div className="flex shrink-0 gap-2 overflow-x-auto border-t px-3 py-2">{["Find a product", "Help with sizes", "Returns & delivery"].map(text => <button key={text} onClick={() => void send(text)} className="shrink-0 rounded-full border px-3 py-2 text-[11px] hover:bg-[#fff4ce]">{text}</button>)}</div>}
      <form onSubmit={event => { event.preventDefault(); void send(input); }} className="flex shrink-0 items-center gap-2 border-t p-3"><input ref={inputRef} aria-label={`Message ${name}`} maxLength={2000} value={input} onChange={event => setInput(event.target.value)} disabled={Boolean(pending)} placeholder="Ask about your next favourite…" className="min-w-0 flex-1 rounded-lg border px-3 py-3 text-sm outline-none focus:border-[#b28a20]" /><button type="submit" disabled={!input.trim() || Boolean(pending)} aria-label="Send message" className="rounded-lg bg-[#fbb606] p-3 disabled:opacity-40"><Send className="h-5 w-5" /></button></form>
      <footer className="flex shrink-0 items-center justify-between px-4 pb-3 text-[10px] text-[#857974]"><span>AI replies may need confirmation.</span><a href={supportUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Talk to our team</a></footer>
    </section>}
  </>;
}
