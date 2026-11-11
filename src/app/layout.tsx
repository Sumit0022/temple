import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import { CartProvider } from "@/lib/cart-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Shri Ram Janmabhoomi & Mahadev Mandir | Official Portal",
  description:
    "Official digital temple portal for Shri Ram Janmabhoomi & Mahadev Mandir, Ayodhya Dham. Online Donations with 80G Receipts, Consecrated Prasad Store, Vedic Seva & Puja Bookings, and Daily Darshan Schedule.",
  keywords: [
    "Temple Management System",
    "Mandir Online Donation",
    "Ayodhya Ram Mandir Prasad",
    "Shri Ram Mandir Seva Booking",
    "Rudrabhishek Booking",
    "80G Donation Receipt",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased bg-[#FDFBF7] text-[#1E293B]">
        <LanguageProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
