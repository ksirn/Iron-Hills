# Iron Hills Art Candidate Generation Runbook

This runbook tracks two art flows:

- built-in imagegen preview sheets, which do not require an API key;
- optional CLI/API generation for exact per-file batches.

Use built-in imagegen for concept sheets and visual direction first. Use the
CLI/API path only when exact batch output paths are more important than
interactive review.

The current working item icons live under `icons/items/...`.
Actor/token portraits live under `icons/tokens/npc/...` and
`icons/tokens/monsters/...`.
Generated candidates must first land under `art-candidates/items/...`.
Only promote candidates after visual QA.

## 0. Built-In Imagegen Preview Intake

Built-in imagegen outputs are copied into the repo as preview sheets so they do
not depend on transient Codex filenames:

```powershell
& 'C:\Users\mitma\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' `
  tools\intake-imagegen-preview-sheets.mjs
```

This writes:

- `docs/content/generated-image-sheets.json`
- `docs/content/generated-image-sheets.md`
- `docs/content/generated-image-sheets/*.png`

Recent built-in sheet passes with explicit slice plans:

- utility gear:
  `docs/content/utility-gear-imagegen-slice-plan.json` ->
  `docs/content/utility-gear-imagegen-slices.json`;
- materials:
  `docs/content/materials-imagegen-slice-plan.json` ->
  `docs/content/materials-imagegen-slices.json`.

To slice approved preview sheets into individual WebP candidates:

```powershell
& 'C:\Users\mitma\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  tools\slice-imagegen-preview-sheets.py
```

This writes:

- `docs/content/generated-image-slices.json`
- `docs/content/generated-image-slices.md`
- `docs/content/generated-image-slices-contact.webp`
- `art-candidates/items/.../*.webp`

Dry-run promotable slices before replacing final icons:

```powershell
& 'C:\Users\mitma\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' `
  tools\promote-art-candidates.mjs `
  --manifest docs\content\generated-image-slices.json `
  --catalog spells
```

For explicit slice manifests from this pass:

```powershell
node tools\promote-art-candidates.mjs --manifest docs\content\utility-gear-imagegen-slices.json --catalog attachments --catalog belts --catalog backpacks --catalog tools --catalog consumables
node tools\promote-art-candidates.mjs --manifest docs\content\materials-imagegen-slices.json --catalog materials
```

Actor portrait slices are promoted manually because one NPC source image can feed
multiple role/tier-band token files. After actor token promotion, rerun:

```powershell
node tools\sync-generated-packs.mjs --apply --pack ih-npc --pack ih-monsters
node tools\check-content-readiness.mjs --strict-art --max-findings 10
```

## Requirements

Only the CLI/API batch flow below requires these.

- `OPENAI_API_KEY` must be available in the environment running the commands.
- Python image CLI dependency: `openai`.
- Use the bundled imagegen CLI:
  `C:\Users\mitma\.codex\skills\.system\imagegen\scripts\image_gen.py`

## 1. Export JSONL Jobs

```powershell
node tools\export-art-batch-jsonl.mjs
```

This writes category JSONL files under `tmp\imagegen\`:

- `art-candidates-consumables.jsonl`
- `art-candidates-tools.jsonl`
- `art-candidates-belts.jsonl`
- `art-candidates-backpacks.jsonl`
- `art-candidates-attachments.jsonl`
- `art-candidates-materials.jsonl`

## 2. Smoke Batch

Start with consumables. It is only 3 images and is the fastest way to validate
style, API access, output paths, and QA.

```powershell
& 'C:\Users\mitma\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  'C:\Users\mitma\.codex\skills\.system\imagegen\scripts\image_gen.py' generate-batch `
  --input tmp\imagegen\art-candidates-consumables.jsonl `
  --out-dir art-candidates\items\consumables `
  --concurrency 1 `
  --fail-fast `
  --no-augment
```

## 3. QA Smoke Batch

```powershell
node tools\audit-art-targets.mjs --manifest docs\content\art-replacement-candidates.json --catalog consumables --strict-warnings
node tools\promote-art-candidates.mjs --catalog consumables
```

After visual QA:

```powershell
node tools\promote-art-candidates.mjs --catalog consumables --apply
node tools\check-content-readiness.mjs --strict-art --max-findings 10
```

## 4. Generate Remaining Categories

```powershell
$cats = @('tools', 'belts', 'backpacks', 'attachments', 'materials')
foreach ($cat in $cats) {
  & 'C:\Users\mitma\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
    'C:\Users\mitma\.codex\skills\.system\imagegen\scripts\image_gen.py' generate-batch `
    --input "tmp\imagegen\art-candidates-$cat.jsonl" `
    --out-dir "art-candidates\items\$cat" `
    --concurrency 2 `
    --fail-fast `
    --no-augment
}
```

## 5. QA And Promote Remaining Categories

Promote one category at a time after visual inspection.

```powershell
$cats = @('tools', 'belts', 'backpacks', 'attachments', 'materials')
foreach ($cat in $cats) {
  node tools\audit-art-targets.mjs --manifest docs\content\art-replacement-candidates.json --catalog $cat --strict-warnings
  node tools\promote-art-candidates.mjs --catalog $cat
}
```

After visual QA, apply selected categories:

```powershell
node tools\promote-art-candidates.mjs --catalog tools --apply
node tools\promote-art-candidates.mjs --catalog belts --apply
node tools\promote-art-candidates.mjs --catalog backpacks --apply
node tools\promote-art-candidates.mjs --catalog attachments --apply
node tools\promote-art-candidates.mjs --catalog materials --apply
node tools\check-content-readiness.mjs --strict-art --max-findings 10
```
