import type { Metadata } from "next";
import { Dashboard } from "@/PetOwner/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard — PawCare",
  description: "Manage your pets, appointments, vaccinations, and medical records.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
