
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";
import { parseProductVideoUrl } from "@/lib/product-video";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// =====================================================
// TYPES
// =====================================================

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type VariationOptionInput = {
  name: string;
  values: string[];
};

type VariantInput = {
  id?: number;
  sku: string;
  price: number;
  stock: number;
  values: Record<string, string>;
};

// =====================================================
// HELPERS
// =====================================================

function asInputRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? value as Record<string, unknown>
    : {};
}

function normalizeVariantValues(value: unknown): Record<string, string> {
  return Object.fromEntries(
    Object.entries(asInputRecord(value)).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    )
  );
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseId(value: string) {
  const id = Number(value);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  return id;
}

function normalizeOptionName(
  value: unknown
) {
  return String(value ?? "")
    .trim();
}

function normalizeOptionValue(
  value: unknown
) {
  return String(value ?? "")
    .trim();
}

function normalizeSku(
  value: unknown
) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function isValidNumber(
  value: unknown
) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value))
  );
}

// =====================================================
// GET PRODUCT
// =====================================================

export async function GET(
  request: NextRequest,
  context: RouteContext
) {

  try {
    const { id } =
      await context.params;

    const productId =
      parseId(id);

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid product ID.",
        },
        { status: 400 }
      );
    }

    const product =
      await prisma.product.findUnique(
        {
          where: {
            id: productId,
          },

          include: {
            category: true,

            images: {
              orderBy: {
                sortOrder: "asc",
              },
            },

            options: {
              orderBy: {
                sortOrder: "asc",
              },

              include: {
                values: {
                  orderBy: {
                    sortOrder: "asc",
                  },
                },
              },
            },

            variants: {
              orderBy: {
                id: "asc",
              },

              include: {
                variantValues: {
                  include: {
                    optionValue: {
                      include: {
                        option: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }
      );

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product not found.",
        },
        { status: 404 }
      );
    }

    if (product.status !== "active" || product.category.status !== "active") {
      if (!(await requireAdminPermission("products", "view"))) {
        return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
      }
    }

    // =================================================
    // FORMAT OPTIONS
    // =================================================

    const variationOptions =
      product.options.map(
        (option) => ({
          id: option.id,

          name: option.name,

          values:
            option.values.map(
              (value) =>
                value.value
            ),
        })
      );

    // =================================================
    // FORMAT VARIANTS
    // =================================================

    const variants =
      product.variants.map(
        (variant) => {
          const values: Record<
            string,
            string
          > = {};

          for (const item of
            variant.variantValues) {
            const option =
              item.optionValue.option;

            values[option.name] =
              item.optionValue.value;
          }

          return {
            id: variant.id,

            sku: variant.sku,

            price:
              variant.price.toString(),

            stock:
              variant.stock,

            values,
          };
        }
      );

    // =================================================
    // RESPONSE
    // =================================================

    return NextResponse.json({
      success: true,

      product: {
        id: product.id,

        name: product.name,

        slug: product.slug,

        categoryId:
          product.categoryId,

        category:
          product.category,

        sku: product.sku,

        description:
          product.description ?? "",

        videoUrl:
          product.videoUrl ?? "",

        price:
          product.price.toString(),

        comparePrice:
          product.comparePrice
            ? product.comparePrice.toString()
            : "",

        stock:
          product.stock,

        status:
          product.status,

        featured:
          product.featured,

        badgeEnabled: product.badgeEnabled,
        badgeText: product.badgeText ?? "",
        badgeTone: product.badgeTone,

        hasVariations:
          product.hasVariations,

        images:
          product.images,

        variationOptions,

        variants,
      },
    });
  } catch (error) {
    console.error(
      "GET PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load product.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT PRODUCT
// =====================================================

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  if (!(await requireAdminPermission("products","update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });

  try {
    const { id } =
      await context.params;

    const productId =
      parseId(id);

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid product ID.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // READ BODY
    // =================================================

    const body =
      await request.json();

    const {
      name,
      categoryId,
      sku,
      description,
      videoUrl,
      price,
      comparePrice,
      stock,
      status,
      featured,
      badgeEnabled,
      badgeText,
      badgeTone,
      images = [],
      hasVariations = false,
      variationOptions = [],
      variants = [],
    } = body;

    const videoInput = String(videoUrl ?? "").trim();
    const productVideo = videoInput ? parseProductVideoUrl(videoInput) : null;
    if (videoInput && !productVideo) return NextResponse.json({ success: false, message: "Use a YouTube, Vimeo, or direct MP4/WebM/OGG video URL." }, { status: 400 });
    const normalizedBadgeText = String(badgeText ?? "").trim().slice(0, 32);
    const allowedBadgeTones = ["dark", "new", "sale", "popular", "neutral"];
    const normalizedBadgeTone = allowedBadgeTones.includes(String(badgeTone)) ? String(badgeTone) : "dark";
    if (badgeEnabled && !normalizedBadgeText) return NextResponse.json({ success: false, message: "Enter badge text before enabling the product badge." }, { status: 400 });

    // =================================================
    // BASIC VALIDATION
    // =================================================

    const productName =
      String(name ?? "").trim();

    const productSku =
      normalizeSku(sku);

    const categoryIdNumber =
      Number(categoryId);

    const priceNumber =
      Number(price);

    const stockNumber =
      Number(stock ?? 0);

    if (!productName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product name is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(
        categoryIdNumber
      ) ||
      categoryIdNumber <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid category is required.",
        },
        { status: 400 }
      );
    }

    if (!productSku) {
      return NextResponse.json(
        {
          success: false,
          message:
            "SKU is required.",
        },
        { status: 400 }
      );
    }

    if (
      !isValidNumber(price) ||
      priceNumber < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid product price is required.",
        },
        { status: 400 }
      );
    }

    if (
      !hasVariations &&
      (!Number.isFinite(
        stockNumber
      ) ||
        stockNumber < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid stock quantity is required.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CATEGORY CHECK
    // =================================================

    const category =
      await prisma.category.findUnique(
        {
          where: {
            id: categoryIdNumber,
          },
          select: {
            id: true,
            name: true,
          },
        }
      );

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected category does not exist.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // EXISTING PRODUCT
    // =================================================

    const existingProduct =
      await prisma.product.findUnique(
        {
          where: {
            id: productId,
          },

          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            stock: true,
            hasVariations: true,
            variants: { select: { id: true, sku: true, stock: true, reorderLevel: true } },
          },
        }
      );

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product not found.",
        },
        { status: 404 }
      );
    }

    // =================================================
    // SKU DUPLICATE CHECK
    // =================================================

    const skuExists =
      await prisma.product.findFirst(
        {
          where: {
            sku: productSku,

            NOT: {
              id: productId,
            },
          },

          select: {
            id: true,
          },
        }
      );

    if (skuExists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product SKU already exists.",
        },
        { status: 409 }
      );
    }

    // =================================================
    // SLUG
    //
    // Keep existing slug when name
    // has not changed.
    // =================================================

    let finalSlug =
      existingProduct.slug;

    if (
      productName !==
      existingProduct.name
    ) {
      const baseSlug =
        createSlug(
          productName
        );

      finalSlug =
        baseSlug ||
        `product-${productId}`;

      const slugExists =
        await prisma.product.findFirst(
          {
            where: {
              slug: finalSlug,

              NOT: {
                id: productId,
              },
            },

            select: {
              id: true,
            },
          }
        );

      if (slugExists) {
        finalSlug =
          `${finalSlug}-${productId}`;
      }
    }

    // =================================================
    // NORMALIZE VARIATION OPTIONS
    // =================================================

    const normalizedOptions:
      VariationOptionInput[] =
      Array.isArray(
        variationOptions
      )
        ? variationOptions
            .map(
              (
                rawOption: unknown
              ) => {
                const option = asInputRecord(rawOption);
                const optionName =
                  normalizeOptionName(
                    option?.name
                  );

                const values =
                  Array.isArray(
                    option?.values
                  )
                    ? option.values
                        .map(
                          (
                            value: unknown
                          ) =>
                            normalizeOptionValue(
                              value
                            )
                        )
                        .filter(
                          Boolean
                        )
                    : [];

                return {
                    name:
                      optionName,
                    values,
                  };
              }
            )
            .filter(
              (option) =>
                option.name &&
                option.values.length >
                  0
            )
        : [];

    // =================================================
    // VALIDATE DUPLICATE OPTION NAMES
    // =================================================

    const optionNames =
      normalizedOptions.map(
        (option) =>
          option.name.toLowerCase()
      );

    const duplicateOption =
      optionNames.find(
        (name, index) =>
          optionNames.indexOf(
            name
          ) !== index
      );

    if (duplicateOption) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Duplicate variation option: ${duplicateOption}`,
        },
        { status: 400 }
      );
    }

    // =================================================
    // NORMALIZE VARIANTS
    // =================================================

    const normalizedVariants:
      VariantInput[] =
      Array.isArray(variants)
        ? variants.map((rawVariant: unknown) => {
            const variant = asInputRecord(rawVariant);
            return {
              id: isDatabaseId(variant.id) ? Number(variant.id) : undefined,
              sku: normalizeSku(variant.sku),
              price: Number(variant.price),
              stock: Number(variant.stock),
              values: normalizeVariantValues(variant.values),
            };
          })
        : [];

    // =================================================
    // VALIDATE VARIANTS
    // =================================================

    if (
      hasVariations &&
      normalizedOptions.length ===
        0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one variation option is required.",
        },
        { status: 400 }
      );
    }

    if (
      hasVariations &&
      normalizedVariants.length ===
        0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one product variant is required.",
        },
        { status: 400 }
      );
    }

    if (hasVariations) {
      for (const variant of
        normalizedVariants) {
        if (!variant.sku) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Every variant requires an SKU.",
            },
            { status: 400 }
          );
        }

        if (
          !Number.isFinite(
            variant.price
          ) ||
          variant.price < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                `Invalid price for variant ${variant.sku}.`,
            },
            { status: 400 }
          );
        }

        if (
          !Number.isFinite(
            variant.stock
          ) ||
          variant.stock < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                `Invalid stock for variant ${variant.sku}.`,
            },
            { status: 400 }
          );
        }

        for (const option of
          normalizedOptions) {
          const selectedValue =
            variant.values[
              option.name
            ];

          if (
            !selectedValue ||
            !option.values.includes(
              selectedValue
            )
          ) {
            return NextResponse.json(
              {
                success: false,
                message:
                  `Variant ${variant.sku} has an invalid value for ${option.name}.`,
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // =================================================
    // DUPLICATE VARIANT SKU
    // =================================================

    const variantSkuSet =
      new Set<string>();

    for (const variant of
      normalizedVariants) {
      if (
        variantSkuSet.has(
          variant.sku
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Duplicate variant SKU: ${variant.sku}`,
          },
          { status: 400 }
        );
      }

      variantSkuSet.add(
        variant.sku
      );
    }

    // =================================================
    // CHECK VARIANT SKU AGAINST
    // OTHER PRODUCTS
    // =================================================

    if (hasVariations) {
      const variantSkus =
        normalizedVariants.map(
          (variant) =>
            variant.sku
        );

      const existingVariant =
        await prisma.productVariant.findFirst(
          {
            where: {
              sku: {
                in: variantSkus,
              },

              productId: {
                not: productId,
              },
            },

            select: {
              id: true,
              sku: true,
            },
          }
        );

      if (existingVariant) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Variant SKU already exists: ${existingVariant.sku}`,
          },
          { status: 409 }
        );
      }
    }

    // =================================================
    // TOTAL STOCK
    // =================================================

    const existingVariantsBySku = new Map(existingProduct.variants.map(variant => [variant.sku, variant]));
    const submittedVariantSkus = new Set(normalizedVariants.map(variant => variant.sku));
    if (existingProduct.hasVariations && !hasVariations && existingProduct.stock > 0) {
      return NextResponse.json({ success: false, message: "Adjust all variant stock to zero in Inventory Management before removing product variations." }, { status: 409 });
    }
    if (!existingProduct.hasVariations && hasVariations && existingProduct.stock > 0) {
      return NextResponse.json({ success: false, message: "Adjust product stock to zero in Inventory Management before adding variations." }, { status: 409 });
    }
    if (existingProduct.hasVariations && hasVariations && existingProduct.variants.some(variant => variant.stock > 0 && !submittedVariantSkus.has(variant.sku))) {
      return NextResponse.json({ success: false, message: "Adjust removed variant stock to zero in Inventory Management before saving product variations." }, { status: 409 });
    }
    const inventoryManagedVariants = normalizedVariants.map(variant => ({
      ...variant,
      stock: existingProduct.hasVariations ? existingVariantsBySku.get(variant.sku)?.stock ?? 0 : 0,
      reorderLevel: existingVariantsBySku.get(variant.sku)?.reorderLevel ?? 5,
    }));
    const finalStock = hasVariations
      ? inventoryManagedVariants.reduce((total, variant) => total + variant.stock, 0)
      : existingProduct.hasVariations ? 0 : existingProduct.stock;

    // =================================================
    // TRANSACTION
    // =================================================

    await prisma.$transaction(
      async (tx) => {
        // =============================================
        // UPDATE PRODUCT
        // =============================================

        await tx.product.update(
          {
            where: {
              id: productId,
            },

            data: {
              name:
                productName,

              slug:
                finalSlug,

              sku:
                productSku,

              description:
                String(
                  description ??
                    ""
                ).trim() ||
                null,

              videoUrl: productVideo?.sourceUrl ?? null,

              price:
                priceNumber,

              comparePrice:
                comparePrice !==
                  null &&
                comparePrice !==
                  undefined &&
                comparePrice !==
                  ""
                  ? Number(
                      comparePrice
                    )
                  : null,

              stock:
                finalStock,

              status:
                status ===
                "active"
                  ? "active"
                  : "draft",

              featured:
                Boolean(
                  featured
                ),

              badgeEnabled: Boolean(badgeEnabled),
              badgeText: normalizedBadgeText || null,
              badgeTone: normalizedBadgeTone,

              hasVariations:
                Boolean(
                  hasVariations
                ),

              categoryId:
                categoryIdNumber,
            },
          }
        );

        // =============================================
        // DELETE OLD VARIATION DATA
        //
        // Cascade will remove:
        // ProductVariantValue
        // ProductOptionValue
        // ProductOption
        // ProductVariant
        // =============================================

        await tx.productVariant.deleteMany(
          {
            where: {
              productId,
            },
          }
        );

        await tx.productOption.deleteMany(
          {
            where: {
              productId,
            },
          }
        );

        // =============================================
        // RECREATE OPTIONS
        // =============================================

        if (
          hasVariations &&
          normalizedOptions.length >
            0
        ) {
          for (
            let optionIndex = 0;
            optionIndex <
            normalizedOptions.length;
            optionIndex++
          ) {
            const optionData =
              normalizedOptions[
                optionIndex
              ];

            const createdOption =
              await tx.productOption.create(
                {
                  data: {
                    productId,

                    name:
                      optionData.name,

                    sortOrder:
                      optionIndex,
                  },
                }
              );

            // =========================================
            // OPTION VALUES
            // =========================================

            for (
              let valueIndex = 0;
              valueIndex <
              optionData.values
                .length;
              valueIndex++
            ) {
              await tx.productOptionValue.create(
                {
                  data: {
                    optionId:
                      createdOption.id,

                    value:
                      optionData
                        .values[
                        valueIndex
                      ],

                    sortOrder:
                      valueIndex,
                  },
                }
              );
            }
          }
        }

        // =============================================
        // CREATE VARIANTS
        // =============================================

        if (
          hasVariations &&
          normalizedVariants.length >
            0
        ) {
          // -------------------------------------------
          // Load newly created options
          // -------------------------------------------

          const createdOptions =
            await tx.productOption.findMany(
              {
                where: {
                  productId,
                },

                include: {
                  values: true,
                },

                orderBy: {
                  sortOrder: "asc",
                },
              }
            );

          // -------------------------------------------
          // Create each variant
          // -------------------------------------------

          for (const variantData of
            inventoryManagedVariants) {
            const createdVariant =
              await tx.productVariant.create(
                {
                  data: {
                    productId,

                    sku:
                      variantData.sku,

                    price:
                      variantData.price,

                    stock:
                      variantData.stock,
                    reorderLevel: variantData.reorderLevel,
                  },
                }
              );

            // -----------------------------------------
            // Create VariantValue records
            // -----------------------------------------

            for (const option of
              createdOptions) {
              const selectedValue =
                variantData.values[
                  option.name
                ];

              if (
                !selectedValue
              ) {
                continue;
              }

              const optionValue =
                option.values.find(
                  (value) =>
                    value.value ===
                    selectedValue
                );

              if (
                !optionValue
              ) {
                throw new Error(
                  `Option value not found: ${option.name} = ${selectedValue}`
                );
              }

              await tx.productVariantValue.create(
                {
                  data: {
                    variantId:
                      createdVariant.id,

                    optionValueId:
                      optionValue.id,
                  },
                }
              );
            }
          }
        }
      }
    );

    // =================================================
    // IMAGES
    //
    // Existing image records are intentionally
    // not recreated from blob URLs.
    //
    // If images contains real URLs, sync them.
    // =================================================

    if (
      Array.isArray(images)
    ) {
      const validImages =
        images
          .map((rawImage: unknown) => {
            const image = asInputRecord(rawImage);
            return typeof rawImage ===
            "string"
              ? rawImage.trim()
              : typeof image?.image ===
                  "string"
                ? image.image.trim()
                : typeof image?.url ===
                    "string"
                  ? image.url.trim()
                  : "";
          })
          .filter(
            (image: string) =>
              image &&
              !image.startsWith(
                "blob:"
              )
          )
          .slice(0, 6);

      if (
        validImages.length >
        0
      ) {
        await prisma.$transaction(
          async (tx) => {
            await tx.productImage.deleteMany(
              {
                where: {
                  productId,
                },
              }
            );

            await tx.productImage.createMany(
              {
                data:
                  validImages.map(
                    (
                      image,
                      index
                    ) => ({
                      productId,

                      image,

                      sortOrder:
                        index,
                    })
                  ),
              }
            );
          }
        );
      }
    }

    // =================================================
    // FETCH UPDATED PRODUCT
    // =================================================

    const updatedProduct =
      await prisma.product.findUnique(
        {
          where: {
            id: productId,
          },

          include: {
            category: true,

            images: {
              orderBy: {
                sortOrder: "asc",
              },
            },

            options: {
              orderBy: {
                sortOrder: "asc",
              },

              include: {
                values: {
                  orderBy: {
                    sortOrder: "asc",
                  },
                },
              },
            },

            variants: {
              orderBy: {
                id: "asc",
              },

              include: {
                variantValues: {
                  include: {
                    optionValue: {
                      include: {
                        option: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }
      );

    if (!updatedProduct) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product was updated but could not be loaded.",
        },
        { status: 500 }
      );
    }

    // =================================================
    // FORMAT UPDATED PRODUCT
    // =================================================

    const formattedOptions =
      updatedProduct.options.map(
        (option) => ({
          id: option.id,

          name: option.name,

          values:
            option.values.map(
              (value) =>
                value.value
            ),
        })
      );

    const formattedVariants =
      updatedProduct.variants.map(
        (variant) => {
          const values: Record<
            string,
            string
          > = {};

          for (const item of
            variant.variantValues) {
            values[
              item.optionValue
                .option.name
            ] =
              item.optionValue.value;
          }

          return {
            id: variant.id,

            sku: variant.sku,

            price:
              variant.price.toString(),

            stock:
              variant.stock,

            values,
          };
        }
      );

    // =================================================
    // RESPONSE
    // =================================================

    return NextResponse.json({
      success: true,

      message:
        "Product updated successfully.",

      product: {
        id:
          updatedProduct.id,

        name:
          updatedProduct.name,

        slug:
          updatedProduct.slug,

        categoryId:
          updatedProduct.categoryId,

        category:
          updatedProduct.category,

        sku:
          updatedProduct.sku,

        description:
          updatedProduct.description ??
          "",

        price:
          updatedProduct.price.toString(),

        comparePrice:
          updatedProduct.comparePrice
            ? updatedProduct.comparePrice.toString()
            : "",

        stock:
          updatedProduct.stock,

        status:
          updatedProduct.status,

        featured:
          updatedProduct.featured,

        hasVariations:
          updatedProduct.hasVariations,

        images:
          updatedProduct.images,

        variationOptions:
          formattedOptions,

        variants:
          formattedVariants,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update product.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DATABASE ID CHECK
// =====================================================

function isDatabaseId(
  value: unknown
) {
  return (
    typeof value ===
      "number" ||
    (typeof value ===
      "string" &&
      /^\d+$/.test(value))
  );
}

