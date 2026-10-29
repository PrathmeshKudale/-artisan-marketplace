"use client";

import Link from "next/link";
import React from "react";
import { useCart } from "@/contexts/CartContext";

interface Props {
  id: string;
  name: string;
  artist?: string;
  image?: string;
  price?: number;
}

export default function RecommendationCard({ id, name, artist, image, price }: Props) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // Build a minimal CartItem-shaped object expected by addToCart
      addToCart(
        {
          id,
          name,
          artist: artist || "",
          state: "",
          price: price ?? 0,
          originalPrice: price ?? 0,
          image: image || '',
          rating: 0,
          inStock: true,
          stockCount: 1
        },
        1
      );
    } catch (err) {
      console.error('Add to cart failed', err);
    }
  };

  return (
    <div className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3">
      <div className="w-full h-40 relative rounded-md overflow-hidden bg-gray-100">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Artwork+Image')} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{name}</h3>
        <p className="text-xs text-gray-500 mt-1">{artist}</p>
        {typeof price === "number" && (
          <p className="text-sm font-semibold text-amber-700 mt-2">₹{price}</p>
        )}

        <div className="mt-3 flex gap-2">
          <Link href={`/artwork/${id}`} className="text-sm px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50">View Details</Link>
          <button onClick={handleAddToCart} className="ml-auto bg-amber-600 hover:bg-amber-700 text-white text-sm px-3 py-1 rounded-md">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
