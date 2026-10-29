import type { Metadata } from "next";
import { Suspense } from "react";
import { Rajdhani } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "sonner";
import AiChatbotWidget from "@/components/ui/ai-chatbot-widget";
import GoogleAnalyticsPageTracker from "@/components/GoogleAnalytics";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Artisan Marketplace",
  description: "Discover and shop handcrafted artworks from artisans across India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rajdhani.variable} antialiased`}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
          `}
        </Script>
        <ErrorReporter />
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <GoogleAnalyticsPageTracker />
            </Suspense>
            {children}
            <Toaster position="top-right" richColors closeButton />
            <AiChatbotWidget />
          </CartProvider>
        </AuthProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
