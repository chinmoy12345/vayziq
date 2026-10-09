"use client";

import { useEffect } from "react";

export default function CashfreeCartCleanup() {
  useEffect(() => {
    localStorage.removeItem("susmita-cart");
    localStorage.removeItem("tantuka-offer");
    window.dispatchEvent(new Event("cart-updated"));
  }, []);
  return null;
}
