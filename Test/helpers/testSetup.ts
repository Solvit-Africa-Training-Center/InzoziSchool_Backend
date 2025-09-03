import { Sequelize } from 'sequelize';
import { redis } from '../../src/utils/redis';
import { Database } from '../../src/database';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

config();

export class TestSetup {
  static async beforeAll(): Promise<void> {
    try {
      // Initialize database connection
      await Database.database.authenticate();
      await Database.database.sync({ force: true });

      // Seed test roles
      await Database.Role.create({
        id: uuidv4(),
        name: 'SCHOOL_MANAGER',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await Database.Role.create({
        id: uuidv4(),
        name: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Test database setup completed');
    } catch (error) {
      console.error('❌ Test database setup failed:', error);
      throw error;
    }
  }

  static async afterAll(): Promise<void> {
    try {
      // Close Redis connection first
      if (redis.isOpen) {
        await redis.quit();
      }

      // Close database connection safely without dropping
      if (Database.database) {
        try {
          await Database.database.close();
        } catch (closeError) {
          console.log('Database already closed or closing');
        }
      }

      console.log('✅ Test cleanup completed');
    } catch (error) {
      console.error('❌ Test cleanup failed:', error);
      // Don't throw in cleanup to avoid masking test failures
    }
  }

  static async beforeEach(): Promise<void> {
    // Clear all test data before each test
    await Database.User.destroy({ where: {} });
    
    // Clear Redis test keys
    const keys = await redis.keys('*test*');
    if (keys.length > 0) {
      await redis.del(keys);
    }

    const resetKeys = await redis.keys('reset:*');
    if (resetKeys.length > 0) {
      await redis.del(resetKeys);
    }

    const jwtKeys = await redis.keys('jwt:*');
    if (jwtKeys.length > 0) {
      await redis.del(jwtKeys);
    }

    const blacklistKeys = await redis.keys('blacklist:*');
    if (blacklistKeys.length > 0) {
      await redis.del(blacklistKeys);
    }
  }

  static createMockResponse(): any {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    return res;
  }

  static createTestUser() {
    return {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'TestPassword123!',
      gender: 'Male',
      province: 'Kigali',
      district: 'Nyarugenge',
      sector: 'Nyamirambo',
      cell: 'Biryogo',
      village: 'Kanyinya',
      phone: '0788123456',
    };
  }

  static createTestUser2() {
    return {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password: 'JanePassword123!',
      gender: 'Female',
      province: 'Northern',
      district: 'Musanze',
      sector: 'Musanze',
      cell: 'Cyuve',
      village: 'Mahoko',
      phone: '0787654321',
    };
  }
}
