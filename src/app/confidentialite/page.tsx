import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — The Paint Reverie",
  description: "Comment The Paint Reverie collecte, utilise et protège vos données personnelles.",
};

const EMAIL = "thepaintreverie@gmail.com";
const WHATSAPP = "+221 76 396 65 07";

export default function Confidentialite() {
  return (
    <main className="legal">
      <a className="back" href="/">← Retour au site</a>
      <h1>Politique de confidentialité</h1>
      <p className="upd">Dernière mise à jour : 28 septembre 2026</p>

      <p>
        The Paint Reverie by Fatima (« nous ») organise des ateliers de peinture au Sénégal. Cette page explique quelles
        informations nous recueillons via ce site, pourquoi, et quels sont vos droits.
      </p>

      <h2>Données que nous collectons</h2>
      <ul>
        <li><b>Réservation d&apos;un atelier</b> : prénom, nom, numéro de téléphone / WhatsApp, e-mail, nombre de places et informations complémentaires que vous choisissez d&apos;indiquer.</li>
        <li><b>Demande d&apos;atelier privé</b> : prénom, nom, téléphone, e-mail, type d&apos;événement, date souhaitée, nombre de participants, lieu et message.</li>
      </ul>
      <p>Nous ne collectons aucune donnée bancaire sur ce site : l&apos;acompte se règle directement avec Fatima.</p>

      <h2>Pourquoi nous les utilisons</h2>
      <ul>
        <li>Enregistrer et gérer votre réservation ou votre demande ;</li>
        <li>Vous contacter (WhatsApp, téléphone ou e-mail) au sujet de l&apos;atelier, de l&apos;acompte ou de votre événement ;</li>
        <li>Vous envoyer un e-mail de confirmation.</li>
      </ul>
      <p>Vos données ne sont jamais vendues ni utilisées pour de la publicité.</p>

      <h2>Qui y a accès</h2>
      <p>
        Seule Fatima, via un espace d&apos;administration protégé par mot de passe. Pour faire fonctionner le site, nous
        utilisons des prestataires techniques qui hébergent ou transmettent ces données pour notre compte : Supabase
        (base de données), Vercel (hébergement du site) et Resend (envoi des e-mails).
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Nous conservons vos informations le temps nécessaire à l&apos;organisation de l&apos;atelier et au suivi de la
        relation, puis au maximum 3 ans après notre dernier échange. Vous pouvez demander leur suppression à tout moment.
      </p>

      <h2>Cookies</h2>
      <p>
        Le site n&apos;utilise pas de cookies publicitaires ni de mesure d&apos;audience. Seul un cookie technique est utilisé
        pour la connexion à l&apos;espace d&apos;administration.
      </p>

      <h2>Vos droits</h2>
      <p>
        Conformément à la loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère
        personnel, vous pouvez demander à accéder à vos données, les corriger ou les faire supprimer, et vous opposer à
        leur utilisation. Il suffit de nous écrire à <a href={`mailto:${EMAIL}`}>{EMAIL}</a> ou sur WhatsApp au {WHATSAPP}.
        Vous pouvez aussi saisir la Commission de Protection des Données Personnelles (CDP) du Sénégal.
      </p>

      <h2>Contact</h2>
      <p>
        The Paint Reverie by Fatima — <a href={`mailto:${EMAIL}`}>{EMAIL}</a> — WhatsApp {WHATSAPP}
      </p>
    </main>
  );
}
