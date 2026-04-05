/**
 * UI grouping, labels (Chinese), and optional argument presets per script.
 * Script names and args remain plain strings for pnpm.
 */

export type ScriptParamPreset = {
  label: string;
  args: string[];
};

export type ScriptGroupSpec = { id: string; label: string; scripts: string[] };

export const SCRIPT_GROUP_ORDER: ScriptGroupSpec[] = [
  {
    id: "setup",
    label: "环境与检查",
    scripts: ["check:setup", "install:project", "lint", "build"],
  },
  {
    id: "pipeline",
    label: "流水线 / TTS / 渲染",
    scripts: [
      "render:all",
      "pipeline:tts-render",
      "pipeline:zhihu-video",
      "video:zhihu",
      "tts",
      "render:video",
      "render:composition",
      "render",
      "sync:public",
    ],
  },
  {
    id: "spider",
    label: "抓取与字幕",
    scripts: [
      "spider:zhihu",
      "spider:extract:file",
      "spider:extract:url",
      "caption:env",
    ],
  },
  {
    id: "assets",
    label: "素材洗牌",
    scripts: ["shuffle:bg-video", "shuffle:bgm", "shuffle:ppt-bg", "shuffle:all"],
  },
  {
    id: "remotion",
    label: "Remotion Studio / 部署",
    scripts: ["remotion", "remotion:deploy"],
  },
  {
    id: "login",
    label: "平台登录（Playwright）",
    scripts: [
      "login:bilibili",
      "login:douyin",
      "login:kuaishou",
      "login:rednote",
      "login:weixin-video",
      "login:youtube",
    ],
  },
  {
    id: "upload",
    label: "平台上传（Playwright）",
    scripts: [
      "upload:bilibili",
      "upload:douyin",
      "upload:kuaishou",
      "upload:rednote",
      "upload:weixin-video",
      "upload:youtube",
      "upload:all",
    ],
  },
];

export const SCRIPT_LABEL_ZH: Partial<Record<string, string>> = {
  "check:setup": "检查本地依赖与环境",
  "install:project": "安装项目依赖",
  lint: "ESLint 检查",
  build: "Next 生产构建",
  "render:all": "TTS + 渲染（与 pipeline:tts-render 相同）",
  "pipeline:tts-render": "口播流水线：TTS 后渲染",
  "pipeline:zhihu-video": "知乎抓取到成片流水线",
  "video:zhihu": "同上（别名）",
  tts: "仅运行 TTS",
  "render:video": "按脚本渲染视频",
  "render:composition": "渲染指定 Composition",
  render: "Remotion CLI render",
  "sync:public": "同步 output 到 public",
  "spider:zhihu": "知乎抓取",
  "spider:extract:file": "从文件提取结构化 JSON",
  "spider:extract:url": "从 URL 提取结构化 JSON",
  "caption:env": "生成字幕环境（caption CLI）",
  "shuffle:bg-video": "随机 bg 视频",
  "shuffle:bgm": "随机 BGM",
  "shuffle:ppt-bg": "随机 PPT 背景图（0.png）",
  "shuffle:all": "同时洗牌视频、BGM 与 PPT 背景",
  remotion: "Remotion Studio",
  "remotion:deploy": "Lambda 部署脚本",
  start: "Next 生产启动",
  "login:bilibili": "B 站登录（有头浏览器）",
  "login:douyin": "抖音登录",
  "login:kuaishou": "快手登录",
  "login:rednote": "小红书登录",
  "login:weixin-video": "视频号登录",
  "login:youtube": "YouTube 登录",
  "upload:bilibili": "上传 B 站",
  "upload:douyin": "上传抖音",
  "upload:kuaishou": "上传快手",
  "upload:rednote": "上传小红书",
  "upload:weixin-video": "上传视频号",
  "upload:youtube": "上传 YouTube",
  "upload:all": "依次多平台上传统一入口",
};

const PLAYWRIGHT_EXTRA_PRESETS: ScriptParamPreset[] = [
  { label: "无额外参数", args: [] },
  { label: "Playwright：仅重试失败用例", args: ["--last-failed"] },
];

/**
 * Quick-fill presets shown on the runner page. Args are forwarded after `pnpm run <script> --`.
 */
const SCRIPT_PARAM_PRESETS_CORE: Partial<
  Record<string, ScriptParamPreset[]>
> = {
  lint: [
    { label: "无额外参数（eslint .）", args: [] },
    { label: "仅检查 src", args: ["src"] },
    { label: "仅检查 src/app", args: ["src/app"] },
  ],
  build: [{ label: "无额外参数", args: [] }],
  render: [
    { label: "无额外参数", args: [] },
    { label: "查看 remotion render 帮助", args: ["--help"] },
  ],
  remotion: [
    { label: "无额外参数（默认 studio）", args: [] },
    { label: "指定端口 3333", args: ["--port=3333"] },
  ],
  "spider:extract:file": [
    {
      label: "示例：替换为你的文件路径",
      args: ["./path/to/article.html"],
    },
  ],
  "spider:extract:url": [
    {
      label: "示例：替换为真实 URL",
      args: ["https://zhuanlan.zhihu.com/p/0000000"],
    },
  ],
};

export const SCRIPT_PARAM_PRESETS: Partial<Record<string, ScriptParamPreset[]>> =
  (() => {
    const out: Partial<Record<string, ScriptParamPreset[]>> = {
      ...SCRIPT_PARAM_PRESETS_CORE,
    };
    const loginScripts = [
      "login:bilibili",
      "login:douyin",
      "login:kuaishou",
      "login:rednote",
      "login:weixin-video",
      "login:youtube",
    ];
    const uploadScripts = [
      "upload:bilibili",
      "upload:douyin",
      "upload:kuaishou",
      "upload:rednote",
      "upload:weixin-video",
      "upload:youtube",
      "upload:all",
    ];
    for (const name of loginScripts) {
      out[name] = PLAYWRIGHT_EXTRA_PRESETS;
    }
    for (const name of uploadScripts) {
      out[name] = PLAYWRIGHT_EXTRA_PRESETS;
    }
    return out;
  })();

export function buildScriptOptions(allowedNames: string[]) {
  const allowed = new Set(allowedNames);
  const grouped: {
    label: string;
    scripts: { name: string; hint?: string }[];
  }[] = [];

  for (const g of SCRIPT_GROUP_ORDER) {
    const scripts = g.scripts
      .filter((n) => allowed.has(n))
      .map((name) => ({
        name,
        hint: SCRIPT_LABEL_ZH[name],
      }));
    if (scripts.length > 0) {
      grouped.push({ label: g.label, scripts });
    }
  }

  const listed = new Set(SCRIPT_GROUP_ORDER.flatMap((g) => g.scripts));
  const remainder = allowedNames
    .filter((n) => !listed.has(n))
    .map((name) => ({ name, hint: SCRIPT_LABEL_ZH[name] }));

  if (remainder.length > 0) {
    grouped.push({ label: "其他", scripts: remainder });
  }

  return grouped;
}

export function collectParamPresetsForScripts(
  scriptNames: string[],
): Partial<Record<string, ScriptParamPreset[]>> {
  const out: Partial<Record<string, ScriptParamPreset[]>> = {};
  for (const name of scriptNames) {
    const p = SCRIPT_PARAM_PRESETS[name];
    if (p && p.length > 0) {
      out[name] = p;
    }
  }
  return out;
}
