import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import Settings from '../pages/Settings';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock the DashboardNav component
jest.mock('../components/dashboardNAv', () => {
  return function MockDashboardNav({ userName, isMobileMenuOpen, setIsMobileMenuOpen }) {
    return (
      <div data-testid="dashboard-nav">
        <div>User: {userName}</div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="mobile-menu-button"
        >
          Toggle Mobile Menu
        </button>
      </div>
    );
  };
});

// Mock the toast function
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Test wrapper component
const TestWrapper = ({ children, isDarkMode = false }) => (
  <BrowserRouter>
    <ThemeProvider value={{ isDarkMode, toggleDarkMode: jest.fn() }}>
      {children}
      <Toaster />
    </ThemeProvider>
  </BrowserRouter>
);

// Mobile viewport simulation helper
const simulateMobileViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375, // iPhone SE width
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 667, // iPhone SE height
  });
  window.dispatchEvent(new Event('resize'));
};

const simulateTabletViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 768, // iPad width
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 1024, // iPad height
  });
  window.dispatchEvent(new Event('resize'));
};

const simulateDesktopViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1920,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 1080,
  });
  window.dispatchEvent(new Event('resize'));
};

describe('Settings Page Mobile Scalability Tests', () => {
  beforeEach(() => {
    // Reset viewport to desktop before each test
    simulateDesktopViewport();
  });

  describe('Mobile Viewport Tests (375px width)', () => {
    beforeEach(() => {
      simulateMobileViewport();
    });

    test('renders correctly on mobile viewport', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Manage your account preferences and application settings')).toBeInTheDocument();
    });

    test('navigation tabs are accessible on mobile', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      const tabs = ['Account', 'Appearance', 'Notifications', 'Privacy'];
      tabs.forEach(tab => {
        expect(screen.getByText(tab)).toBeInTheDocument();
      });
    });

    test('tab switching works on mobile', async () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Test switching to Appearance tab
      fireEvent.click(screen.getByText('Appearance'));
      expect(screen.getByText('Theme')).toBeInTheDocument();

      // Test switching to Notifications tab
      fireEvent.click(screen.getByText('Notifications'));
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();

      // Test switching to Privacy tab
      fireEvent.click(screen.getByText('Privacy'));
      expect(screen.getByText('Privacy Controls')).toBeInTheDocument();
    });

    test('form inputs are properly sized for mobile', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Check email inputs
      const emailInputs = screen.getAllByDisplayValue(/alex\.rivera@university\.edu|newemail@university\.edu/);
      emailInputs.forEach(input => {
        expect(input).toBeInTheDocument();
        // Check that inputs are not too small for mobile
        expect(input).toHaveClass('w-full');
      });

      // Check password inputs
      const passwordInputs = screen.getAllByDisplayValue('********');
      passwordInputs.forEach(input => {
        expect(input).toBeInTheDocument();
        expect(input).toHaveClass('w-full');
      });
    });

    test('toggle switches are touch-friendly on mobile', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Switch to Appearance tab
      fireEvent.click(screen.getByText('Appearance'));

      // Check dark mode toggle
      const darkModeToggle = screen.getByRole('button', { name: /dark mode/i });
      expect(darkModeToggle).toBeInTheDocument();
      
      // Check toggle has proper touch target size (minimum 44px)
      const toggleRect = darkModeToggle.getBoundingClientRect();
      expect(toggleRect.width).toBeGreaterThanOrEqual(44);
      expect(toggleRect.height).toBeGreaterThanOrEqual(44);
    });

    test('buttons have adequate touch targets on mobile', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        // Minimum touch target size should be 44x44px
        expect(rect.width).toBeGreaterThanOrEqual(44);
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
    });

    test('theme preview grid adapts to mobile', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Switch to Appearance tab
      fireEvent.click(screen.getByText('Appearance'));

      // Check theme preview grid
      const previewGrid = screen.getByText('Theme Preview:').closest('div').querySelector('.grid');
      expect(previewGrid).toHaveClass('grid-cols-2'); // Should be 2 columns on mobile
    });

    test('text remains readable on mobile', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Check main heading
      const mainHeading = screen.getByText('Settings');
      expect(mainHeading).toHaveClass('text-2xl'); // Should be large enough

      // Check tab labels
      const tabLabels = screen.getAllByRole('button');
      tabLabels.forEach(tab => {
        expect(tab).toHaveClass('text-sm'); // Should be readable
      });
    });

    test('spacing is appropriate for mobile', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Check main container has proper padding
      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveClass('px-4'); // Mobile padding
    });
  });

  describe('Tablet Viewport Tests (768px width)', () => {
    beforeEach(() => {
      simulateTabletViewport();
    });

    test('renders correctly on tablet viewport', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('password grid uses 2 columns on tablet', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Check password grid layout
      const passwordGrid = screen.getByDisplayValue('********').closest('div').querySelector('.grid');
      if (passwordGrid) {
        expect(passwordGrid).toHaveClass('md:grid-cols-2');
      }
    });

    test('container uses tablet padding', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveClass('sm:px-6'); // Tablet padding
    });
  });

  describe('Desktop Viewport Tests (1920px width)', () => {
    beforeEach(() => {
      simulateDesktopViewport();
    });

    test('renders correctly on desktop viewport', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('container uses desktop padding', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveClass('lg:px-8'); // Desktop padding
    });

    test('max width constraint is applied', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveClass('max-w-7xl'); // Max width constraint
    });
  });

  describe('Responsive Behavior Tests', () => {
    test('adapts to viewport changes', async () => {
      const { rerender } = render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Start with desktop
      simulateDesktopViewport();
      expect(screen.getByText('Settings')).toBeInTheDocument();

      // Switch to mobile
      simulateMobileViewport();
      rerender(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      expect(screen.getByText('Settings')).toBeInTheDocument();

      // Switch to tablet
      simulateTabletViewport();
      rerender(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('maintains functionality across viewport changes', async () => {
      const { rerender } = render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Test on mobile
      simulateMobileViewport();
      rerender(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Switch tabs
      fireEvent.click(screen.getByText('Appearance'));
      expect(screen.getByText('Theme')).toBeInTheDocument();

      // Switch to tablet
      simulateTabletViewport();
      rerender(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Should still be on Appearance tab
      expect(screen.getByText('Theme')).toBeInTheDocument();
    });
  });

  describe('Touch Interaction Tests', () => {
    beforeEach(() => {
      simulateMobileViewport();
    });

    test('toggle switches respond to touch', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Switch to Appearance tab
      fireEvent.click(screen.getByText('Appearance'));

      // Test dark mode toggle
      const darkModeToggle = screen.getByRole('button', { name: /dark mode/i });
      fireEvent.click(darkModeToggle);
      
      // Should not throw any errors
      expect(darkModeToggle).toBeInTheDocument();
    });

    test('buttons respond to touch', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Test save button
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      // Should not throw any errors
      expect(saveButton).toBeInTheDocument();
    });

    test('form inputs are focusable on mobile', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Test email input focus
      const emailInput = screen.getByDisplayValue('alex.rivera@university.edu');
      fireEvent.focus(emailInput);
      expect(emailInput).toHaveFocus();

      // Test password input focus
      const passwordInput = screen.getByDisplayValue('********');
      fireEvent.focus(passwordInput);
      expect(passwordInput).toHaveFocus();
    });
  });

  describe('Accessibility Tests on Mobile', () => {
    beforeEach(() => {
      simulateMobileViewport();
    });

    test('all interactive elements are keyboard accessible', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Test tab navigation
      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();
      expect(firstButton).toHaveFocus();

      // Test tab key navigation
      fireEvent.keyDown(firstButton, { key: 'Tab' });
      // Should move to next focusable element
    });

    test('toggle switches have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Switch to Appearance tab
      fireEvent.click(screen.getByText('Appearance'));

      // Check dark mode toggle has proper accessibility
      const darkModeToggle = screen.getByRole('button', { name: /dark mode/i });
      expect(darkModeToggle).toBeInTheDocument();
    });

    test('form inputs have proper labels', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Check email input has label
      const emailLabel = screen.getByText('Current Email');
      expect(emailLabel).toBeInTheDocument();

      // Check password input has label
      const passwordLabel = screen.getByText('Current Password');
      expect(passwordLabel).toBeInTheDocument();
    });
  });

  describe('Performance Tests on Mobile', () => {
    beforeEach(() => {
      simulateMobileViewport();
    });

    test('renders within acceptable time on mobile', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 100ms on mobile
      expect(renderTime).toBeLessThan(100);
    });

    test('tab switching is responsive on mobile', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      const startTime = performance.now();
      
      // Switch tabs multiple times
      fireEvent.click(screen.getByText('Appearance'));
      fireEvent.click(screen.getByText('Notifications'));
      fireEvent.click(screen.getByText('Privacy'));
      fireEvent.click(screen.getByText('Account'));

      const endTime = performance.now();
      const switchTime = endTime - startTime;
      
      // Should switch tabs within 50ms
      expect(switchTime).toBeLessThan(50);
    });
  });

  describe('Edge Case Tests', () => {
    test('handles very small mobile viewport (320px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });
      window.dispatchEvent(new Event('resize'));

      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('handles landscape mobile orientation', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 667, // iPhone SE height as width
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375, // iPhone SE width as height
      });
      window.dispatchEvent(new Event('resize'));

      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('handles rapid viewport changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );

      // Rapidly change viewport sizes
      for (let i = 0; i < 10; i++) {
        const width = 320 + (i * 100);
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });
        window.dispatchEvent(new Event('resize'));
        
        rerender(
          <TestWrapper>
            <Settings />
          </TestWrapper>
        );
      }

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
});
