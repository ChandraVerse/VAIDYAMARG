<div align="center">

<img src="https://img.shields.io/badge/VaidyaMarg-वैद्यमार्ग%20%7C%20ভৈদ্যমার্গ-01696f?style=for-the-badge&labelColor=0f3638&color=01696f" alt="VaidyaMarg" height="40"/>

# VAIDYAMARG — वैद्यमार्ग — ভৈদ্যমার্গ
### *The Way of the Healer*

**Affordable Medicine for Every Indian — Powered by AI**

[![License: MIT](https://img.shields.io/badge/License-MIT-01696f.svg?style=flat-square)](LICENSE)
[![CI](https://github.com/ChandraVerse/VAIDYAMARG/actions/workflows/ci.yml/badge.svg)](https://github.com/ChandraVerse/VAIDYAMARG/actions/workflows/ci.yml)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange?style=flat-square)]()
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-blue?style=flat-square)]()
[![Stack](https://img.shields.io/badge/Stack-React%20Native%20%7C%20NestJS%20%7C%20Python-informational?style=flat-square)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)]()
[![Made in India](https://img.shields.io/badge/Made%20in-India-FF9933?style=flat-square)]()

---

> *"Branded medicine at Rs. 450? The same generic costs Rs. 65. VaidyaMarg bridges that gap."*

[Download App](#) · [Web Portal](#) · [Documentation](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## Table of Contents

- [About the Project](#about-the-project)
- [The Problem](#the-problem)
- [Solution Overview](#solution-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [Business Model](#business-model)
- [Security and Compliance](#security-and-compliance)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About the Project

**VaidyaMarg** (वैद्यमार्ग / ভৈদ্যমার্গ) is an AI-powered affordable medicine delivery platform built for India. The name means *The Way of the Healer* in Sanskrit — a path that connects patients to WHO-GMP certified generic medicines, delivered to their doorstep.

In India, branded medicines cost **3–10x more** than their generic equivalents — for the exact same molecule, the same efficacy, the same therapeutic outcome. VaidyaMarg exists to fix that.

| | |
|---|---|
| **Founded** | 2026 |
| **Based in** | Kolkata, West Bengal, India |
| **Target Market** | 1.4 Billion Indians — starting with Tier 2 and Tier 3 cities |

---

## The Problem

- Branded medicine prices are **3–10x higher** than generic equivalents
- Most patients are unaware that generic alternatives exist
- Prescription management is entirely paper-based and disorganised
- Rural and Tier 2/3 cities have limited access to quality pharmacies
- No single platform provides a transparent branded vs. generic price comparison

---

## Solution Overview

VaidyaMarg addresses the problem in three steps:

```
1. UPLOAD   ->  Patient uploads a doctor's prescription (photo or PDF)
2. DISCOVER ->  AI reads the prescription and shows generic alternatives with price comparison
3. ORDER    ->  Patient orders at 60-80% lower cost, delivered to their doorstep
```

---

## Key Features

### For Patients

- **Prescription Upload** — Photograph a prescription; the AI reads it automatically
- **Smart Medicine Search** — Search by brand name, view generic alternatives side by side
- **Price Comparison** — Real-time branded vs. generic price difference
- **Easy Ordering** — Add to cart and checkout in under 60 seconds
- **Real-time Order Tracking** — Live delivery status updates via Socket.io
- **Refill Reminders** — Monthly reminders for chronic patients (diabetes, hypertension, thyroid)
- **Digital Health Records** — All prescriptions and order history stored securely
- **Multiple Payment Options** — UPI, Cards, Net Banking, Cash on Delivery

### For Pharmacy Partners

- **Partner Dashboard** — Manage inventory, orders, and earnings
- **Sales Analytics** — Popular medicines, customer insights, revenue trends
- **API Integration** — Connect to existing POS systems

### For Administrators

- **Admin Panel** — Manage users, pharmacies, medicines, and orders
- **Pharmacist Verification** — Every prescription reviewed before dispatch
- **Compliance Management** — Drug license, FSSAI, and regulatory tracking

---

## Tech Stack

### Mobile Application

| Technology | Purpose |
|---|---|
| React Native + Expo | Cross-platform mobile app (Android + iOS) |
| NativeWind | Tailwind CSS styling for React Native |
| React Navigation | In-app navigation and deep linking |
| Zustand | Lightweight global state management |

### Admin and Pharmacy Web Dashboard

| Technology | Purpose |
|---|---|
| Vite + React 18 | Fast SPA build tooling |
| Tailwind CSS | Utility-first styling |
| Recharts | Analytics and data visualisation |
| Zustand | Global auth and app state |

### Backend API

| Technology | Purpose |
|---|---|
| Node.js + NestJS | Core REST API — orders, users, medicines |
| Prisma ORM | PostgreSQL schema management and queries |
| Socket.io | Real-time order tracking |
| JWT + OTP (MSG91) | Secure authentication — MSG91 is the sole OTP/SMS provider |
| Bull + Redis | Background job queue for reminders and notifications |

### OCR Microservice

| Technology | Purpose |
|---|---|
| Python + FastAPI | OCR microservice runtime |
| Google Cloud Vision | High-accuracy prescription text detection (~95%) |
| Tesseract OCR | Open-source fallback engine (~75%); supports English, Hindi, Bengali |
| Pillow | Image preprocessing — contrast, sharpness, upscaling |
| Tenacity | Retry logic for backend callbacks (5 attempts, exponential back-off) |

### Database and Storage

| Technology | Purpose |
|---|---|
| PostgreSQL | Primary relational database |
| Redis | Caching (medicine search, sessions, job queues) |
| Cloudinary | Prescription image and medicine photo storage (private) |

### Payments and Communication

| Technology | Purpose |
|---|---|
| Razorpay | Payments — UPI, Cards, COD (India-first) |
| Firebase Cloud Messaging | Push notifications (Android + iOS) |
| MSG91 | OTP verification and SMS alerts |

### DevOps and Infrastructure

| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerisation of all 5 services |
| GitHub Actions | CI/CD pipeline — lint, test, build, and deploy on every push |
| AWS / Railway.app | Cloud hosting (Railway for MVP, AWS for scale) |
| Nginx | Reverse proxy and load balancer |

---

## System Architecture

```
+-------------------------------------------------------------+
|                       CLIENT LAYER                          |
|   [React Native Mobile App]    [Vite + React Admin Panel]   |
+------------------------+------------------------------------+
                         | HTTPS / WSS
+------------------------v------------------------------------+
|                   API GATEWAY (Nginx)                       |
+--------+------------------+------------------+-------------+
         |                  |                  |
+--------v--------+ +-------v-------+ +--------v-----------+
|  NestJS REST API| | FastAPI OCR   | | Socket.io /orders  |
|  :3000          | | Service :8000 | | namespace          |
+--------+--------+ +-------+-------+ +--------------------+
         |                  |
+--------v------------------v---------------------------------+
|                        DATA LAYER                           |
|        PostgreSQL  |  Redis  |  Cloudinary                 |
+--------+----------------------------------------------------+
         |
+--------v--------------------------------------------+
|               EXTERNAL SERVICES                     |
|   Razorpay  |  MSG91  |  FCM  |  Google Vision      |
+-----------------------------------------------------+
```

---

## Getting Started

### Prerequisites

```bash
node >= 20.x
npm >= 10.x
python >= 3.11
docker >= 24.x
docker-compose >= 2.x
git
tesseract-ocr  # auto-installed inside Docker
```

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/ChandraVerse/VAIDYAMARG.git
cd VAIDYAMARG
```

**2. Configure environment variables**

```bash
cp .env.example backend/.env
# Edit backend/.env with your real credentials
# See the Environment Variables section below for key vars
```

**3. Start all services with Docker**

```bash
docker compose up --build
```

**4. Run migrations and seed the database (first run only)**

```bash
# After containers are up:
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

**5. Start services individually (development)**

```bash
# Backend API
cd backend && npm run start:dev

# OCR Service
cd ocr-service && uvicorn main:app --reload --port 8000

# Mobile App
cd mobile && npx expo start

# Admin Dashboard
cd admin && npm run dev
```

### Seed Credentials

After running `npx prisma db seed`, these accounts are available locally (all passwords: `Password@123`):

| Role | Email | Notes |
|---|---|---|
| Admin | admin@vaidyamarg.in | Full platform access |
| Pharmacist | ramesh@apollo.pharmacy | Approved partner pharmacy |
| Patient | priya.sharma@gmail.com | Verified · delivered order · 2 refill reminders |
| Patient | arjun.mehta@outlook.com | Verified · order in processing |
| Patient | sunita.patel@yahoo.com | Not verified · pending order |

### Environment Variables

See `.env.example` for the full list. Key variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vaidyamarg
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your_32_char_minimum_secret

# OTP / SMS (MSG91)
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_TEMPLATE_ID=your_msg91_template_id
MSG91_SENDER_ID=VDYMRG

# Payments
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name

# Push notifications
FIREBASE_SERVICE_ACCOUNT_JSON=
```

---

## Project Structure

```
VAIDYAMARG/
|
+-- backend/                        # Node.js + NestJS REST API
|   +-- src/
|   |   +-- modules/
|   |   |   +-- auth/               # JWT authentication, OTP (MSG91)
|   |   |   +-- users/              # User management + FCM token registration
|   |   |   +-- medicines/          # Medicine catalogue and search
|   |   |   +-- orders/             # Order lifecycle + Socket.io events
|   |   |   +-- prescriptions/      # Upload, Cloudinary, OCR callback, verification
|   |   |   +-- pharmacy/           # Admin dashboard stats + revenue/orders charts
|   |   |   +-- partners/           # Pharmacy partner onboarding
|   |   |   +-- notifications/      # FCM push + MSG91 SMS + cron reminders
|   |   |   +-- reminders/          # Refill reminder CRUD
|   +-- prisma/                     # Schema, migrations, seed.ts
|
+-- mobile/                         # React Native + Expo App
|   +-- src/
|   |   +-- screens/                # Auth, Home, Search, Orders, Profile
|   |   +-- components/             # Reusable UI components
|   |   +-- store/                  # Zustand global state
|   |   +-- api/                    # Typed API service layer
|   |   +-- hooks/                  # useNotifications (FCM token reg + handlers)
|   +-- assets/                     # Fonts, images, icons
|
+-- admin/                          # Vite + React Admin Dashboard
|   +-- src/
|   |   +-- pages/                  # Dashboard, Orders, Prescriptions, Analytics,
|   |   |                           # Partners, PartnerDetail, MedicineForm, Users
|   |   +-- components/             # Layout, shared UI
|   |   +-- store/                  # Zustand auth store
|   |   +-- api/                    # Axios client with interceptors
|
+-- ocr-service/                    # Python FastAPI OCR Microservice
|   +-- main.py                     # FastAPI entry point (sync + async endpoints)
|   +-- config.py                   # Pydantic settings
|   +-- schemas.py                  # Pydantic request/response models
|   +-- callbacks.py                # Retry-safe callback to NestJS (Tenacity)
|   +-- ocr/
|   |   +-- engine.py               # Google Vision + Tesseract orchestration
|   |   +-- preprocessor.py         # Image contrast/sharpen/upscale pipeline
|   |   +-- extractor.py            # Medicine name/dosage/frequency parser
|   +-- tests/                      # Pytest test suite
|   +-- Dockerfile
|   +-- requirements.txt
|
+-- .github/
|   +-- workflows/
|   |   +-- ci.yml                  # PR gate — lint + build + test (parallel)
|   |   +-- docker-publish.yml      # Build + push images to GHCR on main/tags
|   |   +-- docker.yml              # Docker build verification
|   |   +-- deploy.yml              # SSH deploy via docker compose (manual + tags)
|   |   +-- codeql.yml              # Weekly CodeQL security scan
|   |   +-- release.yml             # Automated release notes on tag push
|
+-- docker-compose.yml              # Full stack orchestration (prod)
+-- docker-compose.dev.yml          # Development overrides
+-- .env.example                    # Environment variable template
+-- Makefile                        # make dev | make seed | make logs | make down
+-- README.md
+-- LICENSE
```

---

## API Reference

Base URL: `https://api.vaidyamarg.in/v1`

Interactive Swagger docs available at `http://localhost:3000/api/docs` when running locally.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/send-otp` | Send OTP via MSG91 SMS |
| POST | `/auth/verify-otp` | Verify OTP and receive JWT pair |
| POST | `/auth/refresh` | Refresh access token |

### Medicines

| Method | Endpoint | Description |
|---|---|---|
| GET | `/medicines/search?q={name}` | Search medicines by name |
| GET | `/medicines/{id}` | Medicine details and generic alternatives |
| GET | `/medicines/compare?brand={name}` | Compare brand vs. generic price |

### Prescriptions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/prescriptions/upload` | Upload prescription image (multipart) |
| GET | `/prescriptions/my` | Authenticated user's prescription history |
| GET | `/prescriptions/{id}` | Single prescription with signed image URL |
| PATCH | `/prescriptions/{id}/verify` | Pharmacist: approve or reject |
| POST | `/prescriptions/{id}/ocr` | Trigger async OCR processing |
| POST | `/prescriptions/{id}/ocr-result` | OCR service callback (internal, `x-internal-secret`) |
| GET | `/prescriptions/admin/pending` | Pharmacist: unverified prescription queue |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Place a new order |
| GET | `/orders/{id}` | Order details |
| GET | `/orders/my` | Authenticated user's order history |
| PATCH | `/orders/{id}/cancel` | Cancel an order |
| PATCH | `/orders/{id}/status` | Partner/Admin: advance order status |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard/stats` | KPIs — orders, users, revenue, pending Rx |
| GET | `/admin/dashboard/revenue` | Revenue chart data (last 30 days) |
| GET | `/admin/dashboard/orders` | Orders-per-day chart (last 30 days) |
| GET | `/admin/orders` | Paginated order list with search + status filter |
| GET | `/admin/orders/{id}` | Single order detail |
| PATCH | `/admin/orders/{id}` | Update status → triggers Socket.io + FCM push |
| GET | `/admin/users` | Paginated user list with search |
| GET | `/admin/users/{id}` | Single user detail |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/me` | Get authenticated user profile |
| PATCH | `/users/me` | Update profile |
| PATCH | `/users/me/fcm-token` | Register device push token |

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | User's notification list (paginated) |
| PATCH | `/notifications/{id}/read` | Mark notification as read |
| PATCH | `/notifications/read-all` | Mark all as read |

### OCR Service

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/ocr/extract` | Sync: base64 image → extracted medicines |
| POST | `/ocr/extract-file` | Sync: multipart file → extracted medicines |
| POST | `/ocr/process-async` | Async: Cloudinary URL → background OCR → NestJS callback |

### WebSocket (Socket.io)

**Namespace:** `/orders`

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join_user_room` | Client → Server | `{ userId }` | Join personal room for order updates |
| `order_updated` | Server → Client | `{ orderId, status, updatedAt }` | Fired when order status changes |

---

## Roadmap

### Phase 1 — MVP (Month 1–2) ✅
- [x] Project architecture and monorepo setup
- [x] User authentication (Phone OTP via MSG91 + JWT)
- [x] Medicine catalogue and search (20 real Indian medicines)
- [x] Generic vs. brand price comparison
- [x] Order lifecycle management
- [x] Razorpay payment integration

### Phase 2 — Core Features (Month 3–4) ✅
- [x] Prescription upload and Cloudinary storage
- [x] OCR prescription reader (Google Vision + Tesseract fallback + preprocessor)
- [x] Real-time order tracking (Socket.io — `order.gateway.ts`, `/orders` namespace)
- [x] Push notifications (Firebase Cloud Messaging — `fcm.service.ts` + `push.service.ts`)
- [x] MSG91 SMS alerts (`sms.service.ts`)
- [x] Refill reminders for chronic patients (NestJS cron scheduler — `reminders.scheduler.ts`, daily 08:00 IST)
- [x] Admin dashboard — KPI stats + revenue/orders charts (`pharmacy` module)
- [x] Admin orders and users management endpoints (`admin-orders.controller.ts`)
- [x] Swagger API documentation (`/api/docs`)
- [x] GitHub Actions CI/CD (6 workflows: CI · Docker · Docker Publish · Deploy · CodeQL · Release)
- [x] Database seed (medicines + demo users + sample orders — `prisma/seed.ts`)

### Phase 3 — Partner Ecosystem (Month 5–6) 🚧
- [x] Admin prescription verification workflow
- [x] Partner registration and onboarding (backend: `partners` module — controller + service)
- [x] Pharmacy partner admin pages (UI: `Partners.tsx`, `PartnerDetail.tsx`)
- [x] Analytics dashboard UI (`Analytics.tsx`)
- [x] Medicine management UI (`Medicines.tsx`, `MedicineForm.tsx`)
- [ ] Partner self-service onboarding portal (standalone web UI for partners)
- [ ] Partner earnings dashboard (partner-facing UI)
- [ ] Inventory management UI for partners

### Phase 4 — Scale and Intelligence (Month 7+)
- [ ] Handwritten prescription recognition
- [ ] Doctor consultation integration (telemedicine)
- [ ] Lab test booking
- [ ] Subscription model for chronic patients
- [ ] Multi-language support (Bengali, Hindi, Tamil, Telugu)
- [ ] Government PMBJP scheme integration

---

## Business Model

| Revenue Stream | Description | Estimated Margin |
|---|---|---|
| Generic Medicine Sales | Sourced from manufacturers, sold at 60–80% below brand price | 25–40% |
| Delivery Fee | Rs. 20–49 per order; free above Rs. 500 | Direct revenue |
| Pharmacy Commission | 8–12% commission per order fulfilled by a partner pharmacy | Scalable |
| Lab Test Referral | Referral fee from diagnostic lab partnerships | 10–15% |
| Subscription Plan | Chronic patient plan — automatic refills + priority delivery | Recurring |

---

## Security and Compliance

- All prescription images stored as **private** Cloudinary assets (signed URLs, 1-hour expiry)
- JWT access tokens expire in **15 minutes**; refresh tokens in **7 days**
- OTP codes expire in **10 minutes** and are single-use
- Internal OCR callbacks authenticated via `x-internal-secret` header
- Razorpay webhook signatures verified with HMAC-SHA256
- Passwords hashed with **bcrypt** (salt rounds: 10)
- HTTPS enforced in production via Nginx
- All sensitive env vars excluded from version control via `.gitignore`
- Weekly automated CodeQL security scans (JS/TS + Python)

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## Contact

**ChandraVerse** — [github.com/ChandraVerse](https://github.com/ChandraVerse)

Project Link: [https://github.com/ChandraVerse/VAIDYAMARG](https://github.com/ChandraVerse/VAIDYAMARG)
