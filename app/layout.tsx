import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-tech",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IONZ — Engineered to Perform",
  description:
    "A technical demonstration: cinematic PC hardware presentation and an intelligent component compatibility configurator.",
};

export const viewport: Viewport = {
  themeColor: "#08090a",
};

/**
 * Root layout stays a Server Component (brief 7.1).
 * Only SmoothScrollProvider crosses the client boundary, so the global Lenis
 * instance is created exactly once for the whole application.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
