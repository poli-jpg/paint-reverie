import { ImageResponse } from "next/og";

// Image affichée quand on partage le lien du site (WhatsApp, Instagram, Facebook…).
export const alt = "The Paint Reverie by Fatima — ateliers de peinture au Sénégal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function googleFont(family: string, text: string) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OgImage() {
  const title = "The Paint Reverie";
  const script = await googleFont("Pinyon+Script", "by Fatima");
  const serif = await googleFont("Cormorant+Garamond:ital,wght@1,500", title + "Ateliers de peinture au Sénégal");
  const fonts = [
    ...(script ? [{ name: "Script", data: script, style: "normal" as const, weight: 400 as const }] : []),
    ...(serif ? [{ name: "Serif", data: serif, style: "italic" as const, weight: 500 as const }] : []),
  ];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FBF5EE", color: "#4A3338" }}>
        {/* Toile décorative, comme sur la page d'accueil */}
        <div style={{ position: "absolute", right: 70, top: 70, width: 400, height: 490, display: "flex",
          background: "#EBCFCB", border: "16px solid #fff", transform: "rotate(3deg)",
          boxShadow: "0 20px 40px rgba(74,51,56,.18)" }}>
          <div style={{ position: "absolute", left: 40, bottom: 60, width: 190, height: 190, borderRadius: 999, background: "rgba(169,184,155,.75)" }} />
          <div style={{ position: "absolute", right: 30, top: 50, width: 220, height: 220, borderRadius: 999, background: "rgba(201,154,160,.95)" }} />
        </div>
        <div style={{ position: "absolute", right: 110, top: 40, width: 30, height: 150, background: "#C99AA0" }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", width: 700 }}>
          <div style={{ fontFamily: "Serif", fontStyle: "italic", fontSize: 92, lineHeight: 1, color: "#8A3F4E" }}>{title}</div>
          <div style={{ fontFamily: "Script", fontSize: 64, color: "#4A3338", marginTop: 8 }}>by Fatima</div>
          <div style={{ fontSize: 22, letterSpacing: 8, color: "#C99AA0", marginTop: 34 }}>PAINT · CREATE · DREAM</div>
          <div style={{ fontFamily: "Serif", fontStyle: "italic", fontSize: 38, color: "#7A6167", marginTop: 28 }}>Ateliers de peinture au Sénégal</div>
        </div>
      </div>
    ),
    // Si les polices Google ne se chargent pas, on garde la police par défaut (ne jamais passer une liste vide).
    fonts.length ? { ...size, fonts } : size,
  );
}
