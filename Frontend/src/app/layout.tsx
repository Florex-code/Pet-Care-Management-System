import type { Metadata } from "next";
import { PwaRegister } from "@/shared/components/PwaRegister";
import { NetworkLoader } from "@/shared/components/NetworkLoader";
import "./globals.css";
import "../LandingPage/LandingPage.css";
import "../Contact/ContactPage.css";
import "../mobile.css";

export const metadata: Metadata = {
  title: "PawCare — Better care for every pet",
  description:
    "Keep your pet's health, appointments, records, and care in one friendly place.",
  applicationName: "PawCare",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "PawCare" },
  icons: { icon: "/pawcare-icon.svg", apple: "/pawcare-icon.svg" },
};

export const viewport = {
  themeColor: "#fbf8f2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <NetworkLoader />
        <PwaRegister />
      </body>
    </html>
  );
}
