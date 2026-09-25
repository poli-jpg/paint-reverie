"use client";
import { useState } from "react";

type B = {
  id: string; first_name: string; last_name: string; phone: string; email: string;
  seats: number; notes: string | null; status: "pending" | "confirmed" | "cancelled";
  payment_status: string; created_at: string; workshop_title: string; workshop_date: string;
};

export default function BookingsAdmin({ initial }: { initial: B[] }) {
  const [items, setItems] = useState(initial);

  async function setStatus(id: string, status: B["status"]) {
    const r = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }),
    });
    if (r.ok) setItems((x) => x.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  function exportCsv() {
    const header = ["Atelier", "Date atelier", "Prenom", "Nom", "Telephone", "Email", "Places", "Statut", "Paiement", "Creee le", "Notes"];
    const rows = items.map((b) => [
      b.workshop_title, b.workshop_date, b.first_name, b.last_name, b.phone, b.email,
      String(b.seats), b.status, b.payment_status, b.created_at, (b.notes ?? "").replace(/\n/g, " "),
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `reservations-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Réservations</h1>
        <button className="btn line" onClick={exportCsv} type="button">Exporter en CSV</button>
      </div>
      <table className="admin-table">
        <thead><tr><th>Atelier</th><th>Client</th><th>Contact</th><th>Places</th><th>Statut</th><th></th></tr></thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td>{b.workshop_title}</td>
              <td>{b.first_name} {b.last_name}</td>
              <td>{b.phone}<br /><span className="admin-muted">{b.email}</span></td>
              <td>{b.seats}</td>
              <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
              <td className="admin-row-actions">
                {b.status !== "confirmed" && <button className="btn line" type="button" onClick={() => setStatus(b.id, "confirmed")}>Confirmer</button>}
                {b.status !== "cancelled" && <button className="btn line danger" type="button" onClick={() => setStatus(b.id, "cancelled")}>Annuler</button>}
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} className="admin-empty">Aucune réservation pour l&apos;instant.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
