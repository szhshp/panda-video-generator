<div align="center">
  <img src="./public/logo/logo.png" width="200" alt="Panda Video Generator Logo">
  
  # Panda Video Generator
  
  **熊猫视频自动化引擎**

  *"Developer-first video automation engine."*

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
  [![Remotion](https://img.shields.io/badge/Remotion-4.0-FF0000)](https://www.remotion.dev/)
</div>

---

[官方网站](https://panda.szhshp.org)


## ✨ 核心特性

### 🕷️ <mark>一键</mark>网页转文本
<mark>一键</mark>抓取正文与标题（如知乎），输出结构化文件，少手工整理。

### 🎬 <mark>一键</mark>文本转视频
<mark>一键</mark>跑通口播链路：Edge TTS + VTT 字幕，Remotion 模板渲染成片。

### 🚀 <mark>一键</mark>多平台发布
<mark>一键</mark>驱动浏览器自动化上传；B 站、抖音、视频号、YouTube、小红书、快手等共用相近流程。

### 🧭 一个<mark>傻瓜式</mark>自动化向导 (有手就行)
一个<mark>傻瓜式</mark> [自动化向导](#wizard-automation)，通过鼠标傻瓜式点击就能帮忙完成文稿、TTS、渲染、发布全流程。

-------------

## 📖 简介

Panda Video Generator `熊猫视频自动化引擎` 

一站式全自动化的视频内容生成与发布引擎，支持从网页内容提取、文本转视频到多平台发布的完整工作流。通过 AI 驱动的文本转语音（TTS）技术和视频渲染引擎，帮助内容创作者快速生成高质量视频并一键发布到多个平台。

## ❇️ 功能演示1 - Agent 使用演示

> 《用 AI 的方式一人运营十个自媒体账号》


<a href="https://www.bilibili.com/video/BV1WXDABGEB7/?vd_source=a7353d3395fdf5c1b78e0a2367800f20">
  <img src="./docs/assets/3.png" alt="使用演示 · 点击在 bilibili 播放" width="640" />
</a>


## ❇️ 功能演示2 - 网页自动化向导

> 《用程序员的方式一人运营十个自媒体账号》

<a href="https://www.bilibili.com/video/BV141XfB3ELj/?vd_source=a7353d3395fdf5c1b78e0a2367800f20">
  <img src="./docs/assets/2.png" alt="使用演示 · 点击在 bilibili 播放" width="640" />
</a>


## 🎉 产品展示

> 点击图片可在新窗口播放.

<a href="https://www.bilibili.com/video/BV19Rw9zwEd4/">
  <img src="./docs/assets/1.png" alt="成品展示 · 点击在 bilibili 播放" width="640" />
</a>


## 📅 更新日志

- **V1.3** · 2026-04-03
  - YES, SKILLS! 
  - Why not try it in your OpenClaw? 🦞
- **V1.2** · 2026-04-01
  - 添加了自动化向导功能，通过鼠标傻瓜式点击就能帮忙完成文稿、TTS、渲染、发布全流程。
  - 统一了环境变量名称，将 `.env.local` 重命名为 `.env`。


## 📷 平台示例

<table>
  <tr>
    <td align="center" valign="top" width="33%">
      <img src="./public/media/douyin.webp" width="240" alt="抖音 · 熊猫智研社">
    </td>
    <td align="center" valign="top" width="33%">
      <img src="./public/media/weichat.webp" width="240" alt="微信视频号 · 熊猫智研社">
    </td>
    <td align="center" valign="top" width="33%">
      <img src="./public/media/kuaishou.webp" width="240" alt="快手 · 熊猫智研社">
    </td>
  </tr>
  <tr>
    <td align="center" valign="top" colspan="3">
      <img src="./public/media/rednote.webp" width="240" alt="小红书 · 熊猫智研社">
      &emsp;&emsp;
      <img src="./public/media/bilibili.webp" width="240" alt="哔哩哔哩 · 熊猫智研社">
    </td>
  </tr>
</table>

---




---
<a id="quick-start"></a>
## 🚀 快速开始

> 如果你有一个 AI Agent (Claude Code, Cursor, Copilot etc.), 你可以让他来阅读这个项目, 包含项目里面的 ReadMe, Docs 和 Agent Skills. 并根据这个项目来完成 Setup 和视频发布全流程.


1. **[环境配置(必须)](#env-setup)** 
   - 安装 Node / ffmpeg、克隆、安装依赖、
   - 运行`pnpm check:setup`自检
2. **[方式1: 自动化向导](#wizard-automation)**（**推荐！**）
   - 啊我亲爱的土拨鼠啊, 我开源当天连夜写了这个功能, 如果你不知道从哪里开始, 快来用这个自动化
   向导吧!
   - 入口：[自动化向导](#wizard-automation)
3. **[方式2: CLI 命令行](#usage-guide)** : 
   - 执行向导底层命令，适合终端、脚本与进阶组合。
   - 需要提供环境变量
4. **[完整工作流示例](#full-workflow)** : 从知乎链路到成片与多平台发布的命令行示例。

<a id="env-setup"></a>
## 📦 环境配置

### 1. 环境要求

- 安装 **[Node.js 20+](https://nodejs.org/)**（≥ 20.9）。
- **ffmpeg**：须为系统安装并在终端 `PATH` 中（TTS 合并音频等依赖）。
  - macOS：`brew install ffmpeg`
  - Ubuntu：`sudo apt install ffmpeg`
  - Windows：
    - `choco install ffmpeg`（需要管理员权限）
    - 或 [ffmpeg 官网](https://ffmpeg.org/download.html) 下载并配置环境变量

### 2. 获取代码

```bash
git clone https://github.com/szhshp/panda-video-generator.git
cd panda-video-generator 
```

### 3. 一键安装

- **推荐：** `pnpm install:project`
- **手动运行：**
  - macOS / Linux：`bash scripts/install.sh`
  - Windows：`powershell -ExecutionPolicy Bypass -File scripts/install.ps1`

### 4. 验证与配置

- 自检：`pnpm check:setup`
- `cp .env.example .env`，需要提供环境变量

---

<a id="wizard-automation"></a>
## 🧭 <mark>自动化向导</mark>（推荐）

用浏览器完成 **文稿 → TTS → 成片渲染**，无需任何命令.

### 怎么用来着?

1. 先完成 [环境配置](#env-setup)。
2. 在**项目根目录**执行 `pnpm automation`。
3. 浏览器会**自动打开**向导界面。
4. 按界面步骤完成文稿、TTS、渲染（及可选发布）。
5. 遇到问题可提交 [Issue](https://github.com/szhshp/panda-video-generator/issues)。


---

<a id="usage-guide"></a>
## 📚 使用指南

下列为**命令行方式**，与向导在后台执行的脚本一致，便于自动化与按需拆分步骤。

### 示例: 一键从知乎生成视频

从知乎链接一键生成完整视频，自动完成内容提取、脚本生成、TTS 和视频渲染：

```bash
pnpm pipeline:zhihu-video -- <知乎问题链接>
```

**示例：**
```bash
pnpm pipeline:zhihu-video -- https://www.zhihu.com/question/316150890
```

**输入：**
- 知乎问题链接（命令行参数）

**完整流程：**
1. ✅ 自动提取知乎问题内容（标题、问题、答案）
2. ✅ 使用 AI 整理并生成视频脚本
3. ✅ 自动生成 TTS 语音和字幕
4. ✅ 使用 Remotion 渲染最终视频

**输出文件：**

```
output/
├── video/
│   └── video.mp4 — 最终成片
├── spider/
│   ├── title.json — 标题 JSON
│   ├── input.txt — 口播稿
│   └── output.json — 原始爬取 JSON
└── tts/
    ├── audio.mp3 — 语音
    └── audio.vtt — 字幕
```

> **注意**：需要在仓库根目录的 **`.env`** 中配置 `DEEPSEEK_API_KEY`，用于智能整理和优化提取的文稿。

### 分步操作详细说明

- **顺序：** **STEP1** 文稿 → **STEP2** TTS 与成片渲染 → **STEP3** 多平台发布（可选）。向导界面上将 TTS 与渲染拆成两步，命令行可用 **`pnpm pipeline:tts-render`** 一次完成；发布始终用下方 **`login:*`** / **`upload:*`**。
- **路径：** 与上文「输出文件」目录树一致

#### STEP1：文稿准备+整理

- **目标**
  - 得到 **`output/spider/input.txt`** 供 TTS 使用（默认路径；可自定义 **`TTS_INPUT_FILE`**）
- **做法（三选一）**
  - **手工写稿**
    - **写入：** **`output/spider/input.txt`**
    - **分段：** 每个**非空行**为一段，**STEP2** 中 TTS 按段合成
    - **说明：** 不会自动润色；定稿后再进入 **STEP2**
  - **知乎爬虫 + LLM**
    - **命令：** **`pnpm spider:zhihu -- <知乎问题 URL>`**
    - **产出：**
      - **`output/spider/output.json`**
      - **`output/spider/input.txt`**、**`title.json`**（LLM 生成）
    - **依赖：** **`.env`** → **`DEEPSEEK_API_KEY`**
    - **示例：**
      ```bash
      pnpm spider:zhihu -- https://www.zhihu.com/question/2021664832844308557
      ```
    - **改读稿路径：** 环境变量 **`TTS_INPUT_FILE`**
  - **通用网页爬虫 + 成稿**
    - **爬取**
      - **环境变量：** **`SPIDER_SOURCE`** = 页面完整 **http(s)** URL
      - **命令：** **`pnpm spider:extract:url`**
      - **产出：** **`output/spider/output.json`**（仅 `title`、`content`，**无** `input.txt`）
    - **成稿**
      - **命令：** **`pnpm caption:env`**
      - **产出：** **`output/spider/input.txt`**、**`captions.vtt`**
      - **依赖：** **`DEEPSEEK_API_KEY`**（配置在仓库根目录 **`.env`** 或当前 shell 环境变量）
      - **可选参数：** **`CAPTION_INPUT_JSON`** 指向其它 JSON（默认即为 **`output/spider/output.json`**）
    - **示例：**

      ```bash
      SPIDER_SOURCE='https://example.com/article' pnpm spider:extract:url
      pnpm caption:env
      ```

#### STEP2：TTS + 成片渲染

向导里对应「TTS」与「渲染」两步；命令行可用下面一条命令合并执行。

- **前置**
  - **`output/spider/input.txt`** 已存在（或 **`TTS_INPUT_FILE`** 指向有效文稿）
- **命令**
  - **一键：** **`pnpm pipeline:tts-render`**
  - **分步：** **`pnpm tts`** → **`pnpm render:video`**
  - **仅重渲染（`public/` 素材已齐）：** **`pnpm render:composition`**
- **可选配置**
  - **片内素材**
    - **背景：** **`public/video/0.mp4`**
    - **配乐：** **`public/bgm/0.mp3`**
    - **命名：** 均为 **`0`**；无背景则黑底
  - **目录（环境变量）**
    - **`SPIDER_OUTPUT_DIR`**、**`TTS_OUTPUT_DIR`**、**`TTS_PUBLIC_DIR`** 等 → 详见 **`package.json`** 与各脚本
  - **TTS音色**
    - **环境变量：** **`EDGE_TTS_VOICE`**
    - **可选值：** 详见 [可选音色名称列表](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)
      - 在里面搜索 `zh-CN` 即可找到所有中文音色
        - `zh-CN-XiaoxiaoNeural` → 晓晓
        - `zh-CN-YunjianNeural` → 云健
      - 这里可以试听: [EdgeTTS 试听](https://edge-tts.com/)
    - **示例：**
      ```bash
      EDGE_TTS_VOICE="zh-CN-XiaoxiaoNeural" pnpm pipeline:tts-render
      ```

<a id="playwright-publish"></a>

#### STEP3：多平台发布（可选）

- **登录（每平台首次）**
  - **`pnpm login:<平台>`**（需要浏览器扫码）
- **上传**
  - **`pnpm upload:<平台>`** 或 **`pnpm upload:all`**
- **元数据（可选环境变量）**
  - **`VIDEO_TITLE`**、**`VIDEO_DESC`**、**`VIDEO_TAGS`**
- **示例**

  ```bash
  VIDEO_DESC="这是一个关于老子的视频" \
  VIDEO_TAGS="老子, 道教, 学术, 文化" \
  pnpm upload:douyin
  ```


---

## 🔧 开发

### 启动 Remotion Studio

```bash
# Remotion Studio（视频预览）
pnpm remotion
```


---

<a id="full-workflow"></a>
## 📝 完整工作流示例

### 方式一：一键生成

```bash
# 一键从知乎链接生成视频（组合：爬虫 / 脚本 → TTS → 渲染）
pnpm pipeline:zhihu-video -- https://www.zhihu.com/question/316150890

# 首次使用需要登录（只需一次）
pnpm login:bilibili
pnpm login:douyin
# ... 其他平台见 package.json 中以 login: 开头的脚本

# 发布到所有平台
VIDEO_DESC="这里是视频描述" \
VIDEO_TAGS="AI,自动化,视频生成" \
pnpm upload:all
```

### 方式二：分步操作（命令行）

```bash
# 1. 提取知乎内容
pnpm spider:zhihu -- https://www.zhihu.com/question/316150890

# 2. 生成视频（组合：TTS + 渲染）
pnpm pipeline:tts-render

# 3. 首次使用需要登录（只需一次）
pnpm login:bilibili
pnpm login:douyin
# ... 其他平台见 package.json 中以 login: 开头的脚本

# 4. 发布到所有平台
VIDEO_DESC="这是一个自动生成的视频" \
VIDEO_TAGS="AI,自动化,视频生成" \
pnpm upload:all
```

----

## 📋 功能状态

```
功能模块
├── ✅ 自动化向导
├── 🕷️ 网页内容提取
│   ├── ✅ 理论上支持所有网页内容提取
│   ├── ✅ 知乎内容 + 问答特殊处理
│   ├── 🚧 HackerNews 总结+处理
│   ├── 🚧 Quora 内容提取
│   ├── 🚧 Reddit 内容提取
│   └── 🚧 And More...
├── 🤖 总结与优化（LLM）
│   ├── ✅ DeepSeek
│   ├── 🚧 Kimi / Moonshot
│   ├── 🚧 Doubao
│   ├── 🚧 Qwen
│   ├── 🚧 Hunyuan
│   ├── 🚧 ChatGLM / GLM
│   ├── 🚧 MiniMax
│   └── 🚧 And More...
├── 🎬 文本转视频
│   ├── ✅ 自动生成语音和字幕（TTS）
│   ├── ✅ 自动渲染视频
│   └── ✅ 视频模板系统 
│       ├── ✅ 横屏模板
│       ├── ✅ 竖屏模板
│       ├── ✅ 你可以自由修改视频模板的任何细节
│       └── 🚧 更多模板...
├── 🎞️ **视频素材**
│   ├── ✅ 自定义音乐
│   ├── 🚧 AI 生成音乐
│   ├── ✅ 自定义背景
│   └── 🚧 AI 生成背景
├── 🚀 多平台发布
│   ├── ✅ Bilibili 自动发布
│   ├── ✅ 抖音自动发布
│   ├── ✅ 微信视频号自动发布
│   ├── ✅ 小红书自动发布
│   ├── ✅ YouTube 自动发布
│   ├── ✅ 快手自动发布
│   └── 🚧 And More...
├── 🔧 开发工具
│   ├── ✅ 开发服务器
│   └── 🚧 Github Action 自动化视频生成
├── 🧩 AI Integration
│   └── 🚧 Skills 开发
├── 🦞 OpenClaw Integration
│   └── 🚧 我相信有了 Skills 全部都可以 Automated!
└── ✨ And More...


```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

## 👤 作者

**szhshp**

- Email: 24031shp@sina.com
- GitHub: [@szhshp](https://github.com/szhshp)

---

<div align="center">
  Made with ❤️ by szhshp x 熊猫智研社
</div>
