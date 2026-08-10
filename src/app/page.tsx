import Link from "next/link";
import Image from "next/image";
import { Github, Lightbulb } from "lucide-react";
import Footer from "../components/Footer";

const mediaFiles = [
  { id: "douyin", path: "/media/douyin.webp", label: "抖音 · 熊猫智研社" },
  { id: "weichat", path: "/media/weichat.webp", label: "微信视频号 · 熊猫智研社" },
  { id: "kuaishou", path: "/media/kuaishou.webp", label: "快手 · 熊猫智研社" },
  { id: "bilibili", path: "/media/bilibili.webp", label: "哔哩哔哩 · 熊猫智研社" },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%, rgba(251, 191, 36, 0.14), transparent_55%), radial-gradient(ellipse_80%_50%_at_100%_50%, rgba(34, 211, 238, 0.08), transparent_50%), radial-gradient(ellipse_70%_60%_at_0%_80%, rgba(192, 132, 252, 0.07), transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255, 255, 255, 0.028)_1px, transparent_1px), linear-gradient(90deg, rgba(255, 255, 255, 0.028)_1px, transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%, black_15%, transparent_70%)]"
        aria-hidden
      />

      {/* Terminal-style header */}
      <header className="border-b border-white/[0.06] bg-zinc-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
          <span className="text-emerald-400 font-mono text-sm">❯</span>
          <span className="font-mono text-sm tracking-tight text-zinc-300">
            PandaVideoAutomations
          </span>
          <span className="hidden h-5 w-0.5 animate-cursor-blink bg-zinc-400 sm:inline-block" />
        </div>
      </header>

      {/* Main content — fill remaining viewport */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Page title */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="px-1 font-mono text-3xl font-bold tracking-tight text-zinc-50 sm:text-3xl md:text-4xl">
            <span className="text-amber-400">Panda</span>
            <span className="text-zinc-300">Video</span>
            <span className="text-yellow-200">Automations</span>
          </h1>
          <p className="mt-2 font-mono text-sm text-zinc-600 sm:text-base">
            熊猫视频自动化引擎
          </p>
        </div>

        {/* Cards fill most of the available height */}
        <div className="grid w-full max-w-5xl flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* PandaVideoGenerator card */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#2a1f0f] to-[#1a140e] shadow-[0_0_0_1px_rgba(251, 191, 36, 0.06)_inset] transition-all duration-500 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/30 before:to-transparent hover:border-amber-500/40 hover:shadow-[0_32px_100px_-24px_rgba(251, 191, 36, 0.25)] sm:p-12 motion-reduce:transform-none motion-reduce:hover:transform-none">
            <Link href="/landing" className="flex flex-1 flex-col items-center px-1 py-4 sm:p-0">
              <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5 font-mono text-[0.6rem] text-zinc-600 sm:text-[0.7rem]">
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#傻瓜式</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#视频生成</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#自动化向导</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#Agent</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#Web</span>
              </div>
              <div className="relative my-3">
                <div
                  className="pointer-events-none absolute inset-[-28%] rounded-[2rem] bg-gradient-to-tr from-amber-500/35 via-cyan-500/22 to-fuchsia-500/28 blur-3xl motion-reduce:opacity-50"
                  aria-hidden
                />
                <div className="relative rounded-2xl bg-zinc-100 p-3 shadow-md shadow-black/40 ring-1 ring-zinc-300/90 motion-safe:animate-hero-float sm:p-4 motion-reduce:animate-none">
                  <Image
                    src="/logo/logo.png"
                    alt="Panda Video Generator Logo"
                    width={200}
                    height={200}
                    className="size-[5.25rem] object-contain sm:size-[8.25rem] md:size-[9rem]"
                  />
                </div>
              </div>

              <h2 className="mb-1 font-mono text-xl font-bold tracking-tight text-zinc-50 sm:text-2xl md:text-3xl">
                <span className="text-zinc-400">PVA</span>
                <span className="text-amber-300">-Generator</span>
              </h2>

              <div className="mt-4 flex flex-nowrap items-center justify-center gap-0 overflow-x-auto font-mono text-[0.6rem] sm:text-xs">
                <span className="rounded-l bg-amber-900/40 px-1.5 py-0.5 text-amber-300">① 抓取</span>
                <span className="bg-zinc-900/80 px-1 py-0.5 text-zinc-600">→</span>
                <span className="bg-amber-900/40 px-1.5 py-0.5 text-amber-300">② 脚本</span>
                <span className="bg-zinc-900/80 px-1 py-0.5 text-zinc-600">→</span>
                <span className="bg-amber-900/40 px-1.5 py-0.5 text-amber-300">③ 渲染</span>
                <span className="bg-zinc-900/80 px-1 py-0.5 text-zinc-600">→</span>
                <span className="rounded-r bg-emerald-900/40 px-1.5 py-0.5 text-emerald-300">④ 发布</span>
              </div>

              <p className="mt-4 max-w-xs text-center font-mono text-xs leading-relaxed text-zinc-500 sm:text-sm">
                超级简单的傻瓜式视频生成器
              </p>
            </Link>
            <div className="flex flex-col gap-2 mx-4 mb-4 sm:mx-0 sm:mb-0 mt-4 sm:mt-6">
              <Link
                href="/landing"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 font-mono text-xs font-semibold text-amber-300 transition-all hover:bg-amber-500/20 hover:text-amber-200"
              >
                🚀 功能介绍 →
              </Link>
              <a
                href="https://github.com/szhshp/panda-video-generator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 font-mono text-xs font-semibold text-zinc-300 transition-all hover:bg-white/[0.12] hover:text-white"
              >
                <Github size={15} />
                szhshp/panda-video-generator
              </a>
            </div>
          </div>

          {/* publisher-cli card */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-[#142918] to-[#0f1a12] shadow-[0_0_0_1px_rgba(16, 185, 129, 0.06)_inset] transition-all duration-500 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-emerald-400/30 before:to-transparent hover:border-emerald-500/40 hover:shadow-[0_32px_100px_-24px_rgba(16, 185, 129, 0.25)] sm:p-12 motion-reduce:transform-none motion-reduce:hover:transform-none">
            <Link href="/cli" className="flex flex-1 flex-col items-center px-1 py-4 sm:p-0">
              <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5 font-mono text-[0.6rem] text-zinc-600 sm:text-[0.7rem]">
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#CLI 工具</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#浏览器自动化</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#支持多自媒体平台</span>
              </div>
              <div className="relative my-3">
                <div
                  className="pointer-events-none absolute inset-[-28%] rounded-[2rem] bg-gradient-to-tr from-amber-500/35 via-cyan-500/22 to-fuchsia-500/28 blur-3xl motion-reduce:opacity-50"
                  aria-hidden
                />
                <div className="relative rounded-2xl bg-zinc-100 p-3 shadow-md shadow-black/40 ring-1 ring-zinc-300/90 motion-safe:animate-hero-float sm:p-4 motion-reduce:animate-none">
                  <Image
                    src="/logo/pva-cli.png"
                    alt="Panda Video Automation Publisher Logo"
                    width={200}
                    height={200}
                    className="size-[5.25rem] object-contain sm:size-[8.25rem] md:size-[9rem]"
                  />
                </div>
              </div>

              <h2 className="mb-1 font-mono text-xl font-bold tracking-tight text-zinc-50 sm:text-2xl md:text-3xl">
                <span className="text-zinc-400">PVA</span>
                <span className="text-emerald-500">-CLI</span>
              </h2>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-0 font-mono text-[0.6rem] sm:text-xs">
                <span className="rounded-l bg-emerald-900/40 px-1.5 py-0.5 text-emerald-300">① 任意前置步骤</span>
                <span className="bg-zinc-900/80 px-1 py-0.5 text-zinc-600">→</span>
                <span className="rounded-r bg-emerald-900/40 px-1.5 py-0.5 text-emerald-300">② 发布</span>
              </div>

              <p className="mt-4 max-w-xs text-center font-mono text-xs leading-relaxed text-zinc-500 sm:text-sm">
                视频自动化发布CLI
              </p>
            </Link>
            <div className="flex flex-col gap-2 mx-4 mb-4 sm:mx-0 sm:mb-0 mt-4 sm:mt-6">
              <Link
                href="/cli"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 font-mono text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 hover:text-emerald-200"
              >
                📖 使用说明 →
              </Link>
              <a
                href="https://github.com/szhshp/panda-video-automations-publisher"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 font-mono text-xs font-semibold text-zinc-300 transition-all hover:bg-white/[0.12] hover:text-white"
              >
                <Github size={15} />
                szhshp/panda-video-automations-publisher
              </a>
            </div>
          </div>

          {/* NotebookLM card */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-purple-900/40 bg-gradient-to-b from-[#22182e] to-[#150f1a] shadow-[0_0_0_1px_rgba(168, 85, 247, 0.06)_inset] transition-all duration-500 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-purple-400/30 before:to-transparent hover:border-purple-500/40 hover:shadow-[0_32px_100px_-24px_rgba(168, 85, 247, 0.25)] sm:p-12 motion-reduce:transform-none motion-reduce:hover:transform-none">
            <div className="flex flex-1 flex-col items-center px-1 py-4 sm:p-0">

              <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5 font-mono text-[0.6rem] text-zinc-600 sm:text-[0.7rem]">
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#NotebookLM</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#PPT</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#视频讲解</span>
              </div>
              <div className="relative my-3">
                <div
                  className="pointer-events-none absolute inset-[-28%] rounded-[2rem] bg-gradient-to-tr from-amber-500/35 via-cyan-500/22 to-fuchsia-500/28 blur-3xl motion-reduce:opacity-50"
                  aria-hidden
                />
                <div className="relative rounded-2xl bg-zinc-100 p-3 shadow-md shadow-black/40 ring-1 ring-zinc-300/90 motion-safe:animate-hero-float sm:p-4 motion-reduce:animate-none">
                  <Image
                    src="/logo/pva-notebooklm.png"
                    alt="Panda Video Automation NotebookLM Logo"
                    width={200}
                    height={200}
                    className="size-[5.25rem] object-contain sm:size-[8.25rem] md:size-[9rem]"
                  />
                </div>
              </div>

              <h2 className="mb-1 font-mono text-xl font-bold tracking-tight text-zinc-50 sm:text-2xl md:text-3xl">
                <span className="text-zinc-400">PVA-</span>
                <span className="text-purple-300">NotebookLM</span>
              </h2>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-0 font-mono text-[0.6rem] sm:text-xs">
                <span className="rounded-l bg-purple-900/40 px-1.5 py-0.5 text-purple-300">① 主题</span>
                <span className="bg-zinc-900/80 px-1 py-0.5 text-zinc-600">→</span>
                <span className="bg-purple-900/40 px-1.5 py-0.5 text-purple-300">② 研究</span>
                <span className="bg-zinc-900/80 px-1 py-0.5 text-zinc-600">→</span>
                <span className="bg-purple-900/40 px-1.5 py-0.5 text-purple-300">③ 生成讲解视频</span>
                <span className="bg-zinc-900/80 px-1 py-0.5 text-zinc-600">→</span>
                <span className="rounded-r bg-emerald-900/40 px-1.5 py-0.5 text-emerald-300">④ 发布</span>
              </div>

              <p className="mt-4 max-w-xs text-center font-mono text-xs leading-relaxed text-zinc-500 sm:text-sm">
                AI PPT 讲解视频生成器: 输入主题, 输出包含 PPT 和讲解视频的完整课程
              </p>

              <div className="grow min-h-3" />
              <div className="flex w-full flex-col gap-2 mt-4 sm:mt-6">
                <Link
                  href="/notebooklm"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 font-mono text-xs font-semibold text-purple-300 transition-all hover:bg-purple-500/20 hover:text-purple-200"
                >
                  📖 使用说明 →
                </Link>
                <a
                  href="https://github.com/szhshp/panda-video-automation-notebooklm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 font-mono text-xs font-semibold text-zinc-300 transition-all hover:bg-white/[0.12] hover:text-white"
                >
                  <Github size={15} />
                  szhshp/panda-video-automation-notebooklm
                </a>
              </div>
            </div>
          </div>

          {/* Suno card */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/50 bg-gradient-to-b from-[#18181b] to-[#131315] shadow-[0_0_0_1px_rgba(113, 113, 122, 0.04)_inset] transition-all duration-500 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-zinc-600/20 before:to-transparent hover:border-zinc-600/40 hover:shadow-[0_32px_100px_-24px_rgba(113, 113, 122, 0.12)] sm:p-12 motion-reduce:transform-none motion-reduce:hover:transform-none brightness-[0.8] saturate-[0.45]">
            <div className="flex flex-1 flex-col items-center px-1 py-4 sm:p-0">
              {/* Under development badge */}
              <div className="absolute right-3 top-3 rounded-full border border-zinc-700/30 bg-zinc-900/60 px-2.5 py-0.5 font-mono text-[0.6rem] text-zinc-500/80 sm:right-4 sm:top-4">
                开发中
              </div>

              <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5 font-mono text-[0.6rem] text-zinc-600 sm:text-[0.7rem]">
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#AI 音乐</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#Suno</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">#生成式</span>
              </div>
              <div className="relative my-3">
                <div
                  className="pointer-events-none absolute inset-[-28%] rounded-[2rem] bg-gradient-to-tr from-zinc-500/25 via-zinc-400/10 to-zinc-500/25 blur-3xl motion-reduce:opacity-50"
                  aria-hidden
                />
                <div className="relative rounded-2xl bg-zinc-600/30 p-3 shadow-md shadow-black/40 ring-1 ring-zinc-500/30 motion-safe:animate-hero-float sm:p-4 motion-reduce:animate-none">
                  <Image
                    src="/logo/pva-suno-gray.png"
                    alt="Panda Video Automation Suno Logo"
                    width={200}
                    height={200}
                    className="size-[5.25rem] object-contain sm:size-[8.25rem] md:size-[9rem]"
                  />
                </div>
              </div>

              <h2 className="mb-1 font-mono text-xl font-bold tracking-tight text-zinc-50 sm:text-2xl md:text-3xl">
                <span className="text-zinc-500">PVA-</span>
                <span className="text-zinc-400">Suno</span>
              </h2>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-0 font-mono text-[0.6rem] sm:text-xs">
                <span className="rounded-l bg-zinc-800/60 px-1.5 py-0.5 text-zinc-400">① 生成</span>
                <span className="bg-zinc-900/80 px-1 py-0.5 text-zinc-700">→</span>
                <span className="rounded-r bg-zinc-800/60 px-1.5 py-0.5 text-zinc-400">② 发布</span>
              </div>

              <p className="mt-4 max-w-xs text-center font-mono text-xs leading-relaxed text-zinc-600 sm:text-sm">
                AI 音乐创作: 通过文字描述生成完整曲目, 灵感即刻成曲
              </p>

              <div className="grow min-h-3" />
              <span className="mt-2 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-xs font-semibold text-zinc-700 transition-all">
                即将推出 →
              </span>
            </div>
          </div>

          {/* Submit idea card */}
          <a
            href="https://github.com/szhshp/panda-video-generator/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-sky-900/30 bg-gradient-to-b from-[#0f172a] to-[#0a0f1a] shadow-[0_0_0_1px_rgba(14, 165, 233, 0.05)_inset] transition-all duration-500 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-sky-400/20 before:to-transparent hover:border-sky-500/30 hover:shadow-[0_32px_100px_-24px_rgba(14, 165, 233, 0.2)] sm:p-12 lg:col-span-2 motion-reduce:transform-none motion-reduce:hover:transform-none"
          >
            <div className="flex flex-col items-center p-8 sm:flex-row sm:gap-6 sm:p-0">
              <div className="mb-4 inline-flex size-14 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300/80 ring-1 ring-sky-500/15 sm:mb-0 sm:size-16">
                <Lightbulb className="size-7 sm:size-8" strokeWidth={1.5} />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="font-mono text-lg font-bold tracking-tight text-zinc-50 sm:text-xl">
                  <span className="text-sky-400">新的想法?</span>
                </h2>
                <p className="mt-1 font-mono text-xs leading-relaxed text-zinc-500 sm:text-sm">
                  有新功能的想法? 遇到了什么痛点? 来提个 Issue, 反正开发者生无所恋并且闲得蛋疼, 不如来搞点好玩儿的东西吧 :D
                </p>
              </div>
              <span className="mt-4 flex shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 font-mono text-xs font-semibold text-zinc-300 transition-all group-hover:bg-white/[0.12] group-hover:text-white sm:ml-auto sm:mt-0">
                提交 Issue →
              </span>
            </div>
          </a>
        </div>

      </main>

      {/* Platform Screenshots */}
      <section className="container mx-auto px-8 py-14 sm:px-6 sm:py-20">
        <div
          className="mb-10 h-px w-full bg-gradient-to-r from-transparent via-zinc-600/80 to-transparent sm:mb-12"
          aria-hidden
        />
        <div className="text-center px-2">
          <p className="mb-3 font-mono text-[0.7rem] font-medium tracking-wide text-amber-500/90 sm:text-xs">
            平台矩阵
          </p>
          <h2 className="font-mono text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl md:text-5xl">
            平台示例
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-mono text-sm leading-relaxed text-zinc-400 sm:text-base">
            看看开发者上传的几百个视频成品吧~
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 md:grid-cols-4">
          {mediaFiles.map((file) => (
            <div
              key={file.id}
              className="group overflow-hidden rounded-2xl border border-white/20 bg-zinc-900/60 shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-[0_28px_70px_-28px_rgba(251,191,36,0.18)] motion-reduce:transform-none"
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
                  className="object-contain"
                />
              </div>
              <div className="border-t border-zinc-800/80 bg-zinc-950/40 px-3 py-3 text-center sm:px-4 sm:py-4">
                <p className="text-sm font-medium text-zinc-100">{file.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
