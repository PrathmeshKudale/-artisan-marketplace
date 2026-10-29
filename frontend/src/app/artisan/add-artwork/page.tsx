"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Image as ImageIcon } from "lucide-react";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';
import { getAuth } from 'firebase/auth';

interface CustomUser {
  uid: string;
  name: string;
  type?: string;
  state?: string;
}

export default function AddArtworkPage() {
  const router = useRouter();
  const { user } = useAuth() as { user: CustomUser | null };
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('painting');
  const [price, setPrice] = useState<number | ''>('');
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState<number | ''>('');
  const [materials, setMaterials] = useState('');
  const [tags, setTags] = useState('');

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validateForm = () => {
    if (!title.trim()) {
      setError("Please provide a title for your artwork");
      return false;
    }
    if (!description.trim()) {
      setError("Please provide a description for your artwork");
      return false;
    }
    if (!price && price !== 0) {
      setError("Please set a price for your artwork");
      return false;
    }
    if (files.length === 0) {
      setError("Please upload at least one image");
      return false;
    }
    return true;
  };

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const arr = Array.from(selected).slice(0, 6); // limit to 6 images
    setFiles(arr);
    const urls = arr.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const onChoose = () => {
    inputRef.current?.click();
  };

  const uploadAndPublish = async () => {
    if (!user) {
      setError('You must be signed in as an artisan to publish');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setError("");
    setUploading(true);
    try {
      // Resize images client-side (to reduce upload size) and send to backend to avoid CORS issues
      const resizeImage = async (file: File, maxWidth = 1600): Promise<Blob> => {
        try {
          const imgBitmap = await createImageBitmap(file);
          const ratio = imgBitmap.height / imgBitmap.width;
          const w = Math.min(maxWidth, imgBitmap.width);
          const h = Math.round(w * ratio);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas not supported');
          ctx.drawImage(imgBitmap, 0, 0, w, h);
          return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', 0.8));
        } catch (e) {
          return file;
        }
      };

      const form = new FormData();
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const resized = await resizeImage(f, 1600);
        form.append('files', resized, f.name);
      }

      // Get the current user's ID token
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      const token = await currentUser.getIdToken();

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const backendUrl = apiUrl + '/upload-artworks';
      const uploadResp = await fetch(backendUrl, { 
        method: 'POST', 
        body: form,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!uploadResp.ok) {
        const text = await uploadResp.text();
        throw new Error(`Backend upload failed: ${uploadResp.status} ${text}`);
      }
      const uploadJson = await uploadResp.json();
      if (!uploadJson.success || !Array.isArray(uploadJson.urls)) {
        throw new Error('Backend returned invalid upload response');
      }
      const uploadedUrls: string[] = uploadJson.urls as string[];

      // create artwork doc
      const doc = await addDoc(collection(db, 'artworks'), {
        name: title,
        description,
        category,
        price: typeof price === 'number' ? price : Number(price || 0),
        dimensions,
        weight: typeof weight === 'number' ? weight : Number(weight || 0),
        materials,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        images: uploadedUrls,
        image: uploadedUrls[0] || '',
        artistId: user.uid,
        artistName: user.name,
        state: user.type === 'artisan' ? (user as any).state || 'Not Specified' : 'Not Specified',
        createdAt: new Date().toISOString(),
      });

      // Success
      alert('Artwork published');
      router.push('/explore');
    } catch (err) {
      console.error('Publish failed', err);
      alert('Failed to publish artwork');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <>
      <AnimatedIndicatorNavbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-6">
            <BackButton />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Artwork</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Artwork Details</CardTitle>
              <CardDescription>
                Fill in the details of your artwork to list it on the marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Artwork Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter the title of your artwork" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your artwork, materials used, inspiration, etc."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(v) => setCategory(v)} value={category}>
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
                  <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input id="dimensions" value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="e.g., 30cm x 40cm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" step="0.1" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Images</Label>
                <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Click to upload images or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB. Max 6 images.</p>
                  <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                  <div className="mt-4 flex justify-center gap-3">
                    <Button variant="outline" onClick={onChoose}>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                    {files.length > 0 && <div className="text-sm text-gray-600 self-center">{files.length} selected</div>}
                  </div>

                  {previews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {previews.map((p, idx) => (
                        <img key={p} src={p} className="w-full h-24 object-cover rounded" alt={`preview-${idx}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="materials">Materials Used</Label>
                <Input id="materials" value={materials} onChange={(e) => setMaterials(e.target.value)} placeholder="e.g., Canvas, Oil paint, Wood" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., handmade, traditional, modern (separate with commas)" />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {uploading && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-gray-500 text-center">{progress}% complete</p>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => router.push('/artisan/dashboard')}
                  disabled={uploading}
                >
                  Save as Draft
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={uploadAndPublish} 
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Publish Artwork'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
