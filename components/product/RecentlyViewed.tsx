"use client";

import { useEffect, useState } from "react";
import ProductGrid from "@/components/product/ProductGrid";
import type { Product } from "@/components/product/ProductCard";

const STORAGE_KEY = "vayziq-recently-viewed-v1";

function validProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const product = value as Partial<Product>;
  return (typeof product.id === "number" || typeof product.id === "string") && typeof product.name === "string" && typeof product.price === "string" && typeof product.image === "string";
}

export default function RecentlyViewed({ current }: { current: Product }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let previous: Product[] = [];
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
      const history = Array.isArray(saved) ? saved.filter(validProduct) : [];
      previous = history.filter(product => String(product.id) !== String(current.id));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([current, ...previous].slice(0, 12)));
    } catch {
      // Keep the product page usable when browser storage is unavailable.
    }
    const timer = window.setTimeout(() => setProducts(previous.slice(0, 4)), 0);
    return () => window.clearTimeout(timer);
  }, [current]);

  if (!products.length) return null;
  return <section aria-labelledby="recently-viewed-title" className="mt-12 border-t border-[#E8DADA] pt-9 sm:mt-16 sm:pt-12">
    <div className="mb-6 sm:mb-8"><p className="text-[10px] font-semibold tracking-[0.22em] text-[#9F5E5E]">PICK UP WHERE YOU LEFT OFF</p><h2 id="recently-viewed-title" className="mt-2 font-serif text-2xl text-[#2B2525] sm:text-3xl">Recently viewed</h2><p className="mt-2 text-sm text-[#756565]">Styles you explored recently on this device.</p></div>
    <ProductGrid products={products} columns={4} />
  </section>;
}
