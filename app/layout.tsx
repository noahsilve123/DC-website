import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ServiceWorkerRegistrar from "./components/ServiceWorkerRegistrar";
import { metadata as siteMetadata } from "./metadata";

export const metadata: Metadata = siteMetadata;

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body id="top" className="antialiased bg-white text-gray-900">
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

