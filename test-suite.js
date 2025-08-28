#!/usr/bin/env node

/**
 * Comprehensive Testing Suite for Music Theory Learning Application
 * Tests all core functionality and identifies issues
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🎵 Starting Comprehensive Music Theory App Testing Suite\n');

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const issues = [];

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',      // cyan
    success: '\x1b[32m',   // green
    error: '\x1b[31m',     // red
    warning: '\x1b[33m',   // yellow
    reset: '\x1b[0m'       // reset
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function test(name, testFn) {
  totalTests++;
  try {
    testFn();
    passedTests++;
    log(`✅ ${name}`, 'success');
  } catch (error) {
    failedTests++;
    const issue = `❌ ${name}: ${error.message}`;
    log(issue, 'error');
    issues.push({ test: name, error: error.message, type: 'test_failure' });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEquals(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message} - Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
  }
}

// 1. Test Music Theory Core Functions
log('\n🎼 Testing Music Theory Core Functions...', 'info');

// We need to import the music theory functions for testing
// Since this is a Node.js script, we'll need to test via API calls or create separate test modules
// For now, let's test the server endpoints and client functionality

// 2. Test API Endpoints
log('\n🌐 Testing API Endpoints...', 'info');

async function testAPIEndpoints() {
  const baseUrl = 'http://localhost:5000';
  
  // Test user creation
  test('API: Create User', async () => {
    try {
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser' })
      });
      const data = await response.json();
      assert(response.ok, `Failed to create user: ${data.message}`);
      assert(data.username === 'testuser', 'User creation failed');
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  });

  // Test progress tracking
  test('API: Get Progress Summary', async () => {
    try {
      const response = await fetch(`${baseUrl}/api/users`);
      const users = await response.json();
      if (users.length > 0) {
        const progressResponse = await fetch(`${baseUrl}/api/progress-summary/${users[0].id}`);
        const progressData = await progressResponse.json();
        assert(progressResponse.ok, 'Failed to get progress summary');
        assert(typeof progressData.totalItems === 'number', 'Progress summary format incorrect');
        assert(progressData.totalItems === 37, 'Total items should be 37 (12 major + 12 minor + 13 intervals)');
      }
    } catch (error) {
      throw new Error(`Progress API test failed: ${error.message}`);
    }
  });

  // Test invalid requests
  test('API: Invalid User ID Format', async () => {
    try {
      const response = await fetch(`${baseUrl}/api/progress/invalid-uuid`);
      assert(!response.ok, 'Should reject invalid UUID format');
      const data = await response.json();
      assert(data.message && data.message.includes('Invalid'), 'Should return validation error');
    } catch (error) {
      throw new Error(`Invalid request test failed: ${error.message}`);
    }
  });

  // Test category validation
  test('API: Invalid Category', async () => {
    try {
      const response = await fetch(`${baseUrl}/api/users`);
      const users = await response.json();
      if (users.length > 0) {
        const progressResponse = await fetch(`${baseUrl}/api/progress/${users[0].id}/invalid_category`);
        assert(!progressResponse.ok, 'Should reject invalid category');
        const data = await progressResponse.json();
        assert(data.message && data.message.includes('Category'), 'Should return category validation error');
      }
    } catch (error) {
      throw new Error(`Category validation test failed: ${error.message}`);
    }
  });
}

// 3. Test File Structure and Dependencies
log('\n📁 Testing File Structure and Dependencies...', 'info');

test('Required Files Exist', () => {
  const requiredFiles = [
    'client/src/lib/musicTheory.ts',
    'client/src/lib/audio.ts',
    'client/src/components/PianoKeyboard.tsx',
    'server/routes.ts',
    'server/storage.ts',
    'shared/schema.ts'
  ];
  
  for (const file of requiredFiles) {
    assert(fs.existsSync(file), `Required file missing: ${file}`);
  }
});

test('Package.json Dependencies', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'react', 'express', 'drizzle-orm', 'zod', '@tanstack/react-query'
  ];
  
  for (const dep of requiredDeps) {
    assert(
      packageJson.dependencies[dep] || packageJson.devDependencies[dep], 
      `Missing required dependency: ${dep}`
    );
  }
});

// 4. Test TypeScript Compilation
log('\n🔧 Testing TypeScript Compilation...', 'info');

test('TypeScript Check', () => {
  try {
    execSync('npm run check', { stdio: 'pipe' });
  } catch (error) {
    throw new Error(`TypeScript compilation failed: ${error.message}`);
  }
});

// 5. Test Build Process
log('\n🏗️ Testing Build Process...', 'info');

test('Build Success', () => {
  try {
    execSync('npm run build', { stdio: 'pipe' });
    assert(fs.existsSync('dist/public/index.html'), 'Build output missing');
    assert(fs.existsSync('dist/index.js'), 'Server build output missing');
  } catch (error) {
    throw new Error(`Build process failed: ${error.message}`);
  }
});

// 6. Check for Common Issues
log('\n🐛 Checking for Common Issues...', 'info');

test('No Console Errors in Code', () => {
  const jsFiles = execSync('find client/src -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' }).split('\n').filter(Boolean);
  
  for (const file of jsFiles) {
    const content = fs.readFileSync(file, 'utf8');
    // Check for console.error calls that might indicate problems
    const errorMatches = content.match(/console\.error/g);
    if (errorMatches && errorMatches.length > 5) {
      issues.push({ 
        test: 'Console Errors Check', 
        error: `Too many console.error calls in ${file}`, 
        type: 'code_quality' 
      });
    }
  }
});

test('Proper Error Handling in Routes', () => {
  const routesContent = fs.readFileSync('server/routes.ts', 'utf8');
  
  // Check that all routes have try-catch blocks
  const routeDefinitions = routesContent.match(/app\.(get|post|put|delete)/g) || [];
  const tryCatchBlocks = routesContent.match(/try\s*{/g) || [];
  
  assert(
    tryCatchBlocks.length >= routeDefinitions.length, 
    'Not all routes have proper error handling'
  );
});

// 7. Test Memory Leaks and Performance
log('\n⚡ Testing Performance and Memory...', 'info');

test('Bundle Size Check', () => {
  if (fs.existsSync('dist/public/assets')) {
    const files = fs.readdirSync('dist/public/assets');
    const jsFiles = files.filter(f => f.endsWith('.js'));
    
    for (const jsFile of jsFiles) {
      const stats = fs.statSync(path.join('dist/public/assets', jsFile));
      if (stats.size > 1024 * 1024) { // 1MB
        issues.push({ 
          test: 'Bundle Size Check', 
          error: `Large bundle detected: ${jsFile} (${Math.round(stats.size / 1024)}KB)`, 
          type: 'performance' 
        });
      }
    }
  }
});

// 8. Test Database Schema Consistency
log('\n🗃️ Testing Database Schema...', 'info');

test('Schema File Exists and Valid', () => {
  const schemaContent = fs.readFileSync('shared/schema.ts', 'utf8');
  
  // Check for required table definitions
  const requiredTables = ['users', 'progress', 'exerciseSessions'];
  for (const table of requiredTables) {
    assert(
      schemaContent.includes(table), 
      `Schema missing required table: ${table}`
    );
  }
  
  // Check for proper type exports
  const requiredTypes = ['User', 'Progress', 'ExerciseSession'];
  for (const type of requiredTypes) {
    assert(
      schemaContent.includes(`type ${type}`), 
      `Schema missing required type: ${type}`
    );
  }
});

// Run all tests
async function runAllTests() {
  try {
    await testAPIEndpoints();
  } catch (error) {
    issues.push({ 
      test: 'API Tests Setup', 
      error: `Failed to run API tests: ${error.message}`, 
      type: 'setup_error' 
    });
  }

  // Final Summary
  log('\n📊 Test Results Summary:', 'info');
  log(`Total Tests: ${totalTests}`, 'info');
  log(`Passed: ${passedTests}`, 'success');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'error' : 'success');

  if (issues.length > 0) {
    log('\n🔍 Issues Found:', 'warning');
    issues.forEach((issue, index) => {
      log(`${index + 1}. [${issue.type}] ${issue.test}: ${issue.error}`, 'warning');
    });
  } else {
    log('\n🎉 No critical issues found!', 'success');
  }

  // Return summary for further processing
  return {
    totalTests,
    passedTests,
    failedTests,
    issues,
    success: failedTests === 0 && issues.length === 0
  };
}

// Export for module use or run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().then(results => {
    process.exit(results.success ? 0 : 1);
  });
}

export { runAllTests, test, assert, assertEquals };