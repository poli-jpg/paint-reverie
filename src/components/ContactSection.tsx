import type { Contact } from "@/lib/types";

// Icônes simples (trait fin), aux couleurs du site.
const I = {
  chat: <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.5A8.4 8.4 0 1 1 21 11.5z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  camera: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></>,
  note: <><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>,
  smile: <><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  brush: <><path d="M14.5 4.5 19.5 9.5 11 18l-5-5z" /><path d="M6 13c-2 .5-3 2-3 4.5 0 1 .5 2.5 2.5 2.5C8 20 9.5 19 10 17" /></>,
  arrow: <path d="M7 17 17 7M9 7h8v8" />,
};
const Icon = ({ d }: { d: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

export default function ContactSection({ contact }: { contact: Contact }) {
  const wa = contact.whatsapp.replace(/\D/g, "");
  const phone = contact.whatsapp.replace(/(\+\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
  const hello = encodeURIComponent("Bonjour Fatima 🎨 J'ai une question sur les ateliers The Paint Reverie.");

  const channels = [
    { icon: I.chat, label: "WhatsApp", value: phone, href: `https://wa.me/${wa}?text=${hello}` },
    { icon: I.mail, label: "E-mail", value: contact.email, href: `mailto:${contact.email}` },
    { icon: I.camera, label: "Instagram", value: `@${contact.instagram}`, href: `https://instagram.com/${contact.instagram}` },
    { icon: I.note, label: "TikTok", value: `@${contact.tiktok}`, href: `https://tiktok.com/@${contact.tiktok}` },
    { icon: I.smile, label: "Snapchat", value: contact.snapchat, href: `https://www.snapchat.com/add/${contact.snapchat}` },
  ];

  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <svg className="contact-stroke" viewBox="0 0 600 200" aria-hidden="true">
        <path d="M20 140C120 60 220 170 330 100S520 40 580 90" />
      </svg>
      <div className="wrap">
        <div className="contact-intro">
          <div className="script">Parlons peinture</div>
          <h2 id="contact-title">Une question, une idée, une envie de toile ?</h2>
          <p>
            Pour réserver, organiser un atelier privé ou simplement dire bonjour, Fatima vous répond personnellement.
            Le plus rapide, c&apos;est WhatsApp.
          </p>
          <a className="btn fill contact-cta" href={`https://wa.me/${wa}?text=${hello}`} target="_blank" rel="noopener noreferrer">
            <Icon d={I.chat} /> Écrire sur WhatsApp
          </a>
          <ul className="contact-facts">
            <li><Icon d={I.pin} /> Dakar, Sénégal</li>
            <li><Icon d={I.brush} /> Ateliers sur place ou chez vous</li>
          </ul>
        </div>

        <div className="contact-card">
          {channels.map((c) => (
            <a key={c.label} className="contact-row" href={c.href}
               {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              <span className="contact-ico"><Icon d={c.icon} /></span>
              <span className="contact-txt">
                <span className="contact-label">{c.label}</span>
                <span className="contact-value">
                  {c.value.includes("@") && !c.value.startsWith("@")
                    ? <>{c.value.split("@")[0]}<wbr />@{c.value.split("@")[1]}</>
                    : c.value}
                </span>
              </span>
              <span className="contact-arrow"><Icon d={I.arrow} /></span>
            </a>
          ))}
          <div className="contact-sign">
            <span className="script">Fatima</span>
            <span>PAINT ✦ CREATE ✦ DREAM</span>
          </div>
        </div>
      </div>
    </section>
  );
}
