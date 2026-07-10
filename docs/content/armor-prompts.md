# Iron Hills — AI-промпты для брони и щитов

> Автогенерация из `ARMORS` (см. `tools/generate-armor-prompts.mjs`).
> `node tools/generate-armor-prompts.mjs`

**Использование:**
- Каждый промпт содержит `--ar` для aspect ratio.
- Клади спрайты в `icons/items/armor/{id}.webp` (или путь из `armorToItem` по умолчанию).

**Negative prompt (общий):**
```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw
```

**Negative prompt (shield):**
```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```


## Тир 1

### Тяж. Кожаная шапка *(`heavy_leather_cap`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Кожаная шапка", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Кожаная шапка *(`leather_cap`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Кожаная шапка", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Средн. Кожаная шапка *(`medium_leather_cap`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Кожаная шапка", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Тяж. Кожаный наруч (л) *(`heavy_leather_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Кожаный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, dim warm campfire light --ar 1:2
```

### Кожаный наруч (л) *(`leather_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Кожаный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, dim warm campfire light --ar 1:2
```

### Средн. Кожаный наруч (л) *(`medium_leather_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Средн. Кожаный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, dim warm campfire light --ar 1:2
```

### Тяж. Деревянный щит *(`heavy_wooden_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Деревянный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, heavy shield profile, broad tower or war shield, thick solid face, high durability, imposing mass, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Средн. Деревянный щит *(`medium_wooden_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Деревянный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, medium shield profile, sturdy heater or kite shield, reinforced solid face, balanced weight, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Деревянный щит *(`wooden_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Деревянный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, light shield profile, small agile buckler or heater shield, slim solid face, quick straps, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Тяж. Кожаные сапоги *(`heavy_leather_boots`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Кожаные сапоги", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Кожаные сапоги *(`leather_boots`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Кожаные сапоги", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Средн. Кожаные сапоги *(`medium_leather_boots`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Кожаные сапоги", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Тяж. Кожаный горжет *(`heavy_leather_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Кожаный горжет", a single fantasy gorget / neck guard collar armor piece, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Кожаный горжет *(`leather_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Кожаный горжет", a single fantasy gorget / neck guard collar armor piece, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Средн. Кожаный горжет *(`medium_leather_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Кожаный горжет", a single fantasy gorget / neck guard collar armor piece, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Тяж. Кожаный наруч (п) *(`heavy_leather_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Кожаный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, dim warm campfire light --ar 1:2
```

### Кожаный наруч (п) *(`leather_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Кожаный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, dim warm campfire light --ar 1:2
```

### Кожаные перчатки *(`leather_gloves`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Кожаные перчатки", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, dim warm campfire light --ar 1:2
```

### Средн. Кожаный наруч (п) *(`medium_leather_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Средн. Кожаный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, dim warm campfire light --ar 1:2
```

### Тяж. Кожаная куртка *(`heavy_leather_jacket`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Кожаная куртка", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Кожаная куртка *(`leather_jacket`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Кожаная куртка", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Средн. Кожаная куртка *(`medium_leather_jacket`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Кожаная куртка", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```


## Тир 2

### Кольчужный капюшон *(`chainmail_coif`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Кольчужный капюшон", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Тяж. Кольчужный капюшон *(`heavy_chainmail_coif`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Кольчужный капюшон", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Лёгк. Кольчужный капюшон *(`light_chainmail_coif`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Кольчужный капюшон", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Кольчужный рукав (л) *(`chain_sleeves_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Кольчужный рукав (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, neutral daylight --ar 1:2
```

### Тяж. Кольчужный рукав (л) *(`heavy_chain_sleeves_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Кольчужный рукав (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, neutral daylight --ar 1:2
```

### Лёгк. Кольчужный рукав (л) *(`light_chain_sleeves_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Кольчужный рукав (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, neutral daylight --ar 1:2
```

### Тяж. Железный щит *(`heavy_iron_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Железный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, heavy shield profile, broad tower or war shield, thick solid face, high durability, imposing mass, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Железный щит *(`iron_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Железный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, medium shield profile, sturdy heater or kite shield, reinforced solid face, balanced weight, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Лёгк. Железный щит *(`light_iron_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Железный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, light shield profile, small agile buckler or heater shield, slim solid face, quick straps, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Кольчужные поножи *(`chain_leggings`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Кольчужные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Тяж. Кольчужные поножи *(`heavy_chain_leggings`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Кольчужные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Лёгк. Кольчужные поножи *(`light_chain_leggings`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Кольчужные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Кольчужный горжет *(`chain_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Кольчужный горжет", a single fantasy gorget / neck guard collar armor piece, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Тяж. Кольчужный горжет *(`heavy_chain_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Кольчужный горжет", a single fantasy gorget / neck guard collar armor piece, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Лёгк. Кольчужный горжет *(`light_chain_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Кольчужный горжет", a single fantasy gorget / neck guard collar armor piece, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Кольчужный рукав (п) *(`chain_sleeves_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Кольчужный рукав (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, neutral daylight --ar 1:2
```

### Тяж. Кольчужный рукав (п) *(`heavy_chain_sleeves_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Кольчужный рукав (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, neutral daylight --ar 1:2
```

### Лёгк. Кольчужный рукав (п) *(`light_chain_sleeves_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Кольчужный рукав (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, neutral daylight --ar 1:2
```

### Кольчуга *(`chainmail`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Кольчуга", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Тяж. Кольчуга *(`heavy_chainmail`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Кольчуга", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Лёгк. Кольчуга *(`light_chainmail`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Кольчуга", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```


## Тир 3

### Лёгк. Стальной шлем *(`light_plate_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Стальной шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Средн. Стальной шлем *(`medium_plate_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Стальной шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Стальной шлем *(`plate_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Стальной шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Лёгк. Стальной наруч (л) *(`light_plate_arms_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Стальной наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, forge embers glow in background --ar 1:2
```

### Средн. Стальной наруч (л) *(`medium_plate_arms_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Средн. Стальной наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, forge embers glow in background --ar 1:2
```

### Стальной наруч (л) *(`plate_arms_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Стальной наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, forge embers glow in background --ar 1:2
```

### Рыцарский щит *(`kite_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Рыцарский щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, heavy shield profile, broad tower or war shield, thick solid face, high durability, imposing mass, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Лёгк. Рыцарский щит *(`light_kite_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Рыцарский щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, light shield profile, small agile buckler or heater shield, slim solid face, quick straps, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Средн. Рыцарский щит *(`medium_kite_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Рыцарский щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, medium shield profile, sturdy heater or kite shield, reinforced solid face, balanced weight, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Лёгк. Набедренники *(`light_plate_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Набедренники", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Средн. Набедренники *(`medium_plate_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Набедренники", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Набедренники *(`plate_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Набедренники", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Лёгк. Стальной горжет *(`light_plate_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Стальной горжет", a single fantasy gorget / neck guard collar armor piece, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Средн. Стальной горжет *(`medium_plate_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Стальной горжет", a single fantasy gorget / neck guard collar armor piece, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Стальной горжет *(`plate_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Стальной горжет", a single fantasy gorget / neck guard collar armor piece, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Лёгк. Стальной наруч (п) *(`light_plate_arms_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Стальной наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, forge embers glow in background --ar 1:2
```

### Средн. Стальной наруч (п) *(`medium_plate_arms_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Средн. Стальной наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, forge embers glow in background --ar 1:2
```

### Стальной наруч (п) *(`plate_arms_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Стальной наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, forge embers glow in background --ar 1:2
```

### Лёгк. Нагрудник *(`light_plate_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Средн. Нагрудник *(`medium_plate_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Нагрудник *(`plate_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```


## Тир 4

### Легированный шлем *(`alloy_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Легированный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Тяж. Легированный шлем *(`heavy_alloy_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Легированный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Лёгк. Легированный шлем *(`light_alloy_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Легированный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Легир. наруч (л) *(`alloy_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Легир. наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, clean white studio light --ar 1:2
```

### Тяж. Легир. наруч (л) *(`heavy_alloy_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Легир. наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, clean white studio light --ar 1:2
```

### Лёгк. Легир. наруч (л) *(`light_alloy_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Легир. наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, clean white studio light --ar 1:2
```

### Лёгк. Башенный щит *(`light_tower_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Башенный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, light shield profile, small agile buckler or heater shield, slim solid face, quick straps, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Средн. Башенный щит *(`medium_tower_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Башенный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, medium shield profile, sturdy heater or kite shield, reinforced solid face, balanced weight, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Башенный щит *(`tower_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Башенный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, heavy shield profile, broad tower or war shield, thick solid face, high durability, imposing mass, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Легированные поножи *(`alloy_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Легированные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Тяж. Легированные поножи *(`heavy_alloy_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Легированные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Лёгк. Легированные поножи *(`light_alloy_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Легированные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Легир. горжет *(`alloy_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Легир. горжет", a single fantasy gorget / neck guard collar armor piece, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Тяж. Легир. горжет *(`heavy_alloy_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Легир. горжет", a single fantasy gorget / neck guard collar armor piece, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Лёгк. Легир. горжет *(`light_alloy_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Легир. горжет", a single fantasy gorget / neck guard collar armor piece, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Легир. наруч (п) *(`alloy_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Легир. наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, clean white studio light --ar 1:2
```

### Тяж. Легир. наруч (п) *(`heavy_alloy_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Легир. наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, clean white studio light --ar 1:2
```

### Лёгк. Легир. наруч (п) *(`light_alloy_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Легир. наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, clean white studio light --ar 1:2
```

### Легированный панцирь *(`alloy_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Легированный панцирь", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Тяж. Легированный панцирь *(`heavy_alloy_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Легированный панцирь", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Лёгк. Легированный панцирь *(`light_alloy_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Легированный панцирь", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```


## Тир 5

### Тяж. Митрильный шлем *(`heavy_mithril_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Митрильный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Средн. Митрильный шлем *(`medium_mithril_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Митрильный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Митрильный шлем *(`mithril_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Митрильный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Тяж. Митрильный наруч (л) *(`heavy_mithril_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Митрильный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cool blue rim light --ar 1:2
```

### Средн. Митрильный наруч (л) *(`medium_mithril_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Средн. Митрильный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cool blue rim light --ar 1:2
```

### Митрильный наруч (л) *(`mithril_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Митрильный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cool blue rim light --ar 1:2
```

### Тяж. Митрильный щит *(`heavy_mithril_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Митрильный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, heavy shield profile, broad tower or war shield, thick solid face, high durability, imposing mass, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Средн. Митрильный щит *(`medium_mithril_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Митрильный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, medium shield profile, sturdy heater or kite shield, reinforced solid face, balanced weight, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Митрильный щит *(`mithril_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Митрильный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, light shield profile, small agile buckler or heater shield, slim solid face, quick straps, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Тяж. Митрильные поножи *(`heavy_mithril_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Митрильные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Средн. Митрильные поножи *(`medium_mithril_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Митрильные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Митрильные поножи *(`mithril_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Митрильные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Тяж. Митрильный горжет *(`heavy_mithril_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Митрильный горжет", a single fantasy gorget / neck guard collar armor piece, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Средн. Митрильный горжет *(`medium_mithril_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Митрильный горжет", a single fantasy gorget / neck guard collar armor piece, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Митрильный горжет *(`mithril_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Митрильный горжет", a single fantasy gorget / neck guard collar armor piece, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Тяж. Митрильный наруч (п) *(`heavy_mithril_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Митрильный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cool blue rim light --ar 1:2
```

### Средн. Митрильный наруч (п) *(`medium_mithril_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Средн. Митрильный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cool blue rim light --ar 1:2
```

### Митрильный наруч (п) *(`mithril_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Митрильный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cool blue rim light --ar 1:2
```

### Тяж. Митрильный нагрудник *(`heavy_mithril_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Митрильный нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Средн. Митрильный нагрудник *(`medium_mithril_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Митрильный нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Митрильный нагрудник *(`mithril_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Митрильный нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```


## Тир 6

### Шлем тёмного железа *(`darkiron_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Шлем тёмного железа", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Лёгк. Шлем тёмного железа *(`light_darkiron_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Шлем тёмного железа", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Средн. Шлем тёмного железа *(`medium_darkiron_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Шлем тёмного железа", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Наруч тёмн. железа (л) *(`darkiron_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч тёмн. железа (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, deep violet under-glow, faint ember particles --ar 1:2
```

### Лёгк. Наруч тёмн. железа (л) *(`light_darkiron_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Наруч тёмн. железа (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, deep violet under-glow, faint ember particles --ar 1:2
```

### Средн. Наруч тёмн. железа (л) *(`medium_darkiron_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Средн. Наруч тёмн. железа (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, deep violet under-glow, faint ember particles --ar 1:2
```

### Щит тёмного железа *(`darkiron_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Щит тёмного железа", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, heavy shield profile, broad tower or war shield, thick solid face, high durability, imposing mass, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Лёгк. Щит тёмного железа *(`light_darkiron_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Щит тёмного железа", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, light shield profile, small agile buckler or heater shield, slim solid face, quick straps, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Средн. Щит тёмного железа *(`medium_darkiron_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Щит тёмного железа", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, medium shield profile, sturdy heater or kite shield, reinforced solid face, balanced weight, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Поножи тёмного железа *(`darkiron_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Поножи тёмного железа", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Лёгк. Поножи тёмного железа *(`light_darkiron_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Поножи тёмного железа", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Средн. Поножи тёмного железа *(`medium_darkiron_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Поножи тёмного железа", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Горжет тёмн. железа *(`darkiron_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Горжет тёмн. железа", a single fantasy gorget / neck guard collar armor piece, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Лёгк. Горжет тёмн. железа *(`light_darkiron_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Горжет тёмн. железа", a single fantasy gorget / neck guard collar armor piece, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Средн. Горжет тёмн. железа *(`medium_darkiron_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Горжет тёмн. железа", a single fantasy gorget / neck guard collar armor piece, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Наруч тёмн. железа (п) *(`darkiron_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч тёмн. железа (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, deep violet under-glow, faint ember particles --ar 1:2
```

### Лёгк. Наруч тёмн. железа (п) *(`light_darkiron_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Наруч тёмн. железа (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, deep violet under-glow, faint ember particles --ar 1:2
```

### Средн. Наруч тёмн. железа (п) *(`medium_darkiron_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Средн. Наруч тёмн. железа (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, deep violet under-glow, faint ember particles --ar 1:2
```

### Латы тёмного железа *(`darkiron_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Латы тёмного железа", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Лёгк. Латы тёмного железа *(`light_darkiron_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Латы тёмного железа", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Средн. Латы тёмного железа *(`medium_darkiron_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Латы тёмного железа", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```


## Тир 7

### Тяж. Шлем звёздного металла *(`heavy_star_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Шлем звёздного металла", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Лёгк. Шлем звёздного металла *(`light_star_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Шлем звёздного металла", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Шлем звёздного металла *(`star_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Шлем звёздного металла", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Тяж. Наруч Пустоты (л) *(`heavy_void_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Наруч Пустоты (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cosmic violet and starfield bokeh --ar 1:2
```

### Лёгк. Наруч Пустоты (л) *(`light_void_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Наруч Пустоты (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cosmic violet and starfield bokeh --ar 1:2
```

### Наруч Пустоты (л) *(`void_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч Пустоты (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cosmic violet and starfield bokeh --ar 1:2
```

### Тяж. Щит звёздного металла *(`heavy_starmetal_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Щит звёздного металла", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, heavy shield profile, broad tower or war shield, thick solid face, high durability, imposing mass, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Лёгк. Щит звёздного металла *(`light_starmetal_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Щит звёздного металла", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, light shield profile, small agile buckler or heater shield, slim solid face, quick straps, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Щит звёздного металла *(`starmetal_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Щит звёздного металла", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, medium shield profile, sturdy heater or kite shield, reinforced solid face, balanced weight, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Тяж. Поножи звёздного металла *(`heavy_void_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Поножи звёздного металла", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Лёгк. Поножи звёздного металла *(`light_void_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Поножи звёздного металла", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Поножи звёздного металла *(`void_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Поножи звёздного металла", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Тяж. Звёздный горжет *(`heavy_void_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Звёздный горжет", a single fantasy gorget / neck guard collar armor piece, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Лёгк. Звёздный горжет *(`light_void_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Звёздный горжет", a single fantasy gorget / neck guard collar armor piece, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Звёздный горжет *(`void_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Звёздный горжет", a single fantasy gorget / neck guard collar armor piece, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Тяж. Наруч Пустоты (п) *(`heavy_void_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Наруч Пустоты (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cosmic violet and starfield bokeh --ar 1:2
```

### Лёгк. Наруч Пустоты (п) *(`light_void_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Наруч Пустоты (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cosmic violet and starfield bokeh --ar 1:2
```

### Наруч Пустоты (п) *(`void_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч Пустоты (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cosmic violet and starfield bokeh --ar 1:2
```

### Тяж. Доспех Пустоты *(`heavy_void_armor`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Доспех Пустоты", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Лёгк. Доспех Пустоты *(`light_void_armor`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Доспех Пустоты", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Доспех Пустоты *(`void_armor`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Доспех Пустоты", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```


## Тир 8

### Небесный шлем *(`celestial_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Небесный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Тяж. Небесный шлем *(`heavy_celestial_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Небесный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Лёгк. Небесный шлем *(`light_celestial_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Небесный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Небесный наруч (л) *(`celestial_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Небесный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, soft heavenly radiance, lens glow --ar 1:2
```

### Тяж. Небесный наруч (л) *(`heavy_celestial_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Небесный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, soft heavenly radiance, lens glow --ar 1:2
```

### Лёгк. Небесный наруч (л) *(`light_celestial_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Небесный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, soft heavenly radiance, lens glow --ar 1:2
```

### Небесный щит *(`celestial_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Небесный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, medium shield profile, sturdy heater or kite shield, reinforced solid face, balanced weight, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Тяж. Небесный щит *(`heavy_celestial_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Небесный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, heavy shield profile, broad tower or war shield, thick solid face, high durability, imposing mass, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Лёгк. Небесный щит *(`light_celestial_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Небесный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, light shield profile, small agile buckler or heater shield, slim solid face, quick straps, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Небесные поножи *(`celestial_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Небесные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Тяж. Небесные поножи *(`heavy_celestial_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Небесные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Лёгк. Небесные поножи *(`light_celestial_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Небесные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Небесный горжет *(`celestial_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Небесный горжет", a single fantasy gorget / neck guard collar armor piece, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Тяж. Небесный горжет *(`heavy_celestial_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Небесный горжет", a single fantasy gorget / neck guard collar armor piece, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Лёгк. Небесный горжет *(`light_celestial_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Небесный горжет", a single fantasy gorget / neck guard collar armor piece, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Небесный наруч (п) *(`celestial_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Небесный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, soft heavenly radiance, lens glow --ar 1:2
```

### Тяж. Небесный наруч (п) *(`heavy_celestial_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Небесный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, soft heavenly radiance, lens glow --ar 1:2
```

### Лёгк. Небесный наруч (п) *(`light_celestial_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Небесный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, soft heavenly radiance, lens glow --ar 1:2
```

### Небесный нагрудник *(`celestial_plate`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Небесный нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Тяж. Небесный нагрудник *(`heavy_celestial_plate`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Небесный нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Лёгк. Небесный нагрудник *(`light_celestial_plate`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Небесный нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```


## Тир 9

### Тяж. Корона Орихалка *(`heavy_orichalcum_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Корона Орихалка", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Лёгк. Корона Орихалка *(`light_orichalcum_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Корона Орихалка", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Корона Орихалка *(`orichalcum_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Корона Орихалка", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Тяж. Наруч Орихалка (л) *(`heavy_orichalcum_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Наруч Орихалка (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, golden divine backlight, sparks of holy energy --ar 1:2
```

### Лёгк. Наруч Орихалка (л) *(`light_orichalcum_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Наруч Орихалка (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, golden divine backlight, sparks of holy energy --ar 1:2
```

### Наруч Орихалка (л) *(`orichalcum_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч Орихалка (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, golden divine backlight, sparks of holy energy --ar 1:2
```

### Тяж. Щит Орихалка *(`heavy_orichalcum_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Щит Орихалка", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, heavy shield profile, broad tower or war shield, thick solid face, high durability, imposing mass, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, striking surface leaves faint disruptive shimmer where blows connect, harmonic resonance lines etched for devastating counters, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Лёгк. Щит Орихалка *(`light_orichalcum_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Щит Орихалка", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, light shield profile, small agile buckler or heater shield, slim solid face, quick straps, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, striking surface leaves faint disruptive shimmer where blows connect, harmonic resonance lines etched for devastating counters, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Щит Орихалка *(`orichalcum_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Щит Орихалка", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, medium shield profile, sturdy heater or kite shield, reinforced solid face, balanced weight, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, striking surface leaves faint disruptive shimmer where blows connect, harmonic resonance lines etched for devastating counters, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Тяж. Поножи Орихалка *(`heavy_orichalcum_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Поножи Орихалка", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Лёгк. Поножи Орихалка *(`light_orichalcum_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Поножи Орихалка", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Поножи Орихалка *(`orichalcum_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Поножи Орихалка", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Тяж. Горжет Орихалка *(`heavy_orichalcum_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Горжет Орихалка", a single fantasy gorget / neck guard collar armor piece, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Лёгк. Горжет Орихалка *(`light_orichalcum_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Горжет Орихалка", a single fantasy gorget / neck guard collar armor piece, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Горжет Орихалка *(`orichalcum_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Горжет Орихалка", a single fantasy gorget / neck guard collar armor piece, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Тяж. Наруч Орихалка (п) *(`heavy_orichalcum_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Тяж. Наруч Орихалка (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, golden divine backlight, sparks of holy energy --ar 1:2
```

### Лёгк. Наруч Орихалка (п) *(`light_orichalcum_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Наруч Орихалка (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, golden divine backlight, sparks of holy energy --ar 1:2
```

### Наруч Орихалка (п) *(`orichalcum_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч Орихалка (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, golden divine backlight, sparks of holy energy --ar 1:2
```

### Тяж. Латы Орихалка *(`heavy_orichalcum_armor`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Тяж. Латы Орихалка", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Лёгк. Латы Орихалка *(`light_orichalcum_armor`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Латы Орихалка", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Латы Орихалка *(`orichalcum_armor`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Латы Орихалка", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```


## Тир 10

### Шлем Бездны *(`adamantium_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Шлем Бездны", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Лёгк. Шлем Бездны *(`light_adamantium_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Шлем Бездны", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Средн. Шлем Бездны *(`medium_adamantium_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Шлем Бездны", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Наруч Бездны (л) *(`adamantium_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч Бездны (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, blinding aura edges, subtle space distortion shimmer --ar 1:2
```

### Лёгк. Наруч Бездны (л) *(`light_adamantium_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Наруч Бездны (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, blinding aura edges, subtle space distortion shimmer --ar 1:2
```

### Средн. Наруч Бездны (л) *(`medium_adamantium_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Средн. Наруч Бездны (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, blinding aura edges, subtle space distortion shimmer --ar 1:2
```

### Бастион Вечности *(`eternity_aegis`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Бастион Вечности", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, heavy shield profile, broad tower or war shield, thick solid face, high durability, imposing mass, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, striking surface leaves faint disruptive shimmer where blows connect, harmonic resonance lines etched for devastating counters, ominous finishing aura etched along rim, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Лёгк. Бастион Вечности *(`light_eternity_aegis`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Бастион Вечности", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, light shield profile, small agile buckler or heater shield, slim solid face, quick straps, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, striking surface leaves faint disruptive shimmer where blows connect, harmonic resonance lines etched for devastating counters, ominous finishing aura etched along rim, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Средн. Бастион Вечности *(`medium_eternity_aegis`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Бастион Вечности", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, medium shield profile, sturdy heater or kite shield, reinforced solid face, balanced weight, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, striking surface leaves faint disruptive shimmer where blows connect, harmonic resonance lines etched for devastating counters, ominous finishing aura etched along rim, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

Negative:

```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield
```

### Поножи Бездны *(`adamantium_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Поножи Бездны", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Лёгк. Поножи Бездны *(`light_adamantium_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Поножи Бездны", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Средн. Поножи Бездны *(`medium_adamantium_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Поножи Бездны", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Горжет Бездны *(`adamantium_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Горжет Бездны", a single fantasy gorget / neck guard collar armor piece, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Лёгк. Горжет Бездны *(`light_adamantium_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Горжет Бездны", a single fantasy gorget / neck guard collar armor piece, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Средн. Горжет Бездны *(`medium_adamantium_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Горжет Бездны", a single fantasy gorget / neck guard collar armor piece, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Наруч Бездны (п) *(`adamantium_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч Бездны (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, blinding aura edges, subtle space distortion shimmer --ar 1:2
```

### Лёгк. Наруч Бездны (п) *(`light_adamantium_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Лёгк. Наруч Бездны (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, blinding aura edges, subtle space distortion shimmer --ar 1:2
```

### Средн. Наруч Бездны (п) *(`medium_adamantium_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Средн. Наруч Бездны (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), medium armor profile, balanced protection and mobility, layered plates over padding, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, blinding aura edges, subtle space distortion shimmer --ar 1:2
```

### Латы Бездны *(`adamantium_plate`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Латы Бездны", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Лёгк. Латы Бездны *(`light_adamantium_plate`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Лёгк. Латы Бездны", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, light armor profile, flexible, low bulk, travel-ready, no movement restriction feel, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Средн. Латы Бездны *(`medium_adamantium_plate`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Средн. Латы Бездны", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, medium armor profile, balanced protection and mobility, layered plates over padding, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```
