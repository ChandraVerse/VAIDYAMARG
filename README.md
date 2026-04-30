<div align="center">

<img src="https://img.shields.io/badge/VaidyaMarg-वैद्यमार्ग-01696f?style=for-the-badge&labelColor=0f3638&color=01696f" alt="VaidyaMarg" height="40"/>

# 🏥 VAIDYAMARG — वैद्यमार्ग
### *The Way of the Healer*

**Affordable Medicine for Every Indian — Powered by AI**

[![License: MIT](https://img.shields.io/badge/License-MIT-01696f.svg?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange?style=flat-square)]()
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-blue?style=flat-square)]()
[![Stack](https://img.shields.io/badge/Stack-React%20Native%20%7C%20Node.js%20%7C%20Python-informational?style=flat-square)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)]()
[![Made in India](https://img.shields.io/badge/Made%20in-India%20🇮🇳-FF9933?style=flat-square)]()

---

> *"Branded medicine at ₹450? The same generic costs ₹65. VaidyaMarg bridges that gap."*

[📱 Download App](#) · [🌐 Web Portal](#) · [📖 Docs](#) · [🐛 Report Bug](../../issues) · [✨ Request Feature](../../issues)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [App Screenshots](#-app-screenshots)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Roadmap](#-roadmap)
- [Business Model](#-business-model)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 About the Project

**VaidyaMarg** (वैद्यमार्ग) is an AI-powered, affordable medicine delivery platform built for India. The name means *"The Way of the Healer"* in Sanskrit — and that's exactly what we are: the path that connects patients to affordable, WHO-GMP certified generic medicines, delivered to their doorstep.

In India, branded medicines cost **3–10x more** than their generic equivalents — for the exact same molecule, the same efficacy, the same cure. VaidyaMarg exists to fix that.

| | |
|---|---|
| **Founded** | 2026 |
| **Based in** | Bhātpāra, West Bengal, India |
| **Numerology** | Name number **6** (Healing, Nurturing, Service) |
| **Target Market** | 1.4 Billion Indians — starting with Tier 2 & 3 cities |

---

## 🔴 The Problem

- 💊 Branded medicine prices are **3–10x higher** than generic equivalents
- 🏥 Most patients don't know generic alternatives exist
- 📄 Prescription management is entirely paper-based and disorganised
- 🚗 Rural and Tier 2/3 cities have **limited access** to quality pharmacies
- 📦 No single platform shows you the **branded vs generic price comparison**

---

## ✅ Our Solution

VaidyaMarg provides a **3-step solution**:

```
1. UPLOAD   →   Patient uploads doctor's prescription (photo/PDF)
2. DISCOVER →   AI reads prescription & shows generic alternatives with price comparison
3. ORDER    →   Patient orders at 60–80% lower cost, delivered to doorstep
```

---

## ✨ Key Features

### For Patients
- 📸 **Prescription Upload** — Snap a photo of your prescription; our AI reads it instantly
- 🔍 **Smart Medicine Search** — Search by brand name, see generic alternatives side by side
- 💰 **Price Comparison** — See real-time branded vs. generic price difference
- 🛒 **Easy Ordering** — Add to cart and checkout in under 60 seconds
- 📦 **Real-time Order Tracking** — Live delivery status like Zomato/Swiggy
- 🔔 **Refill Reminders** — Monthly reminders for chronic patients (diabetes, BP, thyroid)
- 📁 **Digital Health Records** — Store all prescriptions and order history securely
- 💳 **Multiple Payment Options** — UPI, Cards, Net Banking, Cash on Delivery

### For Pharmacy Partners
- 📊 **Partner Dashboard** — Manage inventory, orders, and earnings
- 📈 **Analytics** — Sales, popular medicines, customer insights
- 🔗 **API Integration** — Connect your existing POS system

### For Admins
- 🧑‍💼 **Admin Panel** — Manage users, pharmacies, medicines, and orders
- 🔐 **Pharmacist Verification** — Every prescription reviewed before dispatch
- 📑 **Compliance Management** — Drug license, FSSAI, and regulatory tracking

---

## 📱 App Screenshots

> *Coming soon — UI/UX design in progress*

| Onboarding | Home | Prescription Upload | Medicine Search | Order Tracking |
|---|---|---|---|---|
| 🖼️ Soon | 🖼️ Soon | 🖼️ Soon | 🖼️ Soon | 🖼️ Soon |

---

## 🛠️ Tech Stack

### 📱 Mobile App
| Technology | Purpose |
|---|---|
| **React Native** | Cross-platform mobile app (Android + iOS) |
| **Expo** | Dev tooling, OTA updates, EAS Build |
| **NativeWind** | Tailwind CSS for React Native styling |
| **React Navigation** | In-app navigation & deep linking |
| **Zustand** | Lightweight global state management |

### 🌐 Web (Admin + Pharmacy Dashboard)
| Technology | Purpose |
|---|---|
| **Next.js 15** | Web portal with SSR + SEO |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn/ui** | Accessible component library |

### ⚙️ Backend
| Technology | Purpose |
|---|---|
| **Node.js + NestJS** | Core REST API — orders, users, medicines |
| **Socket.io** | Real-time order tracking |
| **JWT + OAuth2** | Secure authentication |
| **Bull + Redis** | Background job queue (reminders, notifications) |

### 🤖 AI / OCR Microservice
| Technology | Purpose |
|---|---|
| **Python + FastAPI** | OCR/AI microservice |
| **Tesseract OCR** | Printed prescription text extraction |
| **TensorFlow / Keras** | Handwritten prescription recognition |
| **SpaCy / BERT NER** | Extract medicine names, dosage, doctor info |

### 🗄️ Database & Storage
| Technology | Purpose |
|---|---|
| **PostgreSQL** | Primary relational DB (users, orders, medicines) |
| **MongoDB** | Prescription images & unstructured data |
| **Redis** | Caching (medicine search, sessions) |
| **Cloudinary** | Prescription image + medicine photo storage |

### 💳 Payments & Communication
| Technology | Purpose |
|---|---|
| **Razorpay** | Payments — UPI, Cards, COD (India-first) |
| **Firebase Cloud Messaging** | Push notifications |
| **MSG91 / Twilio** | OTP verification + SMS alerts |

### ☁️ DevOps & Infrastructure
| Technology | Purpose |
|---|---|
| **Docker + Docker Compose** | Containerisation of all services |
| **GitHub Actions** | CI/CD pipeline — auto deploy on merge |
| **AWS / Railway.app** | Cloud hosting (Railway for MVP, AWS for scale) |
| **Nginx** | Reverse proxy & load balancer |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
│  [React Native Mobile App]    [Next.js Web Portal]          │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS / WSS
┌──────────────────────▼──────────────────────────────────────┐
│                  API GATEWAY (Nginx)                        │
└──────┬──────────────┬──────────────────┬────────────────────┘
       │              │                  │
┌──────▼──────┐ ┌─────▼──────┐ ┌────────▼───────┐
│  Node.js    │ │  Python    │ │  Socket.io     │
│  NestJS API │ │  FastAPI   │ │  Real-time     │
│  (REST)     │ │  OCR / AI  │ │  Order Updates │
└──────┬──────┘ └─────┬──────┘ └────────────────┘
       │              │
┌──────▼──────────────▼─────────────────────────┐
│              DATA LAYER                       │
│  PostgreSQL  │  MongoDB  │  Redis  │  Cloudinary│
└───────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────┐
│           EXTERNAL SERVICES                 │
│  Razorpay  │  MSG91  │  FCM  │  Tesseract   │
└─────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

```bash
node >= 20.x
npm >= 10.x
python >= 3.11
docker & docker-compose
git
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ChandraVerse/VAIDYAMARG.git
cd VAIDYAMARG
```

2. **Install dependencies**
```bash
# Backend
cd backend && npm install

# Mobile App
cd ../mobile && npm install

# Web Portal
cd ../web && npm install

# AI/OCR Service
cd ../ai-service && pip install -r requirements.txt
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Fill in your credentials (see .env.example for all required keys)
```

4. **Start with Docker**
```bash
docker-compose up --build
```

5. **Start services individually (development)**
```bash
# Backend API
cd backend && npm run start:dev

# AI Service
cd ai-service && uvicorn main:app --reload --port 8001

# Mobile App
cd mobile && npx expo start

# Web Portal
cd web && npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# App
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vaidyamarg
MONGODB_URI=mongodb://localhost:27017/vaidyamarg
REDIS_URL=redis://localhost:6379

# Auth
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

# AI Service
AI_SERVICE_URL=http://localhost:8001
```

---

## 📁 Project Structure

```
VAIDYAMARG/
│
├── 📱 mobile/                      # React Native + Expo App
│   ├── app/                        # Expo Router screens
│   │   ├── (auth)/                 # Login, Register, OTP
│   │   ├── (tabs)/                 # Home, Search, Orders, Profile
│   │   └── prescription/           # Prescription upload & OCR result
│   ├── components/                 # Reusable UI components
│   ├── store/                      # Zustand global state
│   ├── services/                   # API service calls
│   └── assets/                     # Fonts, images, icons
│
├── 🌐 web/                         # Next.js Admin + Pharmacy Dashboard
│   ├── app/                        # App Router pages
│   │   ├── admin/                  # Admin panel
│   │   └── pharmacy/               # Pharmacy partner portal
│   ├── components/                 # UI components
│   └── lib/                        # Utilities & API client
│
├── ⚙️ backend/                     # Node.js + NestJS API
│   ├── src/
│   │   ├── auth/                   # JWT auth, OTP, OAuth
│   │   ├── users/                  # User management
│   │   ├── medicines/              # Medicine catalogue & search
│   │   ├── orders/                 # Order lifecycle management
│   │   ├── prescriptions/          # Prescription storage & verification
│   │   ├── pharmacies/             # Partner pharmacy management
│   │   └── notifications/          # FCM + SMS notifications
│   └── prisma/                     # PostgreSQL schema
│
├── 🤖 ai-service/                  # Python FastAPI OCR + AI
│   ├── main.py                     # FastAPI entry point
│   ├── ocr/                        # Tesseract + image preprocessing
│   ├── ner/                        # SpaCy/BERT medicine name extraction
│   ├── models/                     # Trained ML models
│   └── requirements.txt
│
├── 🐳 docker-compose.yml           # All services orchestration
├── 📄 .env.example                 # Environment variable template
├── 📖 README.md                    # You are here
└── 📜 LICENSE                      # MIT License
```

---

## 📡 API Documentation

Base URL: `https://api.vaidyamarg.in/v1`

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login with phone + OTP |
| `POST` | `/auth/verify-otp` | Verify OTP |
| `POST` | `/auth/refresh` | Refresh access token |

### Medicines
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/medicines/search?q={name}` | Search medicines by name |
| `GET` | `/medicines/{id}` | Get medicine details + generic alternatives |
| `GET` | `/medicines/compare?brand={name}` | Compare brand vs generic price |

### Prescriptions
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/prescriptions/upload` | Upload prescription image |
| `GET` | `/prescriptions/{id}` | Get parsed prescription data |
| `GET` | `/prescriptions/history` | User's prescription history |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders` | Place new order |
| `GET` | `/orders/{id}` | Get order details |
| `GET` | `/orders/track/{id}` | Real-time order tracking |
| `GET` | `/orders/history` | User's order history |
| `PATCH` | `/orders/{id}/cancel` | Cancel order |

### AI / OCR Service
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/ocr/scan` | Scan prescription image → extract medicines |
| `POST` | `/ocr/validate` | Validate extracted medicine list |

> Full Swagger API docs available at `/api/docs` when running locally.

---

## 🗺️ Roadmap

### Phase 1 — MVP (Month 1–2)
- [x] Project setup & architecture
- [ ] User authentication (Phone OTP)
- [ ] Medicine catalogue & search
- [ ] Generic vs brand price comparison
- [ ] Basic ordering flow
- [ ] Razorpay payment integration

### Phase 2 — Core Features (Month 3–4)
- [ ] Prescription upload & storage
- [ ] AI/OCR prescription reader (Tesseract + SpaCy)
- [ ] Real-time order tracking (Socket.io)
- [ ] Push notifications (FCM)
- [ ] Refill reminders for chronic patients

### Phase 3 — Partner Ecosystem (Month 5–6)
- [ ] Pharmacy partner onboarding portal
- [ ] Admin dashboard
- [ ] Pharmacist prescription verification workflow
- [ ] Partner analytics & earnings dashboard

### Phase 4 — Scale & Intelligence (Month 7+)
- [ ] Handwritten prescription recognition (TensorFlow)
- [ ] Doctor consultation integration (Telemedicine)
- [ ] Lab test booking
- [ ] Subscription model for chronic patients
- [ ] Multi-language support (Bengali, Hindi, Tamil, Telugu)
- [ ] Government PMBJP scheme integration

---

## 💼 Business Model

| Revenue Stream | How It Works | Estimated Margin |
|---|---|---|
| **Generic Medicine Sales** | Buy from manufacturer, sell at 60–80% below brand price | 25–40% |
| **Delivery Fee** | ₹20–₹49 per order; free above ₹500 | Direct revenue |
| **Pharmacy Commission** | 8–12% commission per order fulfilled by partner pharmacy | Scalable |
| **Lab Test Referral** | Refer users to diagnostic labs, earn referral fee | 10–15% |
| **Subscription Plan** | Monthly medicine box for chronic patients | Recurring MRR |

---

## 🔐 Security & Compliance

- 🔒 All data encrypted with **AES-256** at rest
- 🌐 **HTTPS/TLS** enforced everywhere
- 🏥 Compliant with **IT Act 2000** & **DPDP Act 2023** (India)
- 💊 All medicines sourced from **WHO-GMP certified** manufacturers
- 👨‍⚕️ Every prescription reviewed by a **licensed pharmacist** before fulfillment
- 🪪 Drug License, FSSAI, and pharmacy regulations strictly followed

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

---

## 📞 Contact

**Chandra Sekhar Chakraborty** — Founder & Developer

[![GitHub](https://img.shields.io/badge/GitHub-ChandraVerse-181717?style=flat-square&logo=github)](https://github.com/ChandraVerse)
[![Portfolio](https://img.shields.io/badge/Portfolio-chandraverse.github.io-01696f?style=flat-square&logo=googlechrome)](https://chandraverse.github.io/chandraverse-portfolio/)
[![Twitter](https://img.shields.io/badge/Twitter-@CS__Chakraborty-1DA1F2?style=flat-square&logo=twitter)](https://twitter.com/CS_Chakraborty)
[![Email](https://img.shields.io/badge/Email-chakrabortychandrasekhar185@gmail.com-D14836?style=flat-square&logo=gmail)](mailto:chakrabortychandrasekhar185@gmail.com)

---

<div align="center">

**VaidyaMarg — वैद्यमार्ग**

*Making quality medicine accessible to every Indian*

⭐ Star this repo if you believe in affordable healthcare for all!

Made with ❤️ in India 🇮🇳

</div>
