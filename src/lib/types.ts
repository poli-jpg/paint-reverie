export type Workshop = {
  id: string; slug: string; title: string; description: string | null;
  starts_at: string; location: string; price_fcfa: number; capacity: number;
  image_url: string | null; status: "open" | "closed"; seats_left: number;
  image_pos_x?: number; image_pos_y?: number; image_zoom?: number; image_size?: "sm" | "md" | "lg";
};
export type GalleryItem = {
  id: string; media_url: string; media_type: "image" | "video";
  caption: string | null; orientation: "portrait" | "landscape";
};
export type Contact = { whatsapp: string; email: string; instagram: string; tiktok: string; snapchat: string };

// Acompte demandé par place pour valider une réservation (FCFA).
export const DEPOSIT_FCFA = 7000;

// Numéros pour le paiement de l'acompte (affichés dans le message WhatsApp envoyé par Fatima).
export const WAVE_NUMBER = "763966507";
export const ORANGE_MONEY_NUMBER = "768178529";

// "mercredi 30 septembre" -> "Mercredi 30 septembre" ; 17:00 -> "17h", 17:30 -> "17h30"
export const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;
export function dayLabel(iso: string) {
  const s = new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Dakar" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
export function hourLabel(iso: string) {
  const [h, m] = new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Dakar" }).split(":");
  return `${Number(h)}h${m === "00" ? "" : m}`;
}

// Réglages de la photo d'accueil (enregistrés dans site_settings, clé "hero").
export type HeroSettings = {
  image_url: string;
  pos_x?: number;   // 0–100 : partie visible horizontalement
  pos_y?: number;   // 0–100 : partie visible verticalement
  zoom?: number;    // 1 = normal, jusqu'à 2.5
  size?: "sm" | "md" | "lg"; // taille du cadre
};
