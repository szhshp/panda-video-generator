import { test, expect } from '@playwright/test';
import { SUNO_AUTH_FILE, SUNO_AUTH_EXISTS, getClipName } from './util';

// Configure auth
if (SUNO_AUTH_EXISTS) {
  test.use({ storageState: SUNO_AUTH_FILE });
} else {
  console.log('Auth: Suno (not found, run login script first)');
}

test.describe.configure({ timeout: 10 * 60 * 1000 });

test('remix uploaded audio', async ({ page }) => {
  const clipName = getClipName();
  console.log(`Searching clip: ${clipName}`);

  await page.goto('https://suno.com/create');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  await page.getByRole('textbox', { name: 'Search clips' }).click();
  await page.getByRole('textbox', { name: 'Search clips' }).fill(clipName);
  await expect(page.getByTestId('clip-row').first()).toBeVisible({ timeout: 60000 });

  await page.getByRole('button', { name: 'Filters' }).click();
  await page.getByRole('button', { name: 'Filter to show only covers' }).click();

  // const targetClip = page.getByTestId('clip-row').filter({ hasText: clipName });
  // await targetClip.getByRole('button', { name: 'More options' }).click();
  // await page.getByRole('button', { name: 'Remix', exact: true }).click();
  // await page.getByRole('button', { name: 'Cover', exact: true }).click();

  // // Fill song description
  // await expect(page.getByText('Song Description', { exact: true })).toBeVisible();
  // const songStyle = (process.env.SONG_STYLE ?? 'D major guitar instrumental').replace(/\\n/g, '\n');
  // const styleTextbox = page.getByText('Song Description', { exact: true })
  //   .locator('xpath=../..')
  //   .locator('textarea');
  // await styleTextbox.click();
  // await styleTextbox.pressSequentially(songStyle);
  // await expect(styleTextbox).toBeVisible();
  // await expect(styleTextbox).not.toBeEmpty();

  // // Fill lyrics if provided
  // const songLyrics = process.env.SONG_LYRICS?.replace(/\\n/g, '\n');
  // if (songLyrics) {
  //   await page.getByRole('button', { name: 'Add your own lyrics' }).click();
  //   const lyricsTextarea = page.getByTestId('lyrics-textarea');
  //   await lyricsTextarea.click();
  //   await lyricsTextarea.fill(songLyrics);
  //   await expect(lyricsTextarea).toBeVisible();
  //   await expect(lyricsTextarea).not.toBeEmpty();
  // }

  // await page.getByRole('button', { name: 'Create song' });
});
