import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import { SUNO_AUTH_FILE, SUNO_AUTH_EXISTS, getAudioPath, getClipName } from './util';

// Configure auth
if (SUNO_AUTH_EXISTS) {
  test.use({ storageState: SUNO_AUTH_FILE });
} else {
  console.log('Auth: Suno (not found, run login script first)');
}

test.describe.configure({ timeout: 10 * 60 * 1000 });

test('upload audio to suno', async ({ page }) => {
  const audioPath = getAudioPath();
  if (!existsSync(audioPath)) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }
  console.log(`Audio file: ${audioPath}`);

  // Navigate to Suno create page
  await page.goto('https://suno.com/create');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  await expect(page.getByText('My Workspace').nth(2)).toBeVisible();
  await page.getByRole('button', { name: 'Add audio - Browse, upload,' }).click();

  // Upload audio file
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 10000 }),
    page.getByRole('button', { name: 'Upload', exact: true }).click(),
  ]);
  await fileChooser.setFiles(audioPath);
  console.log('✅ Audio file selected');

  // Wait for upload processing and check for Terms dialog
  await page.waitForTimeout(5000);

  const agreeBtn = page.getByRole('button', { name: 'Agree to Terms' });
  if (await agreeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await agreeBtn.click();
    console.log('✅ Agreed to Terms');
  }

  // Check for copyright match before proceeding
  if (await page.getByText('Uploaded audio matches existing work of art.').isVisible({ timeout: 5000 }).catch(() => false)) {
    throw new Error('Copyright match detected: Audio matches existing work of art.');
  }

  // Wait for upload to finish
  console.log('⏳ Waiting for upload to complete...');
  await page.waitForTimeout(5000);

  await expect(page.getByText('Uploaded')).toBeVisible({ timeout: 120000 });
  await page.getByRole('button', { name: 'Full Song' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Describe Your Audio')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('button', { name: 'Uploading Clip' })).not.toBeVisible();

  const clipName = getClipName();

  await page.getByRole('textbox', { name: 'Search clips' }).click();
  await page.getByRole('textbox', { name: 'Search clips' }).fill(clipName);
  await expect(page.getByTestId('clip-row').first()).toBeVisible({ timeout: 60000 });

  const targetClip = page.getByTestId('clip-row').filter({ hasText: clipName });
  await targetClip.getByRole('button', { name: 'More options' }).click();
  await page.getByRole('button', { name: 'Remix', exact: true }).click();
  await page.getByRole('button', { name: 'Cover', exact: true }).click();

});
