import type { Metadata } from "next";
import { Gantari } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Load font Gantari dari Google Fonts
const gantari = Gantari({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800'],
});

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  title: "MyTradingReviews",
  description: "Independent rankings of 590+ regulated brokers worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      {/* Pasang class font Gantari langsung di tag body */}
      <body className={`${gantari.className} min-h-full flex flex-col`}>
        {children}

        {/* Google Analytics 4 — load script async via next/script.
            strategy="afterInteractive" = render page selesai dulu, baru load.
            Cuma load kalau env variable ada (skip di lokal dev kalau ga di-set). */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}