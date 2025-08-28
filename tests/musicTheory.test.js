/**
 * Music Theory Functions Test Suite
 * Tests core music theory logic including enharmonic note handling
 */

export function testMusicTheoryFunctions() {
  const results = [];
  
  function test(name, testFn) {
    try {
      testFn();
      results.push({ name, status: 'PASS' });
      console.log(`✅ ${name}`);
    } catch (error) {
      results.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ ${name}: ${error.message}`);
    }
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  // Since we can't directly import ES modules in this context,
  // we'll create a test structure that can be run in the browser console
  const testDefinitions = {
    
    // Test 1: Note Normalization
    'Note Normalization - Basic': () => {
      // This would test: normalizeNote('Bb') === 'A#'
      console.log('Testing note normalization with flats to sharps conversion');
    },

    // Test 2: Enharmonic Equivalence  
    'Enharmonic Equivalence': () => {
      // This would test: areNotesEnharmonicallyEqual('Bb', 'A#') === true
      console.log('Testing enharmonic note equivalence');
    },

    // Test 3: Scale Construction
    'Major Scale Construction': () => {
      // This would test: getMajorScale('C').notes === ['C', 'D', 'E', 'F', 'G', 'A', 'B']
      console.log('Testing major scale construction');
    },

    // Test 4: Interval Building
    'Interval Building': () => {
      // This would test: buildInterval('C', 'Perfect 5th', 'up') === 'G'
      console.log('Testing interval building functions');
    },

    // Test 5: Invalid Input Handling
    'Invalid Note Handling': () => {
      // This should test what happens when interval names are passed to note functions
      console.log('Testing error handling for invalid notes');
    }
  };

  // Define the actual tests to run in browser
  return {
    testDefinitions,
    runInBrowser: `
// Music Theory Test Suite - Run in Browser Console
(function() {
  console.log('🎼 Testing Music Theory Functions...');
  
  // Import the music theory functions
  const { 
    normalizeNote, 
    areNotesEnharmonicallyEqual, 
    getMajorScale, 
    getMinorScale,
    buildInterval,
    INTERVAL_DEFINITIONS 
  } = window.musicTheory || {};
  
  if (!normalizeNote) {
    console.error('❌ Music theory functions not available. Make sure to run this on the app page.');
    return;
  }

  let passed = 0;
  let failed = 0;
  
  function test(name, testFn) {
    try {
      testFn();
      console.log(\`✅ \${name}\`);
      passed++;
    } catch (error) {
      console.log(\`❌ \${name}: \${error.message}\`);
      failed++;
    }
  }
  
  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  // Test 1: Note Normalization
  test('Note Normalization - Flats to Sharps', () => {
    assert(normalizeNote('Bb') === 'A#', 'Bb should normalize to A#');
    assert(normalizeNote('Db') === 'C#', 'Db should normalize to C#');
    assert(normalizeNote('Eb') === 'D#', 'Eb should normalize to D#');
    assert(normalizeNote('C') === 'C', 'Natural notes should remain unchanged');
  });

  // Test 2: Invalid Note Input (this might be causing the "Perfect" error)
  test('Invalid Note Input Handling', () => {
    const invalidInputs = ['Perfect', 'Perfect 5th', 'Major', 'Minor', 'Perfect Unison'];
    
    invalidInputs.forEach(input => {
      console.log(\`Testing invalid input: \${input}\`);
      const result = normalizeNote(input);
      // Should return 'C' as fallback, not crash
      assert(result === 'C', \`Invalid input \${input} should fallback to C, got \${result}\`);
    });
  });

  // Test 3: Enharmonic Equivalence
  test('Enharmonic Equivalence', () => {
    assert(areNotesEnharmonicallyEqual('Bb', 'A#'), 'Bb and A# should be enharmonically equal');
    assert(areNotesEnharmonicallyEqual('C#', 'Db'), 'C# and Db should be enharmonically equal');
    assert(!areNotesEnharmonicallyEqual('C', 'D'), 'C and D should not be enharmonically equal');
  });

  // Test 4: Scale Construction
  test('Major Scale Construction', () => {
    const cMajor = getMajorScale('C');
    const expectedNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    assert(JSON.stringify(cMajor.notes) === JSON.stringify(expectedNotes), 
           \`C Major scale incorrect. Expected: \${expectedNotes}, Got: \${cMajor.notes}\`);
           
    const gMajor = getMajorScale('G');
    assert(gMajor.notes.includes('F#'), 'G Major should contain F#');
    assert(gMajor.sharps.includes('F#'), 'G Major key signature should include F#');
  });

  // Test 5: Minor Scale Construction  
  test('Minor Scale Construction', () => {
    const aMinor = getMinorScale('A');
    const expectedNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    assert(JSON.stringify(aMinor.notes) === JSON.stringify(expectedNotes),
           \`A Minor scale incorrect. Expected: \${expectedNotes}, Got: \${aMinor.notes}\`);
  });

  // Test 6: Interval Building
  test('Interval Building', () => {
    assert(buildInterval('C', 'Perfect 5th', 'up') === 'G', 'Perfect 5th from C should be G');
    assert(buildInterval('C', 'Major 3rd', 'up') === 'E', 'Major 3rd from C should be E');
    assert(buildInterval('C', 'Perfect Octave', 'up') === 'C', 'Perfect Octave from C should be C');
  });

  // Test 7: Edge Cases
  test('Edge Cases and Error Handling', () => {
    // Test with null/undefined
    try {
      normalizeNote(null);
      normalizeNote(undefined);
      console.log('✓ Handles null/undefined inputs without crashing');
    } catch (error) {
      throw new Error(\`Should handle null/undefined gracefully: \${error.message}\`);
    }
  });

  console.log(\`\\n📊 Test Results: \${passed} passed, \${failed} failed\`);
  
  if (failed > 0) {
    console.log('❌ Some tests failed. Please check the issues above.');
  } else {
    console.log('✅ All music theory tests passed!');
  }
})();
`
  };
}

if (typeof window !== 'undefined') {
  window.testMusicTheory = testMusicTheoryFunctions;
}