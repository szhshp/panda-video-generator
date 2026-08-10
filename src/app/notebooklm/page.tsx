import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import Footer from "../../components/Footer";

function SectionTitle({
  eyebrow,
  title,
  subtitle,
  className = "",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`text-center px-2 ${className}`}>
      <p className="mb-3 font-mono text-[0.7rem] font-medium tracking-wide text-amber-500/90 sm:text-xs">
        {eyebrow}
      </p>
      <h2 className="font-mono text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-4 max-w-xl font-mono text-sm leading-relaxed text-zinc-400 sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

const codeBlockClass =
  "mt-4 rounded-xl bg-zinc-950 p-4 font-mono text-sm text-zinc-300 border border-white/[0.05]";

const accent =
  "text-violet-300 border-violet-600/40 bg-violet-600/10 hover:bg-violet-600/20";

export default function NotebookLmPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(139,92,246,0.16),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(34,211,238,0.08),transparent_50%),radial-gradient(ellipse_70%_60%_at_0%_80%,rgba(251,191,36,0.06),transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black_15%,transparent_70%)]"
        aria-hidden
      />

      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft size={16} />
          返回首页
        </Link>

        <div className="mx-auto max-w-3xl">
          {/* Hero */}
          <div className="mb-8 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-200/90 shadow-inner ring-1 ring-white/10">
            <Sparkles className="size-7" strokeWidth={1.75} />
          </div>

          <h1 className="font-mono text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl md:text-4xl">
            Panda Video Automation NotebookLM
          </h1>
          <p className="mt-2 font-mono text-base text-violet-400">
            From research notes to published video in one command.
          </p>
          <p className="mt-4 text-lg text-zinc-400">
            把 NotebookLM 里的研究成果一键变成视频，再自动发布到 B 站、抖音、视频号、快手——一条指令全搞定。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="https://github.com/szhshp/panda-video-automation-notebooklm"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors ${accent}`}
            >
              查看 GitHub 仓库
            </Link>
            <Link
              href="https://pypi.org/project/notebooklm-mcp-cli/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-600/40 bg-cyan-600/10 px-5 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-600/20 transition-colors"
            >
              查看 PyPI 包
            </Link>
            <Link
              href="https://panda.szhshp.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-600/40 bg-amber-600/10 px-5 py-2.5 text-sm font-medium text-amber-300 hover:bg-amber-600/20 transition-colors"
            >
              项目主页
            </Link>
          </div>

          {/* Demo Video */}
          <section className="py-14 sm:py-20">
            <SectionTitle
              eyebrow="实机演示"
              title="功能演示"
              subtitle="工作流演示：创建笔记本 → 深度研究 → 视频生成 → 多平台发布全流程"
            />
            <div className="relative mt-12 overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.14] via-white/[0.06] to-white/[0.03] p-px shadow-[0_0_80px_-20px_rgba(139,92,246,0.15)]">
              <div className="relative aspect-video w-full overflow-hidden rounded-[0.9rem] border border-zinc-800/90 bg-black shadow-inner shadow-black/60">
                <iframe
                  title="NotebookLM 功能演示"
                  src="https://player.bilibili.com/player.html?bvid=BV1ZsGU6YEo3&autoplay=0&danmaku=0"
                  className="absolute inset-0 w-full h-full border-0"
                  scrolling="no"
                  allow="fullscreen; encrypted-media; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  allowFullScreen
                />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-zinc-500">
              <a
                href="https://www.bilibili.com/video/BV1ZsGU6YEo3/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 hover:underline"
              >
                在外部页面观看完整视频
              </a>
            </p>
          </section>

          {/* Showcase */}
          <section className="py-14 sm:py-20">
            <SectionTitle
              eyebrow="成品展示"
              title="NotebookLM 成品视频"
              subtitle="研究笔记直接产出的视频成品示例"
            />
            <div className="relative mt-12 overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.14] via-white/[0.06] to-white/[0.03] p-px shadow-[0_0_80px_-20px_rgba(139,92,246,0.15)]">
              <div className="relative aspect-video w-full overflow-hidden rounded-[0.9rem] border border-zinc-800/90 bg-black shadow-inner shadow-black/60">
                <iframe
                  title="NotebookLM 成品展示"
                  src="https://player.bilibili.com/player.html?isOutside=true&aid=117057756599477&bvid=BV13nuM6PErQ&cid=40706247761&p=1"
                  className="absolute inset-0 w-full h-full border-0"
                  scrolling="no"
                  allow="fullscreen; encrypted-media; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  allowFullScreen
                />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-zinc-500">
              <a
                href="https://www.bilibili.com/video/BV13nuM6PErQ/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 hover:underline"
              >
                在外部页面观看完整视频
              </a>
            </p>
          </section>

          {/* Core Features */}
          <section className="py-14 sm:py-20">
            <SectionTitle
              eyebrow="核心特性"
              title="一键全流程"
              subtitle="从研究到发布，全程无需手动操作"
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                {
                  emoji: "📝",
                  title: "一键 NotebookLM 研究",
                  desc: "创建笔记本、深度研究、导入来源，自动完成 NotebookLM 研究流程。",
                },
                {
                  emoji: "🎬",
                  title: "一键视频生成",
                  desc: "从笔记本一键导出视频制品，自动下载并准备上传。",
                },
                {
                  emoji: "🚀",
                  title: "一键多平台发布",
                  desc: "浏览器自动化上传，B 站、抖音、微信视频号、快手全支持。",
                },
              ].map(({ emoji, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-zinc-900/80 to-zinc-950/95 p-5"
                >
                  <div className="text-2xl">{emoji}</div>
                  <h3 className="mt-3 font-semibold text-zinc-200">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Start */}
          <section className="py-14 sm:py-20">
            <SectionTitle
              eyebrow="快速上手"
              title="快速开始"
              subtitle="向 Agent 发送一条指令即可完成完整工作流"
            />
            <div className="mt-12 rounded-2xl border border-white/[0.09] bg-gradient-to-b from-zinc-800/70 to-zinc-900/95 p-6 sm:p-8">
              <h3 className="font-semibold text-zinc-300">一站式流程（推荐）</h3>
              <div className={codeBlockClass}>
                <p className="text-zinc-500">
                  # 深度研究 → 视频生成 → 裁剪 → 封面 → 元数据 → 发布
                </p>
                <p className="text-violet-300">
                  /notebooklm-pipeline 帮我做一个关于「AI 泡沫还能持续多久?」的视频并发布到 B 站和抖音
                </p>
              </div>
              <h3 className="mt-6 font-semibold text-zinc-300">初次使用</h3>
              <p className="mt-1 text-sm text-zinc-400">
                首次使用先运行安装技能，自动安装
                <code className="mx-1 text-violet-400">notebooklm-mcp-cli</code>、
                <code className="mx-1 text-violet-400">@panda-video-automation/pva</code>
                等所有依赖，并引导完成 NotebookLM 登录。
              </p>
              <div className={codeBlockClass}>
                <p className="text-zinc-100">/setup-pva-notebooklm</p>
              </div>
            </div>
          </section>

          {/* Prerequisites */}
          <section className="py-14 sm:py-20">
            <SectionTitle eyebrow="运行环境" title="先决条件" />
            <div className="mt-12 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-zinc-900/80 to-zinc-950/95 p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-zinc-950 p-4 border border-white/[0.05]">
                  <p className="font-mono text-sm text-zinc-100">Python 3</p>
                  <p className="mt-1 text-xs text-zinc-500">notebooklm-mcp-cli</p>
                </div>
                <div className="rounded-xl bg-zinc-950 p-4 border border-white/[0.05]">
                  <p className="font-mono text-sm text-zinc-100">Node.js 20+</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    @panda-video-automation/pva
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-950 p-4 border border-white/[0.05]">
                  <p className="font-mono text-sm text-zinc-100">ffmpeg</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    视频裁剪（brew / apt install ffmpeg）
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="py-14 sm:py-20">
            <SectionTitle
              eyebrow="Agent 技能"
              title="可用技能"
              subtitle="notebooklm-pipeline 一个技能即可完成全部工作"
            />
            <div className="mt-12 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-zinc-900/80 to-zinc-950/95 p-6 sm:p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500">
                      <th className="py-2 pr-4 text-left font-medium">技能</th>
                      <th className="py-2 text-left font-medium">说明</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-300">
                    {[
                      ["notebooklm-pipeline", "[入口] 全流程一站式：研究 → 视频 → 裁剪 → 封面 → 元数据 → 发布"],
                      ["setup-pva-notebooklm", "检查并安装所有前置依赖（Python, Node.js, notebooklm-mcp-cli, PVA）"],
                      ["notebooklm-status", "查看所有笔记本及制品状态"],
                      ["pipeline-status", '报告流水线进度 ✅/⚠️ 清单（响应 "status" / "check progress"）'],
                      ["notebooklm-research", "创建笔记本并执行深度研究（子步骤）"],
                      ["notebooklm-video", "从笔记本生成视频（子步骤）"],
                      ["get-notebooklm-video", "下载视频制品（子步骤）"],
                      ["notebooklm-prep-upload", "准备上传内容到 input/ 文件夹（子步骤）"],
                      ["minimalist-academic-cover", "生成极简学术风格封面（子步骤）"],
                      ["pva-publisher", "跨平台视频上传（子步骤）"],
                    ].map(([name, desc], i) => (
                      <tr
                        key={name}
                        className={`border-b border-white/[0.04] ${i === 0 ? "text-zinc-100" : ""}`}
                      >
                        <td className="py-2 pr-4 font-mono text-violet-400">
                          {name}
                        </td>
                        <td className="py-2">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Pipeline */}
          <section className="py-14 sm:py-20">
            <SectionTitle
              eyebrow="工作流"
              title="完整流水线"
              subtitle="Agent 自动串联所有环节，无需人工干预"
            />
            <div className="mt-12 rounded-2xl border border-violet-600/30 bg-gradient-to-b from-violet-900/20 to-zinc-950/95 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-y-3 gap-x-2 font-mono text-sm text-zinc-300">
                {[
                  "深度研究",
                  "视频生成",
                  "裁剪",
                  "封面",
                  "元数据",
                  "发布",
                ].map((step, i) => (
                  <span key={step} className="inline-flex items-center gap-2">
                    <span className="rounded-lg border border-violet-600/40 bg-violet-600/10 px-3 py-1.5 text-violet-200">
                      {step}
                    </span>
                    {i < 5 ? <span className="text-zinc-600">→</span> : null}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-zinc-400">
                得益于
                <a
                  href="https://github.com/szhshp/panda-video-generator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-1 text-violet-400 hover:text-violet-300 hover:underline"
                >
                  Panda Video Generator
                </a>
                的视频生产流水线，与
                <a
                  href="https://github.com/szhshp/panda-video-automations-publisher"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-1 text-violet-400 hover:text-violet-300 hover:underline"
                >
                  panda-video-automations-publisher
                </a>
                的上传模块。从创建笔记本到多平台发布，一条指令全搞定。
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
