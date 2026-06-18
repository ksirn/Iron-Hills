# Iron Hills Item Art Backlog

Generated: 2026-06-14T06:42:13.747Z

This file lists catalog items that still use non-system item images. Generate prompt-driven assets at `targetFile`, validate them, then apply them to the item/spell catalogs.

## Summary

- Total backlog items: 554
- By catalog: armor=71, attachments=18, backpacks=15, belts=11, consumables=19, food=42, materials=98, potions=32, spells=80, throwables=11, tools=29, weapons=128
- By current image: system=554
- Target files: targetExists=329, targetMissing=225

## Generation Rules

- Prefer `node tools/generate-art-batch.mjs` for the generation queue; it keeps batch ids, prompts, target paths, and Tarkov grid proportions together.
- Generate one prompt-driven image per row and save it exactly at `targetFile`.
- Prefer WebP output; keep the object isolated, readable in a 52px inventory cell, and fully visible.
- Preserve the row's grid footprint: tall weapons must stay portrait/vertical, square consumables should stay close to square.
- After images exist, run `node tools/audit-art-targets.mjs` before `node tools/apply-art-backlog.mjs --dry-run`.
- Do not use deterministic placeholder/icon-symbol art for this backlog.


## armor

### Кожаные сапоги (`leather_boots`)

- Tier/type: 1, armor
- Current: `systems/iron-hills-system/icons/items/armor/leather_boots.webp`
- Target: `icons/items/armor/leather_boots.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Кожаные сапоги", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Кожаный наруч (л) (`leather_bracer_left`)

- Tier/type: 1, armor
- Current: `systems/iron-hills-system/icons/items/armor/leather_bracer_left.webp`
- Target: `icons/items/armor/leather_bracer_left.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Кожаный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, dim warm campfire light --ar 1:2
```

### Кожаный наруч (п) (`leather_bracer_right`)

- Tier/type: 1, armor
- Current: `systems/iron-hills-system/icons/items/armor/leather_bracer_right.webp`
- Target: `icons/items/armor/leather_bracer_right.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Кожаный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, dim warm campfire light --ar 1:2
```

### Кожаная шапка (`leather_cap`)

- Tier/type: 1, armor
- Current: `systems/iron-hills-system/icons/items/armor/leather_cap.webp`
- Target: `icons/items/armor/leather_cap.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Кожаная шапка", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Кожаные перчатки (`leather_gloves`)

- Tier/type: 1, armor
- Current: `systems/iron-hills-system/icons/items/armor/leather_gloves.webp`
- Target: `icons/items/armor/leather_gloves.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Кожаные перчатки", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, dim warm campfire light --ar 1:2
```

### Кожаный горжет (`leather_gorget`)

- Tier/type: 1, armor
- Current: `systems/iron-hills-system/icons/items/armor/leather_gorget.webp`
- Target: `icons/items/armor/leather_gorget.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Кожаный горжет", a single fantasy gorget / neck guard collar armor piece, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Кожаная куртка (`leather_jacket`)

- Tier/type: 1, armor
- Current: `systems/iron-hills-system/icons/items/armor/leather_jacket.webp`
- Target: `icons/items/armor/leather_jacket.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Кожаная куртка", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Деревянный щит (`wooden_shield`)

- Tier/type: 1, armor
- Current: `systems/iron-hills-system/icons/items/armor/wooden_shield.webp`
- Target: `icons/items/armor/wooden_shield.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Деревянный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from rough leather, crude brass rivets, bone toggles, untreated hide, stitched patches, scratches, frontier militia gear, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, dim warm campfire light --ar 1:1
```

### Кольчужный горжет (`chain_gorget`)

- Tier/type: 2, armor
- Current: `systems/iron-hills-system/icons/items/armor/chain_gorget.webp`
- Target: `icons/items/armor/chain_gorget.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Кольчужный горжет", a single fantasy gorget / neck guard collar armor piece, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Кольчужные поножи (`chain_leggings`)

- Tier/type: 2, armor
- Current: `systems/iron-hills-system/icons/items/armor/chain_leggings.webp`
- Target: `icons/items/armor/chain_leggings.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Кольчужные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Кольчужный рукав (л) (`chain_sleeves_left`)

- Tier/type: 2, armor
- Current: `systems/iron-hills-system/icons/items/armor/chain_sleeves_left.webp`
- Target: `icons/items/armor/chain_sleeves_left.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Кольчужный рукав (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, neutral daylight --ar 1:2
```

### Кольчужный рукав (п) (`chain_sleeves_right`)

- Tier/type: 2, armor
- Current: `systems/iron-hills-system/icons/items/armor/chain_sleeves_right.webp`
- Target: `icons/items/armor/chain_sleeves_right.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Кольчужный рукав (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, neutral daylight --ar 1:2
```

### Кольчуга (`chainmail`)

- Tier/type: 2, armor
- Current: `systems/iron-hills-system/icons/items/armor/chainmail.webp`
- Target: `icons/items/armor/chainmail.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Кольчуга", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Кольчужный капюшон (`chainmail_coif`)

- Tier/type: 2, armor
- Current: `systems/iron-hills-system/icons/items/armor/chainmail_coif.webp`
- Target: `icons/items/armor/chainmail_coif.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Кольчужный капюшон", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Железный щит (`iron_shield`)

- Tier/type: 2, armor
- Current: `systems/iron-hills-system/icons/items/armor/iron_shield.webp`
- Target: `icons/items/armor/iron_shield.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Железный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging, battle-worn ring mail, functional, no flourish, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, neutral daylight --ar 1:1
```

### Рыцарский щит (`kite_shield`)

- Tier/type: 3, armor
- Current: `systems/iron-hills-system/icons/items/armor/kite_shield.webp`
- Target: `icons/items/armor/kite_shield.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Рыцарский щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Стальной наруч (л) (`plate_arms_left`)

- Tier/type: 3, armor
- Current: `systems/iron-hills-system/icons/items/armor/plate_arms_left.webp`
- Target: `icons/items/armor/plate_arms_left.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Стальной наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, forge embers glow in background --ar 1:2
```

### Стальной наруч (п) (`plate_arms_right`)

- Tier/type: 3, armor
- Current: `systems/iron-hills-system/icons/items/armor/plate_arms_right.webp`
- Target: `icons/items/armor/plate_arms_right.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Стальной наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, forge embers glow in background --ar 1:2
```

### Нагрудник (`plate_chest`)

- Tier/type: 3, armor
- Current: `systems/iron-hills-system/icons/items/armor/plate_chest.webp`
- Target: `icons/items/armor/plate_chest.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Стальной горжет (`plate_gorget`)

- Tier/type: 3, armor
- Current: `systems/iron-hills-system/icons/items/armor/plate_gorget.webp`
- Target: `icons/items/armor/plate_gorget.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Стальной горжет", a single fantasy gorget / neck guard collar armor piece, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Стальной шлем (`plate_helm`)

- Tier/type: 3, armor
- Current: `systems/iron-hills-system/icons/items/armor/plate_helm.webp`
- Target: `icons/items/armor/plate_helm.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Стальной шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Набедренники (`plate_legs`)

- Tier/type: 3, armor
- Current: `systems/iron-hills-system/icons/items/armor/plate_legs.webp`
- Target: `icons/items/armor/plate_legs.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Набедренники", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from polished steel plates, articulated lames, leather straps, simple etchings, knight-issue half plate, well-maintained soldier kit, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, forge embers glow in background --ar 1:1
```

### Легир. наруч (л) (`alloy_bracer_left`)

- Tier/type: 4, armor
- Current: `systems/iron-hills-system/icons/items/armor/alloy_bracer_left.webp`
- Target: `icons/items/armor/alloy_bracer_left.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Легир. наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, clean white studio light --ar 1:2
```

### Легир. наруч (п) (`alloy_bracer_right`)

- Tier/type: 4, armor
- Current: `systems/iron-hills-system/icons/items/armor/alloy_bracer_right.webp`
- Target: `icons/items/armor/alloy_bracer_right.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Легир. наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, clean white studio light --ar 1:2
```

### Легированный панцирь (`alloy_chest`)

- Tier/type: 4, armor
- Current: `systems/iron-hills-system/icons/items/armor/alloy_chest.webp`
- Target: `icons/items/armor/alloy_chest.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Легированный панцирь", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Легир. горжет (`alloy_gorget`)

- Tier/type: 4, armor
- Current: `systems/iron-hills-system/icons/items/armor/alloy_gorget.webp`
- Target: `icons/items/armor/alloy_gorget.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Легир. горжет", a single fantasy gorget / neck guard collar armor piece, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Легированный шлем (`alloy_helm`)

- Tier/type: 4, armor
- Current: `systems/iron-hills-system/icons/items/armor/alloy_helm.webp`
- Target: `icons/items/armor/alloy_helm.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Легированный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Легированные поножи (`alloy_legs`)

- Tier/type: 4, armor
- Current: `systems/iron-hills-system/icons/items/armor/alloy_legs.webp`
- Target: `icons/items/armor/alloy_legs.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Легированные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Башенный щит (`tower_shield`)

- Tier/type: 4, armor
- Current: `systems/iron-hills-system/icons/items/armor/tower_shield.webp`
- Target: `icons/items/armor/tower_shield.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Башенный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing, commander-grade, decorative but practical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, clean white studio light --ar 1:1
```

### Митрильный наруч (л) (`mithril_bracer_left`)

- Tier/type: 5, armor
- Current: `systems/iron-hills-system/icons/items/armor/mithril_bracer_left.webp`
- Target: `icons/items/armor/mithril_bracer_left.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Митрильный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cool blue rim light --ar 1:2
```

### Митрильный наруч (п) (`mithril_bracer_right`)

- Tier/type: 5, armor
- Current: `systems/iron-hills-system/icons/items/armor/mithril_bracer_right.webp`
- Target: `icons/items/armor/mithril_bracer_right.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Митрильный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cool blue rim light --ar 1:2
```

### Митрильный нагрудник (`mithril_chest`)

- Tier/type: 5, armor
- Current: `systems/iron-hills-system/icons/items/armor/mithril_chest.webp`
- Target: `icons/items/armor/mithril_chest.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Митрильный нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Митрильный горжет (`mithril_gorget`)

- Tier/type: 5, armor
- Current: `systems/iron-hills-system/icons/items/armor/mithril_gorget.webp`
- Target: `icons/items/armor/mithril_gorget.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Митрильный горжет", a single fantasy gorget / neck guard collar armor piece, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Митрильный шлем (`mithril_helm`)

- Tier/type: 5, armor
- Current: `systems/iron-hills-system/icons/items/armor/mithril_helm.webp`
- Target: `icons/items/armor/mithril_helm.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Митрильный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Митрильные поножи (`mithril_legs`)

- Tier/type: 5, armor
- Current: `systems/iron-hills-system/icons/items/armor/mithril_legs.webp`
- Target: `icons/items/armor/mithril_legs.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Митрильные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Митрильный щит (`mithril_shield`)

- Tier/type: 5, armor
- Current: `systems/iron-hills-system/icons/items/armor/mithril_shield.webp`
- Target: `icons/items/armor/mithril_shield.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Митрильный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets, masterwork, elven-smith finish, faintly magical, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cool blue rim light --ar 1:1
```

### Наруч тёмн. железа (л) (`darkiron_bracer_left`)

- Tier/type: 6, armor
- Current: `systems/iron-hills-system/icons/items/armor/darkiron_bracer_left.webp`
- Target: `icons/items/armor/darkiron_bracer_left.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Наруч тёмн. железа (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, deep violet under-glow, faint ember particles --ar 1:2
```

### Наруч тёмн. железа (п) (`darkiron_bracer_right`)

- Tier/type: 6, armor
- Current: `systems/iron-hills-system/icons/items/armor/darkiron_bracer_right.webp`
- Target: `icons/items/armor/darkiron_bracer_right.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Наруч тёмн. железа (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, deep violet under-glow, faint ember particles --ar 1:2
```

### Латы тёмного железа (`darkiron_chest`)

- Tier/type: 6, armor
- Current: `systems/iron-hills-system/icons/items/armor/darkiron_chest.webp`
- Target: `icons/items/armor/darkiron_chest.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Латы тёмного железа", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Горжет тёмн. железа (`darkiron_gorget`)

- Tier/type: 6, armor
- Current: `systems/iron-hills-system/icons/items/armor/darkiron_gorget.webp`
- Target: `icons/items/armor/darkiron_gorget.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Горжет тёмн. железа", a single fantasy gorget / neck guard collar armor piece, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Шлем тёмного железа (`darkiron_helm`)

- Tier/type: 6, armor
- Current: `systems/iron-hills-system/icons/items/armor/darkiron_helm.webp`
- Target: `icons/items/armor/darkiron_helm.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Шлем тёмного железа", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Поножи тёмного железа (`darkiron_legs`)

- Tier/type: 6, armor
- Current: `systems/iron-hills-system/icons/items/armor/darkiron_legs.webp`
- Target: `icons/items/armor/darkiron_legs.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Поножи тёмного железа", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Щит тёмного железа (`darkiron_shield`)

- Tier/type: 6, armor
- Current: `systems/iron-hills-system/icons/items/armor/darkiron_shield.webp`
- Target: `icons/items/armor/darkiron_shield.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Щит тёмного железа", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from dark iron with subtle purple sheen, soot patina, silver runes etched into seams, heavy, ominous, infernal forge aesthetic, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, deep violet under-glow, faint ember particles --ar 1:1
```

### Шлем звёздного металла (`star_helm`)

- Tier/type: 7, armor
- Current: `systems/iron-hills-system/icons/items/armor/star_helm.webp`
- Target: `icons/items/armor/star_helm.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Шлем звёздного металла", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Щит звёздного металла (`starmetal_shield`)

- Tier/type: 7, armor
- Current: `systems/iron-hills-system/icons/items/armor/starmetal_shield.webp`
- Target: `icons/items/armor/starmetal_shield.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Щит звёздного металла", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Доспех Пустоты (`void_armor`)

- Tier/type: 7, armor
- Current: `systems/iron-hills-system/icons/items/armor/void_armor.webp`
- Target: `icons/items/armor/void_armor.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Доспех Пустоты", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Наруч Пустоты (л) (`void_bracer_left`)

- Tier/type: 7, armor
- Current: `systems/iron-hills-system/icons/items/armor/void_bracer_left.webp`
- Target: `icons/items/armor/void_bracer_left.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Наруч Пустоты (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cosmic violet and starfield bokeh --ar 1:2
```

### Наруч Пустоты (п) (`void_bracer_right`)

- Tier/type: 7, armor
- Current: `systems/iron-hills-system/icons/items/armor/void_bracer_right.webp`
- Target: `icons/items/armor/void_bracer_right.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Наруч Пустоты (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, cosmic violet and starfield bokeh --ar 1:2
```

### Звёздный горжет (`void_gorget`)

- Tier/type: 7, armor
- Current: `systems/iron-hills-system/icons/items/armor/void_gorget.webp`
- Target: `icons/items/armor/void_gorget.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Звёздный горжет", a single fantasy gorget / neck guard collar armor piece, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Поножи звёздного металла (`void_legs`)

- Tier/type: 7, armor
- Current: `systems/iron-hills-system/icons/items/armor/void_legs.webp`
- Target: `icons/items/armor/void_legs.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Поножи звёздного металла", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps, cosmic horror luxury, unsettling elegance, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, cosmic violet and starfield bokeh --ar 1:1
```

### Небесный наруч (л) (`celestial_bracer_left`)

- Tier/type: 8, armor
- Current: `systems/iron-hills-system/icons/items/armor/celestial_bracer_left.webp`
- Target: `icons/items/armor/celestial_bracer_left.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Небесный наруч (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, soft heavenly radiance, lens glow --ar 1:2
```

### Небесный наруч (п) (`celestial_bracer_right`)

- Tier/type: 8, armor
- Current: `systems/iron-hills-system/icons/items/armor/celestial_bracer_right.webp`
- Target: `icons/items/armor/celestial_bracer_right.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Небесный наруч (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, soft heavenly radiance, lens glow --ar 1:2
```

### Небесный горжет (`celestial_gorget`)

- Tier/type: 8, armor
- Current: `systems/iron-hills-system/icons/items/armor/celestial_gorget.webp`
- Target: `icons/items/armor/celestial_gorget.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Небесный горжет", a single fantasy gorget / neck guard collar armor piece, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Небесный шлем (`celestial_helm`)

- Tier/type: 8, armor
- Current: `systems/iron-hills-system/icons/items/armor/celestial_helm.webp`
- Target: `icons/items/armor/celestial_helm.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Небесный шлем", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Небесные поножи (`celestial_legs`)

- Tier/type: 8, armor
- Current: `systems/iron-hills-system/icons/items/armor/celestial_legs.webp`
- Target: `icons/items/armor/celestial_legs.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Небесные поножи", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Небесный нагрудник (`celestial_plate`)

- Tier/type: 8, armor
- Current: `systems/iron-hills-system/icons/items/armor/celestial_plate.webp`
- Target: `icons/items/armor/celestial_plate.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Небесный нагрудник", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Небесный щит (`celestial_shield`)

- Tier/type: 8, armor
- Current: `systems/iron-hills-system/icons/items/armor/celestial_shield.webp`
- Target: `icons/items/armor/celestial_shield.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Небесный щит", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from celestial steel (pearlescent silver), gold filigree halos, feather engravings, angelic crusader aesthetic, immaculate, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, soft heavenly radiance, lens glow --ar 1:1
```

### Латы Орихалка (`orichalcum_armor`)

- Tier/type: 9, armor
- Current: `systems/iron-hills-system/icons/items/armor/orichalcum_armor.webp`
- Target: `icons/items/armor/orichalcum_armor.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Латы Орихалка", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Наруч Орихалка (л) (`orichalcum_bracer_left`)

- Tier/type: 9, armor
- Current: `systems/iron-hills-system/icons/items/armor/orichalcum_bracer_left.webp`
- Target: `icons/items/armor/orichalcum_bracer_left.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Наруч Орихалка (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, golden divine backlight, sparks of holy energy --ar 1:2
```

### Наруч Орихалка (п) (`orichalcum_bracer_right`)

- Tier/type: 9, armor
- Current: `systems/iron-hills-system/icons/items/armor/orichalcum_bracer_right.webp`
- Target: `icons/items/armor/orichalcum_bracer_right.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Наруч Орихалка (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, golden divine backlight, sparks of holy energy --ar 1:2
```

### Горжет Орихалка (`orichalcum_gorget`)

- Tier/type: 9, armor
- Current: `systems/iron-hills-system/icons/items/armor/orichalcum_gorget.webp`
- Target: `icons/items/armor/orichalcum_gorget.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Горжет Орихалка", a single fantasy gorget / neck guard collar armor piece, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Корона Орихалка (`orichalcum_helm`)

- Tier/type: 9, armor
- Current: `systems/iron-hills-system/icons/items/armor/orichalcum_helm.webp`
- Target: `icons/items/armor/orichalcum_helm.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Корона Орихалка", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Поножи Орихалка (`orichalcum_legs`)

- Tier/type: 9, armor
- Current: `systems/iron-hills-system/icons/items/armor/orichalcum_legs.webp`
- Target: `icons/items/armor/orichalcum_legs.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Поножи Орихалка", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Щит Орихалка (`orichalcum_shield`)

- Tier/type: 9, armor
- Current: `systems/iron-hills-system/icons/items/armor/orichalcum_shield.webp`
- Target: `icons/items/armor/orichalcum_shield.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Щит Орихалка", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs, legendary relic armor, divine heraldry, striking surface leaves faint disruptive shimmer where blows connect, harmonic resonance lines etched for devastating counters, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, golden divine backlight, sparks of holy energy --ar 1:1
```

### Наруч Бездны (л) (`adamantium_bracer_left`)

- Tier/type: 10, armor
- Current: `systems/iron-hills-system/icons/items/armor/adamantium_bracer_left.webp`
- Target: `icons/items/armor/adamantium_bracer_left.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Наруч Бездны (л)", a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff), crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, blinding aura edges, subtle space distortion shimmer --ar 1:2
```

### Наруч Бездны (п) (`adamantium_bracer_right`)

- Tier/type: 10, armor
- Current: `systems/iron-hills-system/icons/items/armor/adamantium_bracer_right.webp`
- Target: `icons/items/armor/adamantium_bracer_right.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Наруч Бездны (п)", a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff), crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, vertical orientation, armor piece upright, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 768x1536, blinding aura edges, subtle space distortion shimmer --ar 1:2
```

### Горжет Бездны (`adamantium_gorget`)

- Tier/type: 10, armor
- Current: `systems/iron-hills-system/icons/items/armor/adamantium_gorget.webp`
- Target: `icons/items/armor/adamantium_gorget.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Горжет Бездны", a single fantasy gorget / neck guard collar armor piece, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Шлем Бездны (`adamantium_helm`)

- Tier/type: 10, armor
- Current: `systems/iron-hills-system/icons/items/armor/adamantium_helm.webp`
- Target: `icons/items/armor/adamantium_helm.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Шлем Бездны", a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Поножи Бездны (`adamantium_legs`)

- Tier/type: 10, armor
- Current: `systems/iron-hills-system/icons/items/armor/adamantium_legs.webp`
- Target: `icons/items/armor/adamantium_legs.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Поножи Бездны", a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Латы Бездны (`adamantium_plate`)

- Tier/type: 10, armor
- Current: `systems/iron-hills-system/icons/items/armor/adamantium_plate.webp`
- Target: `icons/items/armor/adamantium_plate.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Латы Бездны", a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```

### Бастион Вечности (`eternity_aegis`)

- Tier/type: 10, armor
- Current: `systems/iron-hills-system/icons/items/armor/eternity_aegis.webp`
- Target: `icons/items/armor/eternity_aegis.webp`
- Prompt source: docs/content/armor-prompts.json

```
Concept art for "Бастион Вечности", a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face, crafted from adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim, primordial bulwark, cracks of leaking daylight along plates, striking surface leaves faint disruptive shimmer where blows connect, harmonic resonance lines etched for devastating counters, ominous finishing aura etched along rim, balanced composition, helmet-centered, isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light, 1024x1024, blinding aura edges, subtle space distortion shimmer --ar 1:1
```


## attachments

### Колчан (стрелы) (`arrow_quiver`)

- Tier/type: 1, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/arrow_quiver.webp`
- Target: `icons/items/attachments/arrow_quiver.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Колчан (стрелы)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Петля (топор) (`axe_loop`)

- Tier/type: 1, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/axe_loop.webp`
- Target: `icons/items/attachments/axe_loop.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Петля (топор)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Подсумок (болты) (`bolt_pouch`)

- Tier/type: 1, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/bolt_pouch.webp`
- Target: `icons/items/attachments/bolt_pouch.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Подсумок (болты)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Перевязь (лук) (`bow_sling`)

- Tier/type: 1, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/bow_sling.webp`
- Target: `icons/items/attachments/bow_sling.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Перевязь (лук)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Нагрудный карман (`chest_pocket`)

- Tier/type: 1, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/chest_pocket.webp`
- Target: `icons/items/attachments/chest_pocket.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Нагрудный карман", torso harness modular straps threaded clips climbing buckle tactical vest snippet; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Ножны (нож) (`knife_sheath`)

- Tier/type: 1, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/knife_sheath.webp`
- Target: `icons/items/attachments/knife_sheath.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Ножны (нож)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Бандольер (зелья) (`potion_bandolier`)

- Tier/type: 1, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/potion_bandolier.webp`
- Target: `icons/items/attachments/potion_bandolier.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Бандольер (зелья)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Боковой подсумок (`side_pouch`)

- Tier/type: 1, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/side_pouch.webp`
- Target: `icons/items/attachments/side_pouch.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Боковой подсумок", mount bracket modular pouch snaps clips backpack accessory riveted straps; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Ножны (меч) (`sword_scabbard`)

- Tier/type: 1, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/sword_scabbard.webp`
- Target: `icons/items/attachments/sword_scabbard.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Ножны (меч)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Крюк (арбалет) (`crossbow_hook`)

- Tier/type: 2, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/crossbow_hook.webp`
- Target: `icons/items/attachments/crossbow_hook.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Крюк (арбалет)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Ножны (двуруч.) (`greatsword_scabbard`)

- Tier/type: 2, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/greatsword_scabbard.webp`
- Target: `icons/items/attachments/greatsword_scabbard.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Ножны (двуруч.)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Бандольер большой (`large_bandolier`)

- Tier/type: 2, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/large_bandolier.webp`
- Target: `icons/items/attachments/large_bandolier.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Бандольер большой", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Крюк для щита (`shield_hook`)

- Tier/type: 2, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/shield_hook.webp`
- Target: `icons/items/attachments/shield_hook.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Крюк для щита", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Чехол для копья (`spear_frog`)

- Tier/type: 2, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/spear_frog.webp`
- Target: `icons/items/attachments/spear_frog.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Чехол для копья", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Разгрузочная стропа (`utility_strap`)

- Tier/type: 2, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/utility_strap.webp`
- Target: `icons/items/attachments/utility_strap.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Разгрузочная стропа", torso harness modular straps threaded clips climbing buckle tactical vest snippet; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Петля для жезла (`wand_loop`)

- Tier/type: 3, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/wand_loop.webp`
- Target: `icons/items/attachments/wand_loop.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Петля для жезла", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Кольца под метательное (`grenade_loop`)

- Tier/type: 4, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/grenade_loop.webp`
- Target: `icons/items/attachments/grenade_loop.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Кольца под метательное", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Телескопический колчан (`telescoping_quiver`)

- Tier/type: 4, attachment
- Current: `systems/iron-hills-system/icons/items/attachments/telescoping_quiver.webp`
- Target: `icons/items/attachments/telescoping_quiver.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Телескопический колчан", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```


## backpacks

### Поясная сумка (`hip_pouch`)

- Tier/type: 1, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/hip_pouch.webp`
- Target: `icons/items/backpacks/hip_pouch.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Поясная сумка", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Кожаная сумка (`leather_satchel`)

- Tier/type: 1, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/leather_satchel.webp`
- Target: `icons/items/backpacks/leather_satchel.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Кожаная сумка", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Небольшой мешок (`small_sack`)

- Tier/type: 1, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/small_sack.webp`
- Target: `icons/items/backpacks/small_sack.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Небольшой мешок", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Охотничья сума (`hunters_bag`)

- Tier/type: 2, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/hunters_bag.webp`
- Target: `icons/items/backpacks/hunters_bag.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Охотничья сума", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Солдатский ранец (`soldier_pack`)

- Tier/type: 2, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/soldier_pack.webp`
- Target: `icons/items/backpacks/soldier_pack.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Солдатский ранец", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Дорожный ранец (`travelers_pack`)

- Tier/type: 2, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/travelers_pack.webp`
- Target: `icons/items/backpacks/travelers_pack.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Дорожный ранец", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Рамный рюкзак (`frame_pack`)

- Tier/type: 3, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/frame_pack.webp`
- Target: `icons/items/backpacks/frame_pack.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Рамный рюкзак", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Большой рюкзак (`large_backpack`)

- Tier/type: 3, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/large_backpack.webp`
- Target: `icons/items/backpacks/large_backpack.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Большой рюкзак", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Сумка алхимика (`alchemist_satchel`)

- Tier/type: 4, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/alchemist_satchel.webp`
- Target: `icons/items/backpacks/alchemist_satchel.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Сумка алхимика", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Митрильный рюкзак (`mithril_pack`)

- Tier/type: 5, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/mithril_pack.webp`
- Target: `icons/items/backpacks/mithril_pack.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Митрильный рюкзак", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; noble artisan embossed fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Рюкзак караванного бариши (`caravan_master_pack`)

- Tier/type: 6, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/caravan_master_pack.webp`
- Target: `icons/items/backpacks/caravan_master_pack.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Рюкзак караванного бариши", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Вьючная рама для зверя (`beast_load_frame`)

- Tier/type: 7, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/beast_load_frame.webp`
- Target: `icons/items/backpacks/beast_load_frame.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Вьючная рама для зверя", emphasis saddle straps beast harness mount frames oversized haul bag meant for draft animal NOT worn by human silhouette alonefantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; rare siege caravan engineered spectacle, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Сумка Пустоты (`void_satchel`)

- Tier/type: 8, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/void_satchel.webp`
- Target: `icons/items/backpacks/void_satchel.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Сумка Пустоты", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; starmetal accents artifact hints, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Планарная сумка (`planar_satchel`)

- Tier/type: 9, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/planar_satchel.webp`
- Target: `icons/items/backpacks/planar_satchel.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Планарная сумка", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; legendary planar shimmer restrained, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Рюкзак малой демиплоскости (`demiplane_pack`)

- Tier/type: 10, backpack
- Current: `systems/iron-hills-system/icons/items/backpacks/demiplane_pack.webp`
- Target: `icons/items/backpacks/demiplane_pack.webp`
- Prompt source: fallback

```
Concept "Рюкзак малой демиплоскости", a single fantasy backpack or pouch, mythic godsteel, adamant core, reality-bending magical highlights, vertical item orientation, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 768x1536 --ar 1:2
```


## belts

### Кожаный пояс (`leather_belt`)

- Tier/type: 1, belt
- Current: `systems/iron-hills-system/icons/items/belts/leather_belt.webp`
- Target: `icons/items/belts/leather_belt.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Кожаный пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 3 pouch slots narrative hint and 1 side mounts for weapon frogs quivers holsters; leather textile mixed metals; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Верёвочный пояс (`rope_belt`)

- Tier/type: 1, belt
- Current: `systems/iron-hills-system/icons/items/belts/rope_belt.webp`
- Target: `icons/items/belts/rope_belt.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Верёвочный пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 2 pouch slots narrative hint and 0 side mounts for weapon frogs quivers holsters; leather textile mixed metals; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Солдатский пояс (`soldier_belt`)

- Tier/type: 2, belt
- Current: `systems/iron-hills-system/icons/items/belts/soldier_belt.webp`
- Target: `icons/items/belts/soldier_belt.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Солдатский пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 4 pouch slots narrative hint and 2 side mounts for weapon frogs quivers holsters; leather textile mixed metals; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Тактический пояс (`tactical_belt`)

- Tier/type: 3, belt
- Current: `systems/iron-hills-system/icons/items/belts/tactical_belt.webp`
- Target: `icons/items/belts/tactical_belt.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Тактический пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 10 pouch slots narrative hint and 3 side mounts for weapon frogs quivers holsters; leather textile mixed metals; guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Пояс следопыта (`explorer_girdle`)

- Tier/type: 4, belt
- Current: `systems/iron-hills-system/icons/items/belts/explorer_girdle.webp`
- Target: `icons/items/belts/explorer_girdle.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Пояс следопыта", fantasy waist belt pouches straps buckle studs utility loops; roughly 10 pouch slots narrative hint and 4 side mounts for weapon frogs quivers holsters; leather textile mixed metals; merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Митрильный пояс (`mithril_belt`)

- Tier/type: 5, belt
- Current: `systems/iron-hills-system/icons/items/belts/mithril_belt.webp`
- Target: `icons/items/belts/mithril_belt.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Митрильный пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 12 pouch slots narrative hint and 4 side mounts for weapon frogs quivers holsters; leather textile mixed metals; noble artisan embossed fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Осадный пояс (`siege_belt`)

- Tier/type: 6, belt
- Current: `systems/iron-hills-system/icons/items/belts/siege_belt.webp`
- Target: `icons/items/belts/siege_belt.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Осадный пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 12 pouch slots narrative hint and 5 side mounts for weapon frogs quivers holsters; leather textile mixed metals; elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Облегчённая портупея бегуна (`runners_light_harness`)

- Tier/type: 7, belt
- Current: `systems/iron-hills-system/icons/items/belts/runners_light_harness.webp`
- Target: `icons/items/belts/runners_light_harness.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Облегчённая портупея бегуна", fantasy waist belt pouches straps buckle studs utility loops; roughly 15 pouch slots narrative hint and 4 side mounts for weapon frogs quivers holsters; leather textile mixed metals; rare siege caravan engineered spectacle, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Цепной пояс из тёмного железа (`darkiron_chain_belt`)

- Tier/type: 8, belt
- Current: `systems/iron-hills-system/icons/items/belts/darkiron_chain_belt.webp`
- Target: `icons/items/belts/darkiron_chain_belt.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Цепной пояс из тёмного железа", fantasy waist belt pouches straps buckle studs utility loops; roughly 14 pouch slots narrative hint and 6 side mounts for weapon frogs quivers holsters; leather textile mixed metals; starmetal accents artifact hints, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Пояс Орихалка (`orichalcum_girdle`)

- Tier/type: 9, belt
- Current: `systems/iron-hills-system/icons/items/belts/orichalcum_girdle.webp`
- Target: `icons/items/belts/orichalcum_girdle.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Пояс Орихалка", fantasy waist belt pouches straps buckle studs utility loops; roughly 16 pouch slots narrative hint and 7 side mounts for weapon frogs quivers holsters; leather textile mixed metals; legendary planar shimmer restrained, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Астральная портупея командора (`astral_command_girdle`)

- Tier/type: 10, belt
- Current: `systems/iron-hills-system/icons/items/belts/astral_command_girdle.webp`
- Target: `icons/items/belts/astral_command_girdle.webp`
- Prompt source: fallback

```
Concept "Астральная портупея командора", a single fantasy utility belt, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```


## consumables

### Антисептический раствор (`antiseptic_wash`)

- Tier/type: 1, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/antiseptic_wash.webp`
- Target: `icons/items/consumables/antiseptic_wash.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Антисептический раствор", antiseptic wash bottle, blue glass, waxed label blank, herbal sediment and clean cloth wrap, infection cleansing, antiseptic blue clarity, herbal purity, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Чистая повязка (`clean_dressing`)

- Tier/type: 1, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/clean_dressing.webp`
- Target: `icons/items/consumables/clean_dressing.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Чистая повязка", rolled field bandage and folded dressing bundle, red wax seal, clean linen texture, blood control, clean pressure dressing, practical battlefield first aid, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Полевой бинт (`field_bandage`)

- Tier/type: 1, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/field_bandage.webp`
- Target: `icons/items/consumables/field_bandage.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Полевой бинт", rolled field bandage and folded dressing bundle, red wax seal, clean linen texture, blood control, clean pressure dressing, practical battlefield first aid, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Кожаная фляга (`leather_waterskin`)

- Tier/type: 1, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/leather_waterskin.webp`
- Target: `icons/items/consumables/leather_waterskin.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Кожаная фляга", leather waterskin with cork stopper, stitched seams, small water bead highlights, survival utility, practical fantasy expedition medicine, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Шина (`splint`)

- Tier/type: 1, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/splint.webp`
- Target: `icons/items/consumables/splint.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Шина", wooden splint pair tied with linen straps, bone pins and soft padding visible, fracture stabilization, rigid supports, recovery after crushing hit, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, vertical compact object framing, 768x1536, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:2
```

### Жгут (`tourniquet`)

- Tier/type: 1, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/tourniquet.webp`
- Target: `icons/items/consumables/tourniquet.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Жгут", compact leather tourniquet strap with brass windlass and buckle, coiled readable silhouette, major bleeding control, urgent limb stabilization, rugged and reliable, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Свёртывающий порошок (`clotting_powder`)

- Tier/type: 2, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/clotting_powder.webp`
- Target: `icons/items/consumables/clotting_powder.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Свёртывающий порошок", hemostatic cloth packet and clotting powder sachet, sealed field-medic pouch, instant clotting, powder dust, alchemical seal against bleeding, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Полевая шовная скрутка (`field_suture_roll`)

- Tier/type: 2, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/field_suture_roll.webp`
- Target: `icons/items/consumables/field_suture_roll.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Полевая шовная скрутка", suture roll with curved needle, clean thread spool, tiny brass needle case, precise stitching and wound closure, calm professional treatment, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Кровоостанавливающий пакет (`hemostatic_pack`)

- Tier/type: 2, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/hemostatic_pack.webp`
- Target: `icons/items/consumables/hemostatic_pack.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Кровоостанавливающий пакет", hemostatic cloth packet and clotting powder sachet, sealed field-medic pouch, instant clotting, powder dust, alchemical seal against bleeding, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Железная фляга (`iron_canteen`)

- Tier/type: 2, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/iron_canteen.webp`
- Target: `icons/items/consumables/iron_canteen.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Железная фляга", iron canteen with leather strap, dented field metal, screw cap, survival utility, practical fantasy expedition medicine, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Шина с костяными фиксаторами (`bone_pin_splint`)

- Tier/type: 3, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/bone_pin_splint.webp`
- Target: `icons/items/consumables/bone_pin_splint.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Шина с костяными фиксаторами", wooden splint pair tied with linen straps, bone pins and soft padding visible, fracture stabilization, rigid supports, recovery after crushing hit, field-proven adventurer gear, reinforced details, readable silhouette, vertical compact object framing, 768x1536, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:2
```

### Обезболивающий глоток (`painkiller_draught`)

- Tier/type: 3, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/painkiller_draught.webp`
- Target: `icons/items/consumables/painkiller_draught.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Обезболивающий глоток", small battle stimulant ampoule in leather injector sleeve, amber liquid, caution cord, short combat surge, bitter stimulant, controlled urgency, field-proven adventurer gear, reinforced details, readable silhouette, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Бурдюк следопыта (`ranger_gourd`)

- Tier/type: 3, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/ranger_gourd.webp`
- Target: `icons/items/consumables/ranger_gourd.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Бурдюк следопыта", traveler gourd canteen with ranger cord wrap, carved wooden stopper, survival utility, practical fantasy expedition medicine, field-proven adventurer gear, reinforced details, readable silhouette, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Травматологический набор (`trauma_kit`)

- Tier/type: 3, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/trauma_kit.webp`
- Target: `icons/items/consumables/trauma_kit.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Травматологический набор", compact trauma kit pouch opened just enough to show bandage roll, splint slats, tonic vial, body stabilization after multiple wounds, organized emergency kit, field-proven adventurer gear, reinforced details, readable silhouette, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Боевой стимулятор (`battle_stimulant`)

- Tier/type: 4, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/battle_stimulant.webp`
- Target: `icons/items/consumables/battle_stimulant.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Боевой стимулятор", small battle stimulant ampoule in leather injector sleeve, amber liquid, caution cord, short combat surge, bitter stimulant, controlled urgency, professional mercenary quality, polished steel fittings, careful packing, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Полевой травмпакет (`field_trauma_pack`)

- Tier/type: 4, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/field_trauma_pack.webp`
- Target: `icons/items/consumables/field_trauma_pack.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Полевой травмпакет", compact trauma kit pouch opened just enough to show bandage roll, splint slats, tonic vial, body stabilization after multiple wounds, organized emergency kit, professional mercenary quality, polished steel fittings, careful packing, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Хирургический набор (`surgical_kit`)

- Tier/type: 4, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/surgical_kit.webp`
- Target: `icons/items/consumables/surgical_kit.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Хирургический набор", fantasy surgical field kit, folded leather case with bone saw, sutures, forceps, antiseptic vial, serious wound treatment, surgical precision, recovery of damaged body zones, professional mercenary quality, polished steel fittings, careful packing, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Восстановительная ампула (`restoration_ampoule`)

- Tier/type: 5, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/restoration_ampoule.webp`
- Target: `icons/items/consumables/restoration_ampoule.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Восстановительная ампула", restorative green ampoule with silver cap, clean healing glow, tiny bandage tie, restorative healing warmth, wound closing magic, safe green glow, masterwork guild finish, subtle runes, clean alchemical glass and fine leather, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Мастерский хирургический комплект (`master_surgery_pack`)

- Tier/type: 6, consumable
- Current: `systems/iron-hills-system/icons/items/consumables/master_surgery_pack.webp`
- Target: `icons/items/consumables/master_surgery_pack.webp`
- Prompt source: docs/content/consumables-prompts.json

```
Concept "Мастерский хирургический комплект", fantasy surgical field kit, folded leather case with bone saw, sutures, forceps, antiseptic vial, serious wound treatment, surgical precision, recovery of damaged body zones, elite expedition quality, mithril or silver accents, faint magical residue, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```


## food

### Отвар корней (`boiled_roots`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/boiled_roots.webp`
- Target: `icons/items/food/boiled_roots.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Отвар корней", fantasy edible dish photograph — balanced solids and hydration cues, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Хлеб (`bread`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/bread.webp`
- Target: `icons/items/food/bread.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Хлеб", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Сыр (`cheese`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/cheese.webp`
- Target: `icons/items/food/cheese.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Сыр", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Тушёное мясо (`cooked_stew`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/cooked_stew.webp`
- Target: `icons/items/food/cooked_stew.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Тушёное мясо", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Вяленое мясо (`dried_meat`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/dried_meat.webp`
- Target: `icons/items/food/dried_meat.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Вяленое мясо", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Гномье пиво (`dwarf_brew`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/dwarf_brew.webp`
- Target: `icons/items/food/dwarf_brew.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Гномье пиво", fantasy edible dish photograph — emphasis on steam mug / jug / soup moisture shimmer, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Полевое жаркое (`field_stew`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/field_stew.webp`
- Target: `icons/items/food/field_stew.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Полевое жаркое", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Свежее мясо (`fresh_meat`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/fresh_meat.webp`
- Target: `icons/items/food/fresh_meat.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Свежее мясо", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Сырая дичь (`game_meat_raw`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/game_meat_raw.webp`
- Target: `icons/items/food/game_meat_raw.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Сырая дичь", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Грибной суп (`mushroom_soup`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/mushroom_soup.webp`
- Target: `icons/items/food/mushroom_soup.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Грибной суп", fantasy edible dish photograph — balanced solids and hydration cues, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Овсяный поцелуй (`oat_kiss_kissel`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/oat_kiss_kissel.webp`
- Target: `icons/items/food/oat_kiss_kissel.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Овсяный поцелуй", fantasy edible dish photograph — balanced solids and hydration cues, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Банка маринованных овощей (`pickled_veggies_jar`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/pickled_veggies_jar.webp`
- Target: `icons/items/food/pickled_veggies_jar.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Банка маринованных овощей", fantasy edible dish photograph — balanced solids and hydration cues, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Походный паёк (`trail_rations`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/trail_rations.webp`
- Target: `icons/items/food/trail_rations.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Походный паёк", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Родниковая вода (меха) (`well_water_skin`)

- Tier/type: 1, food
- Current: `systems/iron-hills-system/icons/items/food/well_water_skin.webp`
- Target: `icons/items/food/well_water_skin.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Родниковая вода (меха)", fantasy edible dish photograph — emphasis on steam mug / jug / soup moisture shimmer, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Кувшин ягодного кваса (`berry_kvass_jug`)

- Tier/type: 2, food
- Current: `systems/iron-hills-system/icons/items/food/berry_kvass_jug.webp`
- Target: `icons/items/food/berry_kvass_jug.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Кувшин ягодного кваса", fantasy edible dish photograph — emphasis on steam mug / jug / soup moisture shimmer, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```

### Изысканное блюдо (`fine_meal`)

- Tier/type: 2, food
- Current: `systems/iron-hills-system/icons/items/food/fine_meal.webp`
- Target: `icons/items/food/fine_meal.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Изысканное блюдо", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```

### Плотная дичь (`game_meat_rich`)

- Tier/type: 2, food
- Current: `systems/iron-hills-system/icons/items/food/game_meat_rich.webp`
- Target: `icons/items/food/game_meat_rich.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Плотная дичь", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```

### Луговые медовые соты (`meadow_honeycomb`)

- Tier/type: 2, food
- Current: `systems/iron-hills-system/icons/items/food/meadow_honeycomb.webp`
- Target: `icons/items/food/meadow_honeycomb.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Луговые медовые соты", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```

### Дощечка солёной рыбы (`salted_fish_board`)

- Tier/type: 2, food
- Current: `systems/iron-hills-system/icons/items/food/salted_fish_board.webp`
- Target: `icons/items/food/salted_fish_board.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Дощечка солёной рыбы", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```

### Сырое филе змея (`serpent_fillet_raw`)

- Tier/type: 2, food
- Current: `systems/iron-hills-system/icons/items/food/serpent_fillet_raw.webp`
- Target: `icons/items/food/serpent_fillet_raw.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Сырое филе змея", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```

### Сухари странника (`travelers_hardtack`)

- Tier/type: 2, food
- Current: `systems/iron-hills-system/icons/items/food/travelers_hardtack.webp`
- Target: `icons/items/food/travelers_hardtack.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Сухари странника", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```

### Бренди из вишни (`cherry_brandy_snifter`)

- Tier/type: 3, food
- Current: `systems/iron-hills-system/icons/items/food/cherry_brandy_snifter.webp`
- Target: `icons/items/food/cherry_brandy_snifter.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Бренди из вишни", fantasy edible dish photograph — balanced solids and hydration cues, white pottery dish with herb garnish, guild-town merchant lunch, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing neutral daylight window. --ar 1:1
```

### Окорок горного трутня (`highland_grub_haunch`)

- Tier/type: 3, food
- Current: `systems/iron-hills-system/icons/items/food/highland_grub_haunch.webp`
- Target: `icons/items/food/highland_grub_haunch.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Окорок горного трутня", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, white pottery dish with herb garnish, guild-town merchant lunch, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing neutral daylight window. --ar 1:1
```

### Завтрак шахтёра (`miners_breakfast`)

- Tier/type: 3, food
- Current: `systems/iron-hills-system/icons/items/food/miners_breakfast.webp`
- Target: `icons/items/food/miners_breakfast.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Завтрак шахтёра", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, white pottery dish with herb garnish, guild-town merchant lunch, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing neutral daylight window. --ar 1:1
```

### Чайник мятного чая (`mint_leaf_tea_pot`)

- Tier/type: 3, food
- Current: `systems/iron-hills-system/icons/items/food/mint_leaf_tea_pot.webp`
- Target: `icons/items/food/mint_leaf_tea_pot.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Чайник мятного чая", fantasy edible dish photograph — balanced solids and hydration cues, white pottery dish with herb garnish, guild-town merchant lunch, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing neutral daylight window. --ar 1:1
```

### Кувшин яблочного сидра (`orchard_cider_jug`)

- Tier/type: 3, food
- Current: `systems/iron-hills-system/icons/items/food/orchard_cider_jug.webp`
- Target: `icons/items/food/orchard_cider_jug.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Кувшин яблочного сидра", fantasy edible dish photograph — emphasis on steam mug / jug / soup moisture shimmer, white pottery dish with herb garnish, guild-town merchant lunch, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing neutral daylight window. --ar 1:1
```

### Ужин караванщика (`caravan_roast`)

- Tier/type: 4, food
- Current: `systems/iron-hills-system/icons/items/food/caravan_roast.webp`
- Target: `icons/items/food/caravan_roast.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Ужин караванщика", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, bronze charger plate with carved rim, caravan feast seasoned by road spice, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing clean side light. --ar 1:1
```

### Копчёная форель (`smoked_trout_board`)

- Tier/type: 4, food
- Current: `systems/iron-hills-system/icons/items/food/smoked_trout_board.webp`
- Target: `icons/items/food/smoked_trout_board.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Копчёная форель", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, bronze charger plate with carved rim, caravan feast seasoned by road spice, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing clean side light. --ar 1:1
```

### Приправленное дорожное вино (`spiced_route_wine`)

- Tier/type: 4, food
- Current: `systems/iron-hills-system/icons/items/food/spiced_route_wine.webp`
- Target: `icons/items/food/spiced_route_wine.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Приправленное дорожное вино", fantasy edible dish photograph — balanced solids and hydration cues, bronze charger plate with carved rim, caravan feast seasoned by road spice, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing clean side light. --ar 1:1
```

### Нарезка с виверны (`wyvern_stringy_cut`)

- Tier/type: 4, food
- Current: `systems/iron-hills-system/icons/items/food/wyvern_stringy_cut.webp`
- Target: `icons/items/food/wyvern_stringy_cut.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Нарезка с виверны", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, bronze charger plate with carved rim, caravan feast seasoned by road spice, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing clean side light. --ar 1:1
```

### Янтарный мёд в роге (`amber_mead_horn`)

- Tier/type: 5, food
- Current: `systems/iron-hills-system/icons/items/food/amber_mead_horn.webp`
- Target: `icons/items/food/amber_mead_horn.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Янтарный мёд в роге", fantasy edible dish photograph — balanced solids and hydration cues, silver-plated platter, manor hall banquet snippet, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing soft rim highlights. --ar 1:1
```

### Пирог с овощами и ягодами (`lordly_vegetable_pie`)

- Tier/type: 5, food
- Current: `systems/iron-hills-system/icons/items/food/lordly_vegetable_pie.webp`
- Target: `icons/items/food/lordly_vegetable_pie.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Пирог с овощами и ягодами", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, silver-plated platter, manor hall banquet snippet, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing soft rim highlights. --ar 1:1
```

### Бренди «Огненная метка» (`firebrand_brandy_snifter`)

- Tier/type: 6, food
- Current: `systems/iron-hills-system/icons/items/food/firebrand_brandy_snifter.webp`
- Target: `icons/items/food/firebrand_brandy_snifter.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Бренди «Огненная метка»", fantasy edible dish photograph — balanced solids and hydration cues, cast iron skillet presentation still steaming, noble hunter lodge luxury, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing fire-kissed glow. --ar 1:1
```

### Жаровня «Вулкан» (`volcanic_skillet`)

- Tier/type: 6, food
- Current: `systems/iron-hills-system/icons/items/food/volcanic_skillet.webp`
- Target: `icons/items/food/volcanic_skillet.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Жаровня «Вулкан»", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, cast iron skillet presentation still steaming, noble hunter lodge luxury, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing fire-kissed glow. --ar 1:1
```

### Талая ледниковая вода (`glacier_melt_skin`)

- Tier/type: 7, food
- Current: `systems/iron-hills-system/icons/items/food/glacier_melt_skin.webp`
- Target: `icons/items/food/glacier_melt_skin.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Талая ледниковая вода", fantasy edible dish photograph — emphasis on steam mug / jug / soup moisture shimmer, dark slate plate bioluminescent garnish accents, exotic imported rarity, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cool moonlit shimmer. --ar 1:1
```

### Тарт из лунного фрукта (`moonfruit_tart`)

- Tier/type: 7, food
- Current: `systems/iron-hills-system/icons/items/food/moonfruit_tart.webp`
- Target: `icons/items/food/moonfruit_tart.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Тарт из лунного фрукта", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, dark slate plate bioluminescent garnish accents, exotic imported rarity, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cool moonlit shimmer. --ar 1:1
```

### Жаркое с глазурью Авроры (`aurora_glazed_roast`)

- Tier/type: 8, food
- Current: `systems/iron-hills-system/icons/items/food/aurora_glazed_roast.webp`
- Target: `icons/items/food/aurora_glazed_roast.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Жаркое с глазурью Авроры", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, pearlescent porcelain, master-chef artistry visible saucing, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing studio highlight gradient. --ar 1:1
```

### Игристый сок Авроры (`aurora_sparkling_juice`)

- Tier/type: 8, food
- Current: `systems/iron-hills-system/icons/items/food/aurora_sparkling_juice.webp`
- Target: `icons/items/food/aurora_sparkling_juice.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Игристый сок Авроры", fantasy edible dish photograph — balanced solids and hydration cues, pearlescent porcelain, master-chef artistry visible saucing, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing studio highlight gradient. --ar 1:1
```

### Блюдо солнечного буфета (`solar_buffet_course`)

- Tier/type: 9, food
- Current: `systems/iron-hills-system/icons/items/food/solar_buffet_course.webp`
- Target: `icons/items/food/solar_buffet_course.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Блюдо солнечного буфета", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, gold-leaf trimmed platter, legendary banquet centerpiece miniature, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing golden divine backlight. --ar 1:1
```

### Солнечное шампанское (`solar_champagne_flute`)

- Tier/type: 9, food
- Current: `systems/iron-hills-system/icons/items/food/solar_champagne_flute.webp`
- Target: `icons/items/food/solar_champagne_flute.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Солнечное шампанское", fantasy edible dish photograph — balanced solids and hydration cues, gold-leaf trimmed platter, legendary banquet centerpiece miniature, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing golden divine backlight. --ar 1:1
```

### Фляга небесной росы (`celestial_dew_flask`)

- Tier/type: 10, food
- Current: `systems/iron-hills-system/icons/items/food/celestial_dew_flask.webp`
- Target: `icons/items/food/celestial_dew_flask.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Фляга небесной росы", fantasy edible dish photograph — balanced solids and hydration cues, floating crystalline dish barely touching surface, mythical feast worthy of gods, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing spark halo lens flare subtle aura distortion. --ar 1:1
```

### Ужин генезиса (`genesis_supper`)

- Tier/type: 10, food
- Current: `systems/iron-hills-system/icons/items/food/genesis_supper.webp`
- Target: `icons/items/food/genesis_supper.webp`
- Prompt source: docs/content/food-prompts.json

```
Concept "Ужин генезиса", fantasy edible dish photograph — emphasis on hearty solids roast carved portions, floating crystalline dish barely touching surface, mythical feast worthy of gods, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing spark halo lens flare subtle aura distortion. --ar 1:1
```


## materials

### Шкура зверя (`animal_hide`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/animal_hide.webp`
- Target: `icons/items/materials/animal_hide.webp`
- Prompt source: fallback

```
Concept "Шкура зверя", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Жильё зверя (`beast_sinew_spool`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/beast_sinew_spool.webp`
- Target: `icons/items/materials/beast_sinew_spool.webp`
- Prompt source: fallback

```
Concept "Жильё зверя", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Ткань (`cloth`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/cloth.webp`
- Target: `icons/items/materials/cloth.webp`
- Prompt source: fallback

```
Concept "Ткань", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Уголь (`coal`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/coal.webp`
- Target: `icons/items/materials/coal.webp`
- Prompt source: fallback

```
Concept "Уголь", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Медный слиток (`copper_ingot`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/copper_ingot.webp`
- Target: `icons/items/materials/copper_ingot.webp`
- Prompt source: fallback

```
Concept "Медный слиток", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Медная руда (`copper_ore`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/copper_ore.webp`
- Target: `icons/items/materials/copper_ore.webp`
- Prompt source: fallback

```
Concept "Медная руда", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Осколок клыка (`fang_shard`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/fang_shard.webp`
- Target: `icons/items/materials/fang_shard.webp`
- Prompt source: fallback

```
Concept "Осколок клыка", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Кремень (`flint`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/flint.webp`
- Target: `icons/items/materials/flint.webp`
- Prompt source: fallback

```
Concept "Кремень", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Обычная трава (`herb_common`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/herb_common.webp`
- Target: `icons/items/materials/herb_common.webp`
- Prompt source: fallback

```
Concept "Обычная трава", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Целебный лист (`herb_healing`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/herb_healing.webp`
- Target: `icons/items/materials/herb_healing.webp`
- Prompt source: fallback

```
Concept "Целебный лист", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Болотный гриб (`mushroom_bog`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/mushroom_bog.webp`
- Target: `icons/items/materials/mushroom_bog.webp`
- Prompt source: fallback

```
Concept "Болотный гриб", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Масло (фляга) (`oil_flask`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/oil_flask.webp`
- Target: `icons/items/materials/oil_flask.webp`
- Prompt source: fallback

```
Concept "Масло (фляга)", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Сосновая доска (`pine_wood`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/pine_wood.webp`
- Target: `icons/items/materials/pine_wood.webp`
- Prompt source: fallback

```
Concept "Сосновая доска", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Сырое волокно (`raw_fiber`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/raw_fiber.webp`
- Target: `icons/items/materials/raw_fiber.webp`
- Prompt source: fallback

```
Concept "Сырое волокно", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Верёвка (`rope`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/rope.webp`
- Target: `icons/items/materials/rope.webp`
- Prompt source: fallback

```
Concept "Верёвка", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Небольшая шкура (сырая) (`small_pelt_uncured`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/small_pelt_uncured.webp`
- Target: `icons/items/materials/small_pelt_uncured.webp`
- Prompt source: fallback

```
Concept "Небольшая шкура (сырая)", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Камень (`stone`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/stone.webp`
- Target: `icons/items/materials/stone.webp`
- Prompt source: fallback

```
Concept "Камень", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Выделанная кожа (`tanned_leather`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/tanned_leather.webp`
- Target: `icons/items/materials/tanned_leather.webp`
- Prompt source: fallback

```
Concept "Выделанная кожа", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Пыльца ночных мотыльков (`wisp_moth_powder`)

- Tier/type: 1, material
- Current: `systems/iron-hills-system/icons/items/materials/wisp_moth_powder.webp`
- Target: `icons/items/materials/wisp_moth_powder.webp`
- Prompt source: fallback

```
Concept "Пыльца ночных мотыльков", a single fantasy crafting material, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Киль птицеящера (`avian_keel_bone`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/avian_keel_bone.webp`
- Target: `icons/items/materials/avian_keel_bone.webp`
- Prompt source: fallback

```
Concept "Киль птицеящера", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Кольца из щетины кабана (`bristle_keg_rings`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/bristle_keg_rings.webp`
- Target: `icons/items/materials/bristle_keg_rings.webp`
- Prompt source: fallback

```
Concept "Кольца из щетины кабана", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Бронзовый слиток (`bronze_ingot`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/bronze_ingot.webp`
- Target: `icons/items/materials/bronze_ingot.webp`
- Prompt source: fallback

```
Concept "Бронзовый слиток", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Тонкая ткань (`fine_cloth`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/fine_cloth.webp`
- Target: `icons/items/materials/fine_cloth.webp`
- Prompt source: fallback

```
Concept "Тонкая ткань", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Кузнечный кокс (`forge_coal`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/forge_coal.webp`
- Target: `icons/items/materials/forge_coal.webp`
- Prompt source: fallback

```
Concept "Кузнечный кокс", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Стекло (`glass`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/glass.webp`
- Target: `icons/items/materials/glass.webp`
- Prompt source: fallback

```
Concept "Стекло", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Гранит (`granite`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/granite.webp`
- Target: `icons/items/materials/granite.webp`
- Prompt source: fallback

```
Concept "Гранит", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Дубовая доска (`oak_wood`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/oak_wood.webp`
- Target: `icons/items/materials/oak_wood.webp`
- Prompt source: fallback

```
Concept "Дубовая доска", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Ядовитый клык (`poison_fang`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/poison_fang.webp`
- Target: `icons/items/materials/poison_fang.webp`
- Prompt source: fallback

```
Concept "Ядовитый клык", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Кварц (`quartz`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/quartz.webp`
- Target: `icons/items/materials/quartz.webp`
- Prompt source: fallback

```
Concept "Кварц", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Горький корень (`root_bitter`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/root_bitter.webp`
- Target: `icons/items/materials/root_bitter.webp`
- Prompt source: fallback

```
Concept "Горький корень", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Слабая змеиная желчь (`serpent_sac_mild`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/serpent_sac_mild.webp`
- Target: `icons/items/materials/serpent_sac_mild.webp`
- Prompt source: fallback

```
Concept "Слабая змеиная желчь", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Толстая шкура (`thick_hide`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/thick_hide.webp`
- Target: `icons/items/materials/thick_hide.webp`
- Prompt source: fallback

```
Concept "Толстая шкура", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Оловянная руда (`tin_ore`)

- Tier/type: 2, material
- Current: `systems/iron-hills-system/icons/items/materials/tin_ore.webp`
- Target: `icons/items/materials/tin_ore.webp`
- Prompt source: fallback

```
Concept "Оловянная руда", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Железа вожака (`alpha_musk_gland`)

- Tier/type: 3, material
- Current: `systems/iron-hills-system/icons/items/materials/alpha_musk_gland.webp`
- Target: `icons/items/materials/alpha_musk_gland.webp`
- Prompt source: fallback

```
Concept "Железа вожака", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Лунный цветок (`flower_moon`)

- Tier/type: 3, material
- Current: `systems/iron-hills-system/icons/items/materials/flower_moon.webp`
- Target: `icons/items/materials/flower_moon.webp`
- Prompt source: fallback

```
Concept "Лунный цветок", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Твёрдая древесина (`hardwood`)

- Tier/type: 3, material
- Current: `systems/iron-hills-system/icons/items/materials/hardwood.webp`
- Target: `icons/items/materials/hardwood.webp`
- Prompt source: fallback

```
Concept "Твёрдая древесина", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Железный слиток (`iron_ingot`)

- Tier/type: 3, material
- Current: `systems/iron-hills-system/icons/items/materials/iron_ingot.webp`
- Target: `icons/items/materials/iron_ingot.webp`
- Prompt source: fallback

```
Concept "Железный слиток", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Железная руда (`iron_ore`)

- Tier/type: 3, material
- Current: `systems/iron-hills-system/icons/items/materials/iron_ore.webp`
- Target: `icons/items/materials/iron_ore.webp`
- Prompt source: fallback

```
Concept "Железная руда", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Мана-камень (`mana_stone`)

- Tier/type: 3, material
- Current: `systems/iron-hills-system/icons/items/materials/mana_stone.webp`
- Target: `icons/items/materials/mana_stone.webp`
- Prompt source: fallback

```
Concept "Мана-камень", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Железа монстра (`monster_gland`)

- Tier/type: 3, material
- Current: `systems/iron-hills-system/icons/items/materials/monster_gland.webp`
- Target: `icons/items/materials/monster_gland.webp`
- Prompt source: fallback

```
Concept "Железа монстра", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Обсидиан (`obsidian`)

- Tier/type: 3, material
- Current: `systems/iron-hills-system/icons/items/materials/obsidian.webp`
- Target: `icons/items/materials/obsidian.webp`
- Prompt source: fallback

```
Concept "Обсидиан", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Чешуйчатая шкура (`scale_hide`)

- Tier/type: 3, material
- Current: `systems/iron-hills-system/icons/items/materials/scale_hide.webp`
- Target: `icons/items/materials/scale_hide.webp`
- Prompt source: fallback

```
Concept "Чешуйчатая шкура", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Шёлк (`silk`)

- Tier/type: 3, material
- Current: `systems/iron-hills-system/icons/items/materials/silk.webp`
- Target: `icons/items/materials/silk.webp`
- Prompt source: fallback

```
Concept "Шёлк", a single fantasy crafting material, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Чешуя дрейка (`drake_scale`)

- Tier/type: 4, material
- Current: `systems/iron-hills-system/icons/items/materials/drake_scale.webp`
- Target: `icons/items/materials/drake_scale.webp`
- Prompt source: fallback

```
Concept "Чешуя дрейка", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Пыль зачарования (`enchant_dust`)

- Tier/type: 4, material
- Current: `systems/iron-hills-system/icons/items/materials/enchant_dust.webp`
- Target: `icons/items/materials/enchant_dust.webp`
- Prompt source: fallback

```
Concept "Пыль зачарования", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Железное дерево (`ironwood`)

- Tier/type: 4, material
- Current: `systems/iron-hills-system/icons/items/materials/ironwood.webp`
- Target: `icons/items/materials/ironwood.webp`
- Prompt source: fallback

```
Concept "Железное дерево", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Смоляная пробка хищника (`predator_resin_mass`)

- Tier/type: 4, material
- Current: `systems/iron-hills-system/icons/items/materials/predator_resin_mass.webp`
- Target: `icons/items/materials/predator_resin_mass.webp`
- Prompt source: fallback

```
Concept "Смоляная пробка хищника", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Рубин (`ruby`)

- Tier/type: 4, material
- Current: `systems/iron-hills-system/icons/items/materials/ruby.webp`
- Target: `icons/items/materials/ruby.webp`
- Prompt source: fallback

```
Concept "Рубин", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Паучий шёлк (`spider_silk`)

- Tier/type: 4, material
- Current: `systems/iron-hills-system/icons/items/materials/spider_silk.webp`
- Target: `icons/items/materials/spider_silk.webp`
- Prompt source: fallback

```
Concept "Паучий шёлк", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Стальной слиток (`steel_ingot`)

- Tier/type: 4, material
- Current: `systems/iron-hills-system/icons/items/materials/steel_ingot.webp`
- Target: `icons/items/materials/steel_ingot.webp`
- Prompt source: fallback

```
Concept "Стальной слиток", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Мешок с ядом (`venom_sac`)

- Tier/type: 4, material
- Current: `systems/iron-hills-system/icons/items/materials/venom_sac.webp`
- Target: `icons/items/materials/venom_sac.webp`
- Prompt source: fallback

```
Concept "Мешок с ядом", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Жилье виверны (`wyvern_sinew_filament`)

- Tier/type: 4, material
- Current: `systems/iron-hills-system/icons/items/materials/wyvern_sinew_filament.webp`
- Target: `icons/items/materials/wyvern_sinew_filament.webp`
- Prompt source: fallback

```
Concept "Жилье виверны", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Мастерская смола (`artisans_resin`)

- Tier/type: 5, material
- Current: `systems/iron-hills-system/icons/items/materials/artisans_resin.webp`
- Target: `icons/items/materials/artisans_resin.webp`
- Prompt source: fallback

```
Concept "Мастерская смола", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Кожа дрейка (`drake_hide`)

- Tier/type: 5, material
- Current: `systems/iron-hills-system/icons/items/materials/drake_hide.webp`
- Target: `icons/items/materials/drake_hide.webp`
- Prompt source: fallback

```
Concept "Кожа дрейка", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Закалённая сталь (`hardened_steel`)

- Tier/type: 5, material
- Current: `systems/iron-hills-system/icons/items/materials/hardened_steel.webp`
- Target: `icons/items/materials/hardened_steel.webp`
- Prompt source: fallback

```
Concept "Закалённая сталь", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Мана-кристалл (`mana_crystal`)

- Tier/type: 5, material
- Current: `systems/iron-hills-system/icons/items/materials/mana_crystal.webp`
- Target: `icons/items/materials/mana_crystal.webp`
- Prompt source: fallback

```
Concept "Мана-кристалл", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Лунное волокно (`moonweave`)

- Tier/type: 5, material
- Current: `systems/iron-hills-system/icons/items/materials/moonweave.webp`
- Target: `icons/items/materials/moonweave.webp`
- Prompt source: fallback

```
Concept "Лунное волокно", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Сапфир (`sapphire`)

- Tier/type: 5, material
- Current: `systems/iron-hills-system/icons/items/materials/sapphire.webp`
- Target: `icons/items/materials/sapphire.webp`
- Prompt source: fallback

```
Concept "Сапфир", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Цветок духов (`spirit_bloom`)

- Tier/type: 5, material
- Current: `systems/iron-hills-system/icons/items/materials/spirit_bloom.webp`
- Target: `icons/items/materials/spirit_bloom.webp`
- Prompt source: fallback

```
Concept "Цветок духов", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Древесина духов (`spirit_wood`)

- Tier/type: 5, material
- Current: `systems/iron-hills-system/icons/items/materials/spirit_wood.webp`
- Target: `icons/items/materials/spirit_wood.webp`
- Prompt source: fallback

```
Concept "Древесина духов", a single fantasy crafting material, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Алмаз (`diamond`)

- Tier/type: 6, material
- Current: `systems/iron-hills-system/icons/items/materials/diamond.webp`
- Target: `icons/items/materials/diamond.webp`
- Prompt source: fallback

```
Concept "Алмаз", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Чёрное дерево (`ebony`)

- Tier/type: 6, material
- Current: `systems/iron-hills-system/icons/items/materials/ebony.webp`
- Target: `icons/items/materials/ebony.webp`
- Prompt source: fallback

```
Concept "Чёрное дерево", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Митрильный слиток (`mithril_ingot`)

- Tier/type: 6, material
- Current: `systems/iron-hills-system/icons/items/materials/mithril_ingot.webp`
- Target: `icons/items/materials/mithril_ingot.webp`
- Prompt source: fallback

```
Concept "Митрильный слиток", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Митрильная руда (`mithril_ore`)

- Tier/type: 6, material
- Current: `systems/iron-hills-system/icons/items/materials/mithril_ore.webp`
- Target: `icons/items/materials/mithril_ore.webp`
- Prompt source: fallback

```
Concept "Митрильная руда", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Перо феникса (`phoenix_feather`)

- Tier/type: 6, material
- Current: `systems/iron-hills-system/icons/items/materials/phoenix_feather.webp`
- Target: `icons/items/materials/phoenix_feather.webp`
- Prompt source: fallback

```
Concept "Перо феникса", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Теневое волокно (`shadowweave`)

- Tier/type: 6, material
- Current: `systems/iron-hills-system/icons/items/materials/shadowweave.webp`
- Target: `icons/items/materials/shadowweave.webp`
- Prompt source: fallback

```
Concept "Теневое волокно", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Эссенция души (`soul_essence`)

- Tier/type: 6, material
- Current: `systems/iron-hills-system/icons/items/materials/soul_essence.webp`
- Target: `icons/items/materials/soul_essence.webp`
- Prompt source: fallback

```
Concept "Эссенция души", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Шкура варга (`warg_pelt`)

- Tier/type: 6, material
- Current: `systems/iron-hills-system/icons/items/materials/warg_pelt.webp`
- Target: `icons/items/materials/warg_pelt.webp`
- Prompt source: fallback

```
Concept "Шкура варга", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Тёмное железо (`dark_iron`)

- Tier/type: 7, material
- Current: `systems/iron-hills-system/icons/items/materials/dark_iron.webp`
- Target: `icons/items/materials/dark_iron.webp`
- Prompt source: fallback

```
Concept "Тёмное железо", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Тёмная руда (`dark_iron_ore`)

- Tier/type: 7, material
- Current: `systems/iron-hills-system/icons/items/materials/dark_iron_ore.webp`
- Target: `icons/items/materials/dark_iron_ore.webp`
- Prompt source: fallback

```
Concept "Тёмная руда", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Вечное дерево (`eternal_wood`)

- Tier/type: 7, material
- Current: `systems/iron-hills-system/icons/items/materials/eternal_wood.webp`
- Target: `icons/items/materials/eternal_wood.webp`
- Prompt source: fallback

```
Concept "Вечное дерево", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Сердце великана (`giant_heart`)

- Tier/type: 7, material
- Current: `systems/iron-hills-system/icons/items/materials/giant_heart.webp`
- Target: `icons/items/materials/giant_heart.webp`
- Prompt source: fallback

```
Concept "Сердце великана", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Планарная скоба (`planar_clip`)

- Tier/type: 7, material
- Current: `systems/iron-hills-system/icons/items/materials/planar_clip.webp`
- Target: `icons/items/materials/planar_clip.webp`
- Prompt source: fallback

```
Concept "Планарная скоба", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Звёздная нить (`starthread`)

- Tier/type: 7, material
- Current: `systems/iron-hills-system/icons/items/materials/starthread.webp`
- Target: `icons/items/materials/starthread.webp`
- Prompt source: fallback

```
Concept "Звёздная нить", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Кристалл Пустоты (`void_crystal`)

- Tier/type: 7, material
- Current: `systems/iron-hills-system/icons/items/materials/void_crystal.webp`
- Target: `icons/items/materials/void_crystal.webp`
- Prompt source: fallback

```
Concept "Кристалл Пустоты", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Шкура виверны (`wyvern_hide`)

- Tier/type: 7, material
- Current: `systems/iron-hills-system/icons/items/materials/wyvern_hide.webp`
- Target: `icons/items/materials/wyvern_hide.webp`
- Prompt source: fallback

```
Concept "Шкура виверны", a single fantasy crafting material, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Жеода эона (`aeon_geode`)

- Tier/type: 8, material
- Current: `systems/iron-hills-system/icons/items/materials/aeon_geode.webp`
- Target: `icons/items/materials/aeon_geode.webp`
- Prompt source: fallback

```
Concept "Жеода эона", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Моток арканной проволоки (`arcane_mesh`)

- Tier/type: 8, material
- Current: `systems/iron-hills-system/icons/items/materials/arcane_mesh.webp`
- Target: `icons/items/materials/arcane_mesh.webp`
- Prompt source: fallback

```
Concept "Моток арканной проволоки", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Кровь дракона (`dragon_blood`)

- Tier/type: 8, material
- Current: `systems/iron-hills-system/icons/items/materials/dragon_blood.webp`
- Target: `icons/items/materials/dragon_blood.webp`
- Prompt source: fallback

```
Concept "Кровь дракона", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Кожа дракона (`dragon_hide`)

- Tier/type: 8, material
- Current: `systems/iron-hills-system/icons/items/materials/dragon_hide.webp`
- Target: `icons/items/materials/dragon_hide.webp`
- Prompt source: fallback

```
Concept "Кожа дракона", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Звёздный металл (`starmetal`)

- Tier/type: 8, material
- Current: `systems/iron-hills-system/icons/items/materials/starmetal.webp`
- Target: `icons/items/materials/starmetal.webp`
- Prompt source: fallback

```
Concept "Звёздный металл", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Звёздная руда (`starmetal_ore`)

- Tier/type: 8, material
- Current: `systems/iron-hills-system/icons/items/materials/starmetal_ore.webp`
- Target: `icons/items/materials/starmetal_ore.webp`
- Prompt source: fallback

```
Concept "Звёздная руда", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Ткань Пустоты (`void_weave`)

- Tier/type: 8, material
- Current: `systems/iron-hills-system/icons/items/materials/void_weave.webp`
- Target: `icons/items/materials/void_weave.webp`
- Prompt source: fallback

```
Concept "Ткань Пустоты", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Мировое дерево (`world_tree`)

- Tier/type: 8, material
- Current: `systems/iron-hills-system/icons/items/materials/world_tree.webp`
- Target: `icons/items/materials/world_tree.webp`
- Prompt source: fallback

```
Concept "Мировое дерево", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Лишайник Бездны (`abyss_lichen`)

- Tier/type: 9, material
- Current: `systems/iron-hills-system/icons/items/materials/abyss_lichen.webp`
- Target: `icons/items/materials/abyss_lichen.webp`
- Prompt source: fallback

```
Concept "Лишайник Бездны", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Нить Авроры (`aurora_thread`)

- Tier/type: 9, material
- Current: `systems/iron-hills-system/icons/items/materials/aurora_thread.webp`
- Target: `icons/items/materials/aurora_thread.webp`
- Prompt source: fallback

```
Concept "Нить Авроры", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Шкура гидры (`hydra_hide`)

- Tier/type: 9, material
- Current: `systems/iron-hills-system/icons/items/materials/hydra_hide.webp`
- Target: `icons/items/materials/hydra_hide.webp`
- Prompt source: fallback

```
Concept "Шкура гидры", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Орихалк (`orichalcum`)

- Tier/type: 9, material
- Current: `systems/iron-hills-system/icons/items/materials/orichalcum.webp`
- Target: `icons/items/materials/orichalcum.webp`
- Prompt source: fallback

```
Concept "Орихалк", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Осколок реликта (`relic_shard`)

- Tier/type: 9, material
- Current: `systems/iron-hills-system/icons/items/materials/relic_shard.webp`
- Target: `icons/items/materials/relic_shard.webp`
- Prompt source: fallback

```
Concept "Осколок реликта", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Осколок звезды (`star_shard`)

- Tier/type: 9, material
- Current: `systems/iron-hills-system/icons/items/materials/star_shard.webp`
- Target: `icons/items/materials/star_shard.webp`
- Prompt source: fallback

```
Concept "Осколок звезды", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Доска солнечного дуба (`sun_oak_board`)

- Tier/type: 9, material
- Current: `systems/iron-hills-system/icons/items/materials/sun_oak_board.webp`
- Target: `icons/items/materials/sun_oak_board.webp`
- Prompt source: fallback

```
Concept "Доска солнечного дуба", a single fantasy crafting material, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Адамантий (`adamantium`)

- Tier/type: 10, material
- Current: `systems/iron-hills-system/icons/items/materials/adamantium.webp`
- Target: `icons/items/materials/adamantium.webp`
- Prompt source: fallback

```
Concept "Адамантий", a single fantasy crafting material, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Семя эпохи (`epoch_seed`)

- Tier/type: 10, material
- Current: `systems/iron-hills-system/icons/items/materials/epoch_seed.webp`
- Target: `icons/items/materials/epoch_seed.webp`
- Prompt source: fallback

```
Concept "Семя эпохи", a single fantasy crafting material, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Брус генезиса (`genesis_timber`)

- Tier/type: 10, material
- Current: `systems/iron-hills-system/icons/items/materials/genesis_timber.webp`
- Target: `icons/items/materials/genesis_timber.webp`
- Prompt source: fallback

```
Concept "Брус генезиса", a single fantasy crafting material, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Полотно генезиса (`genesis_weave`)

- Tier/type: 10, material
- Current: `systems/iron-hills-system/icons/items/materials/genesis_weave.webp`
- Target: `icons/items/materials/genesis_weave.webp`
- Prompt source: fallback

```
Concept "Полотно генезиса", a single fantasy crafting material, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Слёзы богов (`god_tears`)

- Tier/type: 10, material
- Current: `systems/iron-hills-system/icons/items/materials/god_tears.webp`
- Target: `icons/items/materials/god_tears.webp`
- Prompt source: fallback

```
Concept "Слёзы богов", a single fantasy crafting material, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Шкура Левиафана (`leviathan_hide`)

- Tier/type: 10, material
- Current: `systems/iron-hills-system/icons/items/materials/leviathan_hide.webp`
- Target: `icons/items/materials/leviathan_hide.webp`
- Prompt source: fallback

```
Concept "Шкура Левиафана", a single fantasy crafting material, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Сердце звезды (`star_heart`)

- Tier/type: 10, material
- Current: `systems/iron-hills-system/icons/items/materials/star_heart.webp`
- Target: `icons/items/materials/star_heart.webp`
- Prompt source: fallback

```
Concept "Сердце звезды", a single fantasy crafting material, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```


## potions

### Слабое противоядие (`antidote_weak`)

- Tier/type: 1, potion
- Current: `systems/iron-hills-system/icons/items/potions/antidote_weak.webp`
- Target: `icons/items/potions/antidote_weak.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Слабое противоядие", a single fantasy consumable potion bottle / sealed alchemical flask, concept: cleansing green shimmer neutralizing toxins, liquid appearance: murky russet suspension, sediment at bottom, vessel: cheap blown glass, none, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Малое зелье бодрости (`minor_energy`)

- Tier/type: 1, potion
- Current: `systems/iron-hills-system/icons/items/potions/minor_energy.webp`
- Target: `icons/items/potions/minor_energy.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Малое зелье бодрости", a single fantasy consumable potion bottle / sealed alchemical flask, concept: lightning stamina surge, brisk vitality, liquid appearance: murky russet suspension, sediment at bottom, vessel: cheap blown glass, none, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Малый тоник бодрости (`minor_energy_max`)

- Tier/type: 1, potion
- Current: `systems/iron-hills-system/icons/items/potions/minor_energy_max.webp`
- Target: `icons/items/potions/minor_energy_max.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Малый тоник бодрости", a single fantasy consumable potion bottle / sealed alchemical flask, concept: expanded lung-heart endurance reservoir, liquid appearance: murky russet suspension, sediment at bottom, vessel: cheap blown glass, none, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Малое зелье лечения (`minor_heal`)

- Tier/type: 1, potion
- Current: `systems/iron-hills-system/icons/items/potions/minor_heal.webp`
- Target: `icons/items/potions/minor_heal.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Малое зелье лечения", a single fantasy consumable potion bottle / sealed alchemical flask, concept: wounds knitting shut, restorative warmth, liquid appearance: murky russet suspension, sediment at bottom, vessel: cheap blown glass, none, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Фляга чистой воды (`water_flask`)

- Tier/type: 1, potion
- Current: `systems/iron-hills-system/icons/items/potions/water_flask.webp`
- Target: `icons/items/potions/water_flask.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Фляга чистой воды", a single fantasy consumable potion bottle / sealed alchemical flask, concept: crisp mountain spring clarity, liquid appearance: murky russet suspension, sediment at bottom, vessel: cheap blown glass, none, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Зелье бодрости (`energy_potion`)

- Tier/type: 2, potion
- Current: `systems/iron-hills-system/icons/items/potions/energy_potion.webp`
- Target: `icons/items/potions/energy_potion.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Зелье бодрости", a single fantasy consumable potion bottle / sealed alchemical flask, concept: lightning stamina surge, brisk vitality, liquid appearance: clear amber serum, vessel: simple flask with cork, very faint inner shimmer, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Тоник выносливости (`energy_potion_max`)

- Tier/type: 2, potion
- Current: `systems/iron-hills-system/icons/items/potions/energy_potion_max.webp`
- Target: `icons/items/potions/energy_potion_max.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Тоник выносливости", a single fantasy consumable potion bottle / sealed alchemical flask, concept: expanded lung-heart endurance reservoir, liquid appearance: clear amber serum, vessel: simple flask with cork, very faint inner shimmer, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Зелье лечения (`heal_potion`)

- Tier/type: 2, potion
- Current: `systems/iron-hills-system/icons/items/potions/heal_potion.webp`
- Target: `icons/items/potions/heal_potion.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Зелье лечения", a single fantasy consumable potion bottle / sealed alchemical flask, concept: wounds knitting shut, restorative warmth, liquid appearance: clear amber serum, vessel: simple flask with cork, very faint inner shimmer, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Зелье маны (`mana_potion`)

- Tier/type: 2, potion
- Current: `systems/iron-hills-system/icons/items/potions/mana_potion.webp`
- Target: `icons/items/potions/mana_potion.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Зелье маны", a single fantasy consumable potion bottle / sealed alchemical flask, concept: arcane reservoir refill, whispering sparks, liquid appearance: clear amber serum, vessel: simple flask with cork, very faint inner shimmer, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Зелье скорости (`speed_potion`)

- Tier/type: 2, potion
- Current: `systems/iron-hills-system/icons/items/potions/speed_potion.webp`
- Target: `icons/items/potions/speed_potion.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Зелье скорости", a single fantasy consumable potion bottle / sealed alchemical flask, concept: wind-cut streak motes, kinetic hurry readiness, liquid appearance: clear amber serum, vessel: simple flask with cork, very faint inner shimmer, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Противоядие (`antidote`)

- Tier/type: 3, potion
- Current: `systems/iron-hills-system/icons/items/potions/antidote.webp`
- Target: `icons/items/potions/antidote.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Противоядие", a single fantasy consumable potion bottle / sealed alchemical flask, concept: cleansing green shimmer neutralizing toxins, liquid appearance: ruby-red translucent liquid, vessel: faceted crystal vial, soft pulse every few seconds, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Эликсир выносливости (`elixir_endurance`)

- Tier/type: 3, potion
- Current: `systems/iron-hills-system/icons/items/potions/elixir_endurance.webp`
- Target: `icons/items/potions/elixir_endurance.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Эликсир выносливости", a single fantasy consumable potion bottle / sealed alchemical flask, concept: expanded lung-heart endurance reservoir, liquid appearance: ruby-red translucent liquid, vessel: faceted crystal vial, soft pulse every few seconds, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Эликсир бодрости (`elixir_vigor`)

- Tier/type: 3, potion
- Current: `systems/iron-hills-system/icons/items/potions/elixir_vigor.webp`
- Target: `icons/items/potions/elixir_vigor.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Эликсир бодрости", a single fantasy consumable potion bottle / sealed alchemical flask, concept: lightning stamina surge, brisk vitality, liquid appearance: ruby-red translucent liquid, vessel: faceted crystal vial, soft pulse every few seconds, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Большое зелье лечения (`greater_heal`)

- Tier/type: 3, potion
- Current: `systems/iron-hills-system/icons/items/potions/greater_heal.webp`
- Target: `icons/items/potions/greater_heal.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Большое зелье лечения", a single fantasy consumable potion bottle / sealed alchemical flask, concept: wounds knitting shut, restorative warmth, liquid appearance: ruby-red translucent liquid, vessel: faceted crystal vial, soft pulse every few seconds, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Тоник адепта (выносливость) (`adept_endurance`)

- Tier/type: 4, potion
- Current: `systems/iron-hills-system/icons/items/potions/adept_endurance.webp`
- Target: `icons/items/potions/adept_endurance.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Тоник адепта (выносливость)", a single fantasy consumable potion bottle / sealed alchemical flask, concept: expanded lung-heart endurance reservoir, liquid appearance: deep sapphire swirl with metallic flakes, vessel: steel-capped alchemical bottle, steady faint aura, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Зелье адепта (бодрость) (`adept_energy`)

- Tier/type: 4, potion
- Current: `systems/iron-hills-system/icons/items/potions/adept_energy.webp`
- Target: `icons/items/potions/adept_energy.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Зелье адепта (бодрость)", a single fantasy consumable potion bottle / sealed alchemical flask, concept: lightning stamina surge, brisk vitality, liquid appearance: deep sapphire swirl with metallic flakes, vessel: steel-capped alchemical bottle, steady faint aura, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Зелье адепта (лечение) (`adept_heal`)

- Tier/type: 4, potion
- Current: `systems/iron-hills-system/icons/items/potions/adept_heal.webp`
- Target: `icons/items/potions/adept_heal.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Зелье адепта (лечение)", a single fantasy consumable potion bottle / sealed alchemical flask, concept: wounds knitting shut, restorative warmth, liquid appearance: deep sapphire swirl with metallic flakes, vessel: steel-capped alchemical bottle, steady faint aura, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Зелье адепта (мана) (`adept_mana`)

- Tier/type: 4, potion
- Current: `systems/iron-hills-system/icons/items/potions/adept_mana.webp`
- Target: `icons/items/potions/adept_mana.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Зелье адепта (мана)", a single fantasy consumable potion bottle / sealed alchemical flask, concept: arcane reservoir refill, whispering sparks, liquid appearance: deep sapphire swirl with metallic flakes, vessel: steel-capped alchemical bottle, steady faint aura, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Сильное противоядие (`superior_antidote`)

- Tier/type: 4, potion
- Current: `systems/iron-hills-system/icons/items/potions/superior_antidote.webp`
- Target: `icons/items/potions/superior_antidote.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Сильное противоядие", a single fantasy consumable potion bottle / sealed alchemical flask, concept: cleansing green shimmer neutralizing toxins, liquid appearance: deep sapphire swirl with metallic flakes, vessel: steel-capped alchemical bottle, steady faint aura, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Эликсир жизни (`elixir_life`)

- Tier/type: 5, potion
- Current: `systems/iron-hills-system/icons/items/potions/elixir_life.webp`
- Target: `icons/items/potions/elixir_life.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Эликсир жизни", a single fantasy consumable potion bottle / sealed alchemical flask, concept: total bodily renewal, cathedral purity, liquid appearance: pearlescent gradient liquid, vessel: ornate flask with seal wax, warm halo, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Великий эликсир (`grand_elixir`)

- Tier/type: 5, potion
- Current: `systems/iron-hills-system/icons/items/potions/grand_elixir.webp`
- Target: `icons/items/potions/grand_elixir.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Великий эликсир", a single fantasy consumable potion bottle / sealed alchemical flask, concept: expanded lung-heart endurance reservoir, liquid appearance: pearlescent gradient liquid, vessel: ornate flask with seal wax, warm halo, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Напиток святого (`saint_draught`)

- Tier/type: 5, potion
- Current: `systems/iron-hills-system/icons/items/potions/saint_draught.webp`
- Target: `icons/items/potions/saint_draught.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Напиток святого", a single fantasy consumable potion bottle / sealed alchemical flask, concept: wounds knitting shut, restorative warmth, liquid appearance: pearlescent gradient liquid, vessel: ornate flask with seal wax, warm halo, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Зелье шестого круга (`sixth_circle_mana`)

- Tier/type: 6, potion
- Current: `systems/iron-hills-system/icons/items/potions/sixth_circle_mana.webp`
- Target: `icons/items/potions/sixth_circle_mana.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Зелье шестого круга", a single fantasy consumable potion bottle / sealed alchemical flask, concept: arcane reservoir refill, whispering sparks, liquid appearance: silver-threaded emerald liquor, vessel: mithril-trimmed phial, cold magical steam wisps, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Штормовое зелье бодрости (`stormbrew_energy`)

- Tier/type: 6, potion
- Current: `systems/iron-hills-system/icons/items/potions/stormbrew_energy.webp`
- Target: `icons/items/potions/stormbrew_energy.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Штормовое зелье бодрости", a single fantasy consumable potion bottle / sealed alchemical flask, concept: lightning stamina surge, brisk vitality, liquid appearance: silver-threaded emerald liquor, vessel: mithril-trimmed phial, cold magical steam wisps, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Эликсир змеиной крови (`wyrmsblood_elixir`)

- Tier/type: 6, potion
- Current: `systems/iron-hills-system/icons/items/potions/wyrmsblood_elixir.webp`
- Target: `icons/items/potions/wyrmsblood_elixir.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Эликсир змеиной крови", a single fantasy consumable potion bottle / sealed alchemical flask, concept: wounds knitting shut, restorative warmth, liquid appearance: silver-threaded emerald liquor, vessel: mithril-trimmed phial, cold magical steam wisps, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Фильтр звёзд (лечение) (`astral_philter_heal`)

- Tier/type: 7, potion
- Current: `systems/iron-hills-system/icons/items/potions/astral_philter_heal.webp`
- Target: `icons/items/potions/astral_philter_heal.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Фильтр звёзд (лечение)", a single fantasy consumable potion bottle / sealed alchemical flask, concept: wounds knitting shut, restorative warmth, liquid appearance: star-speckled violet plasma, vessel: void-glass ampoule, orbiting dust motes of light, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Лунный настой маны (`lunar_infusion_mana`)

- Tier/type: 7, potion
- Current: `systems/iron-hills-system/icons/items/potions/lunar_infusion_mana.webp`
- Target: `icons/items/potions/lunar_infusion_mana.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Лунный настой маны", a single fantasy consumable potion bottle / sealed alchemical flask, concept: arcane reservoir refill, whispering sparks, liquid appearance: star-speckled violet plasma, vessel: void-glass ampoule, orbiting dust motes of light, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Зелье затмения (бодрость) (`eclipse_draught_energy`)

- Tier/type: 8, potion
- Current: `systems/iron-hills-system/icons/items/potions/eclipse_draught_energy.webp`
- Target: `icons/items/potions/eclipse_draught_energy.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Зелье затмения (бодрость)", a single fantasy consumable potion bottle / sealed alchemical flask, concept: lightning stamina surge, brisk vitality, liquid appearance: radiant golden ichor, vessel: filigree celestial flask, sunbeam god-rays through liquid, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Философский эликсир (`philosophers`)

- Tier/type: 8, potion
- Current: `systems/iron-hills-system/icons/items/potions/philosophers.webp`
- Target: `icons/items/potions/philosophers.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Философский эликсир", a single fantasy consumable potion bottle / sealed alchemical flask, concept: total bodily renewal, cathedral purity, liquid appearance: radiant golden ichor, vessel: filigree celestial flask, sunbeam god-rays through liquid, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Солнечный бальзам (`solar_balm_heal`)

- Tier/type: 9, potion
- Current: `systems/iron-hills-system/icons/items/potions/solar_balm_heal.webp`
- Target: `icons/items/potions/solar_balm_heal.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Солнечный бальзам", a single fantasy consumable potion bottle / sealed alchemical flask, concept: wounds knitting shut, restorative warmth, liquid appearance: molten sunrise-orange core fluid, vessel: orichalcum-stoppered relic bottle, voluntary sparks along rim, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Солнечный эликсир маны (`solar_balm_mana`)

- Tier/type: 9, potion
- Current: `systems/iron-hills-system/icons/items/potions/solar_balm_mana.webp`
- Target: `icons/items/potions/solar_balm_mana.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Солнечный эликсир маны", a single fantasy consumable potion bottle / sealed alchemical flask, concept: arcane reservoir refill, whispering sparks, liquid appearance: molten sunrise-orange core fluid, vessel: orichalcum-stoppered relic bottle, voluntary sparks along rim, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```

### Флакон генезиса (`genesis_vitalis`)

- Tier/type: 10, potion
- Current: `systems/iron-hills-system/icons/items/potions/genesis_vitalis.webp`
- Target: `icons/items/potions/genesis_vitalis.webp`
- Prompt source: docs/content/potions-prompts.json

```
Concept "Флакон генезиса", a single fantasy consumable potion bottle / sealed alchemical flask, concept: total bodily renewal, cathedral purity, liquid appearance: prismatic abyss-black mirror fluid, vessel: adamant seal amphora-miniature, reality ripple distortion around vessel, single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite, 1024x1024 composition suitable for square inventory slot --ar 1:1
```


## spells

### Призвать огонек (`call_wisp`)

- Tier/type: 1, spell
- Current: `systems/iron-hills-system/icons/items/spells/summon_skeleton.webp`
- Target: `icons/items/spells/call_wisp.webp`
- Prompt source: fallback

```
Concept "Призвать огонек", a magic spell icon for summon magic, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Огненный Bolt (`fire_bolt`)

- Tier/type: 1, spell
- Current: `systems/iron-hills-system/icons/items/spells/fire_bolt.webp`
- Target: `icons/items/spells/fire_bolt.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Огненный Bolt", spell icon for fire magic, orange-red flame, ember sparks, blackened rim, molten core, single-target magical projectile or focused spell sigil, pure spell energy, readable magical purpose, rank 1, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Нить фокуса (`focus_thread`)

- Tier/type: 1, spell
- Current: `systems/iron-hills-system/icons/items/spells/haste_spell.webp`
- Target: `icons/items/spells/focus_thread.webp`
- Prompt source: fallback

```
Concept "Нить фокуса", a magic spell icon for mind magic, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Путеводный отблеск (`guiding_glimmer`)

- Tier/type: 1, spell
- Current: `systems/iron-hills-system/icons/items/spells/holy_smite.webp`
- Target: `icons/items/spells/guiding_glimmer.webp`
- Prompt source: fallback

```
Concept "Путеводный отблеск", a magic spell icon for light magic, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Ледяной Осколок (`ice_shard`)

- Tier/type: 1, spell
- Current: `systems/iron-hills-system/icons/items/spells/ice_shard.webp`
- Target: `icons/items/spells/ice_shard.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Ледяной Осколок", spell icon for ice magic, cyan frost crystals, cold mist, sharp translucent shards, single-target magical projectile or focused spell sigil, condition cue: slowed, visually embedded as small runic accent, rank 1, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Тёмный Заряд (`shadow_bolt`)

- Tier/type: 1, spell
- Current: `systems/iron-hills-system/icons/items/spells/shadow_bolt.webp`
- Target: `icons/items/spells/shadow_bolt.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Тёмный Заряд", spell icon for shadow magic, deep violet-black void energy, smoke wisps, cracked darkness, single-target magical projectile or focused spell sigil, condition cue: exposed, visually embedded as small runic accent, rank 1, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Статическая искра (`static_spark`)

- Tier/type: 1, spell
- Current: `systems/iron-hills-system/icons/items/spells/lightning_bolt_spell.webp`
- Target: `icons/items/spells/static_spark.webp`
- Prompt source: fallback

```
Concept "Статическая искра", a magic spell icon for lightning magic, rough low-tier materials, worn edges, practical peasant craft, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Бросок Камня (`stone_throw`)

- Tier/type: 1, spell
- Current: `systems/iron-hills-system/icons/items/spells/stone_throw.webp`
- Target: `icons/items/spells/stone_throw.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Бросок Камня", spell icon for earth magic, stone, ochre dust, cracked ground glyph, heavy mineral fragments, single-target magical projectile or focused spell sigil, condition cue: stunned, visually embedded as small runic accent, rank 1, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Связать фамильяра (`bind_familiar`)

- Tier/type: 2, spell
- Current: `systems/iron-hills-system/icons/items/spells/summon_skeleton.webp`
- Target: `icons/items/spells/bind_familiar.webp`
- Prompt source: fallback

```
Concept "Связать фамильяра", a magic spell icon for summon magic, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Горящие руки (`burning_hands`)

- Tier/type: 2, spell
- Current: `systems/iron-hills-system/icons/items/spells/burning_hands.webp`
- Target: `icons/items/spells/burning_hands.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Горящие руки", spell icon for fire magic, orange-red flame, ember sparks, blackened rim, molten core, fan-shaped cone burst, wide front edge, clear directional sweep, condition cue: burning, visually embedded as small runic accent, rank 2, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Сумеречная игла (`dusk_needle`)

- Tier/type: 2, spell
- Current: `systems/iron-hills-system/icons/items/spells/shadow_bolt.webp`
- Target: `icons/items/spells/dusk_needle.webp`
- Prompt source: fallback

```
Concept "Сумеречная игла", a magic spell icon for shadow magic, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Касание обморожения (`frostbite_touch`)

- Tier/type: 2, spell
- Current: `systems/iron-hills-system/icons/items/spells/ice_shard.webp`
- Target: `icons/items/spells/frostbite_touch.webp`
- Prompt source: fallback

```
Concept "Касание обморожения", a magic spell icon for ice magic, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Праведный Удар (`holy_smite`)

- Tier/type: 2, spell
- Current: `systems/iron-hills-system/icons/items/spells/holy_smite.webp`
- Target: `icons/items/spells/holy_smite.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Праведный Удар", spell icon for light magic, white-gold sacred radiance, clean rays, pearl glow, single-target magical projectile or focused spell sigil, pure spell energy, readable magical purpose, rank 2, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Молния (`lightning_bolt_spell`)

- Tier/type: 2, spell
- Current: `systems/iron-hills-system/icons/items/spells/lightning_bolt_spell.webp`
- Target: `icons/items/spells/lightning_bolt_spell.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Молния", spell icon for lightning magic, blue-white lightning forks, copper-gold charge, electric halo, long narrow ray or lance of magic crossing the icon diagonally, condition cue: stunned, visually embedded as small runic accent, rank 2, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Грязевая хватка (`mud_snare`)

- Tier/type: 2, spell
- Current: `systems/iron-hills-system/icons/items/spells/stone_throw.webp`
- Target: `icons/items/spells/mud_snare.webp`
- Prompt source: fallback

```
Concept "Грязевая хватка", a magic spell icon for earth magic, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Замедление (`slow_spell`)

- Tier/type: 2, spell
- Current: `systems/iron-hills-system/icons/items/spells/slow_spell.webp`
- Target: `icons/items/spells/slow_spell.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Замедление", spell icon for mind magic, violet psychic rings, thought-wave distortion, subtle eye-like geometry, single-target magical projectile or focused spell sigil, constricting aura, downward pressure, hostile control magic, rank 2, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Пепельное копье (`cinder_lance`)

- Tier/type: 3, spell
- Current: `systems/iron-hills-system/icons/items/spells/fire_bolt.webp`
- Target: `icons/items/spells/cinder_lance.webp`
- Prompt source: fallback

```
Concept "Пепельное копье", a magic spell icon for fire magic, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Ускорение (`haste_spell`)

- Tier/type: 3, spell
- Current: `systems/iron-hills-system/icons/items/spells/haste_spell.webp`
- Target: `icons/items/spells/haste_spell.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Ускорение", spell icon for mind magic, violet psychic rings, thought-wave distortion, subtle eye-like geometry, single-target magical projectile or focused spell sigil, empowering aura, upward motion, quickened rhythm, rank 3, field-proven adventurer gear, reinforced details, readable silhouette, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Волна Исцеления (`healing_wave`)

- Tier/type: 3, spell
- Current: `systems/iron-hills-system/icons/items/spells/healing_wave.webp`
- Target: `icons/items/spells/healing_wave.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Волна Исцеления", spell icon for light magic, white-gold sacred radiance, clean rays, pearl glow, radial nova ring expanding outward from a bright center, healing energy, gentle restorative pulse, no injury gore, rank 3, field-proven adventurer gear, reinforced details, readable silhouette, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Ледяные Осколки (`ice_shards`)

- Tier/type: 3, spell
- Current: `systems/iron-hills-system/icons/items/spells/ice_shards.webp`
- Target: `icons/items/spells/ice_shards.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Ледяные Осколки", spell icon for ice magic, cyan frost crystals, cold mist, sharp translucent shards, cluster of several magical shards flying outward, each shard distinct, condition cue: slowed, visually embedded as small runic accent, rank 3, field-proven adventurer gear, reinforced details, readable silhouette, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Каменные Осколки (`rock_shards`)

- Tier/type: 3, spell
- Current: `systems/iron-hills-system/icons/items/spells/rock_shards.webp`
- Target: `icons/items/spells/rock_shards.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Каменные Осколки", spell icon for earth magic, stone, ochre dust, cracked ground glyph, heavy mineral fragments, cluster of several magical shards flying outward, each shard distinct, pure spell energy, readable magical purpose, rank 3, field-proven adventurer gear, reinforced details, readable silhouette, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Призвать Скелета (`summon_skeleton`)

- Tier/type: 3, spell
- Current: `systems/iron-hills-system/icons/items/spells/summon_skeleton.webp`
- Target: `icons/items/spells/summon_skeleton.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Призвать Скелета", spell icon for summon magic, teal necromantic summoning circle, bone-white motes, binding runes, single-target magical projectile or focused spell sigil, summoning portal, skeletal hint only as tiny glyph silhouette, no full character, rank 3, field-proven adventurer gear, reinforced details, readable silhouette, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Гром (`thunder_clap`)

- Tier/type: 3, spell
- Current: `systems/iron-hills-system/icons/items/spells/thunder_clap.webp`
- Target: `icons/items/spells/thunder_clap.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Гром", spell icon for lightning magic, blue-white lightning forks, copper-gold charge, electric halo, fan-shaped cone burst, wide front edge, clear directional sweep, condition cue: pushed, visually embedded as small runic accent, rank 3, field-proven adventurer gear, reinforced details, readable silhouette, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Покров ужаса (`veil_of_dread`)

- Tier/type: 3, spell
- Current: `systems/iron-hills-system/icons/items/spells/shadow_bolt.webp`
- Target: `icons/items/spells/veil_of_dread.webp`
- Prompt source: fallback

```
Concept "Покров ужаса", a magic spell icon for shadow magic, iron, bronze, seasoned leather and utilitarian workshop finish, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Изгнание (`banish`)

- Tier/type: 4, spell
- Current: `systems/iron-hills-system/icons/items/spells/banish.webp`
- Target: `icons/items/spells/banish.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Изгнание", spell icon for summon magic, teal necromantic summoning circle, bone-white motes, binding runes, single-target magical projectile or focused spell sigil, banishment seal, dissolving hostile spirit outline abstracted, rank 4, professional mercenary quality, polished steel fittings, careful packing, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Высасывание Жизни (`drain_life`)

- Tier/type: 4, spell
- Current: `systems/iron-hills-system/icons/items/spells/drain_life.webp`
- Target: `icons/items/spells/drain_life.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Высасывание Жизни", spell icon for shadow magic, deep violet-black void energy, smoke wisps, cracked darkness, single-target magical projectile or focused spell sigil, crimson shadow siphon, life thread pulled into dark core, rank 4, professional mercenary quality, polished steel fittings, careful packing, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Страх (`fear`)

- Tier/type: 4, spell
- Current: `systems/iron-hills-system/icons/items/spells/fear.webp`
- Target: `icons/items/spells/fear.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Страх", spell icon for mind magic, violet psychic rings, thought-wave distortion, subtle eye-like geometry, single-target magical projectile or focused spell sigil, constricting aura, downward pressure, hostile control magic, rank 4, professional mercenary quality, polished steel fittings, careful packing, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Огненный Шар (`fireball`)

- Tier/type: 4, spell
- Current: `systems/iron-hills-system/icons/items/spells/fireball.webp`
- Target: `icons/items/spells/fireball.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Огненный Шар", spell icon for fire magic, orange-red flame, ember sparks, blackened rim, molten core, circular area blast glyph, ring boundary and impact center, condition cue: burning, visually embedded as small runic accent, rank 4, professional mercenary quality, polished steel fittings, careful packing, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Морозная Вспышка (`frost_nova`)

- Tier/type: 4, spell
- Current: `systems/iron-hills-system/icons/items/spells/frost_nova.webp`
- Target: `icons/items/spells/frost_nova.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Морозная Вспышка", spell icon for ice magic, cyan frost crystals, cold mist, sharp translucent shards, radial nova ring expanding outward from a bright center, condition cue: stunned, visually embedded as small runic accent, rank 4, professional mercenary quality, polished steel fittings, careful packing, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Хват железного корня (`ironroot_grasp`)

- Tier/type: 4, spell
- Current: `systems/iron-hills-system/icons/items/spells/stone_throw.webp`
- Target: `icons/items/spells/ironroot_grasp.webp`
- Prompt source: fallback

```
Concept "Хват железного корня", a magic spell icon for earth magic, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Штормовой дротик (`storm_javelin`)

- Tier/type: 4, spell
- Current: `systems/iron-hills-system/icons/items/spells/lightning_bolt_spell.webp`
- Target: `icons/items/spells/storm_javelin.webp`
- Prompt source: fallback

```
Concept "Штормовой дротик", a magic spell icon for lightning magic, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Охранная печать (`warding_sigil`)

- Tier/type: 4, spell
- Current: `systems/iron-hills-system/icons/items/spells/holy_smite.webp`
- Target: `icons/items/spells/warding_sigil.webp`
- Prompt source: fallback

```
Concept "Охранная печать", a magic spell icon for light magic, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Каменный залп (`boulder_barrage`)

- Tier/type: 5, spell
- Current: `systems/iron-hills-system/icons/items/spells/stone_throw.webp`
- Target: `icons/items/spells/boulder_barrage.webp`
- Prompt source: fallback

```
Concept "Каменный залп", a magic spell icon for earth magic, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Цепная Молния (`chain_lightning`)

- Tier/type: 5, spell
- Current: `systems/iron-hills-system/icons/items/spells/chain_lightning.webp`
- Target: `icons/items/spells/chain_lightning.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Цепная Молния", spell icon for lightning magic, blue-white lightning forks, copper-gold charge, electric halo, branching chain arcs between small target sparks, readable bouncing path, condition cue: stunned, visually embedded as small runic accent, rank 5, masterwork guild finish, subtle runes, clean alchemical glass and fine leather, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Стена Огня (`fire_wall`)

- Tier/type: 5, spell
- Current: `systems/iron-hills-system/icons/items/spells/fire_wall.webp`
- Target: `icons/items/spells/fire_wall.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Стена Огня", spell icon for fire magic, orange-red flame, ember sparks, blackened rim, molten core, long narrow ray or lance of magic crossing the icon diagonally, condition cue: burning, visually embedded as small runic accent, rank 5, masterwork guild finish, subtle runes, clean alchemical glass and fine leather, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Ледниковая стена (`glacial_wall`)

- Tier/type: 5, spell
- Current: `systems/iron-hills-system/icons/items/spells/ice_shard.webp`
- Target: `icons/items/spells/glacial_wall.webp`
- Prompt source: fallback

```
Concept "Ледниковая стена", a magic spell icon for ice magic, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Массовое Замедление (`mass_slow`)

- Tier/type: 5, spell
- Current: `systems/iron-hills-system/icons/items/spells/mass_slow.webp`
- Target: `icons/items/spells/mass_slow.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Массовое Замедление", spell icon for mind magic, violet psychic rings, thought-wave distortion, subtle eye-like geometry, circular area blast glyph, ring boundary and impact center, constricting aura, downward pressure, hostile control magic, rank 5, masterwork guild finish, subtle runes, clean alchemical glass and fine leather, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Лучистая цепь (`radiant_chain`)

- Tier/type: 5, spell
- Current: `systems/iron-hills-system/icons/items/spells/holy_smite.webp`
- Target: `icons/items/spells/radiant_chain.webp`
- Prompt source: fallback

```
Concept "Лучистая цепь", a magic spell icon for light magic, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Дух-хранитель (`spirit_guardian`)

- Tier/type: 5, spell
- Current: `systems/iron-hills-system/icons/items/spells/summon_skeleton.webp`
- Target: `icons/items/spells/spirit_guardian.webp`
- Prompt source: fallback

```
Concept "Дух-хранитель", a magic spell icon for summon magic, tempered steel, polished fittings, subtle guild-quality decoration, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Взрыв Пустоты (`void_burst`)

- Tier/type: 5, spell
- Current: `systems/iron-hills-system/icons/items/spells/void_burst.webp`
- Target: `icons/items/spells/void_burst.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Взрыв Пустоты", spell icon for shadow magic, deep violet-black void energy, smoke wisps, cracked darkness, circular area blast glyph, ring boundary and impact center, condition cue: exposed, visually embedded as small runic accent, rank 5, masterwork guild finish, subtle runes, clean alchemical glass and fine leather, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Шаг сквозь угли (`ashen_step`)

- Tier/type: 6, spell
- Current: `systems/iron-hills-system/icons/items/spells/fire_bolt.webp`
- Target: `icons/items/spells/ashen_step.webp`
- Prompt source: fallback

```
Concept "Шаг сквозь угли", a magic spell icon for fire magic, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Вьюга (`blizzard`)

- Tier/type: 6, spell
- Current: `systems/iron-hills-system/icons/items/spells/blizzard.webp`
- Target: `icons/items/spells/blizzard.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Вьюга", spell icon for ice magic, cyan frost crystals, cold mist, sharp translucent shards, circular area blast glyph, ring boundary and impact center, condition cue: slowed, visually embedded as small runic accent, rank 6, elite expedition quality, mithril or silver accents, faint magical residue, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Божественный Гнев (`divine_wrath`)

- Tier/type: 6, spell
- Current: `systems/iron-hills-system/icons/items/spells/divine_wrath.webp`
- Target: `icons/items/spells/divine_wrath.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Божественный Гнев", spell icon for light magic, white-gold sacred radiance, clean rays, pearl glow, long narrow ray or lance of magic crossing the icon diagonally, condition cue: stunned, visually embedded as small runic accent, rank 6, elite expedition quality, mithril or silver accents, faint magical residue, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Копье разума (`mind_lance`)

- Tier/type: 6, spell
- Current: `systems/iron-hills-system/icons/items/spells/haste_spell.webp`
- Target: `icons/items/spells/mind_lance.webp`
- Prompt source: fallback

```
Concept "Копье разума", a magic spell icon for mind magic, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Гончие разлома (`rift_hounds`)

- Tier/type: 6, spell
- Current: `systems/iron-hills-system/icons/items/spells/summon_skeleton.webp`
- Target: `icons/items/spells/rift_hounds.webp`
- Prompt source: fallback

```
Concept "Гончие разлома", a magic spell icon for summon magic, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Каменная кожа (`stone_skin`)

- Tier/type: 6, spell
- Current: `systems/iron-hills-system/icons/items/spells/stone_throw.webp`
- Target: `icons/items/spells/stone_skin.webp`
- Prompt source: fallback

```
Concept "Каменная кожа", a magic spell icon for earth magic, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Теневые цепи (`umbral_chains`)

- Tier/type: 6, spell
- Current: `systems/iron-hills-system/icons/items/spells/shadow_bolt.webp`
- Target: `icons/items/spells/umbral_chains.webp`
- Prompt source: fallback

```
Concept "Теневые цепи", a magic spell icon for shadow magic, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Вольтовая сеть (`voltaic_net`)

- Tier/type: 6, spell
- Current: `systems/iron-hills-system/icons/items/spells/lightning_bolt_spell.webp`
- Target: `icons/items/spells/voltaic_net.webp`
- Prompt source: fallback

```
Concept "Вольтовая сеть", a magic spell icon for lightning magic, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Волна изгнания (`banishing_wave`)

- Tier/type: 7, spell
- Current: `systems/iron-hills-system/icons/items/spells/summon_skeleton.webp`
- Target: `icons/items/spells/banishing_wave.webp`
- Prompt source: fallback

```
Concept "Волна изгнания", a magic spell icon for summon magic, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Землетрясение (`earthquake`)

- Tier/type: 7, spell
- Current: `systems/iron-hills-system/icons/items/spells/earthquake.webp`
- Target: `icons/items/spells/earthquake.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Землетрясение", spell icon for earth magic, stone, ochre dust, cracked ground glyph, heavy mineral fragments, circular area blast glyph, ring boundary and impact center, condition cue: prone, visually embedded as small runic accent, rank 7, rare occult workshop craft, dark crystal traces, controlled eerie glow, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Клетка памяти (`memory_cage`)

- Tier/type: 7, spell
- Current: `systems/iron-hills-system/icons/items/spells/haste_spell.webp`
- Target: `icons/items/spells/memory_cage.webp`
- Prompt source: fallback

```
Concept "Клетка памяти", a magic spell icon for mind magic, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Кольцо убежища (`sanctuary_ring`)

- Tier/type: 7, spell
- Current: `systems/iron-hills-system/icons/items/spells/holy_smite.webp`
- Target: `icons/items/spells/sanctuary_ring.webp`
- Prompt source: fallback

```
Concept "Кольцо убежища", a magic spell icon for light magic, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Затмение души (`soul_eclipse`)

- Tier/type: 7, spell
- Current: `systems/iron-hills-system/icons/items/spells/shadow_bolt.webp`
- Target: `icons/items/spells/soul_eclipse.webp`
- Prompt source: fallback

```
Concept "Затмение души", a magic spell icon for shadow magic, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Громовой шаг (`thunderstep`)

- Tier/type: 7, spell
- Current: `systems/iron-hills-system/icons/items/spells/lightning_bolt_spell.webp`
- Target: `icons/items/spells/thunderstep.webp`
- Prompt source: fallback

```
Concept "Громовой шаг", a magic spell icon for lightning magic, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Вулканический выброс (`volcanic_burst`)

- Tier/type: 7, spell
- Current: `systems/iron-hills-system/icons/items/spells/fire_bolt.webp`
- Target: `icons/items/spells/volcanic_burst.webp`
- Prompt source: fallback

```
Concept "Вулканический выброс", a magic spell icon for fire magic, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Пасть зимы (`winter_maw`)

- Tier/type: 7, spell
- Current: `systems/iron-hills-system/icons/items/spells/ice_shard.webp`
- Target: `icons/items/spells/winter_maw.webp`
- Prompt source: fallback

```
Concept "Пасть зимы", a magic spell icon for ice magic, mithril, dark iron, rare crystal accents and restrained magical glow, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Кристальная тюрьма (`crystal_prison`)

- Tier/type: 8, spell
- Current: `systems/iron-hills-system/icons/items/spells/ice_shard.webp`
- Target: `icons/items/spells/crystal_prison.webp`
- Prompt source: fallback

```
Concept "Кристальная тюрьма", a magic spell icon for ice magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Шепот смерти (`death_whisper`)

- Tier/type: 8, spell
- Current: `systems/iron-hills-system/icons/items/spells/shadow_bolt.webp`
- Target: `icons/items/spells/death_whisper.webp`
- Prompt source: fallback

```
Concept "Шепот смерти", a magic spell icon for shadow magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Замок врат (`gate_lock`)

- Tier/type: 8, spell
- Current: `systems/iron-hills-system/icons/items/spells/summon_skeleton.webp`
- Target: `icons/items/spells/gate_lock.webp`
- Prompt source: fallback

```
Concept "Замок врат", a magic spell icon for summon magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Метеор (`meteor`)

- Tier/type: 8, spell
- Current: `systems/iron-hills-system/icons/items/spells/meteor.webp`
- Target: `icons/items/spells/meteor.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Метеор", spell icon for fire magic, orange-red flame, ember sparks, blackened rim, molten core, circular area blast glyph, ring boundary and impact center, condition cue: burning, visually embedded as small runic accent, rank 8, artifact-grade craft, starmetal glints, celestial or void-touched materials, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Кукольная паника (`puppet_panic`)

- Tier/type: 8, spell
- Current: `systems/iron-hills-system/icons/items/spells/haste_spell.webp`
- Target: `icons/items/spells/puppet_panic.webp`
- Prompt source: fallback

```
Concept "Кукольная паника", a magic spell icon for mind magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Копье небес (`sky_spear`)

- Tier/type: 8, spell
- Current: `systems/iron-hills-system/icons/items/spells/lightning_bolt_spell.webp`
- Target: `icons/items/spells/sky_spear.webp`
- Prompt source: fallback

```
Concept "Копье небес", a magic spell icon for lightning magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Солнечное копье (`sunlance`)

- Tier/type: 8, spell
- Current: `systems/iron-hills-system/icons/items/spells/holy_smite.webp`
- Target: `icons/items/spells/sunlance.webp`
- Prompt source: fallback

```
Concept "Солнечное копье", a magic spell icon for light magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Тектоническое копье (`tectonic_spear`)

- Tier/type: 8, spell
- Current: `systems/iron-hills-system/icons/items/spells/stone_throw.webp`
- Target: `icons/items/spells/tectonic_spear.webp`
- Prompt source: fallback

```
Concept "Тектоническое копье", a magic spell icon for earth magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Круг Астральных Оков (`astral_binding_circle`)

- Tier/type: 9, spell
- Current: `systems/iron-hills-system/icons/items/spells/astral_binding_circle.webp`
- Target: `icons/items/spells/astral_binding_circle.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Круг Астральных Оков", spell icon for summon magic, teal necromantic summoning circle, bone-white motes, binding runes, circular area blast glyph, ring boundary and impact center, condition cue: grappled, visually embedded as small runic accent, rank 9, legendary relic quality, ornate sacred geometry, strong but contained aura, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Эгида мученика (`martyr_aegis`)

- Tier/type: 9, spell
- Current: `systems/iron-hills-system/icons/items/spells/holy_smite.webp`
- Target: `icons/items/spells/martyr_aegis.webp`
- Prompt source: fallback

```
Concept "Эгида мученика", a magic spell icon for light magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Обвал горы (`mountain_collapse`)

- Tier/type: 9, spell
- Current: `systems/iron-hills-system/icons/items/spells/stone_throw.webp`
- Target: `icons/items/spells/mountain_collapse.webp`
- Prompt source: fallback

```
Concept "Обвал горы", a magic spell icon for earth magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Зона ночепада (`nightfall_zone`)

- Tier/type: 9, spell
- Current: `systems/iron-hills-system/icons/items/spells/shadow_bolt.webp`
- Target: `icons/items/spells/nightfall_zone.webp`
- Prompt source: fallback

```
Concept "Зона ночепада", a magic spell icon for shadow magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Клеймо феникса (`phoenix_brand`)

- Tier/type: 9, spell
- Current: `systems/iron-hills-system/icons/items/spells/fire_bolt.webp`
- Target: `icons/items/spells/phoenix_brand.webp`
- Prompt source: fallback

```
Concept "Клеймо феникса", a magic spell icon for fire magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Корона бури (`storm_crown`)

- Tier/type: 9, spell
- Current: `systems/iron-hills-system/icons/items/spells/lightning_bolt_spell.webp`
- Target: `icons/items/spells/storm_crown.webp`
- Prompt source: fallback

```
Concept "Корона бури", a magic spell icon for lightning magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Буря мыслей (`thought_storm`)

- Tier/type: 9, spell
- Current: `systems/iron-hills-system/icons/items/spells/haste_spell.webp`
- Target: `icons/items/spells/thought_storm.webp`
- Prompt source: fallback

```
Concept "Буря мыслей", a magic spell icon for mind magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Поле белой мглы (`whiteout_field`)

- Tier/type: 9, spell
- Current: `systems/iron-hills-system/icons/items/spells/ice_shard.webp`
- Target: `icons/items/spells/whiteout_field.webp`
- Prompt source: fallback

```
Concept "Поле белой мглы", a magic spell icon for ice magic, orichalcum, starmetal, ornate heroic craftsmanship and luminous accents, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Абсолютный приказ (`absolute_command`)

- Tier/type: 10, spell
- Current: `systems/iron-hills-system/icons/items/spells/haste_spell.webp`
- Target: `icons/items/spells/absolute_command.webp`
- Prompt source: fallback

```
Concept "Абсолютный приказ", a magic spell icon for mind magic, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Абсолютный ноль (`absolute_zero`)

- Tier/type: 10, spell
- Current: `systems/iron-hills-system/icons/items/spells/ice_shard.webp`
- Target: `icons/items/spells/absolute_zero.webp`
- Prompt source: fallback

```
Concept "Абсолютный ноль", a magic spell icon for ice magic, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Договор аватара (`avatar_pact`)

- Tier/type: 10, spell
- Current: `systems/iron-hills-system/icons/items/spells/summon_skeleton.webp`
- Target: `icons/items/spells/avatar_pact.webp`
- Prompt source: fallback

```
Concept "Договор аватара", a magic spell icon for summon magic, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Небесное Падение (`heavenfall`)

- Tier/type: 10, spell
- Current: `systems/iron-hills-system/icons/items/spells/heavenfall.webp`
- Target: `icons/items/spells/heavenfall.webp`
- Prompt source: docs/content/spells-prompts.json

```
Concept "Небесное Падение", spell icon for light magic, white-gold sacred radiance, clean rays, pearl glow, circular area blast glyph, ring boundary and impact center, condition cue: stunned, visually embedded as small runic accent, rank 10, mythic relic presence, impossible materials, reality ripple kept subtle, 1024x1024, single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size --ar 1:1
```

### Катаклизм солнечной кузни (`sunforge_cataclysm`)

- Tier/type: 10, spell
- Current: `systems/iron-hills-system/icons/items/spells/fire_bolt.webp`
- Target: `icons/items/spells/sunforge_cataclysm.webp`
- Prompt source: fallback

```
Concept "Катаклизм солнечной кузни", a magic spell icon for fire magic, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Суд Пустоты (`void_judgement`)

- Tier/type: 10, spell
- Current: `systems/iron-hills-system/icons/items/spells/shadow_bolt.webp`
- Target: `icons/items/spells/void_judgement.webp`
- Prompt source: fallback

```
Concept "Суд Пустоты", a magic spell icon for shadow magic, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Мировая молния (`worldbolt`)

- Tier/type: 10, spell
- Current: `systems/iron-hills-system/icons/items/spells/lightning_bolt_spell.webp`
- Target: `icons/items/spells/worldbolt.webp`
- Prompt source: fallback

```
Concept "Мировая молния", a magic spell icon for lightning magic, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```

### Приговор Мирового Корня (`worldroot_verdict`)

- Tier/type: 10, spell
- Current: `systems/iron-hills-system/icons/items/spells/stone_throw.webp`
- Target: `icons/items/spells/worldroot_verdict.webp`
- Prompt source: fallback

```
Concept "Приговор Мирового Корня", a magic spell icon for earth magic, mythic godsteel, adamant core, reality-bending magical highlights, centered square inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 1024x1024 --ar 1:1
```


## throwables

### Глиняный осколочный горшок (`clay_shrapnel_pot`)

- Tier/type: 1, throwable
- Current: `systems/iron-hills-system/icons/items/throwables/clay_shrapnel_pot.webp`
- Target: `icons/items/throwables/clay_shrapnel_pot.webp`
- Prompt source: docs/content/throwables-prompts.json

```
Concept "Глиняный осколочный горшок", sealed clay shrapnel pot with twine fuse, chipped pottery, visible metal shards embedded, impact shards and kinetic fragmentation, circle area cue, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Связка метательных ножей (`throwing_knife_bundle`)

- Tier/type: 1, throwable
- Current: `systems/iron-hills-system/icons/items/throwables/throwing_knife_bundle.webp`
- Target: `icons/items/throwables/throwing_knife_bundle.webp`
- Prompt source: docs/content/throwables-prompts.json

```
Concept "Связка метательных ножей", bundle of three throwing knives bound by dark leather cord, balanced steel blades, fan arrangement, impact shards and kinetic fragmentation, single-target cue, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Фляга горючего масла (`fire_oil_flask`)

- Tier/type: 2, throwable
- Current: `systems/iron-hills-system/icons/items/throwables/fire_oil_flask.webp`
- Target: `icons/items/throwables/fire_oil_flask.webp`
- Prompt source: docs/content/throwables-prompts.json

```
Concept "Фляга горючего масла", flask of burning alchemical oil with waxed rag fuse, orange liquid, soot-black glass, contained flame and alchemical heat, circle area cue, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Стеклянная ядовитая склянка (`venom_glass_vial`)

- Tier/type: 2, throwable
- Current: `systems/iron-hills-system/icons/items/throwables/venom_glass_vial.webp`
- Target: `icons/items/throwables/venom_glass_vial.webp`
- Prompt source: docs/content/throwables-prompts.json

```
Concept "Стеклянная ядовитая склянка", thin green venom vial in protective wicker cage, skull charm, toxic glow restrained, toxic vapor and venomous green staining, single-target cue, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Громовой камень (`thunderstone`)

- Tier/type: 3, throwable
- Current: `systems/iron-hills-system/icons/items/throwables/thunderstone.webp`
- Target: `icons/items/throwables/thunderstone.webp`
- Prompt source: docs/content/throwables-prompts.json

```
Concept "Громовой камень", charged thunderstone wrapped in copper wire, blue-white arcs crawling over rough crystal, crackling charge and copper conductor detail, circle area cue, field-proven adventurer gear, reinforced details, readable silhouette, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Сфера освящённой воды (`blessed_water_globe`)

- Tier/type: 4, throwable
- Current: `systems/iron-hills-system/icons/items/throwables/blessed_water_globe.webp`
- Target: `icons/items/throwables/blessed_water_globe.webp`
- Prompt source: docs/content/throwables-prompts.json

```
Concept "Сфера освящённой воды", clear blessed water globe in brass reliquary cage, pale gold light, sacred wax seal, sacred flare, clean radiance, friendly-fire discipline when applicable, single-target cue, professional mercenary quality, polished steel fittings, careful packing, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Склянка морозного разрыва (`frostburst_flask`)

- Tier/type: 4, throwable
- Current: `systems/iron-hills-system/icons/items/throwables/frostburst_flask.webp`
- Target: `icons/items/throwables/frostburst_flask.webp`
- Prompt source: docs/content/throwables-prompts.json

```
Concept "Склянка морозного разрыва", frostburst glass flask, icy blue liquid, hoarfrost crust, sealed with silver cap, cold burst and frost crystal rim, cone area cue, professional mercenary quality, polished steel fittings, careful packing, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Драконья огненная бомба (`dragonfire_bomb`)

- Tier/type: 6, throwable
- Current: `systems/iron-hills-system/icons/items/throwables/dragonfire_bomb.webp`
- Target: `icons/items/throwables/dragonfire_bomb.webp`
- Prompt source: docs/content/throwables-prompts.json

```
Concept "Драконья огненная бомба", flask of burning alchemical oil with waxed rag fuse, orange liquid, soot-black glass, contained flame and alchemical heat, circle area cue, elite expedition quality, mithril or silver accents, faint magical residue, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Граната осколков Пустоты (`void_splinter_grenade`)

- Tier/type: 8, throwable
- Current: `systems/iron-hills-system/icons/items/throwables/void_splinter_grenade.webp`
- Target: `icons/items/throwables/void_splinter_grenade.webp`
- Prompt source: docs/content/throwables-prompts.json

```
Concept "Граната осколков Пустоты", void splinter grenade, black glass orb with purple cracks, shard cage, drifting dark motes, void splinters, cursed darkness, unstable occult containment, circle area cue, artifact-grade craft, starmetal glints, celestial or void-touched materials, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Фиал солнечной вспышки (`sunburst_phial`)

- Tier/type: 9, throwable
- Current: `systems/iron-hills-system/icons/items/throwables/sunburst_phial.webp`
- Target: `icons/items/throwables/sunburst_phial.webp`
- Prompt source: docs/content/throwables-prompts.json

```
Concept "Фиал солнечной вспышки", clear blessed water globe in brass reliquary cage, pale gold light, sacred wax seal, sacred flare, clean radiance, friendly-fire discipline when applicable, circle area cue, legendary relic quality, ornate sacred geometry, strong but contained aura, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Звёздная бомба Генезиса (`genesis_star_bomb`)

- Tier/type: 10, throwable
- Current: `systems/iron-hills-system/icons/items/throwables/genesis_star_bomb.webp`
- Target: `icons/items/throwables/genesis_star_bomb.webp`
- Prompt source: docs/content/throwables-prompts.json

```
Concept "Звёздная бомба Генезиса", mythic star bomb, miniature astrolabe casing around luminous star core, impossible prismatic metal, reality-breaking star impact, rare artifact danger, circle area cue, mythic relic presence, impossible materials, reality ripple kept subtle, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```


## tools

### Котелок (`cooking_pot`)

- Tier/type: 1, tool
- Current: `systems/iron-hills-system/icons/items/tools/cooking_pot.webp`
- Target: `icons/items/tools/cooking_pot.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Котелок", emphasis handheld toolkit readable silhouette compact bench fold hinges, iron grate kettle pans stacked crates skewers steam, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Кремнёвые инструменты (`flint_tools`)

- Tier/type: 1, tool
- Current: `systems/iron-hills-system/icons/items/tools/flint_tools.webp`
- Target: `icons/items/tools/flint_tools.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Кремнёвые инструменты", emphasis handheld toolkit readable silhouette compact bench fold hinges, vise clamps rulers drawers pegboard folded bench legs sawdust, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Набор разделки туши (`hunter_butcher_kit`)

- Tier/type: 1, tool
- Current: `systems/iron-hills-system/icons/items/tools/hunter_butcher_kit.webp`
- Target: `icons/items/tools/hunter_butcher_kit.webp`
- Prompt source: fallback

```
Concept "Набор разделки туши", a single fantasy crafting or survival tool, rough low-tier materials, worn edges, practical peasant craft, vertical item orientation, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 768x1536 --ar 1:2
```

### Железный молот (`iron_hammer`)

- Tier/type: 1, tool
- Current: `systems/iron-hills-system/icons/items/tools/iron_hammer.webp`
- Target: `icons/items/tools/iron_hammer.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Железный молот", emphasis handheld toolkit readable silhouette compact bench fold hinges, forge tongs hammer anvil sparks soot, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Ступка и пестик (`mortar_pestle`)

- Tier/type: 1, tool
- Current: `systems/iron-hills-system/icons/items/tools/mortar_pestle.webp`
- Target: `icons/items/tools/mortar_pestle.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Ступка и пестик", emphasis handheld toolkit readable silhouette compact bench fold hinges, glass retorts clamps burner coils bottles racks, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Железная кирка (`pickaxe_iron`)

- Tier/type: 1, tool
- Current: `systems/iron-hills-system/icons/items/tools/pickaxe_iron.webp`
- Target: `icons/items/tools/pickaxe_iron.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Железная кирка", emphasis handheld toolkit readable silhouette compact bench fold hinges, pickaxe drill brace crank cables reinforcement plate, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Алхимический набор (`alch_kit`)

- Tier/type: 2, tool
- Current: `systems/iron-hills-system/icons/items/tools/alch_kit.webp`
- Target: `icons/items/tools/alch_kit.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Алхимический набор", emphasis handheld toolkit readable silhouette compact bench fold hinges, glass retorts clamps burner coils bottles racks, reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Скрутка полевого мясника (`field_butcher_roll`)

- Tier/type: 2, tool
- Current: `systems/iron-hills-system/icons/items/tools/field_butcher_roll.webp`
- Target: `icons/items/tools/field_butcher_roll.webp`
- Prompt source: fallback

```
Concept "Скрутка полевого мясника", a single fantasy crafting or survival tool, iron, bronze, seasoned leather and utilitarian workshop finish, vertical item orientation, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 768x1536 --ar 1:2
```

### Инструменты мастера (`master_tools`)

- Tier/type: 2, tool
- Current: `systems/iron-hills-system/icons/items/tools/master_tools.webp`
- Target: `icons/items/tools/master_tools.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Инструменты мастера", emphasis handheld toolkit readable silhouette compact bench fold hinges, vise clamps rulers drawers pegboard folded bench legs sawdust, reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Стальная кирка (`pickaxe_steel`)

- Tier/type: 2, tool
- Current: `systems/iron-hills-system/icons/items/tools/pickaxe_steel.webp`
- Target: `icons/items/tools/pickaxe_steel.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Стальная кирка", emphasis handheld toolkit readable silhouette compact bench fold hinges, pickaxe drill brace crank cables reinforcement plate, reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Стальной молот (`steel_hammer`)

- Tier/type: 2, tool
- Current: `systems/iron-hills-system/icons/items/tools/steel_hammer.webp`
- Target: `icons/items/tools/steel_hammer.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Стальной молот", emphasis handheld toolkit readable silhouette compact bench fold hinges, forge tongs hammer anvil sparks soot, reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Бронзовый жаровенный набор (`bronze_brazier_set`)

- Tier/type: 3, tool
- Current: `systems/iron-hills-system/icons/items/tools/bronze_brazier_set.webp`
- Target: `icons/items/tools/bronze_brazier_set.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Бронзовый жаровенный набор", emphasis handheld toolkit readable silhouette compact bench fold hinges, iron grate kettle pans stacked crates skewers steam, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Жаровня на треноге и котлы для полевых отрядов — база перед сборкой большой кухни на салазках.. --ar 1:1
```

### Гномий молот (`dwarven_hammer`)

- Tier/type: 3, tool
- Current: `systems/iron-hills-system/icons/items/tools/dwarven_hammer.webp`
- Target: `icons/items/tools/dwarven_hammer.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Гномий молот", emphasis handheld toolkit readable silhouette compact bench fold hinges, forge tongs hammer anvil sparks soot, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Пара складных козёл (`fold_sawhorse_pair`)

- Tier/type: 3, tool
- Current: `systems/iron-hills-system/icons/items/tools/fold_sawhorse_pair.webp`
- Target: `icons/items/tools/fold_sawhorse_pair.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Пара складных козёл", emphasis handheld toolkit readable silhouette compact bench fold hinges, vise clamps rulers drawers pegboard folded bench legs sawdust, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Для распила и сборки заготовок в полевых условиях.. --ar 1:1
```

### Большая алхим. лаб. (`grand_alch_kit`)

- Tier/type: 3, tool
- Current: `systems/iron-hills-system/icons/items/tools/grand_alch_kit.webp`
- Target: `icons/items/tools/grand_alch_kit.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Большая алхим. лаб.", emphasis handheld toolkit readable silhouette compact bench fold hinges, glass retorts clamps burner coils bottles racks, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. --ar 1:1
```

### Дорожная наковальня в ящике (`travel_anvil_kit`)

- Tier/type: 3, tool
- Current: `systems/iron-hills-system/icons/items/tools/travel_anvil_kit.webp`
- Target: `icons/items/tools/travel_anvil_kit.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Дорожная наковальня в ящике", emphasis bulky wagon planks reinforced hinges straps draft-animal towing cues, forge tongs hammer anvil sparks soot, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Складная наковальня и малый горн в деревянном коробе. Тянет упряжка или два крепких грузчика.. --ar 1:1
```

### Шахтёрский бурильный станок (`deep_drill_brace`)

- Tier/type: 4, tool
- Current: `systems/iron-hills-system/icons/items/tools/deep_drill_brace.webp`
- Target: `icons/items/tools/deep_drill_brace.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Шахтёрский бурильный станок", emphasis bulky wagon planks reinforced hinges straps draft-animal towing cues, pickaxe drill brace crank cables reinforcement plate, merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Ручная дрель на станине для узких штолен.. --ar 1:1
```

### Полевая кухня на салазках (`field_kitchen_cart`)

- Tier/type: 4, tool
- Current: `systems/iron-hills-system/icons/items/tools/field_kitchen_cart.webp`
- Target: `icons/items/tools/field_kitchen_cart.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Полевая кухня на салазках", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, iron grate kettle pans stacked crates skewers steam, merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Плита, жаровня и ящик для продуктов. Нужна лошадь или несколько грузоносцев.. --ar 1:1
```

### Складной алхимический стол (`folding_alchemy_bench`)

- Tier/type: 4, tool
- Current: `systems/iron-hills-system/icons/items/tools/folding_alchemy_bench.webp`
- Target: `icons/items/tools/folding_alchemy_bench.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Складной алхимический стол", emphasis bulky wagon planks reinforced hinges straps draft-animal towing cues, glass retorts clamps burner coils bottles racks, merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Стойки, зажимы и подставки под колбы складываются в один ящик.. --ar 1:1
```

### Переносная кузница (`portable_smith_kit`)

- Tier/type: 4, tool
- Current: `systems/iron-hills-system/icons/items/tools/portable_smith_kit.webp`
- Target: `icons/items/tools/portable_smith_kit.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Переносная кузница", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Горн, малая наковальня и салазки. Выставляется за час; перевозится на телеге или двух быках.. --ar 1:1
```

### Стол ремесленника на колёсах (`master_artisans_cart`)

- Tier/type: 5, tool
- Current: `systems/iron-hills-system/icons/items/tools/master_artisans_cart.webp`
- Target: `icons/items/tools/master_artisans_cart.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Стол ремесленника на колёсах", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, vise clamps rulers drawers pegboard folded bench legs sawdust, noble artisan embossed fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Ящики с оснасткой для столярки, кожи и мелкой ковки в одном фургончике.. --ar 1:1
```

### Паровая перегонная установка (`steam_evaporator_kit`)

- Tier/type: 6, tool
- Current: `systems/iron-hills-system/icons/items/tools/steam_evaporator_kit.webp`
- Target: `icons/items/tools/steam_evaporator_kit.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Паровая перегонная установка", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, glass retorts clamps burner coils bottles racks, elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Медные змеевики и котёл; тяжёл, зато чистые фракции.. --ar 1:1
```

### Комплект туннельных лесов (`tunnel_jack_system`)

- Tier/type: 6, tool
- Current: `systems/iron-hills-system/icons/items/tools/tunnel_jack_system.webp`
- Target: `icons/items/tools/tunnel_jack_system.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Комплект туннельных лесов", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, pickaxe drill brace crank cables reinforcement plate, elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Распорки и лебёдка для укрепления забоя.. --ar 1:1
```

### Кузница на колёсах (`wagon_forge`)

- Tier/type: 6, tool
- Current: `systems/iron-hills-system/icons/items/tools/wagon_forge.webp`
- Target: `icons/items/tools/wagon_forge.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Кузница на колёсах", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Полноценный горн и средняя наковальня на двухосяном тележном ходу. Обычно тянет пара мулов или один упряжный зверь.. --ar 1:1
```

### Караванная алхимлаборатория (`alchemical_caravan_lab`)

- Tier/type: 7, tool
- Current: `systems/iron-hills-system/icons/items/tools/alchemical_caravan_lab.webp`
- Target: `icons/items/tools/alchemical_caravan_lab.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Караванная алхимлаборатория", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, glass retorts clamps burner coils bottles racks, rare siege caravan engineered spectacle, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Два стола, витражи с реагентами и фиксация колб — груз на фургон.. --ar 1:1
```

### Осадная переносная кузница (`siege_anvil_cart`)

- Tier/type: 7, tool
- Current: `systems/iron-hills-system/icons/items/tools/siege_anvil_cart.webp`
- Target: `icons/items/tools/siege_anvil_cart.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Осадная переносная кузница", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, rare siege caravan engineered spectacle, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Массивная наковальня и усиленный горн на четырёх колёсах. Тянет упряж четырёх волов или один крупный гуманоид.. --ar 1:1
```

### Руническая складная горн-тень (`runic_fold_forge`)

- Tier/type: 8, tool
- Current: `systems/iron-hills-system/icons/items/tools/runic_fold_forge.webp`
- Target: `icons/items/tools/runic_fold_forge.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Руническая складная горн-тень", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, starmetal accents artifact hints, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Магически облегчённая рама: вес меньше обычного, но всё ещё не для рюкзака одного человека.. --ar 1:1
```

### Проявитель звёздной кузницы (`starforge_manifest`)

- Tier/type: 9, tool
- Current: `systems/iron-hills-system/icons/items/tools/starforge_manifest.webp`
- Target: `icons/items/tools/starforge_manifest.webp`
- Prompt source: docs/content/gear-prompts.json

```
Concept "Проявитель звёздной кузницы", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, legendary planar shimmer restrained, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration. Кристаллы-якоря разворачивают временный горн из сгустка тепла и света.. --ar 1:1
```

### Семя мастерской Мирового Корня (`worldroot_workshop_seed`)

- Tier/type: 10, tool
- Current: `systems/iron-hills-system/icons/items/tools/worldroot_workshop_seed.webp`
- Target: `icons/items/tools/worldroot_workshop_seed.webp`
- Prompt source: fallback

```
Concept "Семя мастерской Мирового Корня", a single fantasy crafting or survival tool, mythic godsteel, adamant core, reality-bending magical highlights, vertical item orientation, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, 768x1536 --ar 1:2
```


## weapons

### Медный топор (`copper_axe`)

- Tier/type: 1, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/copper_axe.webp`
- Target: `icons/items/weapons/copper_axe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Медный топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, dim warm campfire light --ar 1:2
```

### Медный нож (`copper_knife`)

- Tier/type: 1, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/copper_knife.webp`
- Target: `icons/items/weapons/copper_knife.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Медный нож", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, dim warm campfire light --ar 1:2
```

### Медная булава (`copper_mace`)

- Tier/type: 1, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/copper_mace.webp`
- Target: `icons/items/weapons/copper_mace.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Медная булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, dim warm campfire light --ar 1:2
```

### Медное копьё (`copper_spear`)

- Tier/type: 1, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/copper_spear.webp`
- Target: `icons/items/weapons/copper_spear.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Медное копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, dim warm campfire light --ar 1:4
```

### Медный меч (`copper_sword`)

- Tier/type: 1, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/copper_sword.webp`
- Target: `icons/items/weapons/copper_sword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Медный меч", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, dim warm campfire light --ar 1:3
```

### Ручной арбалет (`hand_crossbow`)

- Tier/type: 1, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/hand_crossbow.webp`
- Target: `icons/items/weapons/hand_crossbow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Ручной арбалет", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, dim warm campfire light --ar 1:2
```

### Короткий лук (`short_bow`)

- Tier/type: 1, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/short_bow.webp`
- Target: `icons/items/weapons/short_bow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Короткий лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, dim warm campfire light --ar 1:3
```

### Метательные камни (`throwing_stones`)

- Tier/type: 1, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/throwing_stones.webp`
- Target: `icons/items/weapons/throwing_stones.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Метательные камни", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, dim warm campfire light --ar 1:1
```

### Деревянный посох (`wooden_staff`)

- Tier/type: 1, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/wooden_staff.webp`
- Target: `icons/items/weapons/wooden_staff.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Деревянный посох", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, dim warm campfire light --ar 1:4
```

### Бронзовый топор (`bronze_axe`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/bronze_axe.webp`
- Target: `icons/items/weapons/bronze_axe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Бронзовый топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, neutral daylight --ar 1:2
```

### Бронзовый кистень (`bronze_flail`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/bronze_flail.webp`
- Target: `icons/items/weapons/bronze_flail.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Бронзовый кистень", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, neutral daylight --ar 1:2
```

### Бронзовая секира (`bronze_greataxe`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/bronze_greataxe.webp`
- Target: `icons/items/weapons/bronze_greataxe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Бронзовая секира", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, neutral daylight --ar 1:3
```

### Бронзовый двуруч (`bronze_greatsword`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/bronze_greatsword.webp`
- Target: `icons/items/weapons/bronze_greatsword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Бронзовый двуруч", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, neutral daylight --ar 1:4
```

### Бронзовый нож (`bronze_knife`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/bronze_knife.webp`
- Target: `icons/items/weapons/bronze_knife.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Бронзовый нож", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, neutral daylight --ar 1:2
```

### Бронзовая булава (`bronze_mace`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/bronze_mace.webp`
- Target: `icons/items/weapons/bronze_mace.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Бронзовая булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, neutral daylight --ar 1:2
```

### Бронзовое копьё (`bronze_spear`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/bronze_spear.webp`
- Target: `icons/items/weapons/bronze_spear.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Бронзовое копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, neutral daylight --ar 1:4
```

### Бронзовый меч (`bronze_sword`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/bronze_sword.webp`
- Target: `icons/items/weapons/bronze_sword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Бронзовый меч", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, neutral daylight --ar 1:3
```

### Бронзовый молот (`bronze_warhammer`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/bronze_warhammer.webp`
- Target: `icons/items/weapons/bronze_warhammer.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Бронзовый молот", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, neutral daylight --ar 1:3
```

### Дротик (`javelin`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/javelin.webp`
- Target: `icons/items/weapons/javelin.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Дротик", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, neutral daylight --ar 1:3
```

### Длинный лук (`long_bow`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/long_bow.webp`
- Target: `icons/items/weapons/long_bow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Длинный лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, neutral daylight --ar 1:4
```

### Лёгкий арбалет (`lt_crossbow`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/lt_crossbow.webp`
- Target: `icons/items/weapons/lt_crossbow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Лёгкий арбалет", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, neutral daylight --ar 1:2
```

### Дубовый посох (`oak_staff`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/oak_staff.webp`
- Target: `icons/items/weapons/oak_staff.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Дубовый посох", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, neutral daylight --ar 1:4
```

### Метательные ножи (`throwing_knives`)

- Tier/type: 2, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/throwing_knives.webp`
- Target: `icons/items/weapons/throwing_knives.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Метательные ножи", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, neutral daylight --ar 1:1
```

### Охотничий лук (`hunters_bow`)

- Tier/type: 3, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/hunters_bow.webp`
- Target: `icons/items/weapons/hunters_bow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Охотничий лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, forge embers glow in background --ar 1:4
```

### Железный топор (`iron_axe`)

- Tier/type: 3, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/iron_axe.webp`
- Target: `icons/items/weapons/iron_axe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Железный топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, forge embers glow in background --ar 1:2
```

### Железный арбалет (`iron_crossbow`)

- Tier/type: 3, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/iron_crossbow.webp`
- Target: `icons/items/weapons/iron_crossbow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Железный арбалет", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, forge embers glow in background --ar 1:3
```

### Железный кистень (`iron_flail`)

- Tier/type: 3, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/iron_flail.webp`
- Target: `icons/items/weapons/iron_flail.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Железный кистень", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, forge embers glow in background --ar 1:2
```

### Железная секира (`iron_greataxe`)

- Tier/type: 3, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/iron_greataxe.webp`
- Target: `icons/items/weapons/iron_greataxe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Железная секира", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, forge embers glow in background --ar 1:3
```

### Железный двуруч (`iron_greatsword`)

- Tier/type: 3, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/iron_greatsword.webp`
- Target: `icons/items/weapons/iron_greatsword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Железный двуруч", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, forge embers glow in background --ar 1:4
```

### Железный дротик (`iron_javelin`)

- Tier/type: 3, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/iron_javelin.webp`
- Target: `icons/items/weapons/iron_javelin.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Железный дротик", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, forge embers glow in background --ar 1:3
```

### Железный нож (`iron_knife`)

- Tier/type: 3, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/iron_knife.webp`
- Target: `icons/items/weapons/iron_knife.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Железный нож", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, forge embers glow in background --ar 1:2
```

### Железная булава (`iron_mace`)

- Tier/type: 3, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/iron_mace.webp`
- Target: `icons/items/weapons/iron_mace.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Железная булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, forge embers glow in background --ar 1:2
```

### Железное копьё (`iron_spear`)

- Tier/type: 3, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/iron_spear.webp`
- Target: `icons/items/weapons/iron_spear.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Железное копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, forge embers glow in background --ar 1:4
```

### Железный посох (`iron_staff`)

- Tier/type: 3, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/iron_staff.webp`
- Target: `icons/items/weapons/iron_staff.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Железный посох", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, forge embers glow in background --ar 1:4
```

### Железный меч (`iron_sword`)

- Tier/type: 3, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/iron_sword.webp`
- Target: `icons/items/weapons/iron_sword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Железный меч", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, forge embers glow in background --ar 1:3
```

### Железный молот (`iron_warhammer`)

- Tier/type: 3, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/iron_warhammer.webp`
- Target: `icons/items/weapons/iron_warhammer.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Железный молот", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, forge embers glow in background --ar 1:3
```

### Составной лук (`composite_bow`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/composite_bow.webp`
- Target: `icons/items/weapons/composite_bow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Составной лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, clean white studio light --ar 1:4
```

### Алебарда (`halberd`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/halberd.webp`
- Target: `icons/items/weapons/halberd.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Алебарда", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, clean white studio light --ar 1:4
```

### Тяжёлый арбалет (`hv_crossbow`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/hv_crossbow.webp`
- Target: `icons/items/weapons/hv_crossbow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Тяжёлый арбалет", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, clean white studio light --ar 1:3
```

### Стальной топор (`steel_axe`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/steel_axe.webp`
- Target: `icons/items/weapons/steel_axe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Стальной топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, clean white studio light --ar 1:2
```

### Стальной кистень (`steel_flail`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/steel_flail.webp`
- Target: `icons/items/weapons/steel_flail.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Стальной кистень", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, clean white studio light --ar 1:2
```

### Стальной двуруч (`steel_greatsword`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/steel_greatsword.webp`
- Target: `icons/items/weapons/steel_greatsword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Стальной двуруч", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, clean white studio light --ar 1:4
```

### Стальной дротик (`steel_javelin`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/steel_javelin.webp`
- Target: `icons/items/weapons/steel_javelin.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Стальной дротик", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, clean white studio light --ar 1:3
```

### Стальной нож (`steel_knife`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/steel_knife.webp`
- Target: `icons/items/weapons/steel_knife.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Стальной нож", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, clean white studio light --ar 1:2
```

### Стальная булава (`steel_mace`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/steel_mace.webp`
- Target: `icons/items/weapons/steel_mace.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Стальная булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, clean white studio light --ar 1:2
```

### Стальное копьё (`steel_spear`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/steel_spear.webp`
- Target: `icons/items/weapons/steel_spear.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Стальное копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, clean white studio light --ar 1:4
```

### Стальной посох (`steel_staff`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/steel_staff.webp`
- Target: `icons/items/weapons/steel_staff.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Стальной посох", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, clean white studio light --ar 1:4
```

### Стальной меч (`steel_sword`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/steel_sword.webp`
- Target: `icons/items/weapons/steel_sword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Стальной меч", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, clean white studio light --ar 1:3
```

### Боевой топор (2р.) (`war_axe`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/war_axe.webp`
- Target: `icons/items/weapons/war_axe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Боевой топор (2р.)", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, clean white studio light --ar 1:3
```

### Боевой молот (`war_hammer`)

- Tier/type: 4, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/war_hammer.webp`
- Target: `icons/items/weapons/war_hammer.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Боевой молот", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, clean white studio light --ar 1:3
```

### Арбалест (`arbalest`)

- Tier/type: 5, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/arbalest.webp`
- Target: `icons/items/weapons/arbalest.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Арбалест", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cool blue rim light, runes faintly glowing --ar 1:3
```

### Закалённый топор (`hardened_axe`)

- Tier/type: 5, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/hardened_axe.webp`
- Target: `icons/items/weapons/hardened_axe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Закалённый топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cool blue rim light, runes faintly glowing --ar 1:2
```

### Закалённый кистень (`hardened_flail`)

- Tier/type: 5, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/hardened_flail.webp`
- Target: `icons/items/weapons/hardened_flail.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Закалённый кистень", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cool blue rim light, runes faintly glowing --ar 1:2
```

### Закалённый кинжал (`hardened_knife`)

- Tier/type: 5, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/hardened_knife.webp`
- Target: `icons/items/weapons/hardened_knife.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Закалённый кинжал", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cool blue rim light, runes faintly glowing --ar 1:2
```

### Закалённая булава (`hardened_mace`)

- Tier/type: 5, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/hardened_mace.webp`
- Target: `icons/items/weapons/hardened_mace.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Закалённая булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cool blue rim light, runes faintly glowing --ar 1:2
```

### Закалённое копьё (`hardened_spear`)

- Tier/type: 5, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/hardened_spear.webp`
- Target: `icons/items/weapons/hardened_spear.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Закалённое копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cool blue rim light, runes faintly glowing --ar 1:4
```

### Магический посох (`mage_staff`)

- Tier/type: 5, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/mage_staff.webp`
- Target: `icons/items/weapons/mage_staff.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Магический посох", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cool blue rim light, runes faintly glowing --ar 1:4
```

### Рекурсивный лук (`recurve_bow`)

- Tier/type: 5, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/recurve_bow.webp`
- Target: `icons/items/weapons/recurve_bow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Рекурсивный лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cool blue rim light, runes faintly glowing --ar 1:4
```

### Стальной чакрам (`steel_chakram`)

- Tier/type: 5, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/steel_chakram.webp`
- Target: `icons/items/weapons/steel_chakram.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Стальной чакрам", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, cool blue rim light, runes faintly glowing --ar 1:1
```

### Закалённая секира (`tempered_greataxe`)

- Tier/type: 5, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/tempered_greataxe.webp`
- Target: `icons/items/weapons/tempered_greataxe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Закалённая секира", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cool blue rim light, runes faintly glowing --ar 1:3
```

### Закалённый двуруч (`tempered_greatsword`)

- Tier/type: 5, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/tempered_greatsword.webp`
- Target: `icons/items/weapons/tempered_greatsword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Закалённый двуруч", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cool blue rim light, runes faintly glowing --ar 1:4
```

### Закалённый меч (`tempered_sword`)

- Tier/type: 5, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/tempered_sword.webp`
- Target: `icons/items/weapons/tempered_sword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Закалённый меч", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cool blue rim light, runes faintly glowing --ar 1:3
```

### Закалённый молот (`tempered_warhammer`)

- Tier/type: 5, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/tempered_warhammer.webp`
- Target: `icons/items/weapons/tempered_warhammer.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Закалённый молот", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cool blue rim light, runes faintly glowing --ar 1:3
```

### Посох архимага (`archmage_staff`)

- Tier/type: 6, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/archmage_staff.webp`
- Target: `icons/items/weapons/archmage_staff.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Посох архимага", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, soft silver glow, magical particles drifting upward --ar 1:4
```

### Митрильный топор (`mithril_axe`)

- Tier/type: 6, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/mithril_axe.webp`
- Target: `icons/items/weapons/mithril_axe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Митрильный топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, soft silver glow, magical particles drifting upward --ar 1:2
```

### Митрильный лук (`mithril_bow`)

- Tier/type: 6, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/mithril_bow.webp`
- Target: `icons/items/weapons/mithril_bow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Митрильный лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, soft silver glow, magical particles drifting upward --ar 1:4
```

### Митрильный чакрам (`mithril_chakram`)

- Tier/type: 6, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/mithril_chakram.webp`
- Target: `icons/items/weapons/mithril_chakram.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Митрильный чакрам", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, soft silver glow, magical particles drifting upward --ar 1:1
```

### Митрильный арбалет (`mithril_crossbow`)

- Tier/type: 6, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/mithril_crossbow.webp`
- Target: `icons/items/weapons/mithril_crossbow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Митрильный арбалет", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, soft silver glow, magical particles drifting upward --ar 1:3
```

### Митрильный кистень (`mithril_flail`)

- Tier/type: 6, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/mithril_flail.webp`
- Target: `icons/items/weapons/mithril_flail.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Митрильный кистень", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, soft silver glow, magical particles drifting upward --ar 1:2
```

### Митрильная секира (`mithril_greataxe`)

- Tier/type: 6, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/mithril_greataxe.webp`
- Target: `icons/items/weapons/mithril_greataxe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Митрильная секира", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, soft silver glow, magical particles drifting upward --ar 1:3
```

### Митрильный двуруч (`mithril_greatsword`)

- Tier/type: 6, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/mithril_greatsword.webp`
- Target: `icons/items/weapons/mithril_greatsword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Митрильный двуруч", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, soft silver glow, magical particles drifting upward --ar 1:4
```

### Митрильный нож (`mithril_knife`)

- Tier/type: 6, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/mithril_knife.webp`
- Target: `icons/items/weapons/mithril_knife.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Митрильный нож", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, soft silver glow, magical particles drifting upward --ar 1:2
```

### Митрильная булава (`mithril_mace`)

- Tier/type: 6, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/mithril_mace.webp`
- Target: `icons/items/weapons/mithril_mace.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Митрильная булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, soft silver glow, magical particles drifting upward --ar 1:2
```

### Митрильное копьё (`mithril_spear`)

- Tier/type: 6, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/mithril_spear.webp`
- Target: `icons/items/weapons/mithril_spear.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Митрильное копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, soft silver glow, magical particles drifting upward --ar 1:4
```

### Митрильный меч (`mithril_sword`)

- Tier/type: 6, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/mithril_sword.webp`
- Target: `icons/items/weapons/mithril_sword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Митрильный меч", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, soft silver glow, magical particles drifting upward --ar 1:3
```

### Митрильный молот (`mithril_warhammer`)

- Tier/type: 6, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/mithril_warhammer.webp`
- Target: `icons/items/weapons/mithril_warhammer.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Митрильный молот", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, soft silver glow, magical particles drifting upward --ar 1:3
```

### Тёмный топор (`dark_axe`)

- Tier/type: 7, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/dark_axe.webp`
- Target: `icons/items/weapons/dark_axe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Тёмный топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:2
```

### Тёмный клинок (`dark_blade`)

- Tier/type: 7, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/dark_blade.webp`
- Target: `icons/items/weapons/dark_blade.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Тёмный клинок", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:3
```

### Лук тёмного железа (`darkiron_bow`)

- Tier/type: 7, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/darkiron_bow.webp`
- Target: `icons/items/weapons/darkiron_bow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Лук тёмного железа", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:4
```

### Чакрам тёмного железа (`darkiron_chakram`)

- Tier/type: 7, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/darkiron_chakram.webp`
- Target: `icons/items/weapons/darkiron_chakram.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Чакрам тёмного железа", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, deep purple glow, wisps of smoke, ember-like sparks --ar 1:1
```

### Арбалет тёмного железа (`darkiron_crossbow`)

- Tier/type: 7, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/darkiron_crossbow.webp`
- Target: `icons/items/weapons/darkiron_crossbow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Арбалет тёмного железа", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:3
```

### Цеп тёмного железа (`darkiron_flail`)

- Tier/type: 7, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/darkiron_flail.webp`
- Target: `icons/items/weapons/darkiron_flail.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Цеп тёмного железа", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:2
```

### Секира тёмного железа (`darkiron_greataxe`)

- Tier/type: 7, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/darkiron_greataxe.webp`
- Target: `icons/items/weapons/darkiron_greataxe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Секира тёмного железа", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:3
```

### Двуруч тёмного железа (`darkiron_greatsword`)

- Tier/type: 7, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/darkiron_greatsword.webp`
- Target: `icons/items/weapons/darkiron_greatsword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Двуруч тёмного железа", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:4
```

### Кинжал тёмного железа (`darkiron_knife`)

- Tier/type: 7, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/darkiron_knife.webp`
- Target: `icons/items/weapons/darkiron_knife.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Кинжал тёмного железа", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:2
```

### Молот тёмного железа (`darkiron_mace`)

- Tier/type: 7, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/darkiron_mace.webp`
- Target: `icons/items/weapons/darkiron_mace.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Молот тёмного железа", a single fantasy mace, flanged head, short metal haft, leather grip, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:2
```

### Пика тёмного железа (`darkiron_pike`)

- Tier/type: 7, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/darkiron_pike.webp`
- Target: `icons/items/weapons/darkiron_pike.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Пика тёмного железа", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:4
```

### Посох тёмного железа (`darkiron_staff`)

- Tier/type: 7, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/darkiron_staff.webp`
- Target: `icons/items/weapons/darkiron_staff.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Посох тёмного железа", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:4
```

### Молот тёмного железа (`darkiron_warhammer`)

- Tier/type: 7, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/darkiron_warhammer.webp`
- Target: `icons/items/weapons/darkiron_warhammer.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Молот тёмного железа", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:3
```

### Звёздный топор (`starmetal_axe`)

- Tier/type: 8, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/starmetal_axe.webp`
- Target: `icons/items/weapons/starmetal_axe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Звёздный топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:2
```

### Звёздный лук (`starmetal_bow`)

- Tier/type: 8, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/starmetal_bow.webp`
- Target: `icons/items/weapons/starmetal_bow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Звёздный лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:4
```

### Звёздный чакрам (`starmetal_chakram`)

- Tier/type: 8, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/starmetal_chakram.webp`
- Target: `icons/items/weapons/starmetal_chakram.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Звёздный чакрам", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:1
```

### Звёздный арбалет (`starmetal_crossbow`)

- Tier/type: 8, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/starmetal_crossbow.webp`
- Target: `icons/items/weapons/starmetal_crossbow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Звёздный арбалет", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:3
```

### Звёздный кистень (`starmetal_flail`)

- Tier/type: 8, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/starmetal_flail.webp`
- Target: `icons/items/weapons/starmetal_flail.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Звёздный кистень", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:2
```

### Звёздная секира (`starmetal_greataxe`)

- Tier/type: 8, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/starmetal_greataxe.webp`
- Target: `icons/items/weapons/starmetal_greataxe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Звёздная секира", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:3
```

### Звёздный двуруч (`starmetal_greatsword`)

- Tier/type: 8, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/starmetal_greatsword.webp`
- Target: `icons/items/weapons/starmetal_greatsword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Звёздный двуруч", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:4
```

### Звёздная булава (`starmetal_mace`)

- Tier/type: 8, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/starmetal_mace.webp`
- Target: `icons/items/weapons/starmetal_mace.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Звёздная булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:2
```

### Звёздное копьё (`starmetal_spear`)

- Tier/type: 8, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/starmetal_spear.webp`
- Target: `icons/items/weapons/starmetal_spear.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Звёздное копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:4
```

### Звёздный посох (`starmetal_staff`)

- Tier/type: 8, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/starmetal_staff.webp`
- Target: `icons/items/weapons/starmetal_staff.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Звёздный посох", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:4
```

### Звёздный молот (`starmetal_warhammer`)

- Tier/type: 8, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/starmetal_warhammer.webp`
- Target: `icons/items/weapons/starmetal_warhammer.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Звёздный молот", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:3
```

### Клинок Пустоты (`void_blade`)

- Tier/type: 8, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/void_blade.webp`
- Target: `icons/items/weapons/void_blade.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Клинок Пустоты", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:3
```

### Кинжал Пустоты (`void_dagger`)

- Tier/type: 8, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/void_dagger.webp`
- Target: `icons/items/weapons/void_dagger.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Кинжал Пустоты", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:2
```

### Орихалковый топор (`orichalcum_axe`)

- Tier/type: 9, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/orichalcum_axe.webp`
- Target: `icons/items/weapons/orichalcum_axe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Орихалковый топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, edge dripping with blood-red light, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, golden divine light, lens flare, sparks of pure energy --ar 1:2
```

### Клинок Орихалка (`orichalcum_blade`)

- Tier/type: 9, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/orichalcum_blade.webp`
- Target: `icons/items/weapons/orichalcum_blade.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Клинок Орихалка", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, crimson essence swirling around the blade, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, golden divine light, lens flare, sparks of pure energy --ar 1:3
```

### Лук Орихалка (`orichalcum_bow`)

- Tier/type: 9, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/orichalcum_bow.webp`
- Target: `icons/items/weapons/orichalcum_bow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Лук Орихалка", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, edge dripping with blood-red light, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, golden divine light, lens flare, sparks of pure energy --ar 1:4
```

### Чакрам Орихалка (`orichalcum_chakram`)

- Tier/type: 9, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/orichalcum_chakram.webp`
- Target: `icons/items/weapons/orichalcum_chakram.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Чакрам Орихалка", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, edge dripping with blood-red light, razor-sharp focal lines, killing-strike geometry, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, golden divine light, lens flare, sparks of pure energy --ar 1:1
```

### Арбалет Орихалка (`orichalcum_crossbow`)

- Tier/type: 9, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/orichalcum_crossbow.webp`
- Target: `icons/items/weapons/orichalcum_crossbow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Арбалет Орихалка", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, golden divine light, lens flare, sparks of pure energy --ar 1:3
```

### Цеп Орихалка (`orichalcum_flail`)

- Tier/type: 9, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/orichalcum_flail.webp`
- Target: `icons/items/weapons/orichalcum_flail.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Цеп Орихалка", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, crackling lightning arcs along the surface, hooked / barbed shape designed to catch and disarm, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, golden divine light, lens flare, sparks of pure energy --ar 1:2
```

### Секира Орихалка (`orichalcum_greataxe`)

- Tier/type: 9, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/orichalcum_greataxe.webp`
- Target: `icons/items/weapons/orichalcum_greataxe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Секира Орихалка", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, edge dripping with blood-red light, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, golden divine light, lens flare, sparks of pure energy --ar 1:3
```

### Двуруч Орихалка (`orichalcum_greatsword`)

- Tier/type: 9, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/orichalcum_greatsword.webp`
- Target: `icons/items/weapons/orichalcum_greatsword.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Двуруч Орихалка", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, crackling lightning arcs along the surface, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, golden divine light, lens flare, sparks of pure energy --ar 1:4
```

### Орихалковый кинжал (`orichalcum_knife`)

- Tier/type: 9, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/orichalcum_knife.webp`
- Target: `icons/items/weapons/orichalcum_knife.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Орихалковый кинжал", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, edge dripping with blood-red light, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, golden divine light, lens flare, sparks of pure energy --ar 1:2
```

### Молот Орихалка (`orichalcum_mace`)

- Tier/type: 9, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/orichalcum_mace.webp`
- Target: `icons/items/weapons/orichalcum_mace.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Молот Орихалка", a single fantasy mace, flanged head, short metal haft, leather grip, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, crackling lightning arcs along the surface, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, golden divine light, lens flare, sparks of pure energy --ar 1:2
```

### Копьё Орихалка (`orichalcum_spear`)

- Tier/type: 9, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/orichalcum_spear.webp`
- Target: `icons/items/weapons/orichalcum_spear.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Копьё Орихалка", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, hooked / barbed shape designed to catch and disarm, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, golden divine light, lens flare, sparks of pure energy --ar 1:4
```

### Посох Орихалка (`orichalcum_staff`)

- Tier/type: 9, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/orichalcum_staff.webp`
- Target: `icons/items/weapons/orichalcum_staff.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Посох Орихалка", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, crimson essence swirling around the blade, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, golden divine light, lens flare, sparks of pure energy --ar 1:4
```

### Молот Орихалка (`orichalcum_warhammer`)

- Tier/type: 9, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/orichalcum_warhammer.webp`
- Target: `icons/items/weapons/orichalcum_warhammer.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Молот Орихалка", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, crackling lightning arcs along the surface, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, golden divine light, lens flare, sparks of pure energy --ar 1:3
```

### Адамантиевый топор (`adamantium_axe`)

- Tier/type: 10, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/adamantium_axe.webp`
- Target: `icons/items/weapons/adamantium_axe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Адамантиевый топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, metal seems to phase through reality, edge dripping with blood-red light, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:2
```

### Костолом (`bonebreaker_flail`)

- Tier/type: 10, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/bonebreaker_flail.webp`
- Target: `icons/items/weapons/bonebreaker_flail.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Костолом", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, metal seems to phase through reality, crackling lightning arcs along the surface, hooked / barbed shape designed to catch and disarm, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:2
```

### Секира Катаклизма (`cataclysm_axe`)

- Tier/type: 10, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/cataclysm_axe.webp`
- Target: `icons/items/weapons/cataclysm_axe.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Секира Катаклизма", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, edge dripping with blood-red light, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:3
```

### Молот Катаклизма (`cataclysm_hammer`)

- Tier/type: 10, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/cataclysm_hammer.webp`
- Target: `icons/items/weapons/cataclysm_hammer.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Молот Катаклизма", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, aura of finality, soul-reaping shimmer, crackling lightning arcs along the surface, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:3
```

### Богоразитель (`godcrusher_mace`)

- Tier/type: 10, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/godcrusher_mace.webp`
- Target: `icons/items/weapons/godcrusher_mace.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Богоразитель", a single fantasy mace, flanged head, short metal haft, leather grip, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, aura of finality, soul-reaping shimmer, crackling lightning arcs along the surface, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:2
```

### Чакрам Длани Богов (`godhand_chakram`)

- Tier/type: 10, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/godhand_chakram.webp`
- Target: `icons/items/weapons/godhand_chakram.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Чакрам Длани Богов", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, edge dripping with blood-red light, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:1
```

### Богопронзитель (`godpiercer`)

- Tier/type: 10, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/godpiercer.webp`
- Target: `icons/items/weapons/godpiercer.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Богопронзитель", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, aura of finality, soul-reaping shimmer, hooked / barbed shape designed to catch and disarm, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:4
```

### Кинжал Богоруба (`godsplitter_dagger`)

- Tier/type: 10, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/godsplitter_dagger.webp`
- Target: `icons/items/weapons/godsplitter_dagger.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Кинжал Богоруба", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, edge dripping with blood-red light, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:2
```

### Арбалет Ищущего Пустоту (`voidseeker_crossbow`)

- Tier/type: 10, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/voidseeker_crossbow.webp`
- Target: `icons/items/weapons/voidseeker_crossbow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Арбалет Ищущего Пустоту", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:3
```

### Лук Ветроискателя (`windseeker_bow`)

- Tier/type: 10, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/windseeker_bow.webp`
- Target: `icons/items/weapons/windseeker_bow.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Лук Ветроискателя", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, metal seems to phase through reality, edge dripping with blood-red light, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:4
```

### Мирорассекатель (`world_cutter`)

- Tier/type: 10, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/world_cutter.webp`
- Target: `icons/items/weapons/world_cutter.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Мирорассекатель", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, crimson essence swirling around the blade, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:3
```

### Посох Мирового Корня (`worldroot_staff`)

- Tier/type: 10, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/worldroot_staff.webp`
- Target: `icons/items/weapons/worldroot_staff.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Посох Мирового Корня", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, crimson essence swirling around the blade, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:4
```

### Мирорассекатель Великий (`worldsplitter`)

- Tier/type: 10, weapon
- Current: `systems/iron-hills-system/icons/items/weapons/worldsplitter.webp`
- Target: `icons/items/weapons/worldsplitter.webp`
- Prompt source: docs/content/weapons-prompts.json

```
Concept of "Мирорассекатель Великий", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, aura of finality, soul-reaping shimmer, crackling lightning arcs along the surface, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:4
```
