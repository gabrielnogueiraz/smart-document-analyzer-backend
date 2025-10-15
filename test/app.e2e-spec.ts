import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404); // Should return 404 for root path
  });

  it('/api/docs (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/docs')
      .expect(200);
  });

  describe('Auth endpoints', () => {
    it('/auth/register (POST) - should register new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('test@example.com');
        });
    });

    it('/auth/register (POST) - should reject duplicate email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
        })
        .expect(201);

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
        })
        .expect(409);
    });

    it('/auth/login (POST) - should login with valid credentials', async () => {
      // First register a user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(201);

      // Then login
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('/auth/login (POST) - should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Protected endpoints', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get access token
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'protected@example.com',
          password: 'password123',
        })
        .expect(201);

      accessToken = response.body.accessToken;
    });

    it('/users/profile (GET) - should get user profile', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body.email).toBe('protected@example.com');
        });
    });

    it('/users/profile (GET) - should reject without token', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);
    });

    it('/users/profile (PUT) - should update user profile', () => {
      return request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
        });
    });

    it('/users/stats (GET) - should get user stats', () => {
      return request(app.getHttpServer())
        .get('/users/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('documents');
          expect(res.body).toHaveProperty('analyses');
        });
    });
  });

  describe('Document endpoints', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get access token
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'documents@example.com',
          password: 'password123',
        })
        .expect(201);

      accessToken = response.body.accessToken;
    });

    it('/documents (GET) - should list user documents', () => {
      return request(app.getHttpServer())
        .get('/documents')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/documents (GET) - should reject without token', () => {
      return request(app.getHttpServer())
        .get('/documents')
        .expect(401);
    });
  });

  describe('Analysis endpoints', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get access token
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'analysis@example.com',
          password: 'password123',
        })
        .expect(201);

      accessToken = response.body.accessToken;
    });

    it('/analysis (GET) - should list user analyses', () => {
      return request(app.getHttpServer())
        .get('/analysis')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/analysis/stats/overview (GET) - should get analysis stats', () => {
      return request(app.getHttpServer())
        .get('/analysis/stats/overview')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalAnalyses');
          expect(res.body).toHaveProperty('recentAnalyses');
          expect(res.body).toHaveProperty('mostFrequentTopics');
        });
    });
  });
});
