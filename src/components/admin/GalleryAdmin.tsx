"use client";
import { useState } from "react";

type G = {
  id: string; media_url: string; media_type: "image" | "video"; caption: string | null;
  category: string | null; orientation: "portrait" | "landscape"; sort_order: number; published: boolean;
};

const empty = { mediaUrl: "", mediaType: "image" as "image" | "video", caption: "", category: "", orientation: "portrait" as "portrait" | "landscape", sortOrder: "0" };

export default function GalleryAdmin({ initial }: { initial: G[] }) {
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState<typeof empty | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
        <button className="btn fill" type="button" onClick={() => { setForm({ ...empty }); setError(""); }}>Ajouter une photo ou vidéo</button>
      </div>
      <p className="admin-muted">Envoie d&apos;abord le fichier dans Supabase (Storage &gt; bucket photos), puis colle son lien public ici.</p>

      <div className="admin-gallery-grid">
        {items.map((g) => (
          <div className="admin-gallery-item" key={g.id}>
            {g.media_type === "video"
              ? <video src={g.media_url} muted loop playsInline />
              : <img src={g.media_url} alt={g.caption ?? ""} />}
            <div className="admin-gallery-meta">
              <span className={`badge ${g.published ? "badge-open" : "badge-draft"}`}>{g.published ? "publié" : "masqué"}</span>
              <div className="admin-row-actions">
                <button className="btn line" type="button" onClick={() => togglePublished(g)}>{g.published ? "Masquer" : "Publier"}</button>
                <button className="btn line danger" type="button" onClick={() => remove(g.id)}>Supprimer</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="admin-empty">Aucune photo pour l&apos;instant.</p>}
      </div>

      {form && (
        <div className="admin-modal" onClick={(e) => e.target === e.currentTarget && setForm(null)}>
          <form className="admin-card" onSubmit={add}>
            <h2>Ajouter à la galerie</h2>
            <div className="fld full"><label>Lien public du fichier (Supabase)</label>
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
              <button className="btn line" type="button" onClick={() => setForm(null)}>Annuler</button>
              <button className="btn fill" type="submit" disabled={busy}>{busy ? "Ajout…" : "Ajouter"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
