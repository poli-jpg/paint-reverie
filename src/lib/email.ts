import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM!;
const NOTIFY = process.env.NOTIFY_EMAIL!;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const shell = (body: string) => `
<div style="font-family:Georgia,serif;max-width:520px;margin:auto;padding:28px;background:#FBF5EE;color:#4A3338">
  <div style="font-size:28px;font-style:italic;color:#8A3F4E">The Paint Reverie</div>
  <div style="letter-spacing:.3em;font-size:11px;color:#C99AA0;margin-bottom:22px">PAINT ✦ CREATE ✦ DREAM</div>
  ${body}
</div>`;

// Les e-mails ne doivent jamais faire échouer une réservation : on log et on continue.
async function safeSend(opts: Parameters<typeof resend.emails.send>[0]) {
  try {
    const { data, error } = await resend.emails.send(opts);
    if (error) console.error(`[email] ÉCHEC vers ${opts.to} :`, error.message);
    else console.log(`[email] envoyé vers ${opts.to} (id ${data?.id})`);
  } catch (e) { console.error("[email] erreur", e); }
}

export async function sendBookingEmails(b: {
  firstName: string; lastName: string; phone: string; email: string; seats: number; notes: string;
  title: string; startsAt: string; location: string; priceFcfa: number;
}) {
  const date = new Date(b.startsAt).toLocaleString("fr-FR", {
    dateStyle: "full", timeStyle: "short", timeZone: "Africa/Dakar",
  });
  const total = (b.priceFcfa * b.seats).toLocaleString("fr-FR");
  await Promise.all([
    safeSend({
      from: FROM, to: b.email,
      subject: `Ta place est réservée : ${b.title}`,
      html: shell(`
        <p>Coucou ${esc(b.firstName)},</p>
        <p>Ta réservation est bien enregistrée pour <b>${esc(b.title)}</b>.</p>
        <p>${esc(date)}<br>${esc(b.location)}<br>${b.seats} place(s), soit ${total} FCFA</p>
        <p>Fatima t'écrit sur WhatsApp pour le paiement. Ta place est confirmée une fois celui-ci reçu.</p>`),
    }),
    safeSend({
      from: FROM, to: NOTIFY,
      subject: `Nouvelle réservation : ${b.firstName} ${b.lastName} (${b.seats})`,
      html: shell(`<p><b>${esc(b.title)}</b> · ${esc(date)}</p>
        <p>${esc(b.firstName)} ${esc(b.lastName)}<br>${esc(b.phone)}<br>${esc(b.email)}<br>${b.seats} place(s), ${total} FCFA</p>
        <p>${esc(b.notes || "Pas de remarque.")}</p>`),
    }),
  ]);
}

export async function sendPrivateRequestEmails(r: {
  firstName: string; lastName: string; phone: string; email: string; eventType: string;
  desiredDate?: string; participants?: number; location: string; message: string;
}) {
  await Promise.all([
    safeSend({
      from: FROM, to: r.email,
      subject: "On a bien reçu ta demande d'atelier",
      html: shell(`<p>Coucou ${esc(r.firstName)},</p>
        <p>Merci pour ta demande d'atelier (${esc(r.eventType)}). Fatima te répond très vite sur WhatsApp ou par e-mail.</p>`),
    }),
    safeSend({
      from: FROM, to: NOTIFY, replyTo: r.email,
      subject: `Demande d'atelier privé : ${r.eventType} (${r.firstName} ${r.lastName})`,
      html: shell(`<p>${esc(r.firstName)} ${esc(r.lastName)}<br>${esc(r.phone)}<br>${esc(r.email)}</p>
        <p>Type : ${esc(r.eventType)}<br>Date : ${esc(r.desiredDate || "à définir")}<br>
        Participants : ${r.participants ?? "?"}<br>Lieu : ${esc(r.location || "?")}</p>
        <p>${esc(r.message || "Pas de message.")}</p>`),
    }),
  ]);
}
