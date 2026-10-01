import { PrismaClient } from "@/lib/generated/prisma-suppliers";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion: string | undefined;
};

// Bump this when Prisma's generated data model changes. During `next dev`, the
// global singleton can otherwise keep a client generated from an older schema.
const PRISMA_SCHEMA_VERSION = "product-badges-v9-suppliers";

const prisma =
  globalForPrisma.prismaSchemaVersion === PRISMA_SCHEMA_VERSION
    ? globalForPrisma.prisma!
    :
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
}

export default prisma;
