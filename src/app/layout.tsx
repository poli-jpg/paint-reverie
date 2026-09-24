import type { Metadata } from "next";
import "./globals.css";
import "./paint.css";

export const metadata: Metadata = {
  title: "The Paint Reverie by Fatima",
  description: "Atelier de peinture cr\u00e9atif et mobile au S\u00e9n\u00e9gal. R\u00e9servez votre place ou organisez votre atelier priv\u00e9.",
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