'use client';

// Only expose the public key on the client side
export const RAZORPAY_KEY_ID =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.razorpay_live_key || '';
