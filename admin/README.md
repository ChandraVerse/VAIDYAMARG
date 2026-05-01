# VaidyaMarg Admin Panel

Vite + React + TypeScript admin panel for VaidyaMarg operations.

## Stack

- **Vite 5** + **React 18** + **TypeScript**
- **Tailwind CSS 3** for styling
- **TanStack Query v5** for server state
- **Zustand** for client auth state
- **React Hook Form + Zod** for forms
- **Recharts** for charts
- **Lucide React** for icons

## Setup

```bash
cd admin
npm install
cp .env.example .env
npm run dev
```

The dev server starts at `http://localhost:5173` and proxies `/api` to `localhost:3000`.

## Pages

| Route | Description |
|---|---|
| `/login` | Email + password login for admin/pharmacist |
| `/dashboard` | KPIs, revenue chart, orders chart |
| `/orders` | Order list with status filter; click for detail + status update |
| `/prescriptions` | Pending Rx queue; side-by-side image review + approve/reject |
| `/medicines` | Inventory list; add, edit, delete |
| `/users` | Registered patient list |

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the build locally
```
