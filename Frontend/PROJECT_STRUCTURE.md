# PawCare frontend structure

The application is organised by feature so contributors can work without searching through unrelated files.

```text
src/
├── app/                       Next.js routes only
│   ├── contact/
│   ├── dashboard/
│   ├── forgot-password/
│   ├── login/
│   └── register/
├── features/                  Complete application features
│   ├── authentication/
│   │   ├── Authentication.tsx
│   │   └── Authentication.module.css
│   ├── contact-page/
│   │   ├── ContactForm.tsx
│   │   ├── ContactPage.tsx
│   │   └── ContactPage.css
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   └── Dashboard.module.css
│   └── landing-page/
│       ├── components/        Landing-page sections
│       ├── LandingPage.tsx
│       └── LandingPage.css
├── lib/                       Data types and browser storage
└── shared/
    └── components/            Navbar, footer, and logo
```

## Where to make changes

- Change a route URL or page metadata in `src/app`.
- Change a screen or workflow in its matching `src/features` folder.
- Change the navbar, footer, or logo in `src/shared/components`.
- Change shared data definitions in `src/lib/types.ts`.
- Change demo data or persistence in `src/lib/store.ts`.

Each feature keeps its component and stylesheet together. New feature-specific components should go inside that feature folder instead of `shared`.
