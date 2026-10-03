import type { OfferRules } from "@/lib/product-offers";
export function couponInput(body: Record<string, unknown>) {
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const type = body.type;
  const value = ["buy_get", "quantity_price", "quantity_discount"].includes(String(type)) ? 0 : Number(body.value);
  const optionalNumber = (key: string) => body[key] === null || body[key] === "" || body[key] === undefined ? null : Number(body[key]);
  const minimumOrder = optionalNumber("minimumOrder"), maximumDiscount = optionalNumber("maximumDiscount"), usageLimit = optionalNumber("usageLimit");
  function date(key: string) {
    const raw = body[key];
    if (!raw) return null;
    if (typeof raw !== "string") throw new Error("Invalid date.");
    // Date-only admin inputs cover a full calendar day in India.
    const value = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw + (key === "expiresAt" ? "T23:59:59.999+05:30" : "T00:00:00+05:30") : raw);
    if (!Number.isFinite(value.getTime())) throw new Error("Invalid date.");
    return value;
  }
  const startsAt = date("startsAt"), expiresAt = date("expiresAt");
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) throw new Error("Use 3–40 letters, numbers, hyphens or underscores for the code.");
  if (!["fixed", "percentage", "buy_get", "quantity_price", "quantity_discount"].includes(String(type)) || !Number.isFinite(value) || value < 0 || (["fixed", "percentage"].includes(String(type)) && value === 0) || value > 1000000 || (type === "percentage" && value > 100)) throw new Error("Enter a valid discount; percentages must be between 0 and 100.");
  if ([minimumOrder, maximumDiscount].some(value => value !== null && (!Number.isFinite(value) || value < 0 || value > 1000000)) || maximumDiscount === 0) throw new Error("Enter valid minimum spend and discount cap amounts.");
  if (usageLimit !== null && (!Number.isSafeInteger(usageLimit) || usageLimit < 1)) throw new Error("Usage limit must be a positive whole number, or leave it blank.");
  if (startsAt && expiresAt && startsAt >= expiresAt) throw new Error("Expiry must be after the start date.");
  if (typeof body.active !== "boolean") throw new Error("Select an active status.");
  const raw = body.rules && typeof body.rules === "object" && !Array.isArray(body.rules) ? body.rules as Record<string, unknown> : {};
  if (raw.productIds !== undefined && (!Array.isArray(raw.productIds) || raw.productIds.length > 1000 || raw.productIds.some(id => !Number.isSafeInteger(id) || Number(id) < 1))) throw new Error("Select valid eligible products.");
  const rules: OfferRules = { productIds: [...new Set((raw.productIds ?? []) as number[])] };
  rules.heading = typeof raw.heading === "string" ? raw.heading.trim().slice(0, 100) : "";
  rules.bannerImage = typeof raw.bannerImage === "string" ? raw.bannerImage.trim().slice(0, 2000) : "";
  if (rules.bannerImage && !/^(\/[^/]|https:\/\/)/.test(rules.bannerImage)) throw new Error("Use a site image path or HTTPS banner URL.");
  rules.showOnCards = raw.showOnCards !== false;
  rules.priority = Number(raw.priority ?? 0);
  if (!Number.isSafeInteger(rules.priority) || rules.priority < 0 || rules.priority > 100) throw new Error("Priority must be between 0 and 100.");
  if (type === "buy_get") {
    const buy = Number(raw.buyQuantity), get = Number(raw.getQuantity);
    if (![buy, get].every(value => Number.isSafeInteger(value) && value >= 1 && value <= 100)) throw new Error("Buy and free quantities must be whole numbers from 1 to 100.");
    rules.buyQuantity = buy; rules.getQuantity = get;
    rules.mode = raw.mode === undefined ? (rules.productIds.length ? "selected" : "same_price") : raw.mode as "same_price" | "selected";
    if (!["same_price", "selected"].includes(rules.mode)) throw new Error("Choose a valid Buy/Get mode.");
    if (rules.mode === "same_price") { rules.productIds = []; rules.freeRule = "cheapest"; }
    else {
      if (!rules.productIds.length) throw new Error("Select eligible products for this Buy/Get offer.");
      rules.freeRule = (raw.freeRule ?? "cheapest") as "cheapest" | "specific";
      if (!["cheapest", "specific"].includes(rules.freeRule)) throw new Error("Choose how free products are calculated.");
      if (rules.freeRule === "specific") {
        if (!Array.isArray(raw.freeProductIds) || !raw.freeProductIds.length || raw.freeProductIds.some(id => !rules.productIds.includes(Number(id)))) throw new Error("Choose free products from the eligible products.");
        rules.freeProductIds = [...new Set(raw.freeProductIds.map(Number))];
        if (rules.freeProductIds.length >= rules.productIds.length) throw new Error("Include at least one paid product as well as the free products.");
      }
    }
  }
  if (type === "quantity_price" || type === "quantity_discount") {
    if (!Array.isArray(raw.tiers) || !raw.tiers.length || raw.tiers.length > 20) throw new Error("Add between 1 and 20 quantity tiers.");
    rules.tiers = raw.tiers.map(tier => {
      if (!tier || typeof tier !== "object") throw new Error("Invalid quantity tier.");
      const quantity = Number(tier.quantity), price = Number(tier.price);
      if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1000 || !Number.isFinite(price) || price <= 0 || price > 1000000) throw new Error("Each tier needs a whole quantity and a positive price.");
      return { quantity, price: Math.round(price * 100) / 100 };
    }).sort((a,b) => a.quantity - b.quantity);
    if (new Set(rules.tiers.map(tier => tier.quantity)).size !== rules.tiers.length) throw new Error("Each tier must have a different quantity.");
    if (type === "quantity_price" && !["unit", "bundle"].includes(String(raw.priceMode))) throw new Error("Select per-item or bundle pricing.");
    if (type === "quantity_price") rules.priceMode = raw.priceMode as "unit" | "bundle";
  }
  return { rules, code, type: String(type), value, minimumOrder, maximumDiscount: maximumDiscount, usageLimit, startsAt, expiresAt, active: body.active, description: typeof body.description === "string" ? body.description.trim().slice(0, 500) : null };
}
