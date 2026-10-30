"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Card } from '../ui/card';

import ArtisanInteractiveMap from './artisan-interactive-map';

// API response types
interface PlacesApiResponse {
  stores: StoreLocation[];
  fallback?: string;
}

interface StoreLocation {
  id: string;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  address: string;
  rating: number;
  craftTypes: string[];
  openingHours?: string;
  contact?: string;
  userRatingsTotal?: number;
  website?: string;
  reviews?: Array<{
    authorName?: string;
    rating?: number;
    text?: string;
    relativeTime?: string;
  }>;
}

interface MapProps {
  initialCenter?: { lat: number; lng: number };
  zoom?: number;
  stores?: StoreLocation[];
  selectedStoreId?: string | null;
  onResults?: (stores: StoreLocation[]) => void;
}

const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India
const MAP_LIBRARIES = ['places'] as const;

const resolveGoogleMapsApiKey = () => {
  const candidateKeys = [
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
    'GOOGLE_MAPS_API_KEY',
    'find_nearby_stores_api_key',
    'Places_API_key',
    'browser_key',
  ];

  for (const key of candidateKeys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

export default function StoreLocator({ 
  initialCenter = defaultCenter, 
  zoom = 5,
  stores = [],
  selectedStoreId = null,
  onResults,
}: MapProps) {
  // Use the public key for Maps JS API (maps, geocoding, etc)
  const mapsApiKey = resolveGoogleMapsApiKey();

  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [clientStores, setClientStores] = useState<StoreLocation[]>([]);
  const [usedClientFallback, setUsedClientFallback] = useState(false);

  // Load stores from server endpoint
  const loadStores = useCallback(async () => {
    if (!initialCenter) return;

    try {
      const url = `/api/stores?lat=${initialCenter.lat}&lng=${initialCenter.lng}&radiusKm=15`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', data);
        return;
      }

      if (!data.stores || !Array.isArray(data.stores)) {
        console.error('Invalid API response:', data);
        return;
      }

      setClientStores(data.stores);
      setUsedClientFallback(!!data.fallback);
      
      // Notify parent if provided
      onResults?.(data.stores);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  }, [initialCenter, onResults]);

  // Load stores when map is ready and no server stores provided
  useEffect(() => {
    if (map && (!stores || stores.length === 0)) {
      loadStores();
    }
  }, [map, stores, loadStores]);

  // Call the loader hook unconditionally
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: mapsApiKey || '',
    libraries: MAP_LIBRARIES as any,
    version: "weekly",
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMap(null);
  }, []);

  const displayedStores = stores?.length > 0 ? stores : clientStores;

  // Seamless fallback to interactive OpenStreetMap if Google Maps API key is not configured or fails
  if (!mapsApiKey || loadError) {
    return (
      <ArtisanInteractiveMap
        initialCenter={initialCenter}
        zoom={zoom}
        stores={displayedStores}
        selectedStoreId={selectedStoreId}
        onSelectStore={(st) => setSelectedStore(st)}
      />
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-500">Loading maps...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] relative">
      <div className="absolute top-4 left-4 z-10 w-64">
        <Card className="p-4 bg-white shadow-lg">
          <h3 className="font-semibold mb-2">Find Nearby Stores</h3>
          <input
            type="text"
            placeholder="Search by craft or location..."
            className="w-full p-2 border rounded mb-2"
          />
          <select className="w-full p-2 border rounded">
            <option value="">Filter by craft type</option>
            <option value="pottery">Pottery</option>
            <option value="textiles">Textiles</option>
            <option value="jewelry">Jewelry</option>
          </select>
        </Card>
      </div>

      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={initialCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        {displayedStores.map((store) => (
          <Marker
            key={store.id}
            position={store.position}
            onClick={() => setSelectedStore(store)}
          />
        ))}

        {selectedStore && (
          <InfoWindow
            position={selectedStore.position}
            onCloseClick={() => setSelectedStore(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold mb-1">{selectedStore.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{selectedStore.address}</p>
              <p className="text-sm mb-1">Rating: {selectedStore.rating}/5 ({selectedStore.userRatingsTotal ?? 0})</p>
              {selectedStore.openingHours && (
                <p className="text-sm mb-1">Hours: {selectedStore.openingHours}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedStore.craftTypes.map((craft) => (
                  <span
                    key={craft}
                    className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                  >
                    {craft}
                  </span>
                ))}
              </div>
              {selectedStore.reviews && selectedStore.reviews.length > 0 && (
                <div className="mt-2 border-t pt-2">
                  <p className="text-xs font-semibold mb-1">Recent reviews</p>
                  {selectedStore.reviews.slice(0, 2).map((r, i) => (
                    <p key={i} className="text-xs text-gray-700 mb-1">"{(r.text || '').slice(0, 120)}{(r.text || '').length > 120 ? '…' : ''}"</p>
                  ))}
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      
      {/* Debug/status overlay */}
      <div className="absolute bottom-4 right-4 z-20">
        <Card className="p-2 bg-white/90 shadow">
          <div className="text-xs text-gray-700">
            <div>Maps loaded: {String(isLoaded)}</div>
            <div>Using sample data: {String(usedClientFallback)}</div>
            <div>Markers: {displayedStores.length}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
