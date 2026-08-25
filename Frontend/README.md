# PawCare frontend

Next.js frontend for PawCare.

## Run with the backend

Start PostgreSQL and Spring Boot from `../Backend`:

```powershell
docker compose up -d
mvn spring-boot:run
```

Then start this application in another terminal:

```powershell
npm install
npm run dev
```

Next.js forwards `/api/backend/*` to the Spring Boot URL configured by
`BACKEND_URL` (default: `http://localhost:8080`). Copy `.env.example` to
`.env.local` when a different backend URL is required.

Browser API calls should use the shared client in `src/shared/api/client.ts`
instead of accessing the backend URL directly.
