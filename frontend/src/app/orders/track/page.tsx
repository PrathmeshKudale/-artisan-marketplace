"use client";

import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Search, Truck, CheckCircle, Clock } from "lucide-react";
import { trackSearchClick } from "@/lib/gtag";

export default function TrackPackagePage() {
  const [trackingId, setTrackingId] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    trackSearchClick(trackingId, "track_package");
    // TODO: Implement actual tracking logic
    console.log("Tracking package:", trackingId);
  };

  return (
    <>
      <AnimatedIndicatorNavbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Track Package</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Track Your Order
              </CardTitle>
              <CardDescription>
                Enter your tracking ID to get real-time updates on your package.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrack} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trackingId">Tracking ID</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="trackingId"
                      type="text"
                      placeholder="Enter your tracking ID"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Track Package
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Find Your Tracking ID</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Order Confirmation Email</h3>
                  <p className="text-sm text-muted-foreground">
                    Check your email for the order confirmation containing your tracking ID.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Order History</h3>
                  <p className="text-sm text-muted-foreground">
                    Visit your order history to find tracking information for all orders.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Processing Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Tracking information may take 24-48 hours to appear after order placement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
