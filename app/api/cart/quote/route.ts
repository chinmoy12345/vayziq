import { NextResponse } from "next/server";
import { resolveCart } from "@/lib/cart-pricing";
export async function POST(request: Request) {
  try { const { items } = await request.json(); const lines = await resolveCart(items); return NextResponse.json({ items: lines.map(line=>({ id:line.product.id, price:line.price, quantity:line.quantity, variantId:line.variantId })) }); }
  catch(error){return NextResponse.json({ message:error instanceof Error?error.message:"Unable to refresh prices." },{status:400});}
}
