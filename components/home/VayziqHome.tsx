"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Clock3,
  Heart,
  Minus,
  PackageCheck,
  Play,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Undo2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import type { VayziqHomeData, VayziqHomeOfferBanner, VayziqHomeProduct } from "@/lib/vayziq-home-data";
import type { HomepageVisibility } from "@/lib/homepage-settings";
import type { StoreMenuSettings } from "@/lib/store-menu-settings";
import ProductVideo from "@/components/product/ProductVideo";
import ProductOfferBadges from "@/components/product/ProductOfferBadges";
import HomeHeader from "./HomeHeader";
import ProductCarousel from "./ProductCarousel";
import styles from "./VayziqHome.module.css";
import wishlistStyles from "./WishlistButton.module.css";
import sectionWidthStyles from "./HomeSectionWidth.module.css";

function SectionHeading({
  title,
  href = "/shop",
}: {
  title: string;
  href?: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <h2>{title}</h2>
      <Link href={href}>
        View All <ChevronRight />
      </Link>
    </div>
  );
}

function HomeOfferStrip({ banner, alternate = false }: { banner: VayziqHomeOfferBanner; alternate?: boolean }) {
  return <section className={`${styles.offerSection} ${sectionWidthStyles.wideMerchSection}`} aria-label={banner.title}>
    <Link href={banner.href} className={`${styles.offerStrip} ${alternate ? styles.offerStripAlternate : ""}`}>
      <span className={styles.offerStripCopy}>
        <span className={styles.offerStripEyebrow}>VAYZIQ / THE OFFER EDIT</span>
        <strong>{banner.title}</strong>
        {banner.subtitle && <span className={styles.offerStripSubtitle}>{banner.subtitle}</span>}
        <span className={styles.offerStripAction}>Explore offers <ArrowRight size={15} /></span>
      </span>
      <span className={styles.offerStripImage}><Image src={banner.image} alt="" fill sizes="(max-width: 767px) 42vw, 38vw" quality={85} /></span>
    </Link>
  </section>;
}
function ProductCard({
  product,
  liked,
  onLike,
  onAddToCart,
  badge,
  framed = false,
}: {
  product: VayziqHomeProduct;
  liked: boolean;
  onLike: () => void;
  onAddToCart?: () => void;
  badge?: string;
  framed?: boolean;
}) {
  const dynamicBadge = badge || product.badge || null;
  return (
    <article
      className={`${styles.productCard}${framed ? ` ${styles.framedProductCard}` : ""}`}
    >
      <Link href={`/product/${product.slug}`} className={styles.productImage}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 767px) 58vw, (max-width: 1100px) 32vw, 24vw"
          quality={100}
        />
        {dynamicBadge && (
          <span className={`${styles.discountBadge} ${product.badgeTone === "new" ? styles.badgeNew : product.badgeTone === "sale" ? styles.badgeSale : product.badgeTone === "popular" ? styles.badgePopular : product.badgeTone === "neutral" ? styles.badgeNeutral : ""}`}>
            {dynamicBadge}
          </span>
        )}
        {!product.inStock && <span className={styles.outOfStockBadge}>Out of Stock</span>}
        {product.rating !== "New" && (
          <span className={styles.ratingBadge}>★ {product.rating}</span>
        )}
        {product.colors.length > 0 && (
          <span className={styles.productColorStack} aria-label={`${product.colors.length} ${product.colors.length === 1 ? "color" : "colors"} available`}>
            {product.colors.slice(0, 3).map((color) => <i key={color} style={{ backgroundColor: color }} title={color} />)}
            {product.colors.length > 3 && <b>+{product.colors.length - 3}</b>}
          </span>
        )}
      </Link>
      <button
        type="button"
        className={`${styles.wishlistButton} ${wishlistStyles.button}${liked ? ` ${styles.liked} ${wishlistStyles.active}` : ""}`}
        onClick={onLike}
        aria-label={`Add ${product.name} to wishlist`}
      >
        <Heart fill={liked ? "currentColor" : "none"} />
      </button>
      <h3>{product.name}</h3>
      <div className={styles.priceRow}>
        <strong>{product.price}</strong>
        {product.oldPrice && <del>{product.oldPrice}</del>}
        {product.discountPercent && <span className={styles.offerPercent}>{product.discountPercent}% OFF</span>}
      </div>
      <ProductOfferBadges id={product.id} price={product.price} inStock={product.inStock} />
      {onAddToCart && (
        <button
          type="button"
          className={`${styles.addToCartButton}${product.inStock ? "" : ` ${styles.addToCartDisabled}`}`}
          onClick={onAddToCart}
          disabled={!product.inStock}
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      )}
    </article>
  );
}

export default function VayziqHome({
  initialData,
  visibility,
  journalPosts,
  menuSettings,
}: {
  initialData: VayziqHomeData;
  visibility: HomepageVisibility;
  journalPosts: BlogPost[];
  menuSettings: StoreMenuSettings;
}) {
  const [bannerStart, setBannerStart] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [liked, setLiked] = useState<number[]>([]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/account/wishlist", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as { productIds: number[] };
        if (active) setLiked(data.productIds);
      } catch { /* Wishlist remains available when the account request fails. */ }
    };
    void load();
    window.addEventListener("vayziq:auth-success", load);
    return () => { active = false; window.removeEventListener("vayziq:auth-success", load); };
  }, []);
  const [activeTab, setActiveTab] = useState("All");
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [reelsMuted, setReelsMuted] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("vayziq-watch-buy-muted") !== "false";
  });
  const [cartProduct, setCartProduct] = useState<VayziqHomeProduct | null>(
    null,
  );
  const [cartQuantity, setCartQuantity] = useState(1);
  const [cartImageIndex, setCartImageIndex] = useState(0);
  const [cartLimits, setCartLimits] = useState({ min: 1, max: 10 });
  const [cartLimitMessage, setCartLimitMessage] = useState("");
  const [cartOptions, setCartOptions] = useState<Record<string, string>>({});
  const [cartAdded, setCartAdded] = useState(false);
  const { banners, offerBanners, categories, products, catalogProducts } = initialData;
  const looks = products.slice(0, 4).map((product) => product.image);
  const watchProducts = products
    .filter((product) => product.videoUrl)
    .slice(0, 4);
  const activeVideo =
    watchProducts.find((product) => product.id === activeVideoId) ?? null;
  const tabs = [
    "All",
    "New Arrivals",
    "Joggers",
    "Hoodies",
    "T-Shirts",
    "Tracksuits",
  ];
  const bestSellers = products;
  const newArrivals = [...products].reverse();
  const recommendations = [...products].reverse();
  const featuredCategories = categories.filter(
    (category) => category.slug === "men" || category.slug === "women",
  );
  const trendingProducts = (
    activeTab === "All"
      ? products
      : activeTab === "New Arrivals"
        ? [...products].reverse()
        : products.filter((product) =>
            `${product.name} ${product.category}`
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")
              .includes(activeTab.toLowerCase().replace(/[^a-z0-9]/g, "")),
          )
  ).slice(0, 6);
  const visibleCollection = products.slice(0, 3);
  const visibleBanners = Array.from(
    { length: Math.min(3, banners.length) },
    (_, index) => banners[(bannerStart + index) % banners.length],
  );
  const activeHeroBanner = banners[heroIndex % banners.length] ?? banners[0];
  const toggleLike = async (id: number) => {
    const wasLiked = liked.includes(id);
    try {
      const response = await fetch(wasLiked ? `/api/account/wishlist?productId=${id}` : "/api/account/wishlist", {
        method: wasLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        ...(wasLiked ? {} : { body: JSON.stringify({ productId: id }) }),
      });
      if (response.status === 401) { window.dispatchEvent(new Event("vayziq:open-auth")); return; }
      if (!response.ok) return;
      setLiked(current => wasLiked ? current.filter(item => item !== id) : [...current, id]);
    } catch { /* Keep the existing state if the request fails. */ }
  };
  const toggleReelSound = () => setReelsMuted((current) => {
    const next = !current;
    try {
      window.localStorage.setItem("vayziq-watch-buy-muted", String(next));
    } catch {
      // Keep the choice for this visit if storage is unavailable.
    }
    return next;
  });
  const moveActiveVideo = (direction: number) => {
    if (!activeVideo || watchProducts.length < 2) return;
    const currentIndex = watchProducts.findIndex((product) => product.id === activeVideo.id);
    const nextIndex = (currentIndex + direction + watchProducts.length) % watchProducts.length;
    setActiveVideoId(watchProducts[nextIndex].id);
  };
useEffect(() => {
    if (!cartProduct) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setCartProduct(null); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [cartProduct]);
  const openCartPopup = (product: VayziqHomeProduct) => {
    setCartProduct(product);
    setCartQuantity(1);
    setCartLimitMessage("");
    void fetch("/api/cart/availability", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: [{ id: product.id, quantity: 1 }] }) })
      .then(response => response.json())
      .then(body => { const limits = body.availability?.[0]; if (limits) { setCartLimits({ min: limits.min, max: limits.max }); setCartQuantity(limits.min); } })
      .catch(() => setCartLimitMessage("Quantity limits could not be loaded. Try again."));
    setCartOptions(
      Object.fromEntries(
        product.options
          .filter((option) => option.values.length)
          .map((option) => [option.name.toLowerCase(), option.values[0]]),
      ),
    );
    setCartAdded(false);
  };
  const addToCart = (product: VayziqHomeProduct, quantity: number) => {
    if (quantity < cartLimits.min || quantity > cartLimits.max) { setCartLimitMessage(`Choose ${cartLimits.min}–${cartLimits.max} items.`); return; }
    const savedCart = JSON.parse(
      localStorage.getItem("susmita-cart") ?? "[]",
    ) as Array<{ id: number; quantity: number; size?: string; color?: string }>;
    const existing = savedCart.find(
      (item) =>
        item.id === product.id &&
        item.size === cartOptions.size &&
        item.color === (cartOptions.color ?? cartOptions.colour),
    );
    if (savedCart.filter(item => item.id === product.id).reduce((sum, item) => sum + item.quantity, 0) + quantity > cartLimits.max) { setCartLimitMessage(`Maximum ${cartLimits.max} items of this product per order.`); return; }
    const item = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: Number(product.price.replace(/[^\d.]/g, "")),
      image: product.image,
      quantity,
      size: cartOptions.size,
      color: cartOptions.color ?? cartOptions.colour,
    };
    localStorage.setItem(
      "susmita-cart",
      JSON.stringify(
        existing
          ? savedCart.map((cartItem) =>
              cartItem === existing
                ? { ...cartItem, quantity: cartItem.quantity + quantity }
                : cartItem,
            )
          : [...savedCart, item],
      ),
    );
    window.dispatchEvent(new Event("cart-updated"));
    setCartAdded(true);
  };
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      banners.length < 2
    )
      return;
    const timer = window.setInterval(
      () => setBannerStart((index) => (index + 1) % banners.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [banners.length]);
  useEffect(() => {
    if (heroPaused || banners.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setHeroIndex((index) => (index + 1) % banners.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [banners.length, heroPaused]);
  return (
    <div className={`${styles.home} vayziq-home`}>
      <HomeHeader menuSettings={menuSettings} />
      <main>
        {visibility.heroSlider && activeHeroBanner && (
          <section
            className={styles.heroSlider}
            aria-label="Featured collections"
            aria-roledescription="carousel"
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            onFocusCapture={() => setHeroPaused(true)}
            onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHeroPaused(false); }}
          >
            <Link href={activeHeroBanner.href} className={styles.heroSlide} key={`hero-${heroIndex}`}>
              <Image src={activeHeroBanner.image} alt={activeHeroBanner.alt} fill priority={heroIndex === 0} sizes="100vw" quality={90} />
              <span className={styles.heroShade} aria-hidden="true" />
              <span className={styles.heroContent}>
                <span className={styles.heroEyebrow}>VAYZIQ · EVERYDAY STREETWEAR</span>
                <strong>{activeHeroBanner.alt}</strong>
                <span className={styles.heroCta}>Explore collection <ArrowRight size={18} /></span>
              </span>
            </Link>
            {banners.length > 1 && <>
              <button type="button" className={`${styles.heroArrow} ${styles.heroPrevious}`} onClick={() => setHeroIndex((index) => (index - 1 + banners.length) % banners.length)} aria-label="Previous featured collection"><ArrowLeft /></button>
              <button type="button" className={`${styles.heroArrow} ${styles.heroNext}`} onClick={() => setHeroIndex((index) => (index + 1) % banners.length)} aria-label="Next featured collection"><ArrowRight /></button>
              <div className={styles.heroPagination} aria-label="Featured collection slides">{banners.map((banner, index) => <button type="button" key={`${banner.alt}-${index}`} className={index === heroIndex ? styles.heroDotActive : ""} onClick={() => setHeroIndex(index)} aria-label={`Show featured collection ${index + 1}`} aria-current={index === heroIndex ? "true" : undefined} />)}</div>
            </>}
          </section>
        )}
        {visibility.campaignBanners && <section className={styles.bannerSection} aria-label="Campaign banners">
          <div className={styles.desktopBanners}>
            {visibleBanners.map((banner, index) => (
              <Link
                className={styles.bannerCard}
                href={banner.href}
                key={`${banner.alt}-${index}`}
              >
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1023px) 48vw, 32vw"
                  quality={100}
                />
              </Link>
            ))}
          </div>
          {banners[0] && (
            <Link
              className={styles.mobileBanner}
              href={banners[bannerStart].href}
            >
              <Image
                src={banners[bannerStart].image}
                alt={banners[bannerStart].alt}
                fill
                priority
                sizes="100vw"
                quality={100}
              />
            </Link>
          )}
          <div className={styles.dots} aria-label="Banner pagination">
            {banners.map((banner, index) => (
              <button
                key={`${banner.alt}-${index}`}
                onClick={() => setBannerStart(index)}
                aria-label={`Show banner ${index + 1}`}
                className={index === bannerStart ? styles.activeDot : ""}
              />
            ))}
          </div>
        </section>}
        {visibility.bestSellers && <>
        <SectionHeading title="Best Sellers" />
        <ProductCarousel label="Best Sellers">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              liked={liked.includes(product.id)}
              onLike={() => void toggleLike(product.id)}
              onAddToCart={() => openCartPopup(product)}
              framed
            />
          ))}
        </ProductCarousel>
        </>}
        {visibility.offerZone && offerBanners[0] && <HomeOfferStrip banner={offerBanners[0]} />}
        {visibility.newArrivals && <>
        <SectionHeading title="New Arrivals" href="/shop?sort=newest" />
        <ProductCarousel label="New Arrivals">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              liked={liked.includes(product.id)}
              onLike={() => void toggleLike(product.id)}
              onAddToCart={() => openCartPopup(product)}
              framed
            />
          ))}
        </ProductCarousel>
        </>}
        {visibility.ourCatalog && catalogProducts.length > 0 && (
          <section className={styles.catalogSection} aria-labelledby="our-catalog-heading">
            <div className={styles.catalogHeading}>
              <div>
                <h2 id="our-catalog-heading">Our Catalog</h2>
                <span>{catalogProducts.length} {catalogProducts.length === 1 ? "style" : "styles"} available now</span>
              </div>
              <Link href="/shop">Browse all <ChevronRight /></Link>
            </div>
            <div className={styles.catalogGrid}>
              {catalogProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  liked={liked.includes(product.id)}
                  onLike={() => void toggleLike(product.id)}
                  onAddToCart={() => openCartPopup(product)}
                  framed
                />
              ))}
            </div>
          </section>
        )}
        {visibility.featuredCollection && <section
          className={`${styles.collectionShowcase} ${sectionWidthStyles.wideMerchSection}`}
          aria-labelledby="collection-heading"
        >
          <div className={styles.collectionShowcaseHead}>
            <h2 id="collection-heading">The Collection</h2>
          </div>
          <div className={styles.collectionCarousel}>
            {visibleCollection.map((product) => (
              <Link
                href={`/product/${product.slug}`}
                key={product.id}
                className={styles.collectionSlide}
                aria-label={`View ${product.name}`}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 767px) 75vw, 29vw"
                  quality={100}
                />
              </Link>
            ))}
          </div>
        </section>}
        {visibility.trendingNow && (
          <>
            <SectionHeading title="Trending Now" />
            <section className={styles.collection}>
              <div className={styles.collectionHead}>
                <div className={styles.tabs}>
                  {tabs.map((tab) => (
                    <button
                      onClick={() => setActiveTab(tab)}
                      className={activeTab === tab ? styles.selectedTab : ""}
                      key={tab}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <ProductCarousel key={activeTab} label="Trending Now" inset>
                {trendingProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    liked={liked.includes(product.id)}
                    onLike={() => void toggleLike(product.id)}
                    onAddToCart={() => openCartPopup(product)}
                    framed
                  />
                ))}
              </ProductCarousel>
            </section>
          </>
        )}
        {visibility.offerZone && offerBanners[1] && <HomeOfferStrip banner={offerBanners[1]} alternate />}
        {visibility.trendingCategories && (
          <>
            <SectionHeading title="Trending Categories" />
            <section className={`${styles.genderCategoryGrid} ${sectionWidthStyles.wideMerchSection}`}>
              {featuredCategories.map((category) => (
                <Link
                  className={styles.genderCategoryCard}
                  href={`/${category.slug}`}
                  key={category.id}
                >
                  <Image
                    src={category.image}
                    alt={`${category.name} collection`}
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                    quality={100}
                  />
                  <div>
                    <p>
                      {category.slug === "men" ? "MEN'S EDIT" : "WOMEN'S EDIT"}
                    </p>
                    <h3>{category.name}</h3>
                    <span>
                      Explore collection <ChevronRight />
                    </span>
                  </div>
                </Link>
              ))}
            </section>
          </>
        )}
        {visibility.youMayLike && <>
        <SectionHeading title="You May Like" />
        <ProductCarousel label="You May Like">
          {recommendations.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              liked={liked.includes(product.id)}
              onLike={() => void toggleLike(product.id)}
              onAddToCart={() => openCartPopup(product)}
              framed
            />
          ))}
        </ProductCarousel>
        </>}
        {visibility.shopByMood && (
          <>
            <SectionHeading title="Shop by Mood" />
            <section className={styles.moods}>
              {["Streetwear", "Athleisure", "Minimal", "Oversized"].map(
                (mood, index) =>
                  looks[index] && (
                    <Link href="/shop" key={mood}>
                      <Image
                        src={looks[index]}
                        alt={mood}
                        fill
                        sizes="(max-width: 767px) 250px, 24vw"
                        quality={100}
                      />
                      <span>
                        {mood}
                        <ChevronRight />
                      </span>
                    </Link>
                  ),
              )}
            </section>
          </>
        )}
        {visibility.watchAndBuy && <>
        <SectionHeading title="Watch & Buy" href="/watch-buy" />
        <section id="watch-buy" className={styles.watch}>
          {watchProducts.map((product) => (
            <article key={product.id}>
              <Image
                src={product.image}
                alt={`${product.name} video`}
                fill
                sizes="(max-width: 767px) 175px, 20vw"
                quality={100}
              />
              <button
                onClick={() => setActiveVideoId(product.id)}
                aria-label={`Play ${product.name}`}
              >
                <Play fill="currentColor" />
              </button>
              <p>
                {product.name}
                <strong>{product.price}</strong>
              </p>
              <ShoppingBag />
            </article>
          ))}
        </section>
        </>}
        {visibility.trustBenefits && (
          <section className={styles.trust}>
            {[
              [Truck, "Free Shipping", "On Orders over ₹999"],
              [Undo2, "Easy 7-Day Returns", "Hassle Free"],
              [ShieldCheck, "100% Original", "Premium Quality"],
              [PackageCheck, "Secure Payments", "100% Safe & Secure"],
            ].map(([Icon, title, caption]) => {
              const Feature = Icon as typeof Truck;
              return (
                <div key={title as string}>
                  <Feature />
                  <span>
                    <b>{title as string}</b>
                    <small>{caption as string}</small>
                  </span>
                </div>
              );
            })}
          </section>
        )}
        {visibility.journal && journalPosts.length > 0 && (
          <section className={`${styles.journalSection} ${sectionWidthStyles.wideMerchSection}`} aria-labelledby="journal-heading">
            <div className={styles.journalHeading}>
              <div>
                <h2 id="journal-heading">From the Journal</h2>
              </div>
              <Link href="/blog">View All <ChevronRight /></Link>
            </div>
            <div className={styles.journalGrid}>
              {journalPosts.map((post) => (
                <article key={post.slug} className={styles.journalCard}>
                  <Link href={`/blog/${post.slug}`}>
                    <div className={styles.journalImage}>
                      <Image src={post.image} alt={post.imageAlt} fill sizes="(max-width: 767px) 78vw, 31vw" quality={90} unoptimized={post.image.startsWith("data:")} />
                    </div>
                    <div className={styles.journalContent}>
                      <p>{post.category}</p>
                      <h3>{post.title}</h3>
                      <span><Clock3 /> {post.readTime}</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
      {cartProduct && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/55 p-2 backdrop-blur-[2px] sm:p-5" onMouseDown={() => setCartProduct(null)}>
          <section className="relative flex max-h-[calc(100dvh-16px)] w-full max-w-[980px] flex-col overflow-hidden rounded-xl bg-white shadow-[0_22px_70px_rgba(0,0,0,.32)] sm:max-h-[calc(100dvh-40px)]" role="dialog" aria-modal="true" aria-labelledby={`home-cart-title-${cartProduct.id}`} onMouseDown={(event) => event.stopPropagation()}>
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e7e7e7] px-5 sm:h-16 sm:px-7"><h2 className="text-base font-extrabold tracking-tight text-[#222] sm:text-lg">ADD TO CART</h2><button type="button" onClick={() => setCartProduct(null)} aria-label="Close add to cart" className="grid h-9 w-9 place-items-center rounded-full text-[#222] transition hover:bg-[#f3f3f3]"><X className="h-5 w-5" /></button></header>
            <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1.12fr_.88fr]">
              <div className="grid min-h-[360px] grid-cols-[68px_minmax(0,1fr)] gap-3 border-b border-[#ececec] p-4 sm:min-h-[510px] sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-5 sm:p-6 lg:border-b-0 lg:border-r">
                <div className="flex flex-col gap-3 overflow-y-auto">{cartProduct.images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setCartImageIndex(index)} aria-label={`Show ${cartProduct.name} image ${index + 1}`} aria-pressed={cartImageIndex === index} className={`relative aspect-[3/4] shrink-0 overflow-hidden rounded-lg border-2 bg-[#f4f4f4] transition ${cartImageIndex === index ? "border-[#111]" : "border-transparent hover:border-[#aaa]"}`}><Image src={image} alt="" fill sizes="88px" className="object-cover" /></button>)}</div>
                <div className="relative min-h-0 overflow-hidden rounded-lg bg-[#f5f5f5]"><Image src={cartProduct.images[cartImageIndex] ?? cartProduct.image} alt={cartProduct.name} fill sizes="(max-width:1023px) 75vw, 520px" className="object-cover" priority />{cartProduct.badge && <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-[#1d3f63] shadow-sm">{cartProduct.badge}</span>}</div>
              </div>
              <div className="flex min-h-0 flex-col p-5 sm:p-7">
                <div><div className="flex flex-wrap items-baseline gap-2"><strong className="text-2xl text-[#111]">{cartProduct.price}</strong>{cartProduct.oldPrice && <del className="text-sm font-semibold text-[#aaa]">{cartProduct.oldPrice}</del>}{cartProduct.discountPercent && <span className="text-sm font-bold text-[#00a83b]">{cartProduct.discountPercent}% OFF</span>}</div><div className="mt-2"><ProductOfferBadges id={cartProduct.id} price={cartProduct.price} inStock={cartProduct.inStock} /></div><h3 id={`home-cart-title-${cartProduct.id}`} className="mt-4 text-lg font-semibold leading-snug text-[#151515] sm:text-xl">{cartProduct.name}</h3><p className="mt-2 text-xs font-semibold uppercase tracking-[.1em] text-[#777]">{cartProduct.category}</p></div>
                {cartAdded ? <div className="mt-auto pt-8"><p className="mb-4 rounded-lg bg-[#effaf2] px-4 py-3 text-sm font-bold text-[#08752f]">Added to your cart</p><Link href="/cart" className="flex min-h-12 items-center justify-center rounded-lg bg-[#fbb606] text-sm font-extrabold text-[#111]">View Cart</Link><button type="button" onClick={() => setCartProduct(null)} className="mt-2 flex min-h-11 w-full items-center justify-center rounded-lg border border-[#d7d7d7] bg-white text-sm font-bold text-[#111]">Continue Shopping</button></div> : <>
                  <div className="mt-5 space-y-4">{cartProduct.options.filter((option) => option.values.length).map((option) => <div key={option.name}><p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#666]">{option.name}</p><div className="flex flex-wrap gap-2">{option.values.map((value) => <button type="button" key={value} onClick={() => setCartOptions((current) => ({ ...current, [option.name.toLowerCase()]: value }))} className={`min-w-11 rounded-md border px-3 py-2 text-xs font-bold transition ${cartOptions[option.name.toLowerCase()] === value ? "border-[#111] bg-[#111] text-white" : "border-[#d6d6d6] bg-white text-[#333] hover:border-[#111]"}`}>{value}</button>)}</div></div>)}</div>
                  <div className="mt-5 flex items-center justify-between border-y border-[#ececec] py-3"><div><span className="block text-sm font-bold text-[#333]">Quantity</span><small className="text-[10px] text-[#777]">Allowed {cartLimits.min}–{cartLimits.max}</small></div><div className="flex items-center gap-4"><button type="button" onClick={() => setCartQuantity((quantity) => Math.max(cartLimits.min, quantity - 1))} className="grid h-8 w-8 place-items-center rounded-full border border-[#d8d8d8]" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button><b className="text-sm">{cartQuantity}</b><button type="button" onClick={() => setCartQuantity((quantity) => Math.min(cartLimits.max, quantity + 1))} className="grid h-8 w-8 place-items-center rounded-full border border-[#d8d8d8]" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button></div></div>
                  {cartLimitMessage && <p role="alert" className="mt-3 text-xs text-red-700">{cartLimitMessage}</p>}<button type="button" onClick={() => addToCart(cartProduct, cartQuantity)} className="mt-auto flex min-h-12 w-full items-center justify-center rounded-lg bg-[#fbb606] text-sm font-extrabold text-[#111] transition hover:bg-[#eaae00]">Add to Cart</button>
                </>}
              </div>
            </div>
          </section>
        </div>
      )}      {activeVideo && activeVideo.videoUrl && (
        <div
          className="fixed inset-0 z-[240] flex items-center justify-center bg-black/75 p-3 backdrop-blur-[3px] sm:p-8"
          onMouseDown={() => setActiveVideoId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${activeVideo.name} video`}
            className="relative w-[min(360px,calc(100vw-32px))] rounded-2xl bg-[#201B1B] shadow-2xl sm:w-[min(330px,calc(100vw-48px))] sm:rounded-[18px]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {watchProducts.length > 1 && <button type="button" aria-label="Previous video" onClick={() => moveActiveVideo(-1)} className="absolute left-1 top-1/2 z-40 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white transition hover:bg-[#B56F6F] sm:left-[-54px] sm:translate-x-0"><ArrowLeft className="h-5 w-5" /></button>}
            <button
              type="button"
              onClick={() => setActiveVideoId(null)}
              className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-[#111]/90 text-white shadow-lg transition hover:bg-[#B56F6F]"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={toggleReelSound}
              aria-label={reelsMuted ? "Unmute video" : "Mute video"}
              aria-pressed={!reelsMuted}
              className="absolute left-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition hover:bg-[#B56F6F]"
            >
              {reelsMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#201B1B] sm:rounded-[18px]">
              <ProductVideo
                url={activeVideo.videoUrl}
                title={`${activeVideo.name} reel`}
                poster={activeVideo.image}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                loop
                muted={reelsMuted}
                coverEmbed
              />
              <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent px-3 pb-3 pt-12 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-md border border-white/20 bg-white/10">
                    <Image src={activeVideo.image} alt="" fill sizes="36px" className="object-cover" />
                  </div>
                  <Link href={`/product/${activeVideo.slug}`} onClick={() => setActiveVideoId(null)} className="min-w-0 flex-1 rounded focus:outline-none focus:ring-2 focus:ring-white/80">
                    <h2 className="truncate text-[13px] font-medium leading-4 text-white">{activeVideo.name}</h2>
                    <div className="mt-0.5 flex items-center gap-1.5"><span className="text-sm font-extrabold text-white">{activeVideo.price}</span>{activeVideo.oldPrice && <span className="text-[9px] text-white/55 line-through">{activeVideo.oldPrice}</span>}</div>
                  </Link>
                  <Link href={`/product/${activeVideo.slug}`} onClick={() => setActiveVideoId(null)} aria-label={`Shop ${activeVideo.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FBB606] text-[#171312] transition hover:bg-white"><ShoppingBag className="h-4 w-4" /></Link>
                </div>
              </div>
            </div>
            {watchProducts.length > 1 && <button type="button" aria-label="Next video" onClick={() => moveActiveVideo(1)} className="absolute right-1 top-1/2 z-40 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white transition hover:bg-[#B56F6F] sm:right-[-54px] sm:translate-x-0"><ArrowRight className="h-5 w-5" /></button>}
          </div>
        </div>
      )}
    </div>
  );
}
