---
name: kill-pnpm-processes
description: >-
  Stops Node-invoked pnpm scripts on macOS/Linux and cleans common Remotion render orphans
  (remotion-cli, esbuild service, compositor). Primary trigger: clean bg process (or clean
  background processes). Also applies when killing background pnpm, stopping stuck
  renders/pipelines, or clearing ports after Ctrl-C left children running.
---

# Kill pnpm and related child processes

## When to use

- User phrasing such as **clean bg process** / **clean background processes** (same workflow).
- Long-running **`pnpm run …`**, **`pnpm exec …`**, or **`pnpm pipeline:…`** stuck or left in the background.
- After terminating the parent shell, **Remotion** may keep **`remotion-cli`**, **esbuild** `--service`, or **compositor** processes alive; clean those too.

## What gets matched (pnpm)

Node runs pnpm as:

`node …/bin/pnpm <subcommand> …`

Match the **`pnpm` binary path** with a trailing space so **`PATH=…/pnpm:…`** in unrelated commands is not killed:

```bash
pgrep -fl "/bin/pnpm "
```

Stop gracefully, then force:

```bash
pkill -TERM -f "/bin/pnpm "
sleep 2
pkill -9 -f "/bin/pnpm " 2>/dev/null
pgrep -fl "/bin/pnpm " || echo "No pnpm wrapper processes"
```

On Linux, pnpm may live under **`…/nodejs/…/bin/pnpm`**; the pattern **`/bin/pnpm `** still matches standard installs. If nothing matches, list with **`ps aux | grep pnpm`** and adjust the `-f` pattern.

## Orphans after `pnpm exec remotion render` (or similar)

Killing only the **`pnpm`** wrapper can leave children running. Inspect:

```bash
pgrep -fl "remotion-cli\\.js|@remotion/compositor|esbuild.*--service"
```

Confirm command lines refer to **this repo** (path contains **`remotion-next`** or the user’s cwd), then:

```bash
# Replace PIDs after inspection, or use pkill -f with a repo-specific path substring.
kill -TERM <pid1> <pid2> …
sleep 1
kill -9 <pid1> <pid2> … 2>/dev/null   # only if still alive
```

Prefer **SIGTERM** first so Remotion can wind down; **SIGKILL** only if needed.

## Do not kill by mistake

- **Playwright** (`@playwright/test/cli.js`), **`npm exec …`**, and other tools may mention **`pnpm`** only in **PATH**; they are **not** matched by **`/bin/pnpm `**.
- Broad patterns like **`pkill pnpm`** can hit unrelated processes; stick to **`/bin/pnpm `** for the wrapper.

## Verification

```bash
pgrep -fl "/bin/pnpm " || true
pgrep -fl "remotion-cli\\.js" || true
```

Empty output (or only unrelated lines after manual review) means cleanup is done.
