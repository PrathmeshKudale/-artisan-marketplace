"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import { NewsletterFooter } from "@/components/footers/newsletter-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BackButton } from "@/components/ui/back-button";
import {
  Star,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  Plus,
  Minus,
  Heart,
  Share2,
  UserPlus,
  Scissors,
  MessageCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import RazorpayGPayButton from "@/components/ui/razorpay-gpay-button";
import RecommendationCard from "@/components/RecommendationCard";
import { usePathname } from 'next/navigation';

interface Artwork {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  artist?: string;
  artistName?: string;
  artistImage?: string;
  rating?: number;
  reviewsCount?: number;
  stockCount?: number;
  inStock?: boolean;
  category?: string;
  state?: string;
  material?: string;
  dimensions?: string;
  artistBio?: string;
}

interface ArtworkDetailPageProps {
  artwork: Artwork;
}

export default function ArtworkDetailPage({ artwork }: ArtworkDetailPageProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [customizationMsg, setCustomizationMsg] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  const { addToCart, isInCart, toggleWishlist, isInWishlist } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const redirectToSignIn = () => {
    router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
  };

  useEffect(() => {
    // Fetch recommendations from backend
    async function fetchRecs() {
      if (!artwork?.id) return;
      try {
        setRecLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/recommendations?artworkId=${artwork.id}`);
        const json = await res.json();
        if (json?.success && Array.isArray(json.recommendations)) {
          setRecommendations(json.recommendations);
        } else {
          setRecommendations([]);
        }
      } catch (e) {
        console.error('Failed to load recommendations', e);
        setRecommendations([]);
      } finally {
        setRecLoading(false);
      }
    }

    fetchRecs();
  }, [artwork.id]);

  if (!artwork) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="mb-4 text-red-500">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Artwork Not Found</h2>
          <p className="text-gray-600 mb-6">The requested artwork could not be found.</p>
          <Link href="/explore">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full">Return to Explore</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discount = artwork.originalPrice ? Math.round((1 - artwork.price / artwork.originalPrice) * 100) : 0;

  const increaseQuantity = () => {
    if (quantity < (artwork.stockCount ?? 1)) setQuantity(q => q + 1);
  };
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleAddToCart = () => {
    if (!user) {
      redirectToSignIn();
      return;
    }
    if (!artwork.stockCount) return;
    // Convert the artwork data to match CartItem
    const cartItem = {
      id: artwork.id,
      name: artwork.name,
      price: artwork.price,
      image: artwork.images?.[0] || artwork.image || '',
      artist: artwork.artistName || artwork.artist || 'Unknown Artist',
      state: artwork.state || 'Not Specified',
      originalPrice: artwork.originalPrice || artwork.price,
      rating: artwork.rating || 0,
      inStock: artwork.inStock ?? true
    };
    addToCart(cartItem, quantity);
  };

  const handleBuyNow = () => {
    if (!user) {
      redirectToSignIn();
      return;
    }
    // Add to cart, then open payment modal for immediate checkout
    handleAddToCart();
    setIsPaymentOpen(true);
  };

  const handleContactArtisan = () => {
    if (!user) {
      redirectToSignIn();
      return;
    }
    if (!contactMessage.trim()) return;
    alert("Your message has been sent to the artisan!");
    setContactMessage("");
    setIsContactDialogOpen(false);
  };

  // Wishlist toggle
  const handleToggleWishlist = () => {
    if (!user) {
      redirectToSignIn();
      return;
    }
    try {
      toggleWishlist({
        id: artwork.id,
        name: artwork.name,
        artist: artwork.artistName || artwork.artist || 'Unknown Artist',
        price: artwork.price,
        image: artwork.images?.[0] || artwork.image || ''
      });
    } catch (e) {
      console.error('Wishlist toggle failed', e);
    }
  };

  // Share action (Web Share API fallback to copy)
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const data = {
      title: artwork.name,
      text: `Check out ${artwork.name} on Artisan Marketplace`,
      url,
    };
    try {
      if ((navigator as any).share) {
        await (navigator as any).share(data);
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard');
      }
    } catch (err) {
      console.error('Share failed', err);
      alert('Unable to share this item');
    }
  };

  // Request customization
  const handleRequestCustomization = () => {
    if (!user) {
      router.push('/signin?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (!customizationMsg.trim()) {
      alert('Please add a customization message');
      return;
    }
    // For now, just simulate sending the request
    alert('Customization request sent to the artisan');
    setCustomizationMsg('');
    setIsCustomizationOpen(false);
  };

  // Show the number of reviews based on fetched reviews first (authoritative),
  // fallback to artwork.reviewsCount stored on the document if reviews not fetched yet.
  const displayedReviewsCount = (Array.isArray(reviews) && reviews.length) ? reviews.length : (artwork?.reviewsCount || 0);

  return (
    <>
      <AnimatedIndicatorNavbar />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <BackButton />
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <span>/</span>
              <span className="text-gray-800">{artwork.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <div className="aspect-[1/1] overflow-hidden rounded-xl">
              <img
                src={artwork.images?.[selectedImageIndex] || artwork.images?.[0]}
                alt={artwork.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = 'https://via.placeholder.com/400x400?text=Artwork+Image';
                }}
              />
              </div>
            </div>
            {artwork.images && artwork.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto items-center">
                {artwork.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 ${selectedImageIndex === index ? "border-orange-500 ring-2 ring-orange-100" : "border-gray-200"}`}>
                    <img alt={`thumbnail-${index}`} src={image} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Artwork+Image')} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div>
              <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-100 mb-3">{artwork.state} • {artwork.category}</Badge>
              <h1 className="text-4xl lg:text-3xl font-extrabold text-gray-900 leading-tight">{artwork.name}</h1>
              <p className="text-sm text-gray-600 mt-1">by {artwork.artistName}</p>
            </div>

            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>{artwork.rating}</span>
              <span className="text-gray-500">({displayedReviewsCount} reviews)</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold text-amber-700">₹{artwork.price}</span>
              {artwork.originalPrice && artwork.originalPrice > artwork.price && (
                <>
                  <span className="text-lg text-gray-500 line-through">₹{artwork.originalPrice}</span>
                  <Badge className="bg-green-600 text-white">{discount}% OFF</Badge>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Quantity:</span>
              <div className="flex items-center">
                <Button variant="outline" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1} className="h-8 w-8"><Minus className="h-4 w-4" /></Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={increaseQuantity} disabled={quantity >= (artwork.stockCount || 1)} className="h-8 w-8"><Plus className="h-4 w-4" /></Button>
              </div>
              <span className="text-sm text-gray-500">{artwork.stockCount} pieces available</span>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                {user ? (
                  <>
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white flex-1 h-12 rounded-md shadow-sm" onClick={handleBuyNow} disabled={!artwork.inStock}>Buy Now</Button>
                    <Button variant="outline" className="border-amber-300 text-amber-700 flex-1 h-12 rounded-md" onClick={handleAddToCart} disabled={!artwork.inStock}>
                      <ShoppingCart className="w-4 h-4 mr-2" />{isInCart(artwork.id) ? "Added to Cart" : "Add to Cart"}
                    </Button>
                  </>
                ) : (
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white w-full h-12 rounded-md shadow-sm" 
                    onClick={redirectToSignIn}>
                    Sign in to Purchase
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" className="flex items-center gap-2 text-sm px-3 py-2 rounded-md border" onClick={handleToggleWishlist}>
                  <Heart className={`w-4 h-4 ${isInWishlist(artwork.id) ? 'text-rose-500' : ''}`} /> Wishlist
                </Button>

                <Button variant="outline" className="flex items-center gap-2 text-sm px-3 py-2 rounded-md" onClick={() => setIsContactDialogOpen(true)}>
                  <UserPlus className="w-4 h-4" /> Connect with Artisan
                </Button>

                <Button variant="outline" className="flex items-center gap-2 text-sm px-3 py-2 rounded-md" onClick={() => setIsCustomizationOpen(true)}>
                  <Scissors className="w-4 h-4" /> Customize
                </Button>

                <Button variant="ghost" className="ml-auto text-sm px-3 py-2 rounded-md" onClick={handleShare}>
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>

              {/* Delivery / Policies box */}
              <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-amber-600" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">Delivery Options</p>
                    <p className="text-xs text-gray-600">Standard: 5-7 business days • Express: 2-3 business days</p>
                    <p className="text-xs text-gray-600 mt-2">7-day return policy • Secure payments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations section */}
        <div className="container mx-auto mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">You may also like</h3>
              {recLoading ? <span className="text-sm text-gray-500">Loading…</span> : <span className="text-sm text-gray-500">Based on this artwork</span>}
            </div>
            {recommendations.length === 0 && !recLoading ? (
              <p className="text-sm text-gray-500">No recommendations available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recommendations.map((r) => (
                  <RecommendationCard key={r.id} id={r.id} name={r.name} artist={r.artistName} image={r.image} price={r.price} />
                ))}
              </div>
            )}
            {/* end recommendations */}
          </div>
        </div>

        <div className="container mx-auto mt-16">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-4 bg-amber-50 rounded-md p-1">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="artist">Artist</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <Card>
                <CardHeader>
                  <CardTitle>About the Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{artwork.description}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specs">
              <Card>
                <CardHeader>
                  <CardTitle>Product Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Category</p>
                      <p className="text-gray-600">{artwork.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">State</p>
                      <p className="text-gray-600">{artwork.state}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Material</p>
                      <p className="text-gray-600">{artwork.material || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Dimensions</p>
                      <p className="text-gray-600">{artwork.dimensions || "Not specified"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="artist">
              <Card>
                <CardHeader>
                  <CardTitle>About the Artist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={artwork.artistImage} />
                      <AvatarFallback>{artwork.artistName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{artwork.artistName}</h3>
                      <p className="text-gray-600">{artwork.artistBio || `Traditional artisan specializing in ${artwork.category}`}</p>
                      <Button variant="outline" className="mt-4" onClick={() => setIsContactDialogOpen(true)}>
                        <MessageCircle className="w-4 h-4 mr-2" />Contact Artisan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No reviews yet</p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={review.userImage} />
                              <AvatarFallback>{review.userName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{review.userName}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < (review.rating || 0) ? "fill-yellow-400" : "fill-gray-200"}`} />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="mt-2 text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact {artwork.artistName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Your Message</Label>
              <Textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="I'm interested in this artwork..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleContactArtisan}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomizationOpen} onOpenChange={setIsCustomizationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Customization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Customization Details</Label>
              <Textarea value={customizationMsg} onChange={(e) => setCustomizationMsg(e.target.value)} placeholder="Describe the customization you need (size, color, finish, etc.)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomizationOpen(false)}>Cancel</Button>
            <Button onClick={handleRequestCustomization}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog (Razorpay + GPay) */}
      <Dialog open={isPaymentOpen && !!user} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">You're purchasing <strong>{artwork.name}</strong> — ₹{artwork.price} x {quantity} = <strong>₹{artwork.price * quantity}</strong></p>
            <RazorpayGPayButton
              amount={artwork.price * quantity}
              onSuccess={(resp) => {
                console.log('Payment success:', resp);
                setIsPaymentOpen(false);
                // Redirect to orders page (or any success UI)
                router.push('/orders');
              }}
              onError={(err) => {
                console.error('Payment error:', err);
                alert('Payment failed. Please try again.');
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewsletterFooter />
    </>
  );
}