<div align="center">

# JobPilot AI ✈️

**AI-Powered Intelligent Job Discovery Platform**

Describe the job you want in plain English. JobPilot AI understands you,  
discovers real opportunities from multiple sources, and ranks them by how  
well they match your actual requirements.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![LangChain](https://img.shields.io/badge/LangChain.js-0.3-1C3C3C?logo=langchain)](https://js.langchain.com/)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3-F55036)](https://console.groq.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.65-45ba4b?logo=playwright)](https://playwright.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

</div>

---

## 📋 Table of Contents

- [What Is JobPilot AI?](#-what-is-jobpilot-ai)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1 — Backend Setup](#1--backend-setup)
  - [2 — Frontend Setup](#2--frontend-setup)
- [Docker Compose (Recommended)](#-docker-compose-recommended)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [AI Pipeline](#-ai-pipeline)
- [Job Discovery Strategy](#-job-discovery-strategy)
- [Relevance Scoring](#-relevance-scoring)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🤔 What Is JobPilot AI?

Traditional job searching forces you to manually visit five different websites, fight with keyword boxes, and sift through irrelevant results.

**JobPilot AI flips the experience:**

> *"Find Node.js developer jobs in Bangalore for freshers, product-based startups preferred, at least 4 LPA."*

That one sentence is all you need. The platform:

1. **Understands** your intent using a large language model (Groq + LangChain.js)
2. **Generates** diverse search queries from your requirements
3. **Discovers** matching jobs from multiple sources simultaneously (APIs + Playwright)
4. **Deduplicates** and **normalizes** everything into a consistent structure
5. **Scores** every result against your criteria on a 100-point relevance scale
6. **Remembers** what you've seen so you can ask for fresh results next time
7. **Refines** results through natural follow-up messages in the same chat

---

## 🎬 Live Demo

> *Coming soon — hosted demo URL will appear here.*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **Natural Language Search** | Describe your job in plain English — no forms, no dropdowns |
| 🔍 **AI Intent Extraction** | LLM extracts roles, skills, location, experience, salary, company type |
| 🌐 **Multi-Source Discovery** | Adzuna API + RemoteOK API + Playwright-based scraping |
| ⚡ **Database-First Strategy** | Reuses recently verified jobs; only fetches fresh data when needed |
| 🗄️ **Persistent Storage** | All discovered jobs stored in PostgreSQL |
| 🔁 **Deduplication** | Normalized URL matching prevents duplicate listings |
| 📊 **Relevance Scoring** | 100-point score: role, skills, location, experience, salary |
| 💬 **Conversational Refinement** | Refine results mid-conversation ("only remote", "exclude internships") |
| ⭐ **Save Jobs** | Bookmark interesting opportunities per user account |
| 📜 **Search History** | Every search is logged and retrievable |
| 🔒 **JWT Authentication** | Secure user accounts with bcrypt-hashed passwords |
| 🛡️ **Security Best Practices** | Helmet, CORS, rate limiting, input validation |
| 🐳 **Docker Ready** | One command to run the entire stack |

---

## 🏗️ Architecture

```
                      ┌─────────────────────┐
                      │   Next.js Frontend   │
                      │  (Chat UI + Job Cards)│
                      └──────────┬──────────┘
                                 │ REST API
                      ┌──────────▼──────────┐
                      │   Express Backend    │
                      │  (TypeScript + JWT)  │
                      └──────────┬──────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │            Chat Controller           │
              │   (Conversational Session State)     │
              └──────────────────┬──────────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │          LangChain + Groq LLM        │
              │   Intent Extraction  │  Query Gen    │
              └──────────────────┬──────────────────┘
                                 │ Structured Criteria
              ┌──────────────────▼──────────────────┐
              │        Search Orchestrator           │
              │   (Database-First, Freshness Policy) │
              └────────┬──────────────────┬─────────┘
                       │                  │
           ┌───────────▼──┐    ┌──────────▼──────────┐
           │  PostgreSQL  │    │   Job Discovery      │
           │  (Cached DB) │    │   (External Sources) │
           └──────────────┘    └────────┬────────────┘
                                        │
                          ┌─────────────┼──────────────┐
                          ▼             ▼              ▼
                     Adzuna API    RemoteOK API   Playwright
                                                 (WorkIndia)
                                        │
                          ┌─────────────▼──────────────┐
                          │    Normalization Pipeline   │
                          │  Deduplication → Upsert DB  │
                          └─────────────┬──────────────┘
                                        │
                          ┌─────────────▼──────────────┐
                          │    Relevance Scorer         │
                          │  (100-point weighted score) │
                          └─────────────┬──────────────┘
                                        │
                                   Ranked Jobs
```

---

## 🛠️ Technology Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | File-based routing, React Server Components |
| **UI** | React + Tailwind CSS | Utility-first styling, dark mode |
| **Language** | TypeScript 5.5 | End-to-end type safety |
| **Backend** | Node.js + Express 4 | Familiar, fast, battle-tested |
| **LLM** | Groq API (LLaMA 3.3 70B) | Free tier, fastest inference available |
| **AI Framework** | LangChain.js | Structured output, prompt templates, chains |
| **Browser Automation** | Playwright | Headless Chromium for dynamic site scraping |
| **HTTP Client** | Axios | API-based job source requests |
| **Database** | PostgreSQL 16 | Relational + JSONB for skills/filters |
| **ORM** | Prisma 5 | Type-safe queries, schema migrations |
| **Auth** | bcryptjs + JWT | Secure password hashing + stateless auth |
| **Security** | Helmet + rate-limit | HTTP headers + request throttling |
| **Containerization** | Docker + Compose | One-command full-stack deployment |

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20+ | [Download](https://nodejs.org/) |
| npm | 10+ | Comes with Node |
| PostgreSQL | 14+ | Or use Docker (see below) |
| Groq API Key | — | Free at [console.groq.com](https://console.groq.com) |
| Adzuna API Key | Optional | Free at [developer.adzuna.com](https://developer.adzuna.com) — 250 req/month |

> **Quickest PostgreSQL setup (no installation needed):**
> ```bash
> docker run -d \
>   --name jobpilot-postgres \
>   -p 5432:5432 \
>   -e POSTGRES_PASSWORD=password \
>   -e POSTGRES_DB=jobpilot \
>   postgres:16-alpine
> ```

---

### 1 — Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy the example env file
cp .env.example .env
```

Open `backend/.env` and fill in the required values:

```env
GROQ_API_KEY=gsk_...            # Required — from console.groq.com
DATABASE_URL=postgresql://postgres:password@localhost:5432/jobpilot
JWT_SECRET=your-secret-here     # Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```bash
# Create database tables
npx prisma migrate dev --name init

# Start the development server (hot-reload)
npm run dev
```

The API is now live at **http://localhost:4000**

Verify with:
```bash
curl http://localhost:4000/api/health
# → {"status":"ok","service":"jobpilot-backend"}
```

---

### 2 — Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app is now live at **http://localhost:3000** 🎉

---

## 🐳 Docker Compose (Recommended)

Spin up the **entire stack** (PostgreSQL + Backend + Frontend) with one command:

```bash
# 1. Fill in backend/.env with your API keys first
cp backend/.env.example backend/.env
# Edit backend/.env — add GROQ_API_KEY and JWT_SECRET

# 2. Build and start everything
docker-compose up --build

# To stop
docker-compose down

# To stop and remove data
docker-compose down -v
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| PostgreSQL | localhost:5432 |

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ | — | Your Groq API key |
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | Secret for signing JWT tokens |
| `PORT` | ⬜ | `4000` | Backend server port |
| `NODE_ENV` | ⬜ | `development` | `development` or `production` |
| `FRONTEND_URL` | ⬜ | `http://localhost:3000` | CORS origin |
| `GROQ_MODEL` | ⬜ | `llama-3.3-70b-versatile` | LLM model to use |
| `JWT_EXPIRES_IN` | ⬜ | `7d` | Token expiry duration |
| `ADZUNA_APP_ID` | ⬜ | — | Adzuna API App ID |
| `ADZUNA_APP_KEY` | ⬜ | — | Adzuna API App Key |
| `JOB_FRESHNESS_REUSE_HOURS` | ⬜ | `6` | Reuse cached jobs younger than N hours |
| `JOB_FRESHNESS_REFRESH_HOURS` | ⬜ | `24` | Force refresh jobs older than N hours |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ⬜ | `http://localhost:4000` | Backend API base URL |

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Endpoints marked 🔒 require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Login and receive JWT |

**Register / Login body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": { "id": "uuid", "name": "Rahul Sharma", "email": "rahul@example.com" },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

---

### Chat (Conversational Search)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/chat` | 🔒 | Send a message, get jobs + AI reply |
| `GET` | `/api/chat/history` | 🔒 | Retrieve conversation history |
| `DELETE` | `/api/chat/reset` | 🔒 | Clear session and start fresh |

**Chat request:**
```json
{ "message": "Find React developer jobs in Bangalore for freshers" }
```

**Chat response:**
```json
{
  "reply": "I found 10 matching opportunities (3 newly discovered):\n\nTop match: ...",
  "jobs": [ ... ],
  "criteria": {
    "roles": ["React Developer"],
    "locations": ["Bangalore"],
    "experience": { "min": 0, "max": 1 }
  },
  "queries": ["React Developer Bangalore Fresher", "Junior React Developer India"],
  "stats": { "totalFound": 10, "newJobs": 3 }
}
```

---

### Jobs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/jobs/search` | — | Natural language job search |
| `GET` | `/api/jobs` | — | List stored jobs (paginated) |
| `GET` | `/api/jobs/:id` | — | Get a single job by ID |
| `GET` | `/api/jobs/saved` | 🔒 | List saved jobs |
| `POST` | `/api/jobs/:id/save` | 🔒 | Save a job |
| `DELETE` | `/api/jobs/:id/save` | 🔒 | Remove a saved job |

**Search request:**
```json
{
  "message": "Python ML engineer remote India 10 LPA minimum",
  "options": { "onlyNew": false, "recentOnly": true, "limit": 25 }
}
```

---

### Search History

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/search/history` | 🔒 | List user's search history |
| `DELETE` | `/api/search/history/:id` | 🔒 | Delete a history entry |

---

### Utilities

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/ai/parse` | Parse intent (debug) |
| `POST` | `/api/ai/test` | Raw LLM test (debug) |

---

## 🧠 AI Pipeline

```
User Message
     │
     ▼
┌──────────────────────────────┐
│   Intent Extraction Chain    │
│                              │
│  Prompt: System instructions │
│         + User message       │
│         ↓                    │
│  Groq LLaMA 3.3 70B         │
│         ↓                    │
│  Zod-validated JSON output   │
└──────────────────┬───────────┘
                   │
                   ▼
         JobSearchCriteria
  {
    roles: ["Node.js Developer"],
    locations: ["Bangalore"],
    experience: { min: 0, max: 1 },
    skills: ["Node.js", "Express.js"],
    salaryMin: 400000,
    remotePreference: false,
    companyPreference: "Product-based"
  }
                   │
                   ▼
┌──────────────────────────────┐
│    Query Generation Chain    │
│                              │
│  Generates 4–6 diverse       │
│  search strings from above   │
└──────────────────┬───────────┘
                   │
         ["Node.js Developer Bangalore Fresher",
          "Junior Backend Developer India",
          "Node Developer 0-1 Years Bangalore",
          "Entry Level Node.js Engineer India"]
```

---

## 🔎 Job Discovery Strategy

JobPilot AI follows a **database-first** approach to minimize unnecessary scraping and return fast results:

```
Search Request
     │
     ▼
Query PostgreSQL
     │
     ├── Fresh results (< 6h old)? → Return immediately
     │
     └── Stale / insufficient? → Scrape external sources
              │
              ├── Adzuna API (India jobs, free tier)
              ├── RemoteOK API (remote-first roles)
              └── WorkIndia Playwright (dynamic pages)
                       │
                       ▼
              Normalize all raw job data
                       │
                       ▼
              Deduplicate by normalized URL
              (upsert — same job → update timestamp)
                       │
                       ▼
              Persist to PostgreSQL
                       │
                       ▼
              Re-query DB (now includes fresh jobs)
                       │
                       ▼
              Rank by relevance → Return top N
```

**Freshness policy:**

| Last Verified | Action |
|---|---|
| < 6 hours | ✅ Reuse from DB |
| 6 – 24 hours | ♻️ Reuse + optionally refresh |
| > 24 hours | 🔄 Force refresh from sources |
| Confirmed unavailable | 🚫 Mark inactive |

---

## 📊 Relevance Scoring

Every discovered job is scored against the user's extracted criteria:

| Factor | Weight | How |
|---|---:|---|
| **Role Match** | 30% | Job title contains requested role |
| **Skills Match** | 25% | Skills in job listing vs. requested skills |
| **Location Match** | 20% | City/region match or remote alignment |
| **Experience Match** | 15% | Overlap between years ranges |
| **Salary Match** | 10% | Listed salary ≥ minimum requested |
| **Total** | **100%** | — |

**Example score breakdown:**

```json
{
  "jobId": "abc123",
  "relevanceScore": 94,
  "matchedSkills": ["Node.js", "Express.js", "MongoDB"],
  "missingSkills": ["Redis"],
  "explanation": "strong role match; matches skills: Node.js, Express.js, MongoDB; location match"
}
```

> Missing fields are treated as **unknown** (not penalized), so a job without a listed salary doesn't lose salary score.

---

## 📁 Project Structure

```
jobpilot-ai/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma              # DB schema (User, Job, SearchHistory, SavedJob)
│   │
│   ├── src/
│   │   ├── ai/
│   │   │   ├── llm.ts                 # Groq LLM client (LangChain)
│   │   │   ├── extractJobCriteria.ts  # Structured output extraction
│   │   │   ├── generateSearchQueries.ts # LLM query diversification
│   │   │   └── prompts/
│   │   │       └── intentExtraction.ts # System prompt template
│   │   │
│   │   ├── config/
│   │   │   ├── env.ts                 # Type-safe env validation
│   │   │   └── prisma.ts              # Prisma singleton
│   │   │
│   │   ├── middleware/
│   │   │   └── authenticate.ts        # JWT auth middleware
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/                  # POST /register, /login
│   │   │   ├── chatbot/               # POST /chat (conversational)
│   │   │   ├── jobs/                  # GET/POST /jobs, save/unsave
│   │   │   ├── search/                # GET /search/history
│   │   │   ├── health/                # GET /health
│   │   │   └── ai/                    # Debug routes
│   │   │
│   │   ├── repositories/
│   │   │   └── job.repository.ts      # DB upsert, freshness queries
│   │   │
│   │   ├── scrapers/
│   │   │   ├── registry.ts            # Parallel source runner
│   │   │   ├── api/
│   │   │   │   ├── adzuna.source.ts   # Adzuna Job API
│   │   │   │   └── remoteok.source.ts # RemoteOK public API
│   │   │   └── playwright/
│   │   │       └── workindia.source.ts # Playwright scraper
│   │   │
│   │   ├── services/
│   │   │   ├── normalizer.ts          # URL normalization, field mapping
│   │   │   ├── relevanceScorer.ts     # 100-point scoring engine
│   │   │   └── searchOrchestrator.ts  # DB-first search coordinator
│   │   │
│   │   ├── types/
│   │   │   └── index.ts               # Shared interfaces & Zod schema
│   │   │
│   │   ├── validators/
│   │   │   └── jobSearch.schema.ts    # Re-exports from types
│   │   │
│   │   ├── app.ts                     # Express app factory
│   │   └── server.ts                  # Entry point
│   │
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (Inter font, dark mode)
│   │   ├── page.tsx                   # Main page (sidebar + chat)
│   │   ├── saved/page.tsx             # Saved jobs page
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ChatInterface.tsx           # Conversation thread UI
│   │   ├── JobCard.tsx                # Job card (relevance meter, skills)
│   │   └── AuthModal.tsx             # Login / register modal
│   │
│   ├── services/
│   │   └── api.ts                     # Typed API service layer
│   │
│   ├── .env.local
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🗺️ Roadmap

### ✅ Phase 1 — AI Integration
- [x] Groq + LangChain.js integration
- [x] Zod-validated structured output
- [x] Intent extraction prompt
- [x] Search query generation

### ✅ Phase 2 — Job Discovery
- [x] Adzuna API source
- [x] RemoteOK API source
- [x] Playwright scraper (WorkIndia)
- [x] Parallel source registry

### ✅ Phase 3 — Database Integration
- [x] PostgreSQL + Prisma schema
- [x] Job upsert with deduplication
- [x] Freshness policy
- [x] Search history persistence

### ✅ Phase 4 — Search & Ranking
- [x] Database-first orchestration
- [x] URL normalization pipeline
- [x] 100-point relevance scoring
- [x] Conversational refinement

### ✅ Phase 5 — Frontend & Auth
- [x] Next.js 14 App Router
- [x] Chat interface with inline job cards
- [x] JWT auth (register + login)
- [x] Save/unsave jobs
- [x] Saved jobs page

### 🔜 Phase 6 — Scalability
- [ ] Redis caching for frequent searches
- [ ] BullMQ background job workers
- [ ] Webhook-based job freshness
- [ ] Scheduled nightly discovery runs

### 🔜 Phase 7 — Intelligence Upgrades
- [ ] LangGraph.js stateful workflows
- [ ] Semantic similarity matching (embeddings)
- [ ] Resume upload → auto-extract skills
- [ ] AI-generated cover letter suggestions

### 🔜 Phase 8 — Platform Features
- [ ] Email alerts for new matches
- [ ] Application status tracker
- [ ] Interview preparation assistant
- [ ] Personalized recommendation feed

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** this repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/yourusername/jobpilot-ai.git
   ```
3. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/add-new-job-source
   ```
4. **Make your changes** and ensure TypeScript compiles:
   ```bash
   cd backend && npx tsc --noEmit
   cd frontend && npx tsc --noEmit
   ```
5. **Commit** using conventional commit format:
   ```bash
   git commit -m "feat(scrapers): add LinkedIn Jobs API source"
   ```
6. **Push** and open a Pull Request

### Adding a New Job Source

Implement the `JobSource` interface in `backend/src/scrapers/`:

```typescript
import type { JobSource, RawJob, JobSearchCriteria } from "../../types";

export class MyNewSource implements JobSource {
  name = "my-source";

  async searchJobs(
    criteria: JobSearchCriteria,
    queries: string[]
  ): Promise<RawJob[]> {
    // Your implementation here
    return [];
  }
}
```

Then register it in [`src/scrapers/registry.ts`](backend/src/scrapers/registry.ts).

---

## 🔒 Security

- **API keys** are environment variables only — never committed or exposed to the frontend
- **Passwords** are hashed with bcrypt (cost factor 12)
- **JWT tokens** are signed with a secret and expire after 7 days by default
- **HTTP headers** secured with Helmet.js
- **Rate limiting**: 100 req / 15 min globally, 10 req / min on the chat endpoint
- **Input validation** with Zod on all endpoints
- **CORS** restricted to the configured frontend origin
- **URL validation** applied before scraping any external resource

Found a security issue? Please open a [private security advisory](https://github.com/yourusername/jobpilot-ai/security/advisories/new) rather than a public issue.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ and ☕ | Built to solve a real problem

**[⭐ Star this repo](https://github.com/yourusername/jobpilot-ai)** if JobPilot AI helped you or inspired you!

</div>
