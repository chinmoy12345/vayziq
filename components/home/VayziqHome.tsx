"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Heart, PackageCheck, Play, ShieldCheck, ShoppingBag, Truck, Undo2 } from "lucide-react";
import HomeHeader from "./HomeHeader";
import HomeFooter from "./HomeFooter";
import styles from "./VayziqHome.module.css";

const banners = [
  { image: "/vayziq/hero-paired-v2.png", alt: "VAYZIQ everyday collection" },
  { image: "/vayziq/category-women.png", alt: "VAYZIQ women collection" },
  { image: "/vayziq/category-men.png", alt: "VAYZIQ men collection" },
  { image: "/vayziq/fashion-grid.png", alt: "VAYZIQ fashion essentials" },
];
const categories = [["Men", "/vayziq/category-men.png"], ["Women", "/vayziq/category-women.png"], ["Joggers", "/vayziq/category-joggers.png"], ["Hoodies", "/vayziq/product-hoodie.png"], ["T-Shirts", "/vayziq/product-tshirt.png"], ["Tracksuits", "/vayziq/category-women.png"], ["Accessories", "/vayziq/fashion-grid.png"]] as const;
const products = [["Essential Joggers", "₹699", "/vayziq/product-joggers.png", "4.8 (128)"], ["Oversized Hoodie", "₹999", "/vayziq/product-hoodie.png", "4.7 (96)"], ["Classic T-Shirt", "₹499", "/vayziq/product-tshirt.png", "4.6 (82)"], ["Tech Joggers", "₹799", "/vayziq/category-joggers.png", "4.8 (104)"], ["Track Suit Set", "₹1,499", "/vayziq/category-women.png", "4.7 (68)"], ["Premium Cap", "₹399", "/vayziq/fashion-grid.png", "4.6 (45)"]] as const;
const looks = ["/vayziq/category-men.png", "/vayziq/category-women.png", "/vayziq/category-joggers.png", "/vayziq/fashion-grid.png"];

function SectionHeading({ title }: { title: string }) { return <div className={styles.sectionHeading}><h2>{title}</h2><Link href="/shop">View All <ChevronRight /></Link></div>; }

export default function VayziqHome() {
  const [bannerStart, setBannerStart] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const timer = window.setInterval(() => setBannerStart(index => (index + 1) % banners.length), 5000); return () => window.clearInterval(timer); }, []);
  const visibleBanners = Array.from({ length: 3 }, (_, index) => banners[(bannerStart + index) % banners.length]);
  const toggleLike = (index: number) => setLiked(current => current.includes(index) ? current.filter(item => item !== index) : [...current, index]);
  return <div className={`${styles.home} vayziq-home`}>
    <HomeHeader />
    <main><section className={styles.bannerSection} aria-label="Campaign banners"><div className={styles.desktopBanners}>{visibleBanners.map((banner, index) => <Link className={styles.bannerCard} href="/shop" key={`${banner.alt}-${index}`}><Image src={banner.image} alt={banner.alt} fill priority={index === 0} sizes="(max-width: 1023px) 48vw, 32vw" quality={100} /></Link>)}</div><Link className={styles.mobileBanner} href="/shop"><Image src={banners[bannerStart].image} alt={banners[bannerStart].alt} fill priority sizes="100vw" quality={100} /></Link><div className={styles.dots} aria-label="Banner pagination">{banners.map((banner, index) => <button key={banner.alt} onClick={() => setBannerStart(index)} aria-label={`Show banner ${index + 1}`} className={index === bannerStart ? styles.activeDot : ""} />)}</div></section>
      <SectionHeading title="Shop by Category" /><section className={styles.categoryStrip}>{categories.map(([title, image]) => <Link className={styles.categoryCard} href="/shop" key={title}><Image src={image} alt={`${title} collection`} fill sizes="(max-width: 767px) 84px, 14vw" quality={100} /><span>{title}<ChevronRight /></span></Link>)}</section>
      <section className={styles.collection}><div className={styles.collectionHead}><h2>Best Sellers</h2><div className={styles.tabs}>{["Best Sellers", "New Arrivals", "Joggers", "Hoodies", "T-Shirts", "Tracksuits"].map((tab, index) => <button className={index === 0 ? styles.selectedTab : ""} key={tab}>{tab}</button>)}</div><a href="#">View All <ChevronRight /></a></div><div className={styles.productGrid}>{products.map(([title, price, image, rating], index) => <article className={styles.productCard} key={title}><Link href="#" className={styles.productImage}><Image src={image} alt={title} fill sizes="(max-width: 767px) 46vw, 17vw" quality={100} /><span>Best Seller</span></Link><button className={liked.includes(index) ? styles.liked : ""} onClick={() => toggleLike(index)} aria-label={`Add ${title} to wishlist`}><Heart fill={liked.includes(index) ? "currentColor" : "none"} /></button><h3>{title}</h3><strong>{price}</strong><div className={styles.productMeta}><i /><i /><i /><em>★</em> {rating}</div></article>)}</div></section>
      <SectionHeading title="Shop by Mood" /><section className={styles.moods}>{["Streetwear", "Athleisure", "Minimal", "Oversized"].map((mood, index) => <a href="#" key={mood}><Image src={looks[index]} alt={mood} fill sizes="(max-width: 767px) 250px, 24vw" quality={100} /><span>{mood}<ChevronRight /></span></a>)}</section><SectionHeading title="Watch & Buy" /><section className={styles.watch}>{looks.map((image, index) => <article key={image}><Image src={image} alt="Watch and buy look" fill sizes="(max-width: 767px) 175px, 20vw" quality={100} /><button aria-label="Play look"><Play fill="currentColor" /></button><p>{products[index][0]}<strong>{products[index][1]}</strong></p><ShoppingBag /></article>)}</section>
      <section className={styles.trust}>{[[Truck,"Free Shipping","On Orders over ₹999"],[Undo2,"Easy 7-Day Returns","Hassle Free"],[ShieldCheck,"100% Original","Premium Quality"],[PackageCheck,"Secure Payments","100% Safe & Secure"]].map(([Icon,title,caption]) => { const Feature = Icon as typeof Truck; return <div key={title as string}><Feature /><span><b>{title as string}</b><small>{caption as string}</small></span></div>; })}</section><HomeFooter /></main>
  </div>;
}
