#!/usr/bin/env python3
"""Slice Iron Hills imagegen preview sheets into individual candidate assets."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PLAN = ROOT / "docs/content/imagegen-slice-plan.json"
DEFAULT_MANIFEST = ROOT / "docs/content/generated-image-slices.json"
DEFAULT_MARKDOWN = ROOT / "docs/content/generated-image-slices.md"


def normalize_path(path: Path | str) -> str:
    return str(path).replace("\\", "/")


def rel_root(path: Path) -> str:
    try:
        return normalize_path(path.resolve().relative_to(ROOT))
    except ValueError:
        return normalize_path(path)


def parse_grid(value: str) -> tuple[int, int]:
    raw = str(value or "").lower().replace(" ", "")
    if "x" not in raw:
        raise ValueError(f"Bad grid value: {value!r}")
    cols, rows = raw.split("x", 1)
    return max(1, int(cols)), max(1, int(rows))


def slugify(value: str) -> str:
    text = "".join(ch.lower() if ch.isalnum() else "-" for ch in str(value or "").strip())
    while "--" in text:
        text = text.replace("--", "-")
    return text.strip("-")


def resolve_workspace_path(value: str) -> Path:
    path = Path(str(value or ""))
    if path.is_absolute():
        return path
    return ROOT / path


def load_plan(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def cell_box(width: int, height: int, cols: int, rows: int, col: int, row: int) -> tuple[int, int, int, int]:
    left = round(col * width / cols)
    right = round((col + 1) * width / cols)
    top = round(row * height / rows)
    bottom = round((row + 1) * height / rows)
    return left, top, right, bottom


def fitted_square(cell: Image.Image, size: int) -> Image.Image:
    rgb = cell.convert("RGB")
    background = rgb.getpixel((0, 0))
    canvas = Image.new("RGB", (size, size), background)
    ratio = min(size / rgb.width, size / rgb.height)
    new_size = (max(1, round(rgb.width * ratio)), max(1, round(rgb.height * ratio)))
    resized = rgb.resize(new_size, Image.Resampling.LANCZOS)
    offset = ((size - resized.width) // 2, (size - resized.height) // 2)
    canvas.paste(resized, offset)
    return canvas


def as_item(sheet: dict[str, Any], cell: dict[str, Any], target_file: Path, output_size: int) -> dict[str, Any]:
    item_id = str(cell["id"])
    catalog = str(cell.get("catalog") or sheet.get("catalog") or sheet.get("category") or "preview")
    final_file = str(cell.get("finalFile") or "").strip()
    return {
        "id": item_id,
        "name": cell.get("name") or cell.get("prompt") or item_id,
        "catalog": catalog,
        "type": cell.get("type") or catalog,
        "status": cell.get("status") or sheet.get("status") or "preview-candidate",
        "gridW": int(cell.get("gridW") or 1),
        "gridH": int(cell.get("gridH") or 1),
        "aspect": cell.get("aspect") or "1:1",
        "resolution": f"{output_size}x{output_size}",
        "targetFile": rel_root(target_file),
        "targetImg": f"systems/iron-hills-system/{rel_root(target_file)}",
        "finalFile": final_file,
        "finalImg": f"systems/iron-hills-system/{final_file}" if final_file else "",
        "sourceSheetSlug": sheet["slug"],
        "sourceSheetFile": sheet["file"],
        "sourceCell": {
            "row": int(cell["row"]),
            "col": int(cell["col"]),
            "grid": sheet["grid"],
        },
        "sourcePrompt": cell.get("prompt") or "",
        "notes": cell.get("notes") or sheet.get("notes") or [],
        "instructions": "Review visually before promotion. This candidate was sliced from a preview sheet, not generated as an isolated final asset.",
    }


def markdown_for(manifest: dict[str, Any]) -> str:
    lines = [
        "# Generated Image Slices",
        "",
        "Individual WebP candidates sliced from preview sheets. They are not promoted to final icons yet.",
        "",
        "## Summary",
        "",
        f"- Total slices: {manifest['summary']['total']}",
        f"- Promotable slices: {manifest['summary']['promotable']}",
        "",
        "## Workflow",
        "",
        "1. Inspect the WebP candidates in `art-candidates/items/...`.",
        "2. Regenerate weak cells as isolated assets when a sheet crop is not final-quality enough.",
        "3. Dry-run promotion with `node tools/promote-art-candidates.mjs --manifest docs/content/generated-image-slices.json --catalog spells`.",
        "4. Promote only visually approved rows, then rerun content readiness.",
        "",
        "## Slices",
        "",
        "| Catalog | ID | Name | Source | Candidate | Final | Notes |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for item in manifest["items"]:
        source = f"{item['sourceSheetSlug']} r{item['sourceCell']['row']}c{item['sourceCell']['col']}"
        notes = "; ".join(item.get("notes") or [])
        row = [
            item["catalog"],
            item["id"],
            item["name"],
            source,
            item["targetFile"],
            item.get("finalFile") or "",
            notes,
        ]
        lines.append("| " + " | ".join(str(value).replace("|", "\\|") for value in row) + " |")
    lines.append("")
    return "\n".join(lines) + "\n"


def slice_sheets(plan: dict[str, Any], *, dry_run: bool = False, overwrite: bool = False) -> dict[str, Any]:
    output_size = int(plan.get("outputSize") or 1024)
    output_root = resolve_workspace_path(plan.get("outDir") or "art-candidates/items")
    items: list[dict[str, Any]] = []
    blockers: list[dict[str, Any]] = []
    written = 0
    skipped_existing = 0

    for sheet in plan.get("sheets", []):
        sheet_file = resolve_workspace_path(sheet["file"])
        if not sheet_file.exists():
            blockers.append({"severity": "error", "code": "missing-sheet", "sheet": sheet.get("slug"), "file": rel_root(sheet_file)})
            continue
        cols, rows = parse_grid(sheet["grid"])
        with Image.open(sheet_file) as source:
            source = source.convert("RGB")
            for cell in sheet.get("cells", []):
                row = int(cell["row"])
                col = int(cell["col"])
                if row < 0 or row >= rows or col < 0 or col >= cols:
                    blockers.append({"severity": "error", "code": "bad-cell", "sheet": sheet.get("slug"), "cell": cell.get("id")})
                    continue
                target_dir = output_root / str(cell.get("catalog") or sheet.get("catalog") or sheet.get("category") or "preview")
                target_file = target_dir / f"{slugify(cell['id'])}.webp"
                items.append(as_item(sheet, cell, target_file, output_size))
                if dry_run:
                    continue
                if target_file.exists() and not overwrite:
                    skipped_existing += 1
                    continue
                target_dir.mkdir(parents=True, exist_ok=True)
                crop = source.crop(cell_box(source.width, source.height, cols, rows, col, row))
                asset = fitted_square(crop, output_size)
                asset.save(target_file, "WEBP", quality=int(plan.get("webpQuality") or 92), method=6)
                written += 1

    return {
        "ok": not blockers,
        "label": plan.get("label") or "Iron Hills imagegen preview slices",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "dryRun": dry_run,
        "summary": {
            "total": len(items),
            "promotable": sum(1 for item in items if item.get("finalFile")),
            "written": written,
            "skippedExisting": skipped_existing,
            "blockers": len(blockers),
        },
        "source": {
            "plan": rel_root(DEFAULT_PLAN),
            "outputSize": output_size,
            "outputRoot": rel_root(output_root),
        },
        "blockers": blockers,
        "items": items,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--plan", default=str(DEFAULT_PLAN))
    parser.add_argument("--manifest", default=str(DEFAULT_MANIFEST))
    parser.add_argument("--markdown", default=str(DEFAULT_MARKDOWN))
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    plan_path = resolve_workspace_path(args.plan)
    manifest_path = resolve_workspace_path(args.manifest)
    markdown_path = resolve_workspace_path(args.markdown)
    plan = load_plan(plan_path)
    report = slice_sheets(plan, dry_run=args.dry_run, overwrite=args.overwrite)
    report["source"]["plan"] = rel_root(plan_path)

    if not args.dry_run and report["ok"]:
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        markdown_path.write_text(markdown_for(report), encoding="utf-8")

    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print(f"Iron Hills imagegen slice pass: {'OK' if report['ok'] else 'BLOCKED'}")
        summary = report["summary"]
        print(
            f"Slices={summary['total']}, promotable={summary['promotable']}, "
            f"written={summary['written']}, skippedExisting={summary['skippedExisting']}, dryRun={report['dryRun']}"
        )
        for blocker in report["blockers"]:
            print(f"- [{blocker['severity'].upper()}] {blocker.get('sheet')}: {blocker['code']}")

    if not report["ok"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
