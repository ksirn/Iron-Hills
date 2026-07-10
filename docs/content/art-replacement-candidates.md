# Iron Hills Final-Quality Art Replacement Candidates

Generated: 2026-06-18T17:39:33.544Z

This file is a safe replacement queue for item art that is working but not final-quality. Candidate images must be generated into `art-candidates/items/...`; current working icons under `icons/items/...` are not overwritten by this manifest.

## Workflow

- 1. Generate each candidate image from targetFile/prompt without overwriting finalFile.
- 2. Inspect candidates visually against the existing finalFile and keep only clear upgrades.
- 3. Run node tools/audit-art-targets.mjs --manifest docs/content/art-replacement-candidates.json before promotion.
- 4. Promote selected candidates over finalFile, then run node tools/check-content-readiness.mjs --strict-art.

## Summary

- Total candidates: 174
- Batches: 11
- By catalog: consumables=3, tools=29, belts=11, backpacks=15, attachments=18, materials=98
- Reasons: untracked-development-placeholder=174, deterministic-baseline-category=171
- Candidate files: candidateMissing=174

## consumables-replacement-01

### 1. Кожаная фляга (`consumables/leather_waterskin`)

- Candidate target: `art-candidates/items/consumables/leather_waterskin.webp`
- Existing final file: `icons/items/consumables/leather_waterskin.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder
- Prompt source: docs/content/consumables-prompts.json

Prompt:
```
Concept "Кожаная фляга", leather waterskin with cork stopper, stitched seams, small water bead highlights, survival utility, practical fantasy expedition medicine, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, multiple unrelated objects, cluttered background, human hands, human face, character portrait, modern plastic, hospital equipment, sci-fi device, nsfw
```

### 2. Железная фляга (`consumables/iron_canteen`)

- Candidate target: `art-candidates/items/consumables/iron_canteen.webp`
- Existing final file: `icons/items/consumables/iron_canteen.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder
- Prompt source: docs/content/consumables-prompts.json

Prompt:
```
Concept "Железная фляга", iron canteen with leather strap, dented field metal, screw cap, survival utility, practical fantasy expedition medicine, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, balanced inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, multiple unrelated objects, cluttered background, human hands, human face, character portrait, modern plastic, hospital equipment, sci-fi device, nsfw
```

### 3. Бурдюк следопыта (`consumables/ranger_gourd`)

- Candidate target: `art-candidates/items/consumables/ranger_gourd.webp`
- Existing final file: `icons/items/consumables/ranger_gourd.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder
- Prompt source: docs/content/consumables-prompts.json

Prompt:
```
Concept "Бурдюк следопыта", traveler gourd canteen with ranger cord wrap, carved wooden stopper, survival utility, practical fantasy expedition medicine, field-proven adventurer gear, reinforced details, readable silhouette, balanced inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, multiple unrelated objects, cluttered background, human hands, human face, character portrait, modern plastic, hospital equipment, sci-fi device, nsfw
```

## tools-replacement-01

### 4. Котелок (`tools/cooking_pot`)

- Candidate target: `art-candidates/items/tools/cooking_pot.webp`
- Existing final file: `icons/items/tools/cooking_pot.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Котелок", emphasis handheld toolkit readable silhouette compact bench fold hinges, iron grate kettle pans stacked crates skewers steam, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 5. Кремнёвые инструменты (`tools/flint_tools`)

- Candidate target: `art-candidates/items/tools/flint_tools.webp`
- Existing final file: `icons/items/tools/flint_tools.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Кремнёвые инструменты", emphasis handheld toolkit readable silhouette compact bench fold hinges, vise clamps rulers drawers pegboard folded bench legs sawdust, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 6. Набор разделки туши (`tools/hunter_butcher_kit`)

- Candidate target: `art-candidates/items/tools/hunter_butcher_kit.webp`
- Existing final file: `icons/items/tools/hunter_butcher_kit.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Набор разделки туши", a single fantasy crafting or survival tool, rough low-tier materials, worn edges, practical peasant craft, vertical item orientation, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 7. Железный молот (`tools/iron_hammer`)

- Candidate target: `art-candidates/items/tools/iron_hammer.webp`
- Existing final file: `icons/items/tools/iron_hammer.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Железный молот", emphasis handheld toolkit readable silhouette compact bench fold hinges, forge tongs hammer anvil sparks soot, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 8. Ступка и пестик (`tools/mortar_pestle`)

- Candidate target: `art-candidates/items/tools/mortar_pestle.webp`
- Existing final file: `icons/items/tools/mortar_pestle.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Ступка и пестик", emphasis handheld toolkit readable silhouette compact bench fold hinges, glass retorts clamps burner coils bottles racks, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 9. Железная кирка (`tools/pickaxe_iron`)

- Candidate target: `art-candidates/items/tools/pickaxe_iron.webp`
- Existing final file: `icons/items/tools/pickaxe_iron.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Железная кирка", emphasis handheld toolkit readable silhouette compact bench fold hinges, pickaxe drill brace crank cables reinforcement plate, modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 10. Алхимический набор (`tools/alch_kit`)

- Candidate target: `art-candidates/items/tools/alch_kit.webp`
- Existing final file: `icons/items/tools/alch_kit.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Алхимический набор", emphasis handheld toolkit readable silhouette compact bench fold hinges, glass retorts clamps burner coils bottles racks, reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 11. Скрутка полевого мясника (`tools/field_butcher_roll`)

- Candidate target: `art-candidates/items/tools/field_butcher_roll.webp`
- Existing final file: `icons/items/tools/field_butcher_roll.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Скрутка полевого мясника", a single fantasy crafting or survival tool, iron, bronze, seasoned leather and utilitarian workshop finish, vertical item orientation, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 12. Инструменты мастера (`tools/master_tools`)

- Candidate target: `art-candidates/items/tools/master_tools.webp`
- Existing final file: `icons/items/tools/master_tools.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Инструменты мастера", emphasis handheld toolkit readable silhouette compact bench fold hinges, vise clamps rulers drawers pegboard folded bench legs sawdust, reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 13. Стальная кирка (`tools/pickaxe_steel`)

- Candidate target: `art-candidates/items/tools/pickaxe_steel.webp`
- Existing final file: `icons/items/tools/pickaxe_steel.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Стальная кирка", emphasis handheld toolkit readable silhouette compact bench fold hinges, pickaxe drill brace crank cables reinforcement plate, reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 14. Стальной молот (`tools/steel_hammer`)

- Candidate target: `art-candidates/items/tools/steel_hammer.webp`
- Existing final file: `icons/items/tools/steel_hammer.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Стальной молот", emphasis handheld toolkit readable silhouette compact bench fold hinges, forge tongs hammer anvil sparks soot, reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 15. Бронзовый жаровенный набор (`tools/bronze_brazier_set`)

- Candidate target: `art-candidates/items/tools/bronze_brazier_set.webp`
- Existing final file: `icons/items/tools/bronze_brazier_set.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Бронзовый жаровенный набор", emphasis handheld toolkit readable silhouette compact bench fold hinges, iron grate kettle pans stacked crates skewers steam, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Жаровня на треноге и котлы для полевых отрядов — база перед сборкой большой кухни на салазках.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 16. Гномий молот (`tools/dwarven_hammer`)

- Candidate target: `art-candidates/items/tools/dwarven_hammer.webp`
- Existing final file: `icons/items/tools/dwarven_hammer.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Гномий молот", emphasis handheld toolkit readable silhouette compact bench fold hinges, forge tongs hammer anvil sparks soot, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 17. Пара складных козёл (`tools/fold_sawhorse_pair`)

- Candidate target: `art-candidates/items/tools/fold_sawhorse_pair.webp`
- Existing final file: `icons/items/tools/fold_sawhorse_pair.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Пара складных козёл", emphasis handheld toolkit readable silhouette compact bench fold hinges, vise clamps rulers drawers pegboard folded bench legs sawdust, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Для распила и сборки заготовок в полевых условиях.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 18. Большая алхим. лаб. (`tools/grand_alch_kit`)

- Candidate target: `art-candidates/items/tools/grand_alch_kit.webp`
- Existing final file: `icons/items/tools/grand_alch_kit.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Большая алхим. лаб.", emphasis handheld toolkit readable silhouette compact bench fold hinges, glass retorts clamps burner coils bottles racks, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 19. Дорожная наковальня в ящике (`tools/travel_anvil_kit`)

- Candidate target: `art-candidates/items/tools/travel_anvil_kit.webp`
- Existing final file: `icons/items/tools/travel_anvil_kit.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Дорожная наковальня в ящике", emphasis bulky wagon planks reinforced hinges straps draft-animal towing cues, forge tongs hammer anvil sparks soot, guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Складная наковальня и малый горн в деревянном коробе. Тянет упряжка или два крепких грузчика.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 20. Шахтёрский бурильный станок (`tools/deep_drill_brace`)

- Candidate target: `art-candidates/items/tools/deep_drill_brace.webp`
- Existing final file: `icons/items/tools/deep_drill_brace.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Шахтёрский бурильный станок", emphasis bulky wagon planks reinforced hinges straps draft-animal towing cues, pickaxe drill brace crank cables reinforcement plate, merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Ручная дрель на станине для узких штолен.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 21. Полевая кухня на салазках (`tools/field_kitchen_cart`)

- Candidate target: `art-candidates/items/tools/field_kitchen_cart.webp`
- Existing final file: `icons/items/tools/field_kitchen_cart.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Полевая кухня на салазках", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, iron grate kettle pans stacked crates skewers steam, merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Плита, жаровня и ящик для продуктов. Нужна лошадь или несколько грузоносцев.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 22. Складной алхимический стол (`tools/folding_alchemy_bench`)

- Candidate target: `art-candidates/items/tools/folding_alchemy_bench.webp`
- Existing final file: `icons/items/tools/folding_alchemy_bench.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Складной алхимический стол", emphasis bulky wagon planks reinforced hinges straps draft-animal towing cues, glass retorts clamps burner coils bottles racks, merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Стойки, зажимы и подставки под колбы складываются в один ящик.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 23. Переносная кузница (`tools/portable_smith_kit`)

- Candidate target: `art-candidates/items/tools/portable_smith_kit.webp`
- Existing final file: `icons/items/tools/portable_smith_kit.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Переносная кузница", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Горн, малая наковальня и салазки. Выставляется за час; перевозится на телеге или двух быках.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

## tools-replacement-02

### 24. Стол ремесленника на колёсах (`tools/master_artisans_cart`)

- Candidate target: `art-candidates/items/tools/master_artisans_cart.webp`
- Existing final file: `icons/items/tools/master_artisans_cart.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Стол ремесленника на колёсах", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, vise clamps rulers drawers pegboard folded bench legs sawdust, noble artisan embossed fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Ящики с оснасткой для столярки, кожи и мелкой ковки в одном фургончике.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 25. Паровая перегонная установка (`tools/steam_evaporator_kit`)

- Candidate target: `art-candidates/items/tools/steam_evaporator_kit.webp`
- Existing final file: `icons/items/tools/steam_evaporator_kit.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Паровая перегонная установка", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, glass retorts clamps burner coils bottles racks, elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Медные змеевики и котёл; тяжёл, зато чистые фракции.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 26. Комплект туннельных лесов (`tools/tunnel_jack_system`)

- Candidate target: `art-candidates/items/tools/tunnel_jack_system.webp`
- Existing final file: `icons/items/tools/tunnel_jack_system.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Комплект туннельных лесов", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, pickaxe drill brace crank cables reinforcement plate, elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Распорки и лебёдка для укрепления забоя.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 27. Кузница на колёсах (`tools/wagon_forge`)

- Candidate target: `art-candidates/items/tools/wagon_forge.webp`
- Existing final file: `icons/items/tools/wagon_forge.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Кузница на колёсах", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Полноценный горн и средняя наковальня на двухосяном тележном ходу. Обычно тянет пара мулов или один упряжный зверь.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 28. Караванная алхимлаборатория (`tools/alchemical_caravan_lab`)

- Candidate target: `art-candidates/items/tools/alchemical_caravan_lab.webp`
- Existing final file: `icons/items/tools/alchemical_caravan_lab.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Караванная алхимлаборатория", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, glass retorts clamps burner coils bottles racks, rare siege caravan engineered spectacle, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Два стола, витражи с реагентами и фиксация колб — груз на фургон.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 29. Осадная переносная кузница (`tools/siege_anvil_cart`)

- Candidate target: `art-candidates/items/tools/siege_anvil_cart.webp`
- Existing final file: `icons/items/tools/siege_anvil_cart.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Осадная переносная кузница", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, rare siege caravan engineered spectacle, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Массивная наковальня и усиленный горн на четырёх колёсах. Тянет упряж четырёх волов или один крупный гуманоид.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 30. Руническая складная горн-тень (`tools/runic_fold_forge`)

- Candidate target: `art-candidates/items/tools/runic_fold_forge.webp`
- Existing final file: `icons/items/tools/runic_fold_forge.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Руническая складная горн-тень", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, starmetal accents artifact hints, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Магически облегчённая рама: вес меньше обычного, но всё ещё не для рюкзака одного человека.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 31. Проявитель звёздной кузницы (`tools/starforge_manifest`)

- Candidate target: `art-candidates/items/tools/starforge_manifest.webp`
- Existing final file: `icons/items/tools/starforge_manifest.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Проявитель звёздной кузницы", emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette, forge tongs hammer anvil sparks soot, legendary planar shimmer restrained, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Кристаллы-якоря разворачивают временный горн из сгустка тепла и света.. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 32. Семя мастерской Мирового Корня (`tools/worldroot_workshop_seed`)

- Candidate target: `art-candidates/items/tools/worldroot_workshop_seed.webp`
- Existing final file: `icons/items/tools/worldroot_workshop_seed.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Семя мастерской Мирового Корня", a single fantasy crafting or survival tool, mythic godsteel, adamant core, reality-bending magical highlights, vertical item orientation, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

## belts-replacement-01

### 33. Кожаный пояс (`belts/leather_belt`)

- Candidate target: `art-candidates/items/belts/leather_belt.webp`
- Existing final file: `icons/items/belts/leather_belt.webp`
- Grid: 2x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Кожаный пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 3 pouch slots narrative hint and 1 side mounts for weapon frogs quivers holsters; leather textile mixed metals; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 34. Верёвочный пояс (`belts/rope_belt`)

- Candidate target: `art-candidates/items/belts/rope_belt.webp`
- Existing final file: `icons/items/belts/rope_belt.webp`
- Grid: 2x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Верёвочный пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 2 pouch slots narrative hint and 0 side mounts for weapon frogs quivers holsters; leather textile mixed metals; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 35. Солдатский пояс (`belts/soldier_belt`)

- Candidate target: `art-candidates/items/belts/soldier_belt.webp`
- Existing final file: `icons/items/belts/soldier_belt.webp`
- Grid: 2x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Солдатский пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 4 pouch slots narrative hint and 2 side mounts for weapon frogs quivers holsters; leather textile mixed metals; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 36. Тактический пояс (`belts/tactical_belt`)

- Candidate target: `art-candidates/items/belts/tactical_belt.webp`
- Existing final file: `icons/items/belts/tactical_belt.webp`
- Grid: 2x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Тактический пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 10 pouch slots narrative hint and 3 side mounts for weapon frogs quivers holsters; leather textile mixed metals; guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 37. Пояс следопыта (`belts/explorer_girdle`)

- Candidate target: `art-candidates/items/belts/explorer_girdle.webp`
- Existing final file: `icons/items/belts/explorer_girdle.webp`
- Grid: 2x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Пояс следопыта", fantasy waist belt pouches straps buckle studs utility loops; roughly 10 pouch slots narrative hint and 4 side mounts for weapon frogs quivers holsters; leather textile mixed metals; merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 38. Митрильный пояс (`belts/mithril_belt`)

- Candidate target: `art-candidates/items/belts/mithril_belt.webp`
- Existing final file: `icons/items/belts/mithril_belt.webp`
- Grid: 2x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Митрильный пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 12 pouch slots narrative hint and 4 side mounts for weapon frogs quivers holsters; leather textile mixed metals; noble artisan embossed fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 39. Осадный пояс (`belts/siege_belt`)

- Candidate target: `art-candidates/items/belts/siege_belt.webp`
- Existing final file: `icons/items/belts/siege_belt.webp`
- Grid: 2x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Осадный пояс", fantasy waist belt pouches straps buckle studs utility loops; roughly 12 pouch slots narrative hint and 5 side mounts for weapon frogs quivers holsters; leather textile mixed metals; elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 40. Облегчённая портупея бегуна (`belts/runners_light_harness`)

- Candidate target: `art-candidates/items/belts/runners_light_harness.webp`
- Existing final file: `icons/items/belts/runners_light_harness.webp`
- Grid: 2x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Облегчённая портупея бегуна", fantasy waist belt pouches straps buckle studs utility loops; roughly 15 pouch slots narrative hint and 4 side mounts for weapon frogs quivers holsters; leather textile mixed metals; rare siege caravan engineered spectacle, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 41. Цепной пояс из тёмного железа (`belts/darkiron_chain_belt`)

- Candidate target: `art-candidates/items/belts/darkiron_chain_belt.webp`
- Existing final file: `icons/items/belts/darkiron_chain_belt.webp`
- Grid: 2x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Цепной пояс из тёмного железа", fantasy waist belt pouches straps buckle studs utility loops; roughly 14 pouch slots narrative hint and 6 side mounts for weapon frogs quivers holsters; leather textile mixed metals; starmetal accents artifact hints, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 42. Пояс Орихалка (`belts/orichalcum_girdle`)

- Candidate target: `art-candidates/items/belts/orichalcum_girdle.webp`
- Existing final file: `icons/items/belts/orichalcum_girdle.webp`
- Grid: 2x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Пояс Орихалка", fantasy waist belt pouches straps buckle studs utility loops; roughly 16 pouch slots narrative hint and 7 side mounts for weapon frogs quivers holsters; leather textile mixed metals; legendary planar shimmer restrained, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 43. Астральная портупея командора (`belts/astral_command_girdle`)

- Candidate target: `art-candidates/items/belts/astral_command_girdle.webp`
- Existing final file: `icons/items/belts/astral_command_girdle.webp`
- Grid: 2x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Астральная портупея командора", a single fantasy utility belt, mythic godsteel, adamant core, reality-bending magical highlights, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

## backpacks-replacement-01

### 44. Поясная сумка (`backpacks/hip_pouch`)

- Candidate target: `art-candidates/items/backpacks/hip_pouch.webp`
- Existing final file: `icons/items/backpacks/hip_pouch.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Поясная сумка", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 45. Кожаная сумка (`backpacks/leather_satchel`)

- Candidate target: `art-candidates/items/backpacks/leather_satchel.webp`
- Existing final file: `icons/items/backpacks/leather_satchel.webp`
- Grid: 2x2, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Кожаная сумка", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x2 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 46. Небольшой мешок (`backpacks/small_sack`)

- Candidate target: `art-candidates/items/backpacks/small_sack.webp`
- Existing final file: `icons/items/backpacks/small_sack.webp`
- Grid: 2x2, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Небольшой мешок", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x2 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 47. Охотничья сума (`backpacks/hunters_bag`)

- Candidate target: `art-candidates/items/backpacks/hunters_bag.webp`
- Existing final file: `icons/items/backpacks/hunters_bag.webp`
- Grid: 2x3, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Охотничья сума", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x3 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 48. Солдатский ранец (`backpacks/soldier_pack`)

- Candidate target: `art-candidates/items/backpacks/soldier_pack.webp`
- Existing final file: `icons/items/backpacks/soldier_pack.webp`
- Grid: 2x3, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Солдатский ранец", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x3 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 49. Дорожный ранец (`backpacks/travelers_pack`)

- Candidate target: `art-candidates/items/backpacks/travelers_pack.webp`
- Existing final file: `icons/items/backpacks/travelers_pack.webp`
- Grid: 2x3, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Дорожный ранец", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x3 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 50. Рамный рюкзак (`backpacks/frame_pack`)

- Candidate target: `art-candidates/items/backpacks/frame_pack.webp`
- Existing final file: `icons/items/backpacks/frame_pack.webp`
- Grid: 2x4, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Рамный рюкзак", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 51. Большой рюкзак (`backpacks/large_backpack`)

- Candidate target: `art-candidates/items/backpacks/large_backpack.webp`
- Existing final file: `icons/items/backpacks/large_backpack.webp`
- Grid: 2x4, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Большой рюкзак", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 52. Сумка алхимика (`backpacks/alchemist_satchel`)

- Candidate target: `art-candidates/items/backpacks/alchemist_satchel.webp`
- Existing final file: `icons/items/backpacks/alchemist_satchel.webp`
- Grid: 2x3, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Сумка алхимика", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x3 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 53. Митрильный рюкзак (`backpacks/mithril_pack`)

- Candidate target: `art-candidates/items/backpacks/mithril_pack.webp`
- Existing final file: `icons/items/backpacks/mithril_pack.webp`
- Grid: 2x4, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Митрильный рюкзак", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; noble artisan embossed fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 54. Рюкзак караванного бариши (`backpacks/caravan_master_pack`)

- Candidate target: `art-candidates/items/backpacks/caravan_master_pack.webp`
- Existing final file: `icons/items/backpacks/caravan_master_pack.webp`
- Grid: 2x4, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Рюкзак караванного бариши", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; elite siege train officer workshop, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 55. Вьючная рама для зверя (`backpacks/beast_load_frame`)

- Candidate target: `art-candidates/items/backpacks/beast_load_frame.webp`
- Existing final file: `icons/items/backpacks/beast_load_frame.webp`
- Grid: 2x4, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Вьючная рама для зверя", emphasis saddle straps beast harness mount frames oversized haul bag meant for draft animal NOT worn by human silhouette alonefantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; rare siege caravan engineered spectacle, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 56. Сумка Пустоты (`backpacks/void_satchel`)

- Candidate target: `art-candidates/items/backpacks/void_satchel.webp`
- Existing final file: `icons/items/backpacks/void_satchel.webp`
- Grid: 2x3, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Сумка Пустоты", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; starmetal accents artifact hints, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x3 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 57. Планарная сумка (`backpacks/planar_satchel`)

- Candidate target: `art-candidates/items/backpacks/planar_satchel.webp`
- Existing final file: `icons/items/backpacks/planar_satchel.webp`
- Grid: 2x4, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Планарная сумка", fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; legendary planar shimmer restrained, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 58. Рюкзак малой демиплоскости (`backpacks/demiplane_pack`)

- Candidate target: `art-candidates/items/backpacks/demiplane_pack.webp`
- Existing final file: `icons/items/backpacks/demiplane_pack.webp`
- Grid: 2x4, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Рюкзак малой демиплоскости", a single fantasy backpack or pouch, mythic godsteel, adamant core, reality-bending magical highlights, vertical item orientation, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x4 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

## attachments-replacement-01

### 59. Колчан (стрелы) (`attachments/arrow_quiver`)

- Candidate target: `art-candidates/items/attachments/arrow_quiver.webp`
- Existing final file: `icons/items/attachments/arrow_quiver.webp`
- Grid: 1x3, 1:3, 512x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Колчан (стрелы)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x3 grid footprint, 1:3, 512x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 60. Петля (топор) (`attachments/axe_loop`)

- Candidate target: `art-candidates/items/attachments/axe_loop.webp`
- Existing final file: `icons/items/attachments/axe_loop.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Петля (топор)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 61. Подсумок (болты) (`attachments/bolt_pouch`)

- Candidate target: `art-candidates/items/attachments/bolt_pouch.webp`
- Existing final file: `icons/items/attachments/bolt_pouch.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Подсумок (болты)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 62. Перевязь (лук) (`attachments/bow_sling`)

- Candidate target: `art-candidates/items/attachments/bow_sling.webp`
- Existing final file: `icons/items/attachments/bow_sling.webp`
- Grid: 1x3, 1:3, 512x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Перевязь (лук)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x3 grid footprint, 1:3, 512x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 63. Нагрудный карман (`attachments/chest_pocket`)

- Candidate target: `art-candidates/items/attachments/chest_pocket.webp`
- Existing final file: `icons/items/attachments/chest_pocket.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Нагрудный карман", torso harness modular straps threaded clips climbing buckle tactical vest snippet; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 64. Ножны (нож) (`attachments/knife_sheath`)

- Candidate target: `art-candidates/items/attachments/knife_sheath.webp`
- Existing final file: `icons/items/attachments/knife_sheath.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Ножны (нож)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 65. Бандольер (зелья) (`attachments/potion_bandolier`)

- Candidate target: `art-candidates/items/attachments/potion_bandolier.webp`
- Existing final file: `icons/items/attachments/potion_bandolier.webp`
- Grid: 1x3, 1:3, 512x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Бандольер (зелья)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x3 grid footprint, 1:3, 512x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 66. Боковой подсумок (`attachments/side_pouch`)

- Candidate target: `art-candidates/items/attachments/side_pouch.webp`
- Existing final file: `icons/items/attachments/side_pouch.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Боковой подсумок", mount bracket modular pouch snaps clips backpack accessory riveted straps; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 67. Ножны (меч) (`attachments/sword_scabbard`)

- Candidate target: `art-candidates/items/attachments/sword_scabbard.webp`
- Existing final file: `icons/items/attachments/sword_scabbard.webp`
- Grid: 1x4, 1:4, 384x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Ножны (меч)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; modest worn traveler gear, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x4 grid footprint, 1:4, 384x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 68. Крюк (арбалет) (`attachments/crossbow_hook`)

- Candidate target: `art-candidates/items/attachments/crossbow_hook.webp`
- Existing final file: `icons/items/attachments/crossbow_hook.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Крюк (арбалет)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 69. Ножны (двуруч.) (`attachments/greatsword_scabbard`)

- Candidate target: `art-candidates/items/attachments/greatsword_scabbard.webp`
- Existing final file: `icons/items/attachments/greatsword_scabbard.webp`
- Grid: 1x5, 1:4, 384x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Ножны (двуруч.)", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x5 grid footprint, 1:4, 384x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 70. Бандольер большой (`attachments/large_bandolier`)

- Candidate target: `art-candidates/items/attachments/large_bandolier.webp`
- Existing final file: `icons/items/attachments/large_bandolier.webp`
- Grid: 1x3, 1:3, 512x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Бандольер большой", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x3 grid footprint, 1:3, 512x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 71. Крюк для щита (`attachments/shield_hook`)

- Candidate target: `art-candidates/items/attachments/shield_hook.webp`
- Existing final file: `icons/items/attachments/shield_hook.webp`
- Grid: 1x3, 1:3, 512x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Крюк для щита", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x3 grid footprint, 1:3, 512x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 72. Чехол для копья (`attachments/spear_frog`)

- Candidate target: `art-candidates/items/attachments/spear_frog.webp`
- Existing final file: `icons/items/attachments/spear_frog.webp`
- Grid: 1x4, 1:4, 384x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Чехол для копья", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x4 grid footprint, 1:4, 384x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 73. Разгрузочная стропа (`attachments/utility_strap`)

- Candidate target: `art-candidates/items/attachments/utility_strap.webp`
- Existing final file: `icons/items/attachments/utility_strap.webp`
- Grid: 2x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Разгрузочная стропа", torso harness modular straps threaded clips climbing buckle tactical vest snippet; weapon accessory silhouette readable silhouette empty slots implied; reliable soldier surplus quality, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 2x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 74. Петля для жезла (`attachments/wand_loop`)

- Candidate target: `art-candidates/items/attachments/wand_loop.webp`
- Existing final file: `icons/items/attachments/wand_loop.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Петля для жезла", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; guild craftsman upgraded fittings, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 75. Кольца под метательное (`attachments/grenade_loop`)

- Candidate target: `art-candidates/items/attachments/grenade_loop.webp`
- Existing final file: `icons/items/attachments/grenade_loop.webp`
- Grid: 1x2, 1:2, 768x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Кольца под метательное", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x2 grid footprint, 1:2, 768x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

### 76. Телескопический колчан (`attachments/telescoping_quiver`)

- Candidate target: `art-candidates/items/attachments/telescoping_quiver.webp`
- Existing final file: `icons/items/attachments/telescoping_quiver.webp`
- Grid: 1x3, 1:3, 512x1536
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/gear-prompts.json

Prompt:
```
Concept "Телескопический колчан", belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility; weapon accessory silhouette readable silhouette empty slots implied; merchant caravan rugged prestige, single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detailed illustration. Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x3 grid footprint, 1:3, 512x1536. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw
```

## materials-replacement-01

### 77. Шкура зверя (`materials/animal_hide`)

- Candidate target: `art-candidates/items/materials/animal_hide.webp`
- Existing final file: `icons/items/materials/animal_hide.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Шкура зверя", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 78. Жильё зверя (`materials/beast_sinew_spool`)

- Candidate target: `art-candidates/items/materials/beast_sinew_spool.webp`
- Existing final file: `icons/items/materials/beast_sinew_spool.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Жильё зверя", fantasy harvest material — fibrous tendon coil stripped sinew filament spool cue, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 79. Ткань (`materials/cloth`)

- Candidate target: `art-candidates/items/materials/cloth.webp`
- Existing final file: `icons/items/materials/cloth.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Ткань", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 80. Уголь (`materials/coal`)

- Candidate target: `art-candidates/items/materials/coal.webp`
- Existing final file: `icons/items/materials/coal.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Уголь", a single practical fantasy mineral or workshop material, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 81. Медный слиток (`materials/copper_ingot`)

- Candidate target: `art-candidates/items/materials/copper_ingot.webp`
- Existing final file: `icons/items/materials/copper_ingot.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Медный слиток", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 82. Медная руда (`materials/copper_ore`)

- Candidate target: `art-candidates/items/materials/copper_ore.webp`
- Existing final file: `icons/items/materials/copper_ore.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Медная руда", a single chunk of raw fantasy ore with stone matrix and metallic veins, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 83. Осколок клыка (`materials/fang_shard`)

- Candidate target: `art-candidates/items/materials/fang_shard.webp`
- Existing final file: `icons/items/materials/fang_shard.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Осколок клыка", fantasy harvest material — splintered enamel ivory shard trophy tip, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, beast-lord pinnacle trophy hoard dense scales atmosphere, tier 9 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 84. Кремень (`materials/flint`)

- Candidate target: `art-candidates/items/materials/flint.webp`
- Existing final file: `icons/items/materials/flint.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Кремень", a single practical fantasy mineral or workshop material, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 85. Обычная трава (`materials/herb_common`)

- Candidate target: `art-candidates/items/materials/herb_common.webp`
- Existing final file: `icons/items/materials/herb_common.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Обычная трава", a gathered fantasy botanical reagent bundle, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 86. Целебный лист (`materials/herb_healing`)

- Candidate target: `art-candidates/items/materials/herb_healing.webp`
- Existing final file: `icons/items/materials/herb_healing.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Целебный лист", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 87. Болотный гриб (`materials/mushroom_bog`)

- Candidate target: `art-candidates/items/materials/mushroom_bog.webp`
- Existing final file: `icons/items/materials/mushroom_bog.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Болотный гриб", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 88. Масло (фляга) (`materials/oil_flask`)

- Candidate target: `art-candidates/items/materials/oil_flask.webp`
- Existing final file: `icons/items/materials/oil_flask.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Масло (фляга)", a fantasy alchemical reagent vial, sealed pouch or organic harvest component, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 89. Сосновая доска (`materials/pine_wood`)

- Candidate target: `art-candidates/items/materials/pine_wood.webp`
- Existing final file: `icons/items/materials/pine_wood.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Сосновая доска", a bundle of fantasy timber, carved root, plank or rare wood sample, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 90. Сырое волокно (`materials/raw_fiber`)

- Candidate target: `art-candidates/items/materials/raw_fiber.webp`
- Existing final file: `icons/items/materials/raw_fiber.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Сырое волокно", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 91. Верёвка (`materials/rope`)

- Candidate target: `art-candidates/items/materials/rope.webp`
- Existing final file: `icons/items/materials/rope.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Верёвка", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 92. Небольшая шкура (сырая) (`materials/small_pelt_uncured`)

- Candidate target: `art-candidates/items/materials/small_pelt_uncured.webp`
- Existing final file: `icons/items/materials/small_pelt_uncured.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Небольшая шкура (сырая)", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 93. Камень (`materials/stone`)

- Candidate target: `art-candidates/items/materials/stone.webp`
- Existing final file: `icons/items/materials/stone.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Камень", a single fantasy gem, crystal shard or mineral specimen with readable facets, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 94. Выделанная кожа (`materials/tanned_leather`)

- Candidate target: `art-candidates/items/materials/tanned_leather.webp`
- Existing final file: `icons/items/materials/tanned_leather.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Выделанная кожа", a folded fantasy hide, pelt, scale sheet or cured leather crafting material, common raw low-tier reagent, rough practical gathering quality, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 95. Пыльца ночных мотыльков (`materials/wisp_moth_powder`)

- Candidate target: `art-candidates/items/materials/wisp_moth_powder.webp`
- Existing final file: `icons/items/materials/wisp_moth_powder.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Пыльца ночных мотыльков", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 96. Киль птицеящера (`materials/avian_keel_bone`)

- Candidate target: `art-candidates/items/materials/avian_keel_bone.webp`
- Existing final file: `icons/items/materials/avian_keel_bone.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Киль птицеящера", fantasy harvest material — lightweight beast bone keel ridge marrow hollow, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

## materials-replacement-02

### 97. Кольца из щетины кабана (`materials/bristle_keg_rings`)

- Candidate target: `art-candidates/items/materials/bristle_keg_rings.webp`
- Existing final file: `icons/items/materials/bristle_keg_rings.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Кольца из щетины кабана", fantasy harvest material — bristle rings bundled hog trophy craft rings, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 98. Бронзовый слиток (`materials/bronze_ingot`)

- Candidate target: `art-candidates/items/materials/bronze_ingot.webp`
- Existing final file: `icons/items/materials/bronze_ingot.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Бронзовый слиток", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 99. Тонкая ткань (`materials/fine_cloth`)

- Candidate target: `art-candidates/items/materials/fine_cloth.webp`
- Existing final file: `icons/items/materials/fine_cloth.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Тонкая ткань", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 100. Кузнечный кокс (`materials/forge_coal`)

- Candidate target: `art-candidates/items/materials/forge_coal.webp`
- Existing final file: `icons/items/materials/forge_coal.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Кузнечный кокс", a single practical fantasy mineral or workshop material, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 101. Стекло (`materials/glass`)

- Candidate target: `art-candidates/items/materials/glass.webp`
- Existing final file: `icons/items/materials/glass.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Стекло", a single practical fantasy mineral or workshop material, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 102. Гранит (`materials/granite`)

- Candidate target: `art-candidates/items/materials/granite.webp`
- Existing final file: `icons/items/materials/granite.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Гранит", a single practical fantasy mineral or workshop material, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 103. Дубовая доска (`materials/oak_wood`)

- Candidate target: `art-candidates/items/materials/oak_wood.webp`
- Existing final file: `icons/items/materials/oak_wood.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Дубовая доска", a bundle of fantasy timber, carved root, plank or rare wood sample, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 104. Ядовитый клык (`materials/poison_fang`)

- Candidate target: `art-candidates/items/materials/poison_fang.webp`
- Existing final file: `icons/items/materials/poison_fang.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Ядовитый клык", a fantasy monster trophy material or preserved anatomical crafting component, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 105. Кварц (`materials/quartz`)

- Candidate target: `art-candidates/items/materials/quartz.webp`
- Existing final file: `icons/items/materials/quartz.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Кварц", a single fantasy gem, crystal shard or mineral specimen with readable facets, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 106. Горький корень (`materials/root_bitter`)

- Candidate target: `art-candidates/items/materials/root_bitter.webp`
- Existing final file: `icons/items/materials/root_bitter.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Горький корень", a bundle of fantasy timber, carved root, plank or rare wood sample, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 107. Слабая змеиная желчь (`materials/serpent_sac_mild`)

- Candidate target: `art-candidates/items/materials/serpent_sac_mild.webp`
- Existing final file: `icons/items/materials/serpent_sac_mild.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Слабая змеиная желчь", fantasy harvest material — visceral sac bulb stoppered wax cord alchemical, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 108. Толстая шкура (`materials/thick_hide`)

- Candidate target: `art-candidates/items/materials/thick_hide.webp`
- Existing final file: `icons/items/materials/thick_hide.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Толстая шкура", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 109. Оловянная руда (`materials/tin_ore`)

- Candidate target: `art-candidates/items/materials/tin_ore.webp`
- Existing final file: `icons/items/materials/tin_ore.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Оловянная руда", a single chunk of raw fantasy ore with stone matrix and metallic veins, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 110. Железа вожака (`materials/alpha_musk_gland`)

- Candidate target: `art-candidates/items/materials/alpha_musk_gland.webp`
- Existing final file: `icons/items/materials/alpha_musk_gland.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Железа вожака", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 111. Лунный цветок (`materials/flower_moon`)

- Candidate target: `art-candidates/items/materials/flower_moon.webp`
- Existing final file: `icons/items/materials/flower_moon.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Лунный цветок", a gathered fantasy botanical reagent bundle, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 112. Твёрдая древесина (`materials/hardwood`)

- Candidate target: `art-candidates/items/materials/hardwood.webp`
- Existing final file: `icons/items/materials/hardwood.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Твёрдая древесина", a bundle of fantasy timber, carved root, plank or rare wood sample, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 113. Железный слиток (`materials/iron_ingot`)

- Candidate target: `art-candidates/items/materials/iron_ingot.webp`
- Existing final file: `icons/items/materials/iron_ingot.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Железный слиток", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 114. Железная руда (`materials/iron_ore`)

- Candidate target: `art-candidates/items/materials/iron_ore.webp`
- Existing final file: `icons/items/materials/iron_ore.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Железная руда", a single chunk of raw fantasy ore with stone matrix and metallic veins, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 115. Мана-камень (`materials/mana_stone`)

- Candidate target: `art-candidates/items/materials/mana_stone.webp`
- Existing final file: `icons/items/materials/mana_stone.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Мана-камень", a single fantasy gem, crystal shard or mineral specimen with readable facets, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 116. Железа монстра (`materials/monster_gland`)

- Candidate target: `art-candidates/items/materials/monster_gland.webp`
- Existing final file: `icons/items/materials/monster_gland.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Железа монстра", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

## materials-replacement-03

### 117. Обсидиан (`materials/obsidian`)

- Candidate target: `art-candidates/items/materials/obsidian.webp`
- Existing final file: `icons/items/materials/obsidian.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Обсидиан", a single fantasy gem, crystal shard or mineral specimen with readable facets, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 118. Чешуйчатая шкура (`materials/scale_hide`)

- Candidate target: `art-candidates/items/materials/scale_hide.webp`
- Existing final file: `icons/items/materials/scale_hide.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Чешуйчатая шкура", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 119. Шёлк (`materials/silk`)

- Candidate target: `art-candidates/items/materials/silk.webp`
- Existing final file: `icons/items/materials/silk.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Шёлк", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, workshop-grade prepared material, cleaned and usable, modest fantasy craft, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 120. Чешуя дрейка (`materials/drake_scale`)

- Candidate target: `art-candidates/items/materials/drake_scale.webp`
- Existing final file: `icons/items/materials/drake_scale.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Чешуя дрейка", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 121. Пыль зачарования (`materials/enchant_dust`)

- Candidate target: `art-candidates/items/materials/enchant_dust.webp`
- Existing final file: `icons/items/materials/enchant_dust.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Пыль зачарования", a fantasy alchemical reagent vial, sealed pouch or organic harvest component, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 122. Железное дерево (`materials/ironwood`)

- Candidate target: `art-candidates/items/materials/ironwood.webp`
- Existing final file: `icons/items/materials/ironwood.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Железное дерево", a bundle of fantasy timber, carved root, plank or rare wood sample, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 123. Смоляная пробка хищника (`materials/predator_resin_mass`)

- Candidate target: `art-candidates/items/materials/predator_resin_mass.webp`
- Existing final file: `icons/items/materials/predator_resin_mass.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Смоляная пробка хищника", fantasy harvest material — dark amber resin plug predator gum cluster, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 124. Рубин (`materials/ruby`)

- Candidate target: `art-candidates/items/materials/ruby.webp`
- Existing final file: `icons/items/materials/ruby.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Рубин", a single fantasy gem, crystal shard or mineral specimen with readable facets, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 125. Паучий шёлк (`materials/spider_silk`)

- Candidate target: `art-candidates/items/materials/spider_silk.webp`
- Existing final file: `icons/items/materials/spider_silk.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Паучий шёлк", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 126. Стальной слиток (`materials/steel_ingot`)

- Candidate target: `art-candidates/items/materials/steel_ingot.webp`
- Existing final file: `icons/items/materials/steel_ingot.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Стальной слиток", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 127. Мешок с ядом (`materials/venom_sac`)

- Candidate target: `art-candidates/items/materials/venom_sac.webp`
- Existing final file: `icons/items/materials/venom_sac.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Мешок с ядом", fantasy harvest material — visceral sac bulb stoppered wax cord alchemical, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, beast-lord apex resin reservoirs armored slabs atmosphere, tier 8 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 128. Жилье виверны (`materials/wyvern_sinew_filament`)

- Candidate target: `art-candidates/items/materials/wyvern_sinew_filament.webp`
- Existing final file: `icons/items/materials/wyvern_sinew_filament.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Жилье виверны", fantasy harvest material — fibrous tendon coil stripped sinew filament spool cue, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, wyvern drake trophy scales sinew resin elite quarry atmosphere, tier 4 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 129. Мастерская смола (`materials/artisans_resin`)

- Candidate target: `art-candidates/items/materials/artisans_resin.webp`
- Existing final file: `icons/items/materials/artisans_resin.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Мастерская смола", a fantasy alchemical reagent vial, sealed pouch or organic harvest component, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 130. Кожа дрейка (`materials/drake_hide`)

- Candidate target: `art-candidates/items/materials/drake_hide.webp`
- Existing final file: `icons/items/materials/drake_hide.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Кожа дрейка", a folded fantasy hide, pelt, scale sheet or cured leather crafting material, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 131. Закалённая сталь (`materials/hardened_steel`)

- Candidate target: `art-candidates/items/materials/hardened_steel.webp`
- Existing final file: `icons/items/materials/hardened_steel.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Закалённая сталь", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 132. Мана-кристалл (`materials/mana_crystal`)

- Candidate target: `art-candidates/items/materials/mana_crystal.webp`
- Existing final file: `icons/items/materials/mana_crystal.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Мана-кристалл", a single fantasy gem, crystal shard or mineral specimen with readable facets, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 133. Лунное волокно (`materials/moonweave`)

- Candidate target: `art-candidates/items/materials/moonweave.webp`
- Existing final file: `icons/items/materials/moonweave.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Лунное волокно", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 134. Сапфир (`materials/sapphire`)

- Candidate target: `art-candidates/items/materials/sapphire.webp`
- Existing final file: `icons/items/materials/sapphire.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Сапфир", a single fantasy gem, crystal shard or mineral specimen with readable facets, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 135. Цветок духов (`materials/spirit_bloom`)

- Candidate target: `art-candidates/items/materials/spirit_bloom.webp`
- Existing final file: `icons/items/materials/spirit_bloom.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Цветок духов", a gathered fantasy botanical reagent bundle, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 136. Древесина духов (`materials/spirit_wood`)

- Candidate target: `art-candidates/items/materials/spirit_wood.webp`
- Existing final file: `icons/items/materials/spirit_wood.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Древесина духов", a bundle of fantasy timber, carved root, plank or rare wood sample, refined guild-quality material, polished details and clear readable texture, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

## materials-replacement-04

### 137. Алмаз (`materials/diamond`)

- Candidate target: `art-candidates/items/materials/diamond.webp`
- Existing final file: `icons/items/materials/diamond.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Алмаз", a single fantasy gem, crystal shard or mineral specimen with readable facets, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 138. Чёрное дерево (`materials/ebony`)

- Candidate target: `art-candidates/items/materials/ebony.webp`
- Existing final file: `icons/items/materials/ebony.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Чёрное дерево", a bundle of fantasy timber, carved root, plank or rare wood sample, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 139. Митрильный слиток (`materials/mithril_ingot`)

- Candidate target: `art-candidates/items/materials/mithril_ingot.webp`
- Existing final file: `icons/items/materials/mithril_ingot.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Митрильный слиток", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 140. Митрильная руда (`materials/mithril_ore`)

- Candidate target: `art-candidates/items/materials/mithril_ore.webp`
- Existing final file: `icons/items/materials/mithril_ore.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Митрильная руда", a single chunk of raw fantasy ore with stone matrix and metallic veins, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 141. Перо феникса (`materials/phoenix_feather`)

- Candidate target: `art-candidates/items/materials/phoenix_feather.webp`
- Existing final file: `icons/items/materials/phoenix_feather.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Перо феникса", a fantasy monster trophy material or preserved anatomical crafting component, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 142. Теневое волокно (`materials/shadowweave`)

- Candidate target: `art-candidates/items/materials/shadowweave.webp`
- Existing final file: `icons/items/materials/shadowweave.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Теневое волокно", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 143. Эссенция души (`materials/soul_essence`)

- Candidate target: `art-candidates/items/materials/soul_essence.webp`
- Existing final file: `icons/items/materials/soul_essence.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Эссенция души", a fantasy alchemical reagent vial, sealed pouch or organic harvest component, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 144. Шкура варга (`materials/warg_pelt`)

- Candidate target: `art-candidates/items/materials/warg_pelt.webp`
- Existing final file: `icons/items/materials/warg_pelt.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Шкура варга", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, beast-lord pinnacle trophy hoard dense scales atmosphere, tier 9 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 145. Тёмное железо (`materials/dark_iron`)

- Candidate target: `art-candidates/items/materials/dark_iron.webp`
- Existing final file: `icons/items/materials/dark_iron.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Тёмное железо", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 146. Тёмная руда (`materials/dark_iron_ore`)

- Candidate target: `art-candidates/items/materials/dark_iron_ore.webp`
- Existing final file: `icons/items/materials/dark_iron_ore.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Тёмная руда", a single chunk of raw fantasy ore with stone matrix and metallic veins, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 147. Вечное дерево (`materials/eternal_wood`)

- Candidate target: `art-candidates/items/materials/eternal_wood.webp`
- Existing final file: `icons/items/materials/eternal_wood.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Вечное дерево", a bundle of fantasy timber, carved root, plank or rare wood sample, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 148. Сердце великана (`materials/giant_heart`)

- Candidate target: `art-candidates/items/materials/giant_heart.webp`
- Existing final file: `icons/items/materials/giant_heart.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Сердце великана", a fantasy monster trophy material or preserved anatomical crafting component, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 149. Планарная скоба (`materials/planar_clip`)

- Candidate target: `art-candidates/items/materials/planar_clip.webp`
- Existing final file: `icons/items/materials/planar_clip.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Планарная скоба", a single fantasy crafting material with a specific readable silhouette, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 150. Звёздная нить (`materials/starthread`)

- Candidate target: `art-candidates/items/materials/starthread.webp`
- Existing final file: `icons/items/materials/starthread.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Звёздная нить", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 151. Кристалл Пустоты (`materials/void_crystal`)

- Candidate target: `art-candidates/items/materials/void_crystal.webp`
- Existing final file: `icons/items/materials/void_crystal.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Кристалл Пустоты", a single fantasy gem, crystal shard or mineral specimen with readable facets, rare magical reagent, subtle glow, valuable but grounded fantasy material, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 152. Шкура виверны (`materials/wyvern_hide`)

- Candidate target: `art-candidates/items/materials/wyvern_hide.webp`
- Existing final file: `icons/items/materials/wyvern_hide.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: docs/content/monster-loot-prompts.json

Prompt:
```
Concept "Шкура виверны", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, inventory composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

### 153. Жеода эона (`materials/aeon_geode`)

- Candidate target: `art-candidates/items/materials/aeon_geode.webp`
- Existing final file: `icons/items/materials/aeon_geode.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Жеода эона", a single fantasy gem, crystal shard or mineral specimen with readable facets, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 154. Моток арканной проволоки (`materials/arcane_mesh`)

- Candidate target: `art-candidates/items/materials/arcane_mesh.webp`
- Existing final file: `icons/items/materials/arcane_mesh.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Моток арканной проволоки", a folded fantasy hide, pelt, scale sheet or cured leather crafting material, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 155. Кровь дракона (`materials/dragon_blood`)

- Candidate target: `art-candidates/items/materials/dragon_blood.webp`
- Existing final file: `icons/items/materials/dragon_blood.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Кровь дракона", a fantasy alchemical reagent vial, sealed pouch or organic harvest component, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 156. Кожа дракона (`materials/dragon_hide`)

- Candidate target: `art-candidates/items/materials/dragon_hide.webp`
- Existing final file: `icons/items/materials/dragon_hide.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Кожа дракона", a folded fantasy hide, pelt, scale sheet or cured leather crafting material, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

## materials-replacement-05

### 157. Звёздный металл (`materials/starmetal`)

- Candidate target: `art-candidates/items/materials/starmetal.webp`
- Existing final file: `icons/items/materials/starmetal.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Звёздный металл", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 158. Звёздная руда (`materials/starmetal_ore`)

- Candidate target: `art-candidates/items/materials/starmetal_ore.webp`
- Existing final file: `icons/items/materials/starmetal_ore.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Звёздная руда", a single chunk of raw fantasy ore with stone matrix and metallic veins, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 159. Ткань Пустоты (`materials/void_weave`)

- Candidate target: `art-candidates/items/materials/void_weave.webp`
- Existing final file: `icons/items/materials/void_weave.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Ткань Пустоты", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 160. Мировое дерево (`materials/world_tree`)

- Candidate target: `art-candidates/items/materials/world_tree.webp`
- Existing final file: `icons/items/materials/world_tree.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Мировое дерево", a bundle of fantasy timber, carved root, plank or rare wood sample, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 161. Лишайник Бездны (`materials/abyss_lichen`)

- Candidate target: `art-candidates/items/materials/abyss_lichen.webp`
- Existing final file: `icons/items/materials/abyss_lichen.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Лишайник Бездны", a gathered fantasy botanical reagent bundle, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 162. Нить Авроры (`materials/aurora_thread`)

- Candidate target: `art-candidates/items/materials/aurora_thread.webp`
- Existing final file: `icons/items/materials/aurora_thread.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Нить Авроры", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 163. Шкура гидры (`materials/hydra_hide`)

- Candidate target: `art-candidates/items/materials/hydra_hide.webp`
- Existing final file: `icons/items/materials/hydra_hide.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Шкура гидры", a folded fantasy hide, pelt, scale sheet or cured leather crafting material, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 164. Орихалк (`materials/orichalcum`)

- Candidate target: `art-candidates/items/materials/orichalcum.webp`
- Existing final file: `icons/items/materials/orichalcum.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Орихалк", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 165. Осколок реликта (`materials/relic_shard`)

- Candidate target: `art-candidates/items/materials/relic_shard.webp`
- Existing final file: `icons/items/materials/relic_shard.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Осколок реликта", a single fantasy gem, crystal shard or mineral specimen with readable facets, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 166. Осколок звезды (`materials/star_shard`)

- Candidate target: `art-candidates/items/materials/star_shard.webp`
- Existing final file: `icons/items/materials/star_shard.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Осколок звезды", a single fantasy gem, crystal shard or mineral specimen with readable facets, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 167. Доска солнечного дуба (`materials/sun_oak_board`)

- Candidate target: `art-candidates/items/materials/sun_oak_board.webp`
- Existing final file: `icons/items/materials/sun_oak_board.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Доска солнечного дуба", a bundle of fantasy timber, carved root, plank or rare wood sample, legendary crafting material, ornate luminous accents, heroic rarity, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 168. Адамантий (`materials/adamantium`)

- Candidate target: `art-candidates/items/materials/adamantium.webp`
- Existing final file: `icons/items/materials/adamantium.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Адамантий", a single forged fantasy metal ingot or refined metal bar with stamped workshop marks, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 169. Семя эпохи (`materials/epoch_seed`)

- Candidate target: `art-candidates/items/materials/epoch_seed.webp`
- Existing final file: `icons/items/materials/epoch_seed.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Семя эпохи", a gathered fantasy botanical reagent bundle, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 170. Брус генезиса (`materials/genesis_timber`)

- Candidate target: `art-candidates/items/materials/genesis_timber.webp`
- Existing final file: `icons/items/materials/genesis_timber.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Брус генезиса", a bundle of fantasy timber, carved root, plank or rare wood sample, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 171. Полотно генезиса (`materials/genesis_weave`)

- Candidate target: `art-candidates/items/materials/genesis_weave.webp`
- Existing final file: `icons/items/materials/genesis_weave.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Полотно генезиса", a coiled fantasy textile material, thread spool, fabric fold or rope bundle, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 172. Слёзы богов (`materials/god_tears`)

- Candidate target: `art-candidates/items/materials/god_tears.webp`
- Existing final file: `icons/items/materials/god_tears.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Слёзы богов", a fantasy alchemical reagent vial, sealed pouch or organic harvest component, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 173. Шкура Левиафана (`materials/leviathan_hide`)

- Candidate target: `art-candidates/items/materials/leviathan_hide.webp`
- Existing final file: `icons/items/materials/leviathan_hide.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Шкура Левиафана", a folded fantasy hide, pelt, scale sheet or cured leather crafting material, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```

### 174. Сердце звезды (`materials/star_heart`)

- Candidate target: `art-candidates/items/materials/star_heart.webp`
- Existing final file: `icons/items/materials/star_heart.webp`
- Grid: 1x1, 1:1, 1024x1024
- Reasons: untracked-development-placeholder, deterministic-baseline-category
- Prompt source: fallback

Prompt:
```
Concept "Сердце звезды", a fantasy monster trophy material or preserved anatomical crafting component, mythic impossible reagent, restrained reality-bending aura, artifact-grade presence, centered inventory composition, single isolated fantasy RPG inventory icon, centered, full object visible, plain dark or transparent background, sharp painterly detail, Use case: stylized-concept. Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate. Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic. Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background. Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve 1x1 grid footprint, 1:1, 1024x1024. Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art. Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.
```

Negative:
```
text, watermark, logo, signature, blurry, low quality, cluttered background, multiple unrelated objects, human hands, human face, nsfw
```
