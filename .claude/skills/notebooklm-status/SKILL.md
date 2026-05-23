---
name: notebooklm-status
description: List all NotebookLM notebooks and show their artifact status (video, infographic, etc.) in a summary table.
---

# NotebookLM Status Overview

Iterate through all notebooks and display a summary of all artifacts.

## Workflow Steps

When this skill is invoked, follow these steps in order:

### Step 1: Prerequisites

First, run the [notebooklm-research](.claude/skills/notebooklm-research/SKILL.md) skill to handle installation check, login verification, and setup.

### Step 2: List All Notebooks

```bash
notebooklm list --json
```

Parse the JSON output to get all notebook IDs and titles.

### Step 3: Iterate and Collect Artifacts

For each notebook, query its artifacts:

```bash
notebooklm artifact list -n <notebook-id> --json
```

Collect all artifacts from all notebooks.

### Step 4: Report Summary

Present a summary table to the user with:
- Notebook title
- Artifact type (Video, Infographic, etc.)
- Artifact title
- Status (completed / in_progress / failed)

## Example

User: `/notebooklm-status`

Agent:
1. ✅ Runs notebooklm-research skill for prerequisites
2. ✅ Lists notebooks (e.g. 2 found)
3. ✅ Collects artifacts from each notebook
4. Reports back with a full artifact summary table
