import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. On importe le composant Toaster
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Magic Testimonials", // Tu peux changer le titre ici ;)
  description: "Importez vos avis Google Maps en un clic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr" // Passé en français
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* 2. On ajoute le Toaster ici pour qu'il soit au-dessus de tout */}
        <Toaster 
          position="bottom-right" 
          theme="dark" 
          richColors 
          closeButton
        />
      </body>
    </html>
  );
}