import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/me (GET) rejects a request without a session token', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('/auth/login (POST) rejects an invalid email', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'no-es-un-email', password: 'motorista-veloz' })
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
