import type { Metadata } from "next";
import "./globals.css";
import "../features/landing-page/LandingPage.css";
import "../features/contact-page/ContactPage.css";

export const metadata: Metadata = {
  title: "PawCare — Better care for every pet",
  description: "Keep your pet's health, appointments, records, and care in one friendly place.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
