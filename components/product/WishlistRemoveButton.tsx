"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WishlistRemoveButton({ productId }: { productId: number }) {
  const router = useRouter();
  const [removed, setRemoved] = useState(false);
  const remove = async () => {
    const response = await fetch(`/api/account/wishlist?productId=${productId}`, { method: "DELETE" });
    if (response.ok) { setRemoved(true); router.refresh(); }
  };
  if (removed) return null;
  return <button aria-label="Remove from wishlist" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#9b5c5c] shadow-sm transition hover:bg-red-50 hover:text-red-600" onClick={() => void remove()} type="button"><Heart className="h-4 w-4 fill-current" /></button>;
}
