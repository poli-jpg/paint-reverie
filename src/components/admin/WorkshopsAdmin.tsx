"use client";
import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Envoie une image directement vers Supabase (bucket "photos") et renvoie son lien public.
async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choisis une photo (JPG, PNG ou WEBP).");
  if (file.size > 20 * 1024 * 1024) throw new Error("Photo trop lourde (max 20 Mo).");
  const r = await fetch("/api/admin/gallery/upload-url", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type }),
  });
  const sign = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(sign.error || "Envoi refusé");
  const { error } = await supabaseBrowser.storage.from("photos")
    .uploadToSignedUrl(sign.path, sign.token, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return sign.publicUrl as string;
}

type W = {
  id: string; slug: string; title: string; description: string | null; starts_at: string;
  location: string; price_fcfa: number; capacity: number; image_url: string | null;
  image_pos_x?: number; image_pos_y?: number; image_zoom?: number; image_size?: "sm" | "md" | "lg";
  status: "draft" | "open" | "closed"; seats_taken: number;
};

const empty = {
  slug: "", title: "", description: "", startsAt: "", location: "",
  priceFcfa: "", capacity: "8", imageUrl: "", status: "draft" as W["status"],
  imagePosX: 50, imagePosY: 50, imageZoom: 1, imageSize: "md" as "sm" | "md" | "lg",
};

const PHOTO_SIZES = [["sm", "Petite"], ["md", "Moyenne"], ["lg", "Grande"]] as const;
// Même proportion que la photo sur la carte du site, selon la taille choisie.
const RATIO = { sm: "16 / 9", md: "4 / 3", lg: "1 / 1" } as const;

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function WorkshopsAdmin({ initial }: { initial: W[] }) {
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState<typeof empty | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const draggingPhoto = useRef(false);

  // Cadrage : clic ou glisser sur l'aperçu = point à garder au centre de la photo.
  function pickPhotoPoint(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
    const y = Math.round(Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)));
    setForm((f) => (f ? { ...f, imagePosX: x, imagePosY: y } : f));
  }

  async function handlePhoto(file?: File) {
    if (!file || !form) return;
    setUploading(true); setError("");
    try {
      const url = await uploadImage(file);
      setForm((f) => (f ? { ...f, imageUrl: url, imagePosX: 50, imagePosY: 50, imageZoom: 1 } : f));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'envoi");
    }
    setUploading(false);
  }

  function openCreate() { setForm({ ...empty }); setEditId(null); setError(""); }
  function openEdit(w: W) {
    setForm({
      slug: w.slug, title: w.title, description: w.description ?? "", startsAt: toLocalInput(w.starts_at),
      location: w.location, priceFcfa: String(w.price_fcfa), capacity: String(w.capacity),
      imageUrl: w.image_url ?? "", status: w.status,
      imagePosX: w.image_pos_x ?? 50, imagePosY: w.image_pos_y ?? 50,
      imageZoom: Number(w.image_zoom ?? 1), imageSize: w.image_size ?? "md",
    });
    setEditId(w.id); setError("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true); setError("");
    const url = editId ? `/api/admin/workshops/${editId}` : "/api/admin/workshops";
    const method = editId ? "PATCH" : "POST";
    const r = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const body = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setError(body.error || "Erreur"); return; }
    location.reload();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet atelier et ses réservations ?")) return;
    const r = await fetch(`/api/admin/workshops/${id}`, { method: "DELETE" });
    if (r.ok) setItems((x) => x.filter((w) => w.id !== id));
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Ateliers</h1>
        <button className="btn fill" onClick={openCreate} type="button">Nouvel atelier</button>
      </div>

      <table className="admin-table">
        <thead><tr><th>Titre</th><th>Date</th><th>Lieu</th><th>Prix</th><th>Places</th><th>Statut</th><th></th></tr></thead>
        <tbody>
          {items.map((w) => (
            <tr key={w.id}>
              <td>{w.title}</td>
              <td>{new Date(w.starts_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</td>
              <td>{w.location}</td>
              <td>{w.price_fcfa.toLocaleString("fr-FR")} FCFA</td>
              <td>{w.seats_taken}/{w.capacity}</td>
              <td><span className={`badge badge-${w.status}`}>{w.status}</span></td>
              <td className="admin-row-actions">
                <button className="btn line" onClick={() => openEdit(w)} type="button">Modifier</button>
                <button className="btn line danger" onClick={() => remove(w.id)} type="button">Supprimer</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={7} className="admin-empty">Aucun atelier pour l&apos;instant.</td></tr>}
        </tbody>
      </table>

      {form && (
        <div className="admin-modal" onClick={(e) => e.target === e.currentTarget && setForm(null)}>
          <form className="admin-card" onSubmit={save}>
            <h2>{editId ? "Modifier l'atelier" : "Nouvel atelier"}</h2>
            <div className="fld"><label>Titre</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="fld"><label>Identifiant (facultatif)</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="créé à partir du titre" /></div>
            <div className="fld"><label>Date et heure</label>
              <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} required /></div>
            <div className="fld"><label>Lieu</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
            <div className="fld"><label>Prix (FCFA)</label>
              <input type="number" min={0} value={form.priceFcfa} onChange={(e) => setForm({ ...form, priceFcfa: e.target.value })} required /></div>
            <div className="fld"><label>Capacité</label>
              <input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required /></div>
            <div className="fld full"><label>Photo de l&apos;atelier (facultatif)</label>
              <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" hidden
                onChange={(e) => { handlePhoto(e.target.files?.[0]); e.target.value = ""; }} />
              <div className={`ws-drop${form.imageUrl ? " has-img" : ""}`}
                onClick={() => !uploading && photoInput.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handlePhoto(e.dataTransfer.files?.[0]); }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {form.imageUrl && <img src={form.imageUrl} alt="" />}
                <span>
                  {uploading ? "Envoi de la photo…"
                    : form.imageUrl ? "Glisse une autre photo ou clique pour la changer"
                    : "Glisse une photo ici ou clique pour la choisir"}
                </span>
              </div>
              <div className="ws-photo-row">
                <input value={form.imageUrl} placeholder="ou colle un lien d'image"
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                {form.imageUrl && (
                  <button className="btn line" type="button" onClick={() => setForm({ ...form, imageUrl: "" })}>Retirer</button>
                )}
              </div>
              {form.imageUrl && (
                <div className="ws-frame">
                  <span className="ws-frame-title">Réglage de la photo sur le site</span>
                  <div className="ws-frame-preview" style={{ aspectRatio: RATIO[form.imageSize] }}
                    onPointerDown={(e) => { draggingPhoto.current = true; e.currentTarget.setPointerCapture(e.pointerId); pickPhotoPoint(e); }}
                    onPointerMove={(e) => { if (draggingPhoto.current) pickPhotoPoint(e); }}
                    onPointerUp={() => { draggingPhoto.current = false; }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.imageUrl} alt="" draggable={false} style={{
                      objectPosition: `${form.imagePosX}% ${form.imagePosY}%`,
                      transform: `scale(${form.imageZoom})`, transformOrigin: `${form.imagePosX}% ${form.imagePosY}%`,
                    }} />
                    <span className="hero-adjust-dot" style={{ left: `${form.imagePosX}%`, top: `${form.imagePosY}%` }} />
                  </div>
                  <p className="ws-frame-help">Cliquez ou glissez sur la photo pour choisir la partie à garder au centre.</p>
                  <label className="ws-frame-zoom">Zoom
                    <input type="range" min={1} max={2.5} step={0.05} value={form.imageZoom}
                      onChange={(e) => setForm({ ...form, imageZoom: Number(e.target.value) })} />
                  </label>
                  <div className="hero-adjust-sizes">
                    <span>Taille de la photo</span>
                    {PHOTO_SIZES.map(([v, label]) => (
                      <button key={v} type="button" className={`btn ${form.imageSize === v ? "fill" : "line"}`}
                        onClick={() => setForm({ ...form, imageSize: v })}>{label}</button>
                    ))}
                    <button type="button" className="btn line"
                      onClick={() => setForm({ ...form, imagePosX: 50, imagePosY: 50, imageZoom: 1 })}>Recentrer</button>
                  </div>
                </div>
              )}
            </div>
            <div className="fld full"><label>Description (facultatif)</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="fld full"><label>Statut</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as W["status"] })}>
                <option value="draft">Brouillon (invisible sur le site)</option>
                <option value="open">Ouvert aux réservations</option>
                <option value="closed">Fermé</option>
              </select></div>
            {error && <div className="err" role="alert">{error}</div>}
            <div className="admin-form-actions">
              <button className="btn line" type="button" onClick={() => setForm(null)}>Annuler</button>
              <button className="btn fill" type="submit" disabled={busy || uploading}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
