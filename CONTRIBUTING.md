# 🛠️ Contributing to VaidyaMarg

First off — **thank you for considering contributing to VaidyaMarg!** 🎉

VaidyaMarg is a mission-driven project to make medicine affordable for every Indian. Every line of code, every bug fix, every idea matters. We welcome contributions from developers, designers, healthcare professionals, and anyone who believes in affordable healthcare.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

---

## 🤔 How Can I Contribute?

### 🐛 Reporting Bugs
Before creating a bug report, please check if the issue already exists. When creating a bug report, include:
- A clear, descriptive title
- Steps to reproduce the problem
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, etc.)

### 💡 Suggesting Features
Feature suggestions are welcome! Open an issue with:
- A clear title and description
- Why this feature would benefit users
- Any mockups or examples if available

### 🔧 Code Contributions
- Fix bugs listed in [Issues](../../issues)
- Implement features from the [Roadmap](README.md#roadmap)
- Improve documentation
- Write tests
- Improve performance
- Add translations (Bengali, Hindi, Tamil, Telugu)

---

## 💻 Development Setup

### Prerequisites
```bash
node >= 20.x
npm >= 10.x
python >= 3.11
docker & docker-compose
git
```

### Fork & Clone
```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/VAIDYAMARG.git
cd VAIDYAMARG

# 3. Add upstream remote
git remote add upstream https://github.com/ChandraVerse/VAIDYAMARG.git
```

### Install & Run
```bash
# Install all dependencies
cd backend && npm install
cd ../mobile && npm install
cd ../web && npm install
cd ../ai-service && pip install -r requirements.txt

# Copy env file
cp .env.example .env
# Fill in your values

# Start everything with Docker
docker-compose up --build
```

### Keep Your Fork Updated
```bash
git fetch upstream
git checkout main
git merge upstream/main
```

---

## 🌿 Branch Naming Convention

```
feature/   → New features          e.g. feature/prescription-ocr
bugfix/    → Bug fixes             e.g. bugfix/order-tracking-null
hotfix/    → Critical fixes        e.g. hotfix/payment-crash
docs/      → Documentation only    e.g. docs/api-endpoints
refactor/  → Code refactoring      e.g. refactor/medicine-service
test/      → Adding tests          e.g. test/auth-unit-tests
chore/     → Maintenance tasks     e.g. chore/update-dependencies
```

---

## ✍️ Commit Message Guidelines

We follow the **Conventional Commits** specification.

### Format
```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types
| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, no logic change) |
| `refactor` | Code change that neither fixes nor adds a feature |
| `test` | Adding or updating tests |
| `chore` | Build process or tooling changes |
| `perf` | Performance improvement |
| `security` | Security improvement |

### Examples
```bash
feat(ocr): add handwritten prescription support
fix(orders): resolve null pointer in tracking endpoint
docs(api): update medicine search endpoint docs
security(auth): enforce rate limiting on OTP endpoint
```

---

## 🔀 Pull Request Process

1. **Update your branch** with the latest `main`
2. **Write/update tests** for your changes
3. **Ensure all tests pass** locally
4. **Update documentation** if needed
5. **Open a Pull Request** with:
   - A clear title following commit conventions
   - Description of what changed and why
   - Screenshots for UI changes
   - Reference to related issue (`Closes #123`)
6. **Request a review** — at least one approval required
7. **Address feedback** promptly

### PR Checklist
```
[ ] Code follows the project's coding standards
[ ] Tests written and passing
[ ] Documentation updated
[ ] No sensitive data (keys, passwords) committed
[ ] .env.example updated if new env vars added
[ ] Prescription/health data handled securely
```

---

## 🎨 Coding Standards

### JavaScript / TypeScript
- Use **TypeScript** everywhere — no `any` types
- Follow **ESLint** rules (run `npm run lint`)
- Use **Prettier** for formatting (run `npm run format`)
- Prefer `async/await` over `.then()` chains
- Write JSDoc comments for all public functions

### Python (AI Service)
- Follow **PEP 8** style guide
- Use **type hints** everywhere
- Document functions with **docstrings**
- Use `black` for formatting

### General
- Never commit `.env` files or API keys
- Keep functions small and single-purpose
- Write self-documenting code
- Handle errors gracefully — no silent failures
- Encrypt all patient/prescription data

---

## 🐛 Reporting Bugs

Use the [Bug Report template](../../issues/new?template=bug_report.md) and include:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable.

**Environment**
- OS: [e.g. macOS 14, Windows 11, Ubuntu 22.04]
- Node version: [e.g. 20.11.0]
- App version: [e.g. 1.0.0]
```

---

## ✨ Suggesting Features

Use the [Feature Request template](../../issues/new?template=feature_request.md) and include:

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want.

**Describe alternatives you've considered**
Other solutions you've considered.

**Additional context**
Any mockups, examples, or references.
```

---

## 🏥 Healthcare-Specific Guidelines

VaidyaMarg deals with **sensitive health data**. Extra care is required:

- ❌ Never log prescription details, patient names, or medicine data
- ❌ Never commit real prescription images to the repository
- ✅ Always use dummy/mock data for development and testing
- ✅ Encrypt all health-related fields in the database
- ✅ Follow **DPDP Act 2023** compliance guidelines
- ✅ Get pharmacist review before any medicine data changes go live

---

<div align="center">

Thank you for helping make healthcare affordable for every Indian! 🇮🇳❤️

**VaidyaMarg — वैद्यमार्ग**

</div>
