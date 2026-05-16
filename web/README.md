# VaidyaMarg Web — Marketing Landing Page

Public-facing marketing site for [vaidyamarg.in](https://vaidyamarg.in).  
React 18 + Vite + Tailwind CSS + TypeScript.

## Pages

| Route | Description                          |
|-------|--------------------------------------|
| `/`   | Landing page — Hero, How It Works, Features, Savings Calculator, Testimonials, Download CTA |

## Stack

- **Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3 (custom VaidyaMarg design tokens)
- **Routing**: React Router v6
- **Fonts**: Fraunces (display) + Satoshi (body)
- **Icons**: Lucide React
- **Container**: Nginx 1.27 Alpine

## Getting Started

```bash
# 1. Install dependencies
cd web
npm install

# 2. Copy env file
cp .env.example .env
# Edit VITE_API_URL to point to your backend

# 3. Start dev server (http://localhost:5175)
npm run dev

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

## Docker

```bash
# Build image
docker build --build-arg VITE_API_URL=https://api.vaidyamarg.in -t vaidyamarg-web .

# Run container
docker run -p 3000:80 vaidyamarg-web
```

Or use the root `docker-compose.yml`:

```bash
docker-compose up web
```

## Design Tokens

| Token          | Value       | Usage              |
|----------------|-------------|--------------------|
| `brand-500`    | `#01696f`   | Primary accent     |
| `ink-DEFAULT`  | `#1a1a1a`   | Primary text       |
| `ink-muted`    | `#6b7280`   | Secondary text     |
| `surface-DEFAULT` | `#f8f7f4` | Page background   |
| `surface-2`    | `#f2f0ec`   | Section alternates |
| Font Display   | Fraunces    | All headings       |
| Font Body      | Satoshi     | All body text      |
