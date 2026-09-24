"use client";
import { useState } from "react";

const links = [
  ["Accueil", "#top"], ["Ateliers", "#ateliers"], ["Ateliers privés", "#prives"],
  ["Galerie", "#galerie"], ["À propos", "#apropos"], ["Contact", "#contact"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header>
      <div className="wrap bar">
        <a className="logo" href="#top">The Paint Reverie</a>
        <button className="burger" aria-label="Ouvrir le menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span></span><span></span>
        </button>
        <nav aria-label="Navigation principale">
          <ul className={open ? "open" : ""}>
            {links.map(([label, href]) => (
              <li key={href}><a href={href} onClick={() => setOpen(false)}>{label}</a></li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
