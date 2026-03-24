from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[1]
TMJ_ROOT = ROOT / "output_modules_marked"
IMAGE_ROOT = ROOT / "output_modules_clean"
OUTPUT_ROOT = ROOT / "public" / "module-library"
MANIFEST_PATH = OUTPUT_ROOT / "manifest.json"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "item"


def to_url_path(path: Path) -> str:
    return "/" + "/".join(quote(part) for part in path.parts)


def build_manifest() -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []

    for tmj_path in sorted(TMJ_ROOT.rglob("*.tmj")):
        relative_tmj = tmj_path.relative_to(TMJ_ROOT)
        image_path = IMAGE_ROOT / relative_tmj.with_suffix(".png")
        if not image_path.exists():
            continue

        relative_image = image_path.relative_to(IMAGE_ROOT)
        category = relative_tmj.parent.name
        label = tmj_path.stem
        tone = "controller" if "controller" in category.lower() else "module"
        key = slugify(f"{category}-{label}")

        entries.append(
            {
                "key": key,
                "label": label,
                "category": category,
                "tone": tone,
                "tmjPath": to_url_path(Path("module-library") / relative_tmj),
                "imagePath": to_url_path(Path("module-library") / relative_image),
            }
        )

    return entries


def main() -> None:
    if not TMJ_ROOT.exists():
        raise FileNotFoundError(f"Missing tmj directory: {TMJ_ROOT}")
    if not IMAGE_ROOT.exists():
        raise FileNotFoundError(f"Missing image directory: {IMAGE_ROOT}")

    if OUTPUT_ROOT.exists():
        shutil.rmtree(OUTPUT_ROOT)

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    for image_path in IMAGE_ROOT.rglob("*.png"):
        relative_path = image_path.relative_to(IMAGE_ROOT)
        destination = OUTPUT_ROOT / relative_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(image_path, destination)

    for tmj_path in TMJ_ROOT.rglob("*.tmj"):
        relative_path = tmj_path.relative_to(TMJ_ROOT)
        destination = OUTPUT_ROOT / relative_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(tmj_path, destination)

    manifest = build_manifest()
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Published {len(manifest)} module entries to {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
