import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Geist({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "QuickClip – YouTube Summarizer for Students",
  description:
    "Paste a YouTube URL and get an AI-generated structured summary, key points, timestamps, and quiz. Perfect for students and researchers.",
  keywords: ["YouTube summarizer", "AI notes", "study tool", "transcript summary"],
  openGraph: {
    title: "QuickClip – YouTube Summarizer",
    description: "Turn any YouTube video into structured study notes in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#2d2d2d",
                color: "#ff453a",
                border: "1px solid #444444",
                borderRadius: "8px",
              },
              success: {
                iconTheme: { primary: "#22c55e", secondary: "#212121" },
              },
              error: {
                iconTheme: { primary: "#ff453a", secondary: "#212121" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
