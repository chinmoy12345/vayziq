import BannerSlider, { type BannerSlide } from "./BannerSlider";
export default function PageBanner({ banners, title, category = false }: { banners: BannerSlide[]; title: string; category?: boolean }) {
  return <BannerSlider slides={banners.slice(0, 1)} label={`${title} banner`} category={category} />;
}
