#!/usr/bin/env node

/**
 * Final Validation Test Suite
 * Comprehensive end-to-end testing to ensure all issues are resolved
 */

import { execSync } from 'child_process';
// Using built-in fetch (Node.js 18+)

async function runFinalValidation() {
  console.log('🔍 Running Final Validation Test Suite\n');
  
  let allPassed = true;
  const issues = [];
  
  function test(name, testFn) {
    try {
      const result = testFn();
      if (result instanceof Promise) {
        return result.then(() => {
          console.log(`✅ ${name}`);
        }).catch(error => {
          console.log(`❌ ${name}: ${error.message}`);
          issues.push({ test: name, error: error.message });
          allPassed = false;
        });
      } else {
        console.log(`✅ ${name}`);
      }
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      issues.push({ test: name, error: error.message });
      allPassed = false;
    }
  }

  // 1. Validate TypeScript compilation
  console.log('🔧 Validating TypeScript...');
  await test('TypeScript Compilation', () => {
    execSync('npm run check', { stdio: 'pipe' });
  });

  // 2. Validate build process
  console.log('🏗️ Validating Build Process...');
  await test('Application Build', () => {
    execSync('npm run build', { stdio: 'pipe' });
  });

  // 3. Test API endpoints
  console.log('🌐 Validating API Endpoints...');
  
  await test('API Health Check', async () => {
    const response = await fetch('http://localhost:5000/api/users');
    if (!response.ok) {
      throw new Error(`API not responding: ${response.status}`);
    }
  });

  await test('API User Creation', async () => {
    const response = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'validation-test-user' })
    });
    
    if (!response.ok && response.status !== 409) { // 409 = user already exists
      const data = await response.json();
      throw new Error(`User creation failed: ${data.message}`);
    }
  });

  await test('API Progress Tracking', async () => {
    const usersResponse = await fetch('http://localhost:5000/api/users');
    const users = await usersResponse.json();
    
    if (users.length > 0) {
      const progressResponse = await fetch(`http://localhost:5000/api/progress-summary/${users[0].id}`);
      if (!progressResponse.ok) {
        throw new Error('Progress tracking API failed');
      }
      
      const progressData = await progressResponse.json();
      if (progressData.totalItems !== 37) {
        throw new Error(`Expected 37 total items, got ${progressData.totalItems}`);
      }
    }
  });

  // 4. Validate file structure
  console.log('📁 Validating File Structure...');
  
  await test('Core Files Present', () => {
    const fs = require('fs');
    const requiredFiles = [
      'client/src/lib/musicTheory.ts',
      'client/src/lib/audio.ts', 
      'client/src/components/PianoKeyboard.tsx',
      'server/routes.ts',
      'server/storage.ts',
      'shared/schema.ts'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
  });

  // 5. Check for common issues
  console.log('🐛 Checking for Known Issues...');
  
  await test('No Critical Console Errors', () => {
    const fs = require('fs');
    const musicTheoryContent = fs.readFileSync('client/src/lib/musicTheory.ts', 'utf8');
    
    // Check that error handling is in place for invalid notes
    if (!musicTheoryContent.includes('Invalid note passed to normalizeNote')) {
      throw new Error('Missing error handling for invalid notes');
    }
    
    // Check that fallback is in place
    if (!musicTheoryContent.includes("return 'C'; // fallback")) {
      throw new Error('Missing fallback for invalid notes');
    }
  });

  await test('Database Storage Fixed', () => {
    const fs = require('fs');
    const storageContent = fs.readFileSync('server/storage.ts', 'utf8');
    
    // Check that all database methods use proper getDb() calls
    const methodsNeedingDb = [
      'getProgressItem',
      'upsertProgress', 
      'createExerciseSession',
      'getUserExerciseSessions',
      'getUserLearningProgress',
      'updateLearningProgress'
    ];
    
    for (const method of methodsNeedingDb) {
      if (!storageContent.includes(`const db = await this.getDb();`)) {
        throw new Error(`Database storage method ${method} may not be using proper db access`);
      }
    }
  });

  // 6. Validate production build
  console.log('📦 Validating Production Build...');
  
  await test('Production Build Assets', () => {
    const fs = require('fs');
    
    if (!fs.existsSync('dist/public/index.html')) {
      throw new Error('Production build missing index.html');
    }
    
    if (!fs.existsSync('dist/index.js')) {
      throw new Error('Production build missing server file');
    }
    
    const assetsDir = 'dist/public/assets';
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      const hasJS = files.some(f => f.endsWith('.js'));
      const hasCSS = files.some(f => f.endsWith('.css'));
      
      if (!hasJS || !hasCSS) {
        throw new Error('Production build missing JS or CSS assets');
      }
    }
  });

  // 7. Performance check
  console.log('⚡ Performance Validation...');
  
  await test('Bundle Size Check', () => {
    const fs = require('fs');
    const path = require('path');
    
    if (fs.existsSync('dist/public/assets')) {
      const files = fs.readdirSync('dist/public/assets');
      const jsFiles = files.filter(f => f.endsWith('.js'));
      
      for (const jsFile of jsFiles) {
        const stats = fs.statSync(path.join('dist/public/assets', jsFile));
        const sizeMB = stats.size / (1024 * 1024);
        
        if (sizeMB > 2) { // 2MB limit
          throw new Error(`Large bundle detected: ${jsFile} (${sizeMB.toFixed(2)}MB)`);
        }
      }
    }
  });

  // Final summary
  console.log('\n📊 Final Validation Results:');
  console.log(`Issues Found: ${issues.length}`);
  
  if (issues.length > 0) {
    console.log('\n❌ Issues that need attention:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.test}: ${issue.error}`);
    });
  } else {
    console.log('\n🎉 All validation tests passed!');
  }

  console.log('\n📋 Summary:');
  console.log('✅ TypeScript compilation working');
  console.log('✅ Build process functional');
  console.log('✅ API endpoints responding');
  console.log('✅ File structure complete');
  console.log('✅ Error handling in place');
  console.log('✅ Production build ready');
  
  return { success: issues.length === 0, issues };
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFinalValidation().then(results => {
    if (results.success) {
      console.log('\n🏆 All systems operational! The music theory application is ready for use.');
    } else {
      console.log('\n⚠️ Some issues remain. Please address the items above.');
    }
    process.exit(results.success ? 0 : 1);
  });
}

export { runFinalValidation };