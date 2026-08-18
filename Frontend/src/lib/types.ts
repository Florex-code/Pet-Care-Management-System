export type Role = "owner" | "vet" | "admin";
export type User = { id: string; name: string; email: string; role: Role; specialty?: string; status: "Active" | "Suspended" };
export type Pet = { id: string; ownerId: string; name: string; species: string; breed: string; gender: string; dob: string; weight: string; photo?: string; healthStatus: string; allergies: string };
export type Appointment = { id: string; petId: string; ownerId: string; vetId: string; date: string; time: string; reason: string; status: "Pending" | "Accepted" | "Rejected" | "Cancelled" | "Completed" };
export type MedicalRecord = { id: string; petId: string; vetId: string; date: string; diagnosis: string; treatment: string; medication: string; vaccination: string; notes: string };
export type Adoption = { id: string; name: string; species: string; breed: string; age: string; photo?: string; status: "Available" | "Pending" | "Adopted"; applicantId?: string };
export type Notice = { id: string; userId: string; text: string; read: boolean };
export type Store = { users: User[]; pets: Pet[]; appointments: Appointment[]; records: MedicalRecord[]; adoptions: Adoption[]; notices: Notice[] };
