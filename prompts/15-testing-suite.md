# Prompt 7.1 — Testing Suite

## Context
CorpVerse has zero tests. The backend has Jest and Supertest installed but no test files. Before going to production, we need at minimum: unit tests for critical business logic, integration tests for API endpoints, and basic frontend component tests.

## Objective
Build a testing suite with 80%+ coverage on critical paths: authentication, applications, interviews, gamification, and core API endpoints.

---

## Task 1: Backend Test Setup

### 1.1 — Test Configuration
**Create**: `backend/jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterSetup: ['./tests/setup.js'],
};
```

### 1.2 — Test Setup File
**Create**: `backend/tests/setup.js`

```javascript
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});
```

### 1.3 — Install Test Dependencies
```bash
npm install --save-dev mongodb-memory-server
```

---

## Task 2: Authentication Tests

**Create**: `backend/tests/auth.test.js`

```javascript
describe('Authentication', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data');
    it('should return JWT token on successful registration');
    it('should hash the password (not store plaintext)');
    it('should generate OTP code');
    it('should reject duplicate email');
    it('should reject invalid email format');
    it('should reject weak password (less than 6 chars)');
    it('should reject missing required fields');
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials');
    it('should return JWT token on successful login');
    it('should reject incorrect password');
    it('should reject non-existent email');
    it('should return user object without password');
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with correct OTP');
    it('should reject expired OTP');
    it('should reject incorrect OTP');
    it('should accept dev bypass code 000000 for @cv.com emails');
    it('should set user.isVerified to true');
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token');
    it('should reject request without token');
    it('should reject request with expired token');
    it('should not include password in response');
  });
});
```

---

## Task 3: Application System Tests

**Create**: `backend/tests/application.test.js`

```javascript
describe('Job Applications', () => {
  describe('POST /api/applications', () => {
    it('should create application for valid role');
    it('should reject if user has no resume');
    it('should reject if role is closed');
    it('should reject duplicate application to same role');
    it('should reject if user is on cooldown');
    it('should reject if max active applications reached');
    it('should set initial status to pending_screening');
  });

  describe('GET /api/applications/me', () => {
    it('should return user applications with populated role/company');
    it('should support status filter');
    it('should support pagination');
    it('should sort by createdAt descending');
  });

  describe('Application Status Machine', () => {
    it('should transition pending_screening → screening_passed');
    it('should transition pending_screening → screening_rejected');
    it('should set cooldown on screening rejection');
    it('should add feedback on rejection');
  });
});
```

---

## Task 4: Gamification Tests

**Create**: `backend/tests/gamification.test.js`

```javascript
describe('Gamification Engine', () => {
  describe('EXP System', () => {
    it('should award EXP and update user total');
    it('should create ExpLog entry with correct source');
    it('should deduct EXP (floor at 0)');
  });

  describe('Streak System', () => {
    it('should increment streak on consecutive days');
    it('should reset streak after missed day');
    it('should track longest streak');
    it('should award streak bonus at milestones (3, 7, 14, 30)');
  });

  describe('Promotion System', () => {
    it('should check promotion eligibility correctly');
    it('should promote junior → mid when criteria met');
    it('should promote mid → senior when criteria met');
    it('should award promotion bonus EXP');
    it('should not promote if criteria not fully met');
  });

  describe('Badge System', () => {
    it('should award badge on first application');
    it('should award badge on first job');
    it('should award streak badges at milestones');
    it('should not award duplicate badges');
  });
});
```

---

## Task 5: Middleware Tests

**Create**: `backend/tests/middleware.test.js`

```javascript
describe('Middleware', () => {
  describe('requireAuth', () => {
    it('should pass with valid JWT');
    it('should reject with missing Authorization header');
    it('should reject with malformed token');
    it('should reject with expired token');
    it('should attach user to req.user');
  });

  describe('requireRole', () => {
    it('should pass when user has required role');
    it('should reject when user lacks required role');
    it('should support multiple allowed roles');
  });

  describe('validate', () => {
    it('should pass valid request body');
    it('should reject invalid request body with Zod errors');
    it('should sanitize/parse data through Zod');
  });

  describe('rateLimiter', () => {
    it('should allow requests under limit');
    it('should block requests over limit');
  });
});
```

---

## Task 6: Test Helpers

**Create**: `backend/tests/helpers.js`

```javascript
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const jwt = require('../src/utils/jwt');

// Create a test user and return { user, token }
async function createTestUser(overrides = {}) {
  const userData = {
    name: 'Test User',
    email: `test-${Date.now()}@test.com`,
    password: 'TestPass123',
    isVerified: true,
    profileComplete: true,
    role: 'job_seeker',
    ...overrides,
  };
  
  const user = await User.create(userData);
  const token = jwt.sign({ id: user._id });
  
  return { user, token };
}

// Create an authenticated request helper
function authRequest(method, path, token) {
  return request(app)[method](path)
    .set('Authorization', `Bearer ${token}`);
}

module.exports = { createTestUser, authRequest };
```

---

## Task 7: Run Tests & Generate Coverage

### 7.1 — Update package.json scripts
```json
{
  "scripts": {
    "test": "jest --passWithNoTests --forceExit --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --forceExit --detectOpenHandles"
  }
}
```

### 7.2 — Run and verify
```bash
cd backend && npm run test:coverage
```

---

## Acceptance Criteria
- [ ] Test setup uses MongoDB in-memory server (no external DB needed)
- [ ] Database cleaned between tests (no test pollution)
- [ ] Authentication tests cover register, login, verify, getMe
- [ ] Application tests cover creation, validation, status transitions
- [ ] Gamification tests cover EXP, streaks, promotions, badges
- [ ] Middleware tests cover auth, role, validation, rate limiting
- [ ] Test helpers simplify user creation and authenticated requests
- [ ] All tests pass: `npm test`
- [ ] Coverage report generated: `npm run test:coverage`
- [ ] Coverage ≥ 80% on lines and functions for tested modules
- [ ] Tests run in under 30 seconds
