import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { ChordSheetToggle } from "@/components/ChordSheetToggle";
import { DevToggle } from "@/components/DevToggle";
import { RotatePrompt } from "@/components/RotatePrompt";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jazz Piano: from the first key to the session",
    template: "%s | Jazz Piano",
  },
  description:
    "Jazz piano from beginner to advanced: voicings in all twelve keys, ear training, reading with a band and improvising, spaced out into twenty minutes a day.",
};

// viewport-fit lets the page run under a notch in landscape, which is how a
// phone is held to play; the stylesheet pads the safe areas back in.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#14110f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <header className="site-header">
          <Link href="/" className="site-header__brand">
            Jazz Piano
          </Link>
          <nav className="site-header__nav">
            <Link href="/">Today</Link>
            <Link href="/path">Path</Link>
            <Link href="/tunes">Tunes</Link>
            <ChordSheetToggle />
            <DevToggle />
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          A prototype. Sound needs a click to start, and works best in Chrome or Edge.
        </footer>
        <RotatePrompt />
      </body>
    </html>
  );
}
