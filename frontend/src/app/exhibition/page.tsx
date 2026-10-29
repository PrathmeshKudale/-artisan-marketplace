"use client";

import { useEffect, useState } from "react";
import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import { useAuth } from "@/contexts/AuthContext";
import { NewsletterFooter } from "@/components/footers/newsletter-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { Calendar, MapPin, Users, Eye, Plus, Star, Palette, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import RazorpayGPayButton from "@/components/ui/razorpay-gpay-button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/config/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "sonner";

export default function ExhibitionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Traditional Art", "Textiles", "Ceramics", "Performing Arts", "Sculptures"];
  const statusFilters = ["All", "ongoing", "upcoming", "completed"];

  // 🔹 Fetch data from Firestore
  useEffect(() => {
    const fetchExhibitions = async () => {
      console.log("🔄 Fetching exhibitions data...");
      try {
        if (!db) {
          throw new Error("Firestore DB instance not initialized");
        }
        
        const exhibitionsRef = collection(db, "exhibitions");
        console.log("📑 Querying 'exhibitions' collection...");
        
        const querySnapshot = await getDocs(exhibitionsRef);
        console.log(`✅ Retrieved ${querySnapshot.size} exhibitions`);

        if (querySnapshot.empty) {
          console.warn("⚠️ No exhibitions found in Firestore. Falling back to local data.");
          try {
            const localModule = await import('@/data/exhibitions.json');
            const local = localModule?.default || localModule;
            const localData = local.map((item: any) => ({ id: item.id || item.title, ...item }));
            console.log('📦 Loaded', localData.length, 'exhibitions from local data');
            setExhibitions(localData);
            console.log("✨ Successfully updated exhibitions state from local data", localData.length, "items");
            return;
          } catch (lfErr) {
            console.error('❌ Failed to load local exhibitions fallback:', lfErr);
          }
        }

        const data = querySnapshot.docs.map((doc) => {
          const docData = doc.data();
          console.log(`📄 Exhibition document ${doc.id}:`, docData);
          return { id: doc.id, ...docData };
        });

        setExhibitions(data);
        console.log("✨ Successfully updated exhibitions state with", data.length, "items");
      } catch (error) {
        console.error("❌ Error fetching exhibitions:", error);
        if (error instanceof Error) {
          console.error("Error details:", error.message);
          console.error("Stack trace:", error.stack);
        }
      } finally {
        setLoading(false);
        console.log("🏁 Finished loading exhibitions data");
      }
    };
    fetchExhibitions();
  }, []);

  const filteredExhibitions = exhibitions.filter((exhibition) => {
    const matchesCategory = selectedCategory === "All" || exhibition.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || exhibition.status === selectedStatus;
    const matchesSearch =
      exhibition.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exhibition.artist?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing": return "bg-green-600";
      case "upcoming": return "bg-blue-600";
      case "completed": return "bg-gray-600";
      default: return "bg-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ongoing": return "Live Now";
      case "upcoming": return "Coming Soon";
      case "completed": return "Completed";
      default: return status;
    }
  };

  // Cart & Payment state
  const { addToCart } = useCart();
  const [selectedExhibition, setSelectedExhibition] = useState<any | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleAddToCartExhibition = (exhibition: any) => {
    if (!user) {
      toast.error("Sign in first to buy.");
      return false;
    }
    const item = {
      id: exhibition.id,
      name: exhibition.title,
      artist: exhibition.artist,
      state: exhibition.location || "",
      price: exhibition.price ?? 0,
      originalPrice: exhibition.price ?? 0,
      image: exhibition.image,
      rating: exhibition.rating ?? 0,
      inStock: true,
      stockCount: 1,
    };
    return addToCart(item, 1);
  };

  const handleBuyNowExhibition = (exhibition: any) => {
    // Add to cart and open payment if price > 0, else just add and confirm
    const added = handleAddToCartExhibition(exhibition);
    if (!added) return;
    if ((exhibition.price ?? 0) > 0) {
      setSelectedExhibition(exhibition);
      setIsPaymentOpen(true);
    } else {
      // Free reservation — simple confirmation flow
      alert(`Reserved spot for ${exhibition.title}`);
    }
  };

  return (
    <>
      <AnimatedIndicatorNavbar />

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="container mx-auto px-4 py-4">
          <BackButton />
        </div>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-amber-100 to-amber-200 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4 text-gray-800" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            Art Exhibitions & <span className="block text-amber-700">Cultural Showcases</span>
          </h1>
          <p className="text-lg text-gray-800 max-w-2xl mx-auto mb-8" style={{ fontFamily: "Poppins, sans-serif" }}>
            Join exclusive exhibitions, meet talented artisans, and immerse yourself in India's rich cultural heritage.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-3">
              <Plus className="w-5 h-5 mr-2" /> Organize Exhibition
            </Button>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-3">
              <Palette className="w-5 h-5 mr-2" /> Artist Portal
            </Button>
          </div>

          <div className="max-w-md mx-auto relative">
            <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search exhibitions or artists..."
              className="pl-10 pr-4 py-3 w-full rounded-full border-amber-200 focus:border-amber-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading exhibitions...</div>
        ) : (
          <>
            {/* Filters */}
            <section className="py-6 bg-gray-50">
              <div className="container mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700 mr-3">Categories:</span>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={
                        selectedCategory === category
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "border-amber-200 text-amber-700 hover:bg-amber-50"
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700 mr-3">Status:</span>
                  {statusFilters.map((status) => (
                    <Button
                      key={status}
                      variant={selectedStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStatus(status)}
                      className={
                        selectedStatus === status
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "border-amber-200 text-amber-700 hover:bg-amber-50"
                      }
                    >
                      {status === "All" ? status : getStatusText(status)}
                    </Button>
                  ))}
                </div>
              </div>
            </section>

            {/* Exhibitions Grid */}
            <section className="py-12">
              <div className="container mx-auto">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    {filteredExhibitions.length} Exhibitions Available
                  </h2>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filteredExhibitions.map((exhibition) => (
                    <div
                      key={exhibition.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="relative">
                        <img
                          src={exhibition.image}
                          alt={exhibition.title}
                          className="w-full h-48 object-cover"
                        />
                        <Badge className={`absolute top-3 left-3 ${getStatusColor(exhibition.status)} text-white`}>
                          {getStatusText(exhibition.status)}
                        </Badge>
                        {exhibition.featured && (
                          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <div className="p-6">
                        <Badge variant="outline" className="text-xs text-amber-700 border-amber-200 mb-2">
                          {exhibition.category}
                        </Badge>
                        <h3 className="font-bold text-xl text-gray-800 mb-2 leading-tight">{exhibition.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">by {exhibition.artist}</p>
                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">{exhibition.description}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-amber-600" />
                            {exhibition.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            {new Date(exhibition.startDate).toLocaleDateString()} -{" "}
                            {new Date(exhibition.endDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{exhibition.rating}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            {exhibition.attendees} interested
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-col gap-2">
                            <Button onClick={() => handleBuyNowExhibition(exhibition)} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                              <Eye className="w-4 h-4 mr-2" />
                              {exhibition.status === "ongoing"
                                ? "Visit Exhibition"
                                : exhibition.status === "upcoming"
                                ? "Reserve Spot"
                                : "View Gallery"}
                            </Button>

                            <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => handleAddToCartExhibition(exhibition)}>
                              <Palette className="w-4 h-4 mr-2" /> Add to Cart / View Portfolio
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredExhibitions.length === 0 && (
                  <div className="text-center py-12">
                    <Palette className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No exhibitions found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <NewsletterFooter />
      {/* Payment Dialog for Exhibitions */}
      <div>
        {selectedExhibition && (
          <div>
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Complete Reservation / Ticket</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-600 mb-4">You're reserving a spot for <strong>{selectedExhibition.title}</strong>.</p>
                  <RazorpayGPayButton
                    amount={(selectedExhibition.price ?? 0)}
                    onSuccess={(resp) => {
                      console.log('Exhibition payment success', resp);
                      setIsPaymentOpen(false);
                      alert('Reservation confirmed!');
                    }}
                    onError={(err) => {
                      console.error('Exhibition payment error', err);
                      alert('Payment failed');
                    }}
                  />
                </div>
                <div className="p-4 text-right">
                  <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Close</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </>
  );
}
