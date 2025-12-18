import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pluely - Your Invisible AI Assistant",
  description:
    "The privacy-first AI assistant that operates with complete stealth during meetings, interviews, and presentations. Built with Tauri and Rust for blazing-fast performance.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`font-sans antialiased bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
