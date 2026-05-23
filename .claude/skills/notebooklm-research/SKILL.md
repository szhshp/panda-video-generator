---
name: notebooklm-research
description: Create a NotebookLM notebook for a research topic, run web research, and import sources. Checks notebooklm installation, login, and skill installation first.
---

# NotebookLM Research Workflow

Research a topic using NotebookLM: create a notebook, run deep web research, and import sources.

## Workflow Steps

When this skill is invoked, follow these steps in order:

### Step 1: Check NotebookLM Installation

```bash
notebooklm --version 2>/dev/null || pip3 show notebooklm-py 2>/dev/null
```

If not installed, install it:
```bash
pip install notebooklm-py
notebooklm skill install
```

### Step 2: Check Login Status

```bash
notebooklm status 2>&1
```

If authentication fails or session expired:
```bash
notebooklm auth check 2>&1
```

If not logged in, tell the user to run `notebooklm login` first and stop.

### Step 3: Check NotebookLM Skill Installation

```bash
ls ~/.claude/skills/notebooklm/SKILL.md 2>/dev/null && echo "Skill installed"
```

If not installed:
```bash
notebooklm skill install
```

### Step 4: Ask for Research Title

Prompt the user: "What research topic would you like to explore?"

Wait for the user to provide the research title/topic.

### Step 5: Create Notebook and Run Research

1. Create a new notebook with the research topic as title:
   ```bash
   notebooklm create "<research-title>" --json
   ```
   Parse the notebook ID from the JSON output.

2. Set the notebook as current context:
   ```bash
   notebooklm use <notebook-id>
   ```

3. Start deep web research:
   ```bash
   notebooklm source add-research "<research-query>" --mode deep --no-wait
   ```

4. Wait for research to complete and import all sources:
   ```bash
   notebooklm research wait --import-all --timeout 300
   ```

5. Report the results:
   - Notebook ID and title
   - Number of sources imported
   - Confirmation that sources are ready for chat or artifact generation

## Example

User: `/notebooklm-research`

Agent:
1. ✅ Checks notebooklm installed (v0.4.1)
2. ✅ Verifies login status (authenticated)
3. ✅ Confirms skill installed
4. ❓ Asks: "What research topic would you like to explore?"
5. User: "Russian space program 2026"
6. ✅ Creates notebook, runs deep research, imports sources
7. Reports back with notebook ID and source count
