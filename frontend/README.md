# Appointment Management System — Frontend

Admin dashboard for the Appointment Management System built with **Vue 3 + TypeScript**, **Tailwind CSS v4**, and **Vue Router 4**.

---

## Requirements

| Tool | Version |
|------|---------|
| Node.js | >= 20.18.0 |
| npm | >= 10 |

> **IDE:** [VS Code](https://code.visualstudio.com/) with the [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension (disable Vetur if installed).

---

## Project Structure

```
frontend/
├── src/
│   ├── api/          # Axios API modules (one per resource)
│   ├── assets/       # Global CSS (Tailwind + custom classes)
│   ├── components/
│   │   ├── common/   # AppModal, StatCard, StatusBadge, ConfirmDialog, PageHeader, ToastNotification
│   │   └── layout/   # AppSidebar, AppHeader, AppLayout
│   ├── composables/  # useAuth, useToast
│   ├── router/       # Vue Router with auth guard
│   ├── types/        # TypeScript interfaces
│   └── views/        # One folder per module (12 modules)
├── .env              # API base URL
└── vite.config.ts
```

---

## Running the Backend

The frontend depends on the Express backend running on port **3000**.

```sh
# From the project root
cd appointment-management-system/backend

# Install dependencies (first time only)
npm install

# Run database migrations (first time only)
npm run drizzle:migrate

# Seed the database with initial data (first time only)
npm run drizzle:seed

# Start the backend dev server (port 3000)
npm run dev
```

The backend API will be available at `http://localhost:3000/api`.

---

## Running the Frontend

```sh
# From the project root
cd appointment-management-system/frontend

# Install dependencies (first time only)
npm install

# Start the frontend dev server (port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

### Environment Variable

The frontend reads the API base URL from `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

If the backend runs on a different port or host, update this value and restart the dev server.

---

## Running Both Servers (Recommended)

Open **two terminals** side by side:

**Terminal 1 — Backend**
```sh
cd appointment-management-system/backend
npm run dev
```

**Terminal 2 — Frontend**
```sh
cd appointment-management-system/frontend
npm run dev
```

Then open `http://localhost:5173`.

---

## Login

Use the admin account created by the seed script:

| Field | Value |
|-------|-------|
| Email | *(set in seed file)* |
| Password | *(set in seed file)* |

After logging in you will be redirected to the dashboard. All 12 modules are accessible from the sidebar:

- **Dashboard** — KPI stats + recent activity
- **Organizations** — top-level org management
- **Businesses** — business units per org
- **Users** — staff accounts & roles
- **Clients** — client records
- **Services** — offered services with pricing
- **Locations** — physical/virtual locations
- **Schedules** — staff availability schedules
- **Appointments** — booking lifecycle management
- **Charges** — fee types & rates
- **Invoices** — billing & payment tracking
- **User Abilities** — custom role permissions

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with HMR at `http://localhost:5173` |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | Run `vue-tsc` type checking only |
