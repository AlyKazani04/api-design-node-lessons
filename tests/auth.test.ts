import request from 'supertest';
import app from '../src/server.ts';
import env from '../env.ts';
import { createTestHabit, cleanUpDatabase, createTestUser } from './helpers/dbHelpers.ts';

describe('Authentication Endpoints', () => {
  afterEach(async () => {
    await cleanUpDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('Should register a new user with valid data', async () => {
      const userData = {
        email: "testemail@test.com",
        username: 'testuser',
        password: 'admin1234',
      }
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).not.toHaveProperty('password');
    });
  });

  describe('POST /api/auth/login', () => {
    it('Should login in with valid credentials', async () => {
      const testuser = await createTestUser();

      const credentials = {
        email: testuser.user.email,
        password: testuser.rawPassword,
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).not.toHaveProperty('password');
    });
  });
});
