#!/usr/bin/env python3
"""Download white-background product photos for catalog items missing images."""
from __future__ import annotations

import io
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

from PIL import Image
from ddgs import DDGS

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalogo-famat.js"
OUT_DIR = ROOT / "images" / "productos"
LOG_PATH = ROOT / "images" / "productos-google-log.json"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"


def parse_catalog() -> list[tuple[str, str]]:
    text = CATALOG.read_text(encoding="utf-8")
    return [
        (m.group(1), m.group(2))
        for m in re.finditer(r'\{\s*nombre:\s*"([^"]+)",\s*slug:\s*"([^"]+)"\s*\}', text)
    ]


def missing_items() -> list[tuple[str, str]]:
    items = parse_catalog()
    out = []
    for nombre, slug in items:
        if not (OUT_DIR / f"{slug}.jpg").exists():
            out.append((nombre, slug))
    return out


def search_query(nombre: str) -> list[str]:
    base = nombre.replace("P/", "para ").replace("p/", "para ")
    return [
        f"{base} producto fondo blanco",
        f"{base} limpieza Argentina",
        f"{base} catalogo producto",
    ]


BLOCKED_HOSTS = (
    "tripadvisor",
    "pinterest",
    "tiktok",
    "youtube",
    "facebook",
    "instagram",
    "shutterstock",
    "gettyimages",
    "alamy",
    "istockphoto",
)


def download_bytes(url: str, timeout: float = 20) -> bytes | None:
    host = url.lower()
    if any(b in host for b in BLOCKED_HOSTS):
        return None
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": "https://www.bing.com/"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            ctype = (resp.headers.get("Content-Type") or "").lower()
            if "image" not in ctype and not url.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                return None
            data = resp.read()
            if len(data) < 2000:
                return None
            return data
    except Exception:
        return None


def to_white_jpg(data: bytes, dest: Path, max_side: int = 900) -> bool:
    try:
        img = Image.open(io.BytesIO(data))
        img = img.convert("RGBA")
        bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
        composed = Image.alpha_composite(bg, img).convert("RGB")
        w, h = composed.size
        scale = min(1.0, max_side / max(w, h))
        if scale < 1.0:
            composed = composed.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
        dest.parent.mkdir(parents=True, exist_ok=True)
        composed.save(dest, "JPEG", quality=90, optimize=True)
        return True
    except Exception:
        return False


def pick_and_save(nombre: str, slug: str, ddgs: DDGS) -> dict:
    result = {"slug": slug, "nombre": nombre, "query": None, "ok": False, "url": None, "error": None}
    for query in search_query(nombre):
        result["query"] = query
        try:
            images = list(
                ddgs.images(
                    query,
                    max_results=12,
                    safesearch="moderate",
                    backend="bing",
                )
            )
        except Exception as e:
            result["error"] = f"search: {e}"
            time.sleep(2)
            continue

        for item in images:
            url = item.get("image") or item.get("url")
            if not url:
                continue
            title = (item.get("title") or "").lower()
            if any(bad in title for bad in ("meme", "cartoon", "logo only", "drawing", "hotel", "restaurant")):
                continue
            data = download_bytes(url)
            if not data:
                continue
            dest = OUT_DIR / f"{slug}.jpg"
            if to_white_jpg(data, dest):
                result["ok"] = True
                result["url"] = url
                result["source"] = item.get("source") or item.get("url")
                return result
        time.sleep(0.8)
    result["error"] = result.get("error") or "no usable image"
    return result


def main() -> int:
    limit = None
    if len(sys.argv) > 1:
        limit = int(sys.argv[1])

    missing = missing_items()
    if limit is not None:
        missing = missing[:limit]

    print(f"Missing to fetch: {len(missing)}")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    log: list[dict] = []
    if LOG_PATH.exists():
        try:
            log = json.loads(LOG_PATH.read_text(encoding="utf-8"))
        except Exception:
            log = []

    ok = fail = 0
    with DDGS() as ddgs:
        for i, (nombre, slug) in enumerate(missing, 1):
            print(f"[{i}/{len(missing)}] {slug} ...", flush=True)
            # skip if somehow created meanwhile
            if (OUT_DIR / f"{slug}.jpg").exists():
                print("  skip (exists)")
                continue
            info = pick_and_save(nombre, slug, ddgs)
            log.append(info)
            if info["ok"]:
                ok += 1
                print(f"  OK <- {info['url'][:80]}")
            else:
                fail += 1
                print(f"  FAIL {info.get('error')}")
            LOG_PATH.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")
            time.sleep(1.6)  # be polite / avoid rate limits

    print(f"\nDone. ok={ok} fail={fail}")
    print(f"Log: {LOG_PATH}")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
