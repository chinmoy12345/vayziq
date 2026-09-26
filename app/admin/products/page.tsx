
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// =====================================================
// TYPES
// =====================================================

type ProductStatus =
  | "Active"
  | "Draft"
  | "Out of Stock";

type ApiProduct = {
  id: number;
  name: string;
  sku: string;
  slug: string;
  price: string | number;
  stock: number;
  status: "active" | "draft";
  featured: boolean;

  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;

  images?: {
    id: number;
    image: string;
    sortOrder: number;
  }[];
};

type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image: string;
  featured: boolean;
};

// =====================================================
// PAGE
// =====================================================

export default function ProductsPage() {
  // =====================================================
  // STATE
  // =====================================================

  const [products, setProducts] = useState<Product[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(
            result?.message ||
              "Unable to load products."
          );
        }

        const rows: ApiProduct[] =
          Array.isArray(result.data)
            ? result.data
            : [];

        const formattedProducts: Product[] =
          rows.map((item) => ({
            id: item.id,

            name: item.name,

            sku: item.sku,

            category:
              item.category?.name ||
              "Uncategorized",

            price: Number(item.price),

            stock: Number(item.stock || 0),

            status:
              item.stock === 0
                ? "Out of Stock"
                : item.status === "active"
                  ? "Active"
                  : "Draft",

            image:
              item.images &&
              item.images.length > 0
                ? item.images[0].image
                : "https://placehold.co/300x300?text=No+Image",

            featured: Boolean(
              item.featured
            ),
          }));

        if (!cancelled) {
          setProducts(
            formattedProducts
          );
        }
      } catch (err) {
        console.error(
          "LOAD PRODUCTS ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load products."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = useMemo(() => {
    const uniqueCategories =
      Array.from(
        new Set(
          products
            .map(
              (product) =>
                product.category
            )
            .filter(Boolean)
        )
      );

    return [
      "All",
      ...uniqueCategories,
    ];
  }, [products]);

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) => {
        const searchValue =
          search
            .toLowerCase()
            .trim();

        const searchMatch =
          !searchValue ||
          product.name
            .toLowerCase()
            .includes(
              searchValue
            ) ||
          product.sku
            .toLowerCase()
            .includes(
              searchValue
            );

        const categoryMatch =
          category === "All" ||
          product.category ===
            category;

        const statusMatch =
          status === "All" ||
          product.status ===
            status;

        return (
          searchMatch &&
          categoryMatch &&
          statusMatch
        );
      }
    );
  }, [
    products,
    search,
    category,
    status,
  ]);

  // =====================================================
  // PRICE FORMAT
  // =====================================================

  const formatPrice = (
    price: number
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(price);
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalProducts =
    products.length;

  const activeProducts =
    products.filter(
      (product) =>
        product.status === "Active"
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        product.status ===
        "Out of Stock"
    ).length;

  const featuredProducts =
    products.filter(
      (product) =>
        product.featured
    ).length;

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-full">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="border-b border-[#eee6e1] bg-white">

        <div className="px-4 py-5 lg:px-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#b56f6f]">
                Catalog
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#292321]">
                Products
              </h1>

              <p className="mt-1 text-sm text-[#8f8580]">
                Manage your products,
                inventory and catalog.
              </p>

            </div>

            <Link
              href="/admin/products/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#292321] px-5 text-sm font-medium text-white transition hover:bg-[#403936]"
            >
              <PlusIcon />

              Add Product
            </Link>

          </div>

        </div>

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-4 lg:p-5">

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="mb-5 rounded-xl border border-[#eee6e1] bg-white px-5 py-4">

            <div className="flex items-center gap-3">

              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#e5ddd8] border-t-[#b56f6f]" />

              <p className="text-sm text-[#958b86]">
                Loading products...
              </p>

            </div>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-5 py-4">

            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-2 text-xs font-medium text-red-700 underline"
            >
              Try again
            </button>

          </div>
        )}

        <div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              title="Total Products"
              value={totalProducts.toString()}
              subtitle="All products"
            />

            <SummaryCard
              title="Active"
              value={activeProducts.toString()}
              subtitle="Currently published"
            />

            <SummaryCard
              title="Out of Stock"
              value={outOfStockProducts.toString()}
              subtitle="Need restocking"
            />

            <SummaryCard
              title="Featured"
              value={featuredProducts.toString()}
              subtitle="Featured products"
            />

          </div>

          {/* =================================================
              PRODUCT TABLE
          ================================================= */}

          <div className="mt-6 overflow-hidden rounded-xl border border-[#eee6e1] bg-white">

            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="border-b border-[#eee6e1] p-4">

              <div className="flex flex-col gap-3 lg:flex-row">

                {/* SEARCH */}

                <div className="relative flex-1">

                  <SearchIcon />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search by product name or SKU..."
                    className="h-11 w-full rounded-lg border border-[#e5ddd8] bg-[#faf8f6] pl-10 pr-4 text-sm text-[#292321] outline-none transition placeholder:text-[#aaa09a] focus:border-[#b56f6f] focus:bg-white"
                  />

                </div>

                {/* CATEGORY */}

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  className="h-11 rounded-lg border border-[#e5ddd8] bg-[#faf8f6] px-4 text-sm text-[#514945] outline-none focus:border-[#b56f6f]"
                >

                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item ===
                        "All"
                          ? "All Categories"
                          : item}
                      </option>
                    )
                  )}

                </select>

                {/* STATUS */}

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
                  }
                  className="h-11 rounded-lg border border-[#e5ddd8] bg-[#faf8f6] px-4 text-sm text-[#514945] outline-none focus:border-[#b56f6f]"
                >

                  <option value="All">
                    All Status
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Out of Stock">
                    Out of Stock
                  </option>

                </select>

              </div>

            </div>

            {/* =================================================
                RESULT COUNT
            ================================================= */}

            <div className="flex items-center justify-between border-b border-[#eee6e1] px-4 py-3">

              <p className="text-xs text-[#958b86]">

                Showing{" "}

                <span className="font-medium text-[#514945]">
                  {
                    filteredProducts.length
                  }
                </span>{" "}

                of{" "}

                <span className="font-medium text-[#514945]">
                  {products.length}
                </span>{" "}

                products

              </p>

            </div>

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full min-w-[850px]">

                <thead>

                  <tr className="border-b border-[#eee6e1] bg-[#fcfaf9]">

                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                      Product
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                      Category
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                      Price
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                      Stock
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-[#f0e9e5]">

                  {filteredProducts.map(
                    (product) => (

                      <tr
                        key={product.id}
                        className="transition hover:bg-[#fcfaf9]"
                      >

                        {/* PRODUCT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f4efec]">

                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name
                                }
                                className="h-full w-full object-cover"
                              />

                            </div>

                            <div className="min-w-0">

                              <div className="flex items-center gap-2">

                                <p className="max-w-[260px] truncate text-sm font-medium text-[#292321]">
                                  {
                                    product.name
                                  }
                                </p>

                                {product.featured && (
                                  <span className="rounded-full bg-[#b56f6f]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#b56f6f]">
                                    Featured
                                  </span>
                                )}

                              </div>

                              <p className="mt-1 text-xs text-[#a09792]">
                                {
                                  product.sku
                                }
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CATEGORY */}

                        <td className="px-4 py-4">

                          <span className="text-sm text-[#5f5753]">
                            {
                              product.category
                            }
                          </span>

                        </td>

                        {/* PRICE */}

                        <td className="px-4 py-4">

                          <span className="text-sm font-medium text-[#292321]">
                            {formatPrice(
                              product.price
                            )}
                          </span>

                        </td>

                        {/* STOCK */}

                        <td className="px-4 py-4">

                          <span
                            className={`text-sm font-medium ${
                              product.stock ===
                              0
                                ? "text-red-600"
                                : product.stock <=
                                    10
                                  ? "text-amber-600"
                                  : "text-[#514945]"
                            }`}
                          >
                            {
                              product.stock
                            }
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">

                          <StatusBadge
                            status={
                              product.status
                            }
                          />

                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-4 text-right">

                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="inline-flex h-9 items-center rounded-lg border border-[#e5ddd8] px-3 text-xs font-medium text-[#514945] transition hover:border-[#b56f6f] hover:text-[#b56f6f]"
                          >
                            Edit
                          </Link>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                MOBILE CARDS
            ================================================= */}

            <div className="divide-y divide-[#eee6e1] md:hidden">

              {filteredProducts.map(
                (product) => (

                  <div
                    key={product.id}
                    className="p-4"
                  >

                    <div className="flex gap-3">

                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f4efec]">

                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                          className="h-full w-full object-cover"
                        />

                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <div>

                            <p className="text-sm font-medium text-[#292321]">
                              {
                                product.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-[#a09792]">
                              {
                                product.sku
                              }
                            </p>

                          </div>

                          <StatusBadge
                            status={
                              product.status
                            }
                          />

                        </div>

                        <div className="mt-3 flex items-center justify-between">

                          <div>

                            <p className="text-sm font-semibold text-[#292321]">
                              {formatPrice(
                                product.price
                              )}
                            </p>

                            <p className="mt-1 text-xs text-[#8f8580]">
                              Stock:{" "}
                              {
                                product.stock
                              }
                            </p>

                            <p className="mt-1 text-xs text-[#8f8580]">
                              {
                                product.category
                              }
                            </p>

                          </div>

                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-lg border border-[#e5ddd8] px-3 py-2 text-xs font-medium text-[#514945] transition hover:border-[#b56f6f] hover:text-[#b56f6f]"
                          >
                            Edit
                          </Link>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {!loading &&
              filteredProducts.length ===
                0 && (

                <div className="px-5 py-16 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#b56f6f]/10">

                    <SearchIcon
                      size={20}
                      inline
                    />

                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[#292321]">
                    No products found
                  </h3>

                  <p className="mt-1 text-sm text-[#958b86]">
                    {products.length ===
                    0
                      ? "No products have been added yet."
                      : "Try changing your search or filters."}
                  </p>

                  {products.length ===
                    0 && (
                    <Link
                      href="/admin/products/new"
                      className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-[#292321] px-4 text-xs font-medium text-white"
                    >
                      <PlusIcon />
                      Add Product
                    </Link>
                  )}

                </div>

              )}

          </div>

        </div>

      </div>

    </div>
  );
}

// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-xl border border-[#eee6e1] bg-white p-5">

      <p className="text-xs font-medium text-[#958b86]">
        {title}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#292321]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#aaa09a]">
        {subtitle}
      </p>

    </div>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  status,
}: {
  status: ProductStatus;
}) {
  const styles: Record<
    ProductStatus,
    string
  > = {
    Active:
      "bg-green-50 text-green-700 border-green-100",

    Draft:
      "bg-gray-50 text-gray-600 border-gray-200",

    "Out of Stock":
      "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// =====================================================
// PLUS ICON
// =====================================================

function PlusIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

// =====================================================
// SEARCH ICON
// =====================================================

function SearchIcon({
  size = 18,
  inline = false,
}: {
  size?: number;
  inline?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={
        inline
          ? "text-[#b56f6f]"
          : "absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa09a]"
      }
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

