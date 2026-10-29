import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import SAMPLE_STORES from '../../../lib/sample-stores';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

type LatLng = {
  lat: number;
  lng: number;
};

type Store = {
  id: string;
  placeId: string;
  name: string;
  position: LatLng;
  address: string;
  rating: number;
  userRatingsTotal?: number;
  openingHours?: string;
  contact?: string;
  website?: string;
  craftTypes: string[];
  reviews?: Array<{
    authorName?: string;
    rating?: number;
    text?: string;
    relativeTime?: string;
  }>;
};

export async function GET(request: NextRequest) {
  // For static export, we'll return sample data
  return NextResponse.json({ 
    stores: SAMPLE_STORES, 
    fallback: 'sample-data-static' 
  }, { 
    headers: { 'Cache-Control': 'public, max-age=3600' } 
  });

}