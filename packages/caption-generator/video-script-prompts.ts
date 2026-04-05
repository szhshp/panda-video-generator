/** System message for chat completion — video script from article / Q&A JSON. */
export const VIDEO_SCRIPT_SYSTEM_PROMPT =
  'You are a helpful assistant that generates video scripts from user-provided article or Q&A content (any source).';

const VIDEO_SCRIPT_USER_BEFORE_JSON = `内容进行整理，并且生成一段视频完整的视频台词, 是平台要尽可能贴近原文, 并且要有Intro和ending的话语

以下是爬取/提供的正文与结构化内容（JSON 格式，可能含标题、问题描述、多条回答等）：`;

const VIDEO_SCRIPT_USER_AFTER_JSON = `请根据以上内容，在内容前加入一段开场白, 并且在内容后加入一段契合内容的结尾语(尽可能进行一些价值观升华), 并且生成一段完整的视频台词.

生成的这些台词将会直接显示到视频的字幕中，因此不要添加额外的标记和符号(例如书名号或者括号等任何额外符号), 不要添加任何的解释和说明.

并且根据用户聆听和阅读的友好性，将生成的内容进行调整优化以及分段，并让它变得更流畅和自然.

最终生成文稿总字数不超过1000个字. 每个段落不超过50个字, 以保证用户能够流畅地阅读和理解.`;

/** Builds the user message body; `structuredContentJson` is pretty-printed payload JSON. */
export function buildVideoScriptUserPrompt(structuredContentJson: string): string {
  return `${VIDEO_SCRIPT_USER_BEFORE_JSON}
${structuredContentJson}

${VIDEO_SCRIPT_USER_AFTER_JSON}`;
}
