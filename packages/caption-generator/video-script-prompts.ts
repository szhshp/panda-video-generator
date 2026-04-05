/** System message for chat completion — video script from article / Q&A JSON. */
export const VIDEO_SCRIPT_SYSTEM_PROMPT =
  'You are a helpful assistant that generates video scripts from user-provided article or Q&A content (any source).';

const VIDEO_SCRIPT_USER_BEFORE_JSON = `内容进行整理，并且生成一段视频完整的视频台词, 是平台要尽可能贴近原文, 并且要有Intro和ending的话语

以下是爬取/提供的正文与结构化内容（JSON 格式，可能含标题、问题描述、多条回答等）：`;

const VIDEO_SCRIPT_USER_AFTER_JSON = `请根据以上内容：在内容前加入一段简短开场白，在内容后加入一段契合内容的结尾语（可适度价值观升华）。输出**只要**完整口播正文，一行一段。

**版式（必须严格遵守）：**
- 台词将用于 TTS 与**估计字幕**（每行 = 一条字幕块）；行数过多会导致字幕文件冗长，务必**高度压缩**。
- **硬性上限**：全文汉字最多 **≤1000 字**（含开场与结尾）；超出则必须对原文做取舍与概括，**禁止**长篇照搬。
- **每行一段**：每一段（每一行）**≤50 个汉字**；若一句超过 50 字，必须在语义合理处**拆成多行**，每行仍 ≤50 字。
- 不要书名号、括号、列表符号、Markdown、角标或任何解释性废话；不要标题行或「以下是正文」之类提示语。

若原文很长：优先保留一条主线与关键论据，删减例证与重复表述，使总行数通常在 **约 20–40 行**内（短内容可更少）。`;

/** Builds the user message body; `structuredContentJson` is pretty-printed payload JSON. */
export function buildVideoScriptUserPrompt(structuredContentJson: string): string {
  return `${VIDEO_SCRIPT_USER_BEFORE_JSON}
${structuredContentJson}

${VIDEO_SCRIPT_USER_AFTER_JSON}`;
}
