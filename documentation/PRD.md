You are to generate a production-ready Next.js 14 application starter template with the following specifications. Be highly precise and ensure all steps are consistent and repeatable, so the application generated is almost identical every time this prompt is used.

## App's feature requirements document 
Business requirement document is @BRD.md , refer to this and decide on the below listed topics
- features and functionality of the application.
- Decide on whether the application needs to maintain the user profile, and if yes then what are all the user specific features/data needs to be maintained for the profile.
- db schema for the application
- user flows of the app
- required pages of the app
- If the application has payments features then based on the mentioned subscription models, maintain the user subscriptions as well. Use Stripe as payment gateway. (Payment gateway integration is a critical third party integration, make sure to create fallbacks and rollbacks for the all the payments related user flows.)

## Framework & Language
- Use Next.js 14 with the **App Router**.
- Use **TypeScript in strict mode**.
- Include **absolute imports** configured via `tsconfig.json`.
- Include ESLint and Prettier configuration.

## Styling & UI
- Install and configure **Tailwind CSS** with PostCSS and Autoprefixer.
- Integrate **shadcn/ui** with the following:
  - Button
  - Input
  - Card
  - Modal/Dialog
  - Navbar
  - Sidebar
  - ThemeToggle (light/dark/system)
- Add a **theming system**:
  - Use Tailwind + CSS variables.
  - Support light and dark mode toggling.
  - The default theme is configurable via `tailwind.config.js`.
  - ### BRAND COLORS
    - Define brand colors in `tailwind.config.js` under `theme.extend.colors`.
    - Example:
      ```ts
      extend: {
        colors: {
          brand: {
            50: '#f5faff',
            100: '#e0f2ff',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9', // primary brand color
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          }
        }
      }
      ```
    - Use `bg-brand-500`, `text-brand-700`, etc. in components.
    - Expose brand colors as CSS variables in `globals.css` so `shadcn/ui` tokes can use them.
  - Ensure responsive and mobile-first layout philosophy.

## Authentication
- Integrate **Clerk** for authentication with:
  - Sign-up
  - Sign-in
  - User profile management
- Place Clerk providers in `app/layout.tsx`.
- Add middleware for protected routes.

## Database Setup (Dual DB Option)
- Use prisma as ORM to setup the schema. Add necessary commands in `package.json` for regular prisma operations.
- Configure **both Supabase and MongoDB**, but design the architecture so either can be enabled independently:
  - Use environment variables to switch between **Supabase** and **MongoDB**.
  - Provide a unified DB service layer with adapters:
    - `lib/db/supabaseClient.ts`
    - `lib/db/mongoClient.ts`
    - `lib/db/index.ts` → exports the active DB client depending on env config.
- Supabase:
  - Use `@supabase/supabase-js`.
  - Provide a ready-to-use client in `lib/db/supabaseClient.ts`.
- MongoDB:
  - Use the official `mongodb` Node.js driver.
  - Configure connection pooling.
  - Provide a ready-to-use client in `lib/db/mongoClient.ts`.

## File Structure
Use a clean, scalable file structure:

/app

/api

/auth [...clerk webhook handlers...]

/data [...db routes...]

/dashboard

/auth

/layout.tsx

/page.tsx

/components

/ui [...shadcn components...]

Navbar.tsx

Sidebar.tsx

ThemeToggle.tsx

/lib

/db

index.ts

supabaseClient.ts

mongoClient.ts

utils.ts

/styles

globals.css

tailwind.config.js

/env

.env.example

/instructions.md

/tsconfig.json

/package.json


## Environment Variables
Generate a `.env.example` with the following:

# Clerk

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

CLERK_SECRET_KEY=

# Supabase

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

# MongoDB

MONGODB_URI=

MONGODB_DB_NAME=

# App Config

NEXT_PUBLIC_APP_URL=[http://localhost:3000](http://localhost:3000/)

NEXT_PUBLIC_DEFAULT_THEME=light

# Brand Colors (Optional overrides)
NEXT_PUBLIC_BRAND_PRIMARY=#0ea5e9
NEXT_PUBLIC_BRAND_SECONDARY=#7dd3fc
NEXT_PUBLIC_BRAND_ACCENT=#facc15
