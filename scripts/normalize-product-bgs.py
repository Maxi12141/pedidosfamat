"""Normalize dark product photo backgrounds to white and pad for framing."""
from PIL import Image
from collections import deque
import os

DIR = os.path.join(os.path.dirname(__file__), "..", "images", "productos")
WHITE = (255, 255, 255)


def lum(p):
    return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]


def flood_to_white(im, thresh=60):
    im = im.convert("RGB")
    w, h = im.size
    px = im.load()
    visited = [[False] * w for _ in range(h)]
    q = deque()
    seeds = [
        (0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
        (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2),
    ]
    for x, y in seeds:
        if lum(px[x, y]) <= thresh:
            q.append((x, y))
            visited[y][x] = True
    changed = 0
    while q:
        x, y = q.popleft()
        px[x, y] = WHITE
        changed += 1
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                p = px[nx, ny]
                if lum(p) <= thresh and abs(p[0] - p[1]) < 48 and abs(p[1] - p[2]) < 48:
                    visited[ny][nx] = True
                    q.append((nx, ny))
    return im, changed


def pad_on_white(im, pad_ratio=0.08):
    im = im.convert("RGB")
    w, h = im.size
    pad = max(8, int(max(w, h) * pad_ratio))
    out = Image.new("RGB", (w + 2 * pad, h + 2 * pad), WHITE)
    out.paste(im, (pad, pad))
    m = max(out.size)
    canvas = Image.new("RGB", (m, m), WHITE)
    canvas.paste(out, ((m - out.size[0]) // 2, (m - out.size[1]) // 2))
    return canvas


def main():
    fixed = 0
    for name in os.listdir(DIR):
        if not name.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        path = os.path.join(DIR, name)
        try:
            im = Image.open(path).convert("RGB")
            w, h = im.size
            corners = [
                im.getpixel((2, 2)),
                im.getpixel((w - 3, 2)),
                im.getpixel((2, h - 3)),
                im.getpixel((w - 3, h - 3)),
            ]
            dark = sum(1 for c in corners if lum(c) < 55)
            if dark < 2:
                continue
            im2, ch = flood_to_white(im, thresh=62)
            im2 = pad_on_white(im2, 0.08)
            m = max(im2.size)
            if m > 1000:
                s = 1000 / m
                im2 = im2.resize(
                    (int(im2.size[0] * s), int(im2.size[1] * s)),
                    Image.Resampling.LANCZOS,
                )
            im2.save(path, "JPEG", quality=92, optimize=True)
            fixed += 1
            print(f"ok {name} flooded={ch}")
        except Exception as e:
            print(f"err {name}: {e}")
    print(f"fixed {fixed}")


if __name__ == "__main__":
    main()
