"use client";

import React, { useEffect, useRef, useState } from "react";

const RAZORPAY_KEY_ID =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.razorpay_live_key || "";

interface RazorpayGPayButtonProps {
  amount: number; // amount in rupees
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  autoStart?: boolean;
}

export default function RazorpayGPayButton({ amount, onSuccess, onError, autoStart }: RazorpayGPayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!RAZORPAY_KEY_ID) {
        throw new Error("Missing Razorpay public key");
      }

      // 1. Create order on our backend
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const { orderId } = await orderResponse.json();

      // 2. Initialize Razorpay payment
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount * 100, // Convert to paise
        currency: "INR",
        name: "Artisan Marketplace",
        description: "Payment for your order",
        order_id: orderId,
        prefill: {
          name: "", // Can be populated from user context if available
          email: "",
          contact: ""
        },
        readonly: {
          email: true,
          contact: true
        },
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.success) {
              onSuccess?.(response);
            } else {
              throw new Error(verifyResult.error || 'Payment verification failed');
            }
          } catch (err: any) {
            console.error('Payment verification error:', err);
            setError(err.message || 'Payment verification failed');
            onError?.(err);
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpayScript = document.createElement('script');
      razorpayScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
      razorpayScript.async = true;
      razorpayScript.onload = () => {
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      };
      document.body.appendChild(razorpayScript);

    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setError(err.message || 'Failed to initialize payment');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-start payment when requested (useful for Buy Now -> checkout flow)
  useEffect(() => {
    if (autoStart) {
      // Kick off payment asynchronously without blocking render
      initializePayment();
    }
  }, [autoStart]);

  return (
    <div>
      <button
        onClick={initializePayment}
        disabled={loading}
        className="flex items-center justify-center w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay with Google Pay'}
      </button>
      {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
    </div>
  );
}
