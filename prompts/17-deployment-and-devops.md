# Prompt 7.3 — Deployment & DevOps

## Context
CorpVerse has a partial `render.yaml` (backend only). The frontend deploys on Vercel (has `vercel.json`). The AI service has no deployment config. We need complete deployment configuration, Docker setup for local development, and CI/CD basics.

## Objective
Set up Docker Compose for local development, complete deployment configs for all 3 services, add health checks, and create a basic CI pipeline.

---

## Task 1: Docker Compose for Local Development

**Create**: `docker-compose.yml` (project root)

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: corpverse-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_DATABASE: corpverse

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: corpverse-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - PORT=5000
      - MONGODB_URI=mongodb://mongodb:27017/corpverse
      - JWT_SECRET=${JWT_SECRET:-corpverse-dev-secret-change-in-production-min32chars}
      - JWT_EXPIRES_IN=7d
      - CLIENT_URL=http://localhost:5173
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      - mongodb
    volumes:
      - ./backend/src:/app/src
      - ./backend/seed:/app/seed
    command: npm run dev

  ai-service:
    build:
      context: ./ai_service
      dockerfile: Dockerfile
    container_name: corpverse-ai
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=development
      - HOST=0.0.0.0
      - PORT=8000

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: corpverse-frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:5000/api
    volumes:
      - ./frontend/src:/app/src
    command: npm run dev -- --host 0.0.0.0

volumes:
  mongo-data:
```

---

## Task 2: Dockerfiles

### 2.1 — Backend Dockerfile
**Create**: `backend/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --production=false

# Copy source
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["npm", "start"]
```

### 2.2 — AI Service Dockerfile
**Create**: `ai_service/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2.3 — Frontend Dockerfile (Dev)
**Create**: `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 2.4 — Docker Ignore Files
**Create**: `backend/.dockerignore`, `frontend/.dockerignore`, `ai_service/.dockerignore`

```
node_modules
.env
.git
*.md
tests
coverage
```

---

## Task 3: Complete render.yaml

**File**: `render.yaml`

```yaml
services:
  # Backend API
  - type: web
    name: corpverse-backend
    runtime: node
    plan: free
    region: oregon
    buildCommand: cd backend && npm ci
    startCommand: cd backend && npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false  # Set manually in Render dashboard
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: 7d
      - key: CLIENT_URL
        value: https://corpverse.vercel.app
      - key: AI_SERVICE_URL
        fromService:
          name: corpverse-ai
          type: web
          property: hostport
      - key: ENCRYPTION_KEY
        generateValue: true

  # AI Microservice
  - type: web
    name: corpverse-ai
    runtime: python
    plan: free
    region: oregon
    buildCommand: cd ai_service && pip install -r requirements.txt
    startCommand: cd ai_service && uvicorn main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
    envVars:
      - key: ENVIRONMENT
        value: production
```

---

## Task 4: Health Check Endpoints

### 4.1 — Backend Health Check (Existing)
Verify `GET /api/health` returns:
```json
{
  "status": "ok",
  "timestamp": "2026-09-05T...",
  "environment": "production",
  "mongodb": "connected",
  "version": "1.0.0"
}
```

Add MongoDB connection status check:
```javascript
router.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: mongoStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoStatus,
    uptime: process.uptime(),
  });
});
```

### 4.2 — AI Service Health Check
**File**: `ai_service/main.py`

Ensure `/health` endpoint exists:
```python
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "pipelines": list(PIPELINE_REGISTRY.keys()),
        "version": "1.0.0",
    }
```

---

## Task 5: Environment Management

### 5.1 — Update .env.example Files
**Backend**: `backend/.env.example`
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/corpverse

# Authentication
JWT_SECRET=your-secret-here-must-be-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# AI Microservice
AI_SERVICE_URL=http://localhost:8000

# Encryption (for AI provider API keys)
ENCRYPTION_KEY=your-encryption-key-here-32-chars

# Email (optional — logs to console if not set)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@corpverse.com
SMTP_SECURE=false
```

**Frontend**: `frontend/.env.example`
```env
VITE_API_URL=http://localhost:5000/api
```

### 5.2 — Git Safety
Verify `.gitignore` files exclude:
- `.env` (both backend and frontend)
- `node_modules/`
- `uploads/` (backend — exclude uploaded files)
- `coverage/` (test coverage reports)
- `.DS_Store`

---

## Task 6: Database Seeding Script Update

**File**: `backend/seed/seed.js`

Update the seed script to create a complete demo dataset:
1. Admin user (admin@corpverse.com / Admin@123)
2. AI Manager user
3. 3 domains (Technology, Finance, Healthcare)
4. 5 companies with roles
5. AI providers (seeded from `seedAiEcosystem.js`)
6. Sample redeem codes
7. A few test job seekers with profiles and resumes

Add a `--clean` flag:
```bash
npm run seed          # Seed only if empty
npm run seed:clean    # Drop all data and re-seed
```

---

## Task 7: Production Build Script

### 7.1 — Frontend Production Build
```bash
cd frontend && npm run build
```
Verify `dist/` directory is created with optimized assets.

### 7.2 — Startup Verification Script
**Create**: `scripts/verify-setup.sh`

```bash
#!/bin/bash
echo "🔍 Verifying CorpVerse setup..."

# Check Node.js
node --version || { echo "❌ Node.js not found"; exit 1; }

# Check MongoDB
mongosh --eval "db.version()" 2>/dev/null || echo "⚠️ MongoDB not running locally (Docker will handle it)"

# Check Python
python3 --version || { echo "❌ Python 3 not found"; exit 1; }

# Check backend dependencies
cd backend && npm ls 2>/dev/null || { echo "❌ Run: cd backend && npm install"; exit 1; }

# Check frontend dependencies  
cd ../frontend && npm ls 2>/dev/null || { echo "❌ Run: cd frontend && npm install"; exit 1; }

# Check AI service dependencies
cd ../ai_service && pip check 2>/dev/null || echo "⚠️ Run: cd ai_service && pip install -r requirements.txt"

echo "✅ Setup verification complete!"
```

---

## Task 8: README.md

**Create/Update**: `README.md` (project root)

```markdown
# CorpVerse — Gamified Corporate Simulation Platform

> Practice the corporate world. Build your career. Found your empire.

## Quick Start

### Option 1: Docker (Recommended)
\`\`\`bash
docker-compose up -d
\`\`\`
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- AI Service: http://localhost:8000

### Option 2: Manual Setup
\`\`\`bash
# Backend
cd backend && cp .env.example .env && npm install && npm run seed && npm run dev

# AI Service (new terminal)
cd ai_service && pip install -r requirements.txt && uvicorn main:app --reload

# Frontend (new terminal)
cd frontend && cp .env.example .env && npm install && npm run dev
\`\`\`

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI Service**: Python, FastAPI, OpenAI-compatible LLMs
- **Auth**: JWT + OTP Email Verification

## Default Admin
- Email: admin@corpverse.com
- Password: Admin@123
```

---

## Acceptance Criteria
- [ ] `docker-compose up` starts all 4 services (mongo, backend, ai, frontend)
- [ ] All services accessible at their respective ports
- [ ] Health checks pass for backend and AI service
- [ ] render.yaml deploys both backend and AI service
- [ ] .env.example files are comprehensive and documented
- [ ] .gitignore excludes all sensitive files
- [ ] Seed script creates a complete demo dataset
- [ ] Frontend production build succeeds
- [ ] README has clear quick-start instructions
- [ ] Dockerfiles have proper health checks
- [ ] Docker compose uses volumes for hot-reloading in dev
