import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type InvoiceData = {
  number: string; orderNumber: string; store: string; customer: string; address: string[];
  orderedAt: Date; deliveredAt: Date; productName: string; sku: string; quantity: number;
  unitPrice: number; subtotal: number; shipping: number; discount: number; total: number;
  paymentStatus: string; carrier: string; trackingNumber: string;
};

// Cumulative rounding allocates each order-level charge exactly once across items.
export function allocatedAmount(amount: number, weights: number[], index: number) {
  const sum = weights.reduce((total, weight) => total + weight, 0);
  const before = sum ? weights.slice(0, index).reduce((total, weight) => total + weight, 0) / sum : index / weights.length;
  const after = sum ? weights.slice(0, index + 1).reduce((total, weight) => total + weight, 0) / sum : (index + 1) / weights.length;
  const cents = Math.round(amount * 100);
  return (Math.round(cents * after) - Math.round(cents * before)) / 100;
}

export async function createItemInvoice(data: InvoiceData) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const bengaliBytes = await readFile(path.join(process.cwd(), "public/fonts/NotoSansBengali.ttf"));
  const latin = await pdf.embedFont(StandardFonts.Helvetica);
  const bengali = await pdf.embedFont(bengaliBytes, { subset: true });
  let page = pdf.addPage([595.28, 841.89]);
  let y = 789;
  const ink = rgb(0.17, 0.15, 0.15);
  const muted = rgb(0.45, 0.41, 0.41);
  const accent = rgb(0.62, 0.35, 0.35);
  const width = 499;
  const date = (value: Date) => value.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
  const money = (value: number) => "INR " + (value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function ensure(height: number) { if (y - height < 65) { page = pdf.addPage([595.28, 841.89]); y = 789; } }
  function text(value: string, size = 11, color = ink) {
    const font: PDFFont = /[\u0980-\u09FF]/.test(value) ? bengali : latin;
    for (const paragraph of value.replace(/[\u0000-\u0008\u000B-\u001F]/g, "").split("\n")) {
      let line = "";
      for (const char of paragraph) {
        if (font.widthOfTextAtSize(line + char, size) > width && line) { ensure(size + 8); page.drawText(line, { x: 48, y, size, font, color }); y -= size + 8; line = ""; }
        line += char;
      }
      ensure(size + 8); page.drawText(line, { x: 48, y, size, font, color }); y -= size + 8;
    }
  }
  function rule() { ensure(20); y -= 6; page.drawLine({ start: { x: 48, y }, end: { x: 547, y }, color: rgb(0.89, 0.84, 0.84), thickness: 1 }); y -= 20; }
  function row(label: string, amount: number, strong = false) {
    ensure(25); const value = money(amount); const size = strong ? 14 : 11;
    page.drawText(label, { x: 48, y, font: latin, size, color: strong ? accent : muted });
    page.drawText(value, { x: 547 - latin.widthOfTextAtSize(value, size), y, font: latin, size, color: strong ? accent : ink }); y -= 26;
  }
  pdf.setTitle(data.number); pdf.setAuthor(data.store);
  text(data.store, 22, accent); text("INVOICE", 12, muted); rule();
  text("Invoice: " + data.number); text("Order: " + data.orderNumber);
  text("Order date: " + date(data.orderedAt) + "   |   Delivered: " + date(data.deliveredAt), 10, muted);
  rule(); text("BILLED / DELIVERED TO", 10, accent); text(data.customer);
  for (const line of data.address) if (line) text(line, 10, muted);
  rule(); text("ITEM DETAILS", 10, accent); text(data.productName, 13);
  text("SKU: " + data.sku, 10, muted);
  text("Quantity: " + data.quantity + "   |   Unit price: " + money(data.unitPrice), 11);
  rule(); row("Item subtotal", data.subtotal); row("Allocated shipping", data.shipping); row("Allocated discount", -data.discount); row("Invoice total", data.total, true);
  rule(); text("Payment status: " + data.paymentStatus, 10, muted);
  text("Courier: " + data.carrier, 10, muted); text("Tracking: " + data.trackingNumber, 10, muted);
  text("This invoice covers only the item listed above. Order-level shipping and discounts are allocated proportionally across items.", 9, muted);
  if (data.orderNumber.startsWith("DUMMY-")) text("DEMO ORDER - FOR TESTING ONLY", 11, accent);
  const pages = pdf.getPages();
  pages.forEach((current, index) => current.drawText("Page " + (index + 1) + " of " + pages.length, { x: 48, y: 32, font: latin, size: 9, color: muted }));
  return pdf.save();
}
