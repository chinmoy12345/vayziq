export type ColorProduct = { options?: { name: string; values: { value: string }[] }[]; variants?: { variantValues: { optionValue: { value: string; option: { name: string } } }[] }[] };
export function productColors(product: ColorProduct) {
  const values = new Map<string, string>();
  const add = (name: string, value: string) => { if (["color", "colour"].includes(name.trim().toLowerCase()) && value.trim()) values.set(value.trim().toLowerCase(), value.trim()); };
  product.options?.forEach(option => option.values.forEach(value => add(option.name, value.value)));
  product.variants?.forEach(variant => variant.variantValues.forEach(({ optionValue }) => add(optionValue.option.name, optionValue.value)));
  return [...values.values()];
}
