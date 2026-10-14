import type { MetadataRoute } from "next";
import { brandSettings } from "@/settings";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brandSettings.title,
    short_name: brandSettings.name,
    description: brandSettings.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#2f5d50",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
