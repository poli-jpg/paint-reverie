"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      console.error("[login] Supabase:", error);
      setError(`Connexion refusée : ${error.message}`);
      return;
    }
    // Navigation complète pour que le middleware reçoive bien les cookies de session.
    window.location.href = "/admin/workshops";
  }

  return (
    <div className="admin-login">
      <form className="admin-card" onSubmit={submit}>
        <h2 className="script" style={{ fontSize: 40, color: "var(--wine)" }}>The Paint Reverie</h2>
        <p style={{ color: "var(--soft)", marginBottom: 8 }}>Espace de Fatima</p>
        <div className="fld"><label htmlFor="email">E-mail</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></div>
        <div className="fld"><label htmlFor="pw">Mot de passe</label>
          <input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {error && <div className="err" role="alert">{error}</div>}
        <button className="btn fill" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
