"use client";

import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Package, Truck, CheckCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders } = useCart();

  return (
    <>
      <AnimatedIndicatorNavbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
                <p className="text-gray-500">Start exploring our artisan marketplace to place your first order!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white p-4 rounded shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">Order {order.id}</div>
                      <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Tracking ID: {order.trackingId}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{order.total.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm text-gray-700">Items:</div>
                    <ul className="mt-2 list-disc list-inside">
                      {order.items.map(it => (
                        <li key={String(it.id)} className="text-sm">{it.name} — Qty: {it.quantity} — ₹{it.price}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
