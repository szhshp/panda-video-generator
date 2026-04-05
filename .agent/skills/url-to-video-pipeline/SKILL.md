---
name: url-to-video-pipeline
description: >-
  Orchestrates repo pipeline from a single URL: branch Zhihu vs generic page → spider → DeepSeek
  caption when needed → Edge TTS → Remotion render to output/video/video.mp4. Use when the user
  gives a URL for 一条龙、网页转视频、爬取+口播+渲染、or automate spider→tts→render from link.
---

# URL → 成片编排（Spider → TTS → Remotion）

在 **monorepo 根目录**执行 **`pnpm install`**，配置仓库根 **`.env`** 中的 **`DEEPSEEK_API_KEY`**（知乎链路与通用链路的口播步骤都需要）。后续步骤需要 **网络**；TTS / 渲染阶段需要 **ffmpeg** 在 PATH。

先按 URL **二选一**（不要混用）：

| 条件 | 分支 |
|------|------|
| `https://www.zhihu.com/question/...` | **A. 知乎**（`pnpm spider:zhihu` 已含爬取 + 口播写 `input.txt`） |
| 其它 `http(s)://` 正文页 | **B. 通用网页**（`spider:extract:url` → 再 **`pnpm run caption:env`** 生成 `input.txt`） |

两条分支之后统一：**`pnpm render:all`**（= **`pnpm tts`** + **`pnpm render:video`**），或分步 **`pnpm tts`** 再 **`pnpm render:video`**（等价于 pipeline 脚本组合）。

---

## A. 知乎问题 URL

### 参数

| 名称 | 必填 | 说明 |
|------|------|------|
| `URL` | 是 | 须匹配 `https://www.zhihu.com/question/<id>`（与 `cli-zhihu-video-prep` 校验一致） |
| `DEEPSEEK_API_KEY` | 是 | `.env` 或环境变量（口播用） |
| `SPIDER_OUTPUT_DIR` | 否 | 默认 `output/spider`（`pnpm spider:zhihu` 已带 `cross-env`） |

### 命令

```bash
pnpm spider:zhihu -- <URL>
pnpm render:all
```

（若已有人工跑过 TTS，可只跑 **`pnpm render:video`**，但仍需 **`output/tts/audio.mp3`** 与 **`audio.vtt`** 存在且 sync 满足 `render:video` 的 `--require-tts`。）

### 每步输入 / 输出

| 步骤 | 主要输入 | 主要输出 |
|------|----------|----------|
| **`pnpm spider:zhihu -- <URL>`** | 知乎 URL；**`.env`** 中 DeepSeek | **`output/spider/output.json`**（含 `title`,`content`,`answers`）；**`output/spider/input.txt`**（口播）；**`output/spider/title.json`**；复制 **`public/video/title.json`**；失败时口播可失败但 JSON 仍可能落盘（见 spider skill） |
| **`pnpm render:all`** | 默认 **`output/spider/input.txt`** → TTS；再按 **remotion-render** skill | **`output/tts/audio.mp3`**, **`audio.vtt`**；**`public/tts/*`**；**`output/video/video.mp4`**、**`cover.png`/`cover.jpg`** 等 |

---

## B. 通用 http(s) 页面

### 参数

| 名称 | 必填 | 说明 |
|------|------|------|
| `URL` | 是 | 完整 `http://` 或 `https://`；作 **`SPIDER_SOURCE`** |
| `DEEPSEEK_API_KEY` | 是 | **`pnpm run caption:env`** 调 DeepSeek |
| `SPIDER_OUTPUT_FILENAME` | 否 | 默认 **`output.json`**（与 **`CAPTION_INPUT_JSON`** 默认路径一致时勿改） |

`pnpm spider:extract:url` 会将 **`SPIDER_OUTPUT_DIR` 固定为 `output/spider`**（根脚本 `cross-env`），故 **`output/spider/output.json`** 即 caption 默认输入。

### 命令

```bash
SPIDER_SOURCE='<URL>' \
SPIDER_OUTPUT_FILENAME=output.json \
pnpm spider:extract:url

pnpm run caption:env

pnpm render:all
```

（分步等价：`pnpm tts` 再 **`pnpm render:video`**。）

### 每步输入 / 输出

| 步骤 | 主要输入 | 主要输出 |
|------|----------|----------|
| **`pnpm spider:extract:url`** | **`SPIDER_SOURCE`**；Puppeteer 拉页面 | **`output/spider/<SPIDER_OUTPUT_FILENAME>`**（默认 **`output.json`**），形态 **`{ title, content }`** |
| **`pnpm run caption:env`** | 默认 **`CAPTION_INPUT_JSON=output/spider/output.json`**（可覆盖） | **`output/spider/input.txt`**（或 `CAPTION_SCRIPT_FILENAME`）；**`captions.vtt`**；**`title.json`** 在同一 **`CAPTION_OUTPUT_DIR`**（默认与 spider 目录一致） |
| **`pnpm render:all`** | 含 TTS 读 **`input.txt`**、再渲染 | 同 **分支 A** 最后一行 |

---

## 环境与可选开关（两分支共用）

| 变量 | 默认 | 影响 |
|------|------|------|
| `SPIDER_OUTPUT_DIR` | `output/spider` | 爬虫 JSON、`title.json`、默认 `input.txt` 所在逻辑目录（脚本已设时常为 `output/spider`） |
| `TTS_INPUT_FILE` | `<SPIDER_OUTPUT_DIR>/input.txt` | TTS 文稿 |
| `TTS_OUTPUT_DIR` / `TTS_PUBLIC_DIR` | `output/tts`、`public/tts` | 见 **tts-node** skill |
| `VIDEO_PUBLIC_DIR` | `public/video` | **`title.json`**、Remotion 静态资源；见 **remotion-render** skill |
| `EDGE_TTS_VOICE` 等 | 见 tts-node | 合成音色、并发、超时 |

根脚本里的 **`cross-env`** 可能与手动 export 叠加；以 **`package.json` 各 `pnpm` 命令** 为准，覆盖时优先读各单包 **skill**。

---

## 依赖的细粒度 Skill（勿重复维护长文）

| 主题 | 路径 |
|------|------|
| Spider 三种用法 / `SPIDER_*` | `.agent/skills/spider/SKILL.md` |
| Caption / `CAPTION_*` / DeepSeek | `.agent/skills/caption-generator/SKILL.md` |
| Edge TTS / `EDGE_TTS_*` | `.agent/skills/tts-node/SKILL.md` |
| `render:video` / `render:all` / composition | `.agent/skills/remotion-render/SKILL.md` |
| `PPT-Deck` / `ppt:from-vtt` / `title.json` slides | `.agent/skills/ppt-workflow-zhihu/SKILL.md` |

---

## 排错提示

- **知乎 URL 报错格式**：必须 **`https://www.zhihu.com/question/...`**。  
- **通用链路没有 `input.txt`**：是否漏了 **`pnpm run caption:env`**（extract 只产出两字段 JSON）。  
- **`render:video` / `render:all` 报缺 TTS**：先 **`pnpm tts`** 或跑全 **`pnpm render:all`**；确认 **`output/tts/audio.mp3`** 与 **`audio.vtt`** 存在。  
- **密钥未生效**：在仓库根执行；确认 **`.env`** 与 **`process.cwd()`**（见 **`.agent/rules/env-file.md`**）。  
- **成片没有标题 overlay**：检查 **`public/video/title.json`**（通常 **`pnpm tts`** 或 **`render:video`** 内 sync 会从 **`output/spider/title.json`** 复制）。
