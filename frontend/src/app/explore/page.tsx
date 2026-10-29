"use client";

import { useState, useEffect } from "react";
import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import { NewsletterFooter } from "@/components/footers/newsletter-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { type DocumentData, type QueryDocumentSnapshot, collection, onSnapshot } from 'firebase/firestore';
import { db } from "@/config/firebaseConfig";
import { Star, Grid, List, Heart, Eye, MapPin, Navigation, Loader, Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { trackProductClick } from "@/lib/gtag";

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  artist: string;
  rating: number;
  category: string;
  state: string;
  [key: string]: any;
}

// Categories & States
const categories = ["All", "Paintings", "Textiles", "Ceramics", "Sculptures", "Jewelry", "Woodwork"];
const states = ["All States", "Bihar", "Rajasthan", "Uttar Pradesh", "West Bengal", "Odisha", "Kerala", "Tamil Nadu", "Maharashtra", "Punjab", "Gujarat", "Chhattisgarh"];

export default function ExplorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedState, setSelectedState] = useState("All States");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  // wishlist moved to CartContext

  // Location states
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [detectedState, setDetectedState] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // ✅ Fetch artworks from Firestore with real-time updates
  useEffect(() => {
    const fetchProducts = async () => {
      console.log("🔄 Setting up real-time artwork updates...");
      if (!db) {
        console.error("Firestore DB instance not initialized");
        return;
      }

      const artworksRef = collection(db, "artworks");
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(artworksRef, (snapshot) => {
        try {
          const fetchedProducts = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || "Untitled",
              description: data.description || "",
              price: data.price || 0,
              originalPrice: data.originalPrice || data.price || 0,
              image: data.image || (data.images && data.images[0]) || "",
              images: data.images || [data.image] || [],
              artist: data.artistName || data.artist || "Unknown Artist",
              rating: data.rating || 0,
              category: data.category || "Uncategorized",
              state: data.state || "Not Specified",
              ...data
            } as Product;
          });
          
          setProducts(fetchedProducts);
          console.log("✨ Updated products:", fetchedProducts.length);
        } catch (err) {
          console.error("❌ Error fetching artworks:", err);
        } finally {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    };

    fetchProducts();
  }, []);

  // wishlist handled via context

  // Cart wiring
  const { addToCart, isInCart, toggleWishlist, isInWishlist } = useCart();
  const router = useRouter();

  const handleAddToCart = (product: any) => {
    // Normalize item shape expected by CartContext
    const item = {
      id: product.id,
      name: product.name,
      artist: product.artist,
      state: product.state || 'Not Specified',
      price: product.price || 0,
      originalPrice: product.originalPrice || product.price || 0,
      image: product.image || (product.images && product.images[0]) || '',
      rating: product.rating || 0,
      inStock: product.inStock !== undefined ? product.inStock : true,
      stockCount: product.stockCount || 99,
    };
    return addToCart(item, 1);
  };

  const handleBuyNow = (product: any) => {
    const added = handleAddToCart(product);
    if (!added) return;
    // Navigate user to cart for checkout and auto-start the quick checkout flow
    router.push(`/cart?buyNow=${encodeURIComponent(String(product.id))}`);
  };

  // 🔎 Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesState = selectedState === "All States" || product.state === selectedState;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesState && matchesSearch;
  });

  // 🧭 Location detection (same logic)
  const enableLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by browser");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        try {
          // Call the server-side reverse geocode endpoint (uses server key)
          const res = await fetch(`/api/geocode?lat=${encodeURIComponent(String(latitude))}&lng=${encodeURIComponent(String(longitude))}`);
          if (!res.ok) {
            const t = await res.text();
            throw new Error(`Server geocode failed: ${res.status} ${t}`);
          }
          const json = await res.json();
          const stateName = json?.state || null;

          setDetectedState(stateName || 'Unknown');
          setLocationEnabled(true);
          if (stateName) setSelectedState(stateName);
        } catch (err) {
          console.error('Server reverse geocoding error', err);
          setLocationError('Unable to resolve location to a state');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        setIsDetectingLocation(false);
        setLocationError("Unable to fetch location.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const disableLocation = () => {
    setLocationEnabled(false);
    setDetectedState("");
    setLocationError("");
    // Reset selectedState back to showing all states
    setSelectedState("All States");
  };

  // 🧾 UI Rendering
  return (
    <>
      <AnimatedIndicatorNavbar />

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="container mx-auto px-4 py-4">
          <BackButton />
        </div>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-amber-100 to-amber-200">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4 text-gray-800" style={{ fontFamily: "Rajdhani, sans-serif" }}>
              Explore Authentic <span className="block text-amber-600">Indian Crafts</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8" style={{ fontFamily: "Poppins, sans-serif" }}>
              Discover handcrafted treasures from talented artisans across India.
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search crafts, artists, or states..."
                className="pl-10 pr-4 py-3 w-full rounded-full border-amber-200 focus:border-amber-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-white border-b border-gray-100">
          <div className="container mx-auto flex flex-col lg:flex-row justify-between gap-6">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 mr-3">Categories:</span>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? "bg-amber-600 text-white" : "border-amber-200 text-amber-700"}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* States */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 mr-3">States:</span>
              {states.slice(0, 4).map((state) => (
                <Button
                  key={state}
                  size="sm"
                  variant={selectedState === state ? "default" : "outline"}
                  onClick={() => setSelectedState(state)}
                  className={selectedState === state ? "bg-amber-600 text-white" : "border-amber-200 text-amber-700"}
                >
                  {state}
                </Button>
              ))}
            </div>

            {/* View & Location */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Location</span>
                <Switch
                  checked={locationEnabled}
                  onCheckedChange={(checked) => (checked ? enableLocation() : disableLocation())}
                  className="data-[state=checked]:bg-amber-600"
                />
                {locationEnabled && <span className="text-xs text-amber-700">({detectedState})</span>}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto">
            {loading ? (
              <div className="text-center py-16">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-3" />
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}>
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition">
                    <Link href={`/artwork/${product.id}`} className="block relative" onClick={() => console.log("🔗 Navigating to artwork:", product.id)}>
                      <div className="relative w-full h-64">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          onError={(e) => {
                            console.log("🖼️ Image load error for artwork:", product.id);
                            const img = e.target as HTMLImageElement;
                            img.src = 'https://via.placeholder.com/400x300?text=Artwork+Image';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Button
                          className="bg-white text-gray-800 hover:bg-gray-100 transform transition hover:scale-105"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            trackProductClick(product.id, product.name, "explore_view_details");
                            router.push(`/artwork/${product.id}`);
                          }}
                          aria-label={`View details for ${product.name}`}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </Button>
                      </div>
                    </Link>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">by {product.artist}</p>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-700">₹{product.price}</span>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-yellow-400" />
                            <span>{product.rating}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            {isInCart(product.id) ? "Added" : "Add to Cart"}
                          </Button>

                          <Button
                            variant="outline"
                            className="w-32 border-amber-300 text-amber-700 hover:bg-amber-50"
                            onClick={() => handleBuyNow(product)}
                          >
                            Buy Now
                          </Button>

                          <Button
                            variant="ghost"
                            className="ml-2 flex items-center gap-2"
                            onClick={() => toggleWishlist({ id: product.id, name: product.name, artist: product.artist, state: product.state, price: product.price, image: product.image })}
                            aria-pressed={isInWishlist(product.id)}
                            aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                            title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'text-rose-500' : 'text-gray-400'}`} strokeWidth={1.5} />
                            {isInWishlist(product.id) && <span className="text-xs text-rose-600">Saved</span>}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <NewsletterFooter />
      </div>
    </>
  );
}
