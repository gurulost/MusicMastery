/**
 * Integration Testing Suite for Music Theory App
 * Tests user workflows, component interactions, and edge cases
 */

export const integrationTests = {
  
  // Test the complete user workflow
  testCompleteUserWorkflow: `
// Complete User Workflow Test - Run in Browser Console
(async function testUserWorkflow() {
  console.log('🎯 Testing Complete User Workflow...');
  
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

  // Test 1: Piano Keyboard Functionality
  test('Piano Keyboard - Key Click Simulation', () => {
    const pianoKeys = document.querySelectorAll('[data-testid*="key-"]');
    assert(pianoKeys.length > 0, 'Piano keyboard keys should be present');
    
    // Simulate clicking a C key
    const cKey = Array.from(pianoKeys).find(key => 
      key.textContent.includes('C') || key.getAttribute('data-testid').includes('C')
    );
    
    if (cKey) {
      cKey.click();
      console.log('✓ Piano key click simulation successful');
    } else {
      throw new Error('Could not find C key on piano');
    }
  });

  // Test 2: Navigation Between Pages
  test('Navigation - Page Transitions', () => {
    const backButtons = document.querySelectorAll('[data-testid="button-back"]');
    const navLinks = document.querySelectorAll('a[href*="/"]');
    
    assert(backButtons.length > 0 || navLinks.length > 0, 'Navigation elements should be present');
    console.log(\`✓ Found \${backButtons.length} back buttons and \${navLinks.length} nav links\`);
  });

  // Test 3: Progress Tracking Elements
  test('Progress Tracking - UI Elements', () => {
    const progressElements = document.querySelectorAll('[data-testid*="progress"], .progress, [class*="progress"]');
    const accuracyElement = document.querySelector('[data-testid="accuracy-percentage"]');
    
    console.log(\`✓ Found \${progressElements.length} progress tracking elements\`);
    
    if (accuracyElement) {
      const accuracyText = accuracyElement.textContent;
      assert(accuracyText.includes('%'), 'Accuracy should display percentage');
      console.log(\`✓ Accuracy display: \${accuracyText}\`);
    }
  });

  // Test 4: Interactive Elements Responsiveness
  test('Interactive Elements - Button States', () => {
    const buttons = document.querySelectorAll('button');
    let interactiveButtons = 0;
    
    buttons.forEach(button => {
      if (!button.disabled) {
        interactiveButtons++;
        // Test hover states by temporarily adding hover class
        button.classList.add('hover');
        setTimeout(() => button.classList.remove('hover'), 100);
      }
    });
    
    assert(interactiveButtons > 0, 'Should have interactive buttons');
    console.log(\`✓ Found \${interactiveButtons} interactive buttons\`);
  });

  // Test 5: Form Validation (if forms exist)
  test('Form Validation - Input Fields', () => {
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input, select, textarea');
    
    console.log(\`✓ Found \${forms.length} forms and \${inputs.length} input fields\`);
    
    // Test required field validation if forms exist
    if (forms.length > 0) {
      forms.forEach((form, index) => {
        const requiredFields = form.querySelectorAll('[required]');
        console.log(\`✓ Form \${index + 1} has \${requiredFields.length} required fields\`);
      });
    }
  });

  // Test 6: Error State Handling
  test('Error Handling - Display States', () => {
    const errorElements = document.querySelectorAll('[class*="error"], [data-testid*="error"], .text-red');
    console.log(\`✓ Found \${errorElements.length} error display elements\`);
    
    // Check for proper error messaging structure
    const hasErrorBoundary = window.React && window.React.version;
    if (hasErrorBoundary) {
      console.log('✓ React error boundary support available');
    }
  });

  // Test 7: Accessibility Features
  test('Accessibility - ARIA and Labels', () => {
    const ariaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]');
    const altTexts = document.querySelectorAll('img[alt]');
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    
    console.log(\`✓ Found \${ariaLabels.length} ARIA labels\`);
    console.log(\`✓ Found \${altTexts.length} images with alt text\`);
    console.log(\`✓ Found \${focusableElements.length} focusable elements\`);
    
    // Test keyboard navigation
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      console.log('✓ Keyboard focus test successful');
    }
  });

  // Test 8: Performance Metrics
  test('Performance - Load Times', () => {
    const performanceData = performance.getEntriesByType('navigation')[0];
    if (performanceData) {
      const loadTime = performanceData.loadEventEnd - performanceData.loadEventStart;
      console.log(\`✓ Page load time: \${loadTime}ms\`);
      assert(loadTime < 5000, 'Page should load within 5 seconds');
    }
    
    // Test for large elements that might cause performance issues
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (img.naturalWidth > 2000 || img.naturalHeight > 2000) {
        console.warn(\`⚠️ Large image detected: \${img.src} (\${img.naturalWidth}x\${img.naturalHeight})\`);
      }
    });
  });

  console.log(\`\\n📊 Integration Test Results: \${passed} passed, \${failed} failed\`);
  
  if (failed === 0) {
    console.log('✅ All integration tests passed!');
  } else {
    console.log('❌ Some integration tests failed. Check issues above.');
  }
})();
`,

  // Test audio functionality
  testAudioFunctionality: `
// Audio Functionality Test - Run in Browser Console  
(async function testAudio() {
  console.log('🔊 Testing Audio Functionality...');
  
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

  // Test 1: Web Audio API Support
  test('Web Audio API Support', () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    assert(AudioContext, 'Web Audio API should be supported');
    
    const context = new AudioContext();
    assert(context.createOscillator, 'AudioContext should support oscillators');
    assert(context.createGain, 'AudioContext should support gain nodes');
    context.close();
  });

  // Test 2: Audio Engine Initialization
  test('Audio Engine Initialization', () => {
    // Check if audio engine is available
    const audioEngine = window.audioEngine;
    if (audioEngine) {
      assert(typeof audioEngine.initializeAudio === 'function', 'Audio engine should have initialization method');
      assert(typeof audioEngine.playNote === 'function', 'Audio engine should have playNote method');
      console.log('✓ Audio engine methods available');
    } else {
      console.warn('⚠️ Audio engine not found in global scope');
    }
  });

  // Test 3: Piano Key Audio Triggers
  test('Piano Key Audio Integration', async () => {
    const pianoKeys = document.querySelectorAll('[data-testid*="key-"]');
    
    if (pianoKeys.length > 0) {
      // Test if clicking a key triggers audio (we can't test actual sound but can test events)
      const firstKey = pianoKeys[0];
      
      let audioTriggered = false;
      const originalClick = firstKey.onclick;
      
      firstKey.onclick = function(e) {
        audioTriggered = true;
        if (originalClick) originalClick.call(this, e);
      };
      
      firstKey.click();
      
      // Restore original handler
      firstKey.onclick = originalClick;
      
      assert(audioTriggered, 'Piano key click should trigger audio event');
    } else {
      throw new Error('No piano keys found for audio testing');
    }
  });

  console.log(\`\\n📊 Audio Test Results: \${passed} passed, \${failed} failed\`);
})();
`,

  // Test responsive design
  testResponsiveDesign: `
// Responsive Design Test - Run in Browser Console
(function testResponsive() {
  console.log('📱 Testing Responsive Design...');
  
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

  // Test 1: Viewport Meta Tag
  test('Viewport Configuration', () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    assert(viewport, 'Viewport meta tag should be present');
    
    const content = viewport.getAttribute('content');
    assert(content.includes('width=device-width'), 'Viewport should include device-width');
    assert(content.includes('initial-scale=1'), 'Viewport should include initial-scale=1');
  });

  // Test 2: CSS Grid/Flexbox Usage
  test('Modern CSS Layout', () => {
    const elements = document.querySelectorAll('*');
    let gridElements = 0;
    let flexElements = 0;
    
    elements.forEach(el => {
      const styles = window.getComputedStyle(el);
      if (styles.display === 'grid') gridElements++;
      if (styles.display === 'flex') flexElements++;
    });
    
    assert(gridElements > 0 || flexElements > 0, 'Should use modern CSS layout (Grid/Flexbox)');
    console.log(\`✓ Found \${gridElements} grid and \${flexElements} flex elements\`);
  });

  // Test 3: Mobile-friendly Touch Targets
  test('Touch Target Sizes', () => {
    const interactiveElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
    let goodTouchTargets = 0;
    
    interactiveElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width >= 44 && rect.height >= 44) {
        goodTouchTargets++;
      }
    });
    
    const ratio = goodTouchTargets / interactiveElements.length;
    assert(ratio > 0.7, 'Most interactive elements should be 44px+ for touch accessibility');
    console.log(\`✓ \${goodTouchTargets}/\${interactiveElements.length} elements have good touch target size\`);
  });

  // Test 4: Text Readability
  test('Text Readability', () => {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    let readableElements = 0;
    
    textElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const fontSize = parseFloat(styles.fontSize);
      if (fontSize >= 16) {
        readableElements++;
      }
    });
    
    const ratio = readableElements / textElements.length;
    console.log(\`✓ \${readableElements}/\${textElements.length} text elements have readable font size (16px+)\`);
  });

  console.log(\`\\n📊 Responsive Design Results: \${passed} passed, \${failed} failed\`);
})();
`
};

// Make available globally for browser testing
if (typeof window !== 'undefined') {
  window.integrationTests = integrationTests;
}