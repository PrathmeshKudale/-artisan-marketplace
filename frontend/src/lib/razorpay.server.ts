import Razorpay from "razorpay";

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.razorpay_live_key;
  const keySecret =
    process.env.RAZORPAY_KEY_SECRET || process.env.razorpay_secret_key;

  if (!keyId || !keySecret) {
    throw new Error("Missing Razorpay server credentials in environment");
  }

  return { keyId, keySecret };
}

export function getRazorpayClient() {
  const { keyId, keySecret } = getRazorpayCredentials();

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}
