export type CategorySizeGuide = {
  enabled: boolean;
  unit: "in" | "cm";
  measurementType: "body" | "garment";
  columns: string[];
  rows: { size: string; values: string[] }[];
  notes: string;
};

export const sizeGuideKey = (id: number) => `category_size_guide_${id}`;

export function emptySizeGuide(): CategorySizeGuide {
  return { enabled: false, unit: "in", measurementType: "body", columns: ["Chest / Bust", "Waist", "Hip"], rows: ["S", "M", "L", "XL", "XXL"].map(size => ({ size, values: ["", "", ""] })), notes: "" };
}

export function parseSizeGuide(input: unknown): CategorySizeGuide | null {
  if (!input || typeof input !== "object") return null;
  const guide = input as Record<string, unknown>;
  if (typeof guide.enabled !== "boolean" || !["in", "cm"].includes(String(guide.unit)) || !["body", "garment"].includes(String(guide.measurementType)) || typeof guide.notes !== "string" || guide.notes.length > 1200) return null;
  if (!Array.isArray(guide.columns) || guide.columns.length < 1 || guide.columns.length > 8 || !guide.columns.every(column => typeof column === "string" && column.trim() && column.length <= 40)) return null;
  const columns = (guide.columns as string[]).map(column => column.trim());
  if (new Set(columns.map(column => column.toLowerCase())).size !== columns.length || !Array.isArray(guide.rows) || guide.rows.length < 1 || guide.rows.length > 30) return null;
  const rows: CategorySizeGuide["rows"] = [];
  for (const row of guide.rows) {
    if (!row || typeof row !== "object" || typeof row.size !== "string" || !row.size.trim() || row.size.length > 30 || !Array.isArray(row.values) || row.values.length !== columns.length || !row.values.every((value: unknown) => typeof value === "string" && value.length <= 40 && (!guide.enabled || value.trim()))) return null;
    rows.push({ size: row.size.trim(), values: row.values.map((value: string) => value.trim()) });
  }
  if (new Set(rows.map(row => row.size.toLowerCase())).size !== rows.length) return null;
  return { enabled: guide.enabled, unit: guide.unit as CategorySizeGuide["unit"], measurementType: guide.measurementType as CategorySizeGuide["measurementType"], columns, rows, notes: guide.notes.trim() };
}
