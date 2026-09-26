import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isSafeInteger(productId) || productId < 1) {
    return NextResponse.json({ message: "Invalid product." }, { status: 400 });
  }

  let body: { action?: unknown; liked?: unknown; visitorId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
  if (body.action !== "like" && body.action !== "share") {
    return NextResponse.json({ message: "Invalid engagement action." }, { status: 400 });
  }
  if (typeof body.visitorId !== "string" || !UUID_PATTERN.test(body.visitorId)) {
    return NextResponse.json({ message: "Invalid visitor token." }, { status: 400 });
  }
  if (body.action === "like" && typeof body.liked !== "boolean") {
    return NextResponse.json({ message: "Choose whether this product is liked." }, { status: 400 });
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, status: "active" },
    select: { id: true },
  });
  if (!product) return NextResponse.json({ message: "Product not found." }, { status: 404 });

  try {
    const counts = await prisma.$transaction(async (tx) => {
      await tx.productEngagement.upsert({
        where: { productId },
        create: { productId },
        update: {},
      });

      if (body.action === "share") {
        await tx.productEngagement.update({
          where: { productId },
          data: { shareCount: { increment: 1 } },
        });
      } else if (body.liked) {
        const existing = await tx.productLike.findUnique({
          where: { productId_visitorId: { productId, visitorId: body.visitorId as string } },
          select: { productId: true },
        });
        if (!existing) {
          await tx.productLike.create({ data: { productId, visitorId: body.visitorId as string } });
          await tx.productEngagement.update({
            where: { productId },
            data: { likeCount: { increment: 1 } },
          });
        }
      } else {
        const removed = await tx.productLike.deleteMany({ where: { productId, visitorId: body.visitorId as string } });
        if (removed.count) {
          await tx.productEngagement.update({
            where: { productId },
            data: { likeCount: { decrement: 1 } },
          });
        }
      }

      return tx.productEngagement.findUniqueOrThrow({
        where: { productId },
        select: { likeCount: true, shareCount: true },
      });
    });

    return NextResponse.json(counts);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2021") {
      return NextResponse.json({ message: "Engagement data tables are not synchronized yet." }, { status: 503 });
    }
    throw error;
  }
}
