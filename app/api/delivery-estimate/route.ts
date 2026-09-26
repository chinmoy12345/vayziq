import { NextRequest, NextResponse } from "next/server";
import { isDeliveryZipAllowed } from "@/lib/delivery-zip-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const pincode = request.nextUrl.searchParams.get("pincode")?.trim() ?? "";
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return NextResponse.json({ success: false, message: "Enter a valid 6-digit PIN code." }, { status: 400 });
  }
  if (!(await isDeliveryZipAllowed(pincode))) {
    return NextResponse.json({ success: false, message: "Sorry, delivery is not available to this PIN code yet." }, { status: 422 });
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error("PIN lookup failed");
    const records = await response.json();
    const offices = records?.[0]?.Status === "Success" ? records[0].PostOffice : null;
    if (!Array.isArray(offices) || offices.length === 0) {
      return NextResponse.json({ success: false, message: "We couldn't find this PIN code. Please check it and try again." }, { status: 404 });
    }

    const locality = offices.find((office: { DeliveryStatus?: string }) => office.DeliveryStatus === "Delivery");
    if (!locality) return NextResponse.json({ success: false, message: "No postal delivery service is listed for this PIN code." }, { status: 422 });
    const district = String(locality.District ?? "").trim();
    const state = String(locality.State ?? "").trim();
    const destination = [district, state].filter(Boolean).join(", ");
    const addBusinessDays = (days: number) => {
      const date = new Date();
      let added = 0;
      while (added < days) {
        date.setUTCDate(date.getUTCDate() + 1);
        const day = date.getUTCDay();
        if (day !== 0 && day !== 6) added += 1;
      }
      return date;
    };
    const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
    const deliveryWindow = `${dateFormat.format(addBusinessDays(4))}–${dateFormat.format(addBusinessDays(7))}`;
    return NextResponse.json({
      success: true,
      destination: destination || `PIN ${pincode}`,
      estimate: "4–7 working days",
      deliveryWindow,
      message: `Estimated delivery ${deliveryWindow} to ${destination || `PIN ${pincode}`} (4–7 working days).`,
    });
  } catch {
    return NextResponse.json({ success: false, message: "Delivery estimate is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
