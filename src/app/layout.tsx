import type { Metadata } from "next";
import "./globals.css";
import "./paint.css";

export const metadata: Metadata = {
  title: "The Paint Reverie by Fatima",
  description: "Atelier de peinture créatif et mobile au Sénégal. Réservez votre place ou organisez votre atelier privé.",
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
