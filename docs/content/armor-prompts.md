# Iron Hills — AI-промпты для брони и щитов

> Автогенерация из `ARMORS` (см. `tools/generate-armor-prompts.mjs`).
> `node tools/generate-armor-prompts.mjs`

**Использование:**
- Каждый промпт содержит `--ar` для aspect ratio.
- Клади спрайты в `icons/items/armor/{id}.webp`, затем `node tools/apply-armor-images.mjs`.
- В мире Foundry (GM, после F5): `await game.ironHills.syncArmorPackFromCatalog()`

**Negative prompt (общий):**
```
text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw
```


## Тир 1

### Кожаная шапка *(`leather_cap`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Кожаная шапка", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Кожаный наруч (л) *(`leather_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Кожаный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, dim warm campfire light --ar 1:2
```

### Деревянный щит *(`wooden_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Деревянный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Кожаные сапоги *(`leather_boots`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Кожаные сапоги", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Кожаный горжет *(`leather_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Кожаный горжет", a single fantasy gorget / neck guard collar armor piece, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Кожаный наруч (п) *(`leather_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Кожаный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, dim warm campfire light --ar 1:2
```

### Кожаные перчатки *(`leather_gloves`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Кожаные перчатки", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, dim warm campfire light --ar 1:2
```

### Кожаная куртка *(`leather_jacket`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Кожаная куртка", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```


## Тир 2

### Кольчужный капюшон *(`chainmail_coif`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Кольчужный капюшон", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Кольчужный рукав (л) *(`chain_sleeves_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Кольчужный рукав (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, neutral daylight --ar 1:2
```

### Железный щит *(`iron_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Железный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Кольчужные поножи *(`chain_leggings`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Кольчужные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Кольчужный горжет *(`chain_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Кольчужный горжет", a single fantasy gorget / neck guard collar armor piece, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Кольчужные рукава *(`chain_sleeves`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Кольчужные рукава", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, neutral daylight --ar 1:2
```

### Кольчужный рукав (п) *(`chain_sleeves_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Кольчужный рукав (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, neutral daylight --ar 1:2
```

### Кольчуга *(`chainmail`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Кольчуга", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```


## Тир 3

### Стальной шлем *(`plate_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Стальной шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Стальной наруч (л) *(`plate_arms_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Стальной наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, forge embers glow in background --ar 1:2
```

### Рыцарский щит *(`kite_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Рыцарский щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Набедренники *(`plate_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Набедренники", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Стальной горжет *(`plate_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Стальной горжет", a single fantasy gorget / neck guard collar armor piece, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Наручи *(`plate_arms`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наручи", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, forge embers glow in background --ar 1:2
```

### Стальной наруч (п) *(`plate_arms_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Стальной наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, forge embers glow in background --ar 1:2
```

### Нагрудник *(`plate_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```


## Тир 4

### Легированный шлем *(`alloy_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Легированный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Легир. наруч (л) *(`alloy_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Легир. наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, clean white studio light --ar 1:2
```

### Башенный щит *(`tower_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Башенный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Легированные поножи *(`alloy_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Легированные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Легир. горжет *(`alloy_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Легир. горжет", a single fantasy gorget / neck guard collar armor piece, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Легир. наруч (п) *(`alloy_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Легир. наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, clean white studio light --ar 1:2
```

### Легированный панцирь *(`alloy_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Легированный панцирь", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```


## Тир 5

### Митрильный шлем *(`mithril_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Митрильный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Митрильный наруч (л) *(`mithril_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Митрильный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cool blue rim light --ar 1:2
```

### Митрильный щит *(`mithril_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Митрильный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Митрильные поножи *(`mithril_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Митрильные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Митрильный горжет *(`mithril_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Митрильный горжет", a single fantasy gorget / neck guard collar armor piece, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Митрильный наруч (п) *(`mithril_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Митрильный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cool blue rim light --ar 1:2
```

### Митрильный нагрудник *(`mithril_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Митрильный нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```


## Тир 6

### Шлем тёмного железа *(`darkiron_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Шлем тёмного железа", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Наруч тёмн. железа (л) *(`darkiron_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч тёмн. железа (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, deep violet under-glow, faint ember particles --ar 1:2
```

### Щит тёмного железа *(`darkiron_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Щит тёмного железа", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Поножи тёмного железа *(`darkiron_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Поножи тёмного железа", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Горжет тёмн. железа *(`darkiron_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Горжет тёмн. железа", a single fantasy gorget / neck guard collar armor piece, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Наруч тёмн. железа (п) *(`darkiron_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч тёмн. железа (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, deep violet under-glow, faint ember particles --ar 1:2
```

### Латы тёмного железа *(`darkiron_chest`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Латы тёмного железа", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```


## Тир 7

### Шлем звёздного металла *(`star_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Шлем звёздного металла", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Наруч Пустоты (л) *(`void_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч Пустоты (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cosmic violet and starfield bokeh --ar 1:2
```

### Щит звёздного металла *(`starmetal_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Щит звёздного металла", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Поножи звёздного металла *(`void_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Поножи звёздного металла", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Звёздный горжет *(`void_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Звёздный горжет", a single fantasy gorget / neck guard collar armor piece, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Наруч Пустоты (п) *(`void_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч Пустоты (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cosmic violet and starfield bokeh --ar 1:2
```

### Доспех Пустоты *(`void_armor`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Доспех Пустоты", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```


## Тир 8

### Небесный шлем *(`celestial_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Небесный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Небесный наруч (л) *(`celestial_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Небесный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, soft heavenly radiance, lens glow --ar 1:2
```

### Небесный щит *(`celestial_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Небесный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Небесные поножи *(`celestial_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Небесные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Небесный горжет *(`celestial_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Небесный горжет", a single fantasy gorget / neck guard collar armor piece, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Небесный наруч (п) *(`celestial_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Небесный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, soft heavenly radiance, lens glow --ar 1:2
```

### Небесный нагрудник *(`celestial_plate`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Небесный нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```


## Тир 9

### Корона Орихалка *(`orichalcum_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Корона Орихалка", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Наруч Орихалка (л) *(`orichalcum_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч Орихалка (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, golden divine backlight, sparks of holy energy --ar 1:2
```

### Щит Орихалка *(`orichalcum_shield`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Щит Орихалка", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, striking surface leaves faint disruptive shimmer where blows connect, harmonic resonance lines etched for devastating counters, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Поножи Орихалка *(`orichalcum_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Поножи Орихалка", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Горжет Орихалка *(`orichalcum_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Горжет Орихалка", a single fantasy gorget / neck guard collar armor piece, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Наруч Орихалка (п) *(`orichalcum_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч Орихалка (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, golden divine backlight, sparks of holy energy --ar 1:2
```

### Латы Орихалка *(`orichalcum_armor`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Латы Орихалка", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```


## Тир 10

### Шлем Бездны *(`adamantium_helm`, head, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Шлем Бездны", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Наруч Бездны (л) *(`adamantium_bracer_left`, leftArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч Бездны (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, blinding aura edges, subtle space distortion shimmer --ar 1:2
```

### Бастион Вечности *(`eternity_aegis`, leftHand, 2×2, AR 1:1, 1024x1024)*

```
Concept art for "Бастион Вечности", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, striking surface leaves faint disruptive shimmer where blows connect, harmonic resonance lines etched for devastating counters, ominous finishing aura etched along rim, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Поножи Бездны *(`adamantium_legs`, legs, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Поножи Бездны", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Горжет Бездны *(`adamantium_gorget`, neck, 1×1, AR 1:1, 1024x1024)*

```
Concept art for "Горжет Бездны", a single fantasy gorget / neck guard collar armor piece, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Наруч Бездны (п) *(`adamantium_bracer_right`, rightArm, 1×2, AR 1:2, 768x1536)*

```
Concept art for "Наруч Бездны (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, blinding aura edges, subtle space distortion shimmer --ar 1:2
```

### Латы Бездны *(`adamantium_plate`, torso, 2×3, AR 1:1, 1024x1024)*

```
Concept art for "Латы Бездны", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```
