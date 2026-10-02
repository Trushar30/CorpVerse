# Prompt 7.2 — Security Audit & Hardening

## Context
CorpVerse handles user credentials, resume files, API keys (encrypted), and financial-like data (CorpCoins, company valuations). Before production, we need a comprehensive security audit and hardening pass.

## Objective
Audit and fix all security vulnerabilities, harden the application against common attacks, and ensure sensitive data is properly protected.

---

## Task 1: Input Validation Audit

### 1.1 — Review All Endpoints Without Zod Validation
Audit every route in `backend/src/routes/` and ensure ALL endpoints that accept user input have Zod validation middleware.

**Currently missing validation on**:
- Founder routes (company creation, role posting)
- Marketplace routes (purchase, bot run)
- AI Manager routes (provider creation, bot creation)
- Interview routes (message sending)
- Employee routes (task completion)
- Notification routes (mark read)
- Leaderboard routes (query params)
- Search routes (query params)

### 1.2 — Create Missing Validation Schemas
**Create files in**: `backend/src/validations/`

For each unvalidated endpoint, create Zod schemas that:
- Validate types strictly
- Trim and sanitize strings
- Enforce length limits on all text inputs
- Validate ObjectId format for all ID parameters
- Validate enum values
- Reject unexpected fields (`.strict()`)

Example for founder:
```javascript
// backend/src/validations/founder.validation.js
const createCompanySchema = z.object({
  name: z.string().trim().min(2).max(100),
  domain: z.string().trim().min(2).max(50),
  description: z.string().trim().min(10).max(1000),
  industry: z.string().trim().min(2).max(50).optional(),
  tagline: z.string().trim().max(200).optional(),
}).strict();

const postRoleSchema = z.object({
  title: z.string().trim().min(2).max(100),
  domain: z.string().trim().min(2).max(50),
  level: z.enum(['junior', 'mid', 'senior']),
  description: z.string().trim().min(10).max(2000),
  requirements: z.array(z.string().trim().max(200)).min(1).max(20),
  responsibilities: z.array(z.string().trim().max(200)).max(20).optional(),
  salaryRange: z.object({
    min: z.number().int().min(0).max(1000000),
    max: z.number().int().min(0).max(1000000),
  }).optional(),
  maxOpenings: z.number().int().min(1).max(100).default(1),
}).strict();
```

---

## Task 2: NoSQL Injection Prevention

### 2.1 — Audit All MongoDB Queries
Search for any query that directly uses user input without sanitization:
```bash
grep -r "req.body\|req.query\|req.params" backend/src/controllers/ --include="*.js"
```

Ensure no query uses `$where`, `$regex` with unescaped user input, or passes raw objects.

### 2.2 — Sanitize Query Parameters
For search endpoints that use regex:
```javascript
// DANGEROUS:
const regex = new RegExp(req.query.q, 'i');

// SAFE:
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regex = new RegExp(escapeRegex(req.query.q), 'i');
```

Add this utility function and use it everywhere regex is built from user input.

---

## Task 3: Authentication & Authorization Hardening

### 3.1 — JWT Security
- Ensure JWT secret is sufficiently long (minimum 32 characters)
- Add startup validation: if `JWT_SECRET` is default or too short, refuse to start
- Consider adding `jti` (JWT ID) for token revocation capability
- Ensure token expiry is enforced

### 3.2 — Password Policy
- Enforce minimum 8 characters (currently 6)
- Require at least 1 uppercase, 1 lowercase, 1 number
- Add Zod validation for password complexity:
```javascript
password: z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number'),
```

### 3.3 — Authorization Checks
Audit every controller for proper ownership verification:
- Can a user access another user's applications? ← Block this
- Can a user modify another user's profile? ← Block this
- Can a founder manage another founder's company? ← Block this
- Can a non-admin access admin endpoints? ← Block this

---

## Task 4: Rate Limiting Audit

### 4.1 — Current Limiters
- `generalLimiter`: 100/15min — OK but only enabled in production
- `authLimiter`: 20/15min — OK
- `uploadLimiter`: 10/hour — OK

### 4.2 — Add Missing Rate Limiters
```javascript
// OTP resend: max 3 per hour
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many OTP requests. Try again in an hour.' },
});

// Search: max 30 per minute
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});

// AI pipeline runs: max 10 per hour per user
const pipelineLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?._id?.toString(),
});
```

### 4.3 — Enable General Limiter in All Environments
Even in development, rate limiting should be active (with higher limits).

---

## Task 5: Helmet & Security Headers

### 5.1 — Review Helmet Configuration
**File**: `backend/src/app.js`

Current: `app.use(helmet())` — uses defaults.

Enhance:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", process.env.CLIENT_URL].filter(Boolean),
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
```

---

## Task 6: CORS Hardening

### 6.1 — Review CORS Configuration
Current CORS allows `localhost` and `*.vercel.app`. Tighten:

```javascript
const allowedOrigins = [
  process.env.CLIENT_URL,
  // Add specific preview URLs instead of wildcard
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow Vercel preview deployments
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## Task 7: Sensitive Data Protection

### 7.1 — API Key Encryption Audit
- Verify AES-256-GCM encryption is properly implemented for AI provider keys
- Ensure encrypted keys are never logged
- Ensure decrypted keys are never returned in API responses
- Add `apiKeyEncrypted: { select: false }` on the model (already done)

### 7.2 — User Data Sanitization
Ensure these fields are NEVER returned in API responses:
- `password` (has `select: false` ✅)
- `otpCode` (has `select: false` ✅)
- `otpExpiresAt` (has `select: false` ✅)
- Resume `fileBuffer` (has `select: false` ✅)

Audit all `.populate()` calls to ensure they don't accidentally include sensitive fields.

### 7.3 — Error Messages
Ensure production error responses don't leak:
- Stack traces
- Database collection names
- Internal file paths
- MongoDB query details

Review `errorHandler.js` — ensure `isProd` correctly hides stack traces.

---

## Task 8: Dependency Security

### 8.1 — Audit Dependencies
```bash
cd backend && npm audit
cd frontend && npm audit
```

Fix all critical and high vulnerabilities.

### 8.2 — Pin Critical Dependency Versions
In `package.json`, consider pinning (removing `^`) for:
- `jsonwebtoken`
- `bcryptjs`
- `mongoose`
- `express`

---

## Task 9: Environment Variable Validation

**File**: `backend/src/config/index.js`

Add startup validation:
```javascript
const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`FATAL: Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be at least 32 characters');
  process.exit(1);
}
```

---

## Acceptance Criteria
- [ ] ALL endpoints accepting user input have Zod validation
- [ ] No NoSQL injection vectors (regex inputs escaped)
- [ ] Password policy enforces 8+ chars with complexity requirements
- [ ] Every controller verifies resource ownership
- [ ] Rate limiters on OTP resend, search, and pipeline runs
- [ ] Helmet configured with proper CSP directives
- [ ] CORS restricted to known origins
- [ ] No sensitive data leaked in API responses
- [ ] Production error messages don't leak internals
- [ ] `npm audit` shows no critical/high vulnerabilities
- [ ] Environment variables validated at startup
- [ ] Application refuses to start with missing/weak JWT_SECRET
- [ ] All security fixes documented
