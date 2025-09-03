import { TestSetup } from './helpers/testSetup';

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up global test environment...');
  await TestSetup.beforeAll();
});

afterAll(async () => {
  console.log('🧹 Cleaning up global test environment...');
  await TestSetup.afterAll();
});

// Extend Jest timeout for database operations
jest.setTimeout(30000);
