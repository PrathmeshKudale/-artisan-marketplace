"use client";

import React, { useState, type ChangeEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import RazorpayGPayButton from "@/components/ui/razorpay-gpay-button";
import { NewsletterFooter } from "@/components/footers/newsletter-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { ShoppingCart, ArrowRight, CreditCard, Gift, Shield } from "lucide-react";

export default function CartClient() {
  const { cartItems, updateQuantity, removeFromCart, cartCount, clearCart, placeOrder } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [promoCode, setPromoCode] = useState("");
  const [autoStartPayment, setAutoStartPayment] = useState(false);
  const [codAddress, setCodAddress] = useState({ name: '', phone: '', line1: '', city: '', state: '', pincode: '' });
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const buyNow = searchParams.get('buyNow');
      if (buyNow) {
        // Ensure we're on the online payment path and auto-start the Razorpay flow
        setPaymentMethod('online');
        setAutoStartPayment(true);
      }
    } catch {}
  }, [searchParams]);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 10000 ? 0 : 199;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const applyPromoCode = () => {
    if (promoCode === "ARTISAN20") {
      alert("Promo applied: 20% (demo)");
    } else if (promoCode !== "") {
      alert("Promo code not recognized");
    }
  };

  const onPromoChange = (e: ChangeEvent<HTMLInputElement>) => setPromoCode(e.target.value);
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const sendOrderConfirmationEmail = async ({
    orderId,
    trackingId,
    paymentMethod,
    address,
  }: {
    orderId: string;
    trackingId: string;
    paymentMethod: "online" | "cod";
    address?: {
      name: string;
      phone: string;
      line1: string;
      city: string;
      state: string;
      pincode: string;
    } | null;
  }) => {
    if (!user?.email) return;

    try {
      await fetch(`${backendBase}/orders/confirmation-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: user.email,
          customerName: address?.name || user.name || "Customer",
          orderId,
          trackingId,
          paymentMethod,
          total,
          items: cartItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          address,
        }),
      });
    } catch (error) {
      console.error("Failed to send order confirmation email:", error);
    }
  };

  const finalizeOrder = async (method: "online" | "cod", address?: typeof codAddress | null) => {
    const trackingId = `TRK${Date.now().toString().slice(-8)}`;
    const order = placeOrder({
      items: cartItems,
      total,
      paymentMethod: method,
      address: address ? { ...address } : null,
      trackingId,
    });

    await sendOrderConfirmationEmail({
      orderId: order.id,
      trackingId: order.trackingId,
      paymentMethod: method,
      address: order.address || null,
    });

    clearCart();
    window.location.href = "/orders";
  };

  if (cartItems.length === 0) {
    return (
      <>
        <AnimatedIndicatorNavbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <ShoppingCart className="w-24 h-24 mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold mb-2">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Browse handcrafted items and add them to your cart.</p>
            <Button asChild>
              <a href="/explore" className="flex items-center gap-2">Start Shopping <ArrowRight className="w-4 h-4" /></a>
            </Button>
          </div>
        </div>
        <NewsletterFooter />
      </>
    );
  }

  return (
    <>
      <AnimatedIndicatorNavbar />

      <main className="container mx-auto py-10">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl font-bold">Shopping Cart ({cartCount})</h1>

            {cartItems.map((item) => (
              <div key={String(item.id)} className="flex items-center gap-4 p-4 border rounded">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-500">by {item.artist}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{item.price.toLocaleString()}</div>
                      <div className="text-sm">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</Button>
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                    <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.id)}>Remove</Button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <aside className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="mb-2">Subtotal: <strong>₹{subtotal.toLocaleString()}</strong></div>
            <div className="mb-2">Shipping: <strong>{shipping === 0 ? 'FREE' : `₹${shipping}`}</strong></div>
            <div className="mb-4">Tax: <strong>₹{tax.toLocaleString()}</strong></div>
            <hr className="my-4" />
            <div className="mb-4 text-lg">Total: <strong>₹{total.toLocaleString()}</strong></div>

            <div className="mb-4">
              <Input placeholder="Promo code" value={promoCode} onChange={onPromoChange} />
              <div className="mt-2">
                <Button size="sm" onClick={applyPromoCode}>Apply</Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className={`p-3 border rounded cursor-pointer ${paymentMethod === 'online' ? 'bg-orange-50 border-orange-400' : 'border-gray-200'}`} onClick={() => setPaymentMethod('online')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> <span>Pay Online</span></div>
                    <Badge variant="outline">Secure</Badge>
                  </div>
                  {paymentMethod === 'online' && (
                    <div className="mt-3">
                      <RazorpayGPayButton
                        amount={total}
                            autoStart={autoStartPayment}
                        onSuccess={async (res) => {
                          alert('Payment successful (demo)');
                          await finalizeOrder('online', null);
                        }}
                        onError={(err) => {
                          console.error('Payment error', err);
                          alert('Payment failed');
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className={`p-3 border rounded cursor-pointer ${paymentMethod === 'cod' ? 'bg-orange-50 border-orange-400' : 'border-gray-200'}`} onClick={() => setPaymentMethod('cod')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Gift className="w-5 h-5" /> <span>Cash on Delivery</span></div>
                    <Badge variant="outline">₹50 Extra</Badge>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="mt-3 space-y-3">
                      <div className="space-y-2">
                        <input className="w-full border rounded px-3 py-2" placeholder="Full name" value={codAddress.name} onChange={(e) => setCodAddress(prev => ({ ...prev, name: e.target.value }))} />
                        <input className="w-full border rounded px-3 py-2" placeholder="Phone" value={codAddress.phone} onChange={(e) => setCodAddress(prev => ({ ...prev, phone: e.target.value }))} />
                        <input className="w-full border rounded px-3 py-2" placeholder="Address line" value={codAddress.line1} onChange={(e) => setCodAddress(prev => ({ ...prev, line1: e.target.value }))} />
                        <div className="grid grid-cols-3 gap-2">
                          <input className="border rounded px-3 py-2 col-span-2" placeholder="City" value={codAddress.city} onChange={(e) => setCodAddress(prev => ({ ...prev, city: e.target.value }))} />
                          <input className="border rounded px-3 py-2" placeholder="Pincode" value={codAddress.pincode} onChange={(e) => setCodAddress(prev => ({ ...prev, pincode: e.target.value }))} />
                        </div>
                        <input className="w-full border rounded px-3 py-2" placeholder="State" value={codAddress.state} onChange={(e) => setCodAddress(prev => ({ ...prev, state: e.target.value }))} />
                      </div>
                      <Button className="w-full bg-orange-600 text-white" onClick={() => {
                        // basic validation
                        if (!codAddress.name || !codAddress.phone || !codAddress.line1) {
                          alert('Please provide name, phone and address');
                          return;
                        }
                        void finalizeOrder('cod', codAddress);
                      }}>Place Order (Cash on Delivery)</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600 flex items-center gap-2"><Shield className="w-4 h-4" /> Your payment information is secure</div>
          </aside>
        </div>
      </main>

      <NewsletterFooter />
    </>
  );
}
