import { dirname } from 'path';
import { promises as fs } from 'fs';
import { getTtsInputFile } from './paths';
import {
  captionLlmProviderLabel,
  getCaptionLlmConfig,
  type CaptionLlmConfig,
} from './llm-config';
import { completeChatText } from './llm-chat';
import {
  buildVideoScriptUserPrompt,
  VIDEO_SCRIPT_SYSTEM_PROMPT,
} from './video-script-prompts';

export { getCaptionLlmConfig, loadCaptionLlmEnvFromDotenv, type CaptionLlmConfig, type CaptionLlmId } from './llm-config';

/** Crawled or structured content for video script (Zhihu, generic article, etc.). */
export type VideoScriptSourcePayload = {
  title: string;
  content: string;
  answers: Array<{
    author: string;
    content: string;
    voteCount: number;
  }>;
};

function normalizePayload(
  data: VideoScriptSourcePayload & { sourceUrl?: string },
): VideoScriptSourcePayload {
  return {
    title: data.title,
    content: data.content,
    answers: Array.isArray(data.answers) ? data.answers : [],
  };
}

/**
 * Call configured LLM (default DeepSeek; optional Kimi via env) and return video script text only (no file I/O).
 */
export async function generateVideoScriptText(
  data: VideoScriptSourcePayload & { sourceUrl?: string },
): Promise<string | null> {
  const payload = normalizePayload(data);

  if (!payload.title || (!payload.content && payload.answers.length === 0)) {
    throw new Error('Invalid data: title and content/answers are required');
  }

  let llm: CaptionLlmConfig;
  try {
    llm = getCaptionLlmConfig();
  } catch (e) {
    if (e instanceof Error) {
      console.error(`\n❌ ${e.message}`);
    }
    throw e;
  }

  const contentForModel = JSON.stringify(payload, null, 2);
  const userPrompt = buildVideoScriptUserPrompt(contentForModel);

  try {
    return await completeChatText({
      llm,
      system: VIDEO_SCRIPT_SYSTEM_PROMPT,
      user: userPrompt,
      taskLabel: 'video script generation',
      allowEmpty: true,
    });
  } catch (error) {
    console.error(
      `\n❌ Error generating video script with ${captionLlmProviderLabel(llm)}:`,
      error,
    );
    if (
      error instanceof Error &&
      (error.message.toLowerCase().includes('api key') ||
        error.message.includes('401') ||
        error.message.includes('403'))
    ) {
      console.error(
        '\n提示: 检查 .env — DeepSeek 用 DEEPSEEK_API_KEY；Kimi 用 LLM_PROVIDER=kimi 与 MOONSHOT_API_KEY（或 KIMI_API_KEY）。',
      );
    }
    throw error;
  }
}

/**
 * Generate video script from crawled content using the configured LLM (see `getCaptionLlmConfig`).
 * @param data - Title, body in `content`, optional `answers` (e.g. Zhihu). Extra fields like `sourceUrl` are ignored for the prompt.
 * @param outputDir - If set, writes `<outputDir>/input.txt`. If omitted, uses `TTS_INPUT_FILE` or `getSpiderNarrationPath()` / `<SPIDER_OUTPUT_DIR>/input.txt`.
 */
export async function generateVideoScript(
  data: VideoScriptSourcePayload & { sourceUrl?: string },
  outputDir?: string,
): Promise<string | null> {
  const scriptText = await generateVideoScriptText(data);

  if (!scriptText) {
    console.warn('\n⚠️  No text content in LLM response');
    return null;
  }

  const scriptPath =
    outputDir !== undefined
      ? `${outputDir.replace(/\/$/, '')}/input.txt`
      : getTtsInputFile();

  const parentDir = dirname(scriptPath);
  try {
    await fs.access(parentDir);
  } catch {
    await fs.mkdir(parentDir, { recursive: true });
  }

  await fs.writeFile(scriptPath, scriptText, 'utf-8');
  console.log(`\n✅ Video script generated and saved to: ${scriptPath}`);
  console.log('\n--- Generated Script Preview ---');
  console.log(scriptText.substring(0, 500) + (scriptText.length > 500 ? '...' : ''));

  return scriptPath;
}

/**
 * Generate video script from JSON file (e.g. spider output; extra keys like sourceUrl are ignored for the model).
 */
export async function generateVideoScriptFromFile(
  jsonFilePath: string,
  outputDir?: string,
): Promise<string | null> {
  try {
    const fileContent = await fs.readFile(jsonFilePath, 'utf-8');
    const raw = JSON.parse(fileContent) as VideoScriptSourcePayload & {
      sourceUrl?: string;
    };
    return await generateVideoScript(raw, outputDir);
  } catch (error) {
    console.error(`\n❌ Error reading JSON file: ${jsonFilePath}`, error);
    throw error;
  }
}
