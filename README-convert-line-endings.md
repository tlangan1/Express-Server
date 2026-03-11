# Plan: Convert CRLF to LF (No Git Config Changes)

## Goal

Normalize all text files in this repo to LF line endings while keeping history clean by isolating the change into a single commit.

## Preconditions

- Working tree is clean (no uncommitted changes).
- You can run commands in the repo root.

## Steps

### 1) Create a dedicated branch

Use a short‑lived branch to keep the change isolated.

### 2) Convert only text files

Run a MIME‑type filter so binaries are skipped:

```bash
find . -path './.git' -o -path './.git/*' -prune -o -path ./node_modules -prune -o -path ./cert -prune -o -type f -exec file --mime-type {} + | awk -F: '$2 ~ /(text|application\/(json|javascript|xml|x-yaml))/ {print $1}' | xargs dos2unix
```

### 3) Review the impact

Check the diff is only line endings:

- `git status`
- `git diff --stat`

### 4) Commit once

Make a single commit with a clear message, for example:

- “Normalize line endings to LF”

### 5) Merge the single commit

Merge the branch (or cherry‑pick the commit) so history stays tidy.

## Notes

- This plan avoids any Git configuration changes.
- The conversion is safe because it targets only files detected as text.
