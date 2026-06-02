import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Print Service",
  description: "Online printing platform",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
      
        className="min-h-full"
        style={{
          margin: 0,
          background: "#f5f7fb",
          fontFamily: "Arial, sans-serif",
          
        }}
        
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
          {children}
        </div>

        <Script
  src="https://checkout.razorpay.com/v1/checkout.js"
  strategy="beforeInteractive"
/>
      </body>
    </html>
  );
}