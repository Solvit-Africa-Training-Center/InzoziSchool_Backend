import supertest, { Request, Response } from 'supertest';
import { it, describe, expect } from '@jest/globals';
import { Database } from '../src/database';
import { app } from '../src/server';

const request = supertest(app);

describe('Get /', () => {
  it('should return Hello world', async () => {
    const res = await request.get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello World');
  });
});

beforeAll(async () => {
  await Database.database.authenticate();
  await Database.database.sync({ force: true });
});

afterAll(async () => {
  await Database.database.close();
});
