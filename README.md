# 🚨 National Emergency Response & Dispatch Coordination Platform
**CPEN 421 — University of Ghana — 2025/2026**

A production-grade distributed microservices system for coordinating emergency responses across Ghana.

## 🏗️ Architecture
- **API Gateway** — Single entry point (:3000)
- **Auth Service** — Identity & JWT auth (:3001) `PostgreSQL`
- **Incident Service** — Incident management & dispatch (:3002) `PostgreSQL`
- **Dispatch Tracking** — Real-time GPS via Socket.io (:3003) `MongoDB`
- **Analytics Service** — Metrics & reporting (:3004) `MongoDB`
- **AI Call Agent** — Whisper STT fallback handler (:3005) `MongoDB`

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Setup
```bash
# 1. Clone the repo
git clone <your-repo-url>
cd emergency-platform

# 2. Set up environment variables
cp .env.example .env
# Edit .env and fill in your secrets

# 3. Start all infrastructure
docker-compose up -d postgres-auth redis rabbitmq

# 4. Run Auth Service in dev mode
cd services/auth-service
cp .env.example .env   # fill in values
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### Generate JWT Secrets
```bash
# Run this to generate secure secrets for your .env
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📦 Services Status
| Service | Status |
|---------|--------|
| Auth Service | ✅ Complete |
| Incident Service | 🔄 In Progress |
| Dispatch Service | ⏳ Pending |
| Analytics Service | ⏳ Pending |
| AI Call Agent | ⏳ Pending |
| API Gateway | ⏳ Pending |
| Frontend | ⏳ Pending |

## 📚 API Docs
Each service exposes Swagger UI at `/docs` when running.
- Auth Service: http://localhost:3001/docs
