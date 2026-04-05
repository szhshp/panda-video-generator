export type VttCaption = {
  text: string;
  startMs: number;
  endMs: number;
};

/**
 * Parse WebVTT into cues (same rules as legacy Content.tsx parser).
 */
export function parseVttToCaptions(vttText: string): VttCaption[] {
  const lines = vttText.split("\n");
  const captions: VttCaption[] = [];
  let current: Partial<VttCaption> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();

    if (
      line === "WEBVTT" ||
      line.startsWith("STYLE") ||
      line.startsWith("::cue")
    ) {
      continue;
    }

    const timeMatch = line.match(
      /(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})/,
    );
    if (timeMatch) {
      const startMs =
        parseInt(timeMatch[1]!, 10) * 3600000 +
        parseInt(timeMatch[2]!, 10) * 60000 +
        parseInt(timeMatch[3]!, 10) * 1000 +
        parseInt(timeMatch[4]!, 10);
      const endMs =
        parseInt(timeMatch[5]!, 10) * 3600000 +
        parseInt(timeMatch[6]!, 10) * 60000 +
        parseInt(timeMatch[7]!, 10) * 1000 +
        parseInt(timeMatch[8]!, 10);
      current = { startMs, endMs };
      continue;
    }

    if (current && line && !line.includes("-->")) {
      if (current.text) {
        current.text += "\n" + line;
      } else {
        current.text = line;
      }

      const nextLine = i + 1 < lines.length ? lines[i + 1]!.trim() : "";
      if (!nextLine || nextLine.match(/\d{2}:\d{2}:\d{2}\.\d{3}/)) {
        if (
          current.startMs !== undefined &&
          current.endMs !== undefined &&
          current.text
        ) {
          captions.push({
            startMs: current.startMs,
            endMs: current.endMs,
            text: current.text,
          });
          current = null;
        }
      }
    }
  }

  return captions;
}
