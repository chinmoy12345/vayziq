"use client";

import { cloneElement, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Banknote, Boxes, Building2, ClipboardList, Pencil, Plus, RefreshCw, Search, Truck, X } from "lucide-react";

type Supplier = { id: number; name: string; contactName: string | null; phone: string | null; email: string | null; address: string | null; gstNumber: string | null; notes: string | null; createdAt: string; purchaseTotal: number; paidTotal: number; dueTotal: number };
type CatalogItem = { productId: number; variantId: number | null; name: string; sku: string; label: string };
type PurchaseLine = { productId: number | ""; variantId: number | null; quantity: string; unitCost: string };
type PurchaseItem = { id: number; productName: string; sku: string; variantLabel: string | null; quantity: number; unitCost: number | string; total: number | string };
type SupplierPayment = { id: number; amount: number | string; method: string; reference: string | null; note: string | null; paidAt: string };
type Purchase = { id: number; purchaseNumber: string; supplierId: number; supplier: { id: number; name: string }; total: number; paid: number; due: number; receivedAt: string; note: string | null; items: PurchaseItem[]; payments: SupplierPayment[] };
type Data = { suppliers: Supplier[]; purchases: Purchase[]; products: CatalogItem[]; permissions: { canCreateSupplier: boolean; canManageSupplier: boolean; canReceiveStock: boolean; canRecordPayment: boolean } };
type SupplierForm = { name: string; contactName: string; phone: string; email: string; gstNumber: string; address: string; notes: string };
type PaymentForm = { amount: string; method: string; reference: string; note: string };
type PurchaseForm = { supplierId: string; receivedAt: string; initialPayment: string; initialPaymentMethod: string; initialPaymentReference: string; note: string };
const money = (value: number | string) => `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);
const emptySupplier: SupplierForm = { name: "", contactName: "", phone: "", email: "", gstNumber: "", address: "", notes: "" };
const emptyPayment: PaymentForm = { amount: "", method: "bank_transfer", reference: "", note: "" };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();
  let payload: (T & { success?: boolean; message?: string }) | null = null;
  try { payload = text ? JSON.parse(text) as T & { success?: boolean; message?: string } : null; } catch { /* handled below */ }
  if (!payload) throw new Error(`Supplier service returned an invalid response (HTTP ${response.status}).`);
  if (!response.ok || payload.success === false) throw new Error(payload.message || "Supplier request failed.");
  return payload;
}

export default function SupplierManagement() {
  const [data, setData] = useState<Data>({ suppliers: [], purchases: [], products: [], permissions: { canCreateSupplier: false, canManageSupplier: false, canReceiveStock: false, canRecordPayment: false } });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"suppliers" | "purchases">("suppliers");
  const [query, setQuery] = useState("");
  const [supplierModal, setSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState<SupplierForm>(emptySupplier);
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState<PurchaseForm>({ supplierId: "", receivedAt: today(), initialPayment: "0", initialPaymentMethod: "bank_transfer", initialPaymentReference: "", note: "" });
  const [lines, setLines] = useState<PurchaseLine[]>([{ productId: "", variantId: null, quantity: "1", unitCost: "" }]);
  const [paymentPurchase, setPaymentPurchase] = useState<Purchase | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>(emptyPayment);

  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await api<Data>("/api/admin/suppliers", { cache: "no-store" })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Supplier records could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    api<Data>("/api/admin/suppliers", { cache: "no-store" })
      .then(result => { if (active) setData(result); })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Supplier records could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredSuppliers = useMemo(() => data.suppliers.filter(item => `${item.name} ${item.contactName ?? ""} ${item.phone ?? ""} ${item.email ?? ""}`.toLowerCase().includes(query.toLowerCase())), [data.suppliers, query]);
  const stats = useMemo(() => ({
    suppliers: data.suppliers.length,
    receipts: data.purchases.length,
    received: data.suppliers.reduce((sum, item) => sum + item.purchaseTotal, 0),
    due: data.suppliers.reduce((sum, item) => sum + item.dueTotal, 0),
  }), [data]);

  async function saveSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await api("/api/admin/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "supplier", ...(editingSupplier ? { id: editingSupplier.id } : {}), ...supplierForm }) });
      setSupplierModal(false); setSupplierForm(emptySupplier); setMessage(editingSupplier ? "Supplier updated." : "Supplier saved."); setEditingSupplier(null); await reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Supplier could not be saved."); }
    finally { setBusy(false); }
  }

  function openPurchase() {
    setPurchaseForm(current => ({ ...current, supplierId: data.suppliers[0] ? String(data.suppliers[0].id) : "", receivedAt: today() }));
    setLines([{ productId: "", variantId: null, quantity: "1", unitCost: "" }]);
    setPurchaseModal(true); setError("");
  }
  function updateLine(index: number, patch: Partial<PurchaseLine>) { setLines(current => current.map((line, i) => i === index ? { ...line, ...patch } : line)); }
  function addLine() { setLines(current => [...current, { productId: "", variantId: null, quantity: "1", unitCost: "" }]); }
  function removeLine(index: number) { setLines(current => current.length === 1 ? current : current.filter((_, i) => i !== index)); }
  const purchaseTotal = lines.reduce((sum, line) => sum + Math.max(0, Number(line.quantity) || 0) * Math.max(0, Number(line.unitCost) || 0), 0);

  async function receivePurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const result = await api<{ data: { purchaseNumber: string } }>("/api/admin/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "purchase", ...purchaseForm, receivedAt: new Date(`${purchaseForm.receivedAt}T12:00:00`).toISOString(), items: lines }) });
      setPurchaseModal(false); setMessage(`Stock received and recorded as ${result.data.purchaseNumber}.`); await reload(); setTab("purchases");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Purchase could not be received."); }
    finally { setBusy(false); }
  }

  function openPayment(purchase: Purchase) {
    setPaymentPurchase(purchase); setPaymentForm({ ...emptyPayment, amount: purchase.due.toFixed(2) }); setError("");
  }
  async function savePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!paymentPurchase) return; setBusy(true); setError(""); setMessage("");
    try {
      await api("/api/admin/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "payment", supplierId: paymentPurchase.supplierId, purchaseId: paymentPurchase.id, ...paymentForm }) });
      setPaymentPurchase(null); setPaymentForm(emptyPayment); setMessage("Supplier payment recorded."); await reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Payment could not be recorded."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-[calc(100vh-72px)] bg-[#faf8f6] p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a87567]">Stock procurement</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#292321]">Suppliers & Purchases</h1><p className="mt-2 max-w-2xl text-sm text-[#857974]">Record who supplied each item, when it arrived, its purchase cost, and what remains to be paid.</p></div><div className="flex flex-wrap gap-2">{data.permissions.canCreateSupplier && <button type="button" onClick={() => { setEditingSupplier(null); setSupplierForm(emptySupplier); setSupplierModal(true); }} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#ded6d1] bg-white px-4 text-xs font-semibold text-[#514945]"><Building2 size={15} /> Add supplier</button>}{data.permissions.canReceiveStock && <button type="button" onClick={openPurchase} disabled={!data.suppliers.length || !data.products.length} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#292321] px-4 text-xs font-semibold text-white disabled:opacity-50"><Plus size={15} /> Receive purchase</button>}<button type="button" onClick={() => void reload()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#ded6d1] bg-white px-3 text-xs text-[#625954]" aria-label="Refresh"><RefreshCw size={15} /></button></div></header>
    {error && <p role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}{message && <p role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={<Building2 size={17} />} label="Active suppliers" value={String(stats.suppliers)} /><Metric icon={<ClipboardList size={17} />} label="Recent stock receipts" value={String(stats.receipts)} /><Metric icon={<Boxes size={17} />} label="Purchase value recorded" value={money(stats.received)} /><Metric icon={<Banknote size={17} />} label="Supplier balance due" value={money(stats.due)} tone={stats.due > 0 ? "amber" : "default"} /></section>
    <div className="mt-6 flex gap-2 border-b border-[#e7ded9]">{([["suppliers", "Suppliers"], ["purchases", "Purchase & payment history"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setTab(value)} className={`border-b-2 px-3 py-3 text-sm font-medium ${tab === value ? "border-[#a96363] text-[#542f31]" : "border-transparent text-[#827772]"}`}>{label}</button>)}</div>
    {tab === "suppliers" ? <section className="mt-5 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee6e1] px-4 py-4 sm:px-5"><div><h2 className="font-semibold text-[#292321]">Supplier directory</h2><p className="mt-1 text-xs text-[#958b86]">Supplier totals include all purchases; balances update as payments are entered.</p></div><label className="relative w-full sm:w-64"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a49a95]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find supplier" className="h-10 w-full rounded-lg border border-[#ded6d1] pl-9 pr-3 text-sm outline-none focus:border-[#b56f6f]" /></label></div>{loading ? <p className="p-8 text-center text-sm text-[#857974]">Loading suppliers…</p> : filteredSuppliers.length === 0 ? <div className="p-10 text-center"><Building2 className="mx-auto text-[#b9aca5]" /><p className="mt-3 text-sm font-medium text-[#514945]">No suppliers yet</p><p className="mt-1 text-xs text-[#958b86]">Add the supplier, then record received stock and payments.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-[#fcfaf9] text-[10px] uppercase tracking-[0.12em] text-[#958b86]"><tr><th className="px-5 py-3">Supplier</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Purchases received</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3 text-right">Balance due</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-[#f1ebe7]">{filteredSuppliers.map(supplier => <tr key={supplier.id}><td className="px-5 py-4"><p className="font-medium text-[#292321]">{supplier.name}</p>{supplier.gstNumber && <p className="mt-1 text-xs text-[#958b86]">GSTIN {supplier.gstNumber}</p>}</td><td className="px-4 py-4 text-xs text-[#716762]">{supplier.contactName && <p>{supplier.contactName}</p>}{supplier.phone && <p>{supplier.phone}</p>}{supplier.email && <p>{supplier.email}</p>}</td><td className="px-4 py-4 font-medium text-[#514945]">{money(supplier.purchaseTotal)}</td><td className="px-4 py-4 text-[#514945]">{money(supplier.paidTotal)}</td><td className={`px-4 py-4 text-right font-semibold ${supplier.dueTotal ? "text-amber-800" : "text-emerald-700"}`}>{money(supplier.dueTotal)}</td><td className="px-5 py-4 text-right">{data.permissions.canManageSupplier && <button type="button" onClick={() => { setEditingSupplier(supplier); setSupplierForm({ name: supplier.name, contactName: supplier.contactName ?? "", phone: supplier.phone ?? "", email: supplier.email ?? "", gstNumber: supplier.gstNumber ?? "", address: supplier.address ?? "", notes: supplier.notes ?? "" }); setSupplierModal(true); }} className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded6d1] px-3 py-2 text-xs font-medium text-[#625954]"><Pencil size={13} /> Edit</button>}</td></tr>)}</tbody></table></div>}</section> : <section className="mt-5 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="border-b border-[#eee6e1] px-4 py-4 sm:px-5"><h2 className="font-semibold text-[#292321]">Goods received & supplier payments</h2><p className="mt-1 text-xs text-[#958b86]">Each receipt updates product stock and is linked to its supplier, purchase cost, and payment history.</p></div>{loading ? <p className="p-8 text-center text-sm text-[#857974]">Loading purchase records…</p> : data.purchases.length === 0 ? <div className="p-10 text-center"><Truck className="mx-auto text-[#b9aca5]" /><p className="mt-3 text-sm font-medium text-[#514945]">No purchases recorded yet</p><p className="mt-1 text-xs text-[#958b86]">Use “Receive purchase” to enter the first stock delivery.</p></div> : <div className="divide-y divide-[#f1ebe7]">{data.purchases.map(purchase => <article key={purchase.id} className="p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-[#292321]">{purchase.supplier.name} <span className="font-normal text-[#958b86]">· {purchase.purchaseNumber}</span></p><p className="mt-1 text-xs text-[#857974]">Received {new Date(purchase.receivedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })} · {purchase.items.length} line{purchase.items.length === 1 ? "" : "s"}</p></div><div className="flex items-center gap-3"><div className="text-right"><p className="font-semibold text-[#292321]">{money(purchase.total)}</p><p className={`mt-1 text-xs ${purchase.due ? "text-amber-800" : "text-emerald-700"}`}>{purchase.due ? `${money(purchase.due)} due` : "Fully paid"}</p></div>{purchase.due > 0 && data.permissions.canRecordPayment && <button type="button" onClick={() => openPayment(purchase)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#ded6d1] px-3 text-xs font-semibold text-[#72574e]"><Banknote size={14} /> Record payment</button>}</div></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{purchase.items.map(item => <div key={item.id} className="rounded-lg bg-[#faf8f6] px-3 py-2.5 text-xs"><p className="font-medium text-[#514945]">{item.productName}{item.variantLabel ? ` · ${item.variantLabel}` : ""}</p><p className="mt-1 text-[#857974]">{item.sku} · {item.quantity} units × {money(item.unitCost)} = {money(item.total)}</p></div>)}</div>{purchase.payments.length > 0 && <div className="mt-3 border-t border-[#f1ebe7] pt-3"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#958b86]">Payments</p><div className="flex flex-wrap gap-x-5 gap-y-2">{purchase.payments.map(payment => <p key={payment.id} className="text-xs text-[#716762]">{money(payment.amount)} · {payment.method.replaceAll("_", " ")} · {new Date(payment.paidAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}{payment.reference ? ` · ${payment.reference}` : ""}</p>)}</div></div>}{purchase.note && <p className="mt-2 text-xs text-[#857974]">Note: {purchase.note}</p>}</article>)}</div>}</section>}
  </div>
  {supplierModal && <Modal title={editingSupplier ? "Edit supplier" : "Add supplier"} onClose={() => !busy && setSupplierModal(false)}><form onSubmit={saveSupplier} className="grid gap-3 sm:grid-cols-2"><Field label="Supplier / business name" required><input required maxLength={160} value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} /></Field><Field label="Contact person"><input maxLength={160} value={supplierForm.contactName} onChange={e => setSupplierForm({ ...supplierForm, contactName: e.target.value })} /></Field><Field label="Phone"><input maxLength={40} value={supplierForm.phone} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} /></Field><Field label="Email"><input type="email" maxLength={200} value={supplierForm.email} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} /></Field><Field label="GSTIN"><input maxLength={40} value={supplierForm.gstNumber} onChange={e => setSupplierForm({ ...supplierForm, gstNumber: e.target.value })} /></Field><Field label="Address"><input maxLength={1000} value={supplierForm.address} onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })} /></Field><Field label="Notes" className="sm:col-span-2"><textarea rows={2} maxLength={1000} value={supplierForm.notes} onChange={e => setSupplierForm({ ...supplierForm, notes: e.target.value })} /></Field><ModalActions busy={busy} onCancel={() => setSupplierModal(false)} submit="Save supplier" /></form></Modal>}
  {purchaseModal && <Modal title="Receive stock purchase" onClose={() => !busy && setPurchaseModal(false)}><form onSubmit={receivePurchase} className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Supplier" required><select required value={purchaseForm.supplierId} onChange={e => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}><option value="">Choose supplier</option>{data.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field><Field label="Stock received on" required><input type="date" required value={purchaseForm.receivedAt} onChange={e => setPurchaseForm({ ...purchaseForm, receivedAt: e.target.value })} /></Field></div><div><div className="mb-2 flex items-center justify-between"><p className="text-xs font-semibold text-[#514945]">Products received</p><button type="button" onClick={addLine} className="text-xs font-semibold text-[#9a5e5d]">+ Add another line</button></div><div className="space-y-2">{lines.map((line,index) => <div key={index} className="grid gap-2 rounded-lg border border-[#eee6e1] p-3 sm:grid-cols-[minmax(0,1fr)_80px_110px_32px]"><Field label="Product / variant" required><select required value={line.productId === "" ? "" : `${line.productId}:${line.variantId ?? "-"}`} onChange={e => { const chosen = data.products.find(p => `${p.productId}:${p.variantId ?? "-"}` === e.target.value); updateLine(index, { productId: chosen?.productId ?? "", variantId: chosen?.variantId ?? null }); }}><option value="">Choose a product</option>{data.products.map(product => <option key={`${product.productId}:${product.variantId ?? "-"}`} value={`${product.productId}:${product.variantId ?? "-"}`}>{product.name}{product.label ? ` · ${product.label}` : ""} ({product.sku})</option>)}</select></Field><Field label="Qty" required><input type="number" min="1" step="1" required value={line.quantity} onChange={e => updateLine(index, { quantity: e.target.value })} /></Field><Field label="Cost / unit ₹" required><input type="number" min="0" step="0.01" required value={line.unitCost} onChange={e => updateLine(index, { unitCost: e.target.value })} /></Field><button type="button" aria-label="Remove line" disabled={lines.length === 1} onClick={() => removeLine(index)} className="mt-5 rounded-md p-2 text-[#857974] disabled:opacity-30"><X size={16} /></button></div>)}</div><p className="mt-2 text-right text-sm font-semibold text-[#292321]">Purchase total: {money(purchaseTotal)}</p></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Paid now ₹"><input type="number" min="0" max={purchaseTotal} step="0.01" value={purchaseForm.initialPayment} onChange={e => setPurchaseForm({ ...purchaseForm, initialPayment: e.target.value })} /></Field><Field label="Payment method"><select value={purchaseForm.initialPaymentMethod} onChange={e => setPurchaseForm({ ...purchaseForm, initialPaymentMethod: e.target.value })}><option value="bank_transfer">Bank transfer</option><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option><option value="other">Other</option></select></Field></div><Field label="Payment reference"><input maxLength={120} value={purchaseForm.initialPaymentReference} onChange={e => setPurchaseForm({ ...purchaseForm, initialPaymentReference: e.target.value })} placeholder="Bank / UPI transaction ID" /></Field><Field label="Purchase note"><textarea rows={2} maxLength={1000} value={purchaseForm.note} onChange={e => setPurchaseForm({ ...purchaseForm, note: e.target.value })} placeholder="Supplier invoice number or delivery note" /></Field><div className="rounded-lg bg-[#f8f3f0] p-3 text-xs text-[#716762]">Saving this receipt will add the quantities to stock and create a supplier balance for the unpaid amount.</div><ModalActions busy={busy} onCancel={() => setPurchaseModal(false)} submit="Receive stock & save purchase" /></form></Modal>}
  {paymentPurchase && <Modal title="Record supplier payment" onClose={() => !busy && setPaymentPurchase(null)}><form onSubmit={savePayment} className="space-y-3"><p className="rounded-lg bg-[#faf8f6] p-3 text-xs text-[#716762]">{paymentPurchase.supplier.name} · {paymentPurchase.purchaseNumber}<br />Outstanding: <strong>{money(paymentPurchase.due)}</strong></p><Field label="Amount ₹" required><input required type="number" min="0.01" max={paymentPurchase.due} step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} /></Field><Field label="Payment method" required><select value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}><option value="bank_transfer">Bank transfer</option><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option><option value="other">Other</option></select></Field><Field label="Transaction / cheque reference"><input maxLength={120} value={paymentForm.reference} onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })} /></Field><Field label="Note"><textarea rows={2} maxLength={500} value={paymentForm.note} onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })} /></Field><ModalActions busy={busy} onCancel={() => setPaymentPurchase(null)} submit="Save payment" /></form></Modal>}
  </main>;
}

function Metric({ icon, label, value, tone = "default" }: { icon: React.ReactNode; label: string; value: string; tone?: "default" | "amber" }) {
  return <article className="rounded-xl border border-[#eee6e1] bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs text-[#857974]">{label}</span><span className={`rounded-lg p-2 ${tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-[#f6f0ed] text-[#8a6256]"}`}>{icon}</span></div><p className="mt-3 text-xl font-semibold text-[#292321]">{value}</p></article>;
}
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-3 sm:p-5" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="supplier-modal-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a87567]">Supplier ledger</p><h2 id="supplier-modal-title" className="mt-1 text-lg font-semibold text-[#292321]">{title}</h2></div><button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-2 text-[#716762] hover:bg-[#f7f2ef]"><X size={18} /></button></div>{children}</section></div>;
}
function Field({ label, required, className = "", children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  const child = children as React.ReactElement<{ className?: string }>;
  const controlHeight = child.type === "textarea" ? "min-h-20 py-2" : "h-10";
  return <label className={`block min-w-0 text-xs font-medium text-[#514945] ${className}`}>{label}{required ? " *" : ""}{cloneElement(child, { className: `mt-1.5 ${controlHeight} w-full rounded-lg border border-[#ded6d1] bg-white px-3 text-sm font-normal text-[#292321] outline-none focus:border-[#b56f6f] ${child.props.className ?? ""}` })}</label>;
}
function ModalActions({ busy, onCancel, submit }: { busy: boolean; onCancel: () => void; submit: string }) {
  return <div className="flex justify-end gap-2 pt-2 sm:col-span-2"><button type="button" disabled={busy} onClick={onCancel} className="rounded-lg border border-[#ded6d1] px-4 py-2.5 text-sm text-[#625954]">Cancel</button><button disabled={busy} className="rounded-lg bg-[#292321] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : submit}</button></div>;
}
