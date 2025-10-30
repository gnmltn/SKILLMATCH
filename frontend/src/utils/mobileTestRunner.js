/**
 * Mobile Testing Runner for Settings Page
 * 
 * This utility provides automated mobile testing capabilities
 * that can be run directly in the browser console.
 */

class MobileTestRunner {
  constructor() {
    this.results = [];
    this.viewportSizes = {
      mobile: { width: 375, height: 667, name: 'iPhone SE' },
      mobileLarge: { width: 428, height: 926, name: 'iPhone Plus' },
      tablet: { width: 768, height: 1024, name: 'iPad' },
      desktop: { width: 1920, height: 1080, name: 'Desktop' }
    };
  }

  /**
   * Set viewport size for testing
   */
  setViewport(size) {
    const viewport = this.viewportSizes[size];
    if (!viewport) {
      throw new Error(`Unknown viewport size: ${size}`);
    }

    // Update viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: viewport.width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: viewport.height,
    });

    // Dispatch resize event
    window.dispatchEvent(new Event('resize'));

    console.log(`Viewport set to ${viewport.name}: ${viewport.width}x${viewport.height}`);
    return viewport;
  }

  /**
   * Test if element exists and is visible
   */
  testElementExists(selector, description) {
    const element = document.querySelector(selector);
    const exists = element !== null;
    const visible = exists && element.offsetParent !== null;
    
    this.results.push({
      test: description,
      passed: exists && visible,
      details: {
        selector,
        exists,
        visible,
        viewport: window.innerWidth + 'x' + window.innerHeight
      }
    });

    return exists && visible;
  }

  /**
   * Test if element has proper touch target size
   */
  testTouchTarget(element, minSize = 44) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const hasMinSize = rect.width >= minSize && rect.height >= minSize;
    
    this.results.push({
      test: `Touch target size for ${element.tagName}`,
      passed: hasMinSize,
      details: {
        width: rect.width,
        height: rect.height,
        minSize,
        element: element.tagName
      }
    });

    return hasMinSize;
  }

  /**
   * Test responsive classes
   */
  testResponsiveClasses(element, expectedClasses) {
    if (!element) return false;

    const hasClasses = expectedClasses.every(className => 
      element.classList.contains(className)
    );
    
    this.results.push({
      test: `Responsive classes for ${element.tagName}`,
      passed: hasClasses,
      details: {
        expected: expectedClasses,
        actual: Array.from(element.classList),
        element: element.tagName
      }
    });

    return hasClasses;
  }

  /**
   * Test tab navigation functionality
   */
  testTabNavigation() {
    const tabs = document.querySelectorAll('[role="button"]');
    let allTabsWork = true;

    tabs.forEach((tab, index) => {
      try {
        // Test click
        tab.click();
        
        // Test focus
        tab.focus();
        const hasFocus = document.activeElement === tab;
        
        this.results.push({
          test: `Tab ${index + 1} navigation`,
          passed: hasFocus,
          details: {
            tabText: tab.textContent,
            hasFocus,
            index
          }
        });

        if (!hasFocus) allTabsWork = false;
      } catch (error) {
        this.results.push({
          test: `Tab ${index + 1} navigation`,
          passed: false,
          details: {
            error: error.message,
            tabText: tab.textContent
          }
        });
        allTabsWork = false;
      }
    });

    return allTabsWork;
  }

  /**
   * Test form inputs
   */
  testFormInputs() {
    const inputs = document.querySelectorAll('input');
    let allInputsWork = true;

    inputs.forEach((input, index) => {
      try {
        // Test focus
        input.focus();
        const hasFocus = document.activeElement === input;
        
        // Test input type
        const hasType = input.type !== '';
        
        this.results.push({
          test: `Input ${index + 1} functionality`,
          passed: hasFocus && hasType,
          details: {
            type: input.type,
            hasFocus,
            hasType,
            placeholder: input.placeholder
          }
        });

        if (!hasFocus || !hasType) allInputsWork = false;
      } catch (error) {
        this.results.push({
          test: `Input ${index + 1} functionality`,
          passed: false,
          details: {
            error: error.message,
            type: input.type
          }
        });
        allInputsWork = false;
      }
    });

    return allInputsWork;
  }

  /**
   * Test toggle switches
   */
  testToggleSwitches() {
    const toggles = document.querySelectorAll('button[class*="toggle"], button[class*="switch"]');
    let allTogglesWork = true;

    toggles.forEach((toggle, index) => {
      try {
        // Test click
        const initialState = toggle.classList.contains('bg-primary');
        toggle.click();
        
        // Wait for state change
        setTimeout(() => {
          const newState = toggle.classList.contains('bg-primary');
          const stateChanged = initialState !== newState;
          
          this.results.push({
            test: `Toggle ${index + 1} functionality`,
            passed: stateChanged,
            details: {
              initialState,
              newState,
              stateChanged,
              toggleText: toggle.textContent
            }
          });

          if (!stateChanged) allTogglesWork = false;
        }, 100);
      } catch (error) {
        this.results.push({
          test: `Toggle ${index + 1} functionality`,
          passed: false,
          details: {
            error: error.message,
            toggleText: toggle.textContent
          }
        });
        allTogglesWork = false;
      }
    });

    return allTogglesWork;
  }

  /**
   * Test accessibility
   */
  testAccessibility() {
    const results = [];

    // Test for proper labels
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input, index) => {
      const hasLabel = input.getAttribute('aria-label') || 
                      input.getAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${input.id}"]`);
      
      results.push({
        test: `Input ${index + 1} accessibility`,
        passed: !!hasLabel,
        details: {
          hasLabel: !!hasLabel,
          inputId: input.id,
          inputType: input.type
        }
      });
    });

    // Test for proper button labels
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button, index) => {
      const hasText = button.textContent.trim() !== '';
      const hasAriaLabel = button.getAttribute('aria-label');
      
      results.push({
        test: `Button ${index + 1} accessibility`,
        passed: hasText || hasAriaLabel,
        details: {
          hasText,
          hasAriaLabel,
          buttonText: button.textContent.trim()
        }
      });
    });

    this.results.push(...results);
    return results.every(r => r.passed);
  }

  /**
   * Run comprehensive mobile tests
   */
  async runMobileTests() {
    console.log('🚀 Starting Mobile Tests for Settings Page...');
    this.results = [];

    // Test on different viewports
    for (const [size, viewport] of Object.entries(this.viewportSizes)) {
      console.log(`\n📱 Testing on ${viewport.name} (${viewport.width}x${viewport.height})`);
      this.setViewport(size);

      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Test basic elements
      this.testElementExists('h1', 'Settings heading exists');
      this.testElementExists('[role="button"]', 'Tab buttons exist');
      this.testElementExists('input', 'Form inputs exist');

      // Test touch targets
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        this.testTouchTarget(button);
      });

      // Test responsive classes
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        this.testResponsiveClasses(mainContainer, ['px-4']);
      }

      // Test tab navigation
      this.testTabNavigation();

      // Test form inputs
      this.testFormInputs();

      // Test accessibility
      this.testAccessibility();
    }

    // Test toggle switches (only on one viewport to avoid conflicts)
    this.setViewport('mobile');
    await new Promise(resolve => setTimeout(resolve, 100));
    this.testToggleSwitches();

    return this.getResults();
  }

  /**
   * Get test results
   */
  getResults() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const passRate = ((passedTests / totalTests) * 100).toFixed(2);

    return {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: `${passRate}%`
      },
      results: this.results,
      failed: this.results.filter(r => !r.passed)
    };
  }

  /**
   * Print results to console
   */
  printResults() {
    const results = this.getResults();
    
    console.log('\n📊 Mobile Test Results:');
    console.log(`Total Tests: ${results.summary.total}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log(`Pass Rate: ${results.summary.passRate}`);

    if (results.failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      results.failed.forEach((test, index) => {
        console.log(`${index + 1}. ${test.test}`);
        console.log(`   Details:`, test.details);
      });
    } else {
      console.log('\n✅ All tests passed!');
    }

    return results;
  }

  /**
   * Run specific test suite
   */
  async runTestSuite(suiteName) {
    console.log(`🧪 Running ${suiteName} test suite...`);
    this.results = [];

    switch (suiteName) {
      case 'viewport':
        for (const [size, viewport] of Object.entries(this.viewportSizes)) {
          this.setViewport(size);
          await new Promise(resolve => setTimeout(resolve, 100));
          this.testElementExists('h1', `Settings heading on ${viewport.name}`);
        }
        break;

      case 'touch':
        this.setViewport('mobile');
        await new Promise(resolve => setTimeout(resolve, 100));
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => this.testTouchTarget(button));
        break;

      case 'accessibility':
        this.setViewport('mobile');
        await new Promise(resolve => setTimeout(resolve, 100));
        this.testAccessibility();
        break;

      case 'functionality':
        this.setViewport('mobile');
        await new Promise(resolve => setTimeout(resolve, 100));
        this.testTabNavigation();
        this.testFormInputs();
        this.testToggleSwitches();
        break;

      default:
        console.error(`Unknown test suite: ${suiteName}`);
        return;
    }

    return this.printResults();
  }
}

// Export for use in browser console
window.MobileTestRunner = MobileTestRunner;

// Auto-run if in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Mobile Test Runner loaded. Use window.MobileTestRunner to run tests.');
  console.log('Example: const runner = new MobileTestRunner(); runner.runMobileTests().then(r => runner.printResults());');
}

export default MobileTestRunner;
