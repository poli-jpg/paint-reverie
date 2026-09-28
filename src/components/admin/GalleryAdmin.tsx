"use client";
import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { HeroSettings } from "@/lib/types";

type Orientation = "portrait" | "landscape";
type Upload = { name: string; status: "wait" | "sending" | "done" | "error"; message?: string };

const MAX_MB = 50;

// Devine l'orientation d'une photo ou vidéo à partir de ses dimensions.
function detectOrientation(file: File): Promise<Orientation> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const done = (w: number, h: number) => { URL.revokeObjectURL(url); resolve(w > h ? "landscape" : "portrait"); };
    if (file.type.startsWith("video/")) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => done(v.videoWidth, v.videoHeight);
      v.onerror = () => done(1, 2);
      v.src = url;
    } else {
      const img = new Image();
      img.onload = () => done(img.naturalWidth, img.naturalHeight);
      img.onerror = () => done(1, 2);
      img.src = url;
    }
  });
}

type G = {
  id: string; media_url: string; media_type: "image" | "video"; caption: string | null;
  category: string | null; orientation: "portrait" | "landscape"; sort_order: number; published: boolean;
};

const empty = { mediaUrl: "", mediaType: "image" as "image" | "video", caption: "", category: "", orientation: "portrait" as "portrait" | "landscape", sortOrder: "0" };

const SIZES = [["sm", "Petit"], ["md", "Moyen"], ["lg", "Grand"]] as const;

export default function GalleryAdmin({ initial, hero: initialHero }: { initial: G[]; hero: HeroSettings | null }) {
  const [items, setItems] = useState(initial);
  const [heroCfg, setHeroCfg] = useState<HeroSettings | null>(initialHero);
  const hero = heroCfg?.image_url ?? null;
  const [savingHero, setSavingHero] = useState<"" | "saving" | "saved">("");
  const dragging = useRef(false);

  async function saveHero(patch: Record<string, unknown>) {
    setSavingHero("saving");
    const r = await fetch("/api/admin/hero", {
      method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(patch),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) { setError(body.error || "Impossible d'enregistrer la photo d'accueil."); setSavingHero(""); return; }
    setHeroCfg(patch.imageUrl === null ? null : body.hero);
    setSavingHero("saved");
  }

  async function setAsHero(url: string | null) {
    await saveHero({ imageUrl: url });
  }

  // Cadrage : on clique (ou glisse) sur l'aperçu pour choisir le point central.
  function pickPoint(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)));
    setHeroCfg((h) => (h ? { ...h, pos_x: x, pos_y: y } : h));
    setSavingHero("");
  }
  const [form, setForm] = useState<typeof empty | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [caption, setCaption] = useState("");
  const [showLink, setShowLink] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    setError("");
    setUploads(files.map((f) => ({ name: f.name, status: "wait" })));
    const set = (i: number, u: Partial<Upload>) => setUploads((x) => x.map((it, j) => (j === i ? { ...it, ...u } : it)));
    const nextOrder = items.reduce((m, g) => Math.max(m, g.sort_order), 0) + 1;
    let ok = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      set(i, { status: "sending" });
      try {
        if (file.size > MAX_MB * 1024 * 1024) throw new Error(`Fichier trop lourd (max ${MAX_MB} Mo)`);
        const r = await fetch("/api/admin/gallery/upload-url", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ fileName: file.name, contentType: file.type }),
        });
        const sign = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(sign.error || "Autorisation refusée");

        const { error: upErr } = await supabaseBrowser.storage.from("photos")
          .uploadToSignedUrl(sign.path, sign.token, file, { contentType: file.type });
        if (upErr) throw new Error(upErr.message);

        const save = await fetch("/api/admin/gallery", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({
            mediaUrl: sign.publicUrl,
            mediaType: file.type.startsWith("video/") ? "video" : "image",
            caption, category: "",
            orientation: await detectOrientation(file),
            sortOrder: String(nextOrder + i),
          }),
        });
        if (!save.ok) throw new Error((await save.json().catch(() => ({}))).error || "Enregistrement impossible");
        set(i, { status: "done" }); ok++;
      } catch (e) {
        set(i, { status: "error", message: e instanceof Error ? e.message : "Erreur" });
      }
    }
    if (ok === files.length) location.reload();
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true); setError("");
    const r = await fetch("/api/admin/gallery", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form),
    });
    const body = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setError(body.error || "Erreur"); return; }
    location.reload();
  }

  async function togglePublished(item: G) {
    const r = await fetch(`/api/admin/gallery/${item.id}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ published: !item.published }),
    });
    if (r.ok) setItems((x) => x.map((g) => (g.id === item.id ? { ...g, published: !g.published } : g)));
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce média de la galerie ?")) return;
    const r = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (r.ok) setItems((x) => x.filter((g) => g.id !== id));
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Galerie</h1>
        <button className="btn fill" type="button" onClick={() => fileInput.current?.click()}>Ajouter des photos / vidéos</button>
      </div>
      <input ref={fileInput} type="file" multiple hidden
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
        onChange={(e) => { uploadFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />

      <div className="gal-drop"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); uploadFiles(Array.from(e.dataTransfer.files)); }}
        onClick={() => fileInput.current?.click()}>
        <strong>Glisse tes photos et vidéos ici</strong>
        <span>ou clique pour les choisir sur l&apos;ordinateur ou le téléphone · JPG, PNG, WEBP, MP4, MOV · {MAX_MB} Mo max</span>
      </div>
      <div className="gal-options">
        <label>Légende pour les prochains envois (facultatif)
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="ex. Atelier du 12 octobre" />
        </label>
        <button className="gal-link" type="button" onClick={() => { setShowLink(!showLink); setForm({ ...empty }); setError(""); }}>
          ou ajouter avec un lien
        </button>
      </div>

      {uploads.length > 0 && (
        <ul className="gal-uploads">
          {uploads.map((u, i) => (
            <li key={i} className={`gal-up gal-up-${u.status}`}>
              <span>{u.name}</span>
              <span>{u.status === "wait" ? "En attente" : u.status === "sending" ? "Envoi…" : u.status === "done" ? "Ajoutée ✓" : `Erreur : ${u.message}`}</span>
            </li>
          ))}
        </ul>
      )}

      {heroCfg && (
        <section className="hero-adjust">
          <h2>Photo d&apos;accueil : cadrage et taille</h2>
          <div className="hero-adjust-body">
            <div className="hero-adjust-preview"
              onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); pickPoint(e); }}
              onPointerMove={(e) => { if (dragging.current) pickPoint(e); }}
              onPointerUp={() => { dragging.current = false; }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroCfg.image_url} alt="" draggable={false} style={{
                objectPosition: `${heroCfg.pos_x ?? 50}% ${heroCfg.pos_y ?? 50}%`,
                transform: `scale(${heroCfg.zoom ?? 1})`,
                transformOrigin: `${heroCfg.pos_x ?? 50}% ${heroCfg.pos_y ?? 50}%`,
              }} />
              <span className="hero-adjust-dot" style={{ left: `${heroCfg.pos_x ?? 50}%`, top: `${heroCfg.pos_y ?? 50}%` }} />
            </div>
            <div className="hero-adjust-controls">
              <p className="admin-muted">Cliquez ou glissez sur la photo pour choisir la partie à garder au centre du cadre.</p>
              <label>Zoom
                <input type="range" min={1} max={2.5} step={0.05} value={heroCfg.zoom ?? 1}
                  onChange={(e) => { setHeroCfg({ ...heroCfg, zoom: Number(e.target.value) }); setSavingHero(""); }} />
              </label>
              <div className="hero-adjust-sizes">
                <span>Taille du cadre</span>
                {SIZES.map(([v, label]) => (
                  <button key={v} type="button"
                    className={`btn ${(heroCfg.size ?? "md") === v ? "fill" : "line"}`}
                    onClick={() => { setHeroCfg({ ...heroCfg, size: v }); setSavingHero(""); }}>{label}</button>
                ))}
              </div>
              <div className="admin-row-actions">
                <button className="btn fill" type="button" disabled={savingHero === "saving"}
                  onClick={() => saveHero({ posX: heroCfg.pos_x ?? 50, posY: heroCfg.pos_y ?? 50, zoom: heroCfg.zoom ?? 1, size: heroCfg.size ?? "md" })}>
                  {savingHero === "saving" ? "Enregistrement…" : "Enregistrer le réglage"}
                </button>
                <button className="btn line" type="button"
                  onClick={() => { setHeroCfg({ ...heroCfg, pos_x: 50, pos_y: 50, zoom: 1 }); setSavingHero(""); }}>Recentrer</button>
                {savingHero === "saved" && <span className="hero-adjust-ok">Enregistré ✓ — visible sur l&apos;accueil</span>}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="admin-gallery-grid">
        {items.map((g) => (
          <div className="admin-gallery-item" key={g.id}>
            {g.media_type === "video"
              ? <video src={g.media_url} muted loop playsInline />
              : <img src={g.media_url} alt={g.caption ?? ""} />}
            <div className="admin-gallery-meta">
              <span className={`badge ${g.published ? "badge-open" : "badge-draft"}`}>{g.published ? "publié" : "masqué"}</span>
              {g.media_type === "image" && (hero === g.media_url
                ? <button className="btn fill" type="button" onClick={() => setAsHero(null)}>★ Photo d&apos;accueil (retirer)</button>
                : <button className="btn line" type="button" onClick={() => setAsHero(g.media_url)}>Mettre en photo d&apos;accueil</button>)}
              <div className="admin-row-actions">
                <button className="btn line" type="button" onClick={() => togglePublished(g)}>{g.published ? "Masquer" : "Publier"}</button>
                <button className="btn line danger" type="button" onClick={() => remove(g.id)}>Supprimer</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="admin-empty">Aucune photo pour l&apos;instant.</p>}
      </div>

      {form && showLink && (
        <div className="admin-modal" onClick={(e) => e.target === e.currentTarget && (setForm(null), setShowLink(false))}>
          <form className="admin-card" onSubmit={add}>
            <h2>Ajouter à la galerie</h2>
            <div className="fld full"><label>Lien de la photo ou vidéo</label>
              <input value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} required /></div>
            <div className="fld"><label>Type</label>
              <select value={form.mediaType} onChange={(e) => setForm({ ...form, mediaType: e.target.value as "image" | "video" })}>
                <option value="image">Photo</option><option value="video">Vidéo</option>
              </select></div>
            <div className="fld"><label>Orientation</label>
              <select value={form.orientation} onChange={(e) => setForm({ ...form, orientation: e.target.value as "portrait" | "landscape" })}>
                <option value="portrait">Portrait</option><option value="landscape">Paysage</option>
              </select></div>
            <div className="fld"><label>Légende (facultatif)</label>
              <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} /></div>
            <div className="fld"><label>Ordre d&apos;affichage</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
            {error && <div className="err" role="alert">{error}</div>}
            <div className="admin-form-actions">
              <button className="btn line" type="button" onClick={() => { setForm(null); setShowLink(false); }}>Annuler</button>
              <button className="btn fill" type="submit" disabled={busy}>{busy ? "Ajout…" : "Ajouter"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
