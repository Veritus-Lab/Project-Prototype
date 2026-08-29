import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "FLERNK", short_name: "FLERNK", description: "Plataforma para assessorias esportivas de corrida.", start_url: "/atleta", display: "standalone", lang: "pt-BR", background_color: "#101315", theme_color: "#101315", icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }, { src: "/flernk-logo.jpg", sizes: "any", type: "image/jpeg" }] };
}
