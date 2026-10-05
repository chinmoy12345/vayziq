import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "../lib/generated/prisma-suppliers";

loadEnvConfig(process.cwd());
const db = new PrismaClient();

async function main() {
  const products = await db.product.findMany({
    where: { status: "active" },
    select: { id: true, name: true, badgeEnabled: true, badgeText: true, badgeTone: true,
      options: { include: { values: true } } },
  });
  const changes = products.flatMap(product => {
    // Preserve intentional merchandising labels. Replace only placeholders or empty badges.
    const current = product.badgeText?.trim() ?? "";
    if (current && !/^(test\d*|demo|sample|placeholder)$/i.test(current)) return [];
    const fit = product.options.filter(option => /^(fit|fitting)$/i.test(option.name))
      .flatMap(option => option.values.map(value => value.value)).join(" ");
    const source = `${fit} ${product.name}`;
    const label = /\boversized\b/i.test(source) ? "Oversized Fit"
      : /\bloose[ -]fit\b/i.test(source) ? "Loose Fit"
      : /\brelaxed[ -]fit\b/i.test(source) ? "Relaxed Fit"
      : /\bregular[ -]fit\b/i.test(source) ? "Regular Fit" : null;
    if (!label && !current) return [];
    return [{ id: product.id, name: product.name, previous: current,
      badgeText: label, badgeEnabled: Boolean(label), badgeTone: "dark" }];
  });
  console.log(JSON.stringify({ mode: process.argv.includes("--apply") ? "apply" : "preview", changes }, null, 2));
  if (process.argv.includes("--apply")) {
    await db.$transaction(changes.map(({ id, badgeText, badgeEnabled, badgeTone }) =>
      db.product.update({ where: { id }, data: { badgeText, badgeEnabled, badgeTone } })));
  }
}
main().finally(() => db.$disconnect()).catch(error => { console.error(error.message); process.exitCode = 1; });
