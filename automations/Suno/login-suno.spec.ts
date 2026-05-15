import { test } from '@playwright/test';
import { performLogin, getAuthFilePath } from '../utils/login-helper';

/**
 * Login script for Suno (AI Music Generation)
 * Run this ONCE to login and save your session
 * After login, your session will be saved and reused in other tests
 *
 * Usage: pnpm login:suno
 *
 * Note: This script has NO timeout limit - you can take as long as you need to login.
 * The script will pause and wait for you to complete the login process manually.
 */

// Set timeout to 15 minutes for login tests to ensure enough time
test.describe.configure({ timeout: 15 * 60 * 1000 }); // 15 minutes

test('login to suno - run this once to save login state', async ({ page, context }) => {
  // Set timeout to 15 minutes for this specific test
  test.setTimeout(15 * 60 * 1000);

  // Also set page timeout to ensure all operations have enough time
  page.setDefaultTimeout(10 * 60 * 1000);

  await performLogin(page, context, {
    platform: 'Suno',
    loginUrl: 'https://suno.com',
    loginIndicators: [
      // Suno logged-in indicators
      'text=Create',
      'text=Library',
      'text=Explore',
      'text=Settings',
      '[class*="avatar"]',
      '[class*="Avatar"]',
      '[class*="user"]',
      '[class*="User"]',
      'button:has-text("Create")',
      // User profile/menu area
      '[data-testid*="user"]',
      '[data-testid*="avatar"]',
      // Suno-specific logged-in elements
      'text=Crown',
      'text=Subscription',
    ],
    notLoggedInIndicators: [
      // Indicators that show user is NOT logged in
      'text=Sign in',
      'text=Sign In',
      'text=Log in',
      'text=Log In',
      'button:has-text("Sign in")',
      'button:has-text("Sign In")',
      'button:has-text("Log in")',
      'a:has-text("Sign in")',
      'a:has-text("Log in")',
      'text=Get started',
      'text=Get Started',
      'text=Sign up',
      'text=Sign Up',
    ],
    authFilePath: getAuthFilePath('suno'),
  });
});
