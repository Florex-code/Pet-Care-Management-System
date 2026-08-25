# PawCare backend structure

The backend is organized by business domain so related controllers, services,
entities, repositories, and DTOs stay together.

```text
Backend/
|-- src/
|   |-- main/
|   |   |-- java/com/pawcare/backend/
|   |   |   |-- auth/             Registration, login, tokens, password reset
|   |   |   |-- user/             Accounts, profiles, and roles
|   |   |   |-- pet/              Pet profiles and ownership
|   |   |   |-- appointment/      Booking, scheduling, and status changes
|   |   |   |-- medicalrecord/    Clinical records and vaccinations
|   |   |   |-- adoption/         Listings and adoption applications
|   |   |   |-- notification/     In-app and email notifications
|   |   |   |-- storage/          Pet-image and document storage
|   |   |   |-- common/           Shared errors, responses, and utilities
|   |   |   `-- config/           Security, CORS, OpenAPI, and app config
|   |   `-- resources/
|   |       `-- db/migration/      Flyway database migrations
|   `-- test/
|       `-- java/com/pawcare/backend/
|-- README.md
`-- PROJECT_STRUCTURE.md
```

Each domain package can contain only what it needs:

```text
pet/
|-- PetController.java
|-- PetService.java
|-- PetRepository.java
|-- Pet.java
`-- dto/
    |-- CreatePetRequest.java
    `-- PetResponse.java
```

When development starts, generate the Spring Boot project directly into this
folder using Java 21 and add Spring Web, Spring Security, Spring Data JPA,
Validation, PostgreSQL, Flyway, and Actuator.

