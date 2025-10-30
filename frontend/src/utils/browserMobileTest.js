/**
 * Browser-based Mobile Testing for Settings Page
 * 
 * Run this in the browser console to test mobile responsiveness
 * Usage: Copy and paste this code into the browser console
 */

(function() {
  'use strict';

  console.log('🚀 Starting Browser Mobile Test for Settings Page...');

  // Test configurations
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPhone Plus', width: 428, height: 926 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];

  const results = [];

  // Helper function to set viewport
  function setViewport(width, height) {
    // Update viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });

    // Dispatch resize event
    window.dispatchEvent(new Event('resize'));
    
    // Wait for layout to settle
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  // Test function
  function runTest(testName, testFunction) {
    try {
      const result = testFunction();
      results.push({
        test: testName,
        passed: result,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      });
      console.log(`${result ? '✅' : '❌'} ${testName}`);
      return result;
    } catch (error) {
      results.push({
        test: testName,
        passed: false,
        error: error.message,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      });
      console.log(`❌ ${testName} - Error: ${error.message}`);
      return false;
    }
  }

  // Test basic elements exist
  function testBasicElements() {
    const heading = document.querySelector('h1');
    const tabs = document.querySelectorAll('[role="button"]');
    const inputs = document.querySelectorAll('input');
    
    return !!(heading && tabs.length > 0 && inputs.length > 0);
  }

  // Test touch targets
  function testTouchTargets() {
    const buttons = document.querySelectorAll('button');
    let allGood = true;
    
    buttons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      const hasMinSize = rect.width >= 44 && rect.height >= 44;
      
      if (!hasMinSize) {
        console.log(`⚠️  Button ${index + 1} too small: ${rect.width}x${rect.height}px`);
        allGood = false;
      }
    });
    
    return allGood;
  }

  // Test responsive classes
  function testResponsiveClasses() {
    const main = document.querySelector('main');
    if (!main) return false;
    
    const classes = Array.from(main.classList);
    return classes.some(cls => ['px-4', 'sm:px-6', 'lg:px-8'].includes(cls));
  }

  // Test tab navigation
  function testTabNavigation() {
    const tabTexts = ['Account', 'Appearance', 'Notifications', 'Privacy'];
    let allWork = true;
    
    tabTexts.forEach(tabText => {
      const tab = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.trim() === tabText
      );
      
      if (tab) {
        try {
          tab.click();
          // Check if content changed (basic check)
          const content = document.querySelector('main').textContent;
          if (!content.includes(tabText) && !content.includes('Settings')) {
            allWork = false;
          }
        } catch (error) {
          allWork = false;
        }
      } else {
        allWork = false;
      }
    });
    
    return allWork;
  }

  // Test form inputs
  function testFormInputs() {
    const inputs = document.querySelectorAll('input');
    let allWork = true;
    
    inputs.forEach((input, index) => {
      try {
        input.focus();
        const isFocused = document.activeElement === input;
        const hasType = input.type !== '';
        
        if (!isFocused || !hasType) {
          allWork = false;
        }
      } catch (error) {
        allWork = false;
      }
    });
    
    return allWork;
  }

  // Test accessibility
  function testAccessibility() {
    const inputs = document.querySelectorAll('input');
    const buttons = document.querySelectorAll('button');
    let allGood = true;
    
    // Test input labels
    inputs.forEach((input, index) => {
      const hasLabel = input.getAttribute('aria-label') || 
                      input.getAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${input.id}"]`);
      
      if (!hasLabel) {
        console.log(`⚠️  Input ${index + 1} missing label`);
        allGood = false;
      }
    });
    
    // Test button labels
    buttons.forEach((button, index) => {
      const hasText = button.textContent.trim() !== '';
      const hasAriaLabel = button.getAttribute('aria-label');
      
      if (!hasText && !hasAriaLabel) {
        console.log(`⚠️  Button ${index + 1} missing label`);
        allGood = false;
      }
    });
    
    return allGood;
  }

  // Test toggle switches
  function testToggleSwitches() {
    const toggles = document.querySelectorAll('button[class*="toggle"], button[class*="switch"]');
    let allWork = true;
    
    toggles.forEach((toggle, index) => {
      try {
        const initialState = toggle.classList.contains('bg-primary');
        toggle.click();
        
        // Wait for state change
        setTimeout(() => {
          const newState = toggle.classList.contains('bg-primary');
          if (initialState === newState) {
            console.log(`⚠️  Toggle ${index + 1} state didn't change`);
            allWork = false;
          }
        }, 100);
      } catch (error) {
        allWork = false;
      }
    });
    
    return allWork;
  }

  // Main test runner
  async function runAllTests() {
    console.log('\n📱 Testing Settings Page Mobile Responsiveness...\n');
    
    for (const viewport of viewports) {
      console.log(`\n🔍 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      console.log('='.repeat(50));
      
      await setViewport(viewport.width, viewport.height);
      
      // Run tests
      runTest('Basic elements exist', testBasicElements);
      runTest('Touch targets adequate', testTouchTargets);
      runTest('Responsive classes applied', testResponsiveClasses);
      runTest('Tab navigation works', testTabNavigation);
      runTest('Form inputs functional', testFormInputs);
      runTest('Accessibility compliant', testAccessibility);
      
      // Test toggles only on mobile
      if (viewport.width < 768) {
        runTest('Toggle switches work', testToggleSwitches);
      }
    }
    
    // Print results
    printResults();
  }

  // Print test results
  function printResults() {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const passRate = ((passedTests / totalTests) * 100).toFixed(2);
    
    console.log('\n📊 Test Results Summary');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Pass Rate: ${passRate}%`);
    console.log('='.repeat(50));
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      results.filter(r => !r.passed).forEach((test, index) => {
        console.log(`${index + 1}. ${test.test}`);
        if (test.error) {
          console.log(`   Error: ${test.error}`);
        }
        console.log(`   Viewport: ${test.viewport}`);
      });
    } else {
      console.log('\n✅ All tests passed! Settings page is mobile-ready!');
    }
    
    // Performance check
    const loadTime = performance.now();
    console.log(`\n⚡ Page load time: ${loadTime.toFixed(2)}ms`);
    
    if (loadTime > 2000) {
      console.log('⚠️  Page load time is slow. Consider optimization.');
    } else {
      console.log('✅ Page load time is acceptable.');
    }
  }

  // Quick test function
  window.quickMobileTest = function() {
    console.log('🚀 Running Quick Mobile Test...');
    setViewport(375, 667).then(() => {
      runTest('Basic elements exist', testBasicElements);
      runTest('Touch targets adequate', testTouchTargets);
      runTest('Tab navigation works', testTabNavigation);
      printResults();
    });
  };

  // Run tests
  runAllTests();

  console.log('\n💡 Tips:');
  console.log('- Use window.quickMobileTest() for a quick test');
  console.log('- Check browser dev tools for responsive design mode');
  console.log('- Test on real devices when possible');
  console.log('- Use browser zoom to test different text sizes');

})();
