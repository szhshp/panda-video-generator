"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Compass,
  ExternalLink,
  Github,
  Globe,
  Terminal,
  Video,
  Upload,
} from "lucide-react";
import { defaultMyCompProps } from "../../types/constants";

// Emoji labels aligned with README (Unicode escapes keep the file encoding-safe)
const readmeEmoji = {
  spider: "\u{1F577}\uFE0F",
  clapper: "\u{1F3AC}",
  rocket: "\u{1F680}",
  robot: "\u{1F916}",
  compass: "\u{1F9ED}",
  cli: "\u{1F4BB}",
} as const;

// Media files in /public/media directory
const mediaFiles = [
  { id: "douyin", path: "/media/douyin.webp", label: "抖音 · 熊猫智研社" },
  { id: "weichat", path: "/media/weichat.webp", label: "微信视频号 · 熊猫智研社" },
  { id: "kuaishou", path: "/media/kuaishou.webp", label: "快手 · 熊猫智研社" },
  { id: "bilibili", path: "/media/bilibili.webp", label: "哔哩哔哩 · 熊猫智研社" },
  { id: "rednote", path: "/media/rednote.webp", label: "小红书 · 熊猫智研社" },
];

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

const featureCardClass =
  "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-zinc-900/80 to-zinc-950/95 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] transition-[transform,box-shadow,border-color] duration-500 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/40 before:to-transparent hover:-translate-y-1 hover:border-amber-500/20 hover:shadow-[0_24px_80px_-20px_rgba(251,191,36,0.22),0_0_60px_-24px_rgba(34,211,238,0.12)] sm:p-7 motion-reduce:transform-none motion-reduce:hover:transform-none";

const pathCardClass =
  "relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-950/50 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-500 before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-cyan-500/0 before:via-cyan-400/35 before:to-fuchsia-500/0 hover:-translate-y-0.5 hover:border-cyan-500/25 hover:shadow-[0_20px_60px_-24px_rgba(34,211,238,0.2)] sm:p-7 motion-reduce:transform-none";

const videoFrameClass =
  "relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.14] via-white/[0.06] to-white/[0.03] p-px shadow-[0_0_80px_-20px_rgba(251,191,36,0.15)]";

const videoInnerClass =
  "relative w-full overflow-hidden rounded-[0.9rem] border border-zinc-800/90 bg-black shadow-inner shadow-black/60";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(251,191,36,0.14),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(34,211,238,0.08),transparent_50%),radial-gradient(ellipse_70%_60%_at_0%_80%,rgba(192,132,252,0.07),transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 animate-hero-orb opacity-90 motion-reduce:animate-none"
        aria-hidden
      >
        <div className="absolute -left-32 top-1/4 size-[420px] rounded-full bg-amber-500/15 blur-[100px]" />
        <div className="absolute -right-24 top-1/3 size-[380px] rounded-full bg-cyan-500/12 blur-[90px]" />
        <div className="absolute bottom-1/4 left-1/3 size-[360px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black_15%,transparent_70%)]"
        aria-hidden
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/75 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-zinc-950/65">
        <nav className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 ring-1 ring-zinc-300/80 sm:size-10">
              <Image
                src="/logo/logo.png"
                alt="Panda Video Generator Logo"
                width={40}
                height={40}
                className="size-7 rounded-md object-contain sm:size-9"
              />
            </span>
            <span className="max-w-[140px] truncate font-mono text-base font-semibold text-zinc-50 sm:max-w-none sm:text-xl">
              {defaultMyCompProps.title}
            </span>
          </div>
          <Link
            href="https://github.com/szhshp/panda-video-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-100 shadow-sm transition-[background,box-shadow,transform] hover:scale-[1.02] hover:bg-white/[0.08] hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.12)] sm:gap-2 sm:px-4 sm:py-2 sm:text-base motion-reduce:hover:scale-100"
          >
            <Github size={18} className="sm:size-5" />
            <span className="hidden sm:inline">GitHub</span>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pb-12 pt-10 text-center sm:px-6 sm:pb-20 sm:pt-14 md:pt-20">
        <div className="mb-8 flex justify-center sm:mb-10">
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-[-28%] rounded-[2rem] bg-gradient-to-tr from-amber-500/35 via-cyan-500/22 to-fuchsia-500/28 blur-3xl motion-reduce:opacity-50"
              aria-hidden
            />
            <div className="relative rounded-2xl bg-zinc-100 p-4 shadow-md shadow-black/40 ring-1 ring-zinc-300/90 motion-safe:animate-hero-float sm:p-5 md:p-6 motion-reduce:animate-none">
              <Image
                src="/logo/logo.png"
                alt="Panda Video Generator Logo"
                width={200}
                height={200}
                priority
                className="size-28 object-contain sm:size-44 md:size-48"
              />
            </div>
          </div>
        </div>
        <p className="mb-3 font-mono text-[0.7rem] font-medium tracking-wide text-amber-500/90 sm:text-xs">
          端到端 · 视频自动化
        </p>
        <h1 className="mx-auto max-w-4xl min-w-0 px-3 font-mono text-2xl font-bold leading-[1.15] tracking-tight break-words sm:px-4 sm:text-4xl sm:leading-[1.12] md:text-5xl lg:text-6xl">
          <span className="text-amber-400">Panda</span>
          <span className="text-zinc-50">Video</span>
          <span className="text-zinc-200">Generator</span>
        </h1>
        <p className="mt-4 font-mono text-lg font-medium text-zinc-400 sm:text-xl md:text-2xl">
          熊猫视频自动化引擎
        </p>
        <p className="mx-auto mt-3 max-w-2xl px-2 font-mono text-sm italic text-zinc-500 sm:text-base md:text-lg">
          <span className="text-zinc-500 not-italic">&gt; </span>
          Developer-first video automation engine.
        </p>
        <p className="mx-auto mt-6 max-w-3xl px-2 text-sm leading-relaxed text-zinc-400 sm:text-base md:text-lg">
          一站式全自动化的视频内容生成与发布引擎，支持从网页内容提取、文本转视频到多平台发布的完整工作流。通过
          AI 驱动的文本转语音（TTS）技术和视频渲染引擎，帮助内容创作者快速生成高质量视频并一键发布到多个平台。
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 px-2 sm:mt-12 sm:gap-4">
          <Link
            href="https://github.com/szhshp/panda-video-generator?tab=readme-ov-file#-%E6%A0%B8%E5%BF%83%E7%89%B9%E6%80%A7"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 rounded-xl bg-app-cta px-6 py-2.5 text-sm font-semibold text-app-cta-foreground shadow-[0_0_40px_-8px_rgba(239,68,68,0.55)] transition-[transform,filter] hover:scale-[1.03] hover:bg-app-cta-hover hover:shadow-[0_0_52px_-6px_rgba(239,68,68,0.65)] sm:min-h-12 sm:px-7 sm:py-3 sm:text-base motion-reduce:hover:scale-100"
          >
            开始使用
          </Link>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="https://github.com/szhshp/panda-video-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-[#0969da] bg-[#0969da]/10 px-6 py-2.5 text-sm font-bold text-sky-300 shadow-[0_0_32px_-8px_rgba(9,105,218,0.55)] transition-[transform,box-shadow,background-color] hover:scale-[1.03] hover:bg-[#0969da]/20 hover:shadow-[0_0_48px_-6px_rgba(9,105,218,0.65)] sm:min-h-12 sm:px-7 sm:py-3 sm:text-base motion-reduce:hover:scale-100"
              title="在 GitHub 打开仓库"
            >
              <Github size={18} className="shrink-0 sm:size-5" />
              <span>GitHub</span>
            </Link>
            <Link
              href="https://github.com/szhshp/panda-video-automations-publisher"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-emerald-600/10 px-6 py-2.5 text-sm font-bold text-emerald-300 shadow-[0_0_32px_-8px_rgba(16,185,129,0.55)] transition-[transform,box-shadow,background-color] hover:scale-[1.03] hover:bg-emerald-600/20 hover:shadow-[0_0_48px_-6px_rgba(16,185,129,0.65)] sm:min-h-12 sm:px-7 sm:py-3 sm:text-base motion-reduce:hover:scale-100"
              title="在 GitHub 打开 Publisher 仓库"
            >
              <ExternalLink size={18} className="shrink-0 sm:size-5" />
              <span>CLI 工具 (可用于自行集成)</span>
            </Link>
          </div>
        </div>
      </section>


      {/* Features — distinct product cards (not pipeline / mono spec style) */}
      <section className="container mx-auto px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle eyebrow="产品亮点" title="核心特性" />
        <div className="mt-12 grid gap-5 sm:gap-6 md:mt-16 md:grid-cols-3">
          <article className={featureCardClass}>
            <span
              className="pointer-events-none absolute -right-1 -top-6 text-[5.5rem] font-black leading-none tabular-nums text-white/[0.035] transition-colors duration-300 group-hover:text-white/[0.055] sm:text-[6.25rem]"
              aria-hidden
            >
              1
            </span>
            <div
              className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/15 to-cyan-500/10 text-amber-200/90 shadow-inner ring-1 ring-white/10"
              aria-hidden
            >
              <Globe className="size-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">
              {readmeEmoji.spider}{" "}
              <span className="text-yellow-400 font-bold">一键</span>
              网页转文本
            </h3>
            <p className="mt-3 grow text-sm leading-relaxed text-zinc-400">
              一键抓取正文与标题（如知乎），输出结构化文件，少手工整理。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/5 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-300">
                网页提取
              </span>
              <span className="rounded-full border border-white/5 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-300">
                结构化输出
              </span>
            </div>
          </article>

          <article className={featureCardClass}>
            <span
              className="pointer-events-none absolute -right-1 -top-6 text-[5.5rem] font-black leading-none tabular-nums text-white/[0.035] transition-colors duration-300 group-hover:text-white/[0.055] sm:text-[6.25rem]"
              aria-hidden
            >
              2
            </span>
            <div
              className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/15 to-cyan-500/10 text-amber-200/90 shadow-inner ring-1 ring-white/10"
              aria-hidden
            >
              <Video className="size-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">
              {readmeEmoji.clapper}{" "}
              <span className="text-yellow-400 font-bold">一键</span>
              文本转视频
            </h3>
            <p className="mt-3 grow text-sm leading-relaxed text-zinc-400">
              一键跑通口播链路：Edge TTS + VTT 字幕，Remotion 模板渲染成片。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/5 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-300">
                Edge TTS
              </span>
              <span className="rounded-full border border-white/5 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-300">
                Remotion
              </span>
              <span className="rounded-full border border-white/5 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-300">
                字幕 VTT
              </span>
            </div>
          </article>

          <article className={featureCardClass}>
            <span
              className="pointer-events-none absolute -right-1 -top-6 text-[5.5rem] font-black leading-none tabular-nums text-white/[0.035] transition-colors duration-300 group-hover:text-white/[0.055] sm:text-[6.25rem]"
              aria-hidden
            >
              3
            </span>
            <div
              className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/15 to-cyan-500/10 text-amber-200/90 shadow-inner ring-1 ring-white/10"
              aria-hidden
            >
              <Upload className="size-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">
              {readmeEmoji.rocket}{" "}
              <span className="text-yellow-400 font-bold">一键</span>
              多平台发布
            </h3>
            <p className="mt-3 grow text-sm leading-relaxed text-zinc-400">
              一键驱动浏览器自动化上传；B
              站、抖音、视频号、YouTube、小红书、快手等共用相近流程。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/5 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-300">
                Playwright
              </span>
              <span className="rounded-full border border-white/5 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-300">
                网页端上传
              </span>
            </div>
          </article>
        </div>
      </section>

      {/* Onboarding paths — matches README「接入方式」 */}
      <section className="container mx-auto px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle
          eyebrow="三种路径"
          title="接入方式"
          subtitle="任选 Agent、浏览器向导或 CLI，同一套能力不同上手姿势。"
        />
        <div className="mt-12 grid gap-5 sm:gap-6 md:mt-16 md:grid-cols-3">
          <article className={pathCardClass}>
            <div
              className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/10 text-fuchsia-200/90 shadow-inner ring-1 ring-white/10"
              aria-hidden
            >
              <Bot className="size-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">
              {readmeEmoji.robot} 1. Agent Skills 方式
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
              <li>使用 AI Agent 编排视频生成与发布流程。</li>
              <li>支持口播流水线、爬虫、TTS、渲染与发布等技能。</li>
              <li>支持 Cursor、Claude Code、Copilot 等常用 AI Agent。</li>
            </ul>
            <p className="mt-4 text-sm text-zinc-300">
              <a href="#demo-agent" className="text-amber-400/95 hover:text-amber-300 hover:underline">
                演示视频
              </a>
              <span className="text-zinc-600"> / </span>
              <a
                href="https://github.com/szhshp/panda-video-generator#agent-skills"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400/95 hover:text-amber-300 hover:underline"
              >
                查看更多
              </a>
            </p>
          </article>

          <article className={pathCardClass}>
            <div
              className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/10 text-amber-200/90 shadow-inner ring-1 ring-white/10"
              aria-hidden
            >
              <Compass className="size-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">
              {readmeEmoji.compass} 2. 网页端自动化向导方式
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
              <li>
                通过傻瓜式{" "}
                <a
                  href="https://github.com/szhshp/panda-video-generator#wizard-automation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/95 hover:text-amber-300 hover:underline"
                >
                  自动化向导
                </a>
                ，无需手写命令。
              </li>
              <li>在浏览器中按步骤完成文稿、TTS 与成片渲染。</li>
              <li>多平台发布为可选步骤，可按需执行。</li>
            </ul>
            <p className="mt-4 text-sm text-zinc-300">
              <a href="#demo-wizard" className="text-amber-400/95 hover:text-amber-300 hover:underline">
                演示视频
              </a>
              <span className="text-zinc-600"> / </span>
              <a
                href="https://github.com/szhshp/panda-video-generator#wizard-automation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400/95 hover:text-amber-300 hover:underline"
              >
                查看更多
              </a>
            </p>
          </article>

          <article className={pathCardClass}>
            <div
              className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 text-amber-200/90 shadow-inner ring-1 ring-white/10"
              aria-hidden
            >
              <Terminal className="size-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">
              {readmeEmoji.cli} 3. CLI 命令行
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
              <li>与向导共用同一套 pnpm 脚本：爬虫、TTS、Remotion 渲染与发布。</li>
              <li>适合终端操作、自有 CI 或与 shell、cron 等自动化对接。</li>
              <li>
                命令与输出目录见{" "}
                <a
                  href="https://github.com/szhshp/panda-video-generator/blob/main/docs/cli-usage-guide.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/95 hover:text-amber-300 hover:underline"
                >
                  CLI 使用指南
                </a>
                。
              </li>
            </ul>
            <p className="mt-4 text-sm text-zinc-300">
              <a
                href="https://github.com/szhshp/panda-video-generator#cli-usage-guide"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400/95 hover:text-amber-300 hover:underline"
              >
                查看 CLI 使用指南
              </a>
            </p>
          </article>
        </div>
      </section>

      {/* Feature demos — aligned with README: Agent + wizard（CLI 无单独演示视频，见文档） */}
      <section className="container mx-auto px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle
          eyebrow="实机演示"
          title="功能演示"
          subtitle="两段演示对应 Agent 与网页向导；命令行用法见 CLI 使用指南。"
        />
        <div className="mx-auto mt-12 flex max-w-4xl flex-col gap-14 sm:mt-16 sm:gap-16">
          <div id="demo-agent" className="scroll-mt-28">
            <h3 className="mb-2 text-center text-base font-bold text-zinc-100 sm:text-lg">
              功能演示 1 · Agent 使用演示
            </h3>
            <p className="mb-5 text-center text-sm text-zinc-500 sm:text-base">
              《用 AI 的方式一人运营十个自媒体账号》
            </p>
            <div className={videoFrameClass}>
              <div className={`${videoInnerClass} aspect-video`}>
                <iframe
                  title="Panda Video Generator · Agent 使用演示"
                  src="https://player.bilibili.com/player.html?bvid=BV1WXDABGEB7&autoplay=0&danmaku=0"
                  className="absolute inset-0 w-full h-full border-0"
                  scrolling="no"
                  allow="fullscreen; encrypted-media; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
          <div id="demo-wizard" className="scroll-mt-28">
            <h3 className="mb-2 text-center text-base font-bold text-zinc-100 sm:text-lg">
              功能演示 2 · 网页自动化向导
            </h3>
            <p className="mb-5 text-center text-sm text-zinc-500 sm:text-base">
              《用程序员的方式一人运营十个自媒体账号》
            </p>
            <div className={videoFrameClass}>
              <div className={`${videoInnerClass} aspect-video`}>
                <iframe
                  title="Panda Video Generator · 网页自动化向导"
                  src="https://player.bilibili.com/player.html?bvid=BV141XfB3ELj&autoplay=0&danmaku=0"
                  className="absolute inset-0 w-full h-full border-0"
                  scrolling="no"
                  allow="fullscreen; encrypted-media; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Finished work showcase */}
      <section className="container mx-auto px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle eyebrow="成片预览" title="成品展示" />
        <div className="mx-auto mt-12 flex max-w-4xl flex-col gap-14 sm:mt-16 sm:gap-16">
          <div className={videoFrameClass}>
            <div className={`${videoInnerClass} aspect-video`}>
              <iframe
                title="Panda Video Generator 成品展示 1"
                src="https://player.bilibili.com/player.html?bvid=BV1ZnDcBsEK7&autoplay=0&danmaku=0"
                className="absolute inset-0 w-full h-full border-0"
                scrolling="no"
                allow="fullscreen; encrypted-media; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allowFullScreen
              />
            </div>
          </div>
          <div className={videoFrameClass}>
            <div className={`${videoInnerClass} aspect-video`}>
              <iframe
                title="Panda Video Generator 成品展示 2"
                src="https://player.bilibili.com/player.html?bvid=BV19Rw9zwEd4&autoplay=0&danmaku=0"
                className="absolute inset-0 w-full h-full border-0"
                scrolling="no"
                allow="fullscreen; encrypted-media; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Screenshots */}
      <section className="container mx-auto px-4 py-14 sm:px-6 sm:py-20">
        <div
          className="mb-10 h-px w-full bg-gradient-to-r from-transparent via-zinc-600/80 to-transparent sm:mb-12"
          aria-hidden
        />
        <SectionTitle
          eyebrow="平台矩阵"
          title="平台示例"
          subtitle="看看开发者上传的几百个视频成品吧~"
        />
        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3 xl:grid-cols-5">
          {mediaFiles.map((file) => (
            <div
              key={file.id}
              className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/60 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-amber-500/20 hover:shadow-[0_28px_70px_-28px_rgba(251,191,36,0.18)] motion-reduce:transform-none"
            >
              <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-950/60 px-3 py-1.5">
                <span className="max-w-[52%] truncate font-mono text-xs text-zinc-600">
                  {file.id}
                </span>
              </div>
              <div className="relative w-full h-[280px] sm:h-[320px] overflow-hidden bg-zinc-950">
                <Image
                  src={file.path}
                  alt={file.label}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-contain p-2"
                />
              </div>
              <div className="border-t border-zinc-800/80 bg-zinc-950/40 px-3 py-3 text-center sm:px-4 sm:py-4">
                <p className="text-sm font-medium text-zinc-100">{file.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      {/* <section className="container mx-auto px-4 py-16 bg-gray-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          技术栈
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { name: "Next.js 16", color: "bg-black" },
            { name: "React 19", color: "bg-blue-500" },
            { name: "Remotion 4.0", color: "bg-red-600" },
            { name: "TypeScript 5.9", color: "bg-blue-600" },
            { name: "Edge TTS", color: "bg-green-500" },
            { name: "Playwright", color: "bg-green-600" },
          ].map((tech) => (
            <div
              key={tech.name}
              className="bg-white p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow"
            >
              <div className={`${tech.color} h-2 w-full rounded mb-2`}></div>
              <p className="text-sm font-medium text-gray-700">{tech.name}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* Footer */}
      <footer className="container mx-auto mt-8 border-t border-white/[0.06] bg-gradient-to-b from-transparent to-black/40 px-4 py-10 sm:mt-16 sm:px-6 sm:py-14">
        <div className="text-center text-zinc-400 text-sm sm:text-base space-y-4">
          <p>Made with ❤️ by szhshp x 熊猫智研社</p>
          <div className="flex justify-center gap-6 sm:gap-8 flex-wrap items-center">
            <a
              href="https://github.com/szhshp/panda-video-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-zinc-50 underline-offset-4 hover:underline"
            >
              <Github size={18} className="shrink-0" aria-hidden />
              <span>GitHub 仓库</span>
            </a>
            <a
              href="https://szhshp.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-zinc-50 underline-offset-4 hover:underline"
            >
              <ExternalLink size={16} className="shrink-0" aria-hidden />
              <span>开发者博客</span>
            </a>
            <a
              href="https://github.com/szhshp/panda-video-automations-publisher"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-zinc-50 underline-offset-4 hover:underline"
            >
              <Github size={16} className="shrink-0" aria-hidden />
              <span>CLI 工具</span>
            </a>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500">
            © {new Date().getFullYear()} Panda Video Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
