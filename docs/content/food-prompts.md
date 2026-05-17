# Iron Hills — AI-промпты для еды и напитков

> Источник: `FOOD`. Перегенерация: `node tools/generate-food-prompts.mjs`

Позиции из **пулов разделки монстров** ниже по тирам дублируют колонку **«разделка»**: иконка сыро́й добычи / разделочного стола (см. также `docs/content/monster-loot-prompts.md` для материалов и полной разбивки по пулам).

**Negative (общий):**
```
text, watermark, logo, signature, blurry, low quality, cluttered banquet hall wide shot, multiple unrelated plates, eating utensils alone without food, human face, nsfw
```

## Id еды, встречающиеся в добыче монстров

- `caravan_roast` — пулы: `brute_prize_t5`
- `game_meat_raw` — пулы: `predator_scrap_t1`, `vermin_bundle_t1`
- `game_meat_rich` — пулы: `alpine_harvest_t3`, `brute_carve_t2`, `pack_leader_t3`, `wetland_glean_t2`
- `highland_grub_haunch` — пулы: `alpine_harvest_t3`
- `serpent_fillet_raw` — пулы: `wetland_glean_t2`
- `wyvern_stringy_cut` — пулы: `apex_slice_t4`, `beast_lord_t7`, `beast_lord_t8`, `beast_lord_t9`, `brute_prize_t5`, `kaiju_shard_t6`, `primordial_harvest_t10`


## Тир 1

### Отвар корней *(`boiled_roots`, 🍖14 💧8)*

```
Concept "Отвар корней", fantasy edible dish photograph —  balanced solids and hydration cues, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Хлеб *(`bread`, 🍖15 💧5)*

```
Concept "Хлеб", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Сыр *(`cheese`, 🍖12 💧3)*

```
Concept "Сыр", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Тушёное мясо *(`cooked_stew`, 🍖30 💧10)*

```
Concept "Тушёное мясо", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Вяленое мясо *(`dried_meat`, 🍖20 💧0)*

```
Concept "Вяленое мясо", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Гномье пиво *(`dwarf_brew`, 🍖8 💧20)*

```
Concept "Гномье пиво", fantasy edible dish photograph —  emphasis on steam mug / jug / soup moisture shimmer, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Полевое жаркое *(`field_stew`, 🍖34 💧12)*

```
Concept "Полевое жаркое", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Свежее мясо *(`fresh_meat`, 🍖25 💧5)*

```
Concept "Свежее мясо", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Сырая дичь *(`game_meat_raw`, 🍖18 💧3)*

```
Concept "Сырая дичь", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

*В пулах разделки:* `predator_scrap_t1`, `vermin_bundle_t1`

**Промпт для иконки добычи (разделка / сыро́е):**

```
Concept "Сырая дичь", fantasy RPG monster harvest food icon — thick haunch marbling sinew ribbons coarse salt flake, butcher stone or stained board oiled rag NOT banquet china twine wrap, muted tavern staples, hearth smoke undertone tier 1 quarry, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, gritty rim hunter camp light warm amber candlelight --ar 1:1
```

### Грибной суп *(`mushroom_soup`, 🍖25 💧15)*

```
Concept "Грибной суп", fantasy edible dish photograph —  balanced solids and hydration cues, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Овсяный поцелуй *(`oat_kiss_kissel`, 🍖16 💧14)*

```
Concept "Овсяный поцелуй", fantasy edible dish photograph —  balanced solids and hydration cues, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Банка маринованных овощей *(`pickled_veggies_jar`, 🍖18 💧10)*

```
Concept "Банка маринованных овощей", fantasy edible dish photograph —  balanced solids and hydration cues, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Походный паёк *(`trail_rations`, 🍖20 💧5)*

```
Concept "Походный паёк", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```

### Родниковая вода (меха) *(`well_water_skin`, 🍖5 💧38)*

```
Concept "Родниковая вода (меха)", fantasy edible dish photograph —  emphasis on steam mug / jug / soup moisture shimmer, wooden trencher, coarse linen napkin, tavern staples, hearth smoke, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing warm amber candlelight. --ar 1:1
```


## Тир 2

### Кувшин ягодного кваса *(`berry_kvass_jug`, 🍖22 💧28)*

```
Concept "Кувшин ягодного кваса", fantasy edible dish photograph —  emphasis on steam mug / jug / soup moisture shimmer, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```

### Изысканное блюдо *(`fine_meal`, 🍖40 💧15)*

```
Concept "Изысканное блюдо", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```

### Плотная дичь *(`game_meat_rich`, 🍖28 💧4)*

```
Concept "Плотная дичь", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```

*В пулах разделки:* `alpine_harvest_t3`, `brute_carve_t2`, `pack_leader_t3`, `wetland_glean_t2`

**Промпт для иконки добычи (разделка / сыро́е):**

```
Concept "Плотная дичь", fantasy RPG monster harvest food icon — thick haunch marbling sinew ribbons coarse salt flake, butcher stone or stained board oiled rag NOT banquet china twine wrap, muted guild-town merchant lunch undertone tier 3 quarry, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, gritty rim hunter camp light neutral daylight window --ar 1:1
```

### Луговые медовые соты *(`meadow_honeycomb`, 🍖26 💧12)*

```
Concept "Луговые медовые соты", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```

### Дощечка солёной рыбы *(`salted_fish_board`, 🍖32 💧6)*

```
Concept "Дощечка солёной рыбы", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```

### Сырое филе змея *(`serpent_fillet_raw`, 🍖22 💧6)*

```
Concept "Сырое филе змея", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```

*В пулах разделки:* `wetland_glean_t2`

**Промпт для иконки добычи (разделка / сыро́е):**

```
Concept "Сырое филе змея", fantasy RPG monster harvest food icon — serpent fillet translucent jelly ichor sheen scale-side muscle striation, butcher stone or stained board oiled rag NOT banquet china twine wrap, muted respectable inn fare undertone tier 2 quarry, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, gritty rim hunter camp light cozy lantern glow --ar 1:1
```

### Сухари странника *(`travelers_hardtack`, 🍖28 💧4)*

```
Concept "Сухари странника", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, simple glazed ceramic plate, respectable inn fare, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cozy lantern glow. --ar 1:1
```


## Тир 3

### Бренди из вишни *(`cherry_brandy_snifter`, 🍖28 💧18)*

```
Concept "Бренди из вишни", fantasy edible dish photograph —  balanced solids and hydration cues, white pottery dish with herb garnish, guild-town merchant lunch, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing neutral daylight window. --ar 1:1
```

### Окорок горного трутня *(`highland_grub_haunch`, 🍖36 💧5)*

```
Concept "Окорок горного трутня", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, white pottery dish with herb garnish, guild-town merchant lunch, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing neutral daylight window. --ar 1:1
```

*В пулах разделки:* `alpine_harvest_t3`

**Промпт для иконки добычи (разделка / сыро́е):**

```
Concept "Окорок горного трутня", fantasy RPG monster harvest food icon — chitinous grub haunch segmented meat pale marrow seam fantasy insect quarry cut, butcher stone or stained board oiled rag NOT banquet china twine wrap, muted guild-town merchant lunch undertone tier 3 quarry, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, gritty rim hunter camp light neutral daylight window --ar 1:1
```

### Завтрак шахтёра *(`miners_breakfast`, 🍖46 💧12)*

```
Concept "Завтрак шахтёра", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, white pottery dish with herb garnish, guild-town merchant lunch, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing neutral daylight window. --ar 1:1
```

### Чайник мятного чая *(`mint_leaf_tea_pot`, 🍖32 💧36)*

```
Concept "Чайник мятного чая", fantasy edible dish photograph —  balanced solids and hydration cues, white pottery dish with herb garnish, guild-town merchant lunch, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing neutral daylight window. --ar 1:1
```

### Кувшин яблочного сидра *(`orchard_cider_jug`, 🍖18 💧28)*

```
Concept "Кувшин яблочного сидра", fantasy edible dish photograph —  emphasis on steam mug / jug / soup moisture shimmer, white pottery dish with herb garnish, guild-town merchant lunch, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing neutral daylight window. --ar 1:1
```


## Тир 4

### Ужин караванщика *(`caravan_roast`, 🍖58 💧14)*

```
Concept "Ужин караванщика", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, bronze charger plate with carved rim, caravan feast seasoned by road spice, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing clean side light. --ar 1:1
```

*В пулах разделки:* `brute_prize_t5`

**Промпт для иконки добычи (разделка / сыро́е):**

```
Concept "Ужин караванщика", fantasy RPG monster harvest food icon — thick haunch marbling sinew ribbons coarse salt flake, butcher stone or stained board oiled rag NOT banquet china twine wrap, muted manor hall banquet snippet undertone tier 5 quarry, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, gritty rim hunter camp light soft rim highlights --ar 1:1
```

### Копчёная форель *(`smoked_trout_board`, 🍖52 💧18)*

```
Concept "Копчёная форель", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, bronze charger plate with carved rim, caravan feast seasoned by road spice, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing clean side light. --ar 1:1
```

### Приправленное дорожное вино *(`spiced_route_wine`, 🍖38 💧30)*

```
Concept "Приправленное дорожное вино", fantasy edible dish photograph —  balanced solids and hydration cues, bronze charger plate with carved rim, caravan feast seasoned by road spice, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing clean side light. --ar 1:1
```

### Нарезка с виверны *(`wyvern_stringy_cut`, 🍖44 💧6)*

```
Concept "Нарезка с виверны", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, bronze charger plate with carved rim, caravan feast seasoned by road spice, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing clean side light. --ar 1:1
```

*В пулах разделки:* `apex_slice_t4`, `beast_lord_t7`, `beast_lord_t8`, `beast_lord_t9`, `brute_prize_t5`, `kaiju_shard_t6`, `primordial_harvest_t10`

**Промпт для иконки добычи (разделка / сыро́е):**

```
Concept "Нарезка с виверны", fantasy RPG monster harvest food icon — thick haunch marbling sinew ribbons coarse salt flake, butcher stone or stained board oiled rag NOT banquet china twine wrap, muted mythical feast worthy of gods undertone tier 10 quarry, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, gritty rim hunter camp light spark halo lens flare subtle aura distortion --ar 1:1
```


## Тир 5

### Янтарный мёд в роге *(`amber_mead_horn`, 🍖52 💧30)*

```
Concept "Янтарный мёд в роге", fantasy edible dish photograph —  balanced solids and hydration cues, silver-plated platter, manor hall banquet snippet, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing soft rim highlights. --ar 1:1
```

### Пирог с овощами и ягодами *(`lordly_vegetable_pie`, 🍖72 💧22)*

```
Concept "Пирог с овощами и ягодами", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, silver-plated platter, manor hall banquet snippet, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing soft rim highlights. --ar 1:1
```


## Тир 6

### Бренди «Огненная метка» *(`firebrand_brandy_snifter`, 🍖46 💧38)*

```
Concept "Бренди «Огненная метка»", fantasy edible dish photograph —  balanced solids and hydration cues, cast iron skillet presentation still steaming, noble hunter lodge luxury, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing fire-kissed glow. --ar 1:1
```

### Жаровня «Вулкан» *(`volcanic_skillet`, 🍖82 💧26)*

```
Concept "Жаровня «Вулкан»", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, cast iron skillet presentation still steaming, noble hunter lodge luxury, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing fire-kissed glow. --ar 1:1
```


## Тир 7

### Талая ледниковая вода *(`glacier_melt_skin`, 🍖38 💧55)*

```
Concept "Талая ледниковая вода", fantasy edible dish photograph —  emphasis on steam mug / jug / soup moisture shimmer, dark slate plate bioluminescent garnish accents, exotic imported rarity, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cool moonlit shimmer. --ar 1:1
```

### Тарт из лунного фрукта *(`moonfruit_tart`, 🍖94 💧30)*

```
Concept "Тарт из лунного фрукта", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, dark slate plate bioluminescent garnish accents, exotic imported rarity, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing cool moonlit shimmer. --ar 1:1
```


## Тир 8

### Жаркое с глазурью Авроры *(`aurora_glazed_roast`, 🍖108 💧38)*

```
Concept "Жаркое с глазурью Авроры", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, pearlescent porcelain, master-chef artistry visible saucing, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing studio highlight gradient. --ar 1:1
```

### Игристый сок Авроры *(`aurora_sparkling_juice`, 🍖54 💧50)*

```
Concept "Игристый сок Авроры", fantasy edible dish photograph —  balanced solids and hydration cues, pearlescent porcelain, master-chef artistry visible saucing, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing studio highlight gradient. --ar 1:1
```


## Тир 9

### Блюдо солнечного буфета *(`solar_buffet_course`, 🍖132 💧42)*

```
Concept "Блюдо солнечного буфета", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, gold-leaf trimmed platter, legendary banquet centerpiece miniature, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing golden divine backlight. --ar 1:1
```

### Солнечное шампанское *(`solar_champagne_flute`, 🍖72 💧62)*

```
Concept "Солнечное шампанское", fantasy edible dish photograph —  balanced solids and hydration cues, gold-leaf trimmed platter, legendary banquet centerpiece miniature, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing golden divine backlight. --ar 1:1
```


## Тир 10

### Фляга небесной росы *(`celestial_dew_flask`, 🍖88 💧78)*

```
Concept "Фляга небесной росы", fantasy edible dish photograph —  balanced solids and hydration cues, floating crystalline dish barely touching surface, mythical feast worthy of gods, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing spark halo lens flare subtle aura distortion. --ar 1:1
```

### Ужин генезиса *(`genesis_supper`, 🍖190 💧55)*

```
Concept "Ужин генезиса", fantasy edible dish photograph —  emphasis on hearty solids roast carved portions, floating crystalline dish barely touching surface, mythical feast worthy of gods, single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style, 1024x1024 inventory sprite framing spark halo lens flare subtle aura distortion. --ar 1:1
```
