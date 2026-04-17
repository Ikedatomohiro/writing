#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "pyyaml>=6.0",
# ]
# ///
"""illustration-scenes.yaml を読み込み、content-pipeline の generate_image.py を
逐次呼び出して既存 blog 記事の挿絵画像を一括生成する。"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import yaml

WRITING_ROOT = Path(__file__).resolve().parents[1]
PIPELINE_ROOT = WRITING_ROOT.parent / "content-pipeline"
SCENES_FILE = WRITING_ROOT / "scripts" / "illustration-scenes.yaml"
GENERATE_SCRIPT = PIPELINE_ROOT / "article-creator" / "scripts" / "generate_image.py"
OUT_BASE = WRITING_ROOT / "public" / "images" / "articles"


def main() -> None:
    data = yaml.safe_load(SCENES_FILE.read_text(encoding="utf-8"))
    total = sum(len(a["images"]) for a in data)
    done = 0
    failures: list[tuple[str, str, str]] = []
    for article in data:
        slug = article["slug"]
        for img in article["images"]:
            kind = img["kind"]
            scene = img["scene"]
            done += 1
            target = OUT_BASE / slug / f"{kind}.png"
            if target.exists():
                print(f"[{done}/{total}] SKIP {slug}/{kind}.png (already exists)")
                continue
            print(f"[{done}/{total}] GEN  {slug}/{kind}.png")
            cmd = [
                str(GENERATE_SCRIPT),
                "--account", "pao-pao-cho",
                "--channel", "blog",
                "--slug", slug,
                "--kind", kind,
                "--scene", scene,
                "--mood", "still",
                "--aspect", "16:9",
            ]
            try:
                subprocess.run(cmd, cwd=PIPELINE_ROOT, check=True)
            except subprocess.CalledProcessError as e:
                print(f"  FAIL: exit={e.returncode}", file=sys.stderr)
                failures.append((slug, kind, str(e)))
    if failures:
        print(f"\n{len(failures)} failures:", file=sys.stderr)
        for slug, kind, err in failures:
            print(f"  - {slug}/{kind}: {err}", file=sys.stderr)
        sys.exit(1)
    print(f"\nAll {total} images generated successfully.")


if __name__ == "__main__":
    main()
