#!/usr/bin/env ts-node

/**
 * Authentication Test Runner
 * 
 * This script runs all authentication-related tests for the Inzozi School Backend.
 * It includes tests for:
 * - AuthService (unit tests)
 * - AuthController (unit tests)  
 * - Auth Middleware (unit tests)
 * - Validation Middleware (unit tests)
 * - Validation Schemas (unit tests)
 * - Helper Functions (unit tests)
 * - Route Integration Tests
 * 
 * Usage: npm run test:auth
 */

import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestResult {
  name: string;
  passed: boolean;
  output: string;
  error?: string;
}

class AuthTestRunner {
  private testResults: TestResult[] = [];

  async runSingleTest(testFile: string): Promise<TestResult> {
    const testName = path.basename(testFile, '.test.ts');
    console.log(`🧪 Running ${testName} tests...`);

    try {
      const { stdout, stderr } = await execAsync(
        `npx jest ${testFile} --config Test/jest.config.ts --verbose`,
        { cwd: process.cwd() }
      );

      const passed = !stderr && stdout.includes('PASS');
      
      return {
        name: testName,
        passed,
        output: stdout,
        error: stderr || undefined,
      };
    } catch (error: any) {
      return {
        name: testName,
        passed: false,
        output: error.stdout || '',
        error: error.stderr || error.message,
      };
    }
  }

  async runAllAuthTests(): Promise<void> {
    console.log('🚀 Starting Authentication Test Suite...\n');

    const testFiles = [
      'Test/unit/authHelpers.test.ts',
      'Test/unit/validationMiddleware.test.ts', 
      'Test/unit/validation.test.ts',
      'Test/unit/authMiddleware.test.ts',
      'Test/unit/authController.test.ts',
      'Test/unit/authService.test.ts',
      'Test/integration/authRoutes.test.ts',
    ];

    for (const testFile of testFiles) {
      const result = await this.runSingleTest(testFile);
      this.testResults.push(result);

      if (result.passed) {
        console.log(`✅ ${result.name} - PASSED\n`);
      } else {
        console.log(`❌ ${result.name} - FAILED`);
        console.log(`Error: ${result.error}\n`);
      }
    }

    this.printSummary();
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(50));
    console.log('📊 AUTHENTICATION TEST SUMMARY');
    console.log('='.repeat(50));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

    if (failedTests > 0) {
      console.log('🔍 FAILED TESTS:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`   ❌ ${result.name}`);
          if (result.error) {
            console.log(`      Error: ${result.error.substring(0, 100)}...`);
          }
        });
      console.log();
    }

    // Print overall result
    if (failedTests === 0) {
      console.log('🎉 ALL AUTHENTICATION TESTS PASSED! 🎉');
      console.log('✅ Authentication system is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.');
      process.exit(1);
    }
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  const runner = new AuthTestRunner();
  runner.runAllAuthTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export { AuthTestRunner };
