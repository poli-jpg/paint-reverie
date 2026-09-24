"use client";
import { useState } from "react";

const TYPES = ["Anniversaire", "Événement privé", "Événement professionnel", "Team building", "Autre"];

export default function PrivateForm() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending"); setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      const r = await fetch("/api/private-requests", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: f.firstName, lastName: f.lastName, phone: f.phone, email: f.email,
          eventType: f.eventType, desiredDate: f.desiredDate || "", participants: f.participants || undefined,
          location: f.location, message: f.message, website: f.website || "",
        }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Erreur");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur"); setState("idle");
    }
  }

  if (state === "done")
    return (
      <div className="ok show" role="status">
        <div className="script">Merci !</div>
        <p style={{ margin: "0 auto" }}>Votre demande est bien reçue. Fatima vous répond sur WhatsApp ou par e-mail très vite.</p>
      </div>
    );

  return (
    <form className="f" onSubmit={submit}>
      <div className="fld"><label htmlFor="p-nom">Nom</label><input id="p-nom" name="lastName" required autoComplete="family-name" /></div>
      <div className="fld"><label htmlFor="p-prenom">Prénom</label><input id="p-prenom" name="firstName" required autoComplete="given-name" /></div>
      <div className="fld"><label htmlFor="p-tel">Téléphone / WhatsApp</label><input id="p-tel" name="phone" type="tel" required autoComplete="tel" /></div>
      <div className="fld"><label htmlFor="p-mail">E-mail</label><input id="p-mail" name="email" type="email" required autoComplete="email" /></div>
      <div className="fld full"><label htmlFor="p-type">Type d&apos;événement</label>
        <select id="p-type" name="eventType" required defaultValue="">
          <option value="" disabled>Choisir…</option>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select></div>
      <div className="fld"><label htmlFor="p-date">Date souhaitée</label><input id="p-date" name="desiredDate" type="date" /></div>
      <div className="fld"><label htmlFor="p-nb">Nombre de participants</label><input id="p-nb" name="participants" type="number" min={1} inputMode="numeric" /></div>
      <div className="fld full"><label htmlFor="p-lieu">Lieu de l&apos;événement</label><input id="p-lieu" name="location" /></div>
      <div className="fld full"><label htmlFor="p-msg">Message / détails du projet</label><textarea id="p-msg" name="message" /></div>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error && <div className="err" role="alert">{error}</div>}
      <button className="btn fill" type="submit" disabled={state === "sending"}>{state === "sending" ? "Envoi…" : "Envoyer ma demande"}</button>
    </form>
  );
}
