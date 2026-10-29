import type { Metadata } from 'next';
import artworks from '@/data/artworks.json';
import ArtworkDetailClient from './client';

type JsonArtwork = {
  id: number;
  name: string;
  artist: string;
  state: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  featured: boolean;
};

type TransformedArtwork = {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice: number;
  images: string[];
  image: string;
  artist: string;
  artistName: string;
  artistImage?: string;
  rating: number;
  reviewsCount: number;
  stockCount: number;
  inStock: boolean;
  category: string;
  state: string;
  material?: string;
  dimensions?: string;
  artistBio?: string;
};

function transformArtwork(artwork: JsonArtwork): TransformedArtwork {
  return {
    id: artwork.id.toString(),
    name: artwork.name,
    price: artwork.price,
    originalPrice: artwork.originalPrice,
    images: [artwork.image],
    image: artwork.image,
    artist: artwork.artist,
    artistName: artwork.artist,
    rating: artwork.rating,
    reviewsCount: artwork.reviews,
    stockCount: 1,
    inStock: true,
    category: artwork.category,
    state: artwork.state,
  };
}

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const artwork = artworks.find(a => a.id.toString() === String(id));
  if (!artwork) {
    return {
      title: 'Artwork Not Found',
      description: 'The requested artwork could not be found.',
    };
  }

  return {
    title: `${artwork.name} | Artisan Marketplace`,
    description: `${artwork.name} by ${artwork.artist}`,
    openGraph: {
      title: artwork.name,
      description: `${artwork.name} by ${artwork.artist}`,
      images: [artwork.image].filter(Boolean),
    },
  };
}

export function generateStaticParams() {
  return artworks.map((artwork) => ({
    id: artwork.id.toString(),
  }));
}

export default function ArtworkPage({ params }: { params: any }) {
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const artwork = artworks.find(a => a.id.toString() === String(id));
  if (!artwork) return null;

  return <ArtworkDetailClient artwork={transformArtwork(artwork)} />;
}
