import prisma from "@/lib/db";
export type CartInput = { id: unknown; quantity: unknown; variantId?: unknown; size?: unknown; color?: unknown };
export async function resolveCart(items: CartInput[]) {
  if (!Array.isArray(items) || !items.length || items.length > 100 || items.some(item => !item || !Number.isSafeInteger(Number(item.id)) || !Number.isSafeInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 1000)) throw new Error("Invalid cart items or quantities.");
  const ids = [...new Set(items.map(item=>Number(item.id)))];
  const products = await prisma.product.findMany({ where: { id: { in: ids }, status: "active", category: { status: "active" } }, include: { variants: { include: { variantValues: { include: { optionValue: { include: { option: true } } } } } } } });
  const lines = items.map(item => {
    const product = products.find(product=>product.id===Number(item.id)); if(!product)throw new Error("A product is no longer available.");
    const size = typeof item.size === "string" ? item.size : "", color = typeof item.color === "string" ? item.color : "";
    const matches = product.variants.filter(variant=>item.variantId ? variant.id === Number(item.variantId) : variant.variantValues.every(({optionValue:v}) => v.option.name.toLowerCase() === "size" ? v.value === size : ["color","colour"].includes(v.option.name.toLowerCase()) ? v.value === color : true));
    const variant = product.variants.length ? matches.length === 1 ? matches[0] : null : null;
    if (product.variants.length && !variant) throw new Error("Please reselect the product options and add this item again.");
    if (item.variantId && !variant) throw new Error("This variant is no longer available.");
    return { product, variantId: variant?.id, price: Number(variant?.price ?? product.price), sku: variant?.sku ?? product.sku, quantity: Number(item.quantity), options: { size, color, ...(variant ? { variantId: variant.id } : {}) } };
  });
  for(const product of products) {
    if(lines.filter(line=>line.product.id===product.id).reduce((sum,line)=>sum+line.quantity,0)>product.stock)throw new Error("One or more products do not have enough stock.");
    for(const variant of product.variants) if(lines.filter(line=>line.variantId===variant.id).reduce((sum,line)=>sum+line.quantity,0)>variant.stock)throw new Error("A selected variant does not have enough stock.");
  }
  return lines;
}
