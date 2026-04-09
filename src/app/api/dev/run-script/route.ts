import {
  assertScriptAllowed,
  isScriptRunnerEnabled,
  normalizeRunnerArgs,
  pickAllowedPnpmRunEnv,
} from "../../../../lib/dev-script-runner";
import { spawn } from "child_process";
import { z } from "zod";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BodySchema = z.object({
  script: z.string().min(1).max(256),
  args: z.array(z.string()).max(64).optional(),
  env: z.record(z.string()).optional(),
});

function encodeSse(data: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(request: Request) {
  if (!isScriptRunnerEnabled()) {
    return NextResponse.json(
      {
        error:
          "Script runner is only available in development or when ALLOW_SCRIPT_RUNNER=1.",
      },
      { status: 403 },
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    const json = await request.json();
    body = BodySchema.parse(json);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let args: string[];
  try {
    args = normalizeRunnerArgs(body.args);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid args";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let extraEnv: Record<string, string>;
  try {
    extraEnv = pickAllowedPnpmRunEnv(body.env);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid env";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    assertScriptAllowed(body.script);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid script";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const cwd = process.cwd();
  const pnpmBin = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const pnpmArgs = ["run", body.script];
  if (args.length > 0) {
    pnpmArgs.push("--", ...args);
  }

  const childEnv = { ...process.env, ...extraEnv };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const proc = spawn(pnpmBin, pnpmArgs, {
        cwd,
        env: childEnv,
        shell: true,
      });

      const onClientAbort = () => {
        try {
          proc.kill("SIGTERM");
        } catch {
          /* noop */
        }
      };
      request.signal.addEventListener("abort", onClientAbort);

      const safeEnqueue = (chunk: Uint8Array) => {
        try {
          controller.enqueue(chunk);
        } catch {
          /* consumer disconnected */
        }
      };

      proc.stdout.setEncoding("utf8");
      proc.stderr.setEncoding("utf8");

      proc.stdout.on("data", (chunk: string) => {
        safeEnqueue(encodeSse({ type: "stdout", text: chunk }));
      });
      proc.stderr.on("data", (chunk: string) => {
        safeEnqueue(encodeSse({ type: "stderr", text: chunk }));
      });

      proc.on("error", (err) => {
        request.signal.removeEventListener("abort", onClientAbort);
        safeEnqueue(
          encodeSse({
            type: "error",
            message: err.message,
          }),
        );
        try {
          controller.close();
        } catch {
          /* noop */
        }
      });

      proc.on("close", (code, signal) => {
        request.signal.removeEventListener("abort", onClientAbort);
        safeEnqueue(
          encodeSse({
            type: "exit",
            code,
            signal: signal ?? null,
          }),
        );
        try {
          controller.close();
        } catch {
          /* noop */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}