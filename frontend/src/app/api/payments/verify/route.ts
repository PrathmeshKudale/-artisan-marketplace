import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, paymentId, signature } = body;
    const razorpaySecret =
      process.env.RAZORPAY_KEY_SECRET || process.env.razorpay_secret_key;

    if (!razorpaySecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Razorpay secret key",
        },
        { status: 500 }
      );
    }

    // Verify the payment signature
    const text = orderId + "|" + paymentId;
    const generated_signature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(text)
      .digest("hex");

    if (generated_signature === signature) {
      // Payment is successful
      return NextResponse.json({ 
        success: true,
        message: "Payment verified successfully"
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: "Payment verification failed" 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
