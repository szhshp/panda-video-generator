import { test } from '@playwright/test';
import path from 'path';
import { existsSync } from 'fs';
import { getAuthFilePath } from '../utils/login-helper';
import { UPLOAD_PATHS } from '../../types/paths';

/**
 * Auto upload video to Bilibili
 * Uses Playwright's default setup with saved login state
 * Automatically reads video and title from configured paths (see types/paths.ts)
 * 
 * Usage: 
 *   pnpm upload:bilibili
 * 
 * Or override with environment variables:
 *   VIDEO_PATH=out/custom.mp4 VIDEO_TITLE="Custom Title" pnpm upload:bilibili
 * Cover: output/video/cover.jpg (Cover-Static / PPT-Deck-Cover-Static share this path). Override with VIDEO_COVER.
 */

interface UploadConfig {
  videoPath: string;
  title: string;
  description?: string;
  tags?: string[];
  coverPath?: string;
}

// Get video file path (default to fixed filename)
function getVideoPath(): string {
  const defaultVideoPath = path.join(process.cwd(), UPLOAD_PATHS.DEFAULT_VIDEO);
  return process.env.VIDEO_PATH || defaultVideoPath;
}

// Get title from JSON file or environment
function getTitleFromJson(): string | null {
  const titleJsonPath = path.join(process.cwd(), UPLOAD_PATHS.DEFAULT_TITLE_JSON);
  
  if (!existsSync(titleJsonPath)) {
    return null;
  }
  
  try {
    const fs = require('fs');
    const titleData = JSON.parse(fs.readFileSync(titleJsonPath, 'utf-8'));
    return titleData.title || null;
  } catch (e) {
    return null;
  }
}

// Get upload configuration from environment or defaults
function getUploadConfig(): UploadConfig {
  const videoPath = getVideoPath();
  
  if (!videoPath || !existsSync(videoPath)) {
    throw new Error(
      `Video file not found: ${videoPath}\n` +
      `Please ensure ${UPLOAD_PATHS.DEFAULT_VIDEO} exists or set VIDEO_PATH environment variable.`
    );
  }
  
  // Try to get title from JSON file first, then environment variable
  let title = process.env.VIDEO_TITLE || getTitleFromJson();
  
  if (!title) {
    throw new Error(
      'VIDEO_TITLE is required. Please set it:\n' +
      '  export VIDEO_TITLE="Your Video Title"\n' +
      `Or ensure ${UPLOAD_PATHS.DEFAULT_TITLE_JSON} exists with a title field.`
    );
  }
  
  const defaultCoverPath = path.join(process.cwd(), UPLOAD_PATHS.DEFAULT_COVER);
  const coverPath = process.env.VIDEO_COVER
    ? path.resolve(process.env.VIDEO_COVER)
    : existsSync(defaultCoverPath)
      ? path.resolve(defaultCoverPath)
      : undefined;
  
  const config: UploadConfig = {
    videoPath: path.resolve(videoPath),
    title,
    description: process.env.VIDEO_DESC || '',
    tags: process.env.VIDEO_TAGS ? process.env.VIDEO_TAGS.split(',').map(t => t.trim()) : [],
    coverPath,
  };
  
  return config;
}

// Load saved authentication state for Bilibili if it exists
const bilibiliAuthFile = getAuthFilePath('bilibili');
if (existsSync(bilibiliAuthFile)) {
  test.use({ storageState: bilibiliAuthFile });
  console.log('Auth: Bilibili');
} else {
  console.log('Auth: Bilibili (not found, run: pnpm login:bilibili)');
}

// Configure test suite: 5 minute timeout
test.describe.configure({ timeout: 5 * 60 * 1000 });

test('upload video to bilibili', async ({ page }) => {
  // Set timeout for this specific test (5 minutes)
  test.setTimeout(5 * 60 * 1000);
  
  const config = getUploadConfig();
  
  console.log(`Upload: Bilibili - ${config.title}`);
  
  // Step 1: Navigate to Bilibili upload page
  await page.goto('https://member.bilibili.com/platform/upload/video/frame');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  // Check if logged in
  const loginRequired = await page.locator('text=登录').first().isVisible().catch(() => false);
  if (loginRequired) {
    throw new Error(
      'Not logged in! Please run login script first:\n' +
      '  pnpm login:bilibili'
    );
  }
  
  // Step 2: Find the actual file input element
  await page.waitForTimeout(2000);
  
  const fileInputSelectors = [
    'input[type="file"]',
    '.upload-area input[type="file"]',
    '[class*="upload"] input[type="file"]',
    'input[accept*="video"]',
  ];
  
  let uploadInput = null;
  for (const selector of fileInputSelectors) {
    try {
      const input = page.locator(selector).first();
      const count = await input.count();
      if (count > 0) {
        const tagName = await input.evaluate((el: any) => el?.tagName?.toLowerCase());
        if (tagName === 'input') {
          uploadInput = input;
          break;
        }
      }
    } catch (e) {
      // Continue
    }
  }
  
  if (!uploadInput) {
    const uploadArea = page.locator('.upload-area').first();
    if (await uploadArea.isVisible({ timeout: 3000 })) {
      await uploadArea.click();
      await page.waitForTimeout(1000);
      
      for (const selector of fileInputSelectors) {
        try {
          const input = page.locator(selector).first();
          const count = await input.count();
          if (count > 0) {
            uploadInput = input;
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    }
  }
  
  if (!uploadInput) {
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.style.display = 'none';
      input.id = 'playwright-file-input';
      document.body.appendChild(input);
    });
    uploadInput = page.locator('#playwright-file-input');
  }
  
  // Step 3: Upload video file
  try {
    await uploadInput.setInputFiles(config.videoPath);
  } catch (error: any) {
    const uploadArea = page.locator('.upload-area').first();
    if (await uploadArea.isVisible({ timeout: 3000 })) {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 5000 }),
        uploadArea.click(),
      ]);
      await fileChooser.setFiles(config.videoPath);
    } else {
      throw new Error('Could not find upload area or file input');
    }
  }
  
  await page.waitForTimeout(3000);
  
  // Step 4: Fill in video information
  await page.waitForTimeout(5000);
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1000);
  
  // Fill title
  const titleSelectors = [
    'input[placeholder*="标题"]',
    'input[placeholder*="title"]',
    'input[name="title"]',
    'input[data-v-*][placeholder*="标题"]',
    '.title-input input',
    '[class*="title"] input[type="text"]',
    '[class*="Title"] input',
    'input[maxlength]',
  ];
  
  for (const selector of titleSelectors) {
    try {
      const titleInput = page.locator(selector).first();
      const count = await titleInput.count();
      if (count > 0) {
        const visible = await titleInput.isVisible({ timeout: 2000 });
        if (visible) {
          await titleInput.click({ timeout: 1000 });
          await titleInput.fill(config.title);
          await page.waitForTimeout(500);
          break;
        }
      }
    } catch (e) {
      // Continue
    }
  }
  
  // Fill description if provided
  if (config.description) {
    const descSelectors = [
      'textarea[placeholder*="简介"]',
      'textarea[placeholder*="描述"]',
      'textarea[placeholder*="description"]',
      'textarea[name="desc"]',
      'textarea[data-v-*][placeholder*="简介"]',
      '.desc-input textarea',
      '[class*="desc"] textarea',
      '[class*="Desc"] textarea',
      'textarea[maxlength]',
    ];
    
    for (const selector of descSelectors) {
      try {
        const descInput = page.locator(selector).first();
        const count = await descInput.count();
        if (count > 0) {
          const visible = await descInput.isVisible({ timeout: 2000 });
          if (visible) {
            await descInput.click({ timeout: 1000 });
            await descInput.fill(config.description);
            await page.waitForTimeout(500);
            break;
          }
        }
      } catch (e) {
        // Continue
      }
    }
    
  }
  
  // Fill tags if provided
  if (config.tags && config.tags.length > 0) {
    const tagSelectors = [
      'input[placeholder*="标签"]',
      'input[placeholder*="tag"]',
      '.tag-input input',
      '[class*="tag"] input',
      '[class*="Tag"] input',
      'input[type="text"][placeholder*="标签"]',
    ];
    
    for (const selector of tagSelectors) {
      try {
        const tagInput = page.locator(selector).first();
        const count = await tagInput.count();
        if (count > 0) {
          const visible = await tagInput.isVisible({ timeout: 2000 });
          if (visible) {
            await tagInput.click({ timeout: 1000 });
            await tagInput.fill(config.tags.join(','));
            await page.waitForTimeout(500);
            break;
          }
        }
      } catch (e) {
        // Continue
      }
    }
    
  }
  
  // Step 5: Upload cover if provided
  if (config.coverPath && existsSync(config.coverPath)) {
    console.log(`Uploading cover: ${config.coverPath}`);
    
    // Click on "封面设置" to open cover editor panel
    await page.locator('div').filter({ hasText: /^封面设置$/ }).nth(1).click();
    await page.waitForTimeout(2000);
    
    // Wait for cover editor panel to appear
    await page.waitForSelector('.cover-editor-panel-select', { timeout: 5000 }).catch(() => {
      console.log('Cover editor panel not found, trying alternative approach');
    });
    
    // Try multiple methods to upload cover
    let coverUploaded = false;
    
    // Method 1: Find file input in cover upload area
    const coverInputSelectors = [
      '.cover-upload input[type="file"]',
      '.bcc-upload.cover-upload input[type="file"]',
      '.cover-editor-panel-select input[accept*="image"]',
      'input[type="file"][accept="image/png, image/jpeg"]',
      'input[type="file"][accept*="image"]',
      '[class*="cover"] input[type="file"]',
    ];
    
    for (const selector of coverInputSelectors) {
      try {
        const coverInput = page.locator(selector).first();
        const count = await coverInput.count();
        if (count > 0) {
          // Try to set files directly
          await coverInput.setInputFiles(config.coverPath);
          coverUploaded = true;
          await page.waitForTimeout(2000);
          console.log(`Cover uploaded using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Method 2: Click upload area and use file chooser
    if (!coverUploaded) {
      try {
        const uploadArea = page.locator('.cover-upload .upload-area').first();
        if (await uploadArea.isVisible({ timeout: 3000 })) {
          const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser', { timeout: 5000 }),
            uploadArea.click(),
          ]);
          await fileChooser.setFiles(config.coverPath);
          coverUploaded = true;
          await page.waitForTimeout(2000);
          console.log('Cover uploaded using file chooser');
        }
      } catch (e) {
        console.log('File chooser method failed:', e);
      }
    }
    
    // Method 3: Try clicking upload area to reveal file input
    if (!coverUploaded) {
      try {
        const uploadArea = page.locator('.cover-upload .upload-area, .bcc-upload.cover-upload .upload-area').first();
        if (await uploadArea.isVisible({ timeout: 3000 })) {
          await uploadArea.click();
          await page.waitForTimeout(1000);
          
          // After clicking, try to find the file input again
          const fileInput = page.locator('input[type="file"][accept*="image"]').first();
          if (await fileInput.isVisible({ timeout: 2000 })) {
            await fileInput.setInputFiles(config.coverPath);
            coverUploaded = true;
            await page.waitForTimeout(2000);
            console.log('Cover uploaded after clicking upload area');
          }
        }
      } catch (e) {
        console.log('Click upload area method failed:', e);
      }
    }
    
    if (coverUploaded) {

      
      // Wait for cover to be processed and selected
      // Check for cover preview or processing indicators
      try {
        // Wait for cover preview to appear (indicating upload success)
        await page.waitForSelector('.cover-slider-image, [class*="cover"][class*="preview"], [class*="cover"][class*="image"]', { 
          timeout: 10000 
        }).catch(() => {
          console.log('Cover preview not found, but continuing...');
        });
       
        page.once('dialog', dialog => {
          console.log(`Dialog message: ${dialog.message()}`);
          dialog.dismiss().catch(() => {});
        });
        await page.getByText('封面制作').click();
        page.once('dialog', dialog => {
          console.log(`Dialog message: ${dialog.message()}`);
          dialog.dismiss().catch(() => {});
        });
        await page.getByText('封面制作').click(); 
        // Wait a bit for cover processing to complete
        await page.locator('.bcc-checkbox-checkbox').first().click();
        await page.waitForTimeout(3000);
        
        // Click "完成" button to confirm cover selection (only after cover is uploaded)
        const completeButton = page.getByText('完成', { exact: true });
        if (await completeButton.isVisible({ timeout: 5000 })) {
          await completeButton.click();
          console.log('✅ Clicked "完成" button to confirm cover selection');
          await page.waitForTimeout(2000);
        } else {
          console.log('⚠️  "完成" button not found, cover may already be selected');
        }
      } catch (e) {
        console.log('Error waiting for cover processing:', e);
        // Try clicking "完成" anyway
        try {
          await page.getByText('完成', { exact: true }).click({ timeout: 3000 });
        } catch (e2) {
          console.log('Could not click "完成" button');
        }
      }
    } else {
      console.log('⚠️  Cover upload failed, continuing without cover');
      // If cover upload failed, try to close the cover editor panel
      try {
        const completeButton = page.getByText('完成', { exact: true });
        if (await completeButton.isVisible({ timeout: 2000 })) {
          await completeButton.click();
        }
      } catch (e) {
        // Ignore if button not found
      }
    }
  } else {
    console.log('No cover image found, skipping cover upload');
  }
  
  // Step 6: Wait for video processing
  await page.waitForTimeout(10000);

  
  // Step 7: Click submit button
  await page.waitForTimeout(2000);
  
  // Scroll to bottom to ensure submit button is visible
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  
  // Try to find submit button
  let submitClicked = false;
  
  // First, try using getByText for '立即投稿'
  try {
    const submitButton = page.getByText('立即投稿').first();
    const visible = await submitButton.isVisible({ timeout: 3000 });
    if (visible) {
      const isEnabled = await submitButton.isEnabled().catch(() => false);
      if (isEnabled) {
        await submitButton.click();
        submitClicked = true;
        await page.waitForTimeout(2000);
      }
    }
  } catch (e) {
    // Continue to fallback selectors
  }
  
  // Fallback to other selectors if not found
  if (!submitClicked) {
    const submitSelectors = [
      'button:has-text("提交")',
      'button:has-text("发布")',
      'button:has-text("确认提交")',
      'button:has-text("确认发布")',
      '[class*="submit-button"]',
      '[class*="publish-button"]',
      '[class*="SubmitButton"]',
      '[class*="PublishButton"]',
      'button[type="submit"]',
      '[data-v-*][class*="submit"]',
      '[data-v-*][class*="publish"]',
    ];
    
    for (const selector of submitSelectors) {
      try {
        const submitButton = page.locator(selector).first();
        const visible = await submitButton.isVisible({ timeout: 3000 });
        if (visible) {
          const isEnabled = await submitButton.isEnabled().catch(() => false);
          if (isEnabled) {
            await submitButton.click();
            submitClicked = true;
            await page.waitForTimeout(2000);
            break;
          }
        }
      } catch (e) {
        // Continue checking other selectors
      }
    }
  }
  
  if (!submitClicked) {
    await page.pause();
  } else {
    // Wait for submission to complete
    await page.waitForTimeout(5000);
    
    // Assert that '稿件投递成功' text appears
    const successMessage = page.getByText('稿件投递成功').first();
    await successMessage.waitFor({ state: 'visible', timeout: 30000 });
    await test.expect(successMessage).toBeVisible({ timeout: 30000 });
    
    console.log('Success: Bilibili');
  }
});
