// Response shapes consumed by the admin product forms.
export type CategoryResponse = {
  id: number | string;
  name: string;
  slug: string;
  status: string;
  parent?: { name: string } | null;
};

export type ProductImageResponse = string | { url?: string; image?: string } | null;
export type OptionValueResponse = string | { value?: string } | null;
export type ProductOptionResponse = {
  id?: number | string;
  name?: string;
  optionName?: string;
  values?: OptionValueResponse[];
};
export type ProductVariantResponse = {
  id?: number | string;
  values?: Record<string, string>;
  sku?: string;
  price?: number | string;
  stock?: number | string;
};
export type UploadResponse = {
  success?: boolean;
  message?: string;
  url?: string;
  image?: string;
  data?: { url?: string; image?: string };
};
