"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";

type CategoryStatus =
  | "Active"
  | "Inactive";

interface CategoryData {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string;
  image: string;
  sizeGuideImage: string;
  status: CategoryStatus;
  featured: boolean;
  productCount: number;
  sortOrder: number;
}

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [category, setCategory] =
    useState<CategoryData | null>(null);

  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState<CategoryStatus>("Active");

  const [featured, setFeatured] =
    useState(false);

  const [image, setImage] =
    useState("");

  const [sizeGuideImage, setSizeGuideImage] = useState("");

  const [parentId, setParentId] = useState("");
  const [parentCategories, setParentCategories] = useState<Array<{ id: number; name: string; slug: string; parentId: number | null; status: string }>>([]);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories", { cache: "no-store" }).then((response) => response.json()).then((result) => {
      if (!cancelled && result?.success && Array.isArray(result.categories)) {
        setParentCategories(result.categories.filter((item: { id: number; parentId: number | null; status: string }) => item.id !== Number(id) && item.parentId === null && item.status === "active"));
      }
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [id]);

  const [sortOrder, setSortOrder] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // LOAD CATEGORY
  // =====================================================

  useEffect(() => {
    if (!id) return;

    const loadCategory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/categories/${id}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        console.log(
          "GET CATEGORY RESPONSE:",
          result
        );

        if (
          !response.ok ||
          !result?.success
        ) {
          throw new Error(
            result?.message ||
              "Unable to load category."
          );
        }

        const data =
          result.category;

        if (!data) {
          throw new Error(
            "Category not found."
          );
        }

        const categoryData: CategoryData = {
          id: Number(data.id),
          parentId: data.parentId == null ? null : Number(data.parentId),

          name:
            data.name || "",

          slug:
            data.slug || "",

          description:
            data.description || "",

          image:
            data.image || "",

          sizeGuideImage: data.sizeGuideImage || "",

          status:
            data.status === "inactive"
              ? "Inactive"
              : "Active",

          featured:
            Boolean(data.featured),

          productCount:
            typeof data.productCount ===
            "number"
              ? data.productCount
              : 0,

          sortOrder:
            Number(data.sortOrder) || 0,
        };

        setCategory(
          categoryData
        );

        setName(
          categoryData.name
        );

        setSlug(
          categoryData.slug
        );

        setDescription(
          categoryData.description
        );

        setStatus(
          categoryData.status
        );

        setFeatured(
          categoryData.featured
        );

        setImage(
          categoryData.image
        );
        setSizeGuideImage(categoryData.sizeGuideImage);
        setParentId(categoryData.parentId ? String(categoryData.parentId) : "");

        setSortOrder(
          categoryData.sortOrder
        );
      } catch (err) {
        console.error(
          "LOAD CATEGORY ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load category."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [id]);

  // =====================================================
  // NAME -> SLUG
  // Same behaviour as Add Category
  // =====================================================

  const handleNameChange = (
    value: string
  ) => {
    setName(value);

    const generatedSlug =
      value
        .toLowerCase()
        .trim()
        .replace(
          /[^a-z0-9\s-]/g,
          ""
        )
        .replace(
          /\s+/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        );

    setSlug(
      generatedSlug
    );
  };

  // =====================================================
  // SLUG CHANGE
  // =====================================================

  const handleSlugChange = (
    value: string
  ) => {
    setSlug(
      value
        .toLowerCase()
        .replace(
          /[^a-z0-9-]/g,
          ""
        )
    );
  };

  // =====================================================
  // IMAGE PREVIEW
  // Same as Add Category
  // =====================================================

  const handleImageUpload = async (
  e: ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  try {
    setError("");

    // Temporary preview
    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      "/api/upload/category",
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result?.success) {
      throw new Error(
        result?.message ||
          "Failed to upload image."
      );
    }

    // IMPORTANT:
    // Replace temporary blob URL with permanent URL
    setImage(result.image);
  } catch (error) {
    console.error(
      "IMAGE UPLOAD ERROR:",
      error
    );

    setImage("");

    setError(
      error instanceof Error
        ? error.message
        : "Failed to upload image."
    );
  }
};

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = () => {
    setImage("");
  };

  // =====================================================
  // UPDATE CATEGORY
  // =====================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName =
      name.trim();

    const cleanSlug =
      slug.trim().toLowerCase();

    const cleanDescription =
      description.trim();

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!cleanName) {
      setError(
        "Category name is required."
      );
      return;
    }

    if (cleanName.length > 100) {
      setError(
        "Category name cannot exceed 100 characters."
      );
      return;
    }

    if (!cleanSlug) {
      setError(
        "URL slug is required."
      );
      return;
    }

    setSaving(true);

    try {
      // -----------------------------------------------
      // API PAYLOAD
      // -----------------------------------------------

      const payload = {
        name: cleanName,

        description:
          cleanDescription || null,

        status:
          status === "Active"
            ? "active"
            : "inactive",

        featured,

        image:
          image || null,

        sizeGuideImage: sizeGuideImage.trim() || null,

        parentId: parentId ? Number(parentId) : null,

        sortOrder:
          Number.isInteger(sortOrder)
            ? sortOrder
            : 0,
      };

      console.log(
        "UPDATE CATEGORY PAYLOAD:",
        payload
      );

      // -----------------------------------------------
      // PUT API
      // -----------------------------------------------

      const response = await fetch(
        `/api/categories/${id}`,
        {
          method: "PUT",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const result =
        await response.json();

      console.log(
        "UPDATE CATEGORY RESPONSE:",
        result
      );

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Unable to update category."
        );
      }

      // -----------------------------------------------
      // UPDATE LOCAL STATE
      // -----------------------------------------------

      if (result.category) {
        const updated =
          result.category;

        setCategory({
          id: Number(
            updated.id
          ),
          parentId: updated.parentId == null ? null : Number(updated.parentId),

          name:
            updated.name || "",

          slug:
            updated.slug || "",

          description:
            updated.description || "",

          image:
            updated.image || "",

          sizeGuideImage: updated.sizeGuideImage || "",

          status:
            updated.status ===
            "inactive"
              ? "Inactive"
              : "Active",

          featured:
            Boolean(
              updated.featured
            ),

          productCount:
            typeof updated.productCount ===
            "number"
              ? updated.productCount
              : category?.productCount ||
                0,

          sortOrder:
            Number(
              updated.sortOrder
            ) || 0,
        });

        setName(
          updated.name || ""
        );

        setSlug(
          updated.slug || ""
        );

        setDescription(
          updated.description || ""
        );

        setImage(
          updated.image || ""
        );
        setSizeGuideImage(updated.sizeGuideImage || "");

        setStatus(
          updated.status ===
          "inactive"
            ? "Inactive"
            : "Active"
        );

        setFeatured(
          Boolean(
            updated.featured
          )
        );

        setSortOrder(
          Number(
            updated.sortOrder
          ) || 0
        );
      }

      setSuccess(
        "Category updated successfully."
      );

      // -----------------------------------------------
      // BACK TO CATEGORY LIST
      // -----------------------------------------------

      setTimeout(() => {
        router.push(
          "/admin/categories"
        );

        router.refresh();
      }, 700);
    } catch (err) {
      console.error(
        "UPDATE CATEGORY ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update category."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-full">

        <div className="flex min-h-[500px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#eee6e1] border-t-[#b56f6f]" />

            <p className="mt-4 text-sm text-[#958b86]">
              Loading category...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!category) {
    return (
      <div className="min-h-full">

        <div className="flex min-h-[500px] flex-col items-center justify-center px-5 text-center">

          <h1 className="text-xl font-semibold text-[#292321]">
            Category Not Found
          </h1>

          <p className="mt-2 text-sm text-[#958b86]">
            {error ||
              "The requested category could not be found."}
          </p>

          <Link
            href="/admin/categories"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[#292321] px-5 text-sm font-medium text-white"
          >
            Back to Categories
          </Link>

        </div>

      </div>
    );
  }

  // =====================================================
  // UI
  // EXACTLY SAME STYLE AS ADD PAGE
  // =====================================================

  return (
    <div className="min-h-full">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="border-b border-[#eee6e1] bg-white">

        <div className="px-5 py-6 lg:px-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#b56f6f]">
                Catalog
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#292321]">
                Edit Category
              </h1>

              <p className="mt-1 text-sm text-[#8f8580]">
                Update category information and settings.
              </p>

            </div>

            <Link
              href="/admin/categories"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e5ddd8] bg-white px-4 text-sm font-medium text-[#514945] transition hover:border-[#b56f6f] hover:text-[#b56f6f]"
            >
              <ArrowLeftIcon />
              Back to Categories
            </Link>

          </div>

        </div>

      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={handleSubmit}
      >

        <div className="p-5 lg:p-8">

          <div className="mx-auto max-w-5xl">

            {/* SUCCESS */}

            {success && (
              <div className="mb-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3">

                <p className="text-sm text-green-600">
                  {success}
                </p>

              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                <p className="text-sm text-red-600">
                  {error}
                </p>

              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* =================================================
                  MAIN
              ================================================= */}

              <div className="space-y-6 lg:col-span-2">

                {/* CATEGORY INFORMATION */}

                <section className="rounded-xl border border-[#eee6e1] bg-white">

                  <div className="border-b border-[#eee6e1] px-5 py-4">

                    <h2 className="text-sm font-semibold text-[#292321]">
                      Category Information
                    </h2>

                    <p className="mt-1 text-xs text-[#958b86]">
                      Enter the basic information for this category.
                    </p>

                  </div>

                  <div className="space-y-5 p-5">

                    {/* NAME */}

                    <div>

                      <label
                        htmlFor="name"
                        className="mb-2 block text-xs font-medium text-[#514945]"
                      >
                        Category Name

                        <span className="ml-1 text-red-500">
                          *
                        </span>

                      </label>

                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) =>
                          handleNameChange(
                            e.target.value
                          )
                        }
                        placeholder="e.g. Sarees"
                        required
                        disabled={saving}
                        className="h-11 w-full rounded-lg border border-[#e5ddd8] bg-white px-4 text-sm text-[#292321] outline-none placeholder:text-[#aaa09a] focus:border-[#b56f6f] disabled:bg-[#faf8f6]"
                      />

                    </div>

                    {/* SLUG */}

                    <div>

                      <label
                        htmlFor="slug"
                        className="mb-2 block text-xs font-medium text-[#514945]"
                      >
                        URL Slug

                        <span className="ml-1 text-red-500">
                          *
                        </span>

                      </label>

                      <div className="flex">

                        <span className="flex h-11 items-center rounded-l-lg border border-r-0 border-[#e5ddd8] bg-[#faf8f6] px-3 text-sm text-[#958b86]">
                          /
                        </span>

                        <input
                          id="slug"
                          type="text"
                          value={slug}
                          onChange={(e) =>
                            handleSlugChange(
                              e.target.value
                            )
                          }
                          placeholder="sarees"
                          required
                          disabled={saving}
                          className="h-11 min-w-0 flex-1 rounded-r-lg border border-[#e5ddd8] bg-white px-4 text-sm text-[#292321] outline-none placeholder:text-[#aaa09a] focus:border-[#b56f6f] disabled:bg-[#faf8f6]"
                        />

                      </div>

                      <p className="mt-2 text-[11px] text-[#aaa09a]">
                        This will be used in the category URL.
                      </p>

                    </div>

                    <div>
                      <label htmlFor="parentCategory" className="mb-2 block text-xs font-medium text-[#514945]">Parent category</label>
                      <select id="parentCategory" value={parentId} onChange={(event) => setParentId(event.target.value)} disabled={saving} className="h-11 w-full rounded-lg border border-[#e5ddd8] bg-white px-4 text-sm text-[#292321] outline-none focus:border-[#b56f6f] disabled:bg-[#faf8f6]">
                        <option value="">No parent · top-level category</option>
                        {parentCategories.map((item) => <option key={item.id} value={String(item.id)}>{item.name}</option>)}
                      </select>
                      <p className="mt-2 text-[11px] text-[#958b86]">Choose a parent category to display this collection beneath it in the store menu.</p>
                    </div>

                    {/* DESCRIPTION */}

                    <div>

                      <label
                        htmlFor="description"
                        className="mb-2 block text-xs font-medium text-[#514945]"
                      >
                        Description
                      </label>

                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) =>
                          setDescription(
                            e.target.value
                          )
                        }
                        rows={6}
                        disabled={saving}
                        placeholder="Write a short description for this category..."
                        className="w-full resize-none rounded-lg border border-[#e5ddd8] bg-white px-4 py-3 text-sm leading-6 text-[#292321] outline-none placeholder:text-[#aaa09a] focus:border-[#b56f6f] disabled:bg-[#faf8f6]"
                      />

                      <p className="mt-2 text-[11px] text-[#aaa09a]">
                        A short description helps customers understand the category.
                      </p>

                    </div>

                  </div>

                </section>

                {/* =================================================
                    IMAGE
                ================================================= */}

                <section className="rounded-xl border border-[#eee6e1] bg-white">

                  <div className="border-b border-[#eee6e1] px-5 py-4">

                    <h2 className="text-sm font-semibold text-[#292321]">
                      Category Image
                    </h2>

                    <p className="mt-1 text-xs text-[#958b86]">
                      Upload an image to represent this category.
                    </p>

                  </div>

                  <div className="p-5">

                    {image ? (

                      <div className="relative max-w-md overflow-hidden rounded-xl border border-[#e5ddd8] bg-[#faf8f6]">

                        <div className="aspect-[4/3]">

                          <img
                            src={image}
                            alt={
                              name ||
                              "Category image"
                            }
                            className="h-full w-full object-cover"
                          />

                        </div>

                        <button
                          type="button"
                          onClick={
                            removeImage
                          }
                          disabled={
                            saving
                          }
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-50 disabled:opacity-50"
                          aria-label="Remove image"
                        >
                          <XIcon />
                        </button>

                      </div>

                    ) : (

                      <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d8cfca] bg-[#fcfaf9] transition hover:border-[#b56f6f] hover:bg-[#faf5f3]">

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
                          <UploadIcon />
                        </div>

                        <span className="mt-4 text-sm font-medium text-[#514945]">
                          Upload Category Image
                        </span>

                        <span className="mt-1 text-xs text-[#aaa09a]">
                          JPG, PNG or WEBP
                        </span>

                        <span className="mt-1 text-[11px] text-[#b0a6a1]">
                          Recommended: 800 × 600 px
                        </span>

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={
                            handleImageUpload
                          }
                          className="hidden"
                        />

                      </label>

                    )}

                  </div>

                </section>


                <section className="rounded-xl border border-[#eee6e1] bg-white">
                  <div className="border-b border-[#eee6e1] px-5 py-4">
                    <h2 className="text-sm font-semibold text-[#292321]">Category Size Guide</h2>
                    <p className="mt-1 text-xs text-[#958b86]">Used automatically by products in this category unless a product has its own guide.</p>
                  </div>
                  <div className="p-5">
                    <label htmlFor="categorySizeGuideImage" className="mb-2 block text-xs font-medium text-[#514945]">Size chart image URL</label>
                    <input id="categorySizeGuideImage" type="url" value={sizeGuideImage} onChange={(event) => setSizeGuideImage(event.target.value)} disabled={saving} placeholder="https://.../category-size-chart.jpg" className="w-full rounded-lg border border-[#e5ddd8] bg-white px-4 py-3 text-sm text-[#292321] outline-none placeholder:text-[#aaa09a] focus:border-[#b56f6f] disabled:bg-[#faf8f6]" />
                    <p className="mt-2 text-[11px] leading-5 text-[#958b86]">Recommended: upload a chart containing the measurement illustration and table, similar to Max/Flipkart/Bewakoof.</p>
                    {sizeGuideImage && <div className="mt-4 overflow-hidden rounded-xl border border-[#e5ddd8] bg-[#faf8f6] p-2"><img src={sizeGuideImage} alt={`${name || "Category"} size guide preview`} className="max-h-80 w-full object-contain" /></div>}
                  </div>
                </section>
              </div>

              {/* =================================================
                  SIDEBAR
              ================================================= */}

              <div className="space-y-6">

                {/* STATUS */}

                <section className="rounded-xl border border-[#eee6e1] bg-white">

                  <div className="border-b border-[#eee6e1] px-5 py-4">

                    <h2 className="text-sm font-semibold text-[#292321]">
                      Category Status
                    </h2>

                  </div>

                  <div className="space-y-4 p-5">

                    <div>

                      <label
                        htmlFor="status"
                        className="mb-2 block text-xs font-medium text-[#514945]"
                      >
                        Status
                      </label>

                      <select
                        id="status"
                        value={status}
                        onChange={(e) =>
                          setStatus(
                            e.target
                              .value as CategoryStatus
                          )
                        }
                        disabled={saving}
                        className="h-11 w-full rounded-lg border border-[#e5ddd8] bg-white px-4 text-sm text-[#514945] outline-none focus:border-[#b56f6f]"
                      >

                        <option value="Active">
                          Active
                        </option>

                        <option value="Inactive">
                          Inactive
                        </option>

                      </select>

                    </div>

                    {/* FEATURED */}

                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#eee6e1] p-3">

                      <input
                        type="checkbox"
                        checked={
                          featured
                        }
                        onChange={(e) =>
                          setFeatured(
                            e.target.checked
                          )
                        }
                        disabled={saving}
                        className="mt-0.5 h-4 w-4 accent-[#b56f6f]"
                      />

                      <span>

                        <span className="block text-xs font-medium text-[#514945]">
                          Featured Category
                        </span>

                        <span className="mt-1 block text-[11px] leading-4 text-[#aaa09a]">
                          Show this category in featured sections.
                        </span>

                      </span>

                    </label>

                  </div>

                </section>

                {/* =================================================
                    PREVIEW
                ================================================= */}

                <section className="rounded-xl border border-[#eee6e1] bg-white">

                  <div className="border-b border-[#eee6e1] px-5 py-4">

                    <h2 className="text-sm font-semibold text-[#292321]">
                      Preview
                    </h2>

                  </div>

                  <div className="p-5">

                    <div className="overflow-hidden rounded-xl border border-[#eee6e1]">

                      <div className="aspect-[4/3] bg-[#f4efec]">

                        {image ? (

                          <img
                            src={image}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />

                        ) : (

                          <div className="flex h-full items-center justify-center text-xs text-[#aaa09a]">
                            No image
                          </div>

                        )}

                      </div>

                      <div className="p-4">

                        <p className="text-sm font-semibold text-[#292321]">
                          {name ||
                            "Category Name"}
                        </p>

                        <p className="mt-1 text-xs text-[#958b86]">
                          {description ||
                            "Category description will appear here."}
                        </p>

                      </div>

                    </div>

                  </div>

                </section>

                {/* =================================================
                    CATEGORY INFORMATION
                ================================================= */}

                <section className="rounded-xl border border-[#eee6e1] bg-white">

                  <div className="border-b border-[#eee6e1] px-5 py-4">

                    <h2 className="text-sm font-semibold text-[#292321]">
                      Category Information
                    </h2>

                  </div>

                  <div className="space-y-4 p-5">

                    <div className="flex items-center justify-between">

                      <span className="text-xs text-[#958b86]">
                        Category ID
                      </span>

                      <span className="text-xs font-medium text-[#514945]">
                        #{id}
                      </span>

                    </div>

                    <div className="flex items-center justify-between">

                      <span className="text-xs text-[#958b86]">
                        Products
                      </span>

                      <span className="text-xs font-medium text-[#514945]">
                        {
                          category.productCount
                        }
                      </span>

                    </div>

                    <div className="flex items-center justify-between">

                      <span className="text-xs text-[#958b86]">
                        Status
                      </span>

                      <span
                        className={
                          status ===
                          "Active"
                            ? "text-xs font-medium text-green-600"
                            : "text-xs font-medium text-gray-500"
                        }
                      >
                        {status}
                      </span>

                    </div>

                  </div>

                </section>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="rounded-xl border border-[#eee6e1] bg-white p-5">

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#292321] px-5 text-sm font-medium text-white transition hover:bg-[#403936] disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {saving ? (
                      <>
                        <SpinnerIcon />
                        Saving...
                      </>
                    ) : (
                      <>
                        <SaveIcon />
                        Save Category
                      </>
                    )}

                  </button>

                  <Link
                    href="/admin/categories"
                    className="mt-3 flex h-11 w-full items-center justify-center rounded-lg border border-[#e5ddd8] text-sm font-medium text-[#514945] transition hover:border-[#b56f6f] hover:text-[#b56f6f]"
                  >
                    Cancel
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>

      </form>

    </div>
  );
}


/* =====================================================
   ICONS
===================================================== */

function ArrowLeftIcon() {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function SaveIcon() {
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
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}

function SpinnerIcon() {
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
      className="animate-spin"
      aria-hidden="true"
    >
      <path d="M12 2v4" />
      <path d="M22 12h-4" />
      <path d="M12 22v-4" />
      <path d="M2 12h4" />
    </svg>
  );
}
