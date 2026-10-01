import { requireAdminPermission } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { parseProductVideoUrl } from "@/lib/product-video";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const canViewAll = await requireAdminPermission("products", "view");
    const products = await prisma.product.findMany({
      where: canViewAll ? undefined : { status: "active", category: { status: "active" } },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  const actor = await requireAdminPermission("products", "create");
  if (!actor) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const policy = { returnEnabled: body.returnEnabled ?? true, replacementEnabled: body.replacementEnabled ?? true, returnDays: body.returnDays ?? 7, replacementDays: body.replacementDays ?? 7 };
    if (typeof policy.returnEnabled !== "boolean" || typeof policy.replacementEnabled !== "boolean" || [policy.returnDays, policy.replacementDays].some(days => !Number.isInteger(days) || days < 1 || days > 365)) return NextResponse.json({ message: "Enter valid return and replacement windows (1–365 days)." }, { status: 400 });

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
    // =====================================================
    // VALIDATION
    // =====================================================

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required.",
        },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required.",
        },
        { status: 400 }
      );
    }

    if (!sku?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "SKU is required.",
        },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || Number(price) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid price is required.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // NORMALIZE
    // =====================================================

    const productSku = sku.trim().toUpperCase();

    const productSlug = createSlug(name);

    const categoryIdNumber = Number(categoryId);

    if (!Number.isInteger(categoryIdNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // CHECK CATEGORY
    // =====================================================

    const category = await prisma.category.findUnique({
      where: {
        id: categoryIdNumber,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // CHECK SKU
    // =====================================================

    const existingSku = await prisma.product.findUnique({
      where: {
        sku: productSku,
      },
    });

    if (existingSku) {
      return NextResponse.json(
        {
          success: false,
          message: "Product SKU already exists.",
        },
        { status: 409 }
      );
    }

    // =====================================================
    // UNIQUE SLUG
    // =====================================================

    let finalSlug = productSlug;

    const existingSlug = await prisma.product.findUnique({
      where: {
        slug: finalSlug,
      },
    });

    if (existingSlug) {
      finalSlug = `${productSlug}-${Date.now()}`;
    }

    // =====================================================
    // CREATE PRODUCT
    // =====================================================

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name: name.trim(),

          slug: finalSlug,

          sku: productSku,

          description:
            description?.trim() || null,

          videoUrl: productVideo?.sourceUrl ?? null,

          price: Number(price),

          comparePrice:
            comparePrice !== null &&
            comparePrice !== undefined &&
            comparePrice !== ""
              ? Number(comparePrice)
              : null,

          stock: Number(stock || 0),

          status:
            status === "active"
              ? "active"
              : "draft",

          featured: Boolean(featured),
          badgeEnabled: Boolean(badgeEnabled),
          badgeText: normalizedBadgeText || null,
          badgeTone: normalizedBadgeTone,
          ...policy,

          hasVariations:
            Boolean(hasVariations),

          categoryId: categoryIdNumber,
        },
      });

      if (!hasVariations && newProduct.stock > 0) {
        await tx.inventoryMovement.create({ data: {
          productId: newProduct.id, productName: newProduct.name, sku: newProduct.sku,
          delta: newProduct.stock, previousStock: 0, newStock: newProduct.stock,
          reason: "opening", note: "Initial product stock", actorId: Number(actor.sub),
        } });
      }

      // ===================================================
      // PRODUCT IMAGES
      // ===================================================

      if (Array.isArray(images) && images.length > 0) {
        const validImages = images.filter(
          (image: unknown): image is string =>
            typeof image === "string" &&
            image.trim().length > 0 &&
            !image.startsWith("blob:")
        );

        if (validImages.length > 0) {
          await tx.productImage.createMany({
            data: validImages.map(
              (image, index) => ({
                productId: newProduct.id,
                image: image.trim(),
                sortOrder: index,
              })
            ),
          });
        }
      }

      // ===================================================
      // VARIATIONS
      // ===================================================

      if (
        hasVariations &&
        Array.isArray(variationOptions) &&
        variationOptions.length > 0
      ) {
        // Map:
        // "Size" -> ProductOption
        // "Color" -> ProductOption

        const optionMap = new Map<
          string,
          number
        >();

        // ===============================================
        // CREATE OPTIONS + VALUES
        // ===============================================

        for (
          let optionIndex = 0;
          optionIndex < variationOptions.length;
          optionIndex++
        ) {
          const optionData =
            variationOptions[optionIndex];

          const optionName =
            optionData?.name?.trim();

          if (!optionName) {
            continue;
          }

          const option =
            await tx.productOption.create({
              data: {
                productId: newProduct.id,
                name: optionName,
                sortOrder: optionIndex,
              },
            });

          optionMap.set(
            optionName,
            option.id
          );

          const values =
            Array.isArray(optionData.values)
              ? optionData.values
              : [];

          if (values.length > 0) {
            await tx.productOptionValue.createMany(
              {
                data: values.map(
                  (
                    value: string,
                    valueIndex: number
                  ) => ({
                    optionId: option.id,
                    value: value.trim(),
                    sortOrder: valueIndex,
                  })
                ),
              }
            );
          }
        }

        // ===============================================
        // GET OPTION VALUES
        // ===============================================

        const optionValues =
          await tx.productOptionValue.findMany({
            where: {
              optionId: {
                in: Array.from(
                  optionMap.values()
                ),
              },
            },
            include: {
              option: true,
            },
          });

        // Map:
        // Size:M -> optionValueId

        const optionValueMap = new Map<
          string,
          number
        >();

        for (const optionValue of optionValues) {
          const key =
            `${optionValue.option.name}:${optionValue.value}`;

          optionValueMap.set(
            key,
            optionValue.id
          );
        }

        // ===============================================
        // CREATE VARIANTS
        // ===============================================

        if (
          Array.isArray(variants) &&
          variants.length > 0
        ) {
          for (
            const variantData of variants
          ) {
            if (
              !variantData?.sku ||
              variantData.price === undefined
            ) {
              continue;
            }

            const variant =
              await tx.productVariant.create({
                data: {
                  productId:
                    newProduct.id,

                  sku: variantData.sku
                    .trim()
                    .toUpperCase(),

                  price:
                    Number(
                      variantData.price
                    ),

                  stock:
                    Number(
                      variantData.stock || 0
                    ),
                },
              });

            // =========================================
            // VARIANT VALUES
            // =========================================

            const variantValues =
              variantData.values || {};

            const variantValueRows: {
              variantId: number;
              optionValueId: number;
            }[] = [];

            for (
              const [
                optionName,
                value,
              ] of Object.entries(
                variantValues
              )
            ) {
              const key =
                `${optionName}:${value}`;

              const optionValueId =
                optionValueMap.get(key);

              if (optionValueId) {
                variantValueRows.push({
                  variantId: variant.id,
                  optionValueId,
                });
              }
            }

            if (
              variantValueRows.length > 0
            ) {
              await tx.productVariantValue.createMany(
                {
                  data: variantValueRows,
                }
              );
            }

            if (variant.stock > 0) {
              const values = Object.entries(variantValues as Record<string, unknown>).map(([name, value]) => `${name}: ${String(value)}`).join(" · ");
              await tx.inventoryMovement.create({ data: {
                productId: newProduct.id, variantId: variant.id, productName: newProduct.name,
                sku: variant.sku, variantLabel: values || null, delta: variant.stock,
                previousStock: 0, newStock: variant.stock, reason: "opening",
                note: "Initial variant stock", actorId: Number(actor.sub),
              } });
            }
          }
        }
      }

      return newProduct;
    });

    // =====================================================
    // RETURN COMPLETE PRODUCT
    // =====================================================

    const result =
      await prisma.product.findUnique({
        where: {
          id: product.id,
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
      });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    // Prisma unique constraint
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message:
            "SKU, slug or another unique value already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          (error instanceof Error ? error.message : "") ||
          "Failed to create product.",
      },
      { status: 500 }
    );
  }
}


// =====================================================
// SLUG
// =====================================================

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
