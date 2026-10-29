"use client";

import { useState, useEffect } from 'react';
import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import { NewsletterFooter } from "@/components/footers/newsletter-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StoreLocator from '@/components/map/google-maps-store-locator';
import { BackButton } from "@/components/ui/back-button";
import { MapPin, Clock } from "lucide-react";
// If a LanguageContext isn't present in this repo, provide a tiny local stub so
// the page falls back to the default strings already present in the JSX.
const t = (_key: string) => undefined as string | undefined;

type Store = {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  address: string;
  rating: number;
  userRatingsTotal?: number;
  openingHours?: string;
  contact?: string;
  website?: string;
  craftTypes: string[];
  reviews?: Array<{ authorName?: string; rating?: number; text?: string; relativeTime?: string }>;
};

export default function NearbyStoresPage() {
  // use local stub `t` defined above; if you later add a LanguageContext, replace this.
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        console.log('Fetching stores...');
        const resp = await fetch(`/api/stores?city=pune&radiusKm=15`);
        console.log('Response status:', resp.status);
        const json = await resp.json();
        console.log('Response data:', json);
        
        if (!resp.ok) {
          // If the server returned structured details for Google Places, include them in the error
          const msgParts: string[] = [];
          if (json?.error) msgParts.push(json.error);
          if (json?.googleStatus) msgParts.push(`googleStatus=${json.googleStatus}`);
          if (json?.googleMessage) msgParts.push(`googleMessage=${json.googleMessage}`);
          if (json?.details) msgParts.push(`details=${JSON.stringify(json.details)}`);
          
          const errorMessage = msgParts.join(' | ') || 'Failed to load stores';
          console.error('Store loading error:', errorMessage);
          throw new Error(errorMessage);
        }

        if (!json.stores || json.stores.length === 0) {
          console.log('No stores returned from API');
        }
        
        setStores(json.stores || []);
      } catch (e: any) {
        // Store the full error message (including Google details when available) so UI can display it
        setError(e.message || 'Failed to load stores');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <AnimatedIndicatorNavbar />
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="container mx-auto py-4">
          <BackButton />
        </div>
        {/* Hero Section — simplified to surface the map immediately */}
        <section className="py-8">
          <div className="container mx-auto text-center">
            <Badge variant="outline" className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
              <Clock className="w-4 h-4 mr-2" />
              Nearby Stores
            </Badge>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Nearby Stores
            </h1>
            <div className="mb-2">
              <span className="text-xs text-gray-500">UI version: nearby-stores-v2 (updated 2025-10-31)</span>
            </div>

            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Discover authentic handcrafted treasures in your neighborhood. The map below shows real stores near Pune (client-side search enabled).
            </p>
          </div>
        </section>

        {/* Map + List */}
        <section className="py-8">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <StoreLocator
                initialCenter={{ lat: 18.5204, lng: 73.8567 }}
                zoom={13}
                stores={stores}
                onResults={(results) => setStores(results)}
              />
            </div>
            <div className="lg:col-span-2">
              <Card className="p-0 h-[600px] overflow-hidden">
                <CardHeader className="p-4 border-b bg-white/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg mb-0" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        {t('nearby.list.title') || 'Pune artisan stores'}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">{t('nearby.list.subtitle') || 'Real places from Google with reviews'}</CardDescription>
                    </div>
                    <div className="text-sm text-gray-500">{stores.length} shown</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-3 overflow-y-auto h-[520px]">
                  {loading && <p>Loading stores…</p>}
                  {error && (
                    <div className="text-sm text-red-600">
                      <p className="font-semibold">Error loading stores:</p>
                      <pre className="whitespace-pre-wrap text-xs mt-1">{error}</pre>
                    </div>
                  )}
                  {!loading && !error && stores.length === 0 && <p>No stores found.</p>}
                  {!loading && !error && stores.map((s) => (
                    <div key={s.id} className="border rounded-lg p-3 bg-white/80">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-left truncate">{s.name}</p>
                          <p className="text-sm text-gray-600 truncate">{s.address}</p>
                        </div>
                        <div className="text-right w-24 flex-shrink-0">
                          <p className="text-sm font-medium">⭐ {s.rating?.toFixed ? s.rating.toFixed(1) : s.rating}</p>
                          {!!s.userRatingsTotal && (
                            <p className="text-xs text-gray-500">{s.userRatingsTotal} reviews</p>
                          )}
                        </div>
                      </div>
                      {s.reviews && s.reviews.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold">Recent reviews</p>
                          {s.reviews.slice(0,2).map((r, i) => (
                            <p key={i} className="text-xs text-gray-700 truncate">“{(r.text || '').slice(0, 140)}{(r.text || '').length > 140 ? '…' : ''}”</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-orange-600 to-amber-600">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Be the First to Know
            </h2>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Get notified when the Nearby Stores feature launches. Join our community of craft enthusiasts today!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/80 focus:ring-2 focus:ring-white/50 focus:outline-none focus:bg-white/30"
              />
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8">
                Notify Me
              </Button>
            </div>

            <p className="text-sm text-white opacity-90 mt-4">
              We'll only send you updates about this feature. No spam, ever.
            </p>
          </div>
        </section>

        {/* Explore CTA */}
        <section className="py-12 bg-white">
          <div className="container mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Explore more handcrafted goods online
            </h3>
            <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
              <a href="/explore">Explore Online Marketplace</a>
            </Button>
          </div>
        </section>
      </div>

      <NewsletterFooter />
    </>
  );
}
