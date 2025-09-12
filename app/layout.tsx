import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import GlobalErrorHandler from "@/components/GlobalErrorHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Sequatic - Query your data with Natural Language",
  description: "Experience the future of SQL with Sequatic's in-browser playground",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${playfairDisplay.variable} antialiased`}
      >
        <GlobalErrorHandler />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
