---
name: remotion-render
description: >-
  Run Remotion renders from monorepo root: pnpm render:video, render:all / pipeline:tts-render,
  render:composition; sync-to-public, composition IDs, output/video paths, VIDEO_PUBLIC_DIR. Use for
  渲染成片, output/video/video.mp4, remotion render, Cover-Static.
---

# Remotion 渲染 — 三种用法（输入 / 输出 / 环境变量）

在 **monorepo 根目录**执行。底层调用 **`pnpm exec remotion render …`**（见 `scripts/run-render-video.mjs`、`run-render-composition.mjs`）。配置文件 **`remotion.config.ts`**。`packages/*/README` 路牌不涉及本流程。

---

## 1. 仅渲染主成片 `Video`（要求已有 TTS 音频）

**用法**

```bash
pnpm render:video
```

根脚本 **`cross-env`**：`SPIDER_OUTPUT_DIR=output/spider`、`TTS_OUTPUT_DIR=output/tts`、`TTS_PUBLIC_DIR=public/tts`，然后 **`node scripts/run-render-video.mjs`**：

1. **`sync-outputs-to-public.mjs --require-tts`** — 必须存在 **`$TTS_OUTPUT_DIR/audio.mp3`** 与 **`audio.vtt`**，否则退出（提示先 **`pnpm tts`**）。
2. 若存在 **`$VIDEO_PUBLIC_DIR/title.json`**，生成临时 **`output/video/render-props.json`** 作为 **`--props`**；否则用默认标题并告警。
3. **`pnpm exec remotion render Video <output> --codec=h264 --crf=23`**（`<output>` = **`output/video/video.mp4`**）。
4. 生成封面：**`Cover-Static` → `output/video/cover.png`**，必要时 **ffmpeg → `cover.jpg`**（或从 MP4 抽帧兜底）。

**输入**

| 项目 | 说明 |
|------|------|
| TTS 产物 | **`TTS_OUTPUT_DIR`** 下 **`audio.mp3`**、**`audio.vtt`**（`--require-tts`） |
| 标题（可选） | **`VIDEO_PUBLIC_DIR/title.json`** → 动态 **`title`/`props`** |

**输出**

| 路径 | 内容 |
|------|------|
| `output/video/video.mp4` | 主成片（**每次覆盖**同路径） |
| `output/video/cover.png`、`output/video/cover.jpg` | 封面（脚本内生成逻辑） |
| `public/tts/*`、`public/spider/*` 等 | **sync** 步骤写入，供 Remotion 读静态资源 |

临时 **`render-props.json`** 在渲染结束后会 **删除**。

**环境变量**

| 变量 | 必填 | 默认 / 说明 |
|------|------|-------------|
| `SPIDER_OUTPUT_DIR` | 否 | `output/spider`（sync 用） |
| `TTS_OUTPUT_DIR` | 否 | `output/tts` |
| `TTS_PUBLIC_DIR` | 否 | `public/tts` |
| `VIDEO_PUBLIC_DIR` | 否 | `public/video`（**`title.json`** 与 Remotion 用图） |

---

## 2. TTS（含 sync）→ 再执行「用法 1」整条渲染链

**用法**

```bash
pnpm render:all
# 等同于
pnpm pipeline:tts-render
```

**`node scripts/run-pipeline-tts-render.mjs`**：先 **`run-tts.mjs`**，再 **`run-render-video.mjs`**。

**输入 / 输出**

| 阶段 | 说明 |
|------|------|
| TTS | 见 **`.agent/skills/tts-node/SKILL.md`**（`input.txt` → `audio.mp3` / `audio.vtt` + sync） |
| 渲染 | 同 **用法 1** |

**环境变量**

沿用 **`pnpm tts`** 与 **`pnpm render:video`** 所用变量（根脚本默认同上 **`cross-env`** 前缀）。

---

## 3. 指定 Composition、**不**跑 `sync-outputs-to-public`

**用法**

```bash
pnpm render:composition -- Video
pnpm render:composition -- Video-Vertical
```

**`node scripts/run-render-composition.mjs [compositionId]`**（`pnpm` 传入的 **`--`** 会被跳过）。未传 id 时默认 **`Video`**。

**允许的 `compositionId`**（与 `run-render-composition.mjs` 内 **`ALLOWED`** 一致）：

`Intro`、`Video`、`Content`、`Intro-Vertical`、`Video-Vertical`、`Content-Vertical`、`Cover`

**输入**

| 项目 | 说明 |
|------|------|
| 合成 ID | 上表之一 |
| `title.json`（可选） | 同用法 1：**`$VIDEO_PUBLIC_DIR/title.json`** |

**输出**

| 路径 | 内容 |
|------|------|
| `output/video/video.mp4` | **任意允许的 composition 都写入同一路径**（覆盖上次） |
| `output/video/cover.png`、`cover.jpg` | 脚本仍会跑封面逻辑（含 Cover-Static / ffmpeg 兜底） |

**环境变量**

| 变量 | 默认 |
|------|------|
| `VIDEO_PUBLIC_DIR` | `public/video` |

**注意**：不执行 sync。若 `public/tts` 等缺文件，需先自行 **`pnpm tts`** / **`node scripts/sync-outputs-to-public.mjs`**（无 `--require-tts` 时可部分复制）。

---

## 备用：裸 `remotion` CLI

```bash
pnpm render   # package.json → `remotion render`（须自行补全 composition、输出路径等参数）
pnpm remotion # `remotion studio`
```

日常成片优先 **`pnpm render:video`** 或 **`pnpm render:all`**，以保证路径与 **`--require-tts`** / 封面与仓库脚本一致。
