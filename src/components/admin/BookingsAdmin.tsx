"use client";
import { useState } from "react";
import { DEPOSIT_FCFA, ORANGE_MONEY_NUMBER, WAVE_NUMBER, fcfa } from "@/lib/types";

// Lien WhatsApp vers le client (Sénégal par défaut si l'indicatif manque).
function waTo(phone: string, text: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 9) d = "221" + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

type B = {
  id: string; first_name: string; last_name: string; phone: string; email: string;
  seats: number; notes: string | null; status: "pending" | "confirmed" | "cancelled";
  payment_status: string; created_at: string; workshop_title: string; workshop_date: string; workshop_price: number;
};

export default function BookingsAdmin({ initial }: { initial: B[] }) {
  const [items, setItems] = useState(initial);

  async function setStatus(id: string, status: B["status"]) {
    const r = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }),
    });
    if (r.ok) setItems((x) => x.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  const placeLabel = (n: number) => `${n} place${n > 1 ? "s" : ""}`;

  // Message 3 : acompte reçu, réservation confirmée.
  function confirmWhatsapp(b: B) {
    const text = [
      `Bonjour ${b.first_name}, c’est Fatima de The Paint Reverie💕`,
      `Ton acompte de ${fcfa(DEPOSIT_FCFA * b.seats)} a été bien reçu, merci!`,
      `Ta réservation pour « ${b.workshop_title} » (${placeLabel(b.seats)}) est maintenant confirmée✨`,
      "On a hâte de te retrouver chez The Paint Reverie",
    ].join("\n");
    // Ouvre WhatsApp tout de suite (avant l'appel réseau, sinon le navigateur bloque la fenêtre).
    window.open(waTo(b.phone, text), "_blank", "noopener");
    if (b.status !== "confirmed") setStatus(b.id, "confirmed");
  }

  // Message 2 : demande d'acompte avec les moyens de paiement.
  function askDeposit(b: B) {
    const total = b.workshop_price * b.seats;
    const deposit = DEPOSIT_FCFA * b.seats;
    const text = [
      `Bonjour ${b.first_name}, c’est Fatima de The Paint Reverie💕`,
      `Merci pour ta réservation pour « ${b.workshop_title} » (${placeLabel(b.seats)})!`,
      `Le tarif de l’atelier est de ${fcfa(total)} au total.`,
      `Pour confirmer ta réservation, un acompte de ${fcfa(deposit)} est demandé.`,
      `Vous pouvez valider par Wave sur le ${WAVE_NUMBER} ou par Orange Money sur le ${ORANGE_MONEY_NUMBER}.`,
      `Le solde de ${fcfa(Math.max(total - deposit, 0))} sera à régler sur place le jour de l’atelier.`,
      "Merci et à très vite chez The Paint Reverie💕",
    ].join("\n");
    window.open(waTo(b.phone, text), "_blank", "noopener");
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
                {b.status === "pending" && <button className="btn line" type="button" onClick={() => askDeposit(b)}>Demander l&apos;acompte</button>}
                {b.status !== "cancelled" && <button className="btn fill" type="button" onClick={() => confirmWhatsapp(b)}>Confirmer via WhatsApp</button>}
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
