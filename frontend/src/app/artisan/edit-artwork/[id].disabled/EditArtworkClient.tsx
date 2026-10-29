"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "lucide-react";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  id: string;
}

export default function EditArtworkClient({ id }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [artwork, setArtwork] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState<number | ''>('');
  const [materials, setMaterials] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const artworkRef = doc(db, 'artworks', id);
        const artworkSnap = await getDoc(artworkRef);

        if (artworkSnap.exists()) {
          const data = artworkSnap.data();
          setArtwork(data);

          // Populate form fields
          setTitle(data.name || '');
          setDescription(data.description || '');
          setCategory(data.category || '');
          setPrice(data.price || '');
          setDimensions(data.dimensions || '');
          setWeight(data.weight || '');
          setMaterials(data.materials || '');
          setTags((data.tags || []).join(', '));
        } else {
          console.error('Artwork not found');
          router.push('/profile');
        }
      } catch (err) {
        console.error('Error fetching artwork:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtwork();
    }
  }, [id, router]);

  const handleSave = async () => {
    if (!user || !artwork) return;

    setSaving(true);
    try {
      const artworkRef = doc(db, 'artworks', id);
      await updateDoc(artworkRef, {
        name: title,
        description,
        category,
        price: typeof price === 'number' ? price : Number(price || 0),
        dimensions,
        weight: typeof weight === 'number' ? weight : Number(weight || 0),
        materials,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        updatedAt: new Date().toISOString(),
      });

      router.back();
    } catch (err) {
      console.error('Failed to update artwork:', err);
      alert('Failed to update artwork');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AnimatedIndicatorNavbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center py-16">
              <Loader className="w-6 h-6 animate-spin mx-auto mb-3" />
              <p className="text-gray-500">Loading artwork details...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatedIndicatorNavbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-6">
            <BackButton />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Edit Artwork</CardTitle>
              <CardDescription>
                Update the details of your artwork.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Artwork Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={setCategory} value={category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="painting">Painting</SelectItem>
                      <SelectItem value="sculpture">Sculpture</SelectItem>
                      <SelectItem value="pottery">Pottery</SelectItem>
                      <SelectItem value="textiles">Textiles</SelectItem>
                      <SelectItem value="jewelry">Jewelry</SelectItem>
                      <SelectItem value="woodwork">Wood Work</SelectItem>
                      <SelectItem value="metalwork">Metal Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input 
                    id="dimensions" 
                    value={dimensions} 
                    onChange={(e) => setDimensions(e.target.value)} 
                    placeholder="e.g., 30cm x 40cm" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))} 
                    step="0.1" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="materials">Materials Used</Label>
                <Input 
                  id="materials" 
                  value={materials} 
                  onChange={(e) => setMaterials(e.target.value)} 
                  placeholder="e.g., Canvas, Oil paint, Wood" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input 
                  id="tags" 
                  value={tags} 
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., handmade, traditional, modern (separate with commas)" 
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button variant="outline" className="flex-1" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleSave} 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
