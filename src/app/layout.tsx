import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/sora";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { BuyerStateProvider } from "@/components/buyer-state";
import { InstallProvider } from "@/components/install-provider";
import { SellerStudioProvider } from "@/components/seller-studio-provider";
import { MarketplaceSignalsProvider } from "@/components/marketplace-signals-provider";
import { absoluteUrl, safeJsonLd, SITE_URL } from "@/lib/site";

const siteDescription = "Discover current fashion from independent Zambian stores and prepare a clear order enquiry for WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SOKOZA — Local fashion, clearly discovered",
    template: "%s · SOKOZA",
  },
  description: siteDescription,
  applicationName: "SOKOZA",
  keywords: ["Zambian fashion", "Lusaka fashion", "local clothing stores", "independent fashion", "SOKOZA"],
  openGraph: {
    type: "website",
    locale: "en_ZM",
    siteName: "SOKOZA",
    title: "SOKOZA — Local fashion, clearly discovered",
    description: siteDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOKOZA — Local fashion, clearly discovered",
    description: siteDescription,
  },
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
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "SOKOZA",
        url: SITE_URL,
        logo: absoluteUrl("/icons/sokoza.svg"),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "SOKOZA",
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${absoluteUrl("/discover")}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <noscript>
          <iframe
            height="0"
            src="https://www.googletagmanager.com/ns.html?id=GTM-TXZ7JHR8"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
            width="0"
          />
        </noscript>
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TXZ7JHR8');`}
        </Script>
        <Script id="microsoft-clarity" strategy="beforeInteractive">
          {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","y0cihlu4ge");`}
        </Script>
        <script
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}
          type="application/ld+json"
        />
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
