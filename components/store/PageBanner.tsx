import BannerSlider, { type BannerSlide } from "./BannerSlider";
export default function PageBanner({ banners, title, category = false }: { banners: BannerSlide[]; title: string; category?: boolean }) {
  return <BannerSlider slides={banners} label={`${title} banners`} category={category} />;
}
