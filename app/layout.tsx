import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display_SC } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const playfair = Playfair_Display_SC({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AI Visibility Prototype | Featherstone Intelligence",
  description:
    "See how AI already talks about your brand. Run a free GEO visibility check for your winery or hospitality business.",
  generator: "v0.app",
  metadataBase: new URL("https://v0-ai-visibility-prototype.vercel.app"),
  openGraph: {
    title: "AI Visibility Prototype | Featherstone Intelligence",
    description:
      "See how AI already talks about your brand. Run a free GEO visibility check for your winery or hospitality business.",
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
    title: "AI Visibility Prototype | Featherstone Intelligence",
    description:
      "See how AI already talks about your brand. Run a free GEO visibility check for your winery or hospitality business.",
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
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <Navigation />
        <main className="pt-16">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
