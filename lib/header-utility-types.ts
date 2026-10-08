export type HeaderUtilitySettings = {
  trackOrder: { visible: boolean; label: string; href: string };
  help: { visible: boolean; label: string; href: string };
  currency: { visible: boolean };
};

export const DEFAULT_HEADER_UTILITY: HeaderUtilitySettings = {
  trackOrder: { visible: true, label: "Track Order", href: "/account/orders" },
  help: { visible: true, label: "Help", href: "/contact" },
  currency: { visible: true },
};
