"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

type CategoryStatus = "Active" | "Inactive";

interface Category {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  products: number;
  status: CategoryStatus;
  featured: boolean;
  sortOrder: number;
}

export default function CategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [search, setSearch] =
    useState("");

  /*
   * IMPORTANT:
   * Never use null for loading.
   *
   * false = normal
   * true  = loading
   */
  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  const [message, setMessage] =
    useState<string>("");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [updatingStatusId, setUpdatingStatusId] =
    useState<number | null>(null);

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/categories",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      console.log(
        "CATEGORY API RESPONSE:",
        result
      );

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Unable to load categories."
        );
      }

      /*
       * Your API normally returns:
       *
       * {
       *   success: true,
       *   count: 3,
       *   categories: [...]
       * }
       *
       * We support both categories and data.
       */

      const rows = Array.isArray(
        result.categories
      )
        ? result.categories
        : Array.isArray(result.data)
        ? result.data
        : [];

      const mappedCategories: Category[] =
        rows.map((item: Record<string, unknown>) => ({
          id: Number(item.id),
          parentId: item.parentId == null ? null : Number(item.parentId),

          name:
            typeof item.name === "string"
              ? item.name
              : "",

          slug:
            typeof item.slug === "string"
              ? item.slug
              : "",

          description: typeof item.description === "string" ? item.description : null,

          image: typeof item.image === "string" ? item.image : null,

          /*
           * Current Category API does not
           * return product count yet.
           */
          products:
            typeof item.products === "number"
              ? item.products
              : typeof item.productCount ===
                "number"
              ? item.productCount
              : 0,

          status:
            item.status === "active"
              ? "Active"
              : "Inactive",

          featured:
            Boolean(item.featured),

          sortOrder:
            typeof item.sortOrder === "number"
              ? item.sortOrder
              : 0,
        }));

      console.log(
        "MAPPED CATEGORIES:",
        mappedCategories
      );

      setCategories(
        mappedCategories
      );
    } catch (err) {
      console.error(
        "LOAD CATEGORIES ERROR:",
        err
      );

      setCategories([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/categories",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result?.success
        ) {
          throw new Error(
            result?.message ||
              "Unable to load categories."
          );
        }

        if (cancelled) return;

        const rows = Array.isArray(
          result.categories
        )
          ? result.categories
          : Array.isArray(result.data)
          ? result.data
          : [];

        const mappedCategories: Category[] =
          rows.map((item: Record<string, unknown>) => ({
            id: Number(item.id),
          parentId: item.parentId == null ? null : Number(item.parentId),

            name:
              typeof item.name === "string"
                ? item.name
                : "",

            slug:
              typeof item.slug === "string"
                ? item.slug
                : "",

            description: typeof item.description === "string" ? item.description : null,

            image: typeof item.image === "string" ? item.image : null,

            products:
              typeof item.products ===
              "number"
                ? item.products
                : typeof item.productCount ===
                  "number"
                ? item.productCount
                : 0,

            status:
              item.status === "active"
                ? "Active"
                : "Inactive",

            featured:
              Boolean(item.featured),

            sortOrder:
              typeof item.sortOrder ===
              "number"
                ? item.sortOrder
                : 0,
          }));

        setCategories(
          mappedCategories
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "INITIAL CATEGORY LOAD ERROR:",
          err
        );

        setCategories([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load categories."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredCategories =
    useMemo(() => {
      const value =
        search
          .toLowerCase()
          .trim();

      if (!value) {
        return categories;
      }

      return categories.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(value) ||
          category.slug
            .toLowerCase()
            .includes(value)
      );
    }, [categories, search]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const activeCount =
    categories.filter(
      (category) =>
        category.status === "Active"
    ).length;

  const totalProducts =
    categories.reduce(
      (total, category) =>
        total + category.products,
      0
    );

  // =====================================================
  // DELETE CATEGORY
  // =====================================================

  const handleDelete = async (
    id: number
  ) => {
    const category =
      categories.find(
        (item) => item.id === id
      );

    if (!category) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${category.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      const response =
        await fetch(
          `/api/categories/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Unable to delete category."
        );
      }

      setCategories(
        (prev) =>
          prev.filter(
            (item) =>
              item.id !== id
          )
      );

      setMessage(
        "Category deleted successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error(
        "DELETE CATEGORY ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete category."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // TOGGLE STATUS
  // =====================================================

  const toggleStatus = async (
    category: Category
  ) => {
    const newStatus =
      category.status === "Active"
        ? "inactive"
        : "active";

    try {
      setUpdatingStatusId(
        category.id
      );

      setError("");
      setMessage("");

      const response =
        await fetch(
          `/api/categories/${category.id}`,
          {
            method: "PUT",
            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: category.name,
              description:
                category.description,
              status: newStatus,
              featured:
                category.featured,
              image:
                category.image,
              sortOrder:
                category.sortOrder,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Unable to update category status."
        );
      }

      setCategories(
        (prev) =>
          prev.map((item) =>
            item.id === category.id
              ? {
                  ...item,

                  status:
                    newStatus ===
                    "active"
                      ? "Active"
                      : "Inactive",
                }
              : item
          )
      );

      setMessage(
        "Category status updated successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (err) {
      console.error(
        "UPDATE CATEGORY STATUS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update category status."
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    await loadCategories();
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-full">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-[#eee6e1] bg-white">

        <div className="px-4 py-5 lg:px-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#b56f6f]">
                Catalog
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#292321]">
                Categories
              </h1>

              <p className="mt-1 text-sm text-[#8f8580]">
                Organize your products into categories.
              </p>

            </div>

            <div className="flex items-center gap-2">

              {/* Refresh */}

              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  loading === true
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#e7dfda] bg-white px-4 text-sm font-medium text-[#4a403c] transition hover:bg-[#faf8f6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>

              {/* Add Category */}

              <Link
                href="/admin/categories/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#292321] px-5 text-sm font-medium text-white transition hover:bg-[#403936]"
              >
                <PlusIcon />

                Add Category
              </Link>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-4 lg:p-5">

        {/* Error */}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3">

            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="ml-4 text-lg text-red-500"
            >
              ×
            </button>

          </div>
        )}

        {/* Success */}

        {message && (
          <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3">

            <p className="text-sm text-green-700">
              {message}
            </p>

          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <SummaryCard
            title="Total Categories"
            value={categories.length.toString()}
            subtitle="All categories"
          />

          <SummaryCard
            title="Active Categories"
            value={activeCount.toString()}
            subtitle="Currently visible"
          />

          <SummaryCard
            title="Products"
            value={totalProducts.toString()}
            subtitle="Across all categories"
          />

        </div>

        {/* =================================================
            CATEGORY LIST
        ================================================= */}

        <div className="mt-6 overflow-hidden rounded-xl border border-[#eee6e1] bg-white">

          {/* Search */}

          <div className="border-b border-[#eee6e1] p-4">

            <div className="relative max-w-md">

              <SearchIcon />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search categories..."
                className="h-11 w-full rounded-lg border border-[#e5ddd8] bg-[#faf8f6] pl-10 pr-4 text-sm text-[#292321] outline-none placeholder:text-[#aaa09a] focus:border-[#b56f6f] focus:bg-white"
              />

            </div>

          </div>

          {/* Count */}

          <div className="border-b border-[#eee6e1] px-4 py-3">

            <p className="text-xs text-[#958b86]">

              Showing{" "}

              <span className="font-medium text-[#514945]">
                {filteredCategories.length}
              </span>

              {" "}of{" "}

              <span className="font-medium text-[#514945]">
                {categories.length}
              </span>

              {" "}categories

            </p>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div className="px-5 py-20 text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#eee6e1] border-t-[#b56f6f]" />

              <p className="mt-4 text-sm text-[#958b86]">
                Loading categories...
              </p>

            </div>

          ) : (

            <>

              {/* =================================================
                  DESKTOP
              ================================================= */}

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[800px]">

                  <thead>

                    <tr className="border-b border-[#eee6e1] bg-[#fcfaf9]">

                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                        Category
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                        Products
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                        Status
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                        Featured
                      </th>

                      <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-[#f0e9e5]">

                    {filteredCategories.map(
                      (category) => (

                        <tr
                          key={category.id}
                          className="transition hover:bg-[#fcfaf9]"
                        >

                          {/* Category */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f4efec]">

                                {category.image ? (

                                  <img
                                    src={
                                      category.image
                                    }
                                    alt={
                                      category.name
                                    }
                                    className="h-full w-full object-cover"
                                  />

                                ) : (

                                  <div className="flex h-full w-full items-center justify-center text-[10px] text-[#aaa09a]">
                                    No image
                                  </div>

                                )}

                              </div>

                              <div className="min-w-0">

                                <div className="flex items-center gap-2">

                                  <p className="text-sm font-medium text-[#292321]">
                                    {
                                      category.name
                                    }
                                  </p>

                                  {category.featured && (
                                    <span className="rounded-full bg-[#b56f6f]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#b56f6f]">
                                      Featured
                                    </span>
                                  )}

                                </div>

                                {category.parentId !== null && <p className="mt-1 text-[11px] font-medium text-[#9F5E5E]">Subcategory of {categories.find((item) => item.id === category.parentId)?.name ?? "Parent category"}</p>}<p className="mt-1 text-xs text-[#a09792]">
                                  /{
                                    category.slug
                                  }
                                </p>

                                <p className="mt-1 max-w-[350px] truncate text-xs text-[#958b86]">
                                  {
                                    category.description ||
                                    "No description"
                                  }
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Products */}

                          <td className="px-4 py-4">

                            <span className="text-sm font-medium text-[#514945]">
                              {
                                category.products
                              }
                            </span>

                          </td>

                          {/* Status */}

                          <td className="px-4 py-4">

                            <button
                              type="button"
                              disabled={
                                updatingStatusId ===
                                category.id
                              }
                              onClick={() =>
                                toggleStatus(
                                  category
                                )
                              }
                              className="disabled:cursor-not-allowed disabled:opacity-60"
                            >

                              {updatingStatusId ===
                              category.id ? (

                                <span className="text-xs text-[#958b86]">
                                  Updating...
                                </span>

                              ) : (

                                <StatusBadge
                                  status={
                                    category.status
                                  }
                                />

                              )}

                            </button>

                          </td>

                          {/* Featured */}

                          <td className="px-4 py-4">

                            {category.featured ? (

                              <span className="text-sm text-[#b56f6f]">
                                Yes
                              </span>

                            ) : (

                              <span className="text-sm text-[#958b86]">
                                No
                              </span>

                            )}

                          </td>

                          {/* Actions */}

                          <td className="px-4 py-4">

                            <div className="flex items-center justify-end gap-2">

                              {/* Edit */}

                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/admin/categories/${category.id}/edit`
                                  )
                                }
                                className="inline-flex h-9 items-center rounded-lg border border-[#e5ddd8] px-3 text-xs font-medium text-[#514945] transition hover:border-[#b56f6f] hover:text-[#b56f6f]"
                              >
                                Edit
                              </button>

                              {/* Delete */}

                              <button
                                type="button"
                                disabled={
                                  deletingId ===
                                  category.id
                                }
                                onClick={() =>
                                  handleDelete(
                                    category.id
                                  )
                                }
                                className="inline-flex h-9 items-center rounded-lg border border-red-100 px-3 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                {deletingId ===
                                category.id
                                  ? "Deleting..."
                                  : "Delete"}

                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* =================================================
                  MOBILE
              ================================================= */}

              <div className="divide-y divide-[#eee6e1] md:hidden">

                {filteredCategories.map(
                  (category) => (

                    <div
                      key={category.id}
                      className="p-4"
                    >

                      <div className="flex gap-3">

                        {/* Image */}

                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f4efec]">

                          {category.image ? (

                            <img
                              src={
                                category.image
                              }
                              alt={
                                category.name
                              }
                              className="h-full w-full object-cover"
                            />

                          ) : (

                            <div className="flex h-full w-full items-center justify-center text-[10px] text-[#aaa09a]">
                              No image
                            </div>

                          )}

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <div className="flex items-center gap-2">

                                <h3 className="text-sm font-medium text-[#292321]">
                                  {
                                    category.name
                                  }
                                </h3>

                                {category.featured && (
                                  <span className="rounded-full bg-[#b56f6f]/10 px-2 py-0.5 text-[9px] font-semibold text-[#b56f6f]">
                                    Featured
                                  </span>
                                )}

                              </div>

                              {category.parentId !== null && <p className="mt-1 text-[11px] font-medium text-[#9F5E5E]">Subcategory of {categories.find((item) => item.id === category.parentId)?.name ?? "Parent category"}</p>}<p className="mt-1 text-xs text-[#a09792]">
                                /{
                                  category.slug
                                }
                              </p>

                            </div>

                            <button
                              type="button"
                              disabled={
                                updatingStatusId ===
                                category.id
                              }
                              onClick={() =>
                                toggleStatus(
                                  category
                                )
                              }
                            >

                              {updatingStatusId ===
                              category.id ? (

                                <span className="text-xs text-[#958b86]">
                                  Updating...
                                </span>

                              ) : (

                                <StatusBadge
                                  status={
                                    category.status
                                  }
                                />

                              )}

                            </button>

                          </div>

                          <p className="mt-2 text-xs text-[#958b86]">
                            {
                              category.products
                            }{" "}
                            products
                          </p>

                          <div className="mt-3 flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/admin/categories/${category.id}/edit`
                                )
                              }
                              className="rounded-lg border border-[#e5ddd8] px-3 py-2 text-xs font-medium text-[#514945]"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                category.id
                              }
                              onClick={() =>
                                handleDelete(
                                  category.id
                                )
                              }
                              className="rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-500 disabled:opacity-50"
                            >

                              {deletingId ===
                              category.id
                                ? "Deleting..."
                                : "Delete"}

                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            </>

          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            filteredCategories.length ===
              0 && (

              <div className="px-5 py-16 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">

                  <SearchIcon
                    size={20}
                  />

                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#292321]">
                  No categories found
                </h3>

                <p className="mt-1 text-sm text-[#958b86]">

                  {search
                    ? "Try a different search term."
                    : "No categories have been created yet."}

                </p>

              </div>

            )}

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   SUMMARY CARD
===================================================== */

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


/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({
  status,
}: {
  status: CategoryStatus;
}) {
  if (status === "Active") {
    return (
      <span className="inline-flex rounded-full border border-green-100 bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
      Inactive
    </span>
  );
}


/* =====================================================
   PLUS ICON
===================================================== */

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


/* =====================================================
   SEARCH ICON
===================================================== */

function SearchIcon({
  size = 18,
}: {
  size?: number;
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
        size === 18
          ? "absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa09a]"
          : ""
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
