import fs from "node:fs";
import path from "node:path";

/** Writes Remotion props JSON with `{ title }` from spider/public title.json; returns whether file was written. */
export function writeRenderPropsFromTitle(titlePath, outPath) {
  try {
    const data = JSON.parse(fs.readFileSync(titlePath, "utf8"));
    if (data.title) {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(
        outPath,
        JSON.stringify({ title: data.title }, null, 2),
        "utf8",
      );
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/** Props for `PPT-Deck-Cover-Static`: `{ title, subtitle? }` from merged `title.json`. */
export function writePptDeckCoverPropsFromTitle(titlePath, outPath) {
  try {
    const data = JSON.parse(fs.readFileSync(titlePath, "utf8"));
    const title =
      typeof data.title === "string" ? data.title.trim() : "";
    if (!title) return false;
    const payload = { title };
    if (typeof data.subtitle === "string" && data.subtitle.trim()) {
      payload.subtitle = data.subtitle.trim();
    }
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(
      outPath,
      JSON.stringify(payload, null, 2),
      "utf8",
    );
    return true;
  } catch {
    /* ignore */
  }
  return false;
}
