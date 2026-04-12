# Task: Neural Brain Sync

**ID:** `neural-brain-sync`
**Agent:** `@neural`
**Execution Mode:** `automatic`

## Objective

Index the current Obsidian vault (defined by OS Env var `NEURAL_BRAIN_PATH`) to make its contents aware for the AIOX engine.

## Steps

### 1. Verify Target

- Read `$env:NEURAL_BRAIN_PATH` (powershell/node).
- If not set, fallback to `C:\Users\expea\OneDrive\Documentos\DIto`.
- Verify the path exists and is a valid directory.

### 2. Read Markdown Content

- Execute discovery to find all `.md` files recursively in the vault.
- Read filenames and initial lines of recently modified notes.

### 3. Generate Hive Map

- Compile the findings into a temporary session cache or output artifact indicating to the user the number of notes indexed and critical tags discovered.
- Example Output: `[BRAIN SYNC]: Indexed X notes. Top tags: #idea, #dev.`

## Output Requirements

- Provide a summary report to the user confirming the vault is connected and ready for standard interaction.
