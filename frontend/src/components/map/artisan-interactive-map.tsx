"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Navigation,
  Plus,
  Minus,
  Search,
  Star,
  Phone,
  Clock,
  ExternalLink,
  Layers,
  RotateCcw,
} from "lucide-react";

export interface StoreLocation {
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

interface ArtisanInteractiveMapProps {
  initialCenter?: { lat: number; lng: number };
  zoom?: number;
  stores?: StoreLocation[];
  selectedStoreId?: string | null;
  onSelectStore?: (store: StoreLocation | null) => void;
}

// Convert lon/lat to pixel coords on a world map at given zoom level (Web Mercator)
function lngToX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * Math.pow(2, zoom) * 256;
}

function latToY(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    Math.pow(2, zoom) *
    256
  );
}

function xToLng(x: number, zoom: number): number {
  return (x / (Math.pow(2, zoom) * 256)) * 360 - 180;
}

function yToLat(y: number, zoom: number): number {
  const n = Math.PI - (2 * Math.PI * y) / (Math.pow(2, zoom) * 256);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

const CRAFT_FILTERS = [
  "all",
  "pottery",
  "textiles",
  "jewelry",
  "woodwork",
  "painting",
  "metalwork",
];

export default function ArtisanInteractiveMap({
  initialCenter = { lat: 18.5204, lng: 73.8567 },
  zoom: defaultZoom = 13,
  stores = [],
  selectedStoreId = null,
  onSelectStore,
}: ArtisanInteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(initialCenter);
  const [zoom, setZoom] = useState<number>(defaultZoom);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCraft, setSelectedCraft] = useState<string>("all");
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCenterStart, setDragCenterStart] = useState<{ lat: number; lng: number } | null>(null);

  // Sync selectedStoreId prop with internal selection
  useEffect(() => {
    if (selectedStoreId) {
      const match = stores.find((s) => s.id === selectedStoreId);
      if (match) {
        setSelectedStore(match);
        setCenter(match.position);
      }
    }
  }, [selectedStoreId, stores]);

  // Measure container dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 800,
          height: containerRef.current.clientHeight || 600,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Filter stores based on search query and craft type
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch =
        !searchQuery.trim() ||
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCraft =
        selectedCraft === "all" ||
        store.craftTypes.some((c) => c.toLowerCase() === selectedCraft.toLowerCase());
      return matchesSearch && matchesCraft;
    });
  }, [stores, searchQuery, selectedCraft]);

  // Calculate visible tiles for OpenStreetMap
  const tiles = useMemo(() => {
    const { width, height } = containerSize;
    const centerWorldX = lngToX(center.lng, zoom);
    const centerWorldY = latToY(center.lat, zoom);

    const minX = Math.floor((centerWorldX - width / 2) / 256);
    const maxX = Math.floor((centerWorldX + width / 2) / 256);
    const minY = Math.floor((centerWorldY - height / 2) / 256);
    const maxY = Math.floor((centerWorldY + height / 2) / 256);

    const maxCoord = Math.pow(2, zoom);
    const list: Array<{ x: number; y: number; url: string; left: number; top: number }> = [];

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        if (y >= 0 && y < maxCoord) {
          const wrappedX = ((x % maxCoord) + maxCoord) % maxCoord;
          const left = width / 2 + (x * 256 - centerWorldX);
          const top = height / 2 + (y * 256 - centerWorldY);
          const subdomains = ["a", "b", "c"];
          const s = subdomains[Math.abs(x + y) % subdomains.length];
          list.push({
            x,
            y,
            url: `https://${s}.tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
            left,
            top,
          });
        }
      }
    }
    return list;
  }, [center, zoom, containerSize]);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragCenterStart(center);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !dragStart || !dragCenterStart) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      const startWorldX = lngToX(dragCenterStart.lng, zoom);
      const startWorldY = latToY(dragCenterStart.lat, zoom);

      const newWorldX = startWorldX - dx;
      const newWorldY = startWorldY - dy;

      setCenter({
        lng: xToLng(newWorldX, zoom),
        lat: yToLat(newWorldY, zoom),
      });
    },
    [isDragging, dragStart, dragCenterStart, zoom]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    setDragCenterStart(null);
  };

  // Zoom controls
  const zoomIn = () => setZoom((z) => Math.min(z + 1, 18));
  const zoomOut = () => setZoom((z) => Math.max(z - 1, 8));
  const resetCenter = () => {
    setCenter(initialCenter);
    setZoom(13);
  };

  const handleStoreClick = (store: StoreLocation) => {
    setSelectedStore(store);
    setCenter(store.position);
    onSelectStore?.(store);
  };

  return (
    <div className="w-full h-[600px] relative rounded-xl overflow-hidden shadow-xl border border-amber-200/80 bg-stone-100 flex flex-col select-none">
      {/* Top Search & Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm shadow-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search stores or crafts in Pune..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/95 backdrop-blur-sm border-amber-300 text-sm h-9"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
          {CRAFT_FILTERS.map((craft) => (
            <Button
              key={craft}
              size="sm"
              variant={selectedCraft === craft ? "default" : "secondary"}
              onClick={() => setSelectedCraft(craft)}
              className={`h-9 px-3 text-xs capitalize whitespace-nowrap shadow-sm ${
                selectedCraft === craft
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-amber-50"
              }`}
            >
              {craft}
            </Button>
          ))}
        </div>
      </div>

      {/* Map Viewport Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative flex-1 w-full h-full overflow-hidden ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* OpenStreetMap Tile Layer */}
        {tiles.map((tile) => (
          <img
            key={`${tile.x}-${tile.y}-${zoom}`}
            src={tile.url}
            alt=""
            draggable={false}
            className="absolute pointer-events-none transition-opacity duration-300"
            style={{
              left: `${tile.left}px`,
              top: `${tile.top}px`,
              width: "256px",
              height: "256px",
            }}
          />
        ))}

        {/* Store Markers Overlay */}
        {filteredStores.map((store) => {
          const { width, height } = containerSize;
          const storeX = width / 2 + (lngToX(store.position.lng, zoom) - lngToX(center.lng, zoom));
          const storeY = height / 2 + (latToY(store.position.lat, zoom) - latToY(center.lat, zoom));

          // Only render markers within/near container
          if (storeX < -60 || storeX > width + 60 || storeY < -60 || storeY > height + 60) {
            return null;
          }

          const isSelected = selectedStore?.id === store.id;

          return (
            <div
              key={store.id}
              onClick={(e) => {
                e.stopPropagation();
                handleStoreClick(store);
              }}
              style={{
                left: `${storeX}px`,
                top: `${storeY}px`,
                transform: "translate(-50%, -100%)",
              }}
              className="absolute z-20 cursor-pointer group transition-transform hover:scale-110"
            >
              {/* Pulsing ring for selected store */}
              {isSelected && (
                <span className="absolute -inset-2 rounded-full bg-orange-500/40 animate-ping" />
              )}

              {/* Pin Icon */}
              <div
                className={`relative flex items-center justify-center rounded-full p-2 shadow-lg transition-colors ${
                  isSelected
                    ? "bg-orange-600 text-white ring-4 ring-orange-200"
                    : "bg-white text-orange-600 hover:bg-orange-50 ring-2 ring-orange-400"
                }`}
              >
                <MapPin className="h-5 w-5" />
              </div>

              {/* Pin Tag Label */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 rounded bg-gray-900/80 text-[11px] text-white whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow">
                {store.name}
              </div>
            </div>
          );
        })}

        {/* Active Store Details Popup */}
        {selectedStore && (
          <div
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 animate-in fade-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="p-4 bg-white/98 backdrop-blur-md shadow-2xl border-amber-300">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{selectedStore.name}</h3>
                  <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-orange-500 shrink-0" />
                    {selectedStore.address}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStore(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 rounded hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                  {selectedStore.rating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">
                  ({selectedStore.userRatingsTotal || 120} reviews)
                </span>
                <div className="flex gap-1 ml-auto">
                  {selectedStore.craftTypes.map((c) => (
                    <Badge key={c} variant="outline" className="text-[10px] uppercase font-semibold text-orange-700 bg-orange-50">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 border-t pt-2 mb-3">
                {selectedStore.openingHours && (
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>{selectedStore.openingHours}</span>
                  </p>
                )}
                {selectedStore.contact && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <a href={`tel:${selectedStore.contact}`} className="hover:underline text-amber-700 font-medium">
                      {selectedStore.contact}
                    </a>
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs h-8"
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${selectedStore.position.lat},${selectedStore.position.lng}`,
                      "_blank"
                    );
                  }}
                >
                  <Navigation className="h-3.5 w-3.5 mr-1" />
                  Get Directions
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 border-gray-300"
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        selectedStore.name + " " + selectedStore.address
                      )}`,
                      "_blank"
                    );
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Map Control Buttons */}
        <div className="absolute right-3 top-16 z-20 flex flex-col gap-1.5">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/95 backdrop-blur-sm shadow hover:bg-amber-50"
            onClick={zoomIn}
            title="Zoom In"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/95 backdrop-blur-sm shadow hover:bg-amber-50"
            onClick={zoomOut}
            title="Zoom Out"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/95 backdrop-blur-sm shadow hover:bg-amber-50"
            onClick={resetCenter}
            title="Recenter to Pune"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Live Status and Attribution */}
        <div className="absolute bottom-1 right-2 z-10 text-[10px] text-gray-500 bg-white/80 px-2 py-0.5 rounded backdrop-blur-sm">
          <span>{filteredStores.length} artisan stores</span> •{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            © OpenStreetMap
          </a>
        </div>
      </div>
    </div>
  );
}
