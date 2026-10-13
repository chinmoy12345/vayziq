import { Heart } from "lucide-react";

interface WishlistHeartProps {
  active?: boolean;
  className?: string;
}

export default function WishlistHeart({ active = false, className = "h-5 w-5" }: WishlistHeartProps) {
  return <Heart aria-hidden="true" className={className} fill={active ? "currentColor" : "none"} strokeWidth={1.7} />;
}
