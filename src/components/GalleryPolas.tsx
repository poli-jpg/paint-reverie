"use client";
import Image from "next/image";
import { useState } from "react";
import type { GalleryItem } from "@/lib/types";

const PLACEHOLDER = [
  { key: "les toiles", w: 210, h: 270 },
  { key: "l'ambiance", w: 300, h: 210 },
  { key: "Paint Cam", w: 210, h: 270 },
  { key: "cocktails", w: 280, h: 200 },
];

// Nombre de photos affichées au départ, puis ajoutées à chaque clic sur « Voir plus ».
const STEP = 8;

export default function GalleryPolas({ items }: { items: GalleryItem[] }) {
  const [count, setCount] = useState(STEP);
  if (items.length === 0) {
    return (
      <div className="polas" aria-hidden="true">
        {PLACEHOLDER.map((p) => (
          <div className="pola" key={p.key}><i style={{ width: p.w, height: p.h }}></i><span>{p.key}</span></div>
        ))}
      </div>
    );
  }
  const shown = items.slice(0, count);
  const rest = items.length - shown.length;
  return (
    <>
    <div className="polas">
      {shown.map((it) => {
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
    {(rest > 0 || count > STEP) && (
      <div className="gal-more">
        {rest > 0 ? (
          <button className="btn line" type="button" onClick={() => setCount((c) => c + STEP)}>
            Voir plus de la galerie ({rest})
          </button>
        ) : (
          <button className="btn line" type="button" onClick={() => {
            setCount(STEP);
            document.getElementById("galerie")?.scrollIntoView({ behavior: "smooth" });
          }}>
            Voir moins
          </button>
        )}
      </div>
    )}
    </>
  );
}
