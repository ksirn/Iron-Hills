# Iron Hills Prompt-Driven Item Art Batch

Generated: 2026-06-18T17:39:42.727Z

This file is the safe art-production queue. It is not a placeholder generator.

## Workflow

- 1. Generate images from this manifest, one row per asset.
- 2. Save each selected final image exactly at targetFile.
- 3. Run node tools/audit-art-targets.mjs before applying catalog paths.
- 4. Run node tools/apply-art-backlog.mjs --dry-run, then apply without --dry-run after QA is clean.

## Summary

- Total: 174
- Batches: 11
- By catalog: consumables=3, tools=29, belts=11, backpacks=15, attachments=18, materials=98

## consumables-01

### 1. Кожаная фляга (`consumables/leather_waterskin`)

- Target: `art-candidates/items/consumables/leather_waterskin.webp`
- Replaces after QA: `icons/items/consumables/leather_waterskin.webp`
- Replacement reasons: untracked-development-placeholder
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/consumables-prompts.json

Prompt:
```
Concept "Кожаная фляга", leather waterskin with cork stopper, stitched seams, small water bead highlights, survival utility, practical fantasy expedition medicine, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, multiple unrelated objects, cluttered background, human hands, human face, character portrait, modern plastic, hospital equipment, sci-fi device, nsfw
```

### 2. Железная фляга (`consumables/iron_canteen`)

- Target: `art-candidates/items/consumables/iron_canteen.webp`
- Replaces after QA: `icons/items/consumables/iron_canteen.webp`
- Replacement reasons: untracked-development-placeholder
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/consumables-prompts.json

Prompt:
```
Concept "Железная фляга", iron canteen with leather strap, dented field metal, screw cap, survival utility, practical fantasy expedition medicine, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, balanced inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, multiple unrelated objects, cluttered background, human hands, human face, character portrait, modern plastic, hospital equipment, sci-fi device, nsfw
```

### 3. Бурдюк следопыта (`consumables/ranger_gourd`)

- Target: `art-candidates/items/consumables/ranger_gourd.webp`
- Replaces after QA: `icons/items/consumables/ranger_gourd.webp`
- Replacement reasons: untracked-development-placeholder
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/consumables-prompts.json

Prompt:
```
Concept "Бурдюк следопыта", traveler gourd canteen with ranger cord wrap, carved wooden stopper, survival utility, practical fantasy expedition medicine, field-proven adventurer gear, reinforced details, readable silhouette, balanced inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, multiple unrelated objects, cluttered background, human hands, human face, character portrait, modern plastic, hospital equipment, sci-fi device, nsfw
```

## tools-01

### 4. Котелок (`tools/cooking_pot`)

- Target: `art-candidates/items/tools/cooking_pot.webp`
- Replaces after QA: `icons/items/tools/cooking_pot.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Котелок", emphasis handheld toolkit readable silhouette compact bench fold hinges, iron grate kettle pans stacked crates skewers steam, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 5. Кремнёвые инструменты (`tools/flint_tools`)

- Target: `art-candidates/items/tools/flint_tools.webp`
- Replaces after QA: `icons/items/tools/flint_tools.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Кремнёвые инструменты", emphasis handheld toolkit readable silhouette compact bench fold hinges, vise clamps rulers drawers pegboard folded bench legs sawdust, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 6. Набор разделки туши (`tools/hunter_butcher_kit`)

- Target: `art-candidates/items/tools/hunter_butcher_kit.webp`
- Replaces after QA: `icons/items/tools/hunter_butcher_kit.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: fallback

Prompt:
```
Concept "Набор разделки туши", a single fantasy crafting or survival tool, rough low-tier materials, worn edges, practical peasant craft, vertical item orientation, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 7. Железный молот (`tools/iron_hammer`)

- Target: `art-candidates/items/tools/iron_hammer.webp`
- Replaces after QA: `icons/items/tools/iron_hammer.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Железный молот", emphasis handheld toolkit readable silhouette compact bench fold hinges, forge tongs hammer anvil sparks soot, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 8. Ступка и пестик (`tools/mortar_pestle`)

- Target: `art-candidates/items/tools/mortar_pestle.webp`
- Replaces after QA: `icons/items/tools/mortar_pestle.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Ступка и пестик", emphasis handheld toolkit readable silhouette compact bench fold hinges, glass retorts clamps burner coils bottles racks, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 9. Железная кирка (`tools/pickaxe_iron`)

- Target: `art-candidates/items/tools/pickaxe_iron.webp`
- Replaces after QA: `icons/items/tools/pickaxe_iron.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Железная кирка", emphasis handheld toolkit readable silhouette compact bench fold hinges, pickaxe drill brace crank cables reinforcement plate, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 10. Алхимический набор (`tools/alch_kit`)

- Target: `art-candidates/items/tools/alch_kit.webp`
- Replaces after QA: `icons/items/tools/alch_kit.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Алхимический набор", emphasis handheld toolkit readable silhouette compact bench fold hinges, glass retorts clamps burner coils bottles racks, reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 11. Скрутка полевого мясника (`tools/field_butcher_roll`)

- Target: `art-candidates/items/tools/field_butcher_roll.webp`
- Replaces after QA: `icons/items/tools/field_butcher_roll.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: fallback

Prompt:
```
Concept "Скрутка полевого мясника", a single fantasy crafting or survival tool, iron, bronze, seasoned leather and utilitarian workshop finish, vertical item orientation, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 12. Инструменты мастера (`tools/master_tools`)

- Target: `art-candidates/items/tools/master_tools.webp`
- Replaces after QA: `icons/items/tools/master_tools.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Инструменты мастера", emphasis handheld toolkit readable silhouette compact bench fold hinges, vise clamps rulers drawers pegboard folded bench legs sawdust, reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 13. Стальная кирка (`tools/pickaxe_steel`)

- Target: `art-candidates/items/tools/pickaxe_steel.webp`
- Replaces after QA: `icons/items/tools/pickaxe_steel.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Стальная кирка", emphasis handheld toolkit readable silhouette compact bench fold hinges, pickaxe drill brace crank cables reinforcement plate, reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 14. Стальной молот (`tools/steel_hammer`)

- Target: `art-candidates/items/tools/steel_hammer.webp`
- Replaces after QA: `icons/items/tools/steel_hammer.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Стальной молот", emphasis handheld toolkit readable silhouette compact bench fold hinges, forge tongs hammer anvil sparks soot, reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 15. Бронзовый жаровенный набор (`tools/bronze_brazier_set`)

- Target: `art-candidates/items/tools/bronze_brazier_set.webp`
- Replaces after QA: `icons/items/tools/bronze_brazier_set.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Бронзовый жаровенный набор", emphasis handheld toolkit readable silhouette compact bench fold hinges, iron grate kettle pans stacked crates skewers steam, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Жаровня на треноге и котлы для полевых отрядов — база перед сборкой большой кухни на салазках.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 16. Гномий молот (`tools/dwarven_hammer`)

- Target: `art-candidates/items/tools/dwarven_hammer.webp`
- Replaces after QA: `icons/items/tools/dwarven_hammer.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Гномий молот", emphasis handheld toolkit readable silhouette compact bench fold hinges, forge tongs hammer anvil sparks soot, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 17. Пара складных козёл (`tools/fold_sawhorse_pair`)

- Target: `art-candidates/items/tools/fold_sawhorse_pair.webp`
- Replaces after QA: `icons/items/tools/fold_sawhorse_pair.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Пара складных козёл", emphasis handheld toolkit readable silhouette compact bench fold hinges, vise clamps rulers drawers pegboard folded bench legs sawdust, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Для распила и сборки заготовок в полевых условиях.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 18. Большая алхим. лаб. (`tools/grand_alch_kit`)

- Target: `art-candidates/items/tools/grand_alch_kit.webp`
- Replaces after QA: `icons/items/tools/grand_alch_kit.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Большая алхим. лаб.", emphasis handheld toolkit readable silhouette compact bench fold hinges, glass retorts clamps burner coils bottles racks, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 19. Дорожная наковальня в ящике (`tools/travel_anvil_kit`)

- Target: `art-candidates/items/tools/travel_anvil_kit.webp`
- Replaces after QA: `icons/items/tools/travel_anvil_kit.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Дорожная наковальня в ящике", emphasis bulky wagon planks reinforced hinges straps draft-animal towing cues, forge tongs hammer anvil sparks soot, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Складная наковальня и малый горн в деревянном коробе. Тянет упряжка или два крепких грузчика.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 20. Шахтёрский бурильный станок (`tools/deep_drill_brace`)

- Target: `art-candidates/items/tools/deep_drill_brace.webp`
- Replaces after QA: `icons/items/tools/deep_drill_brace.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Шахтёрский бурильный станок", emphasis bulky wagon planks reinforced hinges straps draft-animal towing cues, pickaxe drill brace crank cables reinforcement plate, merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Ручная дрель на станине для узких штолен.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 21. Полевая кухня на салазках (`tools/field_kitchen_cart`)

- Target: `art-candidates/items/tools/field_kitchen_cart.webp`
- Replaces after QA: `icons/items/tools/field_kitchen_cart.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Полевая кухня на салазках", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, iron grate kettle pans stacked crates skewers steam, merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Плита, жаровня и ящик для продуктов. Нужна лошадь или несколько грузоносцев.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 22. Складной алхимический стол (`tools/folding_alchemy_bench`)

- Target: `art-candidates/items/tools/folding_alchemy_bench.webp`
- Replaces after QA: `icons/items/tools/folding_alchemy_bench.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Складной алхимический стол", emphasis bulky wagon planks reinforced hinges straps draft-animal towing cues, glass retorts clamps burner coils bottles racks, merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Стойки, зажимы и подставки под колбы складываются в один ящик.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 23. Переносная кузница (`tools/portable_smith_kit`)

- Target: `art-candidates/items/tools/portable_smith_kit.webp`
- Replaces after QA: `icons/items/tools/portable_smith_kit.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Переносная кузница", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Горн, малая наковальня и салазки. Выставляется за час; перевозится на телеге или двух быках.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

## tools-02

### 24. Стол ремесленника на колёсах (`tools/master_artisans_cart`)

- Target: `art-candidates/items/tools/master_artisans_cart.webp`
- Replaces after QA: `icons/items/tools/master_artisans_cart.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Стол ремесленника на колёсах", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, vise clamps rulers drawers pegboard folded bench legs sawdust, noble artisan embossed fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Ящики с оснасткой для столярки, кожи и мелкой ковки в одном фургончике.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 25. Паровая перегонная установка (`tools/steam_evaporator_kit`)

- Target: `art-candidates/items/tools/steam_evaporator_kit.webp`
- Replaces after QA: `icons/items/tools/steam_evaporator_kit.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Паровая перегонная установка", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, glass retorts clamps burner coils bottles racks, elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Медные змеевики и котёл; тяжёл, зато чистые фракции.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 26. Комплект туннельных лесов (`tools/tunnel_jack_system`)

- Target: `art-candidates/items/tools/tunnel_jack_system.webp`
- Replaces after QA: `icons/items/tools/tunnel_jack_system.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Комплект туннельных лесов", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, pickaxe drill brace crank cables reinforcement plate, elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Распорки и лебёдка для укрепления забоя.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 27. Кузница на колёсах (`tools/wagon_forge`)

- Target: `art-candidates/items/tools/wagon_forge.webp`
- Replaces after QA: `icons/items/tools/wagon_forge.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Кузница на колёсах", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Полноценный горн и средняя наковальня на двухосяном тележном ходу. Обычно тянет пара мулов или один упряжный зверь.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 28. Караванная алхимлаборатория (`tools/alchemical_caravan_lab`)

- Target: `art-candidates/items/tools/alchemical_caravan_lab.webp`
- Replaces after QA: `icons/items/tools/alchemical_caravan_lab.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Караванная алхимлаборатория", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, glass retorts clamps burner coils bottles racks, rare siege caravan engineered spectacle, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Два стола, витражи с реагентами и фиксация колб — груз на фургон.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 29. Осадная переносная кузница (`tools/siege_anvil_cart`)

- Target: `art-candidates/items/tools/siege_anvil_cart.webp`
- Replaces after QA: `icons/items/tools/siege_anvil_cart.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Осадная переносная кузница", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, rare siege caravan engineered spectacle, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Массивная наковальня и усиленный горн на четырёх колёсах. Тянет упряж четырёх волов или один крупный гуманоид.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 30. Руническая складная горн-тень (`tools/runic_fold_forge`)

- Target: `art-candidates/items/tools/runic_fold_forge.webp`
- Replaces after QA: `icons/items/tools/runic_fold_forge.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Руническая складная горн-тень", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, starmetal accents artifact hints, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Магически облегчённая рама: вес меньше обычного, но всё ещё не для рюкзака одного человека.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 31. Проявитель звёздной кузницы (`tools/starforge_manifest`)

- Target: `art-candidates/items/tools/starforge_manifest.webp`
- Replaces after QA: `icons/items/tools/starforge_manifest.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Проявитель звёздной кузницы", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, legendary planar shimmer restrained, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Кристаллы-якоря разворачивают временный горн из сгустка тепла и света.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 32. Семя мастерской Мирового Корня (`tools/worldroot_workshop_seed`)

- Target: `art-candidates/items/tools/worldroot_workshop_seed.webp`
- Replaces after QA: `icons/items/tools/worldroot_workshop_seed.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: fallback

Prompt:
```
Concept "Семя мастерской Мирового Корня", a single fantasy crafting or survival tool, mythic godsteel, adamant core, reality-bending magical highlights, vertical item orientation, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

## belts-01

### 33. Кожаный пояс (`belts/leather_belt`)

- Target: `art-candidates/items/belts/leather_belt.webp`
- Replaces after QA: `icons/items/belts/leather_belt.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x1, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Кожаный пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 3 pouch slots narrative hint and 1 side mounts for weapon frogs quivers holsters; leather textile mixed metals; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 34. Верёвочный пояс (`belts/rope_belt`)

- Target: `art-candidates/items/belts/rope_belt.webp`
- Replaces after QA: `icons/items/belts/rope_belt.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x1, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Верёвочный пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 2 pouch slots narrative hint and 0 side mounts for weapon frogs quivers holsters; leather textile mixed metals; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 35. Солдатский пояс (`belts/soldier_belt`)

- Target: `art-candidates/items/belts/soldier_belt.webp`
- Replaces after QA: `icons/items/belts/soldier_belt.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x1, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Солдатский пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 4 pouch slots narrative hint and 2 side mounts for weapon frogs quivers holsters; leather textile mixed metals; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 36. Тактический пояс (`belts/tactical_belt`)

- Target: `art-candidates/items/belts/tactical_belt.webp`
- Replaces after QA: `icons/items/belts/tactical_belt.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x1, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Тактический пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 10 pouch slots narrative hint and 3 side mounts for weapon frogs quivers holsters; leather textile mixed metals; guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 37. Пояс следопыта (`belts/explorer_girdle`)

- Target: `art-candidates/items/belts/explorer_girdle.webp`
- Replaces after QA: `icons/items/belts/explorer_girdle.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x1, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Пояс следопыта", fantasy waist belt pouches straps buckle studs utility loops; roughly 10 pouch slots narrative hint and 4 side mounts for weapon frogs quivers holsters; leather textile mixed metals; merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 38. Митрильный пояс (`belts/mithril_belt`)

- Target: `art-candidates/items/belts/mithril_belt.webp`
- Replaces after QA: `icons/items/belts/mithril_belt.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x1, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Митрильный пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 12 pouch slots narrative hint and 4 side mounts for weapon frogs quivers holsters; leather textile mixed metals; noble artisan embossed fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 39. Осадный пояс (`belts/siege_belt`)

- Target: `art-candidates/items/belts/siege_belt.webp`
- Replaces after QA: `icons/items/belts/siege_belt.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x1, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Осадный пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 12 pouch slots narrative hint and 5 side mounts for weapon frogs quivers holsters; leather textile mixed metals; elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 40. Облегчённая портупея бегуна (`belts/runners_light_harness`)

- Target: `art-candidates/items/belts/runners_light_harness.webp`
- Replaces after QA: `icons/items/belts/runners_light_harness.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x1, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Облегчённая портупея бегуна", fantasy waist belt pouches straps buckle studs utility loops; roughly 15 pouch slots narrative hint and 4 side mounts for weapon frogs quivers holsters; leather textile mixed metals; rare siege caravan engineered spectacle, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 41. Цепной пояс из тёмного железа (`belts/darkiron_chain_belt`)

- Target: `art-candidates/items/belts/darkiron_chain_belt.webp`
- Replaces after QA: `icons/items/belts/darkiron_chain_belt.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x1, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Цепной пояс из тёмного железа", fantasy waist belt pouches straps buckle studs utility loops; roughly 14 pouch slots narrative hint and 6 side mounts for weapon frogs quivers holsters; leather textile mixed metals; starmetal accents artifact hints, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 42. Пояс Орихалка (`belts/orichalcum_girdle`)

- Target: `art-candidates/items/belts/orichalcum_girdle.webp`
- Replaces after QA: `icons/items/belts/orichalcum_girdle.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x1, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Пояс Орихалка", fantasy waist belt pouches straps buckle studs utility loops; roughly 16 pouch slots narrative hint and 7 side mounts for weapon frogs quivers holsters; leather textile mixed metals; legendary planar shimmer restrained, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 43. Астральная портупея командора (`belts/astral_command_girdle`)

- Target: `art-candidates/items/belts/astral_command_girdle.webp`
- Replaces after QA: `icons/items/belts/astral_command_girdle.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Астральная портупея командора", a single fantasy utility belt, mythic godsteel, adamant core, reality-bending magical highlights, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

## backpacks-01

### 44. Поясная сумка (`backpacks/hip_pouch`)

- Target: `art-candidates/items/backpacks/hip_pouch.webp`
- Replaces after QA: `icons/items/backpacks/hip_pouch.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Поясная сумка", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 45. Кожаная сумка (`backpacks/leather_satchel`)

- Target: `art-candidates/items/backpacks/leather_satchel.webp`
- Replaces after QA: `icons/items/backpacks/leather_satchel.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x2, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Кожаная сумка", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x2 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 46. Небольшой мешок (`backpacks/small_sack`)

- Target: `art-candidates/items/backpacks/small_sack.webp`
- Replaces after QA: `icons/items/backpacks/small_sack.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x2, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Небольшой мешок", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x2 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 47. Охотничья сума (`backpacks/hunters_bag`)

- Target: `art-candidates/items/backpacks/hunters_bag.webp`
- Replaces after QA: `icons/items/backpacks/hunters_bag.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x3, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Охотничья сума", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x3 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 48. Солдатский ранец (`backpacks/soldier_pack`)

- Target: `art-candidates/items/backpacks/soldier_pack.webp`
- Replaces after QA: `icons/items/backpacks/soldier_pack.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x3, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Солдатский ранец", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x3 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 49. Дорожный ранец (`backpacks/travelers_pack`)

- Target: `art-candidates/items/backpacks/travelers_pack.webp`
- Replaces after QA: `icons/items/backpacks/travelers_pack.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x3, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Дорожный ранец", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x3 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 50. Рамный рюкзак (`backpacks/frame_pack`)

- Target: `art-candidates/items/backpacks/frame_pack.webp`
- Replaces after QA: `icons/items/backpacks/frame_pack.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x4, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Рамный рюкзак", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 51. Большой рюкзак (`backpacks/large_backpack`)

- Target: `art-candidates/items/backpacks/large_backpack.webp`
- Replaces after QA: `icons/items/backpacks/large_backpack.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x4, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Большой рюкзак", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 52. Сумка алхимика (`backpacks/alchemist_satchel`)

- Target: `art-candidates/items/backpacks/alchemist_satchel.webp`
- Replaces after QA: `icons/items/backpacks/alchemist_satchel.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x3, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Сумка алхимика", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x3 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 53. Митрильный рюкзак (`backpacks/mithril_pack`)

- Target: `art-candidates/items/backpacks/mithril_pack.webp`
- Replaces after QA: `icons/items/backpacks/mithril_pack.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x4, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Митрильный рюкзак", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; noble artisan embossed fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 54. Рюкзак караванного бариши (`backpacks/caravan_master_pack`)

- Target: `art-candidates/items/backpacks/caravan_master_pack.webp`
- Replaces after QA: `icons/items/backpacks/caravan_master_pack.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x4, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Рюкзак караванного бариши", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 55. Вьючная рама для зверя (`backpacks/beast_load_frame`)

- Target: `art-candidates/items/backpacks/beast_load_frame.webp`
- Replaces after QA: `icons/items/backpacks/beast_load_frame.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x4, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Вьючная рама для зверя", emphasis saddle straps beast harness mount frames oversized haul bag meant for draft animal NOT worn by human silhouette alonefantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; rare siege caravan engineered spectacle, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 56. Сумка Пустоты (`backpacks/void_satchel`)

- Target: `art-candidates/items/backpacks/void_satchel.webp`
- Replaces after QA: `icons/items/backpacks/void_satchel.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x3, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Сумка Пустоты", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; starmetal accents artifact hints, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x3 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 57. Планарная сумка (`backpacks/planar_satchel`)

- Target: `art-candidates/items/backpacks/planar_satchel.webp`
- Replaces after QA: `icons/items/backpacks/planar_satchel.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x4, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Планарная сумка", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; legendary planar shimmer restrained, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 58. Рюкзак малой демиплоскости (`backpacks/demiplane_pack`)

- Target: `art-candidates/items/backpacks/demiplane_pack.webp`
- Replaces after QA: `icons/items/backpacks/demiplane_pack.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x4, 1:2, 768x1536
- Source: fallback

Prompt:
```
Concept "Рюкзак малой демиплоскости", a single fantasy backpack or pouch, mythic godsteel, adamant core, reality-bending magical highlights, vertical item orientation, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

## attachments-01

### 59. Нагрудный карман (`attachments/chest_pocket`)

- Target: `art-candidates/items/attachments/chest_pocket.webp`
- Replaces after QA: `icons/items/attachments/chest_pocket.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Нагрудный карман", torso harness modular straps threaded clips climbing buckle tactical vest snippet; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 60. Петля (топор) (`attachments/axe_loop`)

- Target: `art-candidates/items/attachments/axe_loop.webp`
- Replaces after QA: `icons/items/attachments/axe_loop.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Петля (топор)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 61. Подсумок (болты) (`attachments/bolt_pouch`)

- Target: `art-candidates/items/attachments/bolt_pouch.webp`
- Replaces after QA: `icons/items/attachments/bolt_pouch.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Подсумок (болты)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 62. Ножны (нож) (`attachments/knife_sheath`)

- Target: `art-candidates/items/attachments/knife_sheath.webp`
- Replaces after QA: `icons/items/attachments/knife_sheath.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Ножны (нож)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 63. Боковой подсумок (`attachments/side_pouch`)

- Target: `art-candidates/items/attachments/side_pouch.webp`
- Replaces after QA: `icons/items/attachments/side_pouch.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Боковой подсумок", mount bracket modular pouch snaps clips backpack accessory riveted straps; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 64. Колчан (стрелы) (`attachments/arrow_quiver`)

- Target: `art-candidates/items/attachments/arrow_quiver.webp`
- Replaces after QA: `icons/items/attachments/arrow_quiver.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x3, 1:3, 512x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Колчан (стрелы)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x3 grid footprint, 1:3, 512x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 65. Перевязь (лук) (`attachments/bow_sling`)

- Target: `art-candidates/items/attachments/bow_sling.webp`
- Replaces after QA: `icons/items/attachments/bow_sling.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x3, 1:3, 512x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Перевязь (лук)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x3 grid footprint, 1:3, 512x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 66. Бандольер (зелья) (`attachments/potion_bandolier`)

- Target: `art-candidates/items/attachments/potion_bandolier.webp`
- Replaces after QA: `icons/items/attachments/potion_bandolier.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x3, 1:3, 512x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Бандольер (зелья)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x3 grid footprint, 1:3, 512x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 67. Ножны (меч) (`attachments/sword_scabbard`)

- Target: `art-candidates/items/attachments/sword_scabbard.webp`
- Replaces after QA: `icons/items/attachments/sword_scabbard.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x4, 1:4, 384x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Ножны (меч)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x4 grid footprint, 1:4, 384x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 68. Разгрузочная стропа (`attachments/utility_strap`)

- Target: `art-candidates/items/attachments/utility_strap.webp`
- Replaces after QA: `icons/items/attachments/utility_strap.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 2x1, 1:1, 1024x1024
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Разгрузочная стропа", torso harness modular straps threaded clips climbing buckle tactical vest snippet; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 69. Крюк (арбалет) (`attachments/crossbow_hook`)

- Target: `art-candidates/items/attachments/crossbow_hook.webp`
- Replaces after QA: `icons/items/attachments/crossbow_hook.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Крюк (арбалет)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 70. Бандольер большой (`attachments/large_bandolier`)

- Target: `art-candidates/items/attachments/large_bandolier.webp`
- Replaces after QA: `icons/items/attachments/large_bandolier.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x3, 1:3, 512x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Бандольер большой", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x3 grid footprint, 1:3, 512x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 71. Крюк для щита (`attachments/shield_hook`)

- Target: `art-candidates/items/attachments/shield_hook.webp`
- Replaces after QA: `icons/items/attachments/shield_hook.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x3, 1:3, 512x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Крюк для щита", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x3 grid footprint, 1:3, 512x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 72. Чехол для копья (`attachments/spear_frog`)

- Target: `art-candidates/items/attachments/spear_frog.webp`
- Replaces after QA: `icons/items/attachments/spear_frog.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x4, 1:4, 384x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Чехол для копья", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x4 grid footprint, 1:4, 384x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 73. Ножны (двуруч.) (`attachments/greatsword_scabbard`)

- Target: `art-candidates/items/attachments/greatsword_scabbard.webp`
- Replaces after QA: `icons/items/attachments/greatsword_scabbard.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x5, 1:4, 384x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Ножны (двуруч.)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x5 grid footprint, 1:4, 384x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 74. Петля для жезла (`attachments/wand_loop`)

- Target: `art-candidates/items/attachments/wand_loop.webp`
- Replaces after QA: `icons/items/attachments/wand_loop.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Петля для жезла", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 75. Кольца под метательное (`attachments/grenade_loop`)

- Target: `art-candidates/items/attachments/grenade_loop.webp`
- Replaces after QA: `icons/items/attachments/grenade_loop.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x2, 1:2, 768x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Кольца под метательное", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 76. Телескопический колчан (`attachments/telescoping_quiver`)

- Target: `art-candidates/items/attachments/telescoping_quiver.webp`
- Replaces after QA: `icons/items/attachments/telescoping_quiver.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x3, 1:3, 512x1536
- Source: docs/content/gear-prompts.json

Prompt:
```
Concept "Телескопический колчан", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x3 grid footprint, 1:3, 512x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

## materials-01

### 77. Шкура зверя (`materials/animal_hide`)

- Target: `art-candidates/items/materials/animal_hide.webp`
- Replaces after QA: `icons/items/materials/animal_hide.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Шкура зверя", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 78. Жильё зверя (`materials/beast_sinew_spool`)

- Target: `art-candidates/items/materials/beast_sinew_spool.webp`
- Replaces after QA: `icons/items/materials/beast_sinew_spool.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Жильё зверя", fantasy harvest material — fibrous tendon coil stripped sinew filament spool cue, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 79. Ткань (`materials/cloth`)

- Target: `art-candidates/items/materials/cloth.webp`
- Replaces after QA: `icons/items/materials/cloth.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Ткань", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 80. Уголь (`materials/coal`)

- Target: `art-candidates/items/materials/coal.webp`
- Replaces after QA: `icons/items/materials/coal.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Уголь", a single practical fantasy mineral or workshop material, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 81. Медный слиток (`materials/copper_ingot`)

- Target: `art-candidates/items/materials/copper_ingot.webp`
- Replaces after QA: `icons/items/materials/copper_ingot.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Медный слиток", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 82. Медная руда (`materials/copper_ore`)

- Target: `art-candidates/items/materials/copper_ore.webp`
- Replaces after QA: `icons/items/materials/copper_ore.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Медная руда", a single chunk of raw fantasy ore with stone matrix and metallic veins, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 83. Осколок клыка (`materials/fang_shard`)

- Target: `art-candidates/items/materials/fang_shard.webp`
- Replaces after QA: `icons/items/materials/fang_shard.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Осколок клыка", fantasy harvest material — splintered enamel ivory shard trophy tip, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, beast-lord pinnacle trophy hoard dense scales atmosphere, tier 9 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 84. Кремень (`materials/flint`)

- Target: `art-candidates/items/materials/flint.webp`
- Replaces after QA: `icons/items/materials/flint.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Кремень", a single practical fantasy mineral or workshop material, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 85. Обычная трава (`materials/herb_common`)

- Target: `art-candidates/items/materials/herb_common.webp`
- Replaces after QA: `icons/items/materials/herb_common.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Обычная трава", a gathered fantasy botanical reagent bundle, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 86. Целебный лист (`materials/herb_healing`)

- Target: `art-candidates/items/materials/herb_healing.webp`
- Replaces after QA: `icons/items/materials/herb_healing.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Целебный лист", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 87. Болотный гриб (`materials/mushroom_bog`)

- Target: `art-candidates/items/materials/mushroom_bog.webp`
- Replaces after QA: `icons/items/materials/mushroom_bog.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Болотный гриб", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 88. Масло (фляга) (`materials/oil_flask`)

- Target: `art-candidates/items/materials/oil_flask.webp`
- Replaces after QA: `icons/items/materials/oil_flask.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Масло (фляга)", a fantasy alchemical reagent vial, sealed pouch or organic harvest component, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 89. Сосновая доска (`materials/pine_wood`)

- Target: `art-candidates/items/materials/pine_wood.webp`
- Replaces after QA: `icons/items/materials/pine_wood.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Сосновая доска", a bundle of fantasy timber, carved root, plank or rare wood sample, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 90. Сырое волокно (`materials/raw_fiber`)

- Target: `art-candidates/items/materials/raw_fiber.webp`
- Replaces after QA: `icons/items/materials/raw_fiber.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Сырое волокно", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 91. Верёвка (`materials/rope`)

- Target: `art-candidates/items/materials/rope.webp`
- Replaces after QA: `icons/items/materials/rope.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Верёвка", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 92. Небольшая шкура (сырая) (`materials/small_pelt_uncured`)

- Target: `art-candidates/items/materials/small_pelt_uncured.webp`
- Replaces after QA: `icons/items/materials/small_pelt_uncured.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Небольшая шкура (сырая)", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 93. Камень (`materials/stone`)

- Target: `art-candidates/items/materials/stone.webp`
- Replaces after QA: `icons/items/materials/stone.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Камень", a single fantasy gem, crystal shard or mineral specimen with readable facets, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 94. Выделанная кожа (`materials/tanned_leather`)

- Target: `art-candidates/items/materials/tanned_leather.webp`
- Replaces after QA: `icons/items/materials/tanned_leather.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Выделанная кожа", a folded fantasy hide, pelt, scale sheet or cured leather crafting material, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 95. Пыльца ночных мотыльков (`materials/wisp_moth_powder`)

- Target: `art-candidates/items/materials/wisp_moth_powder.webp`
- Replaces after QA: `icons/items/materials/wisp_moth_powder.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Пыльца ночных мотыльков", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 96. Киль птицеящера (`materials/avian_keel_bone`)

- Target: `art-candidates/items/materials/avian_keel_bone.webp`
- Replaces after QA: `icons/items/materials/avian_keel_bone.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Киль птицеящера", fantasy harvest material — lightweight beast bone keel ridge marrow hollow, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

## materials-02

### 97. Кольца из щетины кабана (`materials/bristle_keg_rings`)

- Target: `art-candidates/items/materials/bristle_keg_rings.webp`
- Replaces after QA: `icons/items/materials/bristle_keg_rings.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Кольца из щетины кабана", fantasy harvest material — bristle rings bundled hog trophy craft rings, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 98. Бронзовый слиток (`materials/bronze_ingot`)

- Target: `art-candidates/items/materials/bronze_ingot.webp`
- Replaces after QA: `icons/items/materials/bronze_ingot.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Бронзовый слиток", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 99. Тонкая ткань (`materials/fine_cloth`)

- Target: `art-candidates/items/materials/fine_cloth.webp`
- Replaces after QA: `icons/items/materials/fine_cloth.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Тонкая ткань", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 100. Кузнечный кокс (`materials/forge_coal`)

- Target: `art-candidates/items/materials/forge_coal.webp`
- Replaces after QA: `icons/items/materials/forge_coal.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Кузнечный кокс", a single practical fantasy mineral or workshop material, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 101. Стекло (`materials/glass`)

- Target: `art-candidates/items/materials/glass.webp`
- Replaces after QA: `icons/items/materials/glass.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Стекло", a single practical fantasy mineral or workshop material, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 102. Гранит (`materials/granite`)

- Target: `art-candidates/items/materials/granite.webp`
- Replaces after QA: `icons/items/materials/granite.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Гранит", a single practical fantasy mineral or workshop material, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 103. Дубовая доска (`materials/oak_wood`)

- Target: `art-candidates/items/materials/oak_wood.webp`
- Replaces after QA: `icons/items/materials/oak_wood.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Дубовая доска", a bundle of fantasy timber, carved root, plank or rare wood sample, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 104. Ядовитый клык (`materials/poison_fang`)

- Target: `art-candidates/items/materials/poison_fang.webp`
- Replaces after QA: `icons/items/materials/poison_fang.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Ядовитый клык", a fantasy monster trophy material or preserved anatomical crafting component, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 105. Кварц (`materials/quartz`)

- Target: `art-candidates/items/materials/quartz.webp`
- Replaces after QA: `icons/items/materials/quartz.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Кварц", a single fantasy gem, crystal shard or mineral specimen with readable facets, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 106. Горький корень (`materials/root_bitter`)

- Target: `art-candidates/items/materials/root_bitter.webp`
- Replaces after QA: `icons/items/materials/root_bitter.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Горький корень", a bundle of fantasy timber, carved root, plank or rare wood sample, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 107. Слабая змеиная желчь (`materials/serpent_sac_mild`)

- Target: `art-candidates/items/materials/serpent_sac_mild.webp`
- Replaces after QA: `icons/items/materials/serpent_sac_mild.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Слабая змеиная желчь", fantasy harvest material — visceral sac bulb stoppered wax cord alchemical, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 108. Толстая шкура (`materials/thick_hide`)

- Target: `art-candidates/items/materials/thick_hide.webp`
- Replaces after QA: `icons/items/materials/thick_hide.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Толстая шкура", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 109. Оловянная руда (`materials/tin_ore`)

- Target: `art-candidates/items/materials/tin_ore.webp`
- Replaces after QA: `icons/items/materials/tin_ore.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Оловянная руда", a single chunk of raw fantasy ore with stone matrix and metallic veins, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 110. Железа вожака (`materials/alpha_musk_gland`)

- Target: `art-candidates/items/materials/alpha_musk_gland.webp`
- Replaces after QA: `icons/items/materials/alpha_musk_gland.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Железа вожака", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 111. Лунный цветок (`materials/flower_moon`)

- Target: `art-candidates/items/materials/flower_moon.webp`
- Replaces after QA: `icons/items/materials/flower_moon.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Лунный цветок", a gathered fantasy botanical reagent bundle, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 112. Твёрдая древесина (`materials/hardwood`)

- Target: `art-candidates/items/materials/hardwood.webp`
- Replaces after QA: `icons/items/materials/hardwood.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Твёрдая древесина", a bundle of fantasy timber, carved root, plank or rare wood sample, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 113. Железный слиток (`materials/iron_ingot`)

- Target: `art-candidates/items/materials/iron_ingot.webp`
- Replaces after QA: `icons/items/materials/iron_ingot.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Железный слиток", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 114. Железная руда (`materials/iron_ore`)

- Target: `art-candidates/items/materials/iron_ore.webp`
- Replaces after QA: `icons/items/materials/iron_ore.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Железная руда", a single chunk of raw fantasy ore with stone matrix and metallic veins, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 115. Мана-камень (`materials/mana_stone`)

- Target: `art-candidates/items/materials/mana_stone.webp`
- Replaces after QA: `icons/items/materials/mana_stone.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Мана-камень", a single fantasy gem, crystal shard or mineral specimen with readable facets, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 116. Железа монстра (`materials/monster_gland`)

- Target: `art-candidates/items/materials/monster_gland.webp`
- Replaces after QA: `icons/items/materials/monster_gland.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Железа монстра", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

## materials-03

### 117. Обсидиан (`materials/obsidian`)

- Target: `art-candidates/items/materials/obsidian.webp`
- Replaces after QA: `icons/items/materials/obsidian.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Обсидиан", a single fantasy gem, crystal shard or mineral specimen with readable facets, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 118. Чешуйчатая шкура (`materials/scale_hide`)

- Target: `art-candidates/items/materials/scale_hide.webp`
- Replaces after QA: `icons/items/materials/scale_hide.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Чешуйчатая шкура", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 119. Шёлк (`materials/silk`)

- Target: `art-candidates/items/materials/silk.webp`
- Replaces after QA: `icons/items/materials/silk.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Шёлк", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 120. Чешуя дрейка (`materials/drake_scale`)

- Target: `art-candidates/items/materials/drake_scale.webp`
- Replaces after QA: `icons/items/materials/drake_scale.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Чешуя дрейка", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 121. Пыль зачарования (`materials/enchant_dust`)

- Target: `art-candidates/items/materials/enchant_dust.webp`
- Replaces after QA: `icons/items/materials/enchant_dust.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Пыль зачарования", a fantasy alchemical reagent vial, sealed pouch or organic harvest component, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 122. Железное дерево (`materials/ironwood`)

- Target: `art-candidates/items/materials/ironwood.webp`
- Replaces after QA: `icons/items/materials/ironwood.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Железное дерево", a bundle of fantasy timber, carved root, plank or rare wood sample, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 123. Смоляная пробка хищника (`materials/predator_resin_mass`)

- Target: `art-candidates/items/materials/predator_resin_mass.webp`
- Replaces after QA: `icons/items/materials/predator_resin_mass.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Смоляная пробка хищника", fantasy harvest material — dark amber resin plug predator gum cluster, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 124. Рубин (`materials/ruby`)

- Target: `art-candidates/items/materials/ruby.webp`
- Replaces after QA: `icons/items/materials/ruby.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Рубин", a single fantasy gem, crystal shard or mineral specimen with readable facets, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 125. Паучий шёлк (`materials/spider_silk`)

- Target: `art-candidates/items/materials/spider_silk.webp`
- Replaces after QA: `icons/items/materials/spider_silk.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Паучий шёлк", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 126. Стальной слиток (`materials/steel_ingot`)

- Target: `art-candidates/items/materials/steel_ingot.webp`
- Replaces after QA: `icons/items/materials/steel_ingot.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Стальной слиток", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 127. Мешок с ядом (`materials/venom_sac`)

- Target: `art-candidates/items/materials/venom_sac.webp`
- Replaces after QA: `icons/items/materials/venom_sac.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Мешок с ядом", fantasy harvest material — visceral sac bulb stoppered wax cord alchemical, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, beast-lord apex resin reservoirs armored slabs atmosphere, tier 8 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 128. Жилье виверны (`materials/wyvern_sinew_filament`)

- Target: `art-candidates/items/materials/wyvern_sinew_filament.webp`
- Replaces after QA: `icons/items/materials/wyvern_sinew_filament.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Жилье виверны", fantasy harvest material — fibrous tendon coil stripped sinew filament spool cue, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, wyvern drake trophy scales sinew resin elite quarry atmosphere, tier 4 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 129. Мастерская смола (`materials/artisans_resin`)

- Target: `art-candidates/items/materials/artisans_resin.webp`
- Replaces after QA: `icons/items/materials/artisans_resin.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Мастерская смола", a fantasy alchemical reagent vial, sealed pouch or organic harvest component, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 130. Кожа дрейка (`materials/drake_hide`)

- Target: `art-candidates/items/materials/drake_hide.webp`
- Replaces after QA: `icons/items/materials/drake_hide.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Кожа дрейка", a folded fantasy hide, pelt, scale sheet or cured leather crafting material, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 131. Закалённая сталь (`materials/hardened_steel`)

- Target: `art-candidates/items/materials/hardened_steel.webp`
- Replaces after QA: `icons/items/materials/hardened_steel.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Закалённая сталь", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 132. Мана-кристалл (`materials/mana_crystal`)

- Target: `art-candidates/items/materials/mana_crystal.webp`
- Replaces after QA: `icons/items/materials/mana_crystal.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Мана-кристалл", a single fantasy gem, crystal shard or mineral specimen with readable facets, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 133. Лунное волокно (`materials/moonweave`)

- Target: `art-candidates/items/materials/moonweave.webp`
- Replaces after QA: `icons/items/materials/moonweave.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Лунное волокно", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 134. Сапфир (`materials/sapphire`)

- Target: `art-candidates/items/materials/sapphire.webp`
- Replaces after QA: `icons/items/materials/sapphire.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Сапфир", a single fantasy gem, crystal shard or mineral specimen with readable facets, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 135. Цветок духов (`materials/spirit_bloom`)

- Target: `art-candidates/items/materials/spirit_bloom.webp`
- Replaces after QA: `icons/items/materials/spirit_bloom.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Цветок духов", a gathered fantasy botanical reagent bundle, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 136. Древесина духов (`materials/spirit_wood`)

- Target: `art-candidates/items/materials/spirit_wood.webp`
- Replaces after QA: `icons/items/materials/spirit_wood.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Древесина духов", a bundle of fantasy timber, carved root, plank or rare wood sample, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

## materials-04

### 137. Алмаз (`materials/diamond`)

- Target: `art-candidates/items/materials/diamond.webp`
- Replaces after QA: `icons/items/materials/diamond.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Алмаз", a single fantasy gem, crystal shard or mineral specimen with readable facets, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 138. Чёрное дерево (`materials/ebony`)

- Target: `art-candidates/items/materials/ebony.webp`
- Replaces after QA: `icons/items/materials/ebony.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Чёрное дерево", a bundle of fantasy timber, carved root, plank or rare wood sample, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 139. Митрильный слиток (`materials/mithril_ingot`)

- Target: `art-candidates/items/materials/mithril_ingot.webp`
- Replaces after QA: `icons/items/materials/mithril_ingot.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Митрильный слиток", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 140. Митрильная руда (`materials/mithril_ore`)

- Target: `art-candidates/items/materials/mithril_ore.webp`
- Replaces after QA: `icons/items/materials/mithril_ore.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Митрильная руда", a single chunk of raw fantasy ore with stone matrix and metallic veins, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 141. Перо феникса (`materials/phoenix_feather`)

- Target: `art-candidates/items/materials/phoenix_feather.webp`
- Replaces after QA: `icons/items/materials/phoenix_feather.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Перо феникса", a fantasy monster trophy material or preserved anatomical crafting component, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 142. Теневое волокно (`materials/shadowweave`)

- Target: `art-candidates/items/materials/shadowweave.webp`
- Replaces after QA: `icons/items/materials/shadowweave.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Теневое волокно", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 143. Эссенция души (`materials/soul_essence`)

- Target: `art-candidates/items/materials/soul_essence.webp`
- Replaces after QA: `icons/items/materials/soul_essence.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Эссенция души", a fantasy alchemical reagent vial, sealed pouch or organic harvest component, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 144. Шкура варга (`materials/warg_pelt`)

- Target: `art-candidates/items/materials/warg_pelt.webp`
- Replaces after QA: `icons/items/materials/warg_pelt.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Шкура варга", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, beast-lord pinnacle trophy hoard dense scales atmosphere, tier 9 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 145. Тёмное железо (`materials/dark_iron`)

- Target: `art-candidates/items/materials/dark_iron.webp`
- Replaces after QA: `icons/items/materials/dark_iron.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Тёмное железо", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 146. Тёмная руда (`materials/dark_iron_ore`)

- Target: `art-candidates/items/materials/dark_iron_ore.webp`
- Replaces after QA: `icons/items/materials/dark_iron_ore.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Тёмная руда", a single chunk of raw fantasy ore with stone matrix and metallic veins, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 147. Вечное дерево (`materials/eternal_wood`)

- Target: `art-candidates/items/materials/eternal_wood.webp`
- Replaces after QA: `icons/items/materials/eternal_wood.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Вечное дерево", a bundle of fantasy timber, carved root, plank or rare wood sample, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 148. Сердце великана (`materials/giant_heart`)

- Target: `art-candidates/items/materials/giant_heart.webp`
- Replaces after QA: `icons/items/materials/giant_heart.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Сердце великана", a fantasy monster trophy material or preserved anatomical crafting component, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 149. Планарная скоба (`materials/planar_clip`)

- Target: `art-candidates/items/materials/planar_clip.webp`
- Replaces after QA: `icons/items/materials/planar_clip.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Планарная скоба", a single fantasy crafting material with a specific readable silhouette, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 150. Звёздная нить (`materials/starthread`)

- Target: `art-candidates/items/materials/starthread.webp`
- Replaces after QA: `icons/items/materials/starthread.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Звёздная нить", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 151. Кристалл Пустоты (`materials/void_crystal`)

- Target: `art-candidates/items/materials/void_crystal.webp`
- Replaces after QA: `icons/items/materials/void_crystal.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Кристалл Пустоты", a single fantasy gem, crystal shard or mineral specimen with readable facets, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 152. Шкура виверны (`materials/wyvern_hide`)

- Target: `art-candidates/items/materials/wyvern_hide.webp`
- Replaces after QA: `icons/items/materials/wyvern_hide.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Шкура виверны", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 153. Жеода эона (`materials/aeon_geode`)

- Target: `art-candidates/items/materials/aeon_geode.webp`
- Replaces after QA: `icons/items/materials/aeon_geode.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Жеода эона", a single fantasy gem, crystal shard or mineral specimen with readable facets, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 154. Моток арканной проволоки (`materials/arcane_mesh`)

- Target: `art-candidates/items/materials/arcane_mesh.webp`
- Replaces after QA: `icons/items/materials/arcane_mesh.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Моток арканной проволоки", a folded fantasy hide, pelt, scale sheet or cured leather crafting material, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 155. Кровь дракона (`materials/dragon_blood`)

- Target: `art-candidates/items/materials/dragon_blood.webp`
- Replaces after QA: `icons/items/materials/dragon_blood.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Кровь дракона", a fantasy alchemical reagent vial, sealed pouch or organic harvest component, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 156. Кожа дракона (`materials/dragon_hide`)

- Target: `art-candidates/items/materials/dragon_hide.webp`
- Replaces after QA: `icons/items/materials/dragon_hide.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Кожа дракона", a folded fantasy hide, pelt, scale sheet or cured leather crafting material, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

## materials-05

### 157. Звёздный металл (`materials/starmetal`)

- Target: `art-candidates/items/materials/starmetal.webp`
- Replaces after QA: `icons/items/materials/starmetal.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Звёздный металл", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 158. Звёздная руда (`materials/starmetal_ore`)

- Target: `art-candidates/items/materials/starmetal_ore.webp`
- Replaces after QA: `icons/items/materials/starmetal_ore.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Звёздная руда", a single chunk of raw fantasy ore with stone matrix and metallic veins, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 159. Ткань Пустоты (`materials/void_weave`)

- Target: `art-candidates/items/materials/void_weave.webp`
- Replaces after QA: `icons/items/materials/void_weave.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Ткань Пустоты", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 160. Мировое дерево (`materials/world_tree`)

- Target: `art-candidates/items/materials/world_tree.webp`
- Replaces after QA: `icons/items/materials/world_tree.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Мировое дерево", a bundle of fantasy timber, carved root, plank or rare wood sample, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 161. Лишайник Бездны (`materials/abyss_lichen`)

- Target: `art-candidates/items/materials/abyss_lichen.webp`
- Replaces after QA: `icons/items/materials/abyss_lichen.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Лишайник Бездны", a gathered fantasy botanical reagent bundle, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 162. Нить Авроры (`materials/aurora_thread`)

- Target: `art-candidates/items/materials/aurora_thread.webp`
- Replaces after QA: `icons/items/materials/aurora_thread.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Нить Авроры", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 163. Шкура гидры (`materials/hydra_hide`)

- Target: `art-candidates/items/materials/hydra_hide.webp`
- Replaces after QA: `icons/items/materials/hydra_hide.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Шкура гидры", a folded fantasy hide, pelt, scale sheet or cured leather crafting material, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 164. Орихалк (`materials/orichalcum`)

- Target: `art-candidates/items/materials/orichalcum.webp`
- Replaces after QA: `icons/items/materials/orichalcum.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Орихалк", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 165. Осколок реликта (`materials/relic_shard`)

- Target: `art-candidates/items/materials/relic_shard.webp`
- Replaces after QA: `icons/items/materials/relic_shard.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Осколок реликта", a single fantasy gem, crystal shard or mineral specimen with readable facets, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 166. Осколок звезды (`materials/star_shard`)

- Target: `art-candidates/items/materials/star_shard.webp`
- Replaces after QA: `icons/items/materials/star_shard.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Осколок звезды", a single fantasy gem, crystal shard or mineral specimen with readable facets, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 167. Доска солнечного дуба (`materials/sun_oak_board`)

- Target: `art-candidates/items/materials/sun_oak_board.webp`
- Replaces after QA: `icons/items/materials/sun_oak_board.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Доска солнечного дуба", a bundle of fantasy timber, carved root, plank or rare wood sample, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 168. Адамантий (`materials/adamantium`)

- Target: `art-candidates/items/materials/adamantium.webp`
- Replaces after QA: `icons/items/materials/adamantium.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Адамантий", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 169. Семя эпохи (`materials/epoch_seed`)

- Target: `art-candidates/items/materials/epoch_seed.webp`
- Replaces after QA: `icons/items/materials/epoch_seed.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Семя эпохи", a gathered fantasy botanical reagent bundle, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 170. Брус генезиса (`materials/genesis_timber`)

- Target: `art-candidates/items/materials/genesis_timber.webp`
- Replaces after QA: `icons/items/materials/genesis_timber.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Брус генезиса", a bundle of fantasy timber, carved root, plank or rare wood sample, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 171. Полотно генезиса (`materials/genesis_weave`)

- Target: `art-candidates/items/materials/genesis_weave.webp`
- Replaces after QA: `icons/items/materials/genesis_weave.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Полотно генезиса", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 172. Слёзы богов (`materials/god_tears`)

- Target: `art-candidates/items/materials/god_tears.webp`
- Replaces after QA: `icons/items/materials/god_tears.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Слёзы богов", a fantasy alchemical reagent vial, sealed pouch or organic harvest component, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 173. Шкура Левиафана (`materials/leviathan_hide`)

- Target: `art-candidates/items/materials/leviathan_hide.webp`
- Replaces after QA: `icons/items/materials/leviathan_hide.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Шкура Левиафана", a folded fantasy hide, pelt, scale sheet or cured leather crafting material, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 174. Сердце звезды (`materials/star_heart`)

- Target: `art-candidates/items/materials/star_heart.webp`
- Replaces after QA: `icons/items/materials/star_heart.webp`
- Replacement reasons: untracked-development-placeholder, deterministic-baseline-category
- Grid: 1x1, 1:1, 1024x1024
- Source: fallback

Prompt:
```
Concept "Сердце звезды", a fantasy monster trophy material or preserved anatomical crafting component, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```
