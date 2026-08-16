import type { Icon } from "@phosphor-icons/react";
import { Bell, CalendarBlank, ChatCircle, CreditCard, FileText, Gear, Heart, House, PawPrint, Prescription, Syringe } from "@phosphor-icons/react";

export type Tone = "orange" | "green" | "blue" | "purple";
export type NavItem = { id: string; label: string; icon: Icon };
export type Pet = { id: string; name: string; sex: "Male" | "Female"; breed: string; age: string; image?: string; position?: string; status: string };
export type Appointment = { id: string; pet: string; type: string; clinician: string; date: string; time: string };
export type Activity = { id: string; icon: Icon; tone: Tone; title: string; detail: string; time: string };

// Typed seed data mirrors the response shapes a backend can provide later.
export const navigation: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: House }, { id: "my-pets", label: "My Pets", icon: PawPrint },
  { id: "appointments", label: "Appointments", icon: CalendarBlank }, { id: "medical-records", label: "Medical Records", icon: FileText },
  { id: "vaccinations", label: "Vaccinations", icon: Syringe }, { id: "prescriptions", label: "Prescriptions", icon: Prescription },
  { id: "adoption", label: "Adoption", icon: Heart }, { id: "messages", label: "Messages", icon: ChatCircle },
  { id: "payments", label: "Payments", icon: CreditCard }, { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Gear },
];

export const initialPets: Pet[] = [
  { id: "pet-max", name: "Max", sex: "Male", breed: "Golden Retriever", age: "3 years, 2 months", image: "/images/hero-pets.png", position: "78% center", status: "Healthy" },
  { id: "pet-luna", name: "Luna", sex: "Female", breed: "British Shorthair", age: "2 years, 5 months", image: "/images/hero-pets.png", position: "49% center", status: "Healthy" },
  { id: "pet-coco", name: "Coco", sex: "Female", breed: "Holland Lop", age: "1 year, 3 months", status: "Healthy" },
];

export const initialAppointments: Appointment[] = [
  { id: "appt-max", pet: "Max", type: "General checkup", clinician: "Dr. Emily Carter", date: "2026-08-21", time: "10:00" },
  { id: "appt-luna", pet: "Luna", type: "Vaccination", clinician: "Dr. Emily Carter", date: "2026-08-28", time: "11:30" },
];

export const activities: Activity[] = [
  { id: "act-1", icon: Syringe, tone: "green", title: "Vaccination record added for Max", detail: "Rabies vaccine", time: "2 hours ago" },
  { id: "act-2", icon: CalendarBlank, tone: "blue", title: "Appointment booked for Luna", detail: "General checkup · Aug 28, 2026", time: "5 hours ago" },
  { id: "act-3", icon: FileText, tone: "orange", title: "Medical record updated for Coco", detail: "Ear infection treatment", time: "1 day ago" },
  { id: "act-4", icon: PawPrint, tone: "purple", title: "Adoption application submitted", detail: "Application is under review", time: "2 days ago" },
];
