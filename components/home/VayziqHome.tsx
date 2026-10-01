"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
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
  X,
} from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import type { VayziqHomeData, VayziqHomeProduct } from "@/lib/vayziq-home-data";
import type { HomepageVisibility } from "@/lib/homepage-settings";
import ProductVideo from "@/components/product/ProductVideo";
import HomeHeader from "./HomeHeader";
import HomeFooter from "./HomeFooter";
import styles from "./VayziqHome.module.css";

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
          sizes="(max-width: 767px) 46vw, 17vw"
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
        className={`${styles.wishlistButton}${liked ? ` ${styles.liked}` : ""}`}
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
}: {
  initialData: VayziqHomeData;
  visibility: HomepageVisibility;
  journalPosts: BlogPost[];
}) {
  const [bannerStart, setBannerStart] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [cartProduct, setCartProduct] = useState<VayziqHomeProduct | null>(
    null,
  );
  const [cartQuantity, setCartQuantity] = useState(1);
  const [cartOptions, setCartOptions] = useState<Record<string, string>>({});
  const [cartAdded, setCartAdded] = useState(false);
  const { banners, categories, products } = initialData;
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
  const bestSellers = products.slice(0, 4);
  const newArrivals = [...products].reverse().slice(0, 4);
  const recommendations = [...products].reverse().slice(0, 4);
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
  const offerBanner = banners[(bannerStart + 1) % banners.length] ?? banners[0];
  const visibleBanners = Array.from(
    { length: Math.min(3, banners.length) },
    (_, index) => banners[(bannerStart + index) % banners.length],
  );
  const toggleLike = (id: number) =>
    setLiked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  const openCartPopup = (product: VayziqHomeProduct) => {
    setCartProduct(product);
    setCartQuantity(1);
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
    const savedCart = JSON.parse(
      localStorage.getItem("susmita-cart") ?? "[]",
    ) as Array<{ id: number; quantity: number; size?: string; color?: string }>;
    const existing = savedCart.find(
      (item) =>
        item.id === product.id &&
        item.size === cartOptions.size &&
        item.color === (cartOptions.color ?? cartOptions.colour),
    );
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
  return (
    <div className={`${styles.home} vayziq-home`}>
      <HomeHeader />
      <main>
        <section className={styles.bannerSection} aria-label="Campaign banners">
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
        </section>
        <SectionHeading title="Best Sellers" />
        <section className={`${styles.productGrid} ${styles.fourProductGrid}`}>
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              liked={liked.includes(product.id)}
              onLike={() => toggleLike(product.id)}
              onAddToCart={() => openCartPopup(product)}
              framed
            />
          ))}
        </section>
        <SectionHeading title="New Arrivals" />
        <section className={`${styles.productGrid} ${styles.fourProductGrid}`}>
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              liked={liked.includes(product.id)}
              onLike={() => toggleLike(product.id)}
              onAddToCart={() => openCartPopup(product)}
              framed
            />
          ))}
        </section>
        <section
          className={styles.collectionShowcase}
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
        </section>
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
              <div className={styles.productGrid}>
                {trendingProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    liked={liked.includes(product.id)}
                    onLike={() => toggleLike(product.id)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
        {offerBanner && (
          <section className={styles.offerSection}>
            <Link
              href={offerBanner.href}
              className={styles.offerBanner}
              aria-label={`Shop ${offerBanner.alt}`}
            >
              <Image
                src={offerBanner.image}
                alt={offerBanner.alt}
                fill
                sizes="100vw"
                quality={100}
              />
            </Link>
          </section>
        )}
        {visibility.trendingCategories && (
          <>
            <SectionHeading title="Trending Categories" />
            <section className={styles.genderCategoryGrid}>
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
        <SectionHeading title="You May Like" />
        <section className={`${styles.productGrid} ${styles.fourProductGrid}`}>
          {recommendations.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              liked={liked.includes(product.id)}
              onLike={() => toggleLike(product.id)}
              onAddToCart={() => openCartPopup(product)}
              framed
            />
          ))}
        </section>
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
        <SectionHeading title="Watch & Buy" />
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
        {journalPosts.length > 0 && (
          <section className={styles.journalSection} aria-labelledby="journal-heading">
            <div className={styles.journalHeading}>
              <div>
                <p>STYLE NOTES</p>
                <h2 id="journal-heading">From the Journal</h2>
              </div>
              <Link href="/blog">View All <ChevronRight /></Link>
            </div>
            <div className={styles.journalGrid}>
              {journalPosts.map((post) => (
                <article key={post.slug} className={styles.journalCard}>
                  <Link href={`/blog/${post.slug}`}>
                    <div className={styles.journalImage}>
                      {post.image.startsWith("data:") ? (
                        <img src={post.image} alt={post.imageAlt} />
                      ) : (
                        <Image src={post.image} alt={post.imageAlt} fill sizes="(max-width: 767px) 78vw, 31vw" quality={90} />
                      )}
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
        <HomeFooter />
      </main>
      {cartProduct && (
        <div
          className={styles.cartPopupBackdrop}
          onMouseDown={() => setCartProduct(null)}
        >
          <section
            className={`${styles.cartPopup}${cartProduct.images.length === 1 ? ` ${styles.cartPopupSingle}` : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Add product to cart"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.cartPopupClose}
              onClick={() => setCartProduct(null)}
              aria-label="Close"
            >
              <X />
            </button>
            <div className={`${styles.cartPopupGallery}${cartProduct.images.length === 1 ? ` ${styles.cartPopupGallerySingle}` : ""}`}>
              {cartProduct.images.slice(0, 3).map((image, index) => <div className={styles.cartPopupImage} key={`${image}-${index}`}><Image src={image} alt={`${cartProduct.name} view ${index + 1}`} fill sizes="(max-width: 767px) 30vw, 190px" /></div>)}
            </div>
            <div className={styles.cartPopupProduct}>
              <div><p>{cartAdded ? "ADDED TO BAG" : cartProduct.category.toUpperCase()}</p><h2>{cartProduct.name}</h2><strong>{cartProduct.price}</strong>{cartProduct.oldPrice && <del>{cartProduct.oldPrice}</del>}</div>
            </div>
            {cartAdded ? (
              <div className={styles.cartPopupActions}>
                <Link href="/cart" className={styles.cartPopupPrimary}>
                  View Cart
                </Link>
                <button
                  type="button"
                  className={styles.cartPopupSecondary}
                  onClick={() => setCartProduct(null)}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {cartProduct.options.map((option) => <div className={styles.optionGroup} key={option.name}><span>{option.name}</span><div>{option.values.map((value) => <button type="button" key={value} className={cartOptions[option.name.toLowerCase()] === value ? styles.optionSelected : ""} onClick={() => setCartOptions((current) => ({ ...current, [option.name.toLowerCase()]: value }))}>{value}</button>)}</div></div>)}
                <div className={styles.quantityControl}>
                  <span>Quantity</span>
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setCartQuantity((quantity) => Math.max(1, quantity - 1))
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus />
                    </button>
                    <b>{cartQuantity}</b>
                    <button
                      type="button"
                      onClick={() =>
                        setCartQuantity((quantity) => quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.cartPopupPrimary}
                  onClick={() => addToCart(cartProduct, cartQuantity)}
                >
                  Add to Bag
                </button>
              </>
            )}
          </section>
        </div>
      )}
      {activeVideo && activeVideo.videoUrl && (
        <div
          className="fixed inset-0 z-[240] grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={() => setActiveVideoId(null)}
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-black shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveVideoId(null)}
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-lg font-bold text-black"
              aria-label="Close video"
            >
              ×
            </button>
            <div className="aspect-[9/16]">
              <ProductVideo
                url={activeVideo.videoUrl}
                title={`${activeVideo.name} reel`}
                poster={activeVideo.image}
                className="h-full w-full object-cover"
                autoPlay
                controls
                loop
              />
            </div>
            <Link
              href={`/product/${activeVideo.slug}`}
              onClick={() => setActiveVideoId(null)}
              className="block bg-white px-4 py-3 text-center text-xs font-extrabold text-black"
            >
              SHOP {activeVideo.name.toUpperCase()} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
