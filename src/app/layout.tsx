import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/sora";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { BuyerStateProvider } from "@/components/buyer-state";
import { InstallProvider } from "@/components/install-provider";
import { SellerStudioProvider } from "@/components/seller-studio-provider";
import { MarketplaceSignalsProvider } from "@/components/marketplace-signals-provider";

export const metadata: Metadata = {
  title: {
    default: "SOKOZA — Local fashion, clearly discovered",
    template: "%s · SOKOZA",
  },
  description:
    "Discover current fashion from Lusaka stores and prepare a clear order enquiry for WhatsApp.",
  applicationName: "SOKOZA",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icons/sokoza.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SOKOZA",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fcf9f8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <SellerStudioProvider>
          <MarketplaceSignalsProvider>
            <BuyerStateProvider>
              <InstallProvider>
                <AppShell>{children}</AppShell>
              </InstallProvider>
            </BuyerStateProvider>
          </MarketplaceSignalsProvider>
        </SellerStudioProvider>
      </body>
    </html>
  );
}
