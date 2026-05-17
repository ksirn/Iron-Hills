# Iron Hills — AI-промпты: NPC (специализации × диапазон тира)

> Автогенерация из `NPC_SPECIALIZATIONS` + три диапазона (`t1_3`, `t4_6`, `t7_10`): `node tools/generate-creature-prompts.mjs`
>
> Выбери блок по **специализации** и по **ступени из генератора** (1–3 беднее, 7–10 богаче/элитнее). Один промпт не обязан на каждый из десяти тиров — ступени внутри диапазона можно уточнять текстом («чуть голодает», «после удачного года»).

**Правила использования:**
- **1:1**, **1024×1024** — см. промпт.
- Имя файла токена: `icons/tokens/npc/{ключ}_{диапазон}.webp`, например `villager_t4_6.webp`, `bandit_t7_10.webp`.

**Negative prompt (один на все):**
```
text, watermark, logo, signature, blurry, low quality, multiple objects, hands, swarm, collage, crowded scene, person, playable character, HUD, perspective distortion, cluttered background, horizontal layout, sideways, nsfw
```

## Бандит (`bandit`)

### Беднее / простой люд (генератор × тир 1–3)
*prompt id:* `bandit_t1_3` · *tiers:* 1–3

```
Concept of "Бандит" (низкая ступень (× тир 1–3)), one humanoid npc portrait for Iron Hills VTT — Разбойник троп и окраин; нож, метательное, грубая куртка; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: rag-wrapped outlaw desperate knife mud-caked cloak fear and starvation in eyes forest mud; use Iron Hills generator tiers 1–3 for exact skill gear power; mood anchor (skilled artisan or fighter, sharper gear hints, dusty daylight), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Середина / умелые (генератор × тир 4–6)
*prompt id:* `bandit_t4_6` · *tiers:* 4–6

```
Concept of "Бандит" (средняя ступень (× тир 4–6)), one humanoid npc portrait for Iron Hills VTT — Разбойник троп и окраин; нож, метательное, грубая куртка; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: organized leather armor matched throwing knives swagger road predator trophies; use Iron Hills generator tiers 4–6 for exact skill gear power; mood anchor (veteran bearing, understated steel and scars), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Зажиточнее / статус и элита (генератор × тир 7–10)
*prompt id:* `bandit_t7_10` · *tiers:* 7–10

```
Concept of "Бандит" (высокая ступень (× тир 7–10)), one humanoid npc portrait for Iron Hills VTT — Разбойник троп и окраин; нож, метательное, грубая куртка; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: guilded highway captain ornate belt silk under leather mercenary finesse ruthless poise; use Iron Hills generator tiers 7–10 for exact skill gear power; mood anchor (high delegate, controlled opulence), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

## Ремесленник (`crafter`)

### Беднее / простой люд (генератор × тир 1–3)
*prompt id:* `crafter_t1_3` · *tiers:* 1–3

```
Concept of "Ремесленник" (низкая ступень (× тир 1–3)), one humanoid npc portrait for Iron Hills VTT — Кузнец, кожевник или плотник — мастерская и инструмент; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: singed apron borrowed hammer calloused raw knuckles shared workshop grime apprentice poverty; use Iron Hills generator tiers 1–3 for exact skill gear power; mood anchor (skilled artisan or fighter, sharper gear hints, dusty daylight), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Середина / умелые (генератор × тир 4–6)
*prompt id:* `crafter_t4_6` · *tiers:* 4–6

```
Concept of "Ремесленник" (средняя ступень (× тир 4–6)), one humanoid npc portrait for Iron Hills VTT — Кузнец, кожевник или плотник — мастерская и инструмент; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: own apron tools belt metal polish smell controlled burns master-signed leather brace; use Iron Hills generator tiers 4–6 for exact skill gear power; mood anchor (veteran bearing, understated steel and scars), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Зажиточнее / статус и элита (генератор × тир 7–10)
*prompt id:* `crafter_t7_10` · *tiers:* 7–10

```
Concept of "Ремесленник" (высокая ступень (× тир 7–10)), one humanoid npc portrait for Iron Hills VTT — Кузнец, кожевник или плотник — мастерская и инструмент; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: guild master medallion immaculate forge coat precision instruments displayed wealth in steel; use Iron Hills generator tiers 7–10 for exact skill gear power; mood anchor (high delegate, controlled opulence), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

## Страж (`guard`)

### Беднее / простой люд (генератор × тир 1–3)
*prompt id:* `guard_t1_3` · *tiers:* 1–3

```
Concept of "Страж" (низкая ступень (× тир 1–3)), one humanoid npc portrait for Iron Hills VTT — Городской или дорожный стражник в кольчуге и с щитом; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: ill-fitting gambeson rusty mail scrap militia levy wooden club or short spear fatigue; use Iron Hills generator tiers 1–3 for exact skill gear power; mood anchor (skilled artisan or fighter, sharper gear hints, dusty daylight), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Середина / умелые (генератор × тир 4–6)
*prompt id:* `guard_t4_6` · *tiers:* 4–6

```
Concept of "Страж" (средняя ступень (× тир 4–6)), one humanoid npc portrait for Iron Hills VTT — Городской или дорожный стражник в кольчуге и с щитом; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: matching tabard neat chain or brigandine serviced blade duty belt confident watch stance; use Iron Hills generator tiers 4–6 for exact skill gear power; mood anchor (veteran bearing, understated steel and scars), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Зажиточнее / статус и элита (генератор × тир 7–10)
*prompt id:* `guard_t7_10` · *tiers:* 7–10

```
Concept of "Страж" (высокая ступень (× тир 7–10)), one humanoid npc portrait for Iron Hills VTT — Городской или дорожный стражник в кольчуге и с щитом; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: captain polished half-plate ceremonial sash veteran medals coif immaculate halberd or longsword; use Iron Hills generator tiers 7–10 for exact skill gear power; mood anchor (high delegate, controlled opulence), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

## Охотник (`hunter`)

### Беднее / простой люд (генератор × тир 1–3)
*prompt id:* `hunter_t1_3` · *tiers:* 1–3

```
Concept of "Охотник" (низкая ступень (× тир 1–3)), one humanoid npc portrait for Iron Hills VTT — Лесной стрелок и следопыт; лук, нож, выживание; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: mismatched furs snare twine hunger lean bow frayed string mud boots poacher desperation; use Iron Hills generator tiers 1–3 for exact skill gear power; mood anchor (skilled artisan or fighter, sharper gear hints, dusty daylight), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Середина / умелые (генератор × тир 4–6)
*prompt id:* `hunter_t4_6` · *tiers:* 4–6

```
Concept of "Охотник" (средняя ступень (× тир 4–6)), one humanoid npc portrait for Iron Hills VTT — Лесной стрелок и следопыт; лук, нож, выживание; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: oiled leather quiver trophies antler knife confident trail gait provisioned belt; use Iron Hills generator tiers 4–6 for exact skill gear power; mood anchor (veteran bearing, understated steel and scars), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Зажиточнее / статус и элита (генератор × тир 7–10)
*prompt id:* `hunter_t7_10` · *tiers:* 7–10

```
Concept of "Охотник" (высокая ступень (× тир 7–10)), one humanoid npc portrait for Iron Hills VTT — Лесной стрелок и следопыт; лук, нож, выживание; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: noble hunt livery engraved bow silver cap fur mantle legend-tracker prestige; use Iron Hills generator tiers 7–10 for exact skill gear power; mood anchor (high delegate, controlled opulence), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

## Маг (`mage`)

### Беднее / простой люд (генератор × тир 1–3)
*prompt id:* `mage_t1_3` · *tiers:* 1–3

```
Concept of "Маг" (низкая ступень (× тир 1–3)), one humanoid npc portrait for Iron Hills VTT — Обученный колдун нескольких школ; мантия и посох; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: tattered robes borrowed staff ash on cuffs novice cantrips nervous focus cheap herbs; use Iron Hills generator tiers 1–3 for exact skill gear power; mood anchor (skilled artisan or fighter, sharper gear hints, dusty daylight), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Середина / умелые (генератор × тир 4–6)
*prompt id:* `mage_t4_6` · *tiers:* 4–6

```
Concept of "Маг" (средняя ступень (× тир 4–6)), one humanoid npc portrait for Iron Hills VTT — Обученный колдун нескольких школ; мантия и посох; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: embroidered cuffs focus crystal belt pouch neat arcane braid respected hedge-wizard aura; use Iron Hills generator tiers 4–6 for exact skill gear power; mood anchor (veteran bearing, understated steel and scars), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Зажиточнее / статус и элита (генератор × тир 7–10)
*prompt id:* `mage_t7_10` · *tiers:* 7–10

```
Concept of "Маг" (высокая ступень (× тир 7–10)), one humanoid npc portrait for Iron Hills VTT — Обученный колдун нескольких школ; мантия и посох; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: rich velvet or archmage trim rune-thread gloves levitating dust motes authority without shouting; use Iron Hills generator tiers 7–10 for exact skill gear power; mood anchor (high delegate, controlled opulence), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

## Дворянин (`noble`)

### Беднее / простой люд (генератор × тир 1–3)
*prompt id:* `noble_t1_3` · *tiers:* 1–3

```
Concept of "Дворянин" (низкая ступень (× тир 1–3)), one humanoid npc portrait for Iron Hills VTT — Землевладелец или чиновник; кортик, убеждение, свита; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: ruined petty-gentry moth-eaten cloak ink-stained decree poverty pride hollow cheeks; use Iron Hills generator tiers 1–3 for exact skill gear power; mood anchor (skilled artisan or fighter, sharper gear hints, dusty daylight), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Середина / умелые (генератор × тир 4–6)
*prompt id:* `noble_t4_6` · *tiers:* 4–6

```
Concept of "Дворянин" (средняя ступень (× тир 4–6)), one humanoid npc portrait for Iron Hills VTT — Землевладелец или чиновник; кортик, убеждение, свита; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: court-cut doublet heraldic baldric groomed beard city politics steel; use Iron Hills generator tiers 4–6 for exact skill gear power; mood anchor (veteran bearing, understated steel and scars), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Зажиточнее / статус и элита (генератор × тир 7–10)
*prompt id:* `noble_t7_10` · *tiers:* 7–10

```
Concept of "Дворянин" (высокая ступень (× тир 7–10)), one humanoid npc portrait for Iron Hills VTT — Землевладелец или чиновник; кортик, убеждение, свита; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: jeweled gorget heirloom blade signet glaring silks restrained power inner-circle elite; use Iron Hills generator tiers 7–10 for exact skill gear power; mood anchor (high delegate, controlled opulence), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

## Жрец (`priest`)

### Беднее / простой люд (генератор × тир 1–3)
*prompt id:* `priest_t1_3` · *tiers:* 1–3

```
Concept of "Жрец" (низкая ступень (× тир 1–3)), one humanoid npc portrait for Iron Hills VTT — Служитель культа; жизнь, разум, проповедь и уход за паствой; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: worn cassock incense smoke poverty parish candles tired kindness dirt-under-nails holiness; use Iron Hills generator tiers 1–3 for exact skill gear power; mood anchor (skilled artisan or fighter, sharper gear hints, dusty daylight), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Середина / умелые (генератор × тир 4–6)
*prompt id:* `priest_t4_6` · *tiers:* 4–6

```
Concept of "Жрец" (средняя ступень (× тир 4–6)), one humanoid npc portrait for Iron Hills VTT — Служитель культа; жизнь, разум, проповедь и уход за паствой; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: embroidered stole neat tonsure blessed reliquary on cord trusted village pillar; use Iron Hills generator tiers 4–6 for exact skill gear power; mood anchor (veteran bearing, understated steel and scars), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Зажиточнее / статус и элита (генератор × тир 7–10)
*prompt id:* `priest_t7_10` · *tiers:* 7–10

```
Concept of "Жрец" (высокая ступень (× тир 7–10)), one humanoid npc portrait for Iron Hills VTT — Служитель культа; жизнь, разум, проповедь и уход за паствой; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: heavy brocade mitre hinted grand altar authority choir-gold restrained divine theatre; use Iron Hills generator tiers 7–10 for exact skill gear power; mood anchor (high delegate, controlled opulence), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

## Житель (`villager`)

### Беднее / простой люд (генератор × тир 1–3)
*prompt id:* `villager_t1_3` · *tiers:* 1–3

```
Concept of "Житель" (низкая ступень (× тир 1–3)), one humanoid npc portrait for Iron Hills VTT — Простолюдин поселения: холмовая деревня, трактир, рынок; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: patched hemp and soot-stained apron, thin hands hunger-worry gaze, crude wooden crockery cue; use Iron Hills generator tiers 1–3 for exact skill gear power; mood anchor (skilled artisan or fighter, sharper gear hints, dusty daylight), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Середина / умелые (генератор × тир 4–6)
*prompt id:* `villager_t4_6` · *tiers:* 4–6

```
Concept of "Житель" (средняя ступень (× тир 4–6)), one humanoid npc portrait for Iron Hills VTT — Простолюдин поселения: холмовая деревня, трактир, рынок; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: clean wool skirt or jerkin sturdy boots market-day neatness modest coin pouch; use Iron Hills generator tiers 4–6 for exact skill gear power; mood anchor (veteran bearing, understated steel and scars), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

### Зажиточнее / статус и элита (генератор × тир 7–10)
*prompt id:* `villager_t7_10` · *tiers:* 7–10

```
Concept of "Житель" (высокая ступень (× тир 7–10)), one humanoid npc portrait for Iron Hills VTT — Простолюдин поселения: холмовая деревня, трактир, рынок; isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background; status read clearly: fine weave embroidery ring or clasp hint servant-free shoulders prosperous guild or rentier vibe; use Iron Hills generator tiers 7–10 for exact skill gear power; mood anchor (high delegate, controlled opulence), single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1
```

