import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LexVault - Sovereign AI for Swiss Legal Firms",
  description: "Private RAG infrastructure that never leaves Swiss jurisdiction. Intelligent legal document search powered by AI.",
  keywords: ["legal tech", "document search", "Swiss law", "AI", "RAG", "legal documents"],
  authors: [{ name: "LexVault" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
