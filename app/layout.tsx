import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Featherstone Intelligence | AI Visibility for Wine Country",
  description:
    "Invisible Intelligence. Unforgettable Hospitality. We help premium wineries become the answer when AI recommends where to go next.",
  generator: "v0.app",
  metadataBase: new URL("https://v0-ai-visibility-prototype.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Featherstone Intelligence | AI Visibility for Wine Country",
    description:
      "Invisible Intelligence. Unforgettable Hospitality. We help premium wineries become the answer when AI recommends where to go next.",
    url: "https://v0-ai-visibility-prototype.vercel.app",
    siteName: "Featherstone Intelligence",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 1200,
        alt: "Featherstone Intelligence Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Featherstone Intelligence | AI Visibility for Wine Country",
    description:
      "Invisible Intelligence. Unforgettable Hospitality. We help premium wineries become the answer when AI recommends where to go next.",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-[#FAF8F5]`}>
        <Navigation />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
