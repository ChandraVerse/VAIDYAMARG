# 🔐 Security Policy

## Overview

VaidyaMarg handles **sensitive patient health data** including medical prescriptions, personal information, and payment details. We take security extremely seriously and are committed to protecting every user's privacy and data.

---

## 🛡️ Supported Versions

| Version | Supported |
|---|---|
| `main` (latest) | ✅ Active security fixes |
| `develop` | ✅ Active security fixes |
| Older releases | ❌ Please upgrade |

---

## 🚨 Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub Issues.**

If you discover a security vulnerability, please report it **privately** via one of the following:

### 📧 Email (Preferred)
Send a detailed report to:
**chakrabortychandrasekhar185@gmail.com**

Subject line: `[SECURITY] VaidyaMarg - <Brief Description>`

### 📋 What to Include

Please provide:
- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** (what data/functionality could be affected)
- **Affected component** (backend, mobile app, AI service, etc.)
- **Suggested fix** (if you have one)
- Your contact details for follow-up

---

## ⏱️ Response Timeline

| Stage | Timeframe |
|---|---|
| **Initial Response** | Within 48 hours |
| **Severity Assessment** | Within 5 business days |
| **Fix Development** | Based on severity (see below) |
| **Public Disclosure** | After fix is deployed |

### Severity Levels

| Severity | Description | Fix Timeline |
|---|---|---|
| 🔴 **Critical** | Patient data breach, prescription exposure, payment compromise | 24–48 hours |
| 🟠 **High** | Auth bypass, privilege escalation, PII exposure | 3–7 days |
| 🟡 **Medium** | Data integrity issues, partial info disclosure | 14 days |
| 🟢 **Low** | Minor info leakage, low-impact issues | 30 days |

---

## 🔒 Security Measures in VaidyaMarg

### Data Protection
- All patient data encrypted with **AES-256** at rest
- All transmissions secured with **TLS 1.3**
- Prescription images stored in **Cloudinary with access controls**
- Database credentials rotated regularly

### Authentication & Authorization
- **JWT tokens** with short expiration (15 minutes access, 7 days refresh)
- **OTP-based** phone authentication (no passwords stored)
- **Role-based access control** (Patient / Pharmacist / Admin)
- Rate limiting on all authentication endpoints

### Healthcare Compliance
- Compliant with **IT Act 2000**
- Compliant with **DPDP Act 2023** (Digital Personal Data Protection)
- Prescription data never shared with third parties without consent
- Pharmacist verification before every prescription order

### Infrastructure Security
- All services run in **Docker containers** with minimal permissions
- **Nginx** reverse proxy with security headers
- **GitHub Actions** secrets for CI/CD credentials
- Regular dependency audits (`npm audit`, `pip-audit`)

---

## 🚫 Scope — What We're Interested In

### In Scope
- Patient data exposure or leakage
- Prescription data unauthorized access
- Authentication/authorization bypass
- Payment system vulnerabilities
- SQL/NoSQL injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Insecure Direct Object References (IDOR)
- Server-Side Request Forgery (SSRF)
- Remote Code Execution (RCE)
- Sensitive data in logs or error messages

### Out of Scope
- Attacks requiring physical device access
- Social engineering attacks
- Vulnerabilities in third-party services (Razorpay, Cloudinary, etc.)
- Rate limiting on non-sensitive endpoints
- Missing security headers on non-authenticated pages
- Self-XSS

---

## 🎖️ Recognition

We believe in recognizing security researchers who help us improve. Valid, responsibly disclosed vulnerabilities will be:

- Acknowledged in our **Security Hall of Fame** (coming soon)
- Credited in the **CHANGELOG** for the fix release
- Eligible for **appreciation rewards** based on severity (for critical/high findings)

---

## 📚 Responsible Disclosure Policy

We follow **responsible disclosure** principles:

1. You report the vulnerability to us privately
2. We acknowledge receipt within 48 hours
3. We work on a fix
4. We notify you when the fix is deployed
5. We publicly disclose the vulnerability (without exposing unreported attack vectors)
6. You may publish your findings after public disclosure

We ask that you:
- Give us reasonable time to fix before public disclosure
- Not exploit vulnerabilities beyond proof-of-concept
- Not access or modify patient/user data
- Not perform denial-of-service attacks

---

<div align="center">

**VaidyaMarg — वैद्यमार्ग** | *Your health data is sacred to us* 🔐

</div>
