#!/usr/bin/env python3
"""
Generate deterministic WebP item icons for Iron Hills catalog assets.

By default the script asks the JS asset audit for missing system-local image
paths. The generated pictures are deterministic development placeholders, not
final content art. Reading docs/content/art-backlog.json is intentionally gated
behind --dev-placeholder-art so this tool is not mistaken for the prompt-driven
content image pipeline.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import random
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SYSTEM_PREFIX = "systems/iron-hills-system/"
SIZE = 512
SCALE = 3
W = SIZE * SCALE


def p(value: float) -> int:
    return int(round(value * SCALE))


def box(values):
    return tuple(p(v) for v in values)


def pts(values):
    return [(p(x), p(y)) for x, y in values]


def clamp(value: int) -> int:
    return max(0, min(255, int(value)))


def adjust(color, amount: int):
    return tuple(clamp(c + amount) for c in color)


def blend(a, b, t: float):
    return tuple(clamp(a[i] * (1 - t) + b[i] * t) for i in range(3))


def alpha(color, a: int):
    return (*color, a)


def seed_for(catalog: str, key: str) -> int:
    digest = hashlib.sha1(f"{catalog}:{key}".encode("utf-8")).hexdigest()
    return int(digest[:16], 16)


KEYWORD_COLORS = [
    ("dark_iron", (48, 46, 48), (212, 62, 38)),
    ("darkiron", (48, 46, 48), (212, 62, 38)),
    ("void", (42, 28, 68), (142, 88, 220)),
    ("star", (88, 102, 132), (230, 225, 160)),
    ("celestial", (222, 214, 176), (114, 184, 234)),
    ("mithril", (164, 204, 214), (235, 247, 248)),
    ("orichalcum", (206, 128, 48), (255, 198, 84)),
    ("adamantium", (40, 58, 52), (98, 236, 158)),
    ("alloy", (128, 132, 126), (222, 174, 98)),
    ("copper", (184, 86, 48), (255, 166, 88)),
    ("bronze", (176, 116, 52), (244, 181, 82)),
    ("steel", (134, 144, 150), (224, 234, 238)),
    ("iron", (108, 112, 112), (205, 214, 214)),
    ("silver", (178, 190, 196), (242, 248, 250)),
    ("gold", (214, 166, 56), (255, 225, 110)),
    ("leather", (126, 74, 38), (215, 146, 80)),
    ("hide", (126, 84, 50), (220, 156, 88)),
    ("pelt", (106, 80, 58), (210, 170, 110)),
    ("dragon", (126, 34, 30), (248, 96, 64)),
    ("drake", (100, 90, 54), (214, 166, 74)),
    ("wyvern", (70, 104, 92), (130, 220, 172)),
    ("leviathan", (38, 92, 112), (98, 210, 230)),
    ("wood", (116, 78, 36), (210, 150, 70)),
    ("oak", (132, 90, 42), (222, 174, 80)),
    ("ebony", (38, 34, 32), (150, 112, 80)),
    ("spirit", (70, 132, 128), (148, 236, 220)),
    ("crystal", (78, 142, 202), (184, 238, 255)),
    ("ruby", (152, 32, 42), (255, 105, 96)),
    ("sapphire", (42, 74, 172), (112, 168, 255)),
    ("diamond", (186, 224, 238), (255, 255, 255)),
    ("obsidian", (28, 26, 34), (154, 86, 218)),
    ("herb", (66, 132, 72), (146, 230, 116)),
    ("flower", (148, 82, 164), (255, 168, 230)),
    ("mushroom", (148, 78, 68), (238, 174, 142)),
    ("blood", (136, 24, 30), (255, 84, 68)),
    ("mana", (72, 78, 188), (146, 218, 255)),
    ("soul", (82, 170, 176), (190, 255, 230)),
    ("astral", (72, 70, 150), (204, 194, 255)),
    ("planar", (80, 92, 160), (180, 214, 255)),
]


DEFAULT_COLORS = {
    "armor": ((112, 116, 118), (225, 214, 170)),
    "materials": ((116, 96, 62), (218, 178, 92)),
    "weapons": ((116, 118, 112), (232, 196, 116)),
    "potions": ((70, 88, 130), (132, 216, 242)),
    "food": ((132, 88, 50), (232, 176, 94)),
    "spells": ((70, 74, 142), (164, 212, 255)),
    "throwables": ((112, 82, 64), (230, 146, 82)),
    "tools": ((116, 94, 64), (218, 170, 88)),
    "belts": ((112, 70, 42), (212, 145, 78)),
    "backpacks": ((102, 76, 48), (204, 146, 76)),
    "attachments": ((104, 70, 44), (210, 150, 88)),
    "consumables": ((70, 104, 118), (136, 220, 238)),
}


def palette_for(catalog: str, key: str):
    lowered = key.lower()
    for needle, main, accent in KEYWORD_COLORS:
        if needle in lowered:
            return main, accent
    main, accent = DEFAULT_COLORS.get(catalog, ((110, 110, 110), (220, 190, 120)))
    rng = random.Random(seed_for(catalog, key))
    return adjust(main, rng.randint(-12, 12)), adjust(accent, rng.randint(-8, 8))


def make_canvas(catalog: str, key: str, main, accent):
    rng = random.Random(seed_for(catalog, key))
    base = Image.new("RGB", (SIZE, SIZE), (14, 15, 15))
    pix = base.load()
    bg1 = blend((12, 13, 13), main, 0.12)
    bg2 = blend((24, 23, 22), accent, 0.08)
    cx = SIZE * (0.46 + rng.random() * 0.08)
    cy = SIZE * (0.42 + rng.random() * 0.08)
    for y in range(SIZE):
        for x in range(SIZE):
            dx = (x - cx) / SIZE
            dy = (y - cy) / SIZE
            r = min(1.0, math.sqrt(dx * dx + dy * dy) * 1.9)
            n = rng.randint(-7, 7)
            col = blend(bg2, bg1, r)
            pix[x, y] = tuple(clamp(c + n) for c in col)
    img = base.resize((W, W), Image.Resampling.BICUBIC).convert("RGBA")
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle(box((22, 22, 490, 490)), radius=p(34), outline=alpha(blend(main, accent, 0.45), 72), width=p(2))
    d.rounded_rectangle(box((36, 36, 476, 476)), radius=p(28), outline=(255, 255, 255, 18), width=p(1))
    d.ellipse(box((80, 382, 432, 466)), fill=(0, 0, 0, 88))
    return img, d, rng


def add_sparkles(d, rng, accent, count=7):
    for _ in range(count):
        x = rng.randint(84, 428)
        y = rng.randint(72, 418)
        r = rng.randint(2, 5)
        d.ellipse(box((x - r, y - r, x + r, y + r)), fill=alpha(accent, rng.randint(80, 170)))


def add_scratches(d, rng, color, count=8):
    for _ in range(count):
        x = rng.randint(140, 380)
        y = rng.randint(120, 380)
        d.line((p(x), p(y), p(x + rng.randint(-18, 18)), p(y + rng.randint(8, 28))), fill=alpha(adjust(color, 80), 60), width=p(1))


def draw_facets(d, polygons, main, accent):
    for poly, t in polygons:
        d.polygon(pts(poly), fill=alpha(blend(main, accent, t), 245), outline=alpha(adjust(accent, 30), 125))


def draw_armor(d, key, main, accent, rng):
    if "shield" in key or "aegis" in key:
        if "tower" in key:
            outer = [(170, 86), (342, 86), (376, 386), (256, 442), (136, 386)]
        else:
            outer = [(256, 76), (390, 132), (356, 350), (256, 442), (156, 350), (122, 132)]
        inner = [(256, 116), (342, 156), (318, 326), (256, 386), (194, 326), (170, 156)]
        d.polygon(pts(outer), fill=alpha(adjust(main, -22), 255), outline=alpha(adjust(accent, 18), 230))
        d.polygon(pts(inner), fill=alpha(main, 255), outline=alpha(adjust(accent, 45), 160))
        d.line(pts([(256, 116), (256, 386)]), fill=alpha(adjust(accent, 45), 185), width=p(5))
        d.ellipse(box((226, 228, 286, 288)), fill=alpha(adjust(accent, -8), 245), outline=alpha(adjust(accent, 70), 190), width=p(3))
        add_scratches(d, rng, accent, 5)
        return

    if "helm" in key:
        d.pieslice(box((132, 74, 380, 298)), 180, 360, fill=alpha(main, 255), outline=alpha(adjust(accent, 30), 180), width=p(4))
        d.rounded_rectangle(box((122, 190, 390, 330)), radius=p(38), fill=alpha(adjust(main, -14), 255), outline=alpha(adjust(accent, 24), 190), width=p(4))
        d.rectangle(box((166, 220, 346, 250)), fill=(12, 12, 12, 210))
        d.line(pts([(256, 120), (256, 320)]), fill=alpha(adjust(accent, 60), 170), width=p(4))
        d.polygon(pts([(206, 328), (150, 392), (196, 390)]), fill=alpha(adjust(main, -28), 230))
        d.polygon(pts([(306, 328), (362, 392), (316, 390)]), fill=alpha(adjust(main, -28), 230))
        add_sparkles(d, rng, accent, 4)
        return

    if "legs" in key or "boots" in key:
        for offset in (-58, 58):
            d.polygon(pts([(256 + offset - 38, 114), (256 + offset + 34, 114), (282 + offset, 382), (214 + offset, 382)]), fill=alpha(main, 250), outline=alpha(adjust(accent, 25), 185))
            d.rounded_rectangle(box((196 + offset, 248, 318 + offset, 310)), radius=p(22), fill=alpha(adjust(main, -20), 245), outline=alpha(accent, 140), width=p(3))
            d.polygon(pts([(214 + offset, 382), (306 + offset, 382), (332 + offset, 422), (188 + offset, 422)]), fill=alpha(adjust(main, -26), 248), outline=alpha(adjust(accent, 28), 150))
        add_scratches(d, rng, accent, 7)
        return

    if "bracer" in key or "arms" in key or "gloves" in key:
        left = "left" in key
        tilt = -1 if left else 1
        poly = [(210, 104), (314, 122), (296, 408), (176, 376)] if left else [(198, 122), (302, 104), (336, 376), (216, 408)]
        d.polygon(pts(poly), fill=alpha(main, 255), outline=alpha(adjust(accent, 28), 190))
        for y in (172, 246, 320):
            d.line((p(202 + tilt * 8), p(y), p(314 + tilt * 8), p(y + tilt * 14)), fill=alpha(adjust(accent, 55), 160), width=p(5))
        d.ellipse(box((198, 378, 332, 448)), fill=alpha(adjust(main, -25), 230), outline=alpha(accent, 130), width=p(3))
        return

    if "gorget" in key:
        for i, y in enumerate((150, 198, 246)):
            d.arc(box((112 + i * 16, y, 400 - i * 16, y + 190)), start=200, end=340, fill=alpha(adjust(accent, 20 - i * 10), 230), width=p(28))
        d.rounded_rectangle(box((178, 292, 334, 372)), radius=p(32), fill=alpha(main, 235), outline=alpha(adjust(accent, 34), 150), width=p(4))
        add_sparkles(d, rng, accent, 3)
        return

    d.polygon(pts([(164, 110), (348, 110), (404, 388), (108, 388)]), fill=alpha(main, 255), outline=alpha(adjust(accent, 28), 185))
    d.polygon(pts([(220, 112), (292, 112), (276, 168), (236, 168)]), fill=(14, 14, 14, 180))
    d.polygon(pts([(142, 134), (90, 210), (130, 244), (176, 164)]), fill=alpha(adjust(main, -26), 245), outline=alpha(accent, 110))
    d.polygon(pts([(370, 134), (422, 210), (382, 244), (336, 164)]), fill=alpha(adjust(main, -26), 245), outline=alpha(accent, 110))
    for x in (184, 256, 328):
        d.line(pts([(x, 126), (x + rng.randint(-18, 18), 376)]), fill=alpha(adjust(accent, 45), 105), width=p(3))
    d.rounded_rectangle(box((166, 252, 346, 288)), radius=p(12), fill=alpha(adjust(main, -32), 165), outline=alpha(accent, 115), width=p(2))
    add_scratches(d, rng, accent, 7)


def draw_ingots(d, main, accent, rng):
    for i, (x, y) in enumerate([(154, 280), (246, 286), (196, 220), (286, 220), (224, 160)]):
        poly = [(x, y), (x + 120, y - 18), (x + 156, y + 34), (x + 36, y + 54)]
        d.polygon(pts(poly), fill=alpha(adjust(main, i * 5), 255), outline=alpha(adjust(accent, 40), 145))
        d.line(pts([(x + 18, y + 6), (x + 132, y - 10)]), fill=alpha(adjust(accent, 70), 120), width=p(2))


def draw_ore(d, main, accent, rng):
    for _ in range(5):
        x = rng.randint(142, 332)
        y = rng.randint(156, 350)
        r = rng.randint(38, 76)
        poly = []
        for i in range(7):
            ang = i * math.tau / 7 + rng.random() * 0.22
            rr = r * (0.72 + rng.random() * 0.42)
            poly.append((x + math.cos(ang) * rr, y + math.sin(ang) * rr))
        d.polygon(pts(poly), fill=alpha(adjust(main, rng.randint(-22, 14)), 245), outline=alpha(accent, 120))
    add_sparkles(d, rng, accent, 5)


def draw_crystals(d, main, accent, rng):
    for x, h, w in [(188, 230, 58), (256, 286, 76), (324, 210, 54)]:
        top = (x, 92 + rng.randint(-18, 18))
        poly = [(x - w, top[1] + h * 0.52), top, (x + w, top[1] + h * 0.52), (x + w * 0.45, top[1] + h), (x - w * 0.45, top[1] + h)]
        d.polygon(pts(poly), fill=alpha(blend(main, accent, 0.25), 225), outline=alpha(adjust(accent, 42), 185))
        d.line(pts([top, (x, top[1] + h)]), fill=alpha(adjust(accent, 70), 120), width=p(3))
        d.line(pts([(x - w, top[1] + h * 0.52), (x + w, top[1] + h * 0.52)]), fill=alpha(adjust(accent, 40), 90), width=p(2))


def draw_wood(d, main, accent, rng):
    for i, y in enumerate((178, 238, 298)):
        d.rounded_rectangle(box((104 + i * 18, y, 404 + i * 18, y + 58)), radius=p(18), fill=alpha(adjust(main, i * 8), 255), outline=alpha(adjust(accent, 20), 130), width=p(3))
        for x in range(130 + i * 18, 386 + i * 18, 44):
            d.arc(box((x, y + 10, x + 36, y + 48)), 80, 280, fill=alpha(adjust(accent, 36), 95), width=p(2))
        d.line(pts([(124 + i * 18, y + 24), (386 + i * 18, y + 30)]), fill=alpha(adjust(accent, 55), 75), width=p(2))


def draw_hide(d, main, accent, rng):
    poly = [(252, 96), (340, 126), (396, 218), (360, 314), (400, 406), (292, 384), (246, 436), (190, 382), (96, 406), (142, 306), (108, 214), (166, 124)]
    d.polygon(pts(poly), fill=alpha(main, 250), outline=alpha(adjust(accent, 28), 150))
    for x, y in [(158, 208), (352, 214), (172, 340), (334, 342)]:
        d.ellipse(box((x - 10, y - 10, x + 10, y + 10)), fill=alpha(adjust(main, -42), 110))
    d.arc(box((164, 134, 348, 392)), 70, 290, fill=alpha(adjust(accent, 45), 90), width=p(3))


def draw_cloth(d, main, accent, rng):
    d.rounded_rectangle(box((144, 150, 366, 350)), radius=p(42), fill=alpha(main, 245), outline=alpha(adjust(accent, 22), 150), width=p(4))
    d.ellipse(box((118, 152, 202, 350)), fill=alpha(adjust(main, -18), 235), outline=alpha(adjust(accent, 30), 130), width=p(3))
    d.ellipse(box((310, 152, 394, 350)), fill=alpha(adjust(main, 12), 235), outline=alpha(adjust(accent, 30), 130), width=p(3))
    for y in (194, 246, 298):
        d.line(pts([(168, y), (350, y + rng.randint(-10, 10))]), fill=alpha(adjust(accent, 55), 92), width=p(3))


def draw_plant(d, key, main, accent, rng):
    d.line(pts([(256, 396), (250, 164)]), fill=alpha(adjust(main, 18), 240), width=p(8))
    for side in (-1, 1):
        for y in (196, 252, 308):
            x0 = 256 + side * 20
            x1 = 256 + side * 116
            d.ellipse(box((min(x0, x1), y - 34, max(x0, x1), y + 34)), fill=alpha(blend(main, accent, 0.25), 230), outline=alpha(adjust(accent, 24), 105), width=p(2))
    if "mushroom" in key:
        d.pieslice(box((154, 118, 358, 262)), 180, 360, fill=alpha(accent, 250), outline=alpha(adjust(accent, 35), 150), width=p(3))
        d.rounded_rectangle(box((230, 214, 282, 390)), radius=p(18), fill=alpha(adjust(main, 48), 240))
    elif "flower" in key or "bloom" in key:
        for ang in range(0, 360, 60):
            cx = 256 + math.cos(math.radians(ang)) * 44
            cy = 136 + math.sin(math.radians(ang)) * 36
            d.ellipse(box((cx - 30, cy - 22, cx + 30, cy + 22)), fill=alpha(accent, 220))
        d.ellipse(box((232, 116, 280, 164)), fill=alpha(adjust(accent, 68), 240))


def draw_vial(d, key, main, accent, rng):
    d.rounded_rectangle(box((210, 88, 302, 152)), radius=p(16), fill=alpha(adjust(main, -10), 235), outline=alpha(adjust(accent, 40), 140), width=p(3))
    d.polygon(pts([(176, 166), (336, 166), (374, 404), (138, 404)]), fill=alpha(blend(main, accent, 0.42), 170), outline=alpha(adjust(accent, 36), 170))
    d.line(pts([(166, 286), (350, 286)]), fill=alpha(adjust(accent, 64), 150), width=p(5))
    d.ellipse(box((206, 210, 244, 250)), fill=alpha(adjust(accent, 80), 120))
    d.ellipse(box((270, 318, 324, 372)), fill=alpha(adjust(accent, 55), 95))


def draw_organic(d, key, main, accent, rng):
    if "feather" in key:
        d.line(pts([(176, 402), (346, 94)]), fill=alpha(adjust(accent, 30), 235), width=p(8))
        for i in range(12):
            y = 350 - i * 22
            x = 196 + i * 12
            d.polygon(pts([(x, y), (346, 94 + i * 4), (x + 72, y - 28)]), fill=alpha(blend(main, accent, i / 14), 118), outline=alpha(accent, 68))
        return
    if "heart" in key:
        d.ellipse(box((152, 130, 274, 274)), fill=alpha(main, 245))
        d.ellipse(box((238, 130, 360, 274)), fill=alpha(adjust(main, 8), 245))
        d.polygon(pts([(132, 220), (380, 220), (256, 410)]), fill=alpha(main, 245), outline=alpha(adjust(accent, 24), 130))
        add_sparkles(d, rng, accent, 5)
        return
    if "fang" in key or "bone" in key:
        d.polygon(pts([(214, 92), (302, 92), (280, 392), (256, 430), (232, 392)]), fill=alpha((218, 210, 178), 245), outline=alpha(accent, 130))
        d.line(pts([(256, 124), (256, 394)]), fill=alpha((255, 255, 230), 90), width=p(3))
        return
    d.ellipse(box((148, 138, 364, 374)), fill=alpha(main, 230), outline=alpha(adjust(accent, 26), 135), width=p(4))
    d.ellipse(box((210, 190, 302, 288)), fill=alpha(adjust(accent, 30), 105))


def draw_material(d, key, main, accent, rng):
    k = key.lower()
    if any(s in k for s in ["wood", "timber", "board"]):
        draw_wood(d, main, accent, rng)
    elif any(s in k for s in ["ingot", "bar", "steel", "adamantium", "orichalcum", "dark_iron", "starmetal"]):
        draw_ingots(d, main, accent, rng)
    elif any(s in k for s in ["ore", "coal", "stone", "flint", "granite"]):
        draw_ore(d, main, accent, rng)
    elif any(s in k for s in ["crystal", "ruby", "sapphire", "diamond", "quartz", "geode", "shard", "heart"]):
        draw_crystals(d, main, accent, rng)
    elif any(s in k for s in ["hide", "leather", "pelt", "scale"]):
        draw_hide(d, main, accent, rng)
    elif any(s in k for s in ["cloth", "silk", "weave", "thread", "fiber"]):
        draw_cloth(d, main, accent, rng)
    elif any(s in k for s in ["herb", "mushroom", "root", "flower", "bloom", "lichen"]):
        draw_plant(d, k, main, accent, rng)
    elif any(s in k for s in ["blood", "tears", "oil", "essence", "dust", "powder", "resin", "sac", "gland"]):
        draw_vial(d, k, main, accent, rng)
    elif any(s in k for s in ["fang", "bone", "feather"]):
        draw_organic(d, k, main, accent, rng)
    else:
        d.rounded_rectangle(box((136, 154, 376, 386)), radius=p(38), fill=alpha(main, 245), outline=alpha(adjust(accent, 28), 150), width=p(4))
        d.polygon(pts([(136, 194), (256, 126), (376, 194), (256, 260)]), fill=alpha(adjust(main, 18), 230), outline=alpha(accent, 90))
        add_sparkles(d, rng, accent, 4)


def draw_tool(d, key, main, accent, rng):
    k = key.lower()
    if any(s in k for s in ["cart", "wagon", "forge", "lab", "kitchen"]):
        d.rounded_rectangle(box((116, 226, 396, 354)), radius=p(24), fill=alpha(main, 245), outline=alpha(adjust(accent, 28), 155), width=p(4))
        d.rectangle(box((142, 168, 366, 236)), fill=alpha(adjust(main, -18), 230), outline=alpha(accent, 120))
        d.ellipse(box((152, 336, 222, 406)), fill=alpha((24, 24, 24), 240), outline=alpha(adjust(accent, 20), 130), width=p(5))
        d.ellipse(box((290, 336, 360, 406)), fill=alpha((24, 24, 24), 240), outline=alpha(adjust(accent, 20), 130), width=p(5))
        if "alchemy" in k or "lab" in k:
            draw_vial(d, k, adjust(main, 10), accent, rng)
        elif "forge" in k:
            d.polygon(pts([(206, 148), (306, 148), (340, 232), (172, 232)]), fill=alpha((74, 48, 34), 230), outline=alpha(accent, 120))
            d.ellipse(box((220, 176, 292, 230)), fill=alpha((255, 112, 42), 130))
        return
    if any(s in k for s in ["pickaxe", "drill", "tunnel", "jack"]):
        d.line(pts([(166, 398), (330, 116)]), fill=alpha(adjust(main, 25), 245), width=p(22))
        d.arc(box((144, 82, 420, 232)), 190, 350, fill=alpha(accent, 240), width=p(22))
        d.line(pts([(176, 158), (394, 160)]), fill=alpha(adjust(accent, 42), 160), width=p(8))
        return
    if any(s in k for s in ["alchemy", "alch", "mortar", "pestle"]):
        draw_vial(d, k, main, accent, rng)
        d.rounded_rectangle(box((130, 308, 306, 398)), radius=p(34), fill=alpha(adjust(main, -18), 238), outline=alpha(accent, 130), width=p(4))
        d.line(pts([(310, 142), (380, 276)]), fill=alpha(accent, 220), width=p(14))
        return
    if any(s in k for s in ["cooking", "pot", "brazier", "evaporator"]):
        d.rounded_rectangle(box((132, 214, 380, 374)), radius=p(46), fill=alpha(main, 245), outline=alpha(adjust(accent, 25), 145), width=p(5))
        d.arc(box((158, 112, 354, 264)), 200, 340, fill=alpha(accent, 210), width=p(12))
        d.ellipse(box((178, 330, 334, 404)), fill=alpha((255, 96, 32), 92))
        return
    if any(s in k for s in ["butcher", "hunter"]):
        d.rounded_rectangle(box((124, 160, 388, 366)), radius=p(36), fill=alpha(adjust(main, -10), 238), outline=alpha(accent, 130), width=p(4))
        d.polygon(pts([(188, 150), (330, 292), (300, 324), (160, 184)]), fill=alpha((206, 214, 206), 245), outline=alpha(accent, 120))
        d.rectangle(box((132, 340, 388, 376)), fill=alpha(adjust(main, 12), 230))
        return
    if any(s in k for s in ["hammer", "anvil", "smith"]):
        d.rounded_rectangle(box((142, 122, 354, 184)), radius=p(18), fill=alpha(accent, 235), outline=alpha(adjust(accent, 46), 145), width=p(4))
        d.line(pts([(244, 178), (178, 396)]), fill=alpha(main, 250), width=p(24))
        d.polygon(pts([(198, 358), (358, 358), (404, 406), (154, 406)]), fill=alpha(adjust(main, -16), 235), outline=alpha(accent, 120))
        return
    d.rounded_rectangle(box((126, 172, 386, 380)), radius=p(34), fill=alpha(main, 245), outline=alpha(accent, 145), width=p(4))
    d.rectangle(box((160, 136, 352, 194)), fill=alpha(adjust(main, -20), 230), outline=alpha(accent, 110))
    d.line(pts([(162, 252), (350, 252)]), fill=alpha(adjust(accent, 40), 120), width=p(4))
    add_sparkles(d, rng, accent, 3)


def draw_belt(d, key, main, accent, rng):
    d.polygon(pts([(86, 236), (414, 160), (432, 236), (104, 314)]), fill=alpha(main, 248), outline=alpha(accent, 135))
    d.rounded_rectangle(box((218, 192, 302, 270)), radius=p(12), fill=alpha(adjust(accent, 4), 245), outline=alpha(adjust(accent, 62), 150), width=p(5))
    d.rounded_rectangle(box((238, 210, 282, 252)), radius=p(8), fill=(12, 12, 12, 150))
    for x in (136, 340):
        d.rounded_rectangle(box((x, 252, x + 62, 334)), radius=p(16), fill=alpha(adjust(main, -18), 240), outline=alpha(accent, 110), width=p(3))
    add_scratches(d, rng, accent, 4)


def draw_backpack(d, key, main, accent, rng):
    frame = "frame" in key or "load" in key
    if frame:
        d.line(pts([(128, 116), (128, 410)]), fill=alpha(accent, 220), width=p(10))
        d.line(pts([(384, 116), (384, 410)]), fill=alpha(accent, 220), width=p(10))
        d.line(pts([(128, 160), (384, 160)]), fill=alpha(accent, 160), width=p(8))
    d.rounded_rectangle(box((144, 110, 368, 410)), radius=p(44), fill=alpha(main, 248), outline=alpha(adjust(accent, 26), 150), width=p(5))
    d.rounded_rectangle(box((174, 250, 338, 380)), radius=p(28), fill=alpha(adjust(main, -22), 238), outline=alpha(accent, 110), width=p(3))
    d.line(pts([(186, 126), (186, 402)]), fill=alpha(adjust(accent, 42), 120), width=p(5))
    d.line(pts([(326, 126), (326, 402)]), fill=alpha(adjust(accent, 42), 120), width=p(5))
    d.rounded_rectangle(box((220, 84, 292, 132)), radius=p(20), fill=alpha(adjust(main, 12), 230), outline=alpha(accent, 100), width=p(3))
    add_sparkles(d, rng, accent, 3 if "void" in key or "planar" in key or "demiplane" in key else 0)


def draw_attachment(d, key, main, accent, rng):
    k = key.lower()
    if "quiver" in k or "arrow" in k or "bolt" in k:
        d.polygon(pts([(176, 142), (332, 118), (354, 400), (206, 426)]), fill=alpha(main, 242), outline=alpha(accent, 140))
        for x in (206, 244, 282, 320):
            d.line(pts([(x, 94), (x - 16, 232)]), fill=alpha(adjust(accent, 52), 210), width=p(6))
            d.polygon(pts([(x, 84), (x - 12, 108), (x + 12, 108)]), fill=alpha(adjust(accent, 72), 220))
        return
    if any(s in k for s in ["scabbard", "sheath", "frog", "loop"]):
        d.line(pts([(150, 402), (354, 108)]), fill=alpha(adjust(main, -20), 255), width=p(54))
        d.line(pts([(164, 394), (368, 100)]), fill=alpha(adjust(accent, 36), 170), width=p(8))
        d.rounded_rectangle(box((118, 236, 210, 316)), radius=p(18), fill=alpha(main, 230), outline=alpha(accent, 115), width=p(3))
        return
    if "hook" in k:
        d.arc(box((154, 116, 370, 350)), 270, 110, fill=alpha(accent, 245), width=p(30))
        d.line(pts([(262, 114), (262, 382)]), fill=alpha(main, 235), width=p(26))
        d.rounded_rectangle(box((174, 320, 338, 398)), radius=p(22), fill=alpha(adjust(main, -20), 235), outline=alpha(accent, 125), width=p(4))
        return
    if "bandolier" in k or "strap" in k:
        d.line(pts([(126, 96), (386, 416)]), fill=alpha(main, 250), width=p(64))
        for i in range(5):
            x = 156 + i * 48
            y = 138 + i * 58
            d.rounded_rectangle(box((x, y, x + 56, y + 70)), radius=p(12), fill=alpha(adjust(main, -24), 240), outline=alpha(accent, 110), width=p(3))
        return
    d.rounded_rectangle(box((150, 158, 362, 386)), radius=p(34), fill=alpha(main, 245), outline=alpha(accent, 130), width=p(4))
    d.rounded_rectangle(box((184, 220, 328, 374)), radius=p(24), fill=alpha(adjust(main, -18), 235), outline=alpha(adjust(accent, 20), 100), width=p(3))
    d.line(pts([(166, 182), (346, 182)]), fill=alpha(adjust(accent, 46), 115), width=p(4))


def draw_consumable(d, key, main, accent, rng):
    k = key.lower()
    if any(s in k for s in ["bandage", "dressing", "suture", "tourniquet"]):
        d.rounded_rectangle(box((128, 194, 384, 340)), radius=p(32), fill=alpha((212, 204, 178), 245), outline=alpha(accent, 130), width=p(4))
        for y in (214, 250, 286, 322):
            d.line(pts([(144, y), (368, y + rng.randint(-6, 6))]), fill=alpha(adjust(main, 54), 80), width=p(2))
        d.rounded_rectangle(box((196, 156, 316, 382)), radius=p(30), fill=alpha((230, 224, 198), 222), outline=alpha(adjust(accent, 34), 120), width=p(3))
        d.line(pts([(256, 170), (256, 368)]), fill=alpha(adjust(accent, 60), 90), width=p(4))
    elif any(s in k for s in ["splint", "bone_pin"]):
        for x in (204, 292):
            d.rounded_rectangle(box((x - 24, 116, x + 24, 398)), radius=p(16), fill=alpha(adjust(main, 20), 245), outline=alpha(accent, 120), width=p(3))
        for y in (168, 242, 318):
            d.rounded_rectangle(box((156, y, 356, y + 34)), radius=p(12), fill=alpha((220, 208, 172), 230), outline=alpha(adjust(accent, 32), 105), width=p(2))
    elif any(s in k for s in ["powder", "pack", "kit"]):
        d.rounded_rectangle(box((132, 152, 380, 384)), radius=p(36), fill=alpha(main, 245), outline=alpha(accent, 135), width=p(4))
        d.rounded_rectangle(box((158, 188, 354, 250)), radius=p(18), fill=alpha(adjust(main, -26), 230), outline=alpha(adjust(accent, 32), 105), width=p(2))
        d.line(pts([(196, 292), (316, 292)]), fill=alpha(adjust(accent, 58), 150), width=p(8))
        d.line(pts([(256, 232), (256, 352)]), fill=alpha(adjust(accent, 58), 150), width=p(8))
    elif any(s in k for s in ["ampoule", "draught", "stimulant", "wash"]):
        draw_vial(d, k, main, accent, rng)
    elif "gourd" in key:
        d.ellipse(box((150, 160, 362, 404)), fill=alpha(main, 245), outline=alpha(accent, 130), width=p(5))
        d.rounded_rectangle(box((224, 96, 288, 180)), radius=p(22), fill=alpha(adjust(main, 12), 230), outline=alpha(accent, 100), width=p(3))
    else:
        d.rounded_rectangle(box((184, 94, 328, 160)), radius=p(22), fill=alpha(adjust(main, 16), 238), outline=alpha(accent, 120), width=p(3))
        d.polygon(pts([(154, 166), (358, 166), (390, 394), (122, 394)]), fill=alpha(main, 242), outline=alpha(accent, 135))
        d.line(pts([(144, 288), (368, 288)]), fill=alpha(adjust(accent, 56), 140), width=p(5))
    d.ellipse(box((210, 224, 302, 312)), fill=alpha(adjust(accent, 42), 105))


def draw_weapon(d, key, main, accent, rng):
    k = key.lower()
    metal = blend(main, (224, 230, 220), 0.38)
    dark = adjust(main, -32)
    wood = blend((104, 66, 34), main, 0.18)

    if "bow" in k and "crossbow" not in k:
        d.arc(box((94, 78, 298, 438)), 275, 92, fill=alpha(accent, 245), width=p(18))
        d.line(pts([(202, 84), (202, 430)]), fill=alpha((236, 230, 198), 185), width=p(3))
        d.line(pts([(176, 262), (398, 262)]), fill=alpha(metal, 245), width=p(7))
        d.polygon(pts([(398, 262), (356, 244), (356, 280)]), fill=alpha(adjust(accent, 42), 235))
        d.polygon(pts([(156, 252), (112, 232), (126, 264), (112, 292)]), fill=alpha(adjust(accent, 14), 205))
        return

    if "crossbow" in k:
        d.line(pts([(134, 316), (374, 164)]), fill=alpha(wood, 255), width=p(24))
        d.rounded_rectangle(box((196, 214, 340, 282)), radius=p(18), fill=alpha(dark, 245), outline=alpha(accent, 130), width=p(3))
        d.arc(box((104, 122, 418, 332)), 190, 350, fill=alpha(accent, 245), width=p(16))
        d.line(pts([(122, 224), (396, 224)]), fill=alpha((232, 222, 184), 175), width=p(3))
        d.line(pts([(184, 254), (394, 254)]), fill=alpha(metal, 245), width=p(7))
        d.polygon(pts([(398, 254), (360, 238), (360, 270)]), fill=alpha(adjust(accent, 45), 235))
        return

    if any(s in k for s in ["staff", "rod", "wand"]):
        d.line(pts([(174, 418), (318, 96)]), fill=alpha(wood, 255), width=p(20))
        d.line(pts([(186, 396), (330, 74)]), fill=alpha(adjust(accent, 36), 115), width=p(5))
        d.ellipse(box((280, 74, 378, 172)), fill=alpha(blend(main, accent, 0.45), 190), outline=alpha(adjust(accent, 60), 220), width=p(5))
        d.ellipse(box((312, 104, 348, 140)), fill=alpha(adjust(accent, 82), 160))
        add_sparkles(d, rng, accent, 6)
        return

    if any(s in k for s in ["spear", "pike", "javelin", "piercer"]):
        d.line(pts([(160, 420), (330, 122)]), fill=alpha(wood, 255), width=p(14))
        d.polygon(pts([(330, 84), (382, 172), (316, 144)]), fill=alpha(metal, 250), outline=alpha(adjust(accent, 38), 145))
        d.line(pts([(322, 146), (364, 168)]), fill=alpha(adjust(accent, 55), 130), width=p(4))
        d.rounded_rectangle(box((194, 306, 242, 346)), radius=p(8), fill=alpha(adjust(accent, 8), 220))
        return

    if any(s in k for s in ["dagger", "knife"]):
        d.polygon(pts([(244, 82), (316, 246), (264, 330), (196, 248)]), fill=alpha(metal, 250), outline=alpha(adjust(accent, 32), 150))
        d.line(pts([(244, 116), (258, 316)]), fill=alpha((255, 255, 240), 95), width=p(3))
        d.rounded_rectangle(box((180, 302, 310, 340)), radius=p(12), fill=alpha(accent, 235), outline=alpha(adjust(accent, 54), 130), width=p(3))
        d.line(pts([(242, 334), (198, 426)]), fill=alpha(wood, 255), width=p(24))
        return

    if "chakram" in k or "disc" in k:
        d.ellipse(box((130, 126, 382, 378)), fill=alpha(metal, 230), outline=alpha(adjust(accent, 50), 190), width=p(14))
        d.ellipse(box((206, 202, 306, 302)), fill=alpha((14, 15, 15), 220), outline=alpha(adjust(accent, 35), 140), width=p(5))
        for ang in range(0, 360, 60):
            x = 256 + math.cos(math.radians(ang)) * 118
            y = 252 + math.sin(math.radians(ang)) * 118
            d.polygon(pts([(256, 252), (x, y), (256 + math.cos(math.radians(ang + 16)) * 84, 252 + math.sin(math.radians(ang + 16)) * 84)]), fill=alpha(adjust(accent, 15), 78))
        return

    if "flail" in k:
        d.line(pts([(146, 386), (258, 234)]), fill=alpha(wood, 255), width=p(24))
        d.rounded_rectangle(box((126, 374, 178, 430)), radius=p(14), fill=alpha(accent, 235), outline=alpha(adjust(accent, 50), 120), width=p(3))
        for i in range(5):
            d.ellipse(box((266 + i * 22, 198 - i * 14, 284 + i * 22, 216 - i * 14)), fill=alpha(metal, 215), outline=alpha(adjust(accent, 40), 115))
        d.ellipse(box((342, 98, 430, 186)), fill=alpha(dark, 250), outline=alpha(adjust(accent, 42), 160), width=p(4))
        for x, y in [(386, 82), (424, 124), (388, 202), (330, 142)]:
            d.line(pts([(386, 142), (x, y)]), fill=alpha(adjust(accent, 48), 190), width=p(5))
        return

    if any(s in k for s in ["mace", "crusher"]):
        d.line(pts([(164, 408), (310, 164)]), fill=alpha(wood, 255), width=p(24))
        d.ellipse(box((282, 96, 390, 204)), fill=alpha(dark, 250), outline=alpha(adjust(accent, 45), 165), width=p(5))
        for x, y in [(336, 72), (392, 106), (398, 178), (306, 208)]:
            d.polygon(pts([(336, 150), (x, y), (346, 150)]), fill=alpha(adjust(accent, 28), 205))
        return

    if any(s in k for s in ["hammer", "warhammer"]):
        d.line(pts([(154, 410), (300, 172)]), fill=alpha(wood, 255), width=p(24))
        d.rounded_rectangle(box((244, 110, 402, 190)), radius=p(18), fill=alpha(metal, 245), outline=alpha(adjust(accent, 36), 145), width=p(4))
        d.polygon(pts([(398, 118), (452, 146), (398, 182)]), fill=alpha(adjust(accent, 8), 220), outline=alpha(adjust(accent, 38), 130))
        return

    if "axe" in k:
        d.line(pts([(168, 420), (300, 118)]), fill=alpha(wood, 255), width=p(22))
        d.polygon(pts([(276, 108), (410, 126), (360, 254), (286, 214)]), fill=alpha(metal, 245), outline=alpha(adjust(accent, 40), 150))
        if "great" in k or "splitter" in k:
            d.polygon(pts([(284, 116), (168, 130), (210, 258), (290, 216)]), fill=alpha(blend(metal, accent, 0.15), 235), outline=alpha(adjust(accent, 36), 140))
        d.line(pts([(298, 132), (274, 214)]), fill=alpha(adjust(accent, 54), 100), width=p(4))
        return

    # Sword, greatsword, blade, and legendary slash silhouettes.
    width = 64 if any(s in k for s in ["great", "world", "cataclysm"]) else 46
    d.polygon(pts([(256, 58), (256 + width, 288), (256, 360), (256 - width, 288)]), fill=alpha(metal, 250), outline=alpha(adjust(accent, 40), 150))
    d.line(pts([(256, 86), (256, 344)]), fill=alpha((255, 255, 235), 90), width=p(4))
    d.rounded_rectangle(box((160, 342, 352, 382)), radius=p(12), fill=alpha(accent, 235), outline=alpha(adjust(accent, 50), 130), width=p(4))
    d.line(pts([(256, 376), (256, 444)]), fill=alpha(wood, 255), width=p(28))
    d.ellipse(box((232, 422, 280, 470)), fill=alpha(adjust(accent, 12), 230), outline=alpha(adjust(accent, 58), 120), width=p(3))


def draw_potion(d, key, main, accent, rng):
    k = key.lower()
    liquid = accent
    if any(s in k for s in ["health", "healing", "vital", "blood", "restore"]):
        liquid = (210, 54, 58)
    elif any(s in k for s in ["mana", "arcane", "focus"]):
        liquid = (72, 116, 230)
    elif any(s in k for s in ["stamina", "energy", "haste", "swift"]):
        liquid = (92, 204, 86)
    elif any(s in k for s in ["poison", "venom", "toxic"]):
        liquid = (94, 190, 72)

    if any(s in k for s in ["elixir", "draught", "greater", "supreme"]):
        d.rounded_rectangle(box((214, 80, 298, 142)), radius=p(18), fill=alpha(adjust(main, 18), 230), outline=alpha(liquid, 120), width=p(3))
        d.polygon(pts([(164, 154), (348, 154), (390, 388), (122, 388)]), fill=alpha(blend(main, liquid, 0.34), 152), outline=alpha(adjust(liquid, 36), 170))
        d.line(pts([(148, 286), (368, 286)]), fill=alpha(adjust(liquid, 50), 165), width=p(6))
        d.ellipse(box((210, 206, 302, 298)), fill=alpha(adjust(liquid, 36), 108))
    elif any(s in k for s in ["vial", "ampoule", "needle"]):
        d.rounded_rectangle(box((220, 76, 292, 136)), radius=p(15), fill=alpha(adjust(main, 18), 230), outline=alpha(liquid, 120), width=p(3))
        d.rounded_rectangle(box((194, 124, 318, 410)), radius=p(44), fill=alpha(blend(main, liquid, 0.28), 160), outline=alpha(adjust(liquid, 36), 170), width=p(4))
        d.line(pts([(196, 292), (316, 292)]), fill=alpha(adjust(liquid, 55), 160), width=p(5))
    else:
        draw_vial(d, k, main, liquid, rng)
    d.ellipse(box((222, 210, 258, 246)), fill=alpha(adjust(liquid, 72), 115))
    d.ellipse(box((278, 316, 326, 366)), fill=alpha(adjust(liquid, 50), 86))


def draw_food(d, key, main, accent, rng):
    k = key.lower()
    if any(s in k for s in ["ale", "brandy", "brew", "wine", "mead", "tea", "drink", "water", "skin", "flask"]):
        d.rounded_rectangle(box((202, 86, 310, 156)), radius=p(20), fill=alpha(adjust(main, 10), 238), outline=alpha(accent, 120), width=p(3))
        d.polygon(pts([(170, 160), (342, 160), (374, 402), (138, 402)]), fill=alpha(main, 242), outline=alpha(accent, 135))
        d.line(pts([(154, 288), (358, 288)]), fill=alpha(adjust(accent, 56), 140), width=p(5))
        d.ellipse(box((210, 216, 302, 306)), fill=alpha(adjust(accent, 36), 105))
        return
    if any(s in k for s in ["stew", "soup", "broth", "meal"]):
        d.rounded_rectangle(box((116, 244, 396, 382)), radius=p(50), fill=alpha(adjust(main, -8), 245), outline=alpha(accent, 145), width=p(5))
        d.ellipse(box((138, 202, 374, 310)), fill=alpha((96, 62, 34), 235), outline=alpha(adjust(accent, 38), 125), width=p(4))
        for _ in range(8):
            x = rng.randint(178, 334)
            y = rng.randint(222, 278)
            d.ellipse(box((x - 9, y - 7, x + 9, y + 7)), fill=alpha(adjust(accent, rng.randint(-20, 35)), 190))
        return
    if any(s in k for s in ["meat", "roast", "haunch", "jerky", "fish"]):
        d.ellipse(box((146, 174, 380, 342)), fill=alpha((156, 74, 48), 245), outline=alpha(adjust(accent, 20), 135), width=p(4))
        d.ellipse(box((118, 202, 210, 310)), fill=alpha((220, 206, 164), 235), outline=alpha(accent, 110), width=p(3))
        d.ellipse(box((154, 236, 194, 280)), fill=alpha((250, 240, 200), 210))
        d.line(pts([(210, 220), (356, 300)]), fill=alpha(adjust(accent, 46), 80), width=p(4))
        return
    if any(s in k for s in ["bread", "loaf", "pie", "tart", "cake"]):
        d.ellipse(box((122, 188, 390, 352)), fill=alpha((174, 112, 52), 245), outline=alpha(adjust(accent, 30), 145), width=p(5))
        for x in (178, 238, 298):
            d.arc(box((x, 188, x + 82, 328)), 195, 340, fill=alpha(adjust(accent, 60), 115), width=p(4))
        d.rounded_rectangle(box((150, 318, 362, 376)), radius=p(26), fill=alpha(adjust(main, -10), 220))
        return
    if any(s in k for s in ["apple", "berry", "fruit", "honey", "mushroom"]):
        for _ in range(5):
            x = rng.randint(156, 338)
            y = rng.randint(156, 330)
            r = rng.randint(28, 46)
            d.ellipse(box((x - r, y - r, x + r, y + r)), fill=alpha(blend(main, accent, rng.random() * 0.5), 235), outline=alpha(adjust(accent, 30), 110), width=p(2))
        d.line(pts([(256, 158), (276, 110)]), fill=alpha((88, 62, 34), 225), width=p(8))
        d.ellipse(box((278, 102, 344, 148)), fill=alpha((84, 146, 70), 180))
        return
    d.rounded_rectangle(box((130, 174, 382, 360)), radius=p(48), fill=alpha(main, 242), outline=alpha(accent, 138), width=p(5))
    d.line(pts([(160, 238), (354, 238)]), fill=alpha(adjust(accent, 48), 100), width=p(4))
    d.ellipse(box((198, 270, 314, 352)), fill=alpha(adjust(accent, 20), 90))


def draw_throwable(d, key, main, accent, rng):
    k = key.lower()
    if any(s in k for s in ["javelin", "dart", "knife", "dagger"]):
        draw_weapon(d, k if "javelin" in k else "throwing_knife", main, accent, rng)
        return
    if any(s in k for s in ["flask", "fire", "acid", "oil", "bomb", "grenade", "powder"]):
        d.ellipse(box((160, 170, 352, 402)), fill=alpha(main, 240), outline=alpha(adjust(accent, 32), 150), width=p(5))
        d.rounded_rectangle(box((214, 116, 298, 190)), radius=p(18), fill=alpha(adjust(main, -12), 230), outline=alpha(accent, 120), width=p(3))
        d.line(pts([(256, 116), (320, 66)]), fill=alpha((220, 196, 132), 230), width=p(8))
        d.ellipse(box((306, 46, 354, 92)), fill=alpha((255, 108, 42), 155), outline=alpha((255, 190, 70), 110))
        d.ellipse(box((210, 232, 302, 324)), fill=alpha(adjust(accent, 48), 105))
        return
    if any(s in k for s in ["stone", "shard", "crystal"]):
        draw_crystals(d, main, accent, rng)
        return
    d.ellipse(box((154, 152, 358, 356)), fill=alpha(main, 242), outline=alpha(adjust(accent, 35), 145), width=p(5))
    d.rounded_rectangle(box((224, 112, 288, 182)), radius=p(18), fill=alpha(adjust(main, -18), 230), outline=alpha(accent, 120), width=p(3))
    d.line(pts([(254, 108), (330, 72)]), fill=alpha(adjust(accent, 30), 200), width=p(6))


def spell_palette(key, main, accent):
    k = key.lower()
    if any(s in k for s in ["fire", "flame", "burn", "ember"]):
        return (128, 42, 30), (255, 116, 42)
    if any(s in k for s in ["ice", "frost", "cold"]):
        return (68, 116, 146), (166, 238, 255)
    if any(s in k for s in ["lightning", "storm", "thunder"]):
        return (78, 74, 146), (238, 230, 88)
    if any(s in k for s in ["earth", "stone", "root", "thorn"]):
        return (82, 100, 58), (150, 214, 98)
    if any(s in k for s in ["heal", "life", "holy", "sun"]):
        return (120, 110, 54), (255, 232, 112)
    if any(s in k for s in ["shadow", "void", "death"]):
        return (50, 34, 72), (174, 94, 240)
    if any(s in k for s in ["water", "wave"]):
        return (42, 96, 136), (112, 218, 248)
    return main, accent


def draw_spell(d, key, main, accent, rng):
    k = key.lower()
    main, accent = spell_palette(k, main, accent)
    center = (256, 256)
    for r, a in [(158, 44), (116, 68), (76, 92)]:
        d.ellipse(box((center[0] - r, center[1] - r, center[0] + r, center[1] + r)), outline=alpha(adjust(accent, 30), a), width=p(5))
    for i in range(8):
        ang = math.tau * i / 8 + rng.random() * 0.08
        x1 = center[0] + math.cos(ang) * 70
        y1 = center[1] + math.sin(ang) * 70
        x2 = center[0] + math.cos(ang) * 174
        y2 = center[1] + math.sin(ang) * 174
        d.line((p(x1), p(y1), p(x2), p(y2)), fill=alpha(accent, 116), width=p(4))
    if any(s in k for s in ["bolt", "ray", "lance", "beam"]):
        d.polygon(pts([(118, 286), (286, 122), (252, 246), (394, 218), (224, 390), (262, 270)]), fill=alpha(accent, 205), outline=alpha(adjust(accent, 60), 145))
    elif any(s in k for s in ["shield", "ward", "barrier"]):
        d.polygon(pts([(256, 98), (380, 148), (348, 336), (256, 418), (164, 336), (132, 148)]), fill=alpha(blend(main, accent, 0.35), 118), outline=alpha(adjust(accent, 50), 210))
        d.line(pts([(256, 126), (256, 384)]), fill=alpha(adjust(accent, 60), 110), width=p(4))
    elif any(s in k for s in ["summon", "circle", "ritual"]):
        for ang in range(0, 360, 72):
            x = center[0] + math.cos(math.radians(ang)) * 104
            y = center[1] + math.sin(math.radians(ang)) * 104
            d.polygon(pts([(x, y - 18), (x + 18, y), (x, y + 18), (x - 18, y)]), fill=alpha(adjust(accent, 40), 190))
    else:
        d.ellipse(box((186, 184, 326, 324)), fill=alpha(blend(main, accent, 0.5), 170), outline=alpha(adjust(accent, 64), 210), width=p(6))
        d.ellipse(box((226, 224, 286, 284)), fill=alpha(adjust(accent, 80), 150))
    add_sparkles(d, rng, accent, 10)


def generate_icon(catalog: str, key: str, output: Path, overwrite: bool = False, size: int = SIZE):
    if output.exists() and not overwrite:
        return False
    main, accent = palette_for(catalog, key)
    img, d, rng = make_canvas(catalog, key, main, accent)

    if catalog == "armor":
        draw_armor(d, key, main, accent, rng)
    elif catalog == "materials":
        draw_material(d, key, main, accent, rng)
    elif catalog == "weapons":
        draw_weapon(d, key, main, accent, rng)
    elif catalog == "potions":
        draw_potion(d, key, main, accent, rng)
    elif catalog == "food":
        draw_food(d, key, main, accent, rng)
    elif catalog == "spells":
        draw_spell(d, key, main, accent, rng)
    elif catalog == "throwables":
        draw_throwable(d, key, main, accent, rng)
    elif catalog == "tools":
        draw_tool(d, key, main, accent, rng)
    elif catalog == "belts":
        draw_belt(d, key, main, accent, rng)
    elif catalog == "backpacks":
        draw_backpack(d, key, main, accent, rng)
    elif catalog == "attachments":
        draw_attachment(d, key, main, accent, rng)
    elif catalog == "consumables":
        draw_consumable(d, key, main, accent, rng)
    else:
        draw_material(d, key, main, accent, rng)

    add_sparkles(d, rng, accent, 2)
    img = img.resize((size, size), Image.Resampling.LANCZOS).convert("RGB")
    output.parent.mkdir(parents=True, exist_ok=True)
    img.save(output, "WEBP", quality=88, method=6)
    return True


def missing_icons():
    js = """
import('./module/services/content-asset-audit-service.mjs').then(async m => {
  const report = await m.auditIronHillsAssets({ checkFilesystem: true });
  const rows = report.findings
    .filter(f => f.code === 'missing-system-image' && f.details?.img)
    .map(f => ({
      catalog: f.context.catalog,
      pack: f.context.pack,
      key: f.context.key,
      img: f.details.img
    }));
  console.log(JSON.stringify(rows));
}).catch(err => {
  console.error(err?.stack || err);
  process.exit(1);
});
""".strip()
    out = subprocess.check_output(["node", "-e", js], cwd=ROOT, text=True, encoding="utf-8")
    return json.loads(out)


def art_backlog_icons(manifest: Path, catalogs=None):
    data = json.loads(manifest.read_text(encoding="utf-8"))
    wanted = {str(value).strip() for value in (catalogs or []) if str(value).strip()}
    rows = []
    for item in data.get("items", []):
        catalog = str(item.get("catalog") or "").strip()
        item_type = str(item.get("type") or "").strip()
        if wanted and catalog not in wanted and item_type not in wanted:
            continue
        rows.append({
            "catalog": catalog,
            "pack": "",
            "key": item.get("id"),
            "img": item.get("targetImg"),
        })
    return [row for row in rows if row["catalog"] and row["key"] and row["img"]]


def output_path(img_path: str) -> Path:
    normalized = img_path.replace("\\", "/")
    if not normalized.startswith(SYSTEM_PREFIX):
        raise ValueError(f"Unsupported path outside system assets: {img_path}")
    return ROOT / normalized[len(SYSTEM_PREFIX):]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--art-backlog", type=Path, help="read image targets from docs/content/art-backlog.json")
    parser.add_argument("--dev-placeholder-art", action="store_true", help="allow placeholder generation from art backlog; not for final content art")
    parser.add_argument("--catalog", "--type", dest="catalogs", action="append", default=[], help="limit to one catalog/type; can be repeated")
    parser.add_argument("--overwrite", action="store_true", help="replace existing icon files")
    parser.add_argument("--limit", type=int, default=0, help="generate at most N icons")
    parser.add_argument("--size", type=int, default=SIZE, help="output square icon size")
    args = parser.parse_args()

    if args.art_backlog and not args.dev_placeholder_art:
        parser.error("--art-backlog requires --dev-placeholder-art because this generator creates placeholder art, not final content images")

    if args.art_backlog:
        rows = art_backlog_icons(args.art_backlog, args.catalogs)
        source = "art-backlog"
    else:
        rows = missing_icons()
        if args.catalogs:
            wanted = set(args.catalogs)
            rows = [row for row in rows if row["catalog"] in wanted]
        source = "missing-system-image"

    if args.limit > 0:
        rows = rows[:args.limit]

    generated = []
    skipped = []
    for row in rows:
        path = output_path(row["img"])
        if generate_icon(row["catalog"], row["key"], path, overwrite=args.overwrite, size=args.size):
            generated.append(path)
        else:
            skipped.append(path)

    by_catalog = {}
    for row in rows:
        by_catalog[row["catalog"]] = by_catalog.get(row["catalog"], 0) + 1

    print(json.dumps({
        "source": source,
        "requested": len(rows),
        "generated": len(generated),
        "skipped": len(skipped),
        "byCatalog": by_catalog,
        "firstGenerated": [str(path.relative_to(ROOT)).replace("\\", "/") for path in generated[:12]],
        "firstSkipped": [str(path.relative_to(ROOT)).replace("\\", "/") for path in skipped[:12]],
    }, indent=2))


if __name__ == "__main__":
    main()
