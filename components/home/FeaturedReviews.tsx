import Link from "next/link";
import { Star } from "lucide-react";
import prisma from "@/lib/db";

export default async function FeaturedReviews() {
  const reviews = await prisma.review.findMany({
    where: { approved: true, rating: { gte: 4 } },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: {
      id: true,
      name: true,
      rating: true,
      comment: true,
      product: { select: { name: true, slug: true } },
    },
  });

  return <section aria-labelledby="featured-reviews-title" className="border-y border-[#E8DADA] bg-[#FAF5F2] py-14 sm:py-20">
    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-[#9F5E5E]">KIND WORDS, WORN WITH LOVE</p>
          <h2 id="featured-reviews-title" className="mt-2 font-serif text-3xl text-[#2B2525] sm:text-4xl">Loved by our customers</h2>
        </div>
        <Link href="/shop" className="text-xs font-medium tracking-wide text-[#8A5555] transition hover:text-[#633D3D]">EXPLORE THE COLLECTION →</Link>
      </div>

      {reviews.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
        {reviews.map(review => <article key={review.id} className="flex min-h-[220px] flex-col border border-[#E8DADA] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" className={`h-3.5 w-3.5 ${index < review.rating ? "fill-[#B56F6F] text-[#B56F6F]" : "text-[#E8DADA]"}`} />)}
            <span className="ml-1 text-xs font-medium text-[#554646]">{review.rating}.0</span>
          </div>
          <p className="mt-4 flex-1 text-sm leading-6 text-[#655656]">“{review.comment}”</p>
          <div className="mt-5 border-t border-[#F0E8E5] pt-4">
            <p className="text-sm font-semibold text-[#2B2525]">{review.name}</p>
            <Link href={`/product/${review.product.slug}#reviews`} className="mt-1 block text-xs text-[#946666] hover:underline">Reviewed: {review.product.name}</Link>
          </div>
        </article>)}
      </div> : <div className="mt-8 border border-[#E8DADA] bg-white px-6 py-10 text-center sm:mt-10"><p className="font-serif text-xl text-[#2B2525]">Your story could be featured here</p><p className="mt-2 text-sm text-[#756565]">Shop the collection and share your experience after delivery.</p><Link href="/shop" className="mt-5 inline-flex min-h-11 items-center border border-[#B56F6F] px-5 text-xs font-semibold tracking-wide text-[#8A5555] hover:bg-[#B56F6F] hover:text-white">SHOP THE COLLECTION</Link></div>}
    </div>
  </section>;
}
