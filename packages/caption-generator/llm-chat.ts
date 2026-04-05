/**
 * Single entry for OpenAI-compatible chat completions used across this package.
 * All providers today share the same request shape (see `getCaptionLlmConfig`).
 * For a new OpenAI-compatible host: extend `llm-config.ts` only.
 * For a non-compatible API: add a branch in `completeChatText` or introduce a small adapter.
 */

import OpenAI from 'openai';
import {
  captionLlmProviderLabel,
  getCaptionLlmConfig,
  type CaptionLlmConfig,
} from './llm-config';

export type CompleteChatTextParams = {
  system: string;
  user: string;
  /** Shown after "Sending content to {Provider} for …" */
  taskLabel?: string;
  /** If true, return null when the model returns no text; otherwise throw */
  allowEmpty?: boolean;
  /** Tests or custom routing; default loads from env via `getCaptionLlmConfig()` */
  llm?: CaptionLlmConfig;
};

export async function completeChatText(
  params: CompleteChatTextParams,
): Promise<string | null> {
  const llm = params.llm ?? getCaptionLlmConfig();
  const client = new OpenAI({
    baseURL: llm.baseURL,
    apiKey: llm.apiKey,
  });

  if (params.taskLabel) {
    console.log(
      `\n📝 Sending content to ${captionLlmProviderLabel(llm)} for ${params.taskLabel}...`,
    );
  }

  const completion = await client.chat.completions.create({
    model: llm.model,
    messages: [
      { role: 'system', content: params.system },
      { role: 'user', content: params.user },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    if (params.allowEmpty) return null;
    throw new Error(`Empty response from ${captionLlmProviderLabel(llm)}`);
  }
  return text;
}
