# PawCare backend

Spring Boot REST API for PawCare, built with Java 21, Maven, PostgreSQL, JPA,
Flyway, Spring Security, Validation, and Actuator.

## Run locally

Prerequisites: Java 21, Maven 3.6.3+, and Docker (or a local PostgreSQL server).

```powershell
docker compose up -d
mvn spring-boot:run
```

The API runs at `http://localhost:8080`. Check it with:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/health
```

Configuration can be overridden with `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`,
`SERVER_PORT`, and `CORS_ALLOWED_ORIGINS`. The last setting accepts a
comma-separated list of frontend origins.

Run the test suite with `mvn test`. See [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md)
for the domain-oriented package layout.
