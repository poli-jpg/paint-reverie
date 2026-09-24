import type { Metadata } from "next";
import { Pinyon_Script, Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import "./paint.css";

const script = Pinyon_Script({ weight: "400", subsets: ["latin"], variable: "--font-script", display: "swap" });
const serif = Cormorant_Garamond({ weight: ["500", "600"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Jost({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "The Paint Reverie by Fatima",
  description: "Atelier de peinture créatif et mobile au Sénégal. Réservez votre place ou organisez votre atelier privé. PAINT ✦ CREATE ✦ DREAM.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${script.variable} ${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
