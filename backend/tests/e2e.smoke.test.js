const mongoose = require('mongoose');

// In-memory data stores
const userStore = new Map();
const redeemStore = new Map();

// Mock supertest to dispatch in-process without network sockets (safe in sandbox & CI)
jest.mock('supertest', () => {
  const express = require('express');
  return function supertestMock(appInstance) {
    const makeRequest = (method, urlPath) => {
      let reqHeaders = {};
      let reqBody = null;

      const chain = {
        set(keyOrObj, val) {
          if (typeof keyOrObj === 'object') {
            for (const [k, v] of Object.entries(keyOrObj)) {
              reqHeaders[k.toLowerCase()] = v;
            }
          } else {
            reqHeaders[keyOrObj.toLowerCase()] = val;
          }
          return chain;
        },
        send(data) {
          reqBody = data;
          return chain;
        },
        then(resolve, reject) {
          return new Promise((resFn, rejFn) => {
            const socket = {
              remoteAddress: '127.0.0.1',
              encrypted: false,
              readable: true,
              writable: true,
              on: () => {},
              once: () => {},
              emit: () => {},
            };
            const urlObj = new URL(urlPath, 'http://localhost');
            const query = {};
            urlObj.searchParams.forEach((v, k) => {
              query[k] = v;
            });

            const req = {
              method: method.toUpperCase(),
              url: urlPath,
              originalUrl: urlPath,
              path: urlObj.pathname,
              headers: {
                'content-type': 'application/json',
                ...reqHeaders,
              },
              body: reqBody || {},
              query,
              params: {},
              socket,
              connection: socket,
            };

            let resHeaders = {};
            let statusCode = 200;
            let resBody = null;
            let finished = false;

            const finish = () => {
              if (finished) return;
              finished = true;
              resFn({
                status: statusCode,
                statusCode,
                body: resBody,
                headers: resHeaders,
              });
            };

            const res = {
              statusCode: 200,
              headers: resHeaders,
              setHeader(name, val) {
                resHeaders[name.toLowerCase()] = val;
              },
              getHeader(name) {
                return resHeaders[name.toLowerCase()];
              },
              removeHeader(name) {
                delete resHeaders[name.toLowerCase()];
              },
              status(code) {
                this.statusCode = code;
                statusCode = code;
                return this;
              },
              json(data) {
                resBody = data;
                finish();
                return this;
              },
              send(data) {
                if (!resBody) {
                  if (typeof data === 'string') {
                    try {
                      resBody = JSON.parse(data);
                    } catch (_) {
                      resBody = data;
                    }
                  } else {
                    resBody = data;
                  }
                }
                finish();
                return this;
              },
              end() {
                finish();
              },
            };

            Object.setPrototypeOf(req, express.request);
            Object.setPrototypeOf(res, express.response);

            try {
              appInstance.handle(req, res, (err) => {
                if (err) rejFn(err);
                else finish();
              });
            } catch (err) {
              rejFn(err);
            }
          }).then(resolve, reject);
        },
        catch(reject) {
          return chain.then(undefined, reject);
        },
      };
      return chain;
    };

    return {
      get: (url) => makeRequest('GET', url),
      post: (url) => makeRequest('POST', url),
      put: (url) => makeRequest('PUT', url),
      patch: (url) => makeRequest('PATCH', url),
      delete: (url) => makeRequest('DELETE', url),
    };
  };
});

// Mock models to isolate test runs
jest.mock('../src/models/User');
jest.mock('../src/models/Company');
jest.mock('../src/models/RedeemCode');
jest.mock('../src/models/ExpLog');
jest.mock('../src/models/Badge');
jest.mock('../src/models/EmployeeRecord');
jest.mock('../src/models/Task');
jest.mock('../src/models/Application');
jest.mock('../src/models/Interview');

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Company = require('../src/models/Company');
const RedeemCode = require('../src/models/RedeemCode');
const ExpLog = require('../src/models/ExpLog');
const Badge = require('../src/models/Badge');
const EmployeeRecord = require('../src/models/EmployeeRecord');
const Application = require('../src/models/Application');
const Interview = require('../src/models/Interview');

describe('E2E Lifecycle Smoke Test', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    userStore.clear();
    redeemStore.clear();

    // Secondary gamification mocks
    EmployeeRecord.findOne.mockResolvedValue(null);
    EmployeeRecord.findById.mockResolvedValue(null);
    ExpLog.create.mockImplementation((data) => Promise.resolve({ _id: 'log1', ...data }));
    Badge.findOne.mockResolvedValue(null);
    Badge.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
      select: jest.fn().mockReturnThis(),
    });
    Badge.create.mockImplementation((data) => Promise.resolve({ _id: 'badge1', ...data }));
    if (Application && Application.countDocuments) {
      Application.countDocuments.mockResolvedValue(0);
    }
    if (Interview && Interview.find) {
      Interview.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
    }

    // Mock User Model
    User.create.mockImplementation(async (userData) => {
      const id = new mongoose.Types.ObjectId().toString();
      const user = {
        _id: id,
        ...userData,
        expTotal: userData.expTotal || 0,
        corpCoins: userData.corpCoins || 0,
        comparePassword: jest.fn().mockImplementation(async (pwd) => pwd === userData.password),
        save: jest.fn().mockImplementation(async function () {
          userStore.set(this._id.toString(), this);
          return this;
        }),
        toObject: function () {
          return { ...this };
        },
      };
      userStore.set(id, user);
      userStore.set(user.email, user);
      return user;
    });

    User.findOne.mockImplementation((query) => {
      let found = null;
      if (query.email) found = userStore.get(query.email);
      if (!found && query._id) found = userStore.get(query._id.toString());
      return {
        select: jest.fn().mockImplementation(() => Promise.resolve(found)),
        lean: jest.fn().mockImplementation(() => Promise.resolve(found)),
      };
    });

    User.findById.mockImplementation((id) => {
      const found = userStore.get(id ? id.toString() : '');
      return Promise.resolve(found || null);
    });

    User.findByIdAndUpdate.mockImplementation((id, update) => {
      const found = userStore.get(id ? id.toString() : '');
      if (found) {
        Object.assign(found, update);
        return Promise.resolve(found);
      }
      return Promise.resolve(null);
    });

    User.deleteMany.mockImplementation(async () => {
      userStore.clear();
      return { acknowledged: true, deletedCount: 1 };
    });

    User.find.mockImplementation(() => {
      const list = Array.from(userStore.values()).map((u) => ({
        _id: u._id,
        name: u.name,
        avatarUrl: u.avatarUrl || null,
        corpCoins: u.corpCoins || 0,
        currentStatus: u.currentStatus || 'job_seeker',
        domainInterest: u.domainInterest || 'software',
        role: u.role || 'job_seeker',
      }));
      return {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(list),
      };
    });

    // Mock RedeemCode Model
    RedeemCode.create.mockImplementation(async (codeData) => {
      const id = new mongoose.Types.ObjectId().toString();
      const codeDoc = {
        _id: id,
        usedCount: 0,
        redeemedBy: [],
        isActive: true,
        maxUses: 100,
        expAmount: 0,
        coinAmount: 0,
        ...codeData,
      };
      redeemStore.set(codeDoc.code.toUpperCase(), codeDoc);
      return codeDoc;
    });

    RedeemCode.findOne.mockImplementation((query) => {
      const cleanCode = (query.code || '').toUpperCase();
      const doc = redeemStore.get(cleanCode);
      return Promise.resolve(doc || null);
    });

    RedeemCode.findOneAndUpdate.mockImplementation((filter, update) => {
      const doc = Array.from(redeemStore.values()).find((d) => {
        if (filter._id && d._id.toString() !== filter._id.toString()) return false;
        if (filter.usedCount && filter.usedCount.$lt && d.usedCount >= filter.usedCount.$lt) return false;
        if (filter.redeemedBy && filter.redeemedBy.$ne) {
          const userIdStr = filter.redeemedBy.$ne.toString();
          if (d.redeemedBy.some((r) => r.toString() === userIdStr)) return false;
        }
        return true;
      });

      if (!doc) return Promise.resolve(null);

      if (update.$inc && update.$inc.usedCount) {
        doc.usedCount += update.$inc.usedCount;
      }
      if (update.$push && update.$push.redeemedBy) {
        doc.redeemedBy.push(update.$push.redeemedBy);
      }
      return Promise.resolve(doc);
    });

    RedeemCode.deleteMany.mockImplementation(async () => {
      redeemStore.clear();
      return { acknowledged: true, deletedCount: 1 };
    });

    // Mock Company Model
    Company.find.mockImplementation(() => {
      const mockCompanies = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          name: 'Nexus Corp',
          domain: 'Tech',
          valuation: 2500000,
          treasury: 150000,
          employeeCount: 25,
          logoUrl: null,
          isSeedCompany: false,
          founder: { name: 'Smoke Founder', avatarUrl: null },
        },
      ];
      return {
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockCompanies),
      };
    });

    // 1. Create verified test user
    const user = await User.create({
      name: 'Smoke Tester',
      email: `smoke_${Date.now()}@corpverse.dev`,
      password: 'password123',
      isVerified: true,
      profileComplete: true,
      role: 'job_seeker',
      expTotal: 50,
      corpCoins: 500,
    });
    testUserId = user._id;

    const res = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: 'password123',
    });
    authToken = res.body.data.token;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@corpverse\.dev/ });
    await RedeemCode.deleteMany({ code: /SMOKE_/ });
  });

  test('User can redeem a combined EXP + CorpCoin code', async () => {
    const code = await RedeemCode.create({
      code: `SMOKE_${Date.now()}`,
      expAmount: 100,
      coinAmount: 500,
      maxUses: 5,
    });

    const res = await request(app)
      .post('/api/profile/redeem-code')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ code: code.code });

    expect(res.status).toBe(200);
    const updatedUser = await User.findById(testUserId);
    expect(updatedUser.expTotal).toBe(150);
    expect(updatedUser.corpCoins).toBe(1000);
  });

  test('Double-spend prevention rejects second redemption of the same code', async () => {
    const code = await RedeemCode.create({
      code: `SMOKE_SINGLE_${Date.now()}`,
      expAmount: 50,
      coinAmount: 100,
      maxUses: 10,
    });

    // First claim succeeds
    const firstRes = await request(app)
      .post('/api/profile/redeem-code')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ code: code.code });
    expect(firstRes.status).toBe(200);

    // Second claim fails
    const secondRes = await request(app)
      .post('/api/profile/redeem-code')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ code: code.code });
    expect(secondRes.status).toBe(400);
  });

  test('Public can view wealth and company leaderboards', async () => {
    const wealthRes = await request(app).get('/api/leaderboard/wealth');
    expect(wealthRes.status).toBe(200);
    expect(Array.isArray(wealthRes.body.data)).toBe(true);

    const compRes = await request(app).get('/api/leaderboard/companies');
    expect(compRes.status).toBe(200);
    expect(Array.isArray(compRes.body.data)).toBe(true);
  });
});
