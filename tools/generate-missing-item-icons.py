#!/usr/bin/env python3
"""
Generate deterministic WebP item icons for missing Iron Hills catalog assets.

The script asks the JS asset audit for missing system-local image paths, then
draws stylized fantasy item icons with Pillow. Existing assets are never
overwritten unless --overwrite is supplied.
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
    if "gourd" in key:
        d.ellipse(box((150, 160, 362, 404)), fill=alpha(main, 245), outline=alpha(accent, 130), width=p(5))
        d.rounded_rectangle(box((224, 96, 288, 180)), radius=p(22), fill=alpha(adjust(main, 12), 230), outline=alpha(accent, 100), width=p(3))
    else:
        d.rounded_rectangle(box((184, 94, 328, 160)), radius=p(22), fill=alpha(adjust(main, 16), 238), outline=alpha(accent, 120), width=p(3))
        d.polygon(pts([(154, 166), (358, 166), (390, 394), (122, 394)]), fill=alpha(main, 242), outline=alpha(accent, 135))
        d.line(pts([(144, 288), (368, 288)]), fill=alpha(adjust(accent, 56), 140), width=p(5))
    d.ellipse(box((210, 224, 302, 312)), fill=alpha(adjust(accent, 42), 105))


def generate_icon(catalog: str, key: str, output: Path, overwrite: bool = False, size: int = SIZE):
    if output.exists() and not overwrite:
        return False
    main, accent = palette_for(catalog, key)
    img, d, rng = make_canvas(catalog, key, main, accent)

    if catalog == "armor":
        draw_armor(d, key, main, accent, rng)
    elif catalog == "materials":
        draw_material(d, key, main, accent, rng)
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


def output_path(img_path: str) -> Path:
    normalized = img_path.replace("\\", "/")
    if not normalized.startswith(SYSTEM_PREFIX):
        raise ValueError(f"Unsupported path outside system assets: {img_path}")
    return ROOT / normalized[len(SYSTEM_PREFIX):]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--overwrite", action="store_true", help="replace existing icon files")
    parser.add_argument("--limit", type=int, default=0, help="generate at most N icons")
    parser.add_argument("--size", type=int, default=SIZE, help="output square icon size")
    args = parser.parse_args()

    rows = missing_icons()
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
        "requested": len(rows),
        "generated": len(generated),
        "skipped": len(skipped),
        "byCatalog": by_catalog,
        "firstGenerated": [str(path.relative_to(ROOT)).replace("\\", "/") for path in generated[:12]],
    }, indent=2))


if __name__ == "__main__":
    main()
