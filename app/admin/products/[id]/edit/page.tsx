
"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import type { CategoryResponse, UploadResponse, ProductImageResponse, ProductOptionResponse, OptionValueResponse, ProductVariantResponse } from "@/lib/product-api-types";
import ProductServicePolicy from "@/components/admin/ProductServicePolicy";
import { useParams, useRouter } from "next/navigation";

// =====================================================
// TYPES
// =====================================================

type Category = {
  id: number;
  name: string;
  parentName?: string | null;
  slug: string;
};

type VariationOption = {
  id: string;
  name: string;
  values: string[];
};

type ProductVariant = {
  id: string;
  values: Record<string, string>;
  sku: string;
  price: string;
  stock: string;
};

type ProductStatus = "Active" | "Draft";

// =====================================================
// PAGE
// =====================================================

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = String(params.id);

  // ===================================================
  // BASIC PRODUCT
  // ===================================================

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("");
  const [minOrderQuantity, setMinOrderQuantity] = useState("");
  const [maxOrderQuantity, setMaxOrderQuantity] = useState("");

  const [status, setStatus] =
    useState<ProductStatus>("Active");

  const [featured, setFeatured] =
    useState(false);
  const [badgeEnabled, setBadgeEnabled] = useState(false);
  const [badgeText, setBadgeText] = useState("");
  const [badgeTone, setBadgeTone] = useState("dark");

  // ===================================================
  // IMAGES
  // ===================================================

  const [images, setImages] =
    useState<string[]>([]);

  // ===================================================
  // CATEGORIES
  // ===================================================

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  // ===================================================
  // VARIATIONS
  // ===================================================

  const [hasVariations, setHasVariations] =
    useState(false);

  const [variationOptions, setVariationOptions] =
    useState<VariationOption[]>([]);

  const [variants, setVariants] =
    useState<ProductVariant[]>([]);

  // ===================================================
  // UI
  // ===================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===================================================
  // LOAD CATEGORIES
  // ===================================================

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);

        const response = await fetch(
          "/api/categories",
          {
            method: "GET",
            cache: "no-store",
            credentials: "include",
          }
        );

        const result = await response.json();

        if (
          !response.ok ||
          !result?.success
        ) {
          throw new Error(
            result?.message ||
              "Unable to load categories."
          );
        }

        const rows = Array.isArray(
          result.categories
        )
          ? result.categories
          : Array.isArray(result.data)
            ? result.data
            : [];

        if (cancelled) return;

        setCategories(
          rows
            .filter(
              (item: CategoryResponse) =>
                item.status === "active"
            )
            .map((item: CategoryResponse) => ({
              id: Number(item.id),
              name: item.name,
              parentName: item.parent?.name ?? null,
              slug: item.slug,
            }))
        );
      } catch (err) {
        console.error(
          "LOAD CATEGORIES ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load categories."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // ===================================================
  // LOAD PRODUCT
  // ===================================================

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/products/${productId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Unable to load product.");
        }

        if (cancelled) return;

        const data = result.product || result.data;
        if (!data) {
          throw new Error("Product data was not returned by the server.");
        }

        setProductName(data.name ?? data.productName ?? "");
        setCategory(
          data.categoryId
            ? String(data.categoryId)
            : data.category?.id
              ? String(data.category.id)
              : ""
        );
        setSku(data.sku ?? "");
        setDescription(data.description ?? "");
        setVideoUrl(data.videoUrl ?? "");
        setPrice(data.price != null ? String(data.price) : "");
        setComparePrice(data.comparePrice != null ? String(data.comparePrice) : "");
        setStock(data.stock != null ? String(data.stock) : "");
        setMinOrderQuantity(data.minOrderQuantity == null ? "" : String(data.minOrderQuantity));
        setMaxOrderQuantity(data.maxOrderQuantity == null ? "" : String(data.maxOrderQuantity));
        setStatus(data.status === "draft" ? "Draft" : "Active");
        setFeatured(Boolean(data.featured));
        setBadgeEnabled(Boolean(data.badgeEnabled));
        setBadgeText(typeof data.badgeText === "string" ? data.badgeText : "");
        setBadgeTone(typeof data.badgeTone === "string" ? data.badgeTone : "dark");

        const rawImages = Array.isArray(data.images) ? data.images : [];
        setImages(
          rawImages
            .map((item: ProductImageResponse) =>
              typeof item === "string" ? item : item?.url || item?.image || ""
            )
            .filter(Boolean)
        );

        const rawOptions = Array.isArray(data.variationOptions)
          ? data.variationOptions
          : [];
        const rawVariants = Array.isArray(data.variants)
          ? data.variants
          : [];

        setHasVariations(
          Boolean(data.hasVariations) ||
          rawOptions.length > 0 ||
          rawVariants.length > 0
        );

        setVariationOptions(
          rawOptions.map((option: ProductOptionResponse, index: number) => ({
            id: String(option.id ?? `option-${index}-${Date.now()}`),
            name: option.name ?? option.optionName ?? "",
            values: Array.isArray(option.values)
              ? option.values
                  .map((value: OptionValueResponse) =>
                    typeof value === "string" ? value : value?.value ?? ""
                  )
                  .filter(Boolean)
              : [],
          }))
        );

        setVariants(
          rawVariants.map((variant: ProductVariantResponse, index: number) => ({
            id: String(variant.id ?? `variant-${index}-${Date.now()}`),
            values:
              variant.values && typeof variant.values === "object"
                ? variant.values
                : {},
            sku: variant.sku ?? "",
            price: variant.price != null ? String(variant.price) : "",
            stock: variant.stock != null ? String(variant.stock) : "",
          }))
        );
      } catch (err) {
        console.error("LOAD PRODUCT ERROR:", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load product."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (productId) loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  // ===================================================
  // IMAGE UPLOAD
  // ===================================================

  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (!files) return;

    const available = 6 - images.length;

    if (available <= 0) {
      e.target.value = "";
      return;
    }

    const selectedFiles = Array.from(files).slice(
      0,
      available
    );

    setError("");
    setSuccess("");
    setUploading(true);

    try {
      for (const file of selectedFiles) {
        // Instant preview remains exactly as before.
        const previewUrl = URL.createObjectURL(file);

        setImages((prev) =>
          [...prev, previewUrl].slice(0, 6)
        );

        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch(
            "/api/upload/product",
            {
              method: "POST",
              body: formData,
              credentials: "include",
            }
          );

          const responseText = await response.text();

          let result: UploadResponse | null = null;

          try {
            result = responseText
              ? JSON.parse(responseText)
              : null;
          } catch {
            throw new Error(
              responseText ||
                `Upload failed (${response.status})`
            );
          }

          if (!response.ok || !result?.success) {
            throw new Error(
              result?.message ||
                `Upload failed (${response.status})`
            );
          }

          const imageUrl =
            result?.url ||
            result?.image ||
            result?.data?.url ||
            result?.data?.image;

          if (!imageUrl) {
            throw new Error(
              "Upload API did not return an image URL."
            );
          }

          // Replace blob preview with permanent URL.
          setImages((prev) =>
            prev.map((image) =>
              image === previewUrl
                ? imageUrl
                : image
            )
          );

          URL.revokeObjectURL(previewUrl);
        } catch (uploadError) {
          // Remove failed preview.
          setImages((prev) =>
            prev.filter(
              (image) => image !== previewUrl
            )
          );

          URL.revokeObjectURL(previewUrl);
          throw uploadError;
        }
      }

      setSuccess(
        "Product image(s) uploaded successfully."
      );
    } catch (err) {
      console.error(
        "PRODUCT IMAGE UPLOAD ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload product image."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ===================================================
  // REMOVE IMAGE
  // ===================================================

  const removeImage = (index: number) => {
    setImages((prev) => {
      const image = prev[index];

      if (
        image &&
        image.startsWith("blob:")
      ) {
        URL.revokeObjectURL(image);
      }

      return prev.filter(
        (_, i) => i !== index
      );
    });
  };

  // ===================================================
  // ADD VARIATION OPTION
  // ===================================================

  const addVariationOption = (
    name = ""
  ) => {
    const option: VariationOption = {
      id: createId(),
      name,
      values: [],
    };

    setVariationOptions((prev) => [
      ...prev,
      option,
    ]);
  };

  // ===================================================
  // REMOVE VARIATION OPTION
  // ===================================================

  const removeVariationOption = (
    optionId: string
  ) => {
    setVariationOptions((prev) =>
      prev.filter((option) => option.id !== optionId)
    );

    setVariants((prev) =>
      prev.filter((variant) => {
        const removed = variationOptions.find((option) => option.id === optionId);
        if (!removed) return true;
        return !Object.keys(variant.values).some(
          (key) => key === removed.name.trim()
        );
      })
    );
  };

  // ===================================================
  // UPDATE OPTION NAME
  // ===================================================

  const updateOptionName = (
    optionId: string,
    name: string
  ) => {
    const oldOption = variationOptions.find(
      (option) => option.id === optionId
    );
    const oldName = oldOption?.name.trim();
    const newName = name.trim();

    setVariationOptions((prev) =>
      prev.map((option) =>
        option.id === optionId
          ? { ...option, name }
          : option
      )
    );

    if (oldName && newName && oldName !== newName) {
      setVariants((prev) =>
        prev.map((variant) => {
          const values = { ...variant.values };
          if (Object.prototype.hasOwnProperty.call(values, oldName)) {
            values[newName] = values[oldName];
            delete values[oldName];
          }
          return { ...variant, values };
        })
      );
    }
  };

  // ===================================================
  // ADD OPTION VALUE
  // ===================================================

  const addOptionValue = (
    optionId: string,
    value: string
  ) => {
    const cleanValue = value.trim();

    if (!cleanValue) return;

    setVariationOptions((prev) =>
      prev.map((option) => {
        if (
          option.id !== optionId
        ) {
          return option;
        }

        const exists =
          option.values.some(
            (item) =>
              item.toLowerCase() ===
              cleanValue.toLowerCase()
          );

        if (exists) {
          return option;
        }

        return {
          ...option,
          values: [
            ...option.values,
            cleanValue,
          ],
        };
      })
    );
  };

  // ===================================================
  // REMOVE OPTION VALUE
  // ===================================================

  const removeOptionValue = (
    optionId: string,
    value: string
  ) => {
    setVariationOptions((prev) =>
      prev.map((option) =>
        option.id === optionId
          ? {
              ...option,
              values:
                option.values.filter(
                  (item) =>
                    item !== value
                ),
            }
          : option
      )
    );
  };

  // ===================================================
  // GENERATE VARIANTS
  // ===================================================

  const generateVariants = () => {
    const validOptions =
      variationOptions.filter(
        (option) =>
          option.name.trim() &&
          option.values.length > 0
      );

    if (validOptions.length === 0) {
      setError(
        "Please add at least one variation option and one value."
      );
      return;
    }

    const combinations =
      createCombinations(
        validOptions
      );

    const generated: ProductVariant[] =
      combinations.map(
        (combination, index) => {
          const existing =
            variants.find(
              (variant) =>
                areSameValues(
                  variant.values,
                  combination
                )
            );

          return {
            id:
              existing?.id ||
              `variant-${Date.now()}-${index}`,

            values: combination,

            sku:
              existing?.sku ||
              createVariantSku(
                sku,
                combination
              ),

            price:
              existing?.price ||
              price,

            stock:
              existing?.stock ||
              "",
          };
        }
      );

    setVariants(generated);
    setError("");
  };

  // ===================================================
  // UPDATE VARIANT
  // ===================================================

  const updateVariant = (
    variantId: string,
    field:
      | "sku"
      | "price"
      | "stock",
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              [field]:
                field === "sku"
                  ? value.toUpperCase()
                  : value,
            }
          : variant
      )
    );
  };

  // ===================================================
  // VARIATION TOTAL STOCK
  // ===================================================

  const variationTotalStock =
    useMemo(() => {
      return variants.reduce(
        (total, variant) => {
          const quantity =
            Number(variant.stock);

          return (
            total +
            (Number.isFinite(quantity)
              ? quantity
              : 0)
          );
        },
        0
      );
    }, [variants]);

  // ===================================================
  // VALIDATE
  // ===================================================

  const validateForm = () => {
    if (!productName.trim()) {
      return "Product name is required.";
    }

    if (!category) {
      return "Please select a category.";
    }

    if (!sku.trim()) {
      return "SKU is required.";
    }

    if (!price.trim()) {
      return "Selling price is required.";
    }

    if (Number(price) < 0) {
      return "Selling price cannot be negative.";
    }

    if (
      comparePrice.trim() &&
      Number(comparePrice) < 0
    ) {
      return "Compare-at price cannot be negative.";
    }

    if (
      comparePrice.trim() &&
      Number(comparePrice) < Number(price)
    ) {
      return "Compare-at price should be greater than or equal to selling price.";
    }

    if (hasVariations) {
      if (
        variationOptions.length === 0
      ) {
        return "Please add at least one variation option.";
      }

      const invalidOption =
        variationOptions.find(
          (option) =>
            !option.name.trim() ||
            option.values.length === 0
        );

      if (invalidOption) {
        return `Please complete the "${
          invalidOption.name ||
          "variation"
        }" option.`;
      }

      if (variants.length === 0) {
        return "Please generate product variations.";
      }

      const invalidVariant =
        variants.find(
          (variant) =>
            !variant.sku.trim() ||
            !variant.price.trim() ||
            !variant.stock.trim()
        );

      if (invalidVariant) {
        return "Please enter SKU, price and stock for every variation.";
      }

      const invalidStock =
        variants.some(
          (variant) =>
            Number(variant.stock) < 0
        );

      if (invalidStock) {
        return "Variant stock cannot be negative.";
      }
    } else {
      if (!stock.trim()) {
        return "Stock quantity is required.";
      }

      if (Number(stock) < 0) {
        return "Stock quantity cannot be negative.";
      }
    }

    return "";
  };

  // ===================================================
  // SAVE PRODUCT
  // ===================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (uploading) {
      setError(
        "Please wait until all images finish uploading."
      );
      return;
    }

    const payload = {
      name: productName.trim(),

      categoryId: Number(category),

      sku: sku
        .trim()
        .toUpperCase(),

      description:
        description.trim() || null,

      videoUrl: videoUrl.trim() || null,

      price: Number(price),

      comparePrice:
        comparePrice.trim()
          ? Number(comparePrice)
          : null,

      stock: hasVariations
        ? variationTotalStock
        : Number(stock),
      minOrderQuantity: minOrderQuantity === "" ? null : Number(minOrderQuantity),
      maxOrderQuantity: maxOrderQuantity === "" ? null : Number(maxOrderQuantity),

      status:
        status === "Active"
          ? "active"
          : "draft",

      featured,
      badgeEnabled,
      badgeText,
      badgeTone,

      // Existing images + successfully uploaded image URLs.
      images,

      hasVariations,

      variationOptions:
        hasVariations
          ? variationOptions.map(
              (option) => ({
                name:
                  option.name.trim(),

                values:
                  option.values,
              })
            )
          : [],

      variants:
        hasVariations
          ? variants.map(
              (variant) => ({
                id: isDatabaseId(variant.id)
                  ? Number(variant.id)
                  : undefined,
                sku: variant.sku
                  .trim()
                  .toUpperCase(),

                price:
                  Number(
                    variant.price
                  ),

                stock:
                  Number(
                    variant.stock
                  ),

                values:
                  variant.values,
              })
            )
          : [],
    };

    console.log(
      "PRODUCT PAYLOAD:",
      payload
    );

    try {
      setSaving(true);

      const response = await fetch(
        `/api/products/${productId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify(
            payload
          ),
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
            "Unable to update product."
        );
      }

      setSuccess(
        "Product updated successfully."
      );

      setTimeout(() => {
        router.push(
          "/admin/products"
        );

        router.refresh();
      }, 700);
    } catch (err) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update product."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#eee6e1] border-t-[#b56f6f]" />
          <p className="mt-4 text-sm text-[#958b86]">Loading product...</p>
        </div>
      </div>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <div className="min-h-full">

      {/* ===============================================
          HEADER
      =============================================== */}

      <div className="border-b border-[#eee6e1] bg-white">
        <div className="px-5 py-6 lg:px-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#b56f6f]">
                Catalog
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#292321]">
                Edit Product
              </h1>

              <p className="mt-1 text-sm text-[#8f8580]">
                Update product information, pricing, variations and inventory.
              </p>
            </div>

            <Link
              href="/admin/products"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e5ddd8] bg-white px-4 text-sm font-medium text-[#514945] transition hover:border-[#b56f6f] hover:text-[#b56f6f]"
            >
              <ArrowLeftIcon />
              Back to Products
            </Link>

          </div>

        </div>
      </div>

      {/* ===============================================
          FORM
      =============================================== */}

      <ProductServicePolicy productId={String(params.id)} /><form onSubmit={handleSubmit}>

        <div className="p-5 lg:p-8">

          <div className="mx-auto max-w-7xl">

            {/* ALERT */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                <p className="text-sm text-green-700">
                  {success}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* =========================================
                  LEFT
              ========================================= */}

              <div className="space-y-6 lg:col-span-2">

                {/* =======================================
                    BASIC INFORMATION
                ======================================= */}

                <section className="rounded-xl border border-[#eee6e1] bg-white">

                  <SectionHeader
                    title="Basic Information"
                    description="Enter the basic details of your product."
                  />

                  <div className="space-y-5 p-5">

                    {/* NAME */}

                    <div>
                      <label
                        htmlFor="productName"
                        className="mb-2 block text-xs font-medium text-[#514945]"
                      >
                        Product Name
                        <Required />
                      </label>

                      <input
                        id="productName"
                        type="text"
                        value={productName}
                        onChange={(e) =>
                          setProductName(
                            e.target.value
                          )
                        }
                        placeholder="Enter product name"
                        required
                        className={inputClass}
                      />
                    </div>

                    {/* CATEGORY + SKU */}

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                      <div>
                        <label
                          htmlFor="category"
                          className="mb-2 block text-xs font-medium text-[#514945]"
                        >
                          Category
                          <Required />
                        </label>

                        <select
                          id="category"
                          value={category}
                          onChange={(e) =>
                            setCategory(
                              e.target.value
                            )
                          }
                          required
                          disabled={
                            loadingCategories
                          }
                          className={inputClass}
                        >
                          <option value="">
                            {loadingCategories
                              ? "Loading categories..."
                              : "Select category"}
                          </option>

                          {categories.map(
                            (item) => (
                              <option
                                key={
                                  item.id
                                }
                                value={String(
                                  item.id
                                )}
                              >
                                {item.parentName ? `${item.parentName} / ${item.name}` : item.name}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="sku"
                          className="mb-2 block text-xs font-medium text-[#514945]"
                        >
                          SKU
                          <Required />
                        </label>

                        <input
                          id="sku"
                          type="text"
                          value={sku}
                          onChange={(e) =>
                            setSku(
                              e.target.value.toUpperCase()
                            )
                          }
                          placeholder="e.g. KUR-001"
                          required
                          className={`${inputClass} uppercase`}
                        />
                      </div>

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
                        placeholder="Write a detailed description of the product..."
                        rows={7}
                        className="w-full resize-none rounded-lg border border-[#e5ddd8] bg-white px-4 py-3 text-sm leading-6 text-[#292321] outline-none placeholder:text-[#aaa09a] focus:border-[#b56f6f]"
                      />

                      <p className="mt-2 text-[11px] text-[#aaa09a]">
                        Add fabric, colour, size,
                        care instructions and other
                        useful product information.
                      </p>
                      <div className="mt-5">
                        <label htmlFor="videoUrl" className="mb-2 block text-xs font-medium text-[#514945]">Product video (optional)</label>
                        <input id="videoUrl" type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://youtu.be/... or https://.../video.mp4" className={inputClass} />
                        <p className="mt-2 text-[11px] text-[#aaa09a]">Paste a YouTube, Vimeo, or direct MP4/WebM/OGG link. It will appear on this product and in Watch &amp; Buy.</p>
                      </div>
                    </div>

                  </div>
                </section>

                {/* =======================================
                    PRICING
                ======================================= */}

                <section className="rounded-xl border border-[#eee6e1] bg-white">

                  <SectionHeader
                    title="Pricing"
                    description="Set the selling price and compare-at price."
                  />

                  <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">

                    <PriceInput
                      id="price"
                      label="Selling Price"
                      value={price}
                      onChange={setPrice}
                      required
                    />

                    <PriceInput
                      id="comparePrice"
                      label="Compare-at Price"
                      value={comparePrice}
                      onChange={setComparePrice}
                    />

                  </div>

                </section>

                {/* =======================================
                    VARIATIONS
                ======================================= */}

                <section className="rounded-xl border border-[#eee6e1] bg-white">

                  <SectionHeader
                    title="Product Variations"
                    description="Choose whether this product has size, colour or other variations."
                  />

                  <div className="p-5">

                    {/* SIMPLE / VARIABLE */}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <button
                        type="button"
                        onClick={() => {
                          setHasVariations(false);
                          setVariants([]);
                        }}
                        className={`rounded-xl border p-4 text-left transition ${
                          !hasVariations
                            ? "border-[#b56f6f] bg-[#b56f6f]/5"
                            : "border-[#e5ddd8] hover:border-[#cdbdb6]"
                        }`}
                      >
                        <div className="flex items-start gap-3">

                          <RadioDot
                            active={
                              !hasVariations
                            }
                          />

                          <div>
                            <p className="text-sm font-medium text-[#292321]">
                              Simple Product
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#958b86]">
                              This product does not
                              have size, colour or
                              other variations.
                            </p>
                          </div>

                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setHasVariations(true)
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          hasVariations
                            ? "border-[#b56f6f] bg-[#b56f6f]/5"
                            : "border-[#e5ddd8] hover:border-[#cdbdb6]"
                        }`}
                      >
                        <div className="flex items-start gap-3">

                          <RadioDot
                            active={
                              hasVariations
                            }
                          />

                          <div>
                            <p className="text-sm font-medium text-[#292321]">
                              Product has variations
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#958b86]">
                              Example: Size,
                              Colour or
                              Size + Colour.
                            </p>
                          </div>

                        </div>
                      </button>

                    </div>

                    {/* SIMPLE STOCK */}
                    <div className="mt-5 grid max-w-xl gap-4 sm:grid-cols-2">
                      <label className="text-xs font-medium text-[#514945]">Minimum purchase quantity<input type="number" min="1" max="1000" value={minOrderQuantity} onChange={event => setMinOrderQuantity(event.target.value)} placeholder="Global default" className={`${inputClass} mt-2`} /></label>
                      <label className="text-xs font-medium text-[#514945]">Maximum purchase quantity<input type="number" min="1" max="1000" value={maxOrderQuantity} onChange={event => setMaxOrderQuantity(event.target.value)} placeholder="Global default" className={`${inputClass} mt-2`} /></label>
                      <p className="text-xs text-[#958b86] sm:col-span-2">Leave blank to inherit the store-wide setting.</p>
                    </div>

                    {!hasVariations && (
                      <div className="mt-5 max-w-sm">

                        <label
                          htmlFor="stock"
                          className="mb-2 block text-xs font-medium text-[#514945]"
                        >
                          Stock Quantity · managed in Inventory
                          <Required />
                        </label>

                        <input
                          id="stock"
                          type="number"
                          min="0"
                          value={stock}
                          onChange={(e) =>
                            setStock(
                              e.target.value
                            )
                          }
                          placeholder="0"
                          required
                          readOnly
                          className={`${inputClass} cursor-not-allowed bg-[#f5f2f0] text-[#857974]`}
                        />

                      </div>
                    )}

                    {/* VARIATION BUILDER */}

                    {hasVariations && (
                      <div className="mt-6">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div>
                            <h3 className="text-sm font-semibold text-[#292321]">
                              Variation Options
                            </h3>

                            <p className="mt-1 text-xs text-[#958b86]">
                              Add options such as
                              Size, Color,
                              Fabric or Pattern.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">

                            <SmallButton
                              onClick={() =>
                                addVariationOption(
                                  "Size"
                                )
                              }
                            >
                              + Size
                            </SmallButton>

                            <SmallButton
                              onClick={() =>
                                addVariationOption(
                                  "Color"
                                )
                              }
                            >
                              + Color
                            </SmallButton>

                            <SmallButton
                              onClick={() =>
                                addVariationOption()
                              }
                            >
                              + Custom
                            </SmallButton>

                          </div>

                        </div>

                        {/* OPTIONS */}

                        <div className="mt-5 space-y-4">

                          {variationOptions.length ===
                            0 && (
                            <div className="rounded-xl border border-dashed border-[#d8cfca] bg-[#fcfaf9] px-5 py-8 text-center">

                              <p className="text-sm font-medium text-[#514945]">
                                No variation options added
                              </p>

                              <p className="mt-1 text-xs text-[#958b86]">
                                Add Size, Color or
                                another option above.
                              </p>

                            </div>
                          )}

                          {variationOptions.map(
                            (
                              option,
                              index
                            ) => (
                              <VariationOptionCard
                                key={
                                  option.id
                                }
                                option={
                                  option
                                }
                                index={
                                  index
                                }
                                onNameChange={
                                  updateOptionName
                                }
                                onAddValue={
                                  addOptionValue
                                }
                                onRemoveValue={
                                  removeOptionValue
                                }
                                onRemove={
                                  removeVariationOption
                                }
                              />
                            )
                          )}

                        </div>

                        {/* GENERATE */}

                        {variationOptions.length >
                          0 && (
                          <div className="mt-5 flex flex-col gap-3 rounded-xl bg-[#faf8f6] p-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                              <p className="text-xs font-medium text-[#514945]">
                                Generate Variations
                              </p>

                              <p className="mt-1 text-[11px] text-[#958b86]">
                                This will create every
                                possible combination.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={
                                generateVariants
                              }
                              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#292321] px-4 text-xs font-medium text-white transition hover:bg-[#403936]"
                            >
                              Generate Variations
                            </button>

                          </div>
                        )}

                        {/* VARIANT TABLE */}

                        {variants.length >
                          0 && (
                          <div className="mt-6">

                            <div className="mb-3 flex items-center justify-between">

                              <div>
                                <h3 className="text-sm font-semibold text-[#292321]">
                                  Product Variations
                                </h3>

                                <p className="mt-1 text-xs text-[#958b86]">
                                  {
                                    variants.length
                                  }{" "}
                                  combinations generated
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wide text-[#aaa09a]">
                                  Total Stock
                                </p>

                                <p className="text-sm font-semibold text-[#292321]">
                                  {
                                    variationTotalStock
                                  }
                                </p>
                              </div>

                            </div>

                            <div className="overflow-x-auto rounded-xl border border-[#e5ddd8]">

                              <table className="w-full min-w-[850px]">

                                <thead>
                                  <tr className="border-b border-[#e5ddd8] bg-[#fcfaf9]">

                                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#958b86]">
                                      Variation
                                    </th>

                                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#958b86]">
                                      SKU
                                    </th>

                                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#958b86]">
                                      Price
                                    </th>

                                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#958b86]">
                                      Stock
                                    </th>

                                  </tr>
                                </thead>

                                <tbody className="divide-y divide-[#eee6e1]">

                                  {variants.map(
                                    (
                                      variant
                                    ) => (
                                      <tr
                                        key={
                                          variant.id
                                        }
                                      >

                                        <td className="px-4 py-4">
                                          <div className="flex flex-wrap gap-2">

                                            {Object.entries(
                                              variant.values
                                            ).map(
                                              ([
                                                key,
                                                value,
                                              ]) => (
                                                <span
                                                  key={`${variant.id}-${key}`}
                                                  className="rounded-md bg-[#f5efec] px-2.5 py-1 text-xs text-[#514945]"
                                                >
                                                  <span className="font-medium">
                                                    {key}:
                                                  </span>{" "}
                                                  {
                                                    value
                                                  }
                                                </span>
                                              )
                                            )}

                                          </div>
                                        </td>

                                        <td className="px-4 py-4">

                                          <input
                                            type="text"
                                            value={
                                              variant.sku
                                            }
                                            onChange={(
                                              e
                                            ) =>
                                              updateVariant(
                                                variant.id,
                                                "sku",
                                                e.target.value
                                              )
                                            }
                                            className="h-9 w-40 rounded-lg border border-[#e5ddd8] px-3 text-xs uppercase outline-none focus:border-[#b56f6f]"
                                          />

                                        </td>

                                        <td className="px-4 py-4">

                                          <div className="relative w-32">

                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#958b86]">
                                              ₹
                                            </span>

                                            <input
                                              type="number"
                                              min="0"
                                              value={
                                                variant.price
                                              }
                                              onChange={(
                                                e
                                              ) =>
                                                updateVariant(
                                                  variant.id,
                                                  "price",
                                                  e.target.value
                                                )
                                              }
                                              className="h-9 w-full rounded-lg border border-[#e5ddd8] pl-7 pr-2 text-xs outline-none focus:border-[#b56f6f]"
                                            />

                                          </div>

                                        </td>

                                        <td className="px-4 py-4">

                                          <input
                                            type="number"
                                            min="0"
                                            value={
                                              variant.stock
                                            }
                                            readOnly
                                            placeholder="0"
                                            className="h-9 w-28 cursor-not-allowed rounded-lg border border-[#e5ddd8] bg-[#f5f2f0] px-3 text-xs text-[#857974] outline-none"
                                          />

                                        </td>

                                      </tr>
                                    )
                                  )}

                                </tbody>

                              </table>

                            </div>

                          </div>
                        )}

                      </div>
                    )}

                  </div>
                </section>

                {/* =======================================
                    IMAGES
                ======================================= */}

                <section className="rounded-xl border border-[#eee6e1] bg-white">

                  <SectionHeader
                    title="Product Images"
                    description="Upload up to 6 product images."
                  />

                  <div className="p-5">

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                      {images.map(
                        (
                          image,
                          index
                        ) => (
                          <div
                            key={`${image}-${index}`}
                            className="group relative aspect-square overflow-hidden rounded-xl border border-[#e5ddd8] bg-[#faf8f6]"
                          >

                            <img
                              src={image}
                              alt={`Product image ${
                                index + 1
                              }`}
                              className="h-full w-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeImage(
                                  index
                                )
                              }
                              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-sm"
                              aria-label="Remove image"
                            >
                              <XIcon />
                            </button>

                            {index ===
                              0 && (
                              <span className="absolute bottom-2 left-2 rounded-full bg-[#292321]/90 px-2.5 py-1 text-[10px] font-medium text-white">
                                Main Image
                              </span>
                            )}

                          </div>
                        )
                      )}

                      {images.length <
                        6 && (
                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d8cfca] bg-[#fcfaf9] transition hover:border-[#b56f6f] hover:bg-[#faf5f3]">

                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
                            <UploadIcon />
                          </div>

                          <span className="mt-3 text-xs font-medium text-[#514945]">
                            Upload Image
                          </span>

                          <span className="mt-1 text-[10px] text-[#aaa09a]">
                            JPG, PNG or WEBP
                          </span>

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={
                              handleImageUpload
                            }
                            className="hidden"
                          />

                        </label>
                      )}

                    </div>

                    <p className="mt-3 text-[11px] text-[#aaa09a]">
                      Images are uploaded to the product
                      storage API. Please wait for uploads
                      to finish before updating the product.
                    </p>

                  </div>
                </section>

              </div>

              {/* =========================================
                  RIGHT
              ========================================= */}

              <div className="space-y-6">

                {/* STATUS */}

                <section className="rounded-xl border border-[#eee6e1] bg-white">

                  <SectionHeader
                    title="Product Status"
                  />

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
                            e.target.value as ProductStatus
                          )
                        }
                        className={inputClass}
                      >
                        <option value="Active">
                          Active
                        </option>

                        <option value="Draft">
                          Draft
                        </option>
                      </select>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#eee6e1] p-3">

                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) =>
                          setFeatured(
                            e.target.checked
                          )
                        }
                        className="mt-0.5 h-4 w-4 accent-[#b56f6f]"
                      />

                      <span>
                        <span className="block text-xs font-medium text-[#514945]">
                          Featured Product
                        </span>

                        <span className="mt-1 block text-[11px] leading-4 text-[#aaa09a]">
                          Show this product in
                          featured sections.
                        </span>
                      </span>

                    </label>

                    <div className="rounded-lg border border-[#eee6e1] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-[#514945]">Storefront badge</p>
                          <p className="mt-1 text-[11px] leading-4 text-[#aaa09a]">A controlled label shown on product cards. It is independent from size, fit and other product options.</p>
                        </div>
                        <input type="checkbox" checked={badgeEnabled} onChange={(e) => setBadgeEnabled(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#b56f6f]" aria-label="Enable storefront badge" />
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <input value={badgeText} maxLength={32} disabled={!badgeEnabled} onChange={(e) => setBadgeText(e.target.value)} placeholder="e.g. Best seller" className={inputClass} />
                        <select value={badgeTone} disabled={!badgeEnabled} onChange={(e) => setBadgeTone(e.target.value)} className={inputClass}>
                          <option value="dark">Signature dark</option>
                          <option value="new">New arrival</option>
                          <option value="sale">Offer</option>
                          <option value="popular">Popular</option>
                          <option value="neutral">Neutral</option>
                        </select>
                      </div>
                      {badgeEnabled && badgeText.trim() && <span className={`mt-3 inline-flex rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${badgeTone === "new" ? "bg-violet-600 text-white" : badgeTone === "sale" ? "bg-orange-500 text-white" : badgeTone === "popular" ? "bg-rose-500 text-white" : badgeTone === "neutral" ? "bg-slate-200 text-slate-700" : "bg-[#292321] text-white"}`}>{badgeText}</span>}
                    </div>

                  </div>
                </section>

                {/* INVENTORY */}

                <section className="rounded-xl border border-[#eee6e1] bg-white">

                  <SectionHeader
                    title="Inventory"
                  />

                  <div className="p-5">

                    <div className="rounded-lg bg-[#faf8f6] p-4">

                      <p className="text-[10px] uppercase tracking-wide text-[#aaa09a]">
                        {hasVariations
                          ? "Total Variant Stock"
                          : "Stock Quantity"}
                      </p>

                      <p className="mt-1 text-2xl font-semibold text-[#292321]">
                        {hasVariations
                          ? variationTotalStock
                          : stock || "0"}
                      </p>

                      <p className="mt-1 text-[11px] text-[#958b86]">
                        {hasVariations
                          ? "Calculated from all product variations."
                          : "Product-level inventory."}
                      </p>

                    </div>

                  </div>
                </section>

                {/* PUBLISHING */}

                <section className="rounded-xl border border-[#eee6e1] bg-white">

                  <SectionHeader
                    title="Publishing"
                  />

                  <div className="p-5">

                    <div className="rounded-lg bg-[#faf8f6] p-4">

                      <div className="flex gap-3">

                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
                          <InfoIcon />
                        </div>

                        <div>
                          <p className="text-xs font-medium text-[#514945]">
                            Product visibility
                          </p>

                          <p className="mt-1 text-[11px] leading-5 text-[#958b86]">
                            Active products can be
                            displayed on your online
                            store.
                          </p>
                        </div>

                      </div>

                    </div>

                  </div>
                </section>

                {/* ACTIONS */}

                <div className="rounded-xl border border-[#eee6e1] bg-white p-5">

                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#292321] px-5 text-sm font-medium text-white transition hover:bg-[#403936] disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {saving ? (
                      <>
                        <Spinner />
                        Updating...
                      </>
                    ) : (
                      <>
                        <SaveIcon />
                        Update Product
                      </>
                    )}

                  </button>

                  <Link
                    href="/admin/products"
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

// =====================================================
// VARIATION OPTION CARD
// =====================================================

function VariationOptionCard({
  option,
  index,
  onNameChange,
  onAddValue,
  onRemoveValue,
  onRemove,
}: {
  option: VariationOption;
  index: number;
  onNameChange: (
    id: string,
    name: string
  ) => void;
  onAddValue: (
    id: string,
    value: string
  ) => void;
  onRemoveValue: (
    id: string,
    value: string
  ) => void;
  onRemove: (
    id: string
  ) => void;
}) {
  const [value, setValue] =
    useState("");

  const handleAdd = () => {
    const cleanValue =
      value.trim();

    if (!cleanValue) return;

    onAddValue(
      option.id,
      cleanValue
    );

    setValue("");
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="rounded-xl border border-[#e5ddd8] bg-white p-4">

      <div className="flex flex-col gap-4">

        {/* HEADER */}

        <div className="flex items-start gap-3">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#b56f6f]/10 text-xs font-semibold text-[#b56f6f]">
            {index + 1}
          </div>

          <div className="min-w-0 flex-1">

            <label className="mb-2 block text-[11px] font-medium uppercase tracking-wide text-[#958b86]">
              Option Name
            </label>

            <input
              type="text"
              value={option.name}
              onChange={(e) =>
                onNameChange(
                  option.id,
                  e.target.value
                )
              }
              placeholder="e.g. Size"
              className={inputClass}
            />

          </div>

          <button
            type="button"
            onClick={() =>
              onRemove(
                option.id
              )
            }
            className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50"
            aria-label="Remove variation"
          >
            <TrashIcon />
          </button>

        </div>

        {/* VALUES */}

        <div>

          <label className="mb-2 block text-[11px] font-medium uppercase tracking-wide text-[#958b86]">
            Values
          </label>

          <div className="flex flex-wrap gap-2">

            {option.values.map(
              (item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e5ddd8] bg-[#faf8f6] px-3 py-1.5 text-xs text-[#514945]"
                >
                  {item}

                  <button
                    type="button"
                    onClick={() =>
                      onRemoveValue(
                        option.id,
                        item
                      )
                    }
                    className="text-[#aaa09a] hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              )
            )}

          </div>

          <div className="mt-3 flex gap-2">

            <input
              type="text"
              value={value}
              onChange={(e) =>
                setValue(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder={
                option.name
                  ? `Add ${option.name.toLowerCase()} value`
                  : "Add value"
              }
              className="h-10 min-w-0 flex-1 rounded-lg border border-[#e5ddd8] px-3 text-xs outline-none focus:border-[#b56f6f]"
            />

            <button
              type="button"
              onClick={handleAdd}
              className="h-10 rounded-lg border border-[#e5ddd8] px-4 text-xs font-medium text-[#514945] transition hover:border-[#b56f6f] hover:text-[#b56f6f]"
            >
              Add
            </button>

          </div>

          <p className="mt-2 text-[10px] text-[#aaa09a]">
            Press Enter to add a value.
          </p>

        </div>

      </div>

    </div>
  );
}

// =====================================================
// SECTION HEADER
// =====================================================

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-[#eee6e1] px-5 py-4">

      <h2 className="text-sm font-semibold text-[#292321]">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-xs text-[#958b86]">
          {description}
        </p>
      )}

    </div>
  );
}

// =====================================================
// PRICE INPUT
// =====================================================

function PriceInput({
  id,
  label,
  value,
  onChange,
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  required?: boolean;
}) {
  return (
    <div>

      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium text-[#514945]"
      >
        {label}

        {required && (
          <Required />
        )}
      </label>

      <div className="relative">

        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#958b86]">
          ₹
        </span>

        <input
          id={id}
          type="number"
          min="0"
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          placeholder="0"
          required={required}
          className="h-11 w-full rounded-lg border border-[#e5ddd8] bg-white pl-9 pr-4 text-sm text-[#292321] outline-none placeholder:text-[#aaa09a] focus:border-[#b56f6f]"
        />

      </div>

      {!required && (
        <p className="mt-2 text-[11px] text-[#aaa09a]">
          Optional.
        </p>
      )}

    </div>
  );
}

// =====================================================
// RADIO DOT
// =====================================================

function RadioDot({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
        active
          ? "border-[#b56f6f]"
          : "border-[#d8cfca]"
      }`}
    >
      {active && (
        <span className="h-2.5 w-2.5 rounded-full bg-[#b56f6f]" />
      )}
    </span>
  );
}

// =====================================================
// SMALL BUTTON
// =====================================================

function SmallButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center rounded-lg border border-[#e5ddd8] bg-white px-3 text-xs font-medium text-[#514945] transition hover:border-[#b56f6f] hover:text-[#b56f6f]"
    >
      {children}
    </button>
  );
}

// =====================================================
// REQUIRED
// =====================================================

function Required() {
  return (
    <span className="ml-1 text-red-500">
      *
    </span>
  );
}

// =====================================================
// INPUT CLASS
// =====================================================

const inputClass =
  "h-11 w-full rounded-lg border border-[#e5ddd8] bg-white px-4 text-sm text-[#292321] outline-none placeholder:text-[#aaa09a] focus:border-[#b56f6f]";

// =====================================================
// CREATE COMBINATIONS
// =====================================================

function createCombinations(
  options: VariationOption[]
): Record<string, string>[] {
  if (options.length === 0) {
    return [];
  }

  let combinations:
    Record<string, string>[] = [
      {},
    ];

  for (const option of options) {
    const next:
      Record<string, string>[] = [];

    for (const combination of combinations) {
      for (const value of option.values) {
        next.push({
          ...combination,
          [option.name.trim()]:
            value,
        });
      }
    }

    combinations = next;
  }

  return combinations;
}

// =====================================================
// SAME VALUES
// =====================================================

function areSameValues(
  first: Record<string, string>,
  second: Record<string, string>
) {
  const firstKeys =
    Object.keys(first);

  const secondKeys =
    Object.keys(second);

  if (
    firstKeys.length !==
    secondKeys.length
  ) {
    return false;
  }

  return firstKeys.every(
    (key) =>
      first[key] ===
      second[key]
  );
}

// =====================================================
// CREATE VARIANT SKU
// =====================================================

function createVariantSku(
  baseSku: string,
  values: Record<string, string>
) {
  const suffix =
    Object.values(values)
      .map((value) =>
        value
          .replace(
            /[^a-zA-Z0-9]/g,
            ""
          )
          .substring(0, 4)
          .toUpperCase()
      )
      .filter(Boolean)
      .join("-");

  const cleanBase =
    baseSku
      .trim()
      .toUpperCase();

  return suffix
    ? `${cleanBase}-${suffix}`
    : cleanBase;
}

// =====================================================
// DATABASE ID CHECK
// =====================================================

function isDatabaseId(value: string) {
  return /^\d+$/.test(value);
}

// =====================================================
// CREATE ID
// =====================================================

function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}

// =====================================================
// SPINNER
// =====================================================

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

// =====================================================
// ICONS
// =====================================================

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
      width="19"
      height="19"
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
      width="15"
      height="15"
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

function InfoIcon() {
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
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

