import type { Metadata } from "next";
import { AdoptionPage } from "@/Adoption/AdoptionPage";

export const metadata: Metadata = { title: "Available Pets | PawCare", description: "Meet pets available for adoption and submit an adoption request through PawCare." };
export default function Page() { return <AdoptionPage />; }
