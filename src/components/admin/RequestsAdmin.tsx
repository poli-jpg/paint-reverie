"use client";
import { useMemo, useState } from "react";

export type RequestStatus = "new" | "contacted" | "quoted" | "done" | "declined";

type R = {
  id: string; first_name: string; last_name: string; phone: string; email: string;
  event_type: string; desired_date: string | null; participants: number | null;
  location: string | null; message: string | null; status: RequestStatus; created_at: string;
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: "Nouvelle",
  contacted: "Contactée",
  quoted: "Devis envoyé",
  done: "Terminée",
  declined: "Refusée",
};

const OPEN: RequestStatus[] = ["new", "contacted", "quoted"];

// Numéro WhatsApp au format international (Sénégal par défaut si l'indicatif manque).
function waLink(phone: string, firstName: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 9) d = "221" + d;
  const text = encodeURIComponent(`Bonjour ${firstName}, c'est Fatima de The Paint Reverie 🎨 Merci pour ta demande d'atelier !`);
  return `https://wa.me/${d}?text=${text}`;
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Dakar" });
const fmtDay = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("fr-FR", { dateStyle: "long" });

export default function RequestsAdmin({ initial }: { initial: R[] }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"open" | "all">("open");
  const [error, setError] = useState("");

  const shown = useMemo(
    () => (filter === "open" ? items.filter((r) => OPEN.includes(r.status)) : items),
    [items, filter]
  );
  const newCount = items.filter((r) => r.status === "new").length;

  async function setStatus(id: string, status: RequestStatus) {
    setError("");
    const r = await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }),
    });
    if (r.ok) setItems((x) => x.map((it) => (it.id === id ? { ...it, status } : it)));
    else setError("Impossible de changer le statut, réessaie.");
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Demandes d&apos;ateliers privés</h1>
        <div className="admin-row-actions">
          <button type="button" className={`btn ${filter === "open" ? "fill" : "line"}`} onClick={() => setFilter("open")}>
            À traiter ({items.filter((r) => OPEN.includes(r.status)).length})
          </button>
          <button type="button" className={`btn ${filter === "all" ? "fill" : "line"}`} onClick={() => setFilter("all")}>
            Toutes ({items.length})
          </button>
        </div>
      </div>
      <p className="admin-muted">
        {newCount > 0 ? `${newCount} nouvelle(s) demande(s) à lire.` : "Aucune nouvelle demande."}
      </p>
      {error && <div className="err" role="alert">{error}</div>}

      <div className="req-list">
        {shown.map((r) => (
          <article key={r.id} className={`req-card${r.status === "new" ? " req-new" : ""}`}>
            <header className="req-head">
              <div>
                <h2>{r.first_name} {r.last_name}</h2>
                <span className="admin-muted req-date">Reçue le {fmtDate(r.created_at)}</span>
              </div>
              <span className={`badge badge-${r.status}`}>{STATUS_LABELS[r.status]}</span>
            </header>

            <dl className="req-info">
              <div><dt>Type</dt><dd>{r.event_type}</dd></div>
              <div><dt>Date souhaitée</dt><dd>{r.desired_date ? fmtDay(r.desired_date) : "À définir"}</dd></div>
              <div><dt>Participants</dt><dd>{r.participants ?? "?"}</dd></div>
              <div><dt>Lieu</dt><dd>{r.location || "?"}</dd></div>
              <div><dt>Téléphone</dt><dd>{r.phone}</dd></div>
              <div><dt>E-mail</dt><dd>{r.email}</dd></div>
            </dl>

            <p className="req-message">{r.message || <span className="admin-muted">Pas de message.</span>}</p>

            <footer className="req-actions">
              <a className="btn fill" href={waLink(r.phone, r.first_name)} target="_blank" rel="noopener noreferrer"
                 onClick={() => r.status === "new" && setStatus(r.id, "contacted")}>
                Répondre sur WhatsApp
              </a>
              <a className="btn line" href={`mailto:${r.email}?subject=${encodeURIComponent("Ton atelier The Paint Reverie")}`}>
                Répondre par e-mail
              </a>
              <label className="req-status">
                Statut
                <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value as RequestStatus)}>
                  {(Object.keys(STATUS_LABELS) as RequestStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </label>
            </footer>
          </article>
        ))}
        {shown.length === 0 && (
          <p className="admin-empty">
            {filter === "open" ? "Aucune demande à traiter. 🎉" : "Aucune demande pour l'instant."}
          </p>
        )}
      </div>
    </div>
  );
}
