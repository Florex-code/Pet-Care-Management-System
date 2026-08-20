import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PawCare — Better care for every pet",
    short_name: "PawCare",
    description:
      "Appointments, health records, reminders, and adoption in one caring place.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f2",
    theme_color: "#ef7d42",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/pawcare-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
