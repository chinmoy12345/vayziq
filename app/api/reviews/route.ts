import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser, requireAdminPermission } from "@/lib/auth";
import { hasPurchasedProduct } from "@/lib/review-eligibility";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdminPermission("reviews","view"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const reviews = await prisma.review.findMany({ include: { product: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data: reviews });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdminPermission("reviews","update"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id, approved } = await request.json();
  const review = await prisma.review.update({ where: { id: Number(id) }, data: { approved: Boolean(approved) } });
  return NextResponse.json({ success: true, data: review });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdminPermission("reviews","delete"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  await prisma.review.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  const session = await getCurrentUser();
  const userId = Number(session?.sub);
  if (!session || !Number.isInteger(userId) || userId < 1) return NextResponse.json({ message: "Please sign in to write a review." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ message: "Invalid review." }, { status: 400 });
  const { productId, rating } = body;
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 10 || comment.length > 2000) {
    return NextResponse.json({ message: "Please select a rating from 1 to 5 and write a review of 10–2,000 characters." }, { status: 400 });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, status: true } });
    if (!user || user.status !== "active") return NextResponse.json({ message: "Please sign in with an active account to write a review." }, { status: 401 });
    const product = await prisma.product.findFirst({ where: { id: productId, status: "active", category: { status: "active" } }, select: { id: true } });
    if (!product) return NextResponse.json({ message: "This product is unavailable." }, { status: 404 });
    if (!(await hasPurchasedProduct(userId, productId))) return NextResponse.json({ message: "You can review this product after this product is delivered." }, { status: 403 });
    await prisma.review.create({ data: { productId, userId, rating, name: user.name, comment, email: user.email.endsWith("@account.susmitas.local") ? null : user.email, approved: false } });
    return NextResponse.json({ success: true, message: "Your review is awaiting approval." }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to submit your review. Please try again." }, { status: 500 });
  }
}
