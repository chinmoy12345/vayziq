"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

type Severity = "attention" | "clear";
type AuditCheck = { id: string; area: string; title: string; count: number; detail: string; href: string; severity: Severity };
type AuditReport = {
  generatedAt: string;
  summary: { totalOrders: number; pendingOrders: number; salesLast30Days: number; pendingRequests: number; attentionCount: number; clearCount: number; activeBanners: number; deliveryZipCount: number; deliveryZipRestrictionsEnabled: boolean };
  checks: AuditCheck[];
};

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function AuditManagement() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [filter, setFilter] = useState<"all" | Severity>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    setError("");
    try {
      const response = await fetch("/api/admin/audit", { cache: "no-store" });
      const payload = await response.json() as { success?: boolean; data?: AuditReport; generatedAt?: string; summary?: AuditReport["summary"]; checks?: AuditCheck[]; message?: string };
      if (!response.ok || !payload.success || !payload.summary || !payload.checks) throw new Error(payload.message || "Audit report could not be loaded.");
      setReport({ generatedAt: payload.generatedAt ?? new Date().toISOString(), summary: payload.summary, checks: payload.checks });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Audit report could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/audit", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { success?: boolean; summary?: AuditReport["summary"]; checks?: AuditCheck[]; generatedAt?: string; message?: string };
        if (!response.ok || !payload.success || !payload.summary || !payload.checks) throw new Error(payload.message || "Audit report could not be loaded.");
        if (active) setReport({ generatedAt: payload.generatedAt ?? new Date().toISOString(), summary: payload.summary, checks: payload.checks });
      })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Audit report could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleChecks = useMemo(() => report?.checks.filter((item) => filter === "all" || item.severity === filter) ?? [], [filter, report]);
  const checksByArea = useMemo(() => visibleChecks.reduce<Record<string, AuditCheck[]>>((groups, item) => {
    (groups[item.area] ??= []).push(item);
    return groups;
  }, {}), [visibleChecks]);

  const summaryCards = report ? [
    { label: "Needs attention", value: String(report.summary.attentionCount), style: report.summary.attentionCount ? "text-amber-700" : "text-emerald-700" },
    { label: "Orders", value: report.summary.totalOrders.toLocaleString("en-IN"), style: "text-[#292321]" },
    { label: "Sales · 30 days", value: money(report.summary.salesLast30Days), style: "text-[#292321]" },
    { label: "Pending requests", value: report.summary.pendingRequests.toLocaleString("en-IN"), style: report.summary.pendingRequests ? "text-amber-700" : "text-emerald-700" },
  ] : [];

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#faf8f6] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a87567]">Store operations</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#292321]">Audit Management</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#857974]">Overall checks for orders, payments, returns, inventory, catalogue, offers, customer feedback and delivery setup.</p>
            {report && <p className="mt-2 text-xs text-[#a39a95]">Snapshot refreshed {new Date(report.generatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>}
          </div>
          <button type="button" onClick={() => void loadReport(true)} disabled={refreshing || loading} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#292321] px-4 text-sm font-medium text-white hover:bg-[#403936] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? "Checking…" : "Run audit"}</button>
        </div>

        {error && <div role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

        {loading ? <div className="mt-7 rounded-xl border border-[#eee6e1] bg-white p-10 text-center text-sm text-[#857974]">Checking store data…</div> : report && <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => <div key={card.label} className="rounded-xl border border-[#eee6e1] bg-white p-4"><p className="text-xs text-[#8e8580]">{card.label}</p><p className={`mt-1 text-2xl font-semibold ${card.style}`}>{card.value}</p></div>)}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-semibold text-[#292321]">Audit checks</h2><p className="mt-1 text-xs text-[#958b86]">Each check links to the relevant admin module for follow-up.</p></div>
            <div className="flex gap-2" role="group" aria-label="Filter audit checks">
              {[{ label: "All", value: "all" }, { label: "Needs attention", value: "attention" }, { label: "Clear", value: "clear" }].map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value as typeof filter)} className={`rounded-full px-3 py-2 text-xs font-medium ${filter === item.value ? "bg-[#292321] text-white" : "border border-[#e7ded9] bg-white text-[#6f6560]"}`}>{item.label}</button>)}
            </div>
          </div>

          <div className="mt-4 space-y-5">
            {Object.entries(checksByArea).map(([area, checks]) => <section key={area} className="overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm">
              <h3 className="border-b border-[#f0e9e5] px-5 py-3 text-sm font-semibold text-[#403936]">{area}</h3>
              <div className="divide-y divide-[#f4efec]">{checks.map((item) => <div key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${item.severity === "clear" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{item.severity === "clear" ? "✓" : item.count}</span>
                <div className="min-w-0 flex-1"><p className="text-sm font-medium text-[#292321]">{item.title}</p><p className="mt-1 text-xs leading-5 text-[#857974]">{item.count ? item.detail : "No issues found."}</p></div>
                <div className="flex items-center justify-between gap-3 sm:justify-end"><span className={`text-xs font-semibold ${item.severity === "clear" ? "text-emerald-700" : "text-amber-800"}`}>{item.severity === "clear" ? "Clear" : `${item.count} found`}</span><Link href={item.href} className="rounded-lg border border-[#e7ded9] px-3 py-2 text-xs font-medium text-[#70564d] hover:bg-[#faf8f6]">Review</Link></div>
              </div>)}</div>
            </section>)}
          </div>

          <p className="mt-5 rounded-lg border border-[#eee6e1] bg-white px-4 py-3 text-xs leading-5 text-[#857974]">This is a live data-quality and operations snapshot. Historical admin change logs are not available for actions made before audit logging was added.</p>
        </>}
      </div>
    </main>
  );
}
