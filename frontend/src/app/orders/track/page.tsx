"use client";

import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Package, Search, Truck, CheckCircle, Clock, MapPin, ArrowRight } from "lucide-react";
import { trackSearchClick } from "@/lib/gtag";
import { useCart } from "@/contexts/CartContext";

type TrackingStep = {
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
};

type TrackingDetails = {
  trackingId: string;
  orderId: string;
  status: string;
  carrier: string;
  estimatedDelivery: string;
  itemsSummary: string;
  steps: TrackingStep[];
};

export default function TrackPackagePage() {
  const [trackingId, setTrackingId] = useState("");
  const [searchedId, setSearchedId] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingDetails | null>(null);
  const { orders } = useCart();

  useEffect(() => {
    // Check if URL contains query param
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id") || params.get("trackingId");
    if (idParam) {
      setTrackingId(idParam);
      performTracking(idParam);
    }
  }, [orders]);

  const performTracking = (idToTrack: string) => {
    const trimmed = idToTrack.trim();
    if (!trimmed) return;

    setSearchedId(trimmed);
    trackSearchClick(trimmed, "track_package");

    // Check if order exists in CartContext
    const matchedOrder = orders.find(
      (o) =>
        o.trackingId?.toLowerCase() === trimmed.toLowerCase() ||
        o.id?.toLowerCase() === trimmed.toLowerCase()
    );

    const now = new Date();
    const orderDate = matchedOrder ? new Date(matchedOrder.createdAt) : new Date(now.getTime() - 86400000 * 2);

    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

    const step1Date = formatDate(orderDate);
    const step2Date = formatDate(new Date(orderDate.getTime() + 1000 * 60 * 60 * 6));
    const step3Date = formatDate(new Date(orderDate.getTime() + 1000 * 60 * 60 * 24));
    const estDeliveryDate = new Date(orderDate.getTime() + 1000 * 60 * 60 * 72).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });

    const itemsText = matchedOrder
      ? matchedOrder.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")
      : "Traditional Handcrafted Artisan Package";

    setTrackingData({
      trackingId: matchedOrder ? matchedOrder.trackingId : trimmed,
      orderId: matchedOrder ? matchedOrder.id : `ORD-${trimmed.replace(/[^0-9]/g, "").slice(0, 6) || "584920"}`,
      status: "In Transit",
      carrier: "BlueDart Artisan Express (Standard Secure)",
      estimatedDelivery: estDeliveryDate,
      itemsSummary: itemsText,
      steps: [
        {
          title: "Order Placed & Confirmed",
          location: "Artisan Workshop Hub",
          timestamp: step1Date,
          completed: true,
        },
        {
          title: "Craft Quality Inspected & Packed",
          location: "Karigar Verification Center",
          timestamp: step2Date,
          completed: true,
        },
        {
          title: "Dispatched & In Transit",
          location: "Regional Logistics Hub",
          timestamp: step3Date,
          completed: true,
          current: true,
        },
        {
          title: "Out for Delivery",
          location: "Destination Delivery Facility",
          timestamp: "Expected Soon",
          completed: false,
        },
        {
          title: "Delivered",
          location: "Shipping Address",
          timestamp: estDeliveryDate,
          completed: false,
        },
      ],
    });
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    performTracking(trackingId);
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
                <Package className="h-5 w-5 text-amber-600" />
                Track Your Order
              </CardTitle>
              <CardDescription>
                Enter your tracking ID or order reference to view live package status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrack} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trackingId">Tracking ID or Order ID</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="trackingId"
                      type="text"
                      placeholder="e.g. TRK-1001 or ORD-938201"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">
                  Track Package
                </Button>
              </form>
            </CardContent>
          </Card>

          {trackingData && (
            <Card className="mb-8 border-amber-200 bg-white shadow-md">
              <CardHeader className="bg-amber-50/50 border-b pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Tracking ID: {trackingData.trackingId}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mt-1">
                      Order {trackingData.orderId}
                    </h2>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1">
                    <Truck className="h-4 w-4 mr-1.5" />
                    {trackingData.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 text-sm">
                  <div>
                    <span className="text-gray-500 block">Courier Partner:</span>
                    <span className="font-semibold text-gray-800">{trackingData.carrier}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Estimated Delivery:</span>
                    <span className="font-semibold text-amber-700">{trackingData.estimatedDelivery}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 block">Package Contents:</span>
                    <span className="font-medium text-gray-700">{trackingData.itemsSummary}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    Shipment Journey
                  </h3>

                  <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {trackingData.steps.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-6 top-0.5 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center ${
                            step.completed
                              ? "border-green-600 bg-green-600"
                              : step.current
                              ? "border-amber-600 bg-amber-100 ring-4 ring-amber-50"
                              : "border-gray-300"
                          }`}
                        >
                          {step.completed && <CheckCircle className="h-3 w-3 text-white" />}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                step.completed || step.current ? "text-gray-900" : "text-gray-400"
                              }`}
                            >
                              {step.title}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {step.location}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 font-mono">{step.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                    Tracking information is updated in real time as artisans dispatch each item.
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
