"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Heart, PackageCheck, Play, ShieldCheck, ShoppingBag, Truck, Undo2 } from "lucide-react";
import type { VayziqHomeData } from "@/lib/vayziq-home-data";
import ProductVideo from "@/components/product/ProductVideo";
import HomeHeader from "./HomeHeader";
import HomeFooter from "./HomeFooter";
import styles from "./VayziqHome.module.css";

function SectionHeading({ title }: { title: string }) { return <div className={styles.sectionHeading}><h2>{title}</h2><Link href="/shop">View All <ChevronRight /></Link></div>; }

export default function VayziqHome({ initialData }: { initialData: VayziqHomeData }) {
  const [bannerStart, setBannerStart] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("Best Sellers");
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const { banners, categories, products } = initialData;
  const looks = products.slice(0, 4).map((product) => product.image);
  const watchProducts = products.filter((product) => product.videoUrl).slice(0, 4);
  const activeVideo = watchProducts.find((product) => product.id === activeVideoId) ?? null;
  const tabs = ["Best Sellers", "New Arrivals", "Joggers", "Hoodies", "T-Shirts", "Tracksuits"];
  const visibleProducts = (activeTab === "Best Sellers" ? products : activeTab === "New Arrivals" ? [...products].reverse() : products.filter((product) => `${product.name} ${product.category}`.toLowerCase().replace(/[^a-z0-9]/g, "").includes(activeTab.toLowerCase().replace(/[^a-z0-9]/g, "")))).slice(0, 6);
  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || banners.length < 2) return; const timer = window.setInterval(() => setBannerStart(index => (index + 1) % banners.length), 5000); return () => window.clearInterval(timer); }, [banners.length]);
  const visibleBanners = Array.from({ length: Math.min(3, banners.length) }, (_, index) => banners[(bannerStart + index) % banners.length]);
  const toggleLike = (id: number) => setLiked(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  return <div className={`${styles.home} vayziq-home`}>
    <HomeHeader />
    <main><section className={styles.bannerSection} aria-label="Campaign banners"><div className={styles.desktopBanners}>{visibleBanners.map((banner, index) => <Link className={styles.bannerCard} href={banner.href} key={`${banner.alt}-${index}`}><Image src={banner.image} alt={banner.alt} fill priority={index === 0} sizes="(max-width: 1023px) 48vw, 32vw" quality={100} /></Link>)}</div>{banners[0] && <Link className={styles.mobileBanner} href={banners[bannerStart].href}><Image src={banners[bannerStart].image} alt={banners[bannerStart].alt} fill priority sizes="100vw" quality={100} /></Link>}<div className={styles.dots} aria-label="Banner pagination">{banners.map((banner, index) => <button key={`${banner.alt}-${index}`} onClick={() => setBannerStart(index)} aria-label={`Show banner ${index + 1}`} className={index === bannerStart ? styles.activeDot : ""} />)}</div></section>
      <SectionHeading title="Shop by Category" /><section className={styles.categoryStrip}>{categories.map((category) => <Link className={styles.categoryCard} href={`/${category.slug}`} key={category.id}><Image src={category.image} alt={`${category.name} collection`} fill sizes="(max-width: 767px) 84px, 14vw" quality={100} /><span>{category.name}<ChevronRight /></span></Link>)}</section>
      <section className={styles.collection}><div className={styles.collectionHead}><h2>Best Sellers</h2><div className={styles.tabs}>{tabs.map((tab) => <button onClick={() => setActiveTab(tab)} className={activeTab === tab ? styles.selectedTab : ""} key={tab}>{tab}</button>)}</div><Link href="/shop">View All <ChevronRight /></Link></div><div className={styles.productGrid}>{visibleProducts.map((product) => <article className={styles.productCard} key={product.id}><Link href={`/product/${product.slug}`} className={styles.productImage}><Image src={product.image} alt={product.name} fill sizes="(max-width: 767px) 46vw, 17vw" quality={100} /><span>Best Seller</span></Link><button className={liked.includes(product.id) ? styles.liked : ""} onClick={() => toggleLike(product.id)} aria-label={`Add ${product.name} to wishlist`}><Heart fill={liked.includes(product.id) ? "currentColor" : "none"} /></button><h3>{product.name}</h3><strong>{product.price}</strong><div className={styles.productMeta}><i /><i /><i /><em>★</em> {product.rating}</div></article>)}</div></section>
      <SectionHeading title="Shop by Mood" /><section className={styles.moods}>{["Streetwear", "Athleisure", "Minimal", "Oversized"].map((mood, index) => looks[index] && <Link href="/shop" key={mood}><Image src={looks[index]} alt={mood} fill sizes="(max-width: 767px) 250px, 24vw" quality={100} /><span>{mood}<ChevronRight /></span></Link>)}</section><SectionHeading title="Watch & Buy" /><section className={styles.watch}>{watchProducts.map((product) => <article key={product.id}><Image src={product.image} alt={`${product.name} video`} fill sizes="(max-width: 767px) 175px, 20vw" quality={100} /><button onClick={() => setActiveVideoId(product.id)} aria-label={`Play ${product.name}`}><Play fill="currentColor" /></button><p>{product.name}<strong>{product.price}</strong></p><ShoppingBag /></article>)}</section>
      <section className={styles.trust}>{[[Truck,"Free Shipping","On Orders over ₹999"],[Undo2,"Easy 7-Day Returns","Hassle Free"],[ShieldCheck,"100% Original","Premium Quality"],[PackageCheck,"Secure Payments","100% Safe & Secure"]].map(([Icon,title,caption]) => { const Feature = Icon as typeof Truck; return <div key={title as string}><Feature /><span><b>{title as string}</b><small>{caption as string}</small></span></div>; })}</section><HomeFooter /></main>
    {activeVideo && activeVideo.videoUrl && <div className="fixed inset-0 z-[240] grid place-items-center bg-black/80 p-4 backdrop-blur-sm" onMouseDown={() => setActiveVideoId(null)}><div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-black shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><button type="button" onClick={() => setActiveVideoId(null)} className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-lg font-bold text-black" aria-label="Close video">×</button><div className="aspect-[9/16]"><ProductVideo url={activeVideo.videoUrl} title={`${activeVideo.name} reel`} poster={activeVideo.image} className="h-full w-full object-cover" autoPlay controls loop /></div><Link href={`/product/${activeVideo.slug}`} onClick={() => setActiveVideoId(null)} className="block bg-white px-4 py-3 text-center text-xs font-extrabold text-black">SHOP {activeVideo.name.toUpperCase()} →</Link></div></div>}
  </div>;
}
