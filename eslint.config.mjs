import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    // Admin previews accept freshly uploaded blob/data URLs and arbitrary merchant
    // image URLs, so they intentionally bypass the storefront image optimizer.
    files: ["app/admin/**/*.{ts,tsx}", "components/admin/**/*.{ts,tsx}"],
    rules: { "@next/next/no-img-element": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma output is generated vendor code.
    "lib/generated/**",
  ]),
]);

export default eslintConfig;
