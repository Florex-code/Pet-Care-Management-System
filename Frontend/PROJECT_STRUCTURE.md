# PawCare frontend structure

The frontend is organised by domain so each collaborator can quickly find their area of work.

```text
src/
├── app/                  Next.js routes (required)
├── Admin/                Administrator interface
├── Adoption/             Public adoption catalogue and styles
├── Appointment/          Appointment interface
├── Authentication/       Login, registration, and password recovery
├── Contact/              Contact page and form
├── Data/                 Shared frontend types and browser data store
├── LandingPage/          Public homepage and its sections
├── MedicalManagement/    Medical-record interface
├── Notifications/        Notification interface
├── Pet/                  Pet registration and profile interface
├── PetOwner/             Role-aware dashboard and pet-owner styles
├── shared/               Reusable navbar, footer, and logo
└── Veterinarian/         Veterinarian interface
```

Only frontend directories are included. No backend root or backend services were added.

The `src/app` folder should remain limited to route entry points and metadata. Feature-specific frontend files belong in their matching domain folder.
