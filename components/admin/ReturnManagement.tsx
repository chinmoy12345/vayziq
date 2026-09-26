"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type RequestStatus = "requested" | "approved" | "rejected" | "completed";
type ServiceRequest = {
  id: number;
  kind: "return" | "replacement";
  status: RequestStatus;
  reason: string;
  adminNote: string | null;
  createdAt: string;
  deadline: string | null;
  item: {
    id: number;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    deliveredAt: string | null;
    returnEnabled: boolean;
    replacementEnabled: boolean;
    returnDays: number;
    replacementDays: number;
    order: { id: number; number: string; createdAt: string; customer: { name: string; email: string; mobile: string | null } };
  };
};

const filters: Array<{ label: string; value: "all" | RequestStatus }> = [
  { label: "All requests", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Completed", value: "completed" },
];

const statusStyles: Record<RequestStatus, string> = {
  requested: "bg-amber-50 text-amber-800",
  approved: "bg-blue-50 text-blue-800",
  rejected: "bg-rose-50 text-rose-800",
  completed: "bg-emerald-50 text-emerald-800",
};

function displayDate(value: string | null) {
  return value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not recorded";
}

export default function ReturnManagement() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/service-requests", { cache: "no-store" });
      const payload = await response.json() as { success?: boolean; data?: ServiceRequest[]; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message || "Return requests could not be loaded.");
      setRequests(payload.data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Return requests could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/service-requests", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { success?: boolean; data?: ServiceRequest[]; message?: string };
        if (!response.ok || !payload.success) throw new Error(payload.message || "Return requests could not be loaded.");
        if (active) setRequests(payload.data ?? []);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Return requests could not be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredRequests = useMemo(
    () => filter === "all" ? requests : requests.filter((request) => request.status === filter),
    [filter, requests],
  );

  const counts = useMemo(() => ({
    requested: requests.filter((request) => request.status === "requested").length,
    approved: requests.filter((request) => request.status === "approved").length,
    completed: requests.filter((request) => request.status === "completed").length,
  }), [requests]);

  async function updateRequest(request: ServiceRequest, status: Exclude<RequestStatus, "requested">) {
    setBusyId(request.id);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/service-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: request.id, status, adminNote: notes[request.id] ?? request.adminNote ?? "" }),
      });
      const payload = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message || "Request could not be updated.");
      setMessage(`${request.kind === "return" ? "Return" : "Replacement"} request ${status}.`);
      await loadRequests();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Request could not be updated.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#faf8f6] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a87567]">Order operations</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#292321]">Return &amp; replacement management</h1>
            <p className="mt-2 text-sm text-[#857974]">Review item-level requests submitted within each product’s delivery-based service window.</p>
          </div>
          <Link href="/admin/orders" className="inline-flex h-10 items-center rounded-lg border border-[#ded6d1] bg-white px-4 text-sm font-medium text-[#625954] hover:bg-[#faf8f6]">View orders</Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[["Needs review", counts.requested], ["Approved", counts.approved], ["Completed", counts.completed]].map(([label, count]) => (
            <div key={String(label)} className="rounded-xl border border-[#eee6e1] bg-white p-4">
              <p className="text-xs text-[#8e8580]">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-[#292321]">{count}</p>
            </div>
          ))}
        </div>

        {(error || message) && <p role={error ? "alert" : "status"} className={`mt-5 rounded-lg border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error || message}</p>}

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter service requests">
          {filters.map((item) => <button key={item.value} type="button" role="tab" aria-selected={filter === item.value} onClick={() => setFilter(item.value)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${filter === item.value ? "bg-[#292321] text-white" : "border border-[#e7ded9] bg-white text-[#6f6560] hover:bg-[#faf8f6]"}`}>{item.label}</button>)}
        </div>

        <section className="mt-4 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm">
          {loading ? <p className="p-8 text-center text-sm text-[#857974]">Loading return requests…</p> : filteredRequests.length === 0 ? <div className="p-10 text-center"><p className="font-medium text-[#292321]">No requests here</p><p className="mt-1 text-sm text-[#958b86]">New eligible return and replacement requests will appear here.</p></div> : (
            <div className="divide-y divide-[#f0e9e5]">
              {filteredRequests.map((request) => (
                <article key={request.id} className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold capitalize text-[#292321]">{request.kind}</h2>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[request.status]}`}>{request.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-[#8b817c]">Request #{request.id} · Submitted {displayDate(request.createdAt)}</p>
                    </div>
                    <Link href={`/admin/orders/${request.item.order.id}`} className="text-sm font-medium text-[#9b6e61] hover:underline">{request.item.order.number}</Link>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
                    <div className="rounded-lg bg-[#fcfaf9] p-4">
                      <p className="font-medium text-[#292321]">{request.item.name}</p>
                      <p className="mt-1 text-xs text-[#8b817c]">SKU {request.item.sku} · Qty {request.item.quantity} · ₹{(request.item.price * request.item.quantity).toLocaleString("en-IN")}</p>
                      <p className="mt-3 text-xs text-[#6f6560]">Customer: <span className="font-medium text-[#403936]">{request.item.order.customer.name}</span> · {request.item.order.customer.email}</p>
                      <p className="mt-1 text-xs text-[#6f6560]">Delivered: {displayDate(request.item.deliveredAt)}</p>
                      <p className="mt-1 text-xs text-[#6f6560]">Request window ends: {displayDate(request.deadline)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a49a95]">Customer reason</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#514844]">{request.reason}</p>
                    </div>
                  </div>

                  <label className="mt-4 block text-xs font-medium text-[#6f6560]">Internal note<textarea maxLength={1000} value={notes[request.id] ?? request.adminNote ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} rows={2} placeholder="Optional note for the service record" className="mt-1 w-full resize-y rounded-lg border border-[#e3dad5] px-3 py-2 text-sm outline-none focus:border-[#a87567]" /></label>

                  {request.status === "requested" && <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button type="button" disabled={busyId === request.id} onClick={() => void updateRequest(request, "rejected")} className="h-10 rounded-lg border border-rose-200 px-4 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50">Reject</button>
                    <button type="button" disabled={busyId === request.id} onClick={() => void updateRequest(request, "approved")} className="h-10 rounded-lg bg-[#292321] px-4 text-sm font-medium text-white hover:bg-[#403936] disabled:opacity-50">{busyId === request.id ? "Saving…" : "Approve request"}</button>
                  </div>}
                  {request.status === "approved" && <div className="mt-4 flex justify-end"><button type="button" disabled={busyId === request.id} onClick={() => void updateRequest(request, "completed")} className="h-10 rounded-lg bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50">{busyId === request.id ? "Saving…" : "Mark completed"}</button></div>}
                  {request.status === "rejected" && request.adminNote && <p className="mt-3 text-xs text-[#8b817c]">Recorded note: {request.adminNote}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
