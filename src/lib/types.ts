export type Workshop = {
  id: string; slug: string; title: string; description: string | null;
  starts_at: string; location: string; price_fcfa: number; capacity: number;
  image_url: string | null; status: "open" | "closed"; seats_left: number;
};
export type GalleryItem = {
  id: string; media_url: string; media_type: "image" | "video";
  caption: string | null; orientation: "portrait" | "landscape";
};
export type Contact = { whatsapp: string; instagram: string; tiktok: string; snapchat: string };
