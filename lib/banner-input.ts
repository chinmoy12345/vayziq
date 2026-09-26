import prisma from "@/lib/db";
export const bannerPlacements = ["home", "offer-zone", "shop", "search"];
export function safeBannerLink(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const link = value.trim();
  if (!/^\/(?:shop|sarees|kurtis|nightwear|product\/[^/?#]+|cart|search|[a-z0-9]+(?:-[a-z0-9]+)*)(?:[?#].*)?$/.test(link) || /[\\\s]/.test(link) || /%5c|%0a|%0d/i.test(link)) throw new Error("Choose a supported internal destination.");
  return link;
}
export async function bannerInput(body: Record<string, unknown>) {
  const placement = String(body.placement);
  const categoryPlacement = placement.match(/^category:([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  if (!bannerPlacements.includes(placement) && !categoryPlacement) throw new Error("Choose a valid banner placement.");
  if (categoryPlacement && !await prisma.category.findFirst({ where: { slug: categoryPlacement[1], status: "active" }, select: { id: true } })) throw new Error("Choose an active category for this banner.");
  const image = typeof body.image === "string" ? body.image.trim() : "";
  if (!image || image.length > 2900000 || !(/^(\/[^/]|https:\/\/|data:image\/(png|jpeg|webp);base64,)/.test(image))) throw new Error("Upload a valid banner image.");
  let link = safeBannerLink(body.link);
  if (body.productId !== undefined && body.productId !== null && body.productId !== "") {
    const id = Number(body.productId); if (!Number.isSafeInteger(id)) throw new Error("Select a valid product.");
    const product = await prisma.product.findFirst({ where: { id, status: "active", category: { status: "active" } }, select: { slug: true } });
    if (!product) throw new Error("Selected product is not available.");
    link = "/product/" + product.slug;
  }
  if (body.placement === "offer-zone" && !link) throw new Error("Choose a product or destination for the Offer Zone banner.");
  const sortOrder = Number(body.sortOrder ?? 0);
  if (!Number.isSafeInteger(sortOrder) || sortOrder < 0 || sortOrder > 100000) throw new Error("Enter a valid slide position.");
  return { title: typeof body.title === "string" ? body.title.trim().slice(0,150) : "", subtitle: typeof body.subtitle === "string" ? body.subtitle.trim().slice(0,300) || null : null, image, link, placement, active: body.active !== false, sortOrder };
}
