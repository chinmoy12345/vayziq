import { productColors } from "@/lib/product-colors";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import WishlistRemoveButton from "@/components/product/WishlistRemoveButton";

export default async function WishlistPage() {
  const session = await getCurrentUser();
  const userId = Number(session?.sub);
  const entries = Number.isInteger(userId) ? await prisma.wishlistItem.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { product: { include: { options: { include: { values: true } }, category: { select: { name: true } }, images: { orderBy: { sortOrder: "asc" }, take: 1 } } } } }) : [];
  return <main><div className="mb-6 flex items-end justify-between"><div><p className="text-sm text-gray-500">My Account</p><h1 className="mt-1 text-2xl font-semibold text-gray-900">My Wishlist</h1><p className="mt-1 text-sm text-gray-500">{entries.length} {entries.length === 1 ? "item" : "items"} saved</p></div><Link href="/shop" className="hidden text-sm font-medium text-[#9b5c5c] hover:underline sm:block">Continue Shopping</Link></div>
    {entries.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">{entries.map(({ id, product }) => <article key={id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white"><div className="relative"><Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] bg-gray-100">{product.images[0]?.image ? <Image alt={product.name} className="object-cover" fill sizes="(max-width: 640px) 50vw, 25vw" src={product.images[0].image} /> : <div className="grid h-full place-items-center text-xs text-gray-400">No image</div>}</Link><WishlistRemoveButton productId={product.id} /></div><div className="p-4"><p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{product.category.name}</p><Link href={`/product/${product.slug}`}><h2 className="mt-1 line-clamp-2 text-sm font-medium text-gray-900 hover:text-[#9b5c5c]">{product.name}</h2></Link><p className="mt-2 text-xs text-gray-500">{productColors(product).length} Colors Available</p><p className="mt-2 text-sm font-semibold text-gray-900">₹{Number(product.price).toLocaleString("en-IN")}</p></div></article>)}</div> : <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#b56f6f]/10"><Heart className="h-6 w-6 text-[#9b5c5c]" /></div><h2 className="mt-4 text-lg font-semibold text-gray-900">Your wishlist is empty</h2><p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">Save your favourite products here for later.</p><Link href="/shop" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#9b5c5c] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#874e4e]"><ShoppingBag className="h-4 w-4" />Start Shopping</Link></div>}
  </main>;
}
