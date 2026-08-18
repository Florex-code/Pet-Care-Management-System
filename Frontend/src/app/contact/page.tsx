import type { Metadata } from "next";
import { ContactPage as ContactPageFeature } from "@/features/contact-page/ContactPage";

export const metadata: Metadata = { title: "Contact | PawCare", description: "Contact PawCare for pet care, appointments, records, adoption, and account support." };

export default function ContactPage() {
  return <ContactPageFeature />;
}
