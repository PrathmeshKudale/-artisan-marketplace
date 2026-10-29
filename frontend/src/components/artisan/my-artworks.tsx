"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, Plus, Eye, Edit, Trash, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";

interface Artwork {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  state: string;
  artistId: string;
  createdAt: any;
}

export default function MyArtworks() {
  const { user } = useAuth();
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    // Query artworks where artistId matches current user's ID
    const artworksRef = collection(db, "artworks");
    const artworksQuery = query(artworksRef, where("artistId", "==", user.id));

    const unsubscribe = onSnapshot(artworksQuery, (snapshot) => {
      try {
        const fetchedArtworks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Artwork));
        
        setArtworks(fetchedArtworks);
        console.log("✨ Fetched artworks:", fetchedArtworks.length);
      } catch (err) {
        console.error("❌ Error fetching artworks:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  const handleDelete = async (artworkId: string) => {
    // TODO: Implement delete functionality
    console.log("Deleting artwork:", artworkId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Artworks</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Loader className="w-6 h-6 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading your artworks...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center mb-4">
          <BackButton />
        </div>
        <div className="flex flex-row items-center justify-between">
          <CardTitle>My Artworks</CardTitle>
          <Button onClick={() => router.push("/artisan/add-artwork")}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Artwork
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {artworks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't added any artworks yet.</p>
            <Button onClick={() => router.push("/artisan/add-artwork")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Artwork
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-w-4 aspect-h-3">
                  <img 
                    src={artwork.image} 
                    alt={artwork.name} 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = 'https://via.placeholder.com/400x300?text=Artwork+Image';
                    }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{artwork.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1 line-clamp-2">
                        {artwork.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-amber-600">₹{artwork.price}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 capitalize">{artwork.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/artwork/${artwork.id}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/artisan/edit-artwork/${artwork.id}`)}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(artwork.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={() => router.push(`/artisan/edit-artwork/${artwork.id}`)}
                    >
                      Edit Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}