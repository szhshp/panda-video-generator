import { readFileSync } from 'fs';
import { resolve } from 'path';

/** Backend id after normalizing env (Kimi uses Moonshot OpenAI-compatible API). */
export type CaptionLlmId = 'deepseek' | 'moonshot';

export type CaptionLlmConfig = {
  id: CaptionLlmId;
  baseURL: string;
  apiKey: string;
  model: string;
};

/**
 * Human-readable provider name for logs and errors.
 * When adding a provider: extend `CaptionLlmId` in `getCaptionLlmConfig` and add a case here.
 */
export function captionLlmProviderLabel(cfg: CaptionLlmConfig): string {
  if (cfg.id === 'moonshot') return 'Kimi (Moonshot)';
  return 'DeepSeek';
}

/**
 * Defaults match DeepSeek OpenAI-compatible API.
 * @see https://api-docs.deepseek.com/ — base_url `https://api.deepseek.com`, model `deepseek-chat`.
 * You may also use `https://api.deepseek.com/v1`; it is unrelated to model versioning.
 */
const DEEPSEEK_API_BASE_DEFAULT = 'https://api.deepseek.com';
const DEEPSEEK_MODEL_DEFAULT = 'deepseek-chat';

/**
 * Kimi (Moonshot) OpenAI-compatible API. Official examples use `https://api.moonshot.cn/v1`
 * (keys from the CN console authenticate here). Some docs show `https://api.moonshot.ai/v1` — set `MOONSHOT_API_BASE_URL` if your key targets that host.
 * Model default `kimi-k2.5`.
 */
const MOONSHOT_API_BASE_DEFAULT = 'https://api.moonshot.cn/v1';
const MOONSHOT_MODEL_DEFAULT = 'kimi-k2.5';

const DOTENV_KEYS = new Set([
  'LLM_PROVIDER',
  'DEEPSEEK_API_KEY',
  'DEEPSEEK_API_BASE_URL',
  'DEEPSEEK_MODEL',
  'MOONSHOT_API_KEY',
  'MOONSHOT_API_BASE_URL',
  'MOONSHOT_MODEL',
  'KIMI_API_KEY',
  'CAPTION_LLM_MODEL',
  'CAPTION_LLM_BASE_URL',
]);

/**
 * Merge selected keys from monorepo root `.env` into `process.env` (same cwd convention as before).
 * Values from `.env` always win for these keys (including `LLM_PROVIDER`), so runs from any shell match repo config.
 * Uses first `=` as separator so values may contain `=`.
 */
export function loadCaptionLlmEnvFromDotenv(): void {
  const envPath = resolve(process.cwd(), '.env');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq <= 0) continue;
      const key = t.slice(0, eq).trim();
      if (!DOTENV_KEYS.has(key)) continue;
      let val = t.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  } catch {
    // Use process env only when .env is missing or unreadable
  }
}

function normalizeProvider(raw: string | undefined): CaptionLlmId {
  const v = (raw ?? 'deepseek').trim().toLowerCase();
  if (v === 'kimi' || v === 'moonshot') return 'moonshot';
  return 'deepseek';
}

/**
 * Resolve LLM client settings from env. Default provider: DeepSeek.
 * Set `LLM_PROVIDER=kimi` or `moonshot` to use Moonshot (Kimi) API; then set `MOONSHOT_API_KEY` or `KIMI_API_KEY`.
 */
export function getCaptionLlmConfig(): CaptionLlmConfig {
  loadCaptionLlmEnvFromDotenv();
  const provider = normalizeProvider(process.env.LLM_PROVIDER);
  const captionModelOverride = process.env.CAPTION_LLM_MODEL?.trim();
  const captionBaseOverride = process.env.CAPTION_LLM_BASE_URL?.trim();

  if (provider === 'deepseek') {
    const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
    if (!apiKey) {
      throw new Error(
        'DEEPSEEK_API_KEY is not set. Set it in .env or the environment (default provider is DeepSeek).',
      );
    }
    const baseURL =
      process.env.DEEPSEEK_API_BASE_URL?.trim() ||
      captionBaseOverride ||
      DEEPSEEK_API_BASE_DEFAULT;
    const model =
      process.env.DEEPSEEK_MODEL?.trim() ||
      captionModelOverride ||
      DEEPSEEK_MODEL_DEFAULT;
    return {
      id: 'deepseek',
      baseURL,
      apiKey,
      model,
    };
  }

  const apiKey =
    process.env.MOONSHOT_API_KEY?.trim() || process.env.KIMI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'LLM_PROVIDER is kimi/moonshot but MOONSHOT_API_KEY (or KIMI_API_KEY) is not set.',
    );
  }
  const baseURL =
    process.env.MOONSHOT_API_BASE_URL?.trim() ||
    captionBaseOverride ||
    MOONSHOT_API_BASE_DEFAULT;
  const model =
    process.env.MOONSHOT_MODEL?.trim() ||
    captionModelOverride ||
    MOONSHOT_MODEL_DEFAULT;

  return {
    id: 'moonshot',
    baseURL,
    apiKey,
    model,
  };
}
