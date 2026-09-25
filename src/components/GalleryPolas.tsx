"use client";
import Image from "next/image";
import type { GalleryItem } from "@/lib/types";

const PLACEHOLDER = [
  { key: "les toiles", w: 210, h: 270 },
  { key: "l'ambiance", w: 300, h: 210 },
  { key: "Paint Cam", w: 210, h: 270 },
  { key: "cocktails", w: 280, h: 200 },
];

export default function GalleryPolas({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="polas" aria-hidden="true">
        {PLACEHOLDER.map((p) => (
          <div className="pola" key={p.key}><i style={{ width: p.w, height: p.h }}></i><span>{p.key}</span></div>
        ))}
      </div>
    );
  }
  return (
    <div className="polas">
      {items.map((it) => {
        const land = it.orientation === "landscape";
        const w = land ? 300 : 210, h = land ? 210 : 270;
        return (
          <div className="pola" key={it.id}>
            <i style={{ width: w, height: h }}>
              {it.media_type === "video" ? (
                <video src={it.media_url} muted loop playsInline autoPlay
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Image src={it.media_url} alt={it.caption ?? "Photo de l'atelier"} fill sizes="300px" style={{ objectFit: "cover" }} />
              )}
            </i>
            {it.caption && <span>{it.caption}</span>}
          </div>
        );
      })}
    </div>
  );
}
