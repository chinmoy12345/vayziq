import Link from "next/link";
import { getActiveBanners } from "@/lib/storefront";

const demoOffers = [
  { code: "BUY2SAVE50", title: "Buy 2, save ₹50", subtitle: "A little something extra for your next two favourites.", eyebrow: "THE MORE YOU LOVE", tone: "rose" },
  { code: "BUY3SAVE90", title: "Buy 3, save ₹90", subtitle: "Choose three pieces and enjoy more for less.", eyebrow: "MORE TO LOVE", tone: "dark" },
] as const;

export default async function OfferZone() {
  const banners = await getActiveBanners("offer-zone");
  const repeatedImageUrls = new Set(banners.filter((banner, index) => banners.findIndex(other => other.image === banner.image) !== index).map(banner => banner.image));
  const editorialImages = ["/uploads/banners/offer-nightwear-editorial.png", "/uploads/banners/offer-saree-editorial.png"];
  let repeatedImageIndex = 0;

  return <section aria-labelledby="offer-zone-title" className="mx-auto w-full min-w-0 max-w-7xl overflow-x-clip px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
    <div className="flex items-end justify-between gap-4">
      <div><p className="text-[10px] font-semibold tracking-[0.22em] text-[#9F5E5E]">A LITTLE SOMETHING EXTRA</p><h2 id="offer-zone-title" className="mt-2 font-serif text-2xl text-[#2B2525] sm:text-3xl">Offer Zone</h2><div className="mt-3 h-0.5 w-12 bg-[#B56F6F]" /></div>
      <span className="hidden pb-1 text-[10px] tracking-[0.12em] text-[#8A7777] sm:block">THOUGHTFUL SAVINGS, JUST FOR YOU</span>
    </div>
    <div className="mt-5 grid w-full min-w-0 max-w-full grid-cols-2 gap-3 sm:mt-6 sm:gap-4">
      {demoOffers.map((offer, index) => <Link key={offer.code} href={"/offers/" + offer.code.toLowerCase()} aria-label={offer.title + ". Use offer code " + offer.code + "."} className="group relative block h-[clamp(150px,38vw,250px)] w-full min-w-0 overflow-hidden rounded-sm bg-[#F8EFEC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B56F6F]"><img src={editorialImages[index]} alt="" loading="lazy" className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#211918]/90 via-[#211918]/45 to-transparent px-3 pb-3 pt-10 text-white sm:px-5 sm:pb-5 sm:pt-14"><span className="text-[7px] font-semibold tracking-[0.18em] text-white/85 sm:text-[9px]">{offer.eyebrow}</span><h3 className="mt-1 font-serif text-sm leading-tight sm:mt-2 sm:text-xl md:text-2xl">{offer.title}</h3><p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-white/90 sm:mt-2 sm:text-xs">{offer.subtitle}</p><span className="mt-2 inline-block border border-white/70 px-2 py-1 text-[7px] font-semibold tracking-[0.12em] sm:mt-3 sm:px-3 sm:py-1.5 sm:text-[9px]">CODE&nbsp; {offer.code}</span></div></Link>)}
      {banners.map(banner => { const useEditorialImage = repeatedImageUrls.has(banner.image); const image = useEditorialImage ? editorialImages[repeatedImageIndex++ % editorialImages.length] : banner.image; return <Link key={banner.id} href={"/offers/" + banner.id} aria-label={banner.title || "Shop this offer"} className="group relative block h-[clamp(150px,38vw,250px)] w-full min-w-0 overflow-hidden rounded-sm bg-[#F8EFEC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B56F6F]"><img src={image} alt="" loading="lazy" className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#211918]/90 via-[#211918]/45 to-transparent px-3 pb-3 pt-10 text-white sm:px-5 sm:pb-5 sm:pt-14">{banner.title && <h3 className="font-serif text-sm leading-tight sm:text-xl md:text-2xl">{banner.title}</h3>}{banner.subtitle && <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-white/90 sm:mt-2 sm:text-xs">{banner.subtitle}</p>}</div></Link>; })}
    </div>    <p className="mt-3 px-0.5 text-[10px] leading-relaxed text-[#8A7777]">Offer codes apply to eligible products at checkout. One offer code per order.</p>
  </section>;
}