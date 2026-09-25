import { z } from "zod";

const text = (max = 120) => z.string().trim().min(1).max(max);
const phone = z.string().trim().regex(/^[+\d][\d\s().-]{6,19}$/, "Numéro invalide");

export const bookingSchema = z.object({
  workshopId: z.string().uuid(),
  firstName: text(),
  lastName: text(),
  phone,
  email: z.string().trim().toLowerCase().email().max(200),
  seats: z.coerce.number().int().min(1).max(10),
  notes: z.string().trim().max(1000).optional().default(""),
  website: z.string().max(0).optional(), // champ piège anti-bots (doit rester vide)
});

export const EVENT_TYPES = ["Anniversaire", "Événement privé", "Événement professionnel", "Team building", "Autre"] as const;

export const privateRequestSchema = z.object({
  firstName: text(),
  lastName: text(),
  phone,
  email: z.string().trim().toLowerCase().email().max(200),
  eventType: z.enum(EVENT_TYPES),
  desiredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  participants: z.coerce.number().int().min(1).max(1000).optional(),
  location: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  website: z.string().max(0).optional(),
});

export const workshopSchema = z.object({
  slug: z.string().trim().max(80).optional().default(""), // nettoyé/généré automatiquement côté serveur
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional().default(""),
  startsAt: z.string().min(1),
  location: z.string().trim().min(1).max(200),
  priceFcfa: z.coerce.number().int().min(0),
  capacity: z.coerce.number().int().min(1).max(500),
  imageUrl: z.string().trim().max(1000).optional().default(""),
  status: z.enum(["draft", "open", "closed"]),
});

export const requestStatusSchema = z.object({
  status: z.enum(["new", "contacted", "quoted", "done", "declined"]),
});

export const bookingStatusSchema = z.object({ status: z.enum(["pending", "confirmed", "cancelled"]) });

export const galleryCreateSchema = z.object({
  mediaUrl: z.string().trim().url(),
  mediaType: z.enum(["image", "video"]),
  caption: z.string().trim().max(200).optional().default(""),
  category: z.string().trim().max(60).optional().default(""),
  orientation: z.enum(["portrait", "landscape"]),
  sortOrder: z.coerce.number().int().default(0),
});

export const galleryUpdateSchema = z.object({ published: z.boolean() });

// "Fleurs en Pastel !" -> "fleurs-en-pastel"
export function slugify(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "atelier";
}

const FIELD_LABELS: Record<string, string> = {
  title: "Titre", slug: "Identifiant", startsAt: "Date et heure", location: "Lieu",
  priceFcfa: "Prix", capacity: "Capacité", imageUrl: "Photo", description: "Description", status: "Statut",
};

// Message lisible indiquant quels champs posent problème.
export function fieldErrors(error: z.ZodError) {
  const fields = [...new Set(error.issues.map((i) => FIELD_LABELS[String(i.path[0])] ?? String(i.path[0])))];
  return `Vérifie ce(s) champ(s) : ${fields.join(", ")}.`;
}
