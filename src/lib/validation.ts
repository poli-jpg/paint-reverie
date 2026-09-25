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
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/, "Lettres minuscules, chiffres et tirets uniquement"),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional().default(""),
  startsAt: z.string().min(1),
  location: z.string().trim().min(1).max(200),
  priceFcfa: z.coerce.number().int().min(0),
  capacity: z.coerce.number().int().min(1).max(500),
  imageUrl: z.string().trim().max(500).optional().default(""),
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
