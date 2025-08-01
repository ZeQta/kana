import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CloakedChat - AI Assistant",
  description: "A powerful AI chatbot powered by the Horizon Alpha model with advanced features like artifacts, multimodal input, and conversation history.",
  keywords: ["AI", "chatbot", "assistant", "Horizon Alpha", "OpenRouter", "artifacts", "multimodal"],
  authors: [{ name: "CloakedChat Team" }],
  creator: "CloakedChat",
  publisher: "CloakedChat",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cloaked-chat.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "CloakedChat - AI Assistant",
    description: "A powerful AI chatbot powered by the Horizon Alpha model with advanced features like artifacts, multimodal input, and conversation history.",
    url: 'https://cloaked-chat.vercel.app',
    siteName: 'CloakedChat',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CloakedChat - AI Assistant',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CloakedChat - AI Assistant',
    description: 'A powerful AI chatbot powered by the Horizon Alpha model with advanced features like artifacts, multimodal input, and conversation history.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#1f2937',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CloakedChat',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="CloakedChat" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CloakedChat" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#1f2937" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#1f2937" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://cloaked-chat.vercel.app" />
        <meta name="twitter:title" content="CloakedChat - AI Assistant" />
        <meta name="twitter:description" content="A powerful AI chatbot powered by the Horizon Alpha model with advanced features like artifacts, multimodal input, and conversation history." />
        <meta name="twitter:image" content="https://cloaked-chat.vercel.app/og-image.png" />
        <meta name="twitter:creator" content="@cloakedchat" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CloakedChat - AI Assistant" />
        <meta property="og:description" content="A powerful AI chatbot powered by the Horizon Alpha model with advanced features like artifacts, multimodal input, and conversation history." />
        <meta property="og:site_name" content="CloakedChat" />
        <meta property="og:url" content="https://cloaked-chat.vercel.app" />
        <meta property="og:image" content="https://cloaked-chat.vercel.app/og-image.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
