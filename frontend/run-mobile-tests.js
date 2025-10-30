#!/usr/bin/env node

/**
 * Mobile Testing Script for Settings Page
 * 
 * This script runs comprehensive mobile tests for the Settings page
 * and provides detailed reporting.
 */

const puppeteer = require('puppeteer');
const path = require('path');

class MobileTestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
    this.viewportSizes = {
      mobile: { width: 375, height: 667, name: 'iPhone SE' },
      mobileLarge: { width: 428, height: 926, name: 'iPhone Plus' },
      tablet: { width: 768, height: 1024, name: 'iPad' },
      desktop: { width: 1920, height: 1080, name: 'Desktop' }
    };
  }

  async init() {
    console.log('🚀 Initializing Mobile Test Runner...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Error:', msg.text());
      }
    });

    console.log('✅ Browser initialized');
  }

  async navigateToSettings() {
    console.log('📱 Navigating to Settings page...');
    
    // Navigate to localhost (adjust port as needed)
    await this.page.goto('http://localhost:3000/settings', {
      waitUntil: 'networkidle0'
    });

    // Wait for the page to load
    await this.page.waitForSelector('h1', { timeout: 10000 });
    
    console.log('✅ Settings page loaded');
  }

  async testViewport(size) {
    const viewport = this.viewportSizes[size];
    console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

    await this.page.setViewport({
      width: viewport.width,
      height: viewport.height
    });

    // Wait for layout to settle
    await this.page.waitForTimeout(100);

    const results = [];

    // Test basic elements
    const heading = await this.page.$('h1');
    results.push({
      test: 'Settings heading exists',
      passed: !!heading,
      viewport: viewport.name
    });

    // Test tab buttons
    const tabButtons = await this.page.$$('[role="button"]');
    results.push({
      test: 'Tab buttons exist',
      passed: tabButtons.length > 0,
      count: tabButtons.length,
      viewport: viewport.name
    });

    // Test form inputs
    const inputs = await this.page.$$('input');
    results.push({
      test: 'Form inputs exist',
      passed: inputs.length > 0,
      count: inputs.length,
      viewport: viewport.name
    });

    // Test touch targets
    const buttons = await this.page.$$('button');
    let touchTargetResults = [];
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const box = await button.boundingBox();
      
      if (box) {
        const hasMinSize = box.width >= 44 && box.height >= 44;
        touchTargetResults.push({
          test: `Button ${i + 1} touch target`,
          passed: hasMinSize,
          width: box.width,
          height: box.height,
          viewport: viewport.name
        });
      }
    }

    results.push(...touchTargetResults);

    // Test responsive classes
    const mainContainer = await this.page.$('main');
    if (mainContainer) {
      const classes = await mainContainer.evaluate(el => Array.from(el.classList));
      const hasResponsiveClasses = classes.some(cls => 
        ['px-4', 'sm:px-6', 'lg:px-8'].includes(cls)
      );
      
      results.push({
        test: 'Responsive classes applied',
        passed: hasResponsiveClasses,
        classes: classes,
        viewport: viewport.name
      });
    }

    this.results.push(...results);
    return results;
  }

  async testTabNavigation() {
    console.log('\n🧪 Testing tab navigation...');
    
    const results = [];
    const tabTexts = ['Account', 'Appearance', 'Notifications', 'Privacy'];

    for (const tabText of tabTexts) {
      try {
        // Click the tab
        await this.page.click(`button:has-text("${tabText}")`);
        await this.page.waitForTimeout(100);

        // Check if content changed
        const content = await this.page.$eval('main', el => el.textContent);
        const hasContent = content.includes(tabText) || content.includes('Settings');

        results.push({
          test: `Tab "${tabText}" navigation`,
          passed: hasContent,
          viewport: 'Current'
        });
      } catch (error) {
        results.push({
          test: `Tab "${tabText}" navigation`,
          passed: false,
          error: error.message,
          viewport: 'Current'
        });
      }
    }

    this.results.push(...results);
    return results;
  }

  async testFormInputs() {
    console.log('\n📝 Testing form inputs...');
    
    const results = [];
    const inputs = await this.page.$$('input');

    for (let i = 0; i < inputs.length; i++) {
      try {
        const input = inputs[i];
        
        // Test focus
        await input.focus();
        const isFocused = await input.evaluate(el => el === document.activeElement);
        
        // Test input type
        const inputType = await input.evaluate(el => el.type);
        
        results.push({
          test: `Input ${i + 1} functionality`,
          passed: isFocused && inputType !== '',
          isFocused,
          inputType,
          viewport: 'Current'
        });
      } catch (error) {
        results.push({
          test: `Input ${i + 1} functionality`,
          passed: false,
          error: error.message,
          viewport: 'Current'
        });
      }
    }

    this.results.push(...results);
    return results;
  }

  async testToggleSwitches() {
    console.log('\n🔄 Testing toggle switches...');
    
    const results = [];
    const toggles = await this.page.$$('button[class*="toggle"], button[class*="switch"]');

    for (let i = 0; i < toggles.length; i++) {
      try {
        const toggle = toggles[i];
        
        // Get initial state
        const initialState = await toggle.evaluate(el => 
          el.classList.contains('bg-primary')
        );
        
        // Click toggle
        await toggle.click();
        await this.page.waitForTimeout(100);
        
        // Get new state
        const newState = await toggle.evaluate(el => 
          el.classList.contains('bg-primary')
        );
        
        const stateChanged = initialState !== newState;
        
        results.push({
          test: `Toggle ${i + 1} functionality`,
          passed: stateChanged,
          initialState,
          newState,
          viewport: 'Current'
        });
      } catch (error) {
        results.push({
          test: `Toggle ${i + 1} functionality`,
          passed: false,
          error: error.message,
          viewport: 'Current'
        });
      }
    }

    this.results.push(...results);
    return results;
  }

  async testAccessibility() {
    console.log('\n♿ Testing accessibility...');
    
    const results = [];

    // Test input labels
    const inputs = await this.page.$$('input');
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      
      const hasLabel = await input.evaluate(el => {
        return el.getAttribute('aria-label') || 
               el.getAttribute('aria-labelledby') ||
               document.querySelector(`label[for="${el.id}"]`);
      });
      
      results.push({
        test: `Input ${i + 1} accessibility`,
        passed: !!hasLabel,
        hasLabel: !!hasLabel,
        viewport: 'Current'
      });
    }

    // Test button labels
    const buttons = await this.page.$$('button');
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      const buttonText = await button.evaluate(el => el.textContent.trim());
      const hasAriaLabel = await button.evaluate(el => el.getAttribute('aria-label'));
      
      results.push({
        test: `Button ${i + 1} accessibility`,
        passed: buttonText !== '' || !!hasAriaLabel,
        hasText: buttonText !== '',
        hasAriaLabel: !!hasAriaLabel,
        viewport: 'Current'
      });
    }

    this.results.push(...results);
    return results;
  }

  async runAllTests() {
    try {
      await this.init();
      await this.navigateToSettings();

      // Test all viewports
      for (const size of Object.keys(this.viewportSizes)) {
        await this.testViewport(size);
      }

      // Test functionality on mobile viewport
      await this.page.setViewport({
        width: 375,
        height: 667
      });

      await this.testTabNavigation();
      await this.testFormInputs();
      await this.testToggleSwitches();
      await this.testAccessibility();

      return this.getResults();
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

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

  printResults() {
    const results = this.getResults();
    
    console.log('\n📊 Mobile Test Results:');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${results.summary.total}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log(`Pass Rate: ${results.summary.passRate}`);
    console.log('='.repeat(50));

    if (results.failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      results.failed.forEach((test, index) => {
        console.log(`${index + 1}. ${test.test}`);
        if (test.error) {
          console.log(`   Error: ${test.error}`);
        }
        if (test.details) {
          console.log(`   Details:`, test.details);
        }
        console.log(`   Viewport: ${test.viewport}`);
        console.log('');
      });
    } else {
      console.log('\n✅ All tests passed!');
    }

    return results;
  }
}

// Run tests if called directly
if (require.main === module) {
  const runner = new MobileTestRunner();
  
  runner.runAllTests()
    .then(results => {
      runner.printResults();
      process.exit(results.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = MobileTestRunner;
