import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Providers} from "./providers"

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "DrawBoard - Collaborative Whiteboard",
  description: "Create, collaborate, and share your ideas with DrawBoard. A powerful online whiteboard and drawing tool for teams, students, and creators.",
  keywords: "whiteboard, drawing, collaboration, online drawing, digital whiteboard, team collaboration, sketching",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: '/whiteboard-icon.svg',
  },
  openGraph: {
    title: "DrawBoard - Collaborative Whiteboard",
    description: "Create, collaborate, and share your ideas with DrawBoard. A powerful online whiteboard and drawing tool.",
    type: "website",
    url: "https://sketchhub.fly.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "DrawBoard - Collaborative Whiteboard",
    description: "Create, collaborate, and share your ideas with DrawBoard. A powerful online whiteboard and drawing tool.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/whiteboard-icon.svg" />
        <meta name="theme-color" content="#3B63F0" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
