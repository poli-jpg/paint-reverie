import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Autorise aussi l'adresse réseau locale en développement (sinon la page ne se met pas à jour).
  allowedDevOrigins: ["192.168.56.1"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
