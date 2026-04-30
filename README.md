<div align="center">

<img src="https://img.shields.io/badge/VaidyaMarg-वैद्यमार्ग-01696f?style=for-the-badge&labelColor=0f3638&color=01696f" alt="VaidyaMarg" height="40"/>

# VAIDYAMARG — वैद्यमार्ग
### *The Way of the Healer*

**Affordable Medicine for Every Indian — Powered by AI**

[![License: MIT](https://img.shields.io/badge/License-MIT-01696f.svg?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange?style=flat-square)]()
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-blue?style=flat-square)]()
[![Stack](https://img.shields.io/badge/Stack-React%20Native%20%7C%20Node.js%20%7C%20Python-informational?style=flat-square)]()
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

**VaidyaMarg** (वैद्यमार्ग) is an AI-powered affordable medicine delivery platform built for India. The name means *The Way of the Healer* in Sanskrit — a path that connects patients to WHO-GMP certified generic medicines, delivered to their doorstep.

In India, branded medicines cost **3–10x more** than their generic equivalents — for the exact same molecule, the same efficacy, the same therapeutic outcome. VaidyaMarg exists to fix that.

| | |
|---|---|
| **Founded** | 2026 |
| **Based in** | Bhatpara, West Bengal, India |
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
- **Real-time Order Tracking** — Live delivery status updates
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
| JWT + OTP (MSG91) | Secure authentication |
| Bull + Redis | Background job queue for reminders and notifications |

### OCR Microservice

| Technology | Purpose |
|---|---|
| Python + FastAPI | OCR microservice runtime |
| Google Cloud Vision | High-accuracy prescription text detection (~95%) |
| Tesseract OCR | Open-source fallback engine (~75%) |
| Pillow | Image preprocessing — contrast, sharpness, upscaling |
| Tenacity | Retry logic for backend callbacks |

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
| Firebase Cloud Messaging | Push notifications |
| MSG91 | OTP verification and SMS alerts |

### DevOps and Infrastructure

| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerisation of all services |
| GitHub Actions | CI/CD pipeline — automated deploy on merge |
| AWS / Railway.app | Cloud hosting (Railway for MVP, AWS for scale) |
| Nginx | Reverse proxy and load balancer |

---

## System Architecture

```
+-------------------------------------------------------------+
|                       CLIENT LAYER                         |
|   [React Native Mobile App]     [Vite + React Admin Panel]  |
+------------------------+------------------------------------+
                         | HTTPS / WSS
+------------------------v------------------------------------+
|                   API GATEWAY (Nginx)                      |
+--------+------------------+------------------+-------------+
         |                  |                  |
+--------v--------+ +-------v-------+ +--------v-----------+
|  Node.js NestJS | | Python FastAPI | |  Socket.io         |
|  REST API       | | OCR Service   | |  Real-time Updates |
+--------+--------+ +-------+-------+ +--------------------+
         |                  |
+--------v------------------v-----------------------------+
|                      DATA LAYER                        |
|   PostgreSQL  |  Redis  |  Cloudinary                  |
+--------+-----------------------------------------------+
         |
+--------v--------------------------------------------+
|               EXTERNAL SERVICES                    |
|   Razorpay  |  MSG91  |  FCM  |  Google Vision     |
+-----------------------------------------------------+
```

---

## Getting Started

### Prerequisites

```bash
node >= 20.x
npm >= 10.x
python >= 3.12
docker and docker-compose
git
```

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/ChandraVerse/VAIDYAMARG.git
cd VAIDYAMARG
```

**2. Configure environment variables**

```bash
cp backend/.env.example backend/.env
cp ocr-service/.env.example ocr-service/.env
# Edit each .env file with your credentials
```

**3. Start all services with Docker**

```bash
docker-compose up --build
```

**4. Start services individually (development)**

```bash
# Backend API
cd backend && npm run start:dev

# OCR Service
cd ocr-service && uvicorn app.main:app --reload --port 8000

# Mobile App
cd mobile && npx expo start

# Admin Dashboard
cd admin && npm run dev
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vaidyamarg
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# MSG91 (OTP)
MSG91_AUTH_KEY=your_auth_key
MSG91_TEMPLATE_ID=your_template_id

# Firebase
FIREBASE_SERVER_KEY=your_firebase_server_key

# OCR Microservice
OCR_SERVICE_URL=http://ocr-service:8000
INTERNAL_SECRET=your_internal_secret
```

---

## Project Structure

```
VAIDYAMARG/
|
+-- backend/                        # Node.js + NestJS REST API
|   +-- src/
|   |   +-- auth/                   # JWT authentication, OTP
|   |   +-- users/                  # User management
|   |   +-- medicines/              # Medicine catalogue and search
|   |   +-- orders/                 # Order lifecycle management
|   |   +-- prescriptions/          # Upload, storage, verification
|   |   +-- pharmacies/             # Partner pharmacy management
|   |   +-- notifications/          # FCM and SMS notifications
|   +-- prisma/                     # Database schema and migrations
|
+-- mobile/                         # React Native + Expo App
|   +-- src/
|   |   +-- screens/                # Auth, Home, Search, Orders, Profile
|   |   +-- components/             # Reusable UI components
|   |   +-- store/                  # Zustand global state
|   |   +-- services/               # API service layer
|   +-- assets/                     # Fonts, images, icons
|
+-- admin/                          # Vite + React Pharmacist Dashboard
|   +-- src/
|   |   +-- pages/                  # Dashboard, Orders, Prescriptions, Analytics
|   |   +-- components/             # Layout, shared UI
|   |   +-- store/                  # Zustand auth store
|   |   +-- api/                    # Axios client with interceptors
|
+-- ocr-service/                    # Python FastAPI OCR Microservice
|   +-- app/
|   |   +-- main.py                 # FastAPI application entry point
|   |   +-- ocr/
|   |   |   +-- engine.py           # Google Vision + Tesseract + preprocessor
|   |   |   +-- extractor.py        # Medicine name, dosage, frequency parser
|   |   |   +-- tests/              # Pytest test suite
|   |   +-- callbacks.py            # Retry-safe callback to NestJS
|   |   +-- schemas.py              # Pydantic request/response models
|   |   +-- config.py               # Pydantic settings
|   +-- Dockerfile
|   +-- requirements.txt
|
+-- docker-compose.yml              # Full stack orchestration
+-- .env.example                    # Root environment variable template
+-- README.md
+-- LICENSE
```

---

## API Reference

Base URL: `https://api.vaidyamarg.in/v1`

Interactive Swagger documentation is available at `/api/docs` when running locally.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/send-otp` | Send OTP to a phone number |
| POST | `/auth/verify-otp` | Verify OTP and receive JWT |
| POST | `/auth/refresh` | Refresh access token |

### Medicines

| Method | Endpoint | Description |
|---|---|---|
| GET | `/medicines/search?q={name}` | Search medicines by name |
| GET | `/medicines/{id}` | Get medicine details and generic alternatives |
| GET | `/medicines/compare?brand={name}` | Compare brand vs. generic price |

### Prescriptions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/prescriptions/upload` | Upload prescription image |
| GET | `/prescriptions/my` | Authenticated user's prescription history |
| GET | `/prescriptions/{id}` | Get single prescription with signed image URL |
| PATCH | `/prescriptions/{id}/verify` | Pharmacist: approve or reject prescription |
| POST | `/prescriptions/{id}/ocr` | Trigger OCR processing |
| GET | `/prescriptions/admin/pending` | Pharmacist: unverified prescription queue |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Place a new order |
| GET | `/orders/{id}` | Get order details |
| GET | `/orders/my` | Authenticated user's order history |
| PATCH | `/orders/{id}/cancel` | Cancel an order |
| PATCH | `/orders/{id}/status` | Admin: advance order status |

### OCR Service

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service health check |
| POST | `/ocr/extract` | Synchronous: upload image, receive extracted medicines |
| POST | `/ocr/process-async` | Asynchronous: process image URL, callback to backend |

---

## Roadmap

### Phase 1 — MVP (Month 1–2)
- [x] Project architecture and monorepo setup
- [x] User authentication (Phone OTP + JWT)
- [x] Medicine catalogue and search
- [x] Generic vs. brand price comparison
- [x] Order lifecycle management
- [x] Razorpay payment integration

### Phase 2 — Core Features (Month 3–4)
- [x] Prescription upload and Cloudinary storage
- [x] AI/OCR prescription reader (Google Vision + Tesseract)
- [x] Real-time order tracking (Socket.io)
- [x] Push notifications (FCM)
- [ ] Refill reminders for chronic patients

### Phase 3 — Partner Ecosystem (Month 5–6)
- [x] Admin and pharmacist dashboard
- [x] Pharmacist prescription verification workflow
- [ ] Pharmacy partner onboarding portal
- [ ] Partner analytics and earnings dashboard

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
| Subscription Plan | Monthly medicine box for chronic condition patients | Recurring MRR |

---

## Security and Compliance

- All data encrypted with **AES-256** at rest
- **HTTPS/TLS** enforced on all endpoints
- Compliant with **IT Act 2000** and **DPDP Act 2023** (India)
- All medicines sourced from **WHO-GMP certified** manufacturers
- Every prescription reviewed by a **licensed pharmacist** before fulfillment
- Drug License, FSSAI, and pharmacy regulations strictly followed
- Prescription images stored as **private/authenticated** assets on Cloudinary — no public URL access
- Signed image URLs generated with **1-hour expiry** for pharmacist review

---

## Contributing

Contributions, issues, and feature requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## Contact

**Chandra Sekhar Chakraborty** — Founder and Developer

[![GitHub](https://img.shields.io/badge/GitHub-ChandraVerse-181717?style=flat-square&logo=github)](https://github.com/ChandraVerse)
[![Portfolio](https://img.shields.io/badge/Portfolio-chandraverse.github.io-01696f?style=flat-square&logo=googlechrome)](https://chandraverse.github.io/chandraverse-portfolio/)
[![Twitter](https://img.shields.io/badge/Twitter-@CS__Chakraborty-1DA1F2?style=flat-square&logo=twitter)](https://twitter.com/CS_Chakraborty)
[![Email](https://img.shields.io/badge/Email-chakrabortychandrasekhar185@gmail.com-D14836?style=flat-square&logo=gmail)](mailto:chakrabortychandrasekhar185@gmail.com)

---

<div align="center">

**VaidyaMarg — वैद्यमार्ग**

*Making quality medicine accessible to every Indian*

</div>
