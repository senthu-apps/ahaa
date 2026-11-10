import type { Metadata, Viewport } from "next";
import { Host_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Weavers — AI automation, agents and custom software, on retainer",
  description:
    "AI Weavers ties your apps, data and people together, then builds and runs the automated workflows, AI agents and custom software your business needs.",
};

export const viewport: Viewport = {
  themeColor: "#f6f6f7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${hostGrotesk.variable} ${martianMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Hide intro elements before first paint so the GSAP sequence starts clean. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-intro')",
          }}
        />
      </head>
      <body className="min-h-full overflow-x-clip">{children}</body>
    </html>
  );
}
