import type { Metadata } from "next";
import { Figtree, Outfit, Geist } from "next/font/google";
import Navbar from "@/components/features/Navbar";
import CartDrawer from "@/components/features/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RUQLA",
  description: "Plataforma de e-commerce RUQLA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn("h-full", "antialiased", figtree.variable, outfit.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col font-body">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">
            {children}
          </main>
        </CartProvider>
      </body>

    </html>
  );
}


