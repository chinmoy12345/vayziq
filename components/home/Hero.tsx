import BannerSlider, { type BannerSlide } from "@/components/store/BannerSlider";
export default function Hero({ banners }: { banners: BannerSlide[] }) {
  return <BannerSlider hero label="Featured collections" slides={banners} />;
}
