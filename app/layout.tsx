import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ServiceWorkerRegistrar from "./components/ServiceWorkerRegistrar";
import { metadata as siteMetadata } from "./metadata";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({ 
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = siteMetadata;

type RootLayoutProps = {
  children: React.ReactNode;
};

import { ParticleBackground } from "./components/ui/ParticleBackground";

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body id="top" className="antialiased bg-navy-50 text-navy-900 font-body">
        <ParticleBackground />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}

