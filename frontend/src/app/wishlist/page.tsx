"use client";

import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import { Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart, isInCart } = useCart();

  return (
    <>
      <AnimatedIndicatorNavbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

          {wishlist.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500">Save items you love to your wishlist for later!</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((w) => (
                <div key={String(w.id)} className="bg-white p-4 rounded shadow flex flex-col">
                  <img src={w.image || 'https://via.placeholder.com/300x200?text=Artwork'} alt={w.name} className="w-full h-44 object-cover rounded mb-3" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{w.name}</h3>
                    <p className="text-sm text-gray-500">{w.artist}</p>
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => addToCart({ id: w.id, name: w.name, artist: w.artist || 'Unknown', state: w.state || 'Not Specified', price: w.price || 0, originalPrice: w.price || 0, image: w.image || '', rating: 0, inStock: true })} disabled={isInCart(w.id)}>
                        {isInCart(w.id) ? 'Added' : 'Add to Cart'}
                      </Button>
                      <Button variant="ghost" onClick={() => removeFromWishlist(w.id)}>Remove</Button>
                      <Link href={`/artwork/${w.id}`} className="ml-auto text-sm text-amber-600">View</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
