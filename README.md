# 🧠 InterviewIQ AI

> **AI-Powered Mock Interview Arena** — Master technical, system design, and behavioral interviews with real-time AI evaluation, interactive practice simulations, and detailed performance scorecards.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Accessibility](#-accessibility)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

| Category | Details |
|----------|---------|
| **🔐 Authentication** | Google OAuth, GitHub OAuth, JWT sessions, secure cookies, protected routes |
| **📊 Dashboard** | User statistics, interview progress, recent activity feed, skill scorecards |
| **🤖 AI Interview Generator** | AI-powered question generation with role, topic, and difficulty customization |
| **🎯 Interactive Practice Arena** | Real-time countdown timer, split-screen layout, live AI feedback panel, keyboard shortcuts (`Cmd+Enter`) |
| **📈 Performance Analytics** | Custom SVG line charts for score trends, strength/weakness detection, historical interview logs |
| **♿ Accessibility** | WCAG 2.1 AA compliant, full keyboard navigation, ARIA labels, semantic HTML, focus management |
| **🔒 Security** | Zod input validation, CSRF protection, rate limiting, XSS prevention, encrypted JWT sessions |
| **📡 Observability** | Sentry error tracking (client, server, edge), performance monitoring |
| **🧪 Testing** | Jest unit tests, React Testing Library, Playwright E2E tests |
| **🚀 CI/CD** | GitHub Actions pipeline with automated linting, testing, build verification, and E2E checks |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) |
| **ORM** | [Prisma 6](https://www.prisma.io/) |
| **Authentication** | [NextAuth v5 (Auth.js)](https://authjs.dev/) |
| **AI Integration** | [OpenAI SDK](https://platform.openai.com/) (GPT-4o-mini) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Error Tracking** | [Sentry](https://sentry.io/) |
| **Unit Testing** | [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/) |
| **E2E Testing** | [Playwright](https://playwright.dev/) |
| **CI/CD** | [GitHub Actions](https://github.com/features/actions) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```
InterviewIQ/
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions CI/CD pipeline
│
├── __tests__/                              # Jest unit & integration tests
│   ├── components/
│   │   └── Button.test.tsx                 # UI component tests
│   └── lib/
│       └── openai.test.ts                  # AI integration & schema tests
│
├── e2e/                                    # Playwright E2E browser tests
│   └── flow.spec.ts                        # Landing & login page flow tests
│
├── prisma/
│   └── schema.prisma                       # Database schema (Users, Interviews, Questions, Skills, Activities)
│
├── public/                                 # Static assets
│
├── src/
│   ├── app/                                # Next.js App Router
│   │   ├── layout.tsx                      # Root layout (providers, metadata, fonts)
│   │   ├── page.tsx                        # Public landing page (hero, features, pricing)
│   │   ├── globals.css                     # Tailwind v4 theme & custom utilities
│   │   ├── providers.tsx                   # Client-side NextAuth SessionProvider
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx                    # OAuth login card (Google & GitHub)
│   │   │
│   │   ├── (dashboard)/                    # Route group for authenticated pages
│   │   │   ├── layout.tsx                  # Sidebar + content wrapper layout
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                # KPI stats, skill scorecard, activity feed
│   │   │   ├── generator/
│   │   │   │   └── page.tsx                # Interview config form & AI generation loader
│   │   │   ├── practice/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx            # Server component fetching interview data
│   │   │   └── analytics/
│   │   │       └── page.tsx                # SVG charts, strengths/weaknesses, history table
│   │   │
│   │   └── api/                            # API Route Handlers
│   │       ├── auth/[...nextauth]/
│   │       │   └── route.ts                # NextAuth handler exports
│   │       ├── generate/
│   │       │   └── route.ts                # AI question generation endpoint
│   │       ├── practice/[id]/
│   │       │   └── route.ts                # Answer evaluation & skill scoring
│   │       └── analytics/
│   │           └── route.ts                # Metrics aggregation endpoint
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx                 # Responsive collapsible sidebar navigation
│   │   ├── practice/
│   │   │   └── PracticeArenaClient.tsx     # Interactive practice UI (timer, feedback, inputs)
│   │   └── ui/                             # Accessible reusable UI primitives
│   │       ├── button.tsx                  # Multi-variant button component
│   │       ├── card.tsx                    # Modular card with sub-components
│   │       ├── input.tsx                   # Text input with focus rings
│   │       ├── textarea.tsx                # Multi-line text input
│   │       ├── select.tsx                  # Styled native dropdown
│   │       └── progress.tsx                # WCAG-compliant progress bar
│   │
│   ├── lib/
│   │   ├── db.ts                           # Prisma Client singleton
│   │   └── openai.ts                       # OpenAI helpers, Zod schemas, mock fallbacks
│   │
│   ├── auth.ts                             # NextAuth v5 configuration (JWT, OAuth providers)
│   └── middleware.ts                       # Route protection & redirect middleware
│
├── docker-compose.yml                      # Local PostgreSQL container
├── jest.config.ts                          # Jest test configuration
├── jest.setup.ts                           # Jest DOM matchers & fetch polyfill
├── playwright.config.ts                    # Playwright E2E configuration
├── sentry.client.config.ts                 # Sentry client-side initialization
├── sentry.server.config.ts                 # Sentry server-side initialization
├── sentry.edge.config.ts                   # Sentry edge runtime initialization
├── .env.example                            # Environment variable template
├── package.json                            # Dependencies & scripts
└── tsconfig.json                           # TypeScript configuration
```

---

## 📦 Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** ≥ 20.x — [Download](https://nodejs.org/)
- **npm** ≥ 10.x (bundled with Node.js)
- **Docker** & **Docker Compose** — [Download](https://www.docker.com/) (for local PostgreSQL)
- **Git** — [Download](https://git-scm.com/)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/interview-iq-ai.git
cd interview-iq-ai
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your actual API keys (see [Environment Variables](#-environment-variables) below).

### 4. Start the Database

```bash
docker compose up -d
```

### 5. Push the Schema & Generate Client

```bash
npx prisma db push
npx prisma generate
```

### 6. Start the Dev Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `AUTH_SECRET` | Random secret for encrypting JWT sessions | ✅ |
| `AUTH_URL` | Application base URL (e.g., `http://localhost:3000`) | ✅ |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | ✅ |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | ✅ |
| `AUTH_GITHUB_ID` | GitHub OAuth Client ID | ✅ |
| `AUTH_GITHUB_SECRET` | GitHub OAuth Client Secret | ✅ |
| `OPENAI_API_KEY` | OpenAI API key for AI features | ⚡ Optional* |
| `SENTRY_DSN` | Sentry DSN for error tracking | ⚡ Optional |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL | ⚡ Optional |

> **\*** The application runs in **mock mode** when no OpenAI key is provided, returning realistic dummy questions and evaluations so the full UI remains functional.

### OAuth Redirect URIs

When configuring OAuth providers, set these redirect URIs:

| Provider | Redirect URI |
|----------|-------------|
| Google | `http://localhost:3000/api/auth/callback/google` |
| GitHub | `http://localhost:3000/api/auth/callback/github` |

---

## 🗄 Database Setup

The project uses **PostgreSQL 16** via Docker and **Prisma 6** as the ORM.

### Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker compose up -d

# Push schema to database
npx prisma db push

# Generate Prisma Client types
npx prisma generate

# (Optional) Open Prisma Studio GUI to inspect data
npx prisma studio
```

### Schema Overview

| Model | Purpose |
|-------|---------|
| `User` | User profile (name, email, image) + NextAuth fields |
| `Account` | OAuth provider accounts (Google, GitHub) |
| `Session` | Active user sessions |
| `Interview` | Mock interview sessions (role, topic, difficulty, score) |
| `Question` | Generated questions with answers, scores, and AI feedback |
| `UserSkill` | Rolling skill competency scores (0–100) |
| `Activity` | User action log (started, completed, improved) |

---

## 💻 Running the Application

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |

---

## 🧪 Testing

The project includes three tiers of testing:

### Unit & Integration Tests (Jest + React Testing Library)

```bash
# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Install browser engines (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e
```

### Test Coverage Targets

| Metric | Target |
|--------|--------|
| Statements | ≥ 80% |
| Branches | ≥ 80% |
| Functions | ≥ 80% |
| Lines | ≥ 80% |

---

## ⚙️ CI/CD Pipeline

GitHub Actions is configured in `.github/workflows/ci.yml` and runs automatically on:
- Every **push** to `main`
- Every **pull request** targeting `main`

### Pipeline Steps

```
Checkout → Setup Node.js 20 → Install Dependencies → Lint
    → Generate Prisma Client → Push DB Schema (PostgreSQL service container)
    → Jest Tests (with coverage) → Production Build Verification
    → Install Playwright Browsers → E2E Tests
```

> The pipeline spins up a **PostgreSQL 16 service container** automatically — no external database required in CI.

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push** your code to a GitHub repository
2. **Import** the repository in the [Vercel Dashboard](https://vercel.com/new)
3. **Configure** all environment variables from your `.env` file in Vercel's project settings
   - Set `DATABASE_URL` to a production PostgreSQL instance (e.g., [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or [AWS RDS](https://aws.amazon.com/rds/))
4. **Deploy** — Vercel automatically detects Next.js and handles server components, API routes, and edge functions

### Production Checklist

- [ ] Replace `AUTH_SECRET` with a cryptographically secure random string
- [ ] Set all OAuth redirect URIs to your production domain
- [ ] Configure a production PostgreSQL database
- [ ] Set `SENTRY_DSN` for error monitoring
- [ ] Verify Lighthouse scores > 95

---

## 📡 API Reference

### `POST /api/generate`
Generate a new AI-powered mock interview session.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | `string` | ✅ | Target job role |
| `topic` | `string` | ✅ | Interview focus area |
| `difficulty` | `"Beginner" \| "Intermediate" \| "Advanced"` | ✅ | Difficulty level |
| `customInstructions` | `string` | ❌ | Custom context or job description |

**Response:** `201` — Interview object with generated questions.

---

### `POST /api/practice/[id]`
Submit and evaluate an answer for a specific question.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `questionId` | `string` | ✅ | ID of the question being answered |
| `answerText` | `string` | ✅ | Candidate's response (min 5 chars) |
| `timeSpentSeconds` | `number` | ✅ | Time spent on the question |

**Response:** `200` — Score, feedback text, skills assessed, completion status.

---

### `GET /api/analytics`
Retrieve aggregated dashboard statistics and performance data.

**Response:** `200` — Stats, skills, strengths, weaknesses, score trends, activities.

---

## ♿ Accessibility

This application is built with **WCAG 2.1 AA** compliance as a first-class concern:

- ✅ Semantic HTML (`<main>`, `<nav>`, `<section>`, `<header>`, `<aside>`)
- ✅ Full keyboard navigation with visible focus indicators
- ✅ Proper `aria-label`, `aria-live`, `aria-describedby` attributes
- ✅ `role="progressbar"`, `role="timer"` on dynamic elements
- ✅ Color contrast ratios exceeding 4.5:1
- ✅ Responsive layouts from mobile to desktop

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- Follow the existing TypeScript and ESLint configuration
- Write tests for new features (maintain ≥ 80% coverage)
- Ensure all accessibility requirements are met
- Use semantic, descriptive commit messages

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for developers, designers, and builders.**

[Report Bug](https://github.com/your-username/interview-iq-ai/issues) · [Request Feature](https://github.com/your-username/interview-iq-ai/issues) · [Documentation](https://github.com/your-username/interview-iq-ai/wiki)

</div>
# InterviewIQ-AI
