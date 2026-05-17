# Iron Hills — AI-промпты: монстры (бестиарий)

> Автогенерация из `MONSTER_BESTIARY` — перегенерация после правок ростеровой таблицы:
> `node tools/generate-creature-prompts.mjs`

**Правила использования:**
- Aspect ratio по умолчанию **--ar 1:1**, **1024×1024** под токен (как в блоке промпта).
- Готовые токены клади в `systems/iron-hills-system/icons/tokens/monsters/{id}.webp` — замени `{id}` на ключ из заголовка (например `fen_slitherer.webp`); путь пропиши в листе актёра/compendium или через GM.
- Каждый монстр компендиума **ih-monsters** соответствует одному блоку ниже (**полнота ключей проверяется при генерации**).
- **Иконки добычи с туши** (сырое мясо, железы, шкуры и т.д.): `node tools/generate-monster-loot-prompts.mjs` → `docs/content/monster-loot-prompts.md`.

**Negative prompt (один на все):**
```
text, watermark, logo, signature, blurry, low quality, multiple objects, hands, swarm, collage, crowded scene, person, playable character, HUD, perspective distortion, cluttered background, horizontal layout, sideways, nsfw
```


## Тир 1

### Гнильный рой‑клещ *(`ash_rot_mites`, AR 1:1 1024×1024, пул добычи: `vermin_bundle_t1`)*

```
Concept of "Гнильный рой‑клещ", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Слизистый многоножковый рой из пепельных отвалов; мало мяса, годны для простых реагентов; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 1 encounter presence, grimy scavenger prey, soot and mud, campfire rim light, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `vermin_bundle_t1`):
- **Сырая дичь** (`game_meat_raw`, food) — ~70%, ×1–2
- **Пыльца ночных мотыльков** (`wisp_moth_powder`, material) — ~44%, ×1–1
- **Осколок клыка** (`fang_shard`, material) — ~36%, ×1–2
- **Жильё зверя** (`beast_sinew_spool`, material) — ~19%, ×1–1

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Крысиный вожак колючника *(`briar_rat_boss`, AR 1:1 1024×1024, пул добычи: `predator_scrap_t1`)*

```
Concept of "Крысиный вожак колючника", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Стаейный падальщик дорогих кустарников; шкура в грязи, но узнаваема; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 1 encounter presence, grimy scavenger prey, soot and mud, campfire rim light, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `predator_scrap_t1`):
- **Сырая дичь** (`game_meat_raw`, food) — ~64%, ×1–3
- **Небольшая шкура (сырая)** (`small_pelt_uncured`, material) — ~51%, ×1–1
- **Шкура зверя** (`animal_hide`, material) — ~36%, ×1–1
- **Жильё зверя** (`beast_sinew_spool`, material) — ~19%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Хламовый гончар *(`scrap_hound_runner`, AR 1:1 1024×1024, пул добычи: `predator_scrap_t1`)*

```
Concept of "Хламовый гончар", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Полудикая собака шахтёрских отвалов, чует руду по старому железу; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 1 encounter presence, grimy scavenger prey, soot and mud, campfire rim light, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `predator_scrap_t1`):
- **Сырая дичь** (`game_meat_raw`, food) — ~64%, ×1–3
- **Небольшая шкура (сырая)** (`small_pelt_uncured`, material) — ~51%, ×1–1
- **Шкура зверя** (`animal_hide`, material) — ~36%, ×1–1
- **Жильё зверя** (`beast_sinew_spool`, material) — ~19%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).


## Тир 2

### Рой шахтёрской мерзости *(`tunnel_fung_batch`, AR 1:1 1024×1024, пул добычи: `vermin_bundle_t1`)*

```
Concept of "Рой шахтёрской мерзости", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Сгусток гриба и камня живёт у малых узлов маны под шахтой; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 2 encounter presence, dangerous predator, damp atmosphere, moss and grit, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `vermin_bundle_t1`):
- **Сырая дичь** (`game_meat_raw`, food) — ~70%, ×1–2
- **Пыльца ночных мотыльков** (`wisp_moth_powder`, material) — ~44%, ×1–1
- **Осколок клыка** (`fang_shard`, material) — ~36%, ×1–2
- **Жильё зверя** (`beast_sinew_spool`, material) — ~19%, ×1–1

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Топкая змеень *(`fen_slitherer`, AR 1:1 1024×1024, пул добычи: `wetland_glean_t2`)*

```
Concept of "Топкая змеень", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Низкая змея топей; желчь слабеет на солнце; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 2 encounter presence, dangerous predator, damp atmosphere, moss and grit, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `wetland_glean_t2`):
- **Сырое филе змея** (`serpent_fillet_raw`, food) — ~58%, ×1–2
- **Плотная дичь** (`game_meat_rich`, food) — ~58%, ×1–2
- **Слабая змеиная желчь** (`serpent_sac_mild`, material) — ~33%, ×1–1
- **Болотный гриб** (`mushroom_bog`, material) — ~23%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Торфяной гремучник *(`peat_adder_pair`, AR 1:1 1024×1024, пул добычи: `wetland_glean_t2`)*

```
Concept of "Торфяной гремучник", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Пара охотничьего размера с ядовитыми узорами между чешуйками; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 2 encounter presence, dangerous predator, damp atmosphere, moss and grit, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `wetland_glean_t2`):
- **Сырое филе змея** (`serpent_fillet_raw`, food) — ~58%, ×1–2
- **Плотная дичь** (`game_meat_rich`, food) — ~58%, ×1–2
- **Слабая змеиная желчь** (`serpent_sac_mild`, material) — ~33%, ×1–1
- **Болотный гриб** (`mushroom_bog`, material) — ~23%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).


## Тир 3

### Болотный вожак‑волк *(`marsh_beta_wolf`, AR 1:1 1024×1024, пул добычи: `pack_leader_t3`)*

```
Concept of "Болотный вожак‑волк", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Вожак стаи; железы сильнее обычного дичка; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 3 encounter presence, alpha beast, sharper details, dusk tension, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `pack_leader_t3`):
- **Плотная дичь** (`game_meat_rich`, food) — ~83%, ×2–4
- **Железа вожака** (`alpha_musk_gland`, material) — ~66%, ×1–1
- **Чешуйчатая шкура** (`scale_hide`, material) — ~39%, ×1–2
- **Железа монстра** (`monster_gland`, material) — ~27%, ×1–1

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Корнеед‑медвежий *(`root_gnaw_bear`, AR 1:1 1024×1024, пул добычи: `brute_carve_t2`)*

```
Concept of "Корнеед‑медвежий", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Пухлый падальщик меж корней; шкуры грубы, но питательны; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 3 encounter presence, alpha beast, sharper details, dusk tension, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `brute_carve_t2`):
- **Плотная дичь** (`game_meat_rich`, food) — ~64%, ×2–3
- **Толстая шкура** (`thick_hide`, material) — ~48%, ×1–2
- **Кольца из щетины кабана** (`bristle_keg_rings`, material) — ~39%, ×1–1
- **Осколок клыка** (`fang_shard`, material) — ~19%, ×2–3

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Полевой длиннозуб *(`glade_longtooth`, AR 1:1 1024×1024, пул добычи: `pack_leader_t3`)*

```
Concept of "Полевой длиннозуб", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Прыгуны лесных полян; охотники ценят сухожилия; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 3 encounter presence, alpha beast, sharper details, dusk tension, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `pack_leader_t3`):
- **Плотная дичь** (`game_meat_rich`, food) — ~83%, ×2–4
- **Железа вожака** (`alpha_musk_gland`, material) — ~66%, ×1–1
- **Чешуйчатая шкура** (`scale_hide`, material) — ~39%, ×1–2
- **Железа монстра** (`monster_gland`, material) — ~27%, ×1–1

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).


## Тир 4

### Виверн‑птенец *(`wyvern_fledgling`, AR 1:1 1024×1024, пул добычи: `apex_slice_t4`)*

```
Concept of "Виверн‑птенец", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Молодые крылатые падальщики; чешуя пока нежнее взрослой; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 4 encounter presence, monster trophy beast, heroic scale creep, colder highlights, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `apex_slice_t4`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~80%, ×1–3
- **Жилье виверны** (`wyvern_sinew_filament`, material) — ~58%, ×1–1
- **Смоляная пробка хищника** (`predator_resin_mass`, material) — ~45%, ×1–1
- **Чешуя дрейка** (`drake_scale`, material) — ~39%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Поросль шипастого тролля *(`briar_troll_bud`, AR 1:1 1024×1024, пул добычи: `apex_slice_t4`)*

```
Concept of "Поросль шипастого тролля", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Косолапый юнец большого рода троллей из колючих зарослей; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 4 encounter presence, monster trophy beast, heroic scale creep, colder highlights, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `apex_slice_t4`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~80%, ×1–3
- **Жилье виверны** (`wyvern_sinew_filament`, material) — ~58%, ×1–1
- **Смоляная пробка хищника** (`predator_resin_mass`, material) — ~45%, ×1–1
- **Чешуя дрейка** (`drake_scale`, material) — ~39%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Стая ржавых клыков *(`rustfang_worg_band`, AR 1:1 1024×1024, пул добычи: `apex_slice_t4`)*

```
Concept of "Стая ржавых клыков", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Собачьи загоны рудников; шерсть густая, с железными вкраплениями; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 4 encounter presence, monster trophy beast, heroic scale creep, colder highlights, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `apex_slice_t4`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~80%, ×1–3
- **Жилье виверны** (`wyvern_sinew_filament`, material) — ~58%, ×1–1
- **Смоляная пробка хищника** (`predator_resin_mass`, material) — ~45%, ×1–1
- **Чешуя дрейка** (`drake_scale`, material) — ~39%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).


## Тир 5

### Каменный подкрад ущелья *(`gorge_stone_lurker`, AR 1:1 1024×1024, пул добычи: `brute_prize_t5`)*

```
Concept of "Каменный подкрад ущелья", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Сшит из обломков и смолы русла — тяжёлый каменный хищник; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 5 encounter presence, eldritch predator, unnatural growths, ominous backlight, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `brute_prize_t5`):
- **Ужин караванщика** (`caravan_roast`, food) — ~78%, ×1–1
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~73%, ×2–4
- **Чешуя дрейка** (`drake_scale`, material) — ~58%, ×2–4

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Порождение речной пасти *(`river_maw_spawn`, AR 1:1 1024×1024, пул добычи: `brute_prize_t5`)*

```
Concept of "Порождение речной пасти", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Слякотный хищник фарватеров и промоин; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 5 encounter presence, eldritch predator, unnatural growths, ominous backlight, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `brute_prize_t5`):
- **Ужин караванщика** (`caravan_roast`, food) — ~78%, ×1–1
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~73%, ×2–4
- **Чешуя дрейка** (`drake_scale`, material) — ~58%, ×2–4

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Старый браменный часовой *(`elder_thorn_sentinel`, AR 1:1 1024×1024, пул добычи: `brute_prize_t5`)*

```
Concept of "Старый браменный часовой", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Полурастение‑хранитель торфов и грибных коридоров; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 5 encounter presence, eldritch predator, unnatural growths, ominous backlight, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `brute_prize_t5`):
- **Ужин караванщика** (`caravan_roast`, food) — ~78%, ×1–1
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~73%, ×2–4
- **Чешуя дрейка** (`drake_scale`, material) — ~58%, ×2–4

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).


## Тир 6

### Гребнеспинная виверна *(`ridge_wyvern`, AR 1:1 1024×1024, пул добычи: `kaiju_shard_t6`)*

```
Concept of "Гребнеспинная виверна", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Взрослая охотница среди кряжей и утёсов; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 6 encounter presence, apex kaiju-lite fantasy monster, heroic presence, cinematic contrast, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `kaiju_shard_t6`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~82%, ×3–5
- **Шкура варга** (`warg_pelt`, material) — ~76%, ×1–2
- **Шкура виверны** (`wyvern_hide`, material) — ~59%, ×1–1
- **Мешок с ядом** (`venom_sac`, material) — ~48%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Железношёрстный таран *(`ironhide_ram`, AR 1:1 1024×1024, пул добычи: `kaiju_shard_t6`)*

```
Concept of "Железношёрстный таран", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Наросты руды по хребту — топор нужен основательнее; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 6 encounter presence, apex kaiju-lite fantasy monster, heroic presence, cinematic contrast, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `kaiju_shard_t6`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~82%, ×3–5
- **Шкура варга** (`warg_pelt`, material) — ~76%, ×1–2
- **Шкура виверны** (`wyvern_hide`, material) — ~59%, ×1–1
- **Мешок с ядом** (`venom_sac`, material) — ~48%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Обсидиановый шквал‑жук *(`obsidian_skerry_swarm`, AR 1:1 1024×1024, пул добычи: `kaiju_shard_t6`)*

```
Concept of "Обсидиановый шквал‑жук", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Самосветящийся летающий рой — жало греется до раскала; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 6 encounter presence, apex kaiju-lite fantasy monster, heroic presence, cinematic contrast, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `kaiju_shard_t6`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~82%, ×3–5
- **Шкура варга** (`warg_pelt`, material) — ~76%, ×1–2
- **Шкура виверны** (`wyvern_hide`, material) — ~59%, ×1–1
- **Мешок с ядом** (`venom_sac`, material) — ~48%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).


## Тир 7

### Костяная тварь ямы *(`pitbone_horror`, AR 1:1 1024×1024, пул добычи: `beast_lord_t7`)*

```
Concept of "Костяная тварь ямы", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Скопище черепов и сухожилий, шевелящееся разом как одно; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 7 encounter presence, ominous, brooding, menacing presence, evil-looking, deep purple rim light wisps, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `beast_lord_t7`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~85%, ×4–6
- **Шкура виверны** (`wyvern_hide`, material) — ~81%, ×1–2
- **Чешуя дрейка** (`drake_scale`, material) — ~71%, ×2–4
- **Мешок с ядом** (`venom_sac`, material) — ~47%, ×1–2
- **Железа монстра** (`monster_gland`, material) — ~27%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Пепельный гигант‑личинка *(`ash_ember_larva_colossus`, AR 1:1 1024×1024, пул добычи: `beast_lord_t7`)*

```
Concept of "Пепельный гигант‑личинка", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Ползущий жар между шлаковыми кучами; шкура курится сама собой; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 7 encounter presence, ominous, brooding, menacing presence, evil-looking, deep purple rim light wisps, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `beast_lord_t7`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~85%, ×4–6
- **Шкура виверны** (`wyvern_hide`, material) — ~81%, ×1–2
- **Чешуя дрейка** (`drake_scale`, material) — ~71%, ×2–4
- **Мешок с ядом** (`venom_sac`, material) — ~47%, ×1–2
- **Железа монстра** (`monster_gland`, material) — ~27%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Тенегриф утёсов *(`cliffshade_griffon`, AR 1:1 1024×1024, пул добычи: `beast_lord_t7`)*

```
Concept of "Тенегриф утёсов", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Когти царапают камень; тень от крыла режет вертикаль скалы; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 7 encounter presence, ominous, brooding, menacing presence, evil-looking, deep purple rim light wisps, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `beast_lord_t7`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~85%, ×4–6
- **Шкура виверны** (`wyvern_hide`, material) — ~81%, ×1–2
- **Чешуя дрейка** (`drake_scale`, material) — ~71%, ×2–4
- **Мешок с ядом** (`venom_sac`, material) — ~47%, ×1–2
- **Железа монстра** (`monster_gland`, material) — ~27%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).


## Тир 8

### Базальтовый странник ущелья *(`ravine_basalt_walker`, AR 1:1 1024×1024, пул добычи: `beast_lord_t8`)*

```
Concept of "Базальтовый странник ущелья", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Ступени из плит, срастаются с утёсом при каждом шаге; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 8 encounter presence, celestial aberration undertone, otherworldly predator, cosmic blue violet glow hints, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `beast_lord_t8`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~81%, ×5–8
- **Шкура виверны** (`wyvern_hide`, material) — ~81%, ×1–2
- **Чешуя дрейка** (`drake_scale`, material) — ~75%, ×3–5
- **Смоляная пробка хищника** (`predator_resin_mass`, material) — ~53%, ×1–2
- **Мешок с ядом** (`venom_sac`, material) — ~27%, ×2–4

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Буреломный идол‑голем *(`stormbreak_idol_golem`, AR 1:1 1024×1024, пул добычи: `beast_lord_t8`)*

```
Concept of "Буреломный идол‑голем", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Статуя времен старых шахт‑святынь, пробуждена бурей; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 8 encounter presence, celestial aberration undertone, otherworldly predator, cosmic blue violet glow hints, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `beast_lord_t8`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~81%, ×5–8
- **Шкура виверны** (`wyvern_hide`, material) — ~81%, ×1–2
- **Чешуя дрейка** (`drake_scale`, material) — ~75%, ×3–5
- **Смоляная пробка хищника** (`predator_resin_mass`, material) — ~53%, ×1–2
- **Мешок с ядом** (`venom_sac`, material) — ~27%, ×2–4

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Морозный великоволк *(`frostgrave_direwolf`, AR 1:1 1024×1024, пул добычи: `beast_lord_t8`)*

```
Concept of "Морозный великоволк", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Низкий вой обмерзших туманностей по ночному полю; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 8 encounter presence, celestial aberration undertone, otherworldly predator, cosmic blue violet glow hints, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `beast_lord_t8`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~81%, ×5–8
- **Шкура виверны** (`wyvern_hide`, material) — ~81%, ×1–2
- **Чешуя дрейка** (`drake_scale`, material) — ~75%, ×3–5
- **Смоляная пробка хищника** (`predator_resin_mass`, material) — ~53%, ×1–2
- **Мешок с ядом** (`venom_sac`, material) — ~27%, ×2–4

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).


## Тир 9

### Звёздношёрстный медведь *(`starfur_ursine`, AR 1:1 1024×1024, пул добычи: `beast_lord_t9`)*

```
Concept of "Звёздношёрстный медведь", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Свет точек на шкурном полотне кружится после заката; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 9 encounter presence, legendary apex beast, ornate trophy hunter quarry, golden rim accents, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `beast_lord_t9`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~84%, ×6–10
- **Шкура варга** (`warg_pelt`, material) — ~84%, ×2–3
- **Шкура виверны** (`wyvern_hide`, material) — ~77%, ×2–3
- **Железа монстра** (`monster_gland`, material) — ~60%, ×1–2
- **Осколок клыка** (`fang_shard`, material) — ~39%, ×6–10
- **Железа вожака** (`alpha_musk_gland`, material) — ~22%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Краевой надсмотрщик‑змеедракон *(`cauldr_edge_drakebond`, AR 1:1 1024×1024, пул добычи: `beast_lord_t9`)*

```
Concept of "Краевой надсмотрщик‑змеедракон", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Хранит стык жаровни и рудного пласта; дыхание жжёт шлак; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 9 encounter presence, legendary apex beast, ornate trophy hunter quarry, golden rim accents, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `beast_lord_t9`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~84%, ×6–10
- **Шкура варга** (`warg_pelt`, material) — ~84%, ×2–3
- **Шкура виверны** (`wyvern_hide`, material) — ~77%, ×2–3
- **Железа монстра** (`monster_gland`, material) — ~60%, ×1–2
- **Осколок клыка** (`fang_shard`, material) — ~39%, ×6–10
- **Железа вожака** (`alpha_musk_gland`, material) — ~22%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Скверноконный рыцарь‑зрак *(`phantom_knight_mount`, AR 1:1 1024×1024, пул добычи: `beast_lord_t9`)*

```
Concept of "Скверноконный рыцарь‑зрак", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Слипшийся образ коня и костей в дымчатой бронепластине; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 9 encounter presence, legendary apex beast, ornate trophy hunter quarry, golden rim accents, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `beast_lord_t9`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~84%, ×6–10
- **Шкура варга** (`warg_pelt`, material) — ~84%, ×2–3
- **Шкура виверны** (`wyvern_hide`, material) — ~77%, ×2–3
- **Железа монстра** (`monster_gland`, material) — ~60%, ×1–2
- **Осколок клыка** (`fang_shard`, material) — ~39%, ×6–10
- **Железа вожака** (`alpha_musk_gland`, material) — ~22%, ×1–2

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).


## Тир 10

### Змей мирового остова *(`worldspine_serpent`, AR 1:1 1024×1024, пул добычи: `primordial_harvest_t10`)*

```
Concept of "Змей мирового остова", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Длина затмевает хребет; чешуйка как кровати настила; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 10 encounter presence, primordial colossus, mythical kaiju silhouette, cracks of inner light leaking, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `primordial_harvest_t10`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~81%, ×8–12
- **Шкура виверны** (`wyvern_hide`, material) — ~77%, ×3–4
- **Чешуя дрейка** (`drake_scale`, material) — ~74%, ×4–7
- **Смоляная пробка хищника** (`predator_resin_mass`, material) — ~65%, ×2–3
- **Железа монстра** (`monster_gland`, material) — ~60%, ×2–4
- **Железа вожака** (`alpha_musk_gland`, material) — ~22%, ×2–3

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Колосс Пепельного хребта *(`ashridge_colossus`, AR 1:1 1024×1024, пул добычи: `primordial_harvest_t10`)*

```
Concept of "Колосс Пепельного хребта", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Горячий титан между заводями шлака и старыми печами; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 10 encounter presence, primordial colossus, mythical kaiju silhouette, cracks of inner light leaking, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `primordial_harvest_t10`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~81%, ×8–12
- **Шкура виверны** (`wyvern_hide`, material) — ~77%, ×3–4
- **Чешуя дрейка** (`drake_scale`, material) — ~74%, ×4–7
- **Смоляная пробка хищника** (`predator_resin_mass`, material) — ~65%, ×2–3
- **Железа монстра** (`monster_gland`, material) — ~60%, ×2–4
- **Железа вожака** (`alpha_musk_gland`, material) — ~22%, ×2–3

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

### Пожиратель рудных жил *(`vein_gullet_leviathan`, AR 1:1 1024×1024, пул добычи: `primordial_harvest_t10`)*

```
Concept of "Пожиратель рудных жил", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; Рот как штрек; глушит залежи голым жаром и голодом; isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus, tier 10 encounter presence, primordial colossus, mythical kaiju silhouette, cracks of inner light leaking, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1
```

**Добыча с туши** (пул `primordial_harvest_t10`):
- **Нарезка с виверны** (`wyvern_stringy_cut`, food) — ~81%, ×8–12
- **Шкура виверны** (`wyvern_hide`, material) — ~77%, ×3–4
- **Чешуя дрейка** (`drake_scale`, material) — ~74%, ×4–7
- **Смоляная пробка хищника** (`predator_resin_mass`, material) — ~65%, ×2–3
- **Железа монстра** (`monster_gland`, material) — ~60%, ×2–4
- **Железа вожака** (`alpha_musk_gland`, material) — ~22%, ×2–3

*Промпты иконок дропа:* `docs/content/monster-loot-prompts.md` (уникальные + по пулам).

