import { hashPassword, comparePassword, generateToken, verifyToken, destroyToken } from '../../src/utils/helper';
import { redis } from '../../src/utils/redis';
import { TestSetup } from '../helpers/testSetup';
import jwt from 'jsonwebtoken';

describe('Authentication Helper Functions', () => {
  beforeAll(async () => {
    await TestSetup.beforeAll();
  });

  afterAll(async () => {
    await TestSetup.afterAll();
  });

  beforeEach(async () => {
    await TestSetup.beforeEach();
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword.length).toBeGreaterThan(20); // bcrypt hashes are usually 60 chars
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Salt should make them different
    });

    it('should handle empty password', async () => {
      const password = '';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await hashPassword(password);

      const isMatch = await comparePassword(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await hashPassword(password);

      const isMatch = await comparePassword(wrongPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });

    it('should return false for empty password against hash', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await hashPassword(password);

      const isMatch = await comparePassword('', hashedPassword);
      expect(isMatch).toBe(false);
    });

    it('should handle case sensitivity', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await hashPassword(password);

      const isMatch = await comparePassword('testpassword123!', hashedPassword);
      expect(isMatch).toBe(false);
    });
  });

  describe('generateToken', () => {
    const mockUserData = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'SCHOOL_MANAGER',
    };

    it('should generate a valid JWT token', async () => {
      const token = await generateToken(mockUserData);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts

      // Verify token can be decoded
      const decoded = jwt.decode(token) as any;
      expect(decoded.id).toBe(mockUserData.id);
      expect(decoded.email).toBe(mockUserData.email);
      expect(decoded.role).toBe(mockUserData.role);
      expect(decoded.jti).toBeDefined();
    });

    it('should store token data in Redis', async () => {
      const token = await generateToken(mockUserData);
      const decoded = jwt.decode(token) as any;
      
      const storedData = await redis.get(`jwt:${decoded.jti}`);
      expect(storedData).toBeTruthy();
      
      const parsedData = JSON.parse(storedData!);
      expect(parsedData.id).toBe(mockUserData.id);
      expect(parsedData.email).toBe(mockUserData.email);
      expect(parsedData.role).toBe(mockUserData.role);
    });

    it('should set token expiration in Redis', async () => {
      const token = await generateToken(mockUserData);
      const decoded = jwt.decode(token) as any;
      
      const ttl = await redis.ttl(`jwt:${decoded.jti}`);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(12 * 60 * 60); // 12 hours or less
    });

    it('should generate unique tokens for same user data', async () => {
      const token1 = await generateToken(mockUserData);
      const token2 = await generateToken(mockUserData);

      expect(token1).not.toBe(token2);

      const decoded1 = jwt.decode(token1) as any;
      const decoded2 = jwt.decode(token2) as any;
      expect(decoded1.jti).not.toBe(decoded2.jti);
    });
  });

  describe('verifyToken', () => {
    let validToken: string;
    let jti: string;

    beforeEach(async () => {
      const mockUserData = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'SCHOOL_MANAGER',
      };
      
      validToken = await generateToken(mockUserData);
      const decoded = jwt.decode(validToken) as any;
      jti = decoded.jti;
    });

    it('should verify valid token successfully', async () => {
      const decoded = await verifyToken(validToken);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('SCHOOL_MANAGER');
      expect(decoded.jti).toBe(jti);
    });

    it('should reject invalid token', async () => {
      await expect(verifyToken('invalid-token')).rejects.toThrow();
    });

    it('should reject token not found in Redis', async () => {
      // Remove token from Redis
      await redis.del(`jwt:${jti}`);

      await expect(verifyToken(validToken)).rejects.toThrow('Token not found in Redis');
    });

    it('should reject blacklisted token', async () => {
      // Blacklist the token
      await redis.setEx(`blacklist:${validToken}`, 24 * 60 * 60, 'true');

      await expect(verifyToken(validToken)).rejects.toThrow('Token has been blacklisted');
    });

    it('should reject expired token', async () => {
      const expiredPayload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'SCHOOL_MANAGER',
        jti: 'expired-jti',
        exp: Math.floor(Date.now() / 1000) - 1, // Expired 1 second ago
      };

      const expiredToken = jwt.sign(expiredPayload, process.env.JWT_SECRET || 'SecretKey');
      
      // Store in Redis so it's not rejected for missing data
      await redis.setEx(`jwt:expired-jti`, 60, JSON.stringify(expiredPayload));

      await expect(verifyToken(expiredToken)).rejects.toThrow();
    });
  });

  describe('destroyToken', () => {
    it('should blacklist token successfully', async () => {
      const token = 'test-token-123';

      await destroyToken(token);

      const blacklisted = await redis.get(`blacklist:${token}`);
      expect(blacklisted).toBe('true');

      // Verify TTL is set
      const ttl = await redis.ttl(`blacklist:${token}`);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(24 * 60 * 60); // 24 hours or less
    });

    it('should handle undefined token', async () => {
      await expect(destroyToken(undefined)).resolves.not.toThrow();
      
      const blacklisted = await redis.get('blacklist:undefined');
      expect(blacklisted).toBe('true');
    });

    it('should handle empty token', async () => {
      const token = '';
      await destroyToken(token);

      const blacklisted = await redis.get('blacklist:');
      expect(blacklisted).toBe('true');
    });
  });

  describe('Token Integration Flow', () => {
    it('should complete full token lifecycle', async () => {
      const mockUserData = {
        id: 'user-456',
        email: 'integration@example.com',
        role: 'ADMIN',
      };

      // 1. Generate token
      const token = await generateToken(mockUserData);
      expect(token).toBeDefined();

      // 2. Verify token
      const decoded = await verifyToken(token);
      expect(decoded.id).toBe(mockUserData.id);
      expect(decoded.email).toBe(mockUserData.email);

      // 3. Destroy token
      await destroyToken(token);

      // 4. Verify token is blacklisted
      await expect(verifyToken(token)).rejects.toThrow('Token has been blacklisted');
    });

    it('should handle concurrent token operations', async () => {
      const mockUserData = {
        id: 'user-789',
        email: 'concurrent@example.com',
        role: 'TEACHER',
      };

      // Generate multiple tokens concurrently
      const tokenPromises = Array.from({ length: 5 }, () => generateToken(mockUserData));
      const tokens = await Promise.all(tokenPromises);

      // All tokens should be unique
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(5);

      // All tokens should be verifiable
      const verifyPromises = tokens.map(token => verifyToken(token));
      const decodedTokens = await Promise.all(verifyPromises);

      decodedTokens.forEach(decoded => {
        expect(decoded.id).toBe(mockUserData.id);
        expect(decoded.email).toBe(mockUserData.email);
      });

      // Destroy all tokens concurrently
      const destroyPromises = tokens.map(token => destroyToken(token));
      await Promise.all(destroyPromises);

      // All tokens should be blacklisted
      const verifyAfterDestroyPromises = tokens.map(token => 
        verifyToken(token).catch(err => err.message)
      );
      const results = await Promise.all(verifyAfterDestroyPromises);

      results.forEach(result => {
        expect(result).toContain('blacklisted');
      });
    });
  });
});
