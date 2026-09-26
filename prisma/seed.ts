import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();




async function main() {
  console.log("🌱 Starting database seed...");

  // =====================================================
  // PASSWORDS
  // =====================================================

  const adminPassword = await bcrypt.hash(
    "Admin@123456",
    12
  );

  const customerPassword = await bcrypt.hash(
    "Customer@123456",
    12
  );

  // =====================================================
  // PERMISSIONS
  // =====================================================

  const permissions = [
    // Admin
    {
      module: "admin",
      action: "access",
      name: "Access Admin Panel",
    },

    // Dashboard
    {
      module: "dashboard",
      action: "view",
      name: "View Dashboard",
    },

    // Products
    {
      module: "products",
      action: "view",
      name: "View Products",
    },
    {
      module: "products",
      action: "create",
      name: "Create Products",
    },
    {
      module: "products",
      action: "update",
      name: "Update Products",
    },
    {
      module: "products",
      action: "delete",
      name: "Delete Products",
    },

    // Categories
    {
      module: "categories",
      action: "view",
      name: "View Categories",
    },
    {
      module: "categories",
      action: "create",
      name: "Create Categories",
    },
    {
      module: "categories",
      action: "update",
      name: "Update Categories",
    },
    {
      module: "categories",
      action: "delete",
      name: "Delete Categories",
    },

    // Orders
    {
      module: "orders",
      action: "view",
      name: "View Orders",
    },
    {
      module: "orders",
      action: "update",
      name: "Update Orders",
    },
    {
      module: "orders",
      action: "cancel",
      name: "Cancel Orders",
    },

    // Customers
    {
      module: "customers",
      action: "view",
      name: "View Customers",
    },
    {
      module: "customers",
      action: "update",
      name: "Update Customers",
    },

    // Inventory
    {
      module: "inventory",
      action: "view",
      name: "View Inventory",
    },
    {
      module: "inventory",
      action: "update",
      name: "Adjust Inventory",
    },

    // Suppliers and purchasing
    { module: "suppliers", action: "view", name: "View suppliers and purchases" },
    { module: "suppliers", action: "create", name: "Add suppliers" },
    { module: "suppliers", action: "update", name: "Manage suppliers and payments" },
    { module: "suppliers", action: "delete", name: "Archive suppliers" },

    // Coupons
    {
      module: "coupons",
      action: "view",
      name: "View Coupons",
    },
    {
      module: "coupons",
      action: "create",
      name: "Create Coupons",
    },
    {
      module: "coupons",
      action: "update",
      name: "Update Coupons",
    },
    {
      module: "coupons",
      action: "delete",
      name: "Delete Coupons",
    },

    // Banners
    {
      module: "banners",
      action: "view",
      name: "View Banners",
    },
    {
      module: "banners",
      action: "create",
      name: "Create Banners",
    },
    {
      module: "banners",
      action: "update",
      name: "Update Banners",
    },
    {
      module: "banners",
      action: "delete",
      name: "Delete Banners",
    },

    // Reviews
    {
      module: "reviews",
      action: "view",
      name: "View Reviews",
    },
    {
      module: "reviews",
      action: "update",
      name: "Update Reviews",
    },
    {
      module: "reviews",
      action: "delete",
      name: "Delete Reviews",
    },

    // Settings
    {
      module: "settings",
      action: "view",
      name: "View Settings",
    },
    {
      module: "settings",
      action: "update",
      name: "Update Settings",
    },

    // Roles
    {
      module: "roles",
      action: "view",
      name: "View Roles",
    },
    {
      module: "roles",
      action: "create",
      name: "Create Roles",
    },
    {
      module: "roles",
      action: "update",
      name: "Update Roles",
    },
    {
      module: "roles",
      action: "delete",
      name: "Delete Roles",
    },

    // Permissions
    {
      module: "permissions",
      action: "view",
      name: "View Permissions",
    },
    {
      module: "permissions",
      action: "manage",
      name: "Manage Permissions",
    },
  ];

  // =====================================================
  // CREATE PERMISSIONS
  // =====================================================

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        module_action: {
          module: permission.module,
          action: permission.action,
        },
      },
      update: {
        name: permission.name,
      },
      create: {
        module: permission.module,
        action: permission.action,
        name: permission.name,
      },
    });
  }

  console.log(
    `✅ Permissions created: ${permissions.length}`
  );

  // =====================================================
  // CREATE ROLES
  // =====================================================

  const superAdminRole = await prisma.role.upsert({
    where: {
      slug: "super-admin",
    },
    update: {
      name: "Super Admin",
      description:
        "Full access to the entire administration system",
    },
    create: {
      name: "Super Admin",
      slug: "super-admin",
      description:
        "Full access to the entire administration system",
    },
  });

  const storeManagerRole = await prisma.role.upsert({
    where: {
      slug: "store-manager",
    },
    update: {
      name: "Store Manager",
      description:
        "Manage store operations",
    },
    create: {
      name: "Store Manager",
      slug: "store-manager",
      description:
        "Manage store operations",
    },
  });

  const productManagerRole = await prisma.role.upsert({
    where: {
      slug: "product-manager",
    },
    update: {
      name: "Product Manager",
      description:
        "Manage products and categories",
    },
    create: {
      name: "Product Manager",
      slug: "product-manager",
      description:
        "Manage products and categories",
    },
  });

  const orderManagerRole = await prisma.role.upsert({
    where: {
      slug: "order-manager",
    },
    update: {
      name: "Order Manager",
      description:
        "Manage customer orders",
    },
    create: {
      name: "Order Manager",
      slug: "order-manager",
      description:
        "Manage customer orders",
    },
  });

  const customerSupportRole =
    await prisma.role.upsert({
      where: {
        slug: "customer-support",
      },
      update: {
        name: "Customer Support",
        description:
          "Handle customers and orders",
      },
      create: {
        name: "Customer Support",
        slug: "customer-support",
        description:
          "Handle customers and orders",
      },
    });

  console.log("✅ Roles created");

  // =====================================================
  // ASSIGN PERMISSIONS TO ROLE
  // =====================================================

  async function assignPermissions(
    roleId: number,
    permissionKeys: string[]
  ) {
    for (const key of permissionKeys) {
      const [module, action] = key.split(".");

      const permission =
        await prisma.permission.findUnique({
          where: {
            module_action: {
              module,
              action,
            },
          },
        });

      if (!permission) {
        console.log(
          `⚠️ Permission not found: ${key}`
        );
        continue;
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId: permission.id,
        },
      });
    }
  }

  // =====================================================
  // SUPER ADMIN → ALL PERMISSIONS
  // =====================================================

  await assignPermissions(
    superAdminRole.id,
    permissions.map(
      (permission) =>
        `${permission.module}.${permission.action}`
    )
  );

  // =====================================================
  // STORE MANAGER
  // =====================================================

  await assignPermissions(
    storeManagerRole.id,
    [
      "admin.access",
      "dashboard.view",

      "products.view",
      "products.create",
      "products.update",
      "products.delete",

      "inventory.view",
      "inventory.update",

      "suppliers.view",
      "suppliers.create",
      "suppliers.update",

      "categories.view",
      "categories.create",
      "categories.update",
      "categories.delete",

      "orders.view",
      "orders.update",
      "orders.cancel",

      "customers.view",
      "customers.update",

      "coupons.view",
      "coupons.create",
      "coupons.update",
      "coupons.delete",

      "banners.view",
      "banners.create",
      "banners.update",
      "banners.delete",

      "reviews.view",
      "reviews.update",
    ]
  );

  // =====================================================
  // PRODUCT MANAGER
  // =====================================================

  await assignPermissions(
    productManagerRole.id,
    [
      "admin.access",
      "dashboard.view",

      "products.view",
      "products.create",
      "products.update",
      "products.delete",

      "inventory.view",
      "inventory.update",

      "suppliers.view",

      "categories.view",
      "categories.create",
      "categories.update",
      "categories.delete",
    ]
  );

  // =====================================================
  // ORDER MANAGER
  // =====================================================

  await assignPermissions(
    orderManagerRole.id,
    [
      "admin.access",
      "dashboard.view",

      "orders.view",
      "orders.update",
      "orders.cancel",

      "customers.view",
      "customers.update",
    ]
  );

  // =====================================================
  // CUSTOMER SUPPORT
  // =====================================================

  await assignPermissions(
    customerSupportRole.id,
    [
      "admin.access",
      "dashboard.view",

      "orders.view",
      "orders.update",

      "customers.view",
      "customers.update",

      "reviews.view",
      "reviews.update",
    ]
  );

  console.log("✅ Role permissions assigned");

  // =====================================================
  // SUPER ADMIN USER
  // =====================================================

  const superAdmin = await prisma.user.upsert({
    where: {
      email:
        "superadmin@thesusmitacollection.com",
    },
    update: {
      name: "Super Admin",
      passwordHash: adminPassword,
      status: "active",
    },
    create: {
      name: "Super Admin",
      email:
        "superadmin@thesusmitacollection.com",
      mobile: "9000000001",
      passwordHash: adminPassword,
      status: "active",
    },
  });

  // =====================================================
  // STORE MANAGER USER
  // =====================================================

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@thesusmitacollection.com",
    },
    update: {
      name: "Store Manager",
      passwordHash: adminPassword,
      status: "active",
    },
    create: {
      name: "Store Manager",
      email: "admin@thesusmitacollection.com",
      mobile: "9000000002",
      passwordHash: adminPassword,
      status: "active",
    },
  });

  // =====================================================
  // CUSTOMER USER
  // =====================================================

  const customer = await prisma.user.upsert({
    where: {
      email: "customer@example.com",
    },
    update: {
      name: "Test Customer",
      passwordHash: customerPassword,
      status: "active",
    },
    create: {
      name: "Test Customer",
      email: "customer@example.com",
      mobile: "9000000003",
      passwordHash: customerPassword,
      status: "active",
    },
  });

  console.log("✅ Users created");

  // =====================================================
  // ASSIGN SUPER ADMIN ROLE
  // =====================================================

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: superAdminRole.id,
    },
  });

  // =====================================================
  // ASSIGN STORE MANAGER ROLE
  // =====================================================

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: storeManagerRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: storeManagerRole.id,
    },
  });

  console.log("✅ User roles assigned");

  // =====================================================
  // STOREFRONT CATALOGUE — 60 PRODUCTS WITH LOCAL IMAGES
  // =====================================================

  const categoryData = [
    { name: "Sarees", slug: "sarees", description: "Elegant sarees for every occasion" },
    { name: "Kurtis", slug: "kurtis", description: "Comfortable everyday and festive kurtis" },
    { name: "Nightwear", slug: "nightwear", description: "Soft and stylish nightwear" },
  ];
  const categoryMap = new Map<string, number>();
  for (const category of categoryData) {
    const saved = await prisma.category.upsert({ where: { slug: category.slug }, update: category, create: category });
    categoryMap.set(category.slug, saved.id);
  }

  const productImages = [
    "/uploads/products/1789553695307-8170fcd6-5ebb-4e54-a417-71c74ecee8be.png",
    "/uploads/products/1789553697590-fb46cab7-4c31-4376-ad26-64b0ce6b998d.png",
    "/uploads/products/1789553700107-dcdd4114-4e90-4487-be64-9466ffaccccb.png",
    "/uploads/products/1789553703631-962774a3-cff9-4ee0-92c4-57861050f168.png",
    "/uploads/products/1789553945063-b241e92d-3f7d-4208-a7c5-c1c985490d86.png",
    "/uploads/products/1789553947876-7f829732-9cda-48a7-8b97-82d13d0cf7cc.png",
    "/uploads/products/1789553949856-12a78d81-9012-4b27-8e76-a2c478dd29e8.png",
    "/uploads/products/1789554505310-1a663a2e-7330-4dcd-a265-84ead5a439d1.png",
    "/uploads/products/1789554688828-a1248817-b41e-4439-9926-1706bace4561.png",
    "/uploads/products/1789554695648-93b997b6-ecc5-49c4-a73f-75834b261421.png",
    "/uploads/products/1789554700957-e008ee0b-6a8f-4e38-a15b-2b8d209c59f8.png",
    "/uploads/products/1789554762297-e628d6ca-49ed-4af1-8c65-1d9b253e5d8b.png",
    "/uploads/products/1789630697024-229536d6-ff21-46a2-a7e6-d3c157f967a3.png",
  ];
  const catalogue = [
    ...["Bengal Cotton", "Floral Mulmul", "Handloom Jamdani", "Soft Silk", "Linen Border", "Kalamkari Print", "Banarasi Weave", "Chanderi Gold", "Tussar Elegance", "Ikat Heritage", "Organza Blossom", "Temple Border", "Cotton Slub", "Kota Doria", "Maheshwari Grace", "Paithani Inspired", "Ajrakh Print", "Sambalpuri Weave", "Mangalagiri Cotton", "Festive Zari"].map((name) => ({ name: `${name} Saree`, category: "sarees", price: 899 })),
    ...["Indigo Block Print", "Rosewood A-Line", "Mustard Mirror Work", "Teal Straight Fit", "Ivory Embroidered", "Wine Rayon", "Peach Floral", "Olive Handblock", "Maroon Festive", "Sky Blue Cotton", "Black Ikat", "Lavender Anarkali", "Coral Comfort", "Mint Chikankari", "Saffron Yoke", "Navy Printed", "Beige Office Wear", "Pink Gota Patti", "Rust Everyday", "White Summer"].map((name) => ({ name: `${name} Kurti`, category: "kurtis", price: 699 })),
    ...["Pink Floral", "Blue Cloud", "Lavender Dream", "Rose Stripe", "Mint Garden", "Peach Comfort", "Navy Star", "Cotton Daisy", "Berry Soft", "Ivory Lounge", "Sage Leaf", "Coral Sleep", "Plum Satin", "Powder Blue", "Lilac Bloom", "Warm Beige", "Teal Cozy", "Red Heart", "Grey Moon", "Butter Yellow"].map((name) => ({ name: `${name} Night Suit`, category: "nightwear", price: 799 })),
  ];
  for (const [index, item] of catalogue.entries()) {
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const sku = `SC-${item.category.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(3, "0")}`;
    const product = await prisma.product.upsert({ where: { slug }, update: { status: "active", stock: 12 + (index % 18), price: item.price + (index % 5) * 100 }, create: { name: item.name, slug, sku, description: `Premium ${item.name} from Susmita's Collection.`, price: item.price + (index % 5) * 100, comparePrice: item.price + 400 + (index % 5) * 100, stock: 12 + (index % 18), status: "active", featured: index < 12, categoryId: categoryMap.get(item.category)! } });
    const existingImage = await prisma.productImage.findFirst({ where: { productId: product.id, sortOrder: 0 } });
    if (existingImage) await prisma.productImage.update({ where: { id: existingImage.id }, data: { image: productImages[index % productImages.length] } });
    else await prisma.productImage.create({ data: { productId: product.id, image: productImages[index % productImages.length], sortOrder: 0 } });
  }
  console.log("✅ 60 storefront products created");

  // =====================================================
  // SUMMARY
  // =====================================================

  console.log("");
  console.log("==========================================");
  console.log("🌱 DATABASE SEED COMPLETED");
  console.log("==========================================");

  console.log("");
  console.log("SUPER ADMIN");
  console.log(
    "Email: superadmin@thesusmitacollection.com"
  );
  console.log("Password: Admin@123456");

  console.log("");
  console.log("STORE MANAGER");
  console.log(
    "Email: admin@thesusmitacollection.com"
  );
  console.log("Password: Admin@123456");

  console.log("");
  console.log("CUSTOMER");
  console.log("Email: customer@example.com");
  console.log("Password: Customer@123456");

  console.log("");
  console.log("==========================================");
}

main()
  .catch((error) => {
    console.error("❌ SEED ERROR:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
