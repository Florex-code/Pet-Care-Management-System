import type { Adoption, Appointment, MedicalRecord, Pet, Store } from "@/Data/types";
import { apiRequest } from "./client";

export function getDashboard() {
  return apiRequest<Store>("/v1/dashboard", { cache: "no-store" });
}

export type PetInput = Omit<Pet, "id" | "ownerId">;

export function createPet(input: PetInput) {
  return apiRequest<Pet>("/v1/pets", { method: "POST", body: JSON.stringify(input) });
}

export function updatePet(id: string, input: PetInput) {
  return apiRequest<Pet>(`/v1/pets/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function createAppointment(input: Pick<Appointment, "petId" | "vetId" | "date" | "time" | "reason">) {
  return apiRequest<Appointment>("/v1/appointments", { method: "POST", body: JSON.stringify(input) });
}

export function rescheduleAppointment(id: string, input: Pick<Appointment, "petId" | "vetId" | "date" | "time" | "reason">) {
  return apiRequest<Appointment>(`/v1/appointments/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function cancelAppointment(id: string) {
  return apiRequest<Appointment>(`/v1/appointments/${id}/cancel`, { method: "PATCH" });
}

export function updateAppointmentStatus(id: string, status: Appointment["status"]) {
  return apiRequest<Appointment>(`/v1/appointments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function createMedicalRecord(input: Omit<MedicalRecord, "id" | "vetId">) {
  return apiRequest<MedicalRecord>("/v1/medical-records", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getPublicAdoptions() {
  return apiRequest<Adoption[]>("/v1/adoptions", { cache: "no-store" });
}

export function requestAdoption(id: string, message: string) {
  return apiRequest<Adoption>(`/v1/adoptions/${id}/request`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function createAdoption(input: Pick<Adoption, "name" | "species" | "breed" | "age" | "photo">) {
  return apiRequest<Adoption>("/v1/adoptions", { method: "POST", body: JSON.stringify(input) });
}

export function updateAdoption(id: string, input: Pick<Adoption, "name" | "species" | "breed" | "age" | "photo">) {
  return apiRequest<Adoption>(`/v1/adoptions/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function reviewAdoption(id: string, status: Adoption["status"]) {
  return apiRequest<Adoption>(`/v1/adoptions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function markNotificationRead(id: string) {
  return apiRequest<void>(`/v1/notifications/${id}/read`, { method: "PATCH" });
}
