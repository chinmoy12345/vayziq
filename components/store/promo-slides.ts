import type { BannerSlide } from "@/components/store/BannerSlider";

export function getQuantityOfferSlides(context = "the collection", destination = "/shop"): BannerSlide[] {
  return [
    { title: `The new season · ${context}`, image: "", link: destination, promo: { eyebrow: "THE NEW SEASON EDIT", headline: `Discover ${context}`, detail: "Considered styles, beautiful details and pieces made for your everyday moments.", theme: "rose" } },
    { title: "Buy 2 · Save ₹50", image: "", link: destination, promo: { eyebrow: "A LITTLE SOMETHING EXTRA", headline: "Buy 2 · Save ₹50", detail: "Add two eligible pieces to your bag and apply this offer at checkout.", code: "BUY2SAVE50", theme: "dark" } },
    { title: "Buy 3 · Save ₹90", image: "", link: destination, promo: { eyebrow: "MORE TO LOVE", headline: "Buy 3 · Save ₹90", detail: "Choose three eligible pieces and apply your offer in the cart.", code: "BUY3SAVE90", theme: "rose" } },
  ];
}