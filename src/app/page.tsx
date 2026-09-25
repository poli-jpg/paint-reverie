import Image from "next/image";
import Header from "@/components/Header";
import Workshops from "@/components/Workshops";
import PrivateForm from "@/components/PrivateForm";
import GalleryPolas from "@/components/GalleryPolas";
import { supabase } from "@/lib/supabase";
import type { Contact, GalleryItem, Workshop } from "@/lib/types";

export const revalidate = 60; // les ateliers et places restantes se rafraîchissent chaque minute

const FALLBACK_CONTACT: Contact = {
  whatsapp: "+221763966507", instagram: "thepaintreverie_", tiktok: "thepaintreverie_", snapchat: "paintreverie",
};

export default async function Home() {
  const [w, g, s] = await Promise.all([
    supabase.from("workshops_availability").select("*").gte("starts_at", new Date().toISOString()).order("starts_at"),
    supabase.from("gallery_items").select("id,media_url,media_type,caption,orientation").eq("published", true).order("sort_order").limit(8),
    supabase.from("site_settings").select("value").eq("key", "contact").maybeSingle(),
  ]);
  const workshops = (w.data ?? []) as Workshop[];
  const gallery = (g.data ?? []) as GalleryItem[];
  const contact: Contact = { ...FALLBACK_CONTACT, ...(s.data?.value ?? {}) };
  const waDigits = contact.whatsapp.replace(/\D/g, "");

  return (
    <>
      <Header />
      <main id="top">
        <section className="hero"><div className="wrap">
          <div className="load">
            <h1>The Paint Reverie</h1>
            <div className="by">by Fatima</div>
            <div className="sig">PAINT ✦ CREATE ✦ DREAM</div>
            <p className="lead">Une toile, des couleurs et les gens que vous aimez. Venez peindre, on s&apos;occupe du reste.</p>
            <div className="ctas">
              <a className="btn fill" href="#ateliers">Découvrir les ateliers</a>
              <a className="btn line" href="#prives">Organiser un atelier privé</a>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="ribbon"></div>
            <div className="canvas"><small>Photo d&apos;une toile de l&apos;atelier</small></div>
            <div className="tag">Paint Cam</div>
          </div>
        </div></section>

        <section className="concept"><div className="wrap">
          <div className="script">Le concept</div>
          <div>
            <p>The Paint Reverie, c&apos;est un atelier de peinture pensé pour créer, partager et simplement passer un bon moment.</p>
            <p>Une toile, quelques couleurs, de bonnes vibes et des souvenirs à créer. Pas besoin d&apos;être artiste : on vient profiter, et on repart avec sa propre création.</p>
            <div className="list"><span className="chip">Matériel fourni</span><span className="chip">Cocktail sur place</span><span className="chip">Séance photo Paint Cam</span><span className="chip">Repartez avec votre toile</span></div>
          </div>
        </div></section>

        <section className="ateliers" id="ateliers"><div className="wrap">
          <div className="head"><h2>Nos prochains ateliers</h2><p>Réservez votre place en ligne.</p></div>
          <Workshops workshops={workshops} />
        </div></section>

        <section className="prive" id="prives"><div className="wrap">
          <div>
            <div className="script">Votre événement,<br />notre atelier.</div>
            <p>Un anniversaire, une soirée entre amis, un événement d&apos;entreprise ? The Paint Reverie vient à vous et crée un atelier peinture pensé pour votre événement.</p>
            <a className="btn" href="#demande">Organiser mon atelier</a>
          </div>
          <ul><li>Anniversaires</li><li>Soirées entre amis</li><li>Team building</li><li>Événements d&apos;entreprise et collaborations</li></ul>
        </div></section>

        <section className="demande" id="demande"><div className="wrap">
          <div>
            <div className="script">Organiser mon atelier</div>
            <p>Racontez-nous votre événement. On revient vers vous rapidement pour en parler et vous proposer un tarif adapté.</p>
          </div>
          <div><PrivateForm /></div>
        </div></section>

        <section className="galerie" id="galerie"><div className="wrap">
          <div className="head"><h2>Dans l&apos;atelier</h2></div>
          <GalleryPolas items={gallery} />
        </div></section>

        <section className="about" id="apropos"><div className="wrap">
          <blockquote>« The Paint Reverie est née d&apos;une envie simple : créer un endroit où l&apos;on peut ralentir, créer quelque chose de ses propres mains et surtout passer un bon moment. »</blockquote>
          <div className="script">Fatima</div>
        </div></section>
      </main>

      <footer id="contact"><div className="wrap">
        <div className="logo">The Paint Reverie</div>
        <div className="by" style={{ margin: "2px 0 10px" }}>by Fatima</div>
        <div className="sig" style={{ margin: 0 }}>PAINT ✦ CREATE ✦ DREAM</div>
        <nav><ul>
          <li><a href="#top">Accueil</a></li><li><a href="#ateliers">Ateliers</a></li><li><a href="#prives">Ateliers privés</a></li>
          <li><a href="#galerie">Galerie</a></li><li><a href="#contact">Contact</a></li>
        </ul></nav>
        <div className="soc">
          <a href={`https://wa.me/${waDigits}`}>WhatsApp</a>
          <a href={`https://instagram.com/${contact.instagram}`}>Instagram</a>
          <a href={`https://tiktok.com/@${contact.tiktok}`}>TikTok</a>
          <a href={`https://www.snapchat.com/add/${contact.snapchat}`}>Snapchat</a>
        </div>
        <div className="wa">{contact.whatsapp.replace(/(\+\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")}</div>
      </div></footer>
    </>
  );
}
