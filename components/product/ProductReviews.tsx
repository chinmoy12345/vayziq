"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, MessageSquare, Star } from "lucide-react";

import AuthModal from "@/components/auth/AuthModal";

export type CustomerReview = { id: number; name: string; rating: number; comment: string; createdAt: string };

function Stars({ rating }: { rating: number }) {
  return <span className="inline-flex gap-1" aria-label={`${rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map(value => <Star key={value} aria-hidden="true" className={`h-4 w-4 ${value <= Math.round(rating) ? "fill-[#B56F6F] text-[#B56F6F]" : "text-[#DCCACA]"}`} />)}</span>;
}

export default function ProductReviews({ productId, reviews }: { productId: number; reviews: CustomerReview[] }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [eligible, setEligible] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  useEffect(() => {
    let active = true;
    async function refreshSession() {
      try {
        const response = await fetch(`/api/reviews/eligibility?productId=${productId}`, { cache: "no-store" });
        const data = await response.json();
        if (active) { setSignedIn(response.ok && Boolean(data.signedIn)); setEligible(response.ok && Boolean(data.eligible)); }
      } catch { if (active) { setSignedIn(false); setEligible(false); } }
    }
    void refreshSession();
    window.addEventListener("focus", refreshSession);
    return () => { active = false; window.removeEventListener("focus", refreshSession); };
  }, [authOpen, productId]);
  const [sort, setSort] = useState("newest");
  const [visible, setVisible] = useState(5);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const sorted = [...reviews].sort((a, b) => sort === "highest" ? b.rating - a.rating || b.createdAt.localeCompare(a.createdAt) : sort === "lowest" ? a.rating - b.rating || b.createdAt.localeCompare(a.createdAt) : b.createdAt.localeCompare(a.createdAt));
  const fieldClass = "mt-2 w-full rounded-xl border border-[#E8DADA] bg-white px-4 py-3 text-base outline-none focus:border-[#B56F6F] focus:ring-2 focus:ring-[#B56F6F]/15";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signedIn) { setAuthOpen(true); return; }
    if (!eligible) { setError("Only customers who purchased this product can write a review."); return; }
    if (!rating) { setError("Please choose a star rating."); return; }
    const data = new FormData(event.currentTarget);
    setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, rating, comment: data.get("comment") }) });
      const result = await response.json();
      if (response.status === 401) { setSignedIn(false); setAuthOpen(true); }
      if (response.status === 403) setEligible(false);
      if (!response.ok) throw new Error(result.message || "Unable to submit your review. Please try again.");
      setSubmitted(true);
    } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setSubmitting(false); }
  }

  return <section id="reviews" aria-labelledby="reviews-title" className="mt-14 scroll-mt-28 border-t border-[#E8DADA] pt-10 sm:mt-20">
    <p className="text-[10px] font-semibold tracking-[0.25em] text-[#B56F6F]">FROM OUR CUSTOMERS</p>
    <h2 id="reviews-title" className="mt-2 font-serif text-3xl text-[#2B2525] sm:text-4xl">Customer reviews</h2>
    <div className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12">
      <div className="space-y-6">
        <div className="rounded-2xl border border-[#E8DADA] bg-[#F8EFEC] p-6">
          <div className="flex items-center gap-5"><span className="text-5xl font-semibold tracking-tight text-[#2B2525]">{reviews.length ? average.toFixed(1) : "—"}</span><div><Stars rating={average} /><p className="mt-1 text-xs text-[#7A6969]">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p></div></div>
          <div className="mt-6 space-y-2">{[5, 4, 3, 2, 1].map(value => { const count = reviews.filter(review => review.rating === value).length; return <div key={value} className="flex items-center gap-3 text-xs text-[#7A6969]"><span className="w-8">{value} star</span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E8DADA]"><div className="h-full rounded-full bg-[#B56F6F]" style={{ width: `${reviews.length ? count / reviews.length * 100 : 0}%` }} /></div><span className="w-5 text-right">{count}</span></div>; })}</div>
          <a href="#write-review" className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-[#B56F6F] px-4 text-sm font-semibold text-white hover:bg-[#9F5E5E]">Write a review</a>
        </div>
        <p className="px-1 text-xs leading-6 text-[#7A6969]">Share your thoughts on the fabric, fit and finish. Reviews are checked before publication.</p>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DADA] pb-4"><h3 className="font-medium text-[#2B2525]">All reviews ({reviews.length})</h3><label className="flex items-center gap-2 text-xs text-[#7A6969]">Sort by<select value={sort} onChange={event => { setSort(event.target.value); setVisible(5); }} className="min-h-11 rounded-lg border border-[#E8DADA] bg-white px-3 text-sm"><option value="newest">Most recent</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option></select></label></div>
        {!reviews.length ? <div className="rounded-xl bg-[#FAF7F5] px-5 py-12 text-center"><MessageSquare className="mx-auto h-8 w-8 text-[#B56F6F]" /><h3 className="mt-4 font-serif text-xl text-[#2B2525]">Be the first to share your experience</h3><p className="mt-2 text-sm text-[#7A6969]">Your review can help someone find their next favourite.</p></div> : <div className="divide-y divide-[#E8DADA]">{sorted.slice(0, visible).map(review => <article key={review.id} className="py-6"><div className="flex items-start gap-3"><div aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F8EFEC] font-semibold text-[#9F5E5E]">{review.name.charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><h4 className="break-words text-sm font-semibold text-[#2B2525]">{review.name}</h4><time dateTime={review.createdAt} className="text-xs text-[#9A8888]">{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(review.createdAt))}</time></div><div className="mt-2"><Stars rating={review.rating} /></div></div></div><p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-[#6D5B5B]">{review.comment}</p></article>)}</div>}
        {visible < reviews.length && <button type="button" onClick={() => setVisible(value => value + 5)} className="mt-3 min-h-11 rounded-xl border border-[#E8DADA] px-6 text-sm font-medium text-[#854F4F]">Show more reviews</button>}
        <div id="write-review" className="mt-10 scroll-mt-28 rounded-2xl border border-[#E8DADA] p-5 sm:p-7">
          {signedIn === null ? <p role="status" className="py-6 text-sm text-[#7A6969]">Checking your account…</p> : !signedIn ? <div className="py-6 text-center"><h3 className="font-serif text-2xl text-[#2B2525]">Share your experience</h3><p className="mt-2 text-sm text-[#7A6969]">Sign in to write a review for this product.</p><button type="button" onClick={() => setAuthOpen(true)} className="mt-5 min-h-12 rounded-xl bg-[#B56F6F] px-6 text-sm font-semibold text-white hover:bg-[#9F5E5E]">Sign In / Sign Up</button></div> : !eligible ? <div className="py-6 text-center"><h3 className="font-serif text-2xl text-[#2B2525]">Reviews from our customers</h3><p className="mt-2 text-sm leading-6 text-[#7A6969]">You can review this product after this product is delivered. Please use the same account you used to place the order.</p></div> : submitted ? <div role="status" className="py-6 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-[#B56F6F]" /><h3 className="mt-4 font-serif text-2xl">Thank you for your review</h3><p className="mt-2 text-sm leading-6 text-[#7A6969]">Your review has been submitted and will appear after approval.</p></div> : <form onSubmit={submit}>
            <h3 className="font-serif text-2xl text-[#2B2525]">Write a review</h3><p className="mt-2 text-sm text-[#7A6969]">How was your experience with this product?</p>
            <fieldset disabled={submitting} className="mt-6 space-y-5 disabled:opacity-60">
              <fieldset><legend className="mb-2 text-sm font-medium text-[#4F4444]">Your rating <span aria-hidden="true">*</span></legend><div className="flex flex-wrap gap-1">{[1, 2, 3, 4, 5].map(value => <label key={value} className="relative cursor-pointer"><input type="radio" name="rating" value={value} checked={rating === value} onChange={() => setRating(value)} className="peer sr-only" aria-label={`${value} ${value === 1 ? "star" : "stars"}`} /><span className="grid h-11 w-11 place-items-center rounded-lg peer-focus-visible:ring-2 peer-focus-visible:ring-[#B56F6F]"><Star aria-hidden="true" className={`h-7 w-7 ${value <= rating ? "fill-[#B56F6F] text-[#B56F6F]" : "text-[#DCCACA]"}`} /></span></label>)}</div>{rating > 0 && <p className="mt-1 text-xs text-[#7A6969]">{["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}</p>}</fieldset>
              <label className="block text-sm font-medium text-[#4F4444]">Your review *<textarea name="comment" required minLength={10} maxLength={2000} rows={5} placeholder="Tell us about the quality, comfort or fit…" className={`${fieldClass} resize-y`} /><span className="mt-1 block text-xs font-normal text-[#9A8888]">10–2,000 characters. Please avoid sharing personal details.</span></label>
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={submitting} className="min-h-12 w-full rounded-xl bg-[#B56F6F] px-7 text-sm font-semibold text-white hover:bg-[#9F5E5E] disabled:cursor-wait sm:w-auto">{submitting ? "Submitting…" : "Submit review"}</button>
            </fieldset>
          </form>}
        </div>
      </div>
    </div>
    <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => { setSignedIn(null); setEligible(false); setAuthOpen(false); setError(""); }} />
  </section>;
}
