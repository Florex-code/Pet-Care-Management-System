import { FirstAid, FolderOpen, ShieldCheck, UsersThree } from "@phosphor-icons/react/dist/ssr";

export const serviceData = {
  "veterinary-care": {
    title: "Veterinary care", eyebrow: "Professional care", icon: FirstAid,
    summary: "Book trusted veterinarians and manage every stage of your pet’s visit from one place.",
    description: "PawCare connects pet owners with veterinarians while keeping appointments and clinical follow-up organised. Owners can request a convenient date, select a veterinarian, explain the reason for the visit, and follow the appointment status from their dashboard.",
    includes: ["Veterinarian selection and appointment requests", "Appointment acceptance, rejection, and cancellation", "Visit reason and scheduled time", "Post-visit diagnosis and treatment records", "Follow-up notes and care recommendations"],
    steps: [["Request a visit", "Choose your pet, veterinarian, date, time, and reason."], ["Receive confirmation", "The veterinarian reviews and accepts or rejects the request."], ["Continue care", "Clinical notes and treatment information are saved after the visit."]],
    cta: "Book an appointment", href: "/login",
  },
  "vaccination-tracking": {
    title: "Vaccination tracking", eyebrow: "Preventive health", icon: ShieldCheck,
    summary: "Keep vaccination history organised and know when your pet’s next protection is due.",
    description: "Vaccination records are added by the attending veterinarian and linked directly to the correct pet. Owners can review completed vaccinations alongside other medical information and receive reminders when future care is approaching.",
    includes: ["Vaccination name and administration date", "Veterinarian-linked clinical entry", "Upcoming vaccine reminders", "Complete vaccination history per pet", "Records available to owners and care teams"],
    steps: [["Register your pet", "Add accurate identification and basic health information."], ["Visit the veterinarian", "The veterinarian administers and records the vaccination."], ["Track future care", "Review the history and upcoming reminders from your dashboard."]],
    cta: "View pet dashboard", href: "/login",
  },
  "medical-records": {
    title: "Medical records", eyebrow: "Lifelong health history", icon: FolderOpen,
    summary: "Keep diagnoses, treatments, prescriptions, vaccinations, and medical notes together.",
    description: "Every clinical entry is attached to a specific pet and veterinarian, creating a chronological health history. Pet owners receive a clear read-only view, while authorised veterinarians add and maintain clinical information after appointments.",
    includes: ["Visit date and attending veterinarian", "Diagnosis and treatment details", "Medication and prescription information", "Vaccinations and known allergies", "Medical notes and follow-up guidance"],
    steps: [["Complete an appointment", "Clinical records begin with a veterinarian visit."], ["Veterinarian adds details", "Diagnosis, treatment, medicine, vaccines, and notes are recorded."], ["Owner reviews history", "The pet’s complete record remains available in the owner workspace."]],
    cta: "Access medical records", href: "/login",
  },
  "pet-adoption": {
    title: "Pet adoption", eyebrow: "Find a companion", icon: UsersThree,
    summary: "Meet pets looking for safe homes and submit a structured adoption request.",
    description: "Browse available pets, search by name or breed, filter by species, and learn about each animal before applying. Requests are reviewed by an administrator, and owners can follow their application status from the dashboard.",
    includes: ["Public catalogue with clear pet photographs", "Species and search filters", "Pet age, breed, gender, and location", "Secure adoption-request form", "Administrator approval and application tracking"],
    steps: [["Explore available pets", "Use the public catalogue to find a suitable companion."], ["Submit your request", "Sign in as a pet owner and explain why the pet fits your home."], ["Complete the review", "PawCare reviews the request and communicates the next steps."]],
    cta: "View available pets", href: "/adoption",
  },
} as const;

export type ServiceSlug = keyof typeof serviceData;
