import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // In a real integration you would forward the token to your payment gateway here.
    // For now we just log and return success for TEST mode front-end integration.
    console.log("Received Google Pay payment token (mock):", body?.token ? "<token>" : body);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error processing Google Pay token:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
