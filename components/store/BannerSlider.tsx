import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProgressiveImage from "@/components/ui/ProgressiveImage";
import styles from "@/components/home/VayziqHome.module.css";
import bannerStyles from "./BannerSlider.module.css";

export type BannerSlide = {
  title: string;
  image?: string;
  link: string | null;
  subtitle?: string | null;
  overlayText?: boolean;
  promo?: { eyebrow: string; headline: string; detail: string; code?: string; theme: "rose" | "dark" };
};

export default function BannerSlider({ slides, label, hero = false, category = false }: { slides: BannerSlide[]; label: string; hero?: boolean; category?: boolean }) {
  const slide = slides[0];
  if (!slide) return null;

  const title = slide.promo?.headline ?? slide.title;
  const subtitle = slide.promo?.detail ?? slide.subtitle;
  const image = slide.image || "/vayziq/hero-paired-v2.png";
  const content = <>
    <div className="absolute inset-0"><ProgressiveImage src={image} alt={title} loading="eager" className="h-full w-full object-cover object-center" /></div>
    <span className={styles.heroShade} aria-hidden="true" />
    <span className={`${styles.heroContent} ${hero ? "" : bannerStyles.compactContent}`}>
      <span className={`${styles.heroEyebrow} ${bannerStyles.eyebrow}`}>{slide.promo?.eyebrow ?? "VAYZIQ · EVERYDAY STREETWEAR"}</span>
      <strong>{title}</strong>
      {subtitle && <span className={`${bannerStyles.subtitle} mt-3 max-w-lg text-sm leading-6 text-white/90 sm:text-base`}>{subtitle}</span>}
      {slide.link && <span className={`${styles.heroCta} ${bannerStyles.cta}`}>Explore collection <ArrowRight size={18} /></span>}
    </span>
  </>;

  return <section aria-label={label} className={`${styles.heroSlider} ${hero ? "" : category ? bannerStyles.categoryHero : bannerStyles.standardHero}`}>
    {slide.link ? <Link href={slide.link} className={styles.heroSlide}>{content}</Link> : <div className={styles.heroSlide}>{content}</div>}
  </section>;
}
