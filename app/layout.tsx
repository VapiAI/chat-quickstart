import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "Vapi Chat Demo | Professional Voice AI Assistant Interface",
    template: "%s | Vapi AI",
  },
  description:
    "Experience the future of conversational AI with Vapi's professional chat demo. Built with Next.js and the latest AI SDK for seamless voice assistant interactions.",
  keywords: [
    "Vapi",
    "Voice AI assistant",
    "conversational AI",
    "voice chat",
    "AI chatbot",
    "voice interface",
    "AI SDK",
    "Next.js",
    "real-time chat",
    "voice technology",
  ],
  authors: [{ name: "Vapi AI", url: "https://vapi.ai" }],
  creator: "Vapi AI",
  publisher: "Vapi AI",
  category: "Technology",
  metadataBase: new URL("https://chat.vapi.ai"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chat.vapi.ai",
    siteName: "Vapi Chat Demo",
    title: "Vapi Chat Demo | Professional Voice AI Assistant Interface",
    description:
      "Experience the future of conversational AI with Vapi's professional chat demo. Built with Next.js and the latest AI SDK for seamless voice assistant interactions.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@vapi_ai",
    creator: "@vapi_ai",
    title: "Vapi Chat Demo | Professional Voice AI Assistant Interface",
    description:
      "Experience the future of conversational AI with Vapi's professional chat demo.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/site.webmanifest",
  other: {
    "msapplication-TileColor": "#000000",
    "theme-color": "#ffffff",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://api.vapi.ai" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Vapi Chat" />
      </head>
      <body
        className={`font-sans antialiased bg-background text-foreground selection:bg-primary/20`}
        suppressHydrationWarning
      >
        <div className="relative flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
