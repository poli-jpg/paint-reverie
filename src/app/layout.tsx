import type { Metadata } from "next";
import "./globals.css";
import "./paint.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://paint-reverie.vercel.app";
const TITLE = "The Paint Reverie by Fatima";
const DESCRIPTION = "Atelier de peinture créatif et mobile au Sénégal. Réservez votre place ou organisez votre atelier privé.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "The Paint Reverie",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Jost:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
