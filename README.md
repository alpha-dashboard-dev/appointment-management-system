# Appointment Management System

A **multi-tenant** appointment management system.

- **Backend:** Node.js · Express · TypeScript · Sequelize · MySQL  
- **Frontend:** Vue 3 · Vite · Pinia (located in `frontend/`)

---

## Quick Start

### 1. Install dependencies

```bash
# Backend (project root)
npm install

# Frontend
cd frontend && npm install
```

### 2. Configure environment

Create `.env` in the project root:

```env
PORT=5000
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_password
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_NAME=ams_db
DATABASE_URL=mysql://root:your_password@127.0.0.1:3306/ams_db
JWT_ACCESS_TOKEN=your_jwt_secret
JWT_ACCESS_TOKEN_EXPIRES=1d
JWT_REFRESH_TOKEN=your_refresh_secret
JWT_REFRESH_TOKEN_EXPIRES=7d
ORM=sequelize
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Create the database

```sql
CREATE DATABASE ams_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run migrations and seed

```bash
npm run sequelize:migrate
npm run sequelize:seed
```

Default admin credentials after seeding:
- **Email:** `admin@test.com`
- **Password:** `Admin@123`

### 5. Start the servers

```bash
# Terminal 1 — backend (http://localhost:5000)
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## Full Testing Guide

See **[frontend/README.md](./frontend/README.md)** for the complete step-by-step testing guide covering all five roles:

1. **Admin** — organization, business, user setup  
2. **Business Owner** — services, locations, charges, staff, schedules  
3. **Operational Staff** — pending requests, staff assignment, approve/reject, reschedule  
4. **Service Staff** — view assigned appointments and schedule  
5. **Client** — book appointment, see charges, respond to reschedule offers  

---

## Useful Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend in watch mode |
| `npm run sequelize:migrate` | Run all pending migrations |
| `npm run sequelize:seed` | Seed initial data (admin user) |
| `npm run sequelize:migrate:undo:all` | Drop all tables |
| `npm run sequelize:seed:undo` | Remove seeded data |
