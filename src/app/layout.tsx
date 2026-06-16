import type { Metadata } from "next";
import { Figtree, Outfit, Geist } from "next/font/google";
import StoreChrome from "@/components/layouts/StoreChrome";
import StoreTopBarServer from "@/components/features/StoreTopBarServer";
import { StoreSettingsProvider } from "@/context/StoreSettingsContext";
import {
  fetchPublicNavLinks,
  fetchPublicStoreSettings,
} from "@/lib/store-settings-queries";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [storeSettings, navLinks] = await Promise.all([
    fetchPublicStoreSettings(),
    fetchPublicNavLinks(),
  ]);

  return (
    <html
      lang="es"
      className={cn("h-full", "antialiased", figtree.variable, outfit.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col font-body">
        <StoreSettingsProvider whatsappNumber={storeSettings.whatsapp_number}>
          <StoreChrome
            topBar={<StoreTopBarServer />}
            navLinks={navLinks}
          >
            {children}
          </StoreChrome>
        </StoreSettingsProvider>
      </body>

    </html>
  );
}
