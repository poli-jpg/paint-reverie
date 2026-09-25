"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import type { Workshop } from "@/lib/types";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Dakar" });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Dakar" }).replace(":", "h");

export default function Workshops({ workshops }: { workshops: Workshop[] }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [sel, setSel] = useState<Workshop | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  function openBooking(w: Workshop) {
    setSel(w); setState("idle"); setError(""); dlg.current?.showModal();
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sel) return;
    setState("sending"); setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      const r = await fetch("/api/bookings", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workshopId: sel.id, firstName: f.firstName, lastName: f.lastName, phone: f.phone,
          email: f.email, seats: f.seats, notes: f.notes, website: f.website || "",
        }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Erreur");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur"); setState("idle");
    }
  }

  return (
    <>
      <div className="cards">
        {workshops.map((w) => {
          const bookable = w.status === "open" && w.seats_left > 0;
          return (
            <article className="card" key={w.id}>
              <div className="ph">
                {w.image_url
                  ? <Image src={w.image_url} alt={w.title} fill sizes="(max-width:860px) 100vw, 360px"
                      unoptimized={!w.image_url.includes(".supabase.co/")} style={{ objectFit: "cover" }} />
                  : "Photo de l'atelier"}
              </div>
              <div className="in">
                <h3>{w.title}</h3>
                <div className="meta">{fmtDate(w.starts_at)} · {fmtTime(w.starts_at)}</div>
                <div className="meta">{w.location}</div>
                <div className="price">{w.price_fcfa.toLocaleString("fr-FR")} FCFA</div>
                <div className="left">
                  {w.status === "closed" ? "Réservations fermées" : w.seats_left === 0 ? "Complet" : `${w.seats_left} place${w.seats_left > 1 ? "s" : ""} restante${w.seats_left > 1 ? "s" : ""}`}
                </div>
                <button className={`btn ${bookable ? "fill" : "line"}`} disabled={!bookable} onClick={() => openBooking(w)}
                  style={!bookable ? { opacity: 0.55, cursor: "default" } : undefined}>
                  {bookable ? "Réserver" : w.status === "closed" ? "Fermé" : "Complet"}
                </button>
              </div>
            </article>
          );
        })}
        <article className="card soon">
          <div className="script">Bientôt</div>
          <p className="meta" style={{ margin: "8px auto 0" }}>D&apos;autres dates arrivent. Suivez-nous sur Instagram.</p>
        </article>
      </div>

      <dialog ref={dlg} onClick={(e) => e.target === dlg.current && dlg.current?.close()} aria-labelledby="dt">
        <div className="box">
          <button className="x" type="button" aria-label="Fermer" onClick={() => dlg.current?.close()}>×</button>
          {state !== "done" && sel && (
            <>
              <h3 id="dt">Réserver ma place</h3>
              <div className="sub">{sel.title} · {fmtDate(sel.starts_at)} · {fmtTime(sel.starts_at)}</div>
              <form className="f" onSubmit={submit}>
                <div className="fld"><label htmlFor="b-prenom">Prénom</label><input id="b-prenom" name="firstName" required autoComplete="given-name" /></div>
                <div className="fld"><label htmlFor="b-nom">Nom</label><input id="b-nom" name="lastName" required autoComplete="family-name" /></div>
                <div className="fld"><label htmlFor="b-tel">WhatsApp / téléphone</label><input id="b-tel" name="phone" type="tel" required autoComplete="tel" /></div>
                <div className="fld"><label htmlFor="b-mail">E-mail</label><input id="b-mail" name="email" type="email" required autoComplete="email" /></div>
                <div className="fld full"><label htmlFor="b-nb">Nombre de places</label>
                  <select id="b-nb" name="seats">
                    {Array.from({ length: Math.min(sel.seats_left, 10) }, (_, i) => <option key={i + 1}>{i + 1}</option>)}
                  </select></div>
                <div className="fld full"><label htmlFor="b-msg">Informations supplémentaires (facultatif)</label><textarea id="b-msg" name="notes" /></div>
                <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                {error && <div className="err" role="alert">{error}</div>}
                <button className="btn fill" type="submit" disabled={state === "sending"}>{state === "sending" ? "Envoi…" : "Réserver"}</button>
              </form>
            </>
          )}
          {state === "done" && (
            <div className="ok show" role="status">
              <div className="script">C&apos;est noté !</div>
              <p style={{ margin: "0 auto" }}>Ta place est réservée. Un e-mail de confirmation t&apos;est envoyé, et Fatima t&apos;écrit sur WhatsApp pour le paiement.</p>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
