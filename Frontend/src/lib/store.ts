import type { Store, User } from "./types";

export const demoUsers: User[] = [
  { id: "owner-1", name: "Sarah Johnson", email: "owner@pawcare.test", role: "owner", status: "Active" },
  { id: "vet-1", name: "Dr. Emily Carter", email: "vet@pawcare.test", role: "vet", specialty: "General veterinary care", status: "Active" },
  { id: "admin-1", name: "PawCare Admin", email: "admin@pawcare.test", role: "admin", status: "Active" },
];
export const seed: Store = {
  users: demoUsers,
  pets: [
    { id: "pet-max", ownerId: "owner-1", name: "Max", species: "Dog", breed: "Golden Retriever", gender: "Male", dob: "2023-06-12", weight: "28 kg", healthStatus: "Healthy", allergies: "None known" },
    { id: "pet-luna", ownerId: "owner-1", name: "Luna", species: "Cat", breed: "British Shorthair", gender: "Female", dob: "2024-03-08", weight: "5 kg", healthStatus: "Vaccine due", allergies: "Chicken" },
  ],
  appointments: [
    { id: "appt-1", petId: "pet-max", ownerId: "owner-1", vetId: "vet-1", date: "2026-08-21", time: "10:00", reason: "Annual checkup", status: "Accepted" },
    { id: "appt-2", petId: "pet-luna", ownerId: "owner-1", vetId: "vet-1", date: "2026-08-28", time: "11:30", reason: "Vaccination", status: "Pending" },
  ],
  records: [{ id: "rec-1", petId: "pet-max", vetId: "vet-1", date: "2026-07-10", diagnosis: "Healthy", treatment: "Routine examination", medication: "None", vaccination: "Rabies booster", notes: "Return in 12 months." }],
  adoptions: [
    { id: "adopt-1", name: "Milo", species: "Dog", breed: "Golden Retriever", age: "2 years", photo: "/images/adoption/milo.jpg", status: "Available" },
    { id: "adopt-2", name: "Nala", species: "Cat", breed: "Domestic shorthair", age: "1 year", photo: "/images/adoption/nala.jpg", status: "Available" },
    { id: "adopt-3", name: "Bailey", species: "Dog", breed: "Labrador Retriever", age: "3 years", photo: "/images/adoption/bailey.jpg", status: "Available" },
    { id: "adopt-4", name: "Simba", species: "Cat", breed: "Brown tabby", age: "2 years", photo: "/images/adoption/simba.jpg", status: "Available" },
    { id: "adopt-5", name: "Daisy", species: "Dog", breed: "Pembroke Welsh Corgi", age: "18 months", photo: "/images/adoption/daisy.jpg", status: "Available" },
    { id: "adopt-6", name: "Oliver", species: "Cat", breed: "Long-haired tabby", age: "4 years", photo: "/images/adoption/oliver.jpg", status: "Available" },
    { id: "adopt-7", name: "Rocky", species: "Dog", breed: "German Shepherd", age: "2 years", photo: "/images/adoption/rocky.jpg", status: "Available" },
    { id: "adopt-8", name: "Willow", species: "Cat", breed: "Scottish Fold mix", age: "10 months", photo: "/images/adoption/willow.jpg", status: "Available" },
  ],
  notices: [{ id: "notice-1", userId: "owner-1", text: "Luna’s vaccination is due soon.", read: false }],
};

export const STORE_KEY = "pawcare-store-v2";
export const SESSION_KEY = "pawcare-session-v2";
export function loadStore(): Store {
  try {
    const value = localStorage.getItem(STORE_KEY);
    if (!value) return seed;
    const saved = JSON.parse(value) as Store;
    const missingAdoptions = seed.adoptions.filter((pet) => !saved.adoptions.some((item) => item.id === pet.id));
    const updatedAdoptions = saved.adoptions.map((pet) => {
      const currentSeed = seed.adoptions.find((item) => item.id === pet.id);
      return currentSeed ? { ...pet, breed: currentSeed.breed, photo: pet.photo || currentSeed.photo } : pet;
    });
    return { ...saved, adoptions: [...updatedAdoptions, ...missingAdoptions] };
  } catch { return seed; }
}
export function saveStore(store: Store) { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
