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
  return <button aria-label="Remove from wishlist" className="absolute right-2.5 top-2.5 grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-[#B56F6F] text-white shadow-[0_2px_8px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-all duration-300 hover:bg-[#9f5e5e]" onClick={() => void remove()} type="button"><Heart className="h-5 w-5 fill-current" /></button>;
}
