"use client";
import { useState } from "react";

type W = {
  id: string; slug: string; title: string; description: string | null; starts_at: string;
  location: string; price_fcfa: number; capacity: number; image_url: string | null;
  status: "draft" | "open" | "closed"; seats_taken: number;
};

const empty = {
  slug: "", title: "", description: "", startsAt: "", location: "",
  priceFcfa: "", capacity: "8", imageUrl: "", status: "draft" as W["status"],
};

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

  function openCreate() { setForm({ ...empty }); setEditId(null); setError(""); }
  function openEdit(w: W) {
    setForm({
      slug: w.slug, title: w.title, description: w.description ?? "", startsAt: toLocalInput(w.starts_at),
      location: w.location, priceFcfa: String(w.price_fcfa), capacity: String(w.capacity),
      imageUrl: w.image_url ?? "", status: w.status,
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
            <div className="fld full"><label>Photo (lien d&apos;image, facultatif)</label>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></div>
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
              <button className="btn fill" type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
