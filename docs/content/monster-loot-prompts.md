# Iron Hills — AI-промпты: добыча с разделки монстров

> Источник: `MONSTER_HARVEST_DROP_POOLS` + подписи из `FOOD` / `MATERIALS`.
> Перегенерация: `node tools/generate-monster-loot-prompts.mjs`

Используй **уникальные** строки для одной иконки на предмет; секция **по пулам** — чтобы видеть, у какого круга тварей какой шанс и количество.

**Negative (общий):**
```
text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw
```

## Уникальные предметы добычи (один промпт на id)


### Еда

#### Ужин караванщика *(`caravan_roast`, пулы: `brute_prize_t5`)*

```
Concept "Ужин караванщика", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood caravan-hunted prize cuts hardened scales hoard, tier 5 quarry read --ar 1:1
```

#### Сырая дичь *(`game_meat_raw`, пулы: `predator_scrap_t1`, `vermin_bundle_t1`)*

```
Concept "Сырая дичь", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood vermin scrap ash-bog grit humble hunt yield, tier 1 quarry read --ar 1:1
```

#### Плотная дичь *(`game_meat_rich`, пулы: `alpine_harvest_t3`, `brute_carve_t2`, `pack_leader_t3`, `wetland_glean_t2`)*

```
Concept "Плотная дичь", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood alpine pack-beast alpha musk trophy read, tier 3 quarry read --ar 1:1
```

#### Окорок горного трутня *(`highland_grub_haunch`, пулы: `alpine_harvest_t3`)*

```
Concept "Окорок горного трутня", monster harvest butcher fantasy — chitinous grub haunch segmented meat pale marrow seam fantasy insect quarry cut, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood alpine pack-beast alpha musk trophy read, tier 3 quarry read --ar 1:1
```

#### Сырое филе змея *(`serpent_fillet_raw`, пулы: `wetland_glean_t2`)*

```
Concept "Сырое филе змея", monster harvest butcher fantasy — serpent fillet translucent jelly ichor sheen scale-side muscle striation, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood wetland predator trail dressing damp moss, tier 2 quarry read --ar 1:1
```

#### Нарезка с виверны *(`wyvern_stringy_cut`, пулы: `apex_slice_t4`, `beast_lord_t7`, `beast_lord_t8`, `beast_lord_t9`, `brute_prize_t5`, `kaiju_shard_t6`, `primordial_harvest_t10`)*

```
Concept "Нарезка с виверны", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood primordial kaiju apex colossus reagent avalanche, tier 10 quarry read --ar 1:1
```


### Материалы

#### Железа вожака *(`alpha_musk_gland`, пулы: `beast_lord_t9`, `pack_leader_t3`, `primordial_harvest_t10`)*

```
Concept "Железа вожака", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read --ar 1:1
```

#### Шкура зверя *(`animal_hide`, пулы: `predator_scrap_t1`)*

```
Concept "Шкура зверя", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read --ar 1:1
```

#### Киль птицеящера *(`avian_keel_bone`, пулы: `alpine_harvest_t3`)*

```
Concept "Киль птицеящера", fantasy harvest material — lightweight beast bone keel ridge marrow hollow, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read --ar 1:1
```

#### Жильё зверя *(`beast_sinew_spool`, пулы: `predator_scrap_t1`, `vermin_bundle_t1`)*

```
Concept "Жильё зверя", fantasy harvest material — fibrous tendon coil stripped sinew filament spool cue, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read --ar 1:1
```

#### Кольца из щетины кабана *(`bristle_keg_rings`, пулы: `brute_carve_t2`)*

```
Concept "Кольца из щетины кабана", fantasy harvest material — bristle rings bundled hog trophy craft rings, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read --ar 1:1
```

#### Чешуя дрейка *(`drake_scale`, пулы: `apex_slice_t4`, `beast_lord_t7`, `beast_lord_t8`, `brute_prize_t5`, `primordial_harvest_t10`)*

```
Concept "Чешуя дрейка", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read --ar 1:1
```

#### Осколок клыка *(`fang_shard`, пулы: `beast_lord_t9`, `brute_carve_t2`, `vermin_bundle_t1`)*

```
Concept "Осколок клыка", fantasy harvest material — splintered enamel ivory shard trophy tip, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord pinnacle trophy hoard dense scales atmosphere, tier 9 drop read --ar 1:1
```

#### Целебный лист *(`herb_healing`, пулы: `alpine_harvest_t3`)*

```
Concept "Целебный лист", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read --ar 1:1
```

#### Железа монстра *(`monster_gland`, пулы: `beast_lord_t7`, `beast_lord_t9`, `pack_leader_t3`, `primordial_harvest_t10`)*

```
Concept "Железа монстра", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read --ar 1:1
```

#### Болотный гриб *(`mushroom_bog`, пулы: `wetland_glean_t2`)*

```
Concept "Болотный гриб", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read --ar 1:1
```

#### Смоляная пробка хищника *(`predator_resin_mass`, пулы: `apex_slice_t4`, `beast_lord_t8`, `primordial_harvest_t10`)*

```
Concept "Смоляная пробка хищника", fantasy harvest material — dark amber resin plug predator gum cluster, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read --ar 1:1
```

#### Чешуйчатая шкура *(`scale_hide`, пулы: `pack_leader_t3`)*

```
Concept "Чешуйчатая шкура", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read --ar 1:1
```

#### Слабая змеиная желчь *(`serpent_sac_mild`, пулы: `wetland_glean_t2`)*

```
Concept "Слабая змеиная желчь", fantasy harvest material — visceral sac bulb stoppered wax cord alchemical, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read --ar 1:1
```

#### Небольшая шкура (сырая) *(`small_pelt_uncured`, пулы: `predator_scrap_t1`)*

```
Concept "Небольшая шкура (сырая)", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read --ar 1:1
```

#### Толстая шкура *(`thick_hide`, пулы: `brute_carve_t2`)*

```
Concept "Толстая шкура", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read --ar 1:1
```

#### Мешок с ядом *(`venom_sac`, пулы: `beast_lord_t7`, `beast_lord_t8`, `kaiju_shard_t6`)*

```
Concept "Мешок с ядом", fantasy harvest material — visceral sac bulb stoppered wax cord alchemical, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord apex resin reservoirs armored slabs atmosphere, tier 8 drop read --ar 1:1
```

#### Шкура варга *(`warg_pelt`, пулы: `beast_lord_t9`, `kaiju_shard_t6`)*

```
Concept "Шкура варга", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord pinnacle trophy hoard dense scales atmosphere, tier 9 drop read --ar 1:1
```

#### Пыльца ночных мотыльков *(`wisp_moth_powder`, пулы: `vermin_bundle_t1`)*

```
Concept "Пыльца ночных мотыльков", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read --ar 1:1
```

#### Шкура виверны *(`wyvern_hide`, пулы: `beast_lord_t7`, `beast_lord_t8`, `beast_lord_t9`, `kaiju_shard_t6`, `primordial_harvest_t10`)*

```
Concept "Шкура виверны", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read --ar 1:1
```

#### Жилье виверны *(`wyvern_sinew_filament`, пулы: `apex_slice_t4`)*

```
Concept "Жилье виверны", fantasy harvest material — fibrous tendon coil stripped sinew filament spool cue, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, wyvern drake trophy scales sinew resin elite quarry atmosphere, tier 4 drop read --ar 1:1
```


---

## По пулам разделки

### Пул `alpine_harvest_t3` *(ступень пула ~ 3)*

#### Окорок горного трутня *(`highland_grub_haunch`, food)* — ~73%, ×1–2

```
Concept "Окорок горного трутня", monster harvest butcher fantasy — chitinous grub haunch segmented meat pale marrow seam fantasy insect quarry cut, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood alpine pack-beast alpha musk trophy read, tier 3 quarry read --ar 1:1
```

#### Плотная дичь *(`game_meat_rich`, food)* — ~58%, ×1–2

```
Concept "Плотная дичь", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood alpine pack-beast alpha musk trophy read, tier 3 quarry read --ar 1:1
```

#### Киль птицеящера *(`avian_keel_bone`, material)* — ~53%, ×1–1

```
Concept "Киль птицеящера", fantasy harvest material — lightweight beast bone keel ridge marrow hollow, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read --ar 1:1
```

#### Целебный лист *(`herb_healing`, material)* — ~45%, ×1–2

```
Concept "Целебный лист", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read --ar 1:1
```

### Пул `apex_slice_t4` *(ступень пула ~ 4)*

#### Нарезка с виверны *(`wyvern_stringy_cut`, food)* — ~80%, ×1–3

```
Concept "Нарезка с виверны", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood wyvern drake trophy scales sinew resin elite quarry, tier 4 quarry read --ar 1:1
```

#### Жилье виверны *(`wyvern_sinew_filament`, material)* — ~58%, ×1–1

```
Concept "Жилье виверны", fantasy harvest material — fibrous tendon coil stripped sinew filament spool cue, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, wyvern drake trophy scales sinew resin elite quarry atmosphere, tier 4 drop read --ar 1:1
```

#### Смоляная пробка хищника *(`predator_resin_mass`, material)* — ~45%, ×1–1

```
Concept "Смоляная пробка хищника", fantasy harvest material — dark amber resin plug predator gum cluster, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, wyvern drake trophy scales sinew resin elite quarry atmosphere, tier 4 drop read --ar 1:1
```

#### Чешуя дрейка *(`drake_scale`, material)* — ~39%, ×1–2

```
Concept "Чешуя дрейка", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, wyvern drake trophy scales sinew resin elite quarry atmosphere, tier 4 drop read --ar 1:1
```

### Пул `beast_lord_t7` *(ступень пула ~ 7)*

#### Нарезка с виверны *(`wyvern_stringy_cut`, food)* — ~85%, ×4–6

```
Concept "Нарезка с виверны", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood beast-lord mantle layered hides glands legendary, tier 7 quarry read --ar 1:1
```

#### Шкура виверны *(`wyvern_hide`, material)* — ~81%, ×1–2

```
Concept "Шкура виверны", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord mantle layered hides glands legendary atmosphere, tier 7 drop read --ar 1:1
```

#### Чешуя дрейка *(`drake_scale`, material)* — ~71%, ×2–4

```
Concept "Чешуя дрейка", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord mantle layered hides glands legendary atmosphere, tier 7 drop read --ar 1:1
```

#### Мешок с ядом *(`venom_sac`, material)* — ~47%, ×1–2

```
Concept "Мешок с ядом", fantasy harvest material — visceral sac bulb stoppered wax cord alchemical, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord mantle layered hides glands legendary atmosphere, tier 7 drop read --ar 1:1
```

#### Железа монстра *(`monster_gland`, material)* — ~27%, ×1–2

```
Concept "Железа монстра", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord mantle layered hides glands legendary atmosphere, tier 7 drop read --ar 1:1
```

### Пул `beast_lord_t8` *(ступень пула ~ 8)*

#### Нарезка с виверны *(`wyvern_stringy_cut`, food)* — ~81%, ×5–8

```
Concept "Нарезка с виверны", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood beast-lord apex resin reservoirs armored slabs, tier 8 quarry read --ar 1:1
```

#### Шкура виверны *(`wyvern_hide`, material)* — ~81%, ×1–2

```
Concept "Шкура виверны", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord apex resin reservoirs armored slabs atmosphere, tier 8 drop read --ar 1:1
```

#### Чешуя дрейка *(`drake_scale`, material)* — ~75%, ×3–5

```
Concept "Чешуя дрейка", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord apex resin reservoirs armored slabs atmosphere, tier 8 drop read --ar 1:1
```

#### Смоляная пробка хищника *(`predator_resin_mass`, material)* — ~53%, ×1–2

```
Concept "Смоляная пробка хищника", fantasy harvest material — dark amber resin plug predator gum cluster, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord apex resin reservoirs armored slabs atmosphere, tier 8 drop read --ar 1:1
```

#### Мешок с ядом *(`venom_sac`, material)* — ~27%, ×2–4

```
Concept "Мешок с ядом", fantasy harvest material — visceral sac bulb stoppered wax cord alchemical, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord apex resin reservoirs armored slabs atmosphere, tier 8 drop read --ar 1:1
```

### Пул `beast_lord_t9` *(ступень пула ~ 9)*

#### Нарезка с виверны *(`wyvern_stringy_cut`, food)* — ~84%, ×6–10

```
Concept "Нарезка с виверны", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood beast-lord pinnacle trophy hoard dense scales, tier 9 quarry read --ar 1:1
```

#### Шкура варга *(`warg_pelt`, material)* — ~84%, ×2–3

```
Concept "Шкура варга", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord pinnacle trophy hoard dense scales atmosphere, tier 9 drop read --ar 1:1
```

#### Шкура виверны *(`wyvern_hide`, material)* — ~77%, ×2–3

```
Concept "Шкура виверны", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord pinnacle trophy hoard dense scales atmosphere, tier 9 drop read --ar 1:1
```

#### Железа монстра *(`monster_gland`, material)* — ~60%, ×1–2

```
Concept "Железа монстра", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord pinnacle trophy hoard dense scales atmosphere, tier 9 drop read --ar 1:1
```

#### Осколок клыка *(`fang_shard`, material)* — ~39%, ×6–10

```
Concept "Осколок клыка", fantasy harvest material — splintered enamel ivory shard trophy tip, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord pinnacle trophy hoard dense scales atmosphere, tier 9 drop read --ar 1:1
```

#### Железа вожака *(`alpha_musk_gland`, material)* — ~22%, ×1–2

```
Concept "Железа вожака", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord pinnacle trophy hoard dense scales atmosphere, tier 9 drop read --ar 1:1
```

### Пул `brute_carve_t2` *(ступень пула ~ 2)*

#### Плотная дичь *(`game_meat_rich`, food)* — ~64%, ×2–3

```
Concept "Плотная дичь", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood wetland predator trail dressing damp moss, tier 2 quarry read --ar 1:1
```

#### Толстая шкура *(`thick_hide`, material)* — ~48%, ×1–2

```
Concept "Толстая шкура", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read --ar 1:1
```

#### Кольца из щетины кабана *(`bristle_keg_rings`, material)* — ~39%, ×1–1

```
Concept "Кольца из щетины кабана", fantasy harvest material — bristle rings bundled hog trophy craft rings, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read --ar 1:1
```

#### Осколок клыка *(`fang_shard`, material)* — ~19%, ×2–3

```
Concept "Осколок клыка", fantasy harvest material — splintered enamel ivory shard trophy tip, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read --ar 1:1
```

### Пул `brute_prize_t5` *(ступень пула ~ 5)*

#### Ужин караванщика *(`caravan_roast`, food)* — ~78%, ×1–1

```
Concept "Ужин караванщика", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood caravan-hunted prize cuts hardened scales hoard, tier 5 quarry read --ar 1:1
```

#### Нарезка с виверны *(`wyvern_stringy_cut`, food)* — ~73%, ×2–4

```
Concept "Нарезка с виверны", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood caravan-hunted prize cuts hardened scales hoard, tier 5 quarry read --ar 1:1
```

#### Чешуя дрейка *(`drake_scale`, material)* — ~58%, ×2–4

```
Concept "Чешуя дрейка", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, caravan-hunted prize cuts hardened scales hoard atmosphere, tier 5 drop read --ar 1:1
```

### Пул `kaiju_shard_t6` *(ступень пула ~ 6)*

#### Нарезка с виверны *(`wyvern_stringy_cut`, food)* — ~82%, ×3–5

```
Concept "Нарезка с виверны", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood kaiju-class bulk hide venom reservoirs, tier 6 quarry read --ar 1:1
```

#### Шкура варга *(`warg_pelt`, material)* — ~76%, ×1–2

```
Concept "Шкура варга", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, kaiju-class bulk hide venom reservoirs atmosphere, tier 6 drop read --ar 1:1
```

#### Шкура виверны *(`wyvern_hide`, material)* — ~59%, ×1–1

```
Concept "Шкура виверны", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, beast-lord mantle layered hides glands legendary atmosphere, tier 7 drop read --ar 1:1
```

#### Мешок с ядом *(`venom_sac`, material)* — ~48%, ×1–2

```
Concept "Мешок с ядом", fantasy harvest material — visceral sac bulb stoppered wax cord alchemical, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, kaiju-class bulk hide venom reservoirs atmosphere, tier 6 drop read --ar 1:1
```

### Пул `pack_leader_t3` *(ступень пула ~ 3)*

#### Плотная дичь *(`game_meat_rich`, food)* — ~83%, ×2–4

```
Concept "Плотная дичь", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood alpine pack-beast alpha musk trophy read, tier 3 quarry read --ar 1:1
```

#### Железа вожака *(`alpha_musk_gland`, material)* — ~66%, ×1–1

```
Concept "Железа вожака", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read --ar 1:1
```

#### Чешуйчатая шкура *(`scale_hide`, material)* — ~39%, ×1–2

```
Concept "Чешуйчатая шкура", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read --ar 1:1
```

#### Железа монстра *(`monster_gland`, material)* — ~27%, ×1–1

```
Concept "Железа монстра", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, alpine pack-beast alpha musk trophy read atmosphere, tier 3 drop read --ar 1:1
```

### Пул `predator_scrap_t1` *(ступень пула ~ 1)*

#### Сырая дичь *(`game_meat_raw`, food)* — ~64%, ×1–3

```
Concept "Сырая дичь", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood vermin scrap ash-bog grit humble hunt yield, tier 1 quarry read --ar 1:1
```

#### Небольшая шкура (сырая) *(`small_pelt_uncured`, material)* — ~51%, ×1–1

```
Concept "Небольшая шкура (сырая)", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read --ar 1:1
```

#### Шкура зверя *(`animal_hide`, material)* — ~36%, ×1–1

```
Concept "Шкура зверя", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read --ar 1:1
```

#### Жильё зверя *(`beast_sinew_spool`, material)* — ~19%, ×1–2

```
Concept "Жильё зверя", fantasy harvest material — fibrous tendon coil stripped sinew filament spool cue, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read --ar 1:1
```

### Пул `primordial_harvest_t10` *(ступень пула ~ 10)*

#### Нарезка с виверны *(`wyvern_stringy_cut`, food)* — ~81%, ×8–12

```
Concept "Нарезка с виверны", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood primordial kaiju apex colossus reagent avalanche, tier 10 quarry read --ar 1:1
```

#### Шкура виверны *(`wyvern_hide`, material)* — ~77%, ×3–4

```
Concept "Шкура виверны", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read --ar 1:1
```

#### Чешуя дрейка *(`drake_scale`, material)* — ~74%, ×4–7

```
Concept "Чешуя дрейка", fantasy harvest material — folded uncured hide fur edge scale plates subtle salt cure beginning, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read --ar 1:1
```

#### Смоляная пробка хищника *(`predator_resin_mass`, material)* — ~65%, ×2–3

```
Concept "Смоляная пробка хищника", fantasy harvest material — dark amber resin plug predator gum cluster, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read --ar 1:1
```

#### Железа монстра *(`monster_gland`, material)* — ~60%, ×2–4

```
Concept "Железа монстра", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read --ar 1:1
```

#### Железа вожака *(`alpha_musk_gland`, material)* — ~22%, ×2–3

```
Concept "Железа вожака", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, primordial kaiju apex colossus reagent avalanche atmosphere, tier 10 drop read --ar 1:1
```

### Пул `vermin_bundle_t1` *(ступень пула ~ 1)*

#### Сырая дичь *(`game_meat_raw`, food)* — ~70%, ×1–2

```
Concept "Сырая дичь", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood vermin scrap ash-bog grit humble hunt yield, tier 1 quarry read --ar 1:1
```

#### Пыльца ночных мотыльков *(`wisp_moth_powder`, material)* — ~44%, ×1–1

```
Concept "Пыльца ночных мотыльков", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read --ar 1:1
```

#### Осколок клыка *(`fang_shard`, material)* — ~36%, ×1–2

```
Concept "Осколок клыка", fantasy harvest material — splintered enamel ivory shard trophy tip, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read --ar 1:1
```

#### Жильё зверя *(`beast_sinew_spool`, material)* — ~19%, ×1–1

```
Concept "Жильё зверя", fantasy harvest material — fibrous tendon coil stripped sinew filament spool cue, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, vermin scrap ash-bog grit humble hunt yield atmosphere, tier 1 drop read --ar 1:1
```

### Пул `wetland_glean_t2` *(ступень пула ~ 2)*

#### Сырое филе змея *(`serpent_fillet_raw`, food)* — ~58%, ×1–2

```
Concept "Сырое филе змея", monster harvest butcher fantasy — serpent fillet translucent jelly ichor sheen scale-side muscle striation, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood wetland predator trail dressing damp moss, tier 2 quarry read --ar 1:1
```

#### Плотная дичь *(`game_meat_rich`, food)* — ~58%, ×1–2

```
Concept "Плотная дичь", monster harvest butcher fantasy — dense haunch steak marbling sinew ribbons field salt, oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat, mood wetland predator trail dressing damp moss, tier 2 quarry read --ar 1:1
```

#### Слабая змеиная желчь *(`serpent_sac_mild`, material)* — ~33%, ×1–1

```
Concept "Слабая змеиная желчь", fantasy harvest material — visceral sac bulb stoppered wax cord alchemical, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read --ar 1:1
```

#### Болотный гриб *(`mushroom_bog`, material)* — ~23%, ×1–2

```
Concept "Болотный гриб", fantasy harvest material — dried gland herb bundle resin flecks twine wrap, single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail, wetland predator trail dressing damp moss atmosphere, tier 2 drop read --ar 1:1
```
