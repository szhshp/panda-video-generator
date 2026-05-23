---
name: notebooklm-prep-upload
description: Prepare a downloaded NotebookLM video for upload: create the title JSON file and move the video to the correct path expected by the Bilibili/Douyin upload e2e scripts.
---

# NotebookLM Prepare Upload

After downloading a NotebookLM video, prepare it for the upload pipeline by creating the metadata JSON and placing the video file in the expected location.

## Context

The upload e2e scripts expect this structure under the project root:

```
output/
  video/
    video.mp4          ← video file
    cover.jpg          ← cover (optional)
  spider/
    title.json         ← {"title": "..."}
```

## Workflow Steps

### Step 1: Gather Input

Ask the user for:
1. **Source video path** — where the downloaded video is located
2. **Video topic or title** (optional) — if the user doesn't provide one, infer the topic from the filename automatically
3. **Description** (optional) — will be set as `VIDEO_DESC` env var
4. **Tags** (optional, comma-separated) — will be set as `VIDEO_TAGS` env var

### Step 2: Generate Engaging Title

If the user didn't provide a title, infer the topic from the filename. Then generate an attractive, clickable title suitable for Bilibili/Douyin. Keep these constraints in mind:
- **Douyin max 30 characters** (the upload script auto-truncates to 30)
- **Bilibili max 80 characters**
- The title should be engaging and attract clicks (e.g., use questions, surprising angles, or clear value propositions)

Create **two versions** of the title:
- A short version (≤30 chars) for Douyin
- A full version (≤80 chars) for Bilibili

If the user provided a title directly, skip generation and use their title directly.

Present both title versions to the user and let them confirm or request adjustments before proceeding.

### Step 3: Create Directories

```bash
mkdir -p output/video output/spider
```

### Step 4: Create Title JSON

Write a `output/spider/title.json` file with the user-confirmed title:
```json
{
  "title": "<generated-title>"
}
```

Use the Bilibili version (≤80 chars) as the main title.

### Step 5: Move Video

Copy the source video to `output/video/video.mp4`:

```bash
cp "<source-path>" "output/video/video.mp4"
```

### Step 6: Extract Cover Image from Video

Extract the first frame of the video as a cover image for Bilibili upload:

```bash
ffmpeg -y -i "output/video/video.mp4" -vframes 1 -q:v 2 "output/video/cover.jpg"
```

This creates `output/video/cover.jpg` from the first frame.

### Step 7: Report

Tell the user:
- ✅ `output/video/video.mp4` is ready
- ✅ `output/spider/title.json` is ready
- ✅ Remind them they can also set `VIDEO_DESC` and `VIDEO_TAGS` before running `pnpm upload:all`
- ✅ Ready to run: `pnpm upload:all`
