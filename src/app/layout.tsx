import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jazz Piano: start with the sound",
    template: "%s | Jazz Piano",
  },
  description:
    "A beginner jazz piano site that plays you a two hand ii-V-I vamp first, then takes it apart one lesson at a time. Watch the keys light up, then play them back.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <header className="site-header">
          <Link href="/" className="site-header__brand">
            Jazz Piano
          </Link>
          <span className="site-header__note">One piece, unpacked</span>
        </header>
        {children}
        <footer className="site-footer">
          A prototype. Sound needs a click to start, and works best in Chrome or Edge.
        </footer>
      </body>
    </html>
  );
}
