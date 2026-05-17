# Iron Hills — промпты для охоты, дичи и походной воды

Иконки для Foundry/inventory: **один объект по центру**, квадрат 1:1 или вертикальный слот как у фляги (~1:2), **простой или тёмный фон**, без рук и персонажей в кадре, без водяных знаков.

**Общий negative:**
```
text, watermark, logo, signature, blurry, low quality, cluttered scene, multiple focal subjects, human face, full body warrior, dungeon wide shot, modern objects, rifle, firearm, nsfw
```

---

## Токены / портреты монстров (бестиарий)

Для каждой твари держись **названия и краткого описания** из `monster-bestiary.mjs`. Стиль: суровое низовое фэнтези, «грязная природа Железных Холмов», читаемый силуэт на токене.

**Примеры (подставляй свой `label` и суть из `desc`):**

### Гнильный клещ-рой (`ash_rot_mite_cluster`)

```
Fantasy RPG token portrait, swarm of disgusting ash-cropped many-legged vermin parasites, wet chitin, fungal rot, muddy grey-brown palette, menacing silhouette readable at small size, gritty painterly, dark neutral background, single creature group focal point, 1024x1024 square --ar 1:1
```

### Корнеед-медвежий (`root_gnawer_bear`)

```
Fantasy RPG token, mangy scavenger bear with root-matted fur and fungal stains, thick brutal silhouette, boreal lowland mood, muddy forest floor hints, gritty painterly illustration, centered bust or three-quarter, plain dark vignette background, inventory-safe framing --ar 1:1
```

### Горный трутень-бык (`highland_grub_bull`)

```
Fantasy RPG creature token, enormous alpine beetle-grub brute, heavy segmented plates, rusty iron hills highland stone texture, ominous alpine fog, chunky readable shapes for VTT token, centered, muted earth tones, painterly semi-realistic --ar 1:1
```

**Универсальный шаблон монстра:**
```
Fantasy RPG VTT creature token — [кратко тип и среда из desc], readable silhouette, low-fantasy Iron Hills wilderness, gritty painterly, single subject centered, dark plain background, 1024x1024 square, sharp focus --ar 1:1
```

---

## Сырое мясо и разделка (еда из охоты)

Акцент на **куске мяса / окороке / филе** на деревянной доске или льняной ткани — как иконки еды в пайке.

### Сырая дичь (`game_meat_raw`)

```
Fantasy RPG inventory icon — raw venison/game meat cuts on wooden trencher, dark blood drip subtle, hunted wilderness theme, hearth smoke suggestion, coarse linen napkin corner, centered single plate, muted browns and reds, transparent or plain dark background, painterly 1024x1024 square --ar 1:1
```

### Плотная дичь (`game_meat_rich`)

```
Fantasy RPG food icon — thicker premium wild game steaks and ribs, marrow hint, richer marbling, wooden board, campfire ash mood, hearty hunting reward, centered composition, painterly illustration --ar 1:1
```

### Сырое филе змея (`serpent_fillet_raw`)

```
Fantasy RPG inventory — pale reptile snake fillets coiled sashimi-style slab, wetland herbs beside, subdued green-grey palette, eerie edible look, isolated on dark background, painterly semi-realistic --ar 1:1
```

### Окорок горного трутня (`highland_grub_haunch`)

```
Fantasy RPG edible haunch roast-cut from giant insect larva aesthetic, segmented outer crust hints, succulent inner meat surreal but appetizing for fantasy, alpine stone backdrop blur, centered icon --ar 1:1
```

### Нарезка с виверны (`wyvern_stringy_cut`)

```
Fantasy RPG rare meat trophy — fibrous wyvern flank cuts, faint scale rim on scraps, smoky dragon-hunt story, ornate simple wooden platter, ominous reds and char-black accents, heroic hunting loot vibe --ar 1:1
```

### Полевое жаркое (`field_stew`)

```
Fantasy RPG stew bowl — huntsman's field stew of dark game meat chunks, herb flecks, wooden bowl, steam wisps, satiating trail meal, campfire warmth, centered food icon painterly square --ar 1:1
```

---

## Трофеи и материалы разделки (MATERIALS / misc)

Компактные «лут-спрайты»: **понятная форма предмета**, без перегруженной сцены.

| id (каталог) | Краткая идея для промпта |
|--------------|-------------------------|
| `beast_sinew_spool` | Моток сухожилий зверя, матовый крем-беж, грубая верёвочная текстура |
| `small_pelt_uncured` | Небольшая сырая шкура на дощечке, когти на краю |
| `fang_shard` | Разбитый клык / осколок клыка на ткани |
| `wisp_moth_powder` | Стеклянная баночка блестящей пепельной пудры из крыльев |
| `serpent_sac_mild` | Мягкий желчный мешочек пресмыкающегося на листьях тростника |
| `bristle_keg_rings` | Пучок щетинистых колец с шершавой текстурой для ремней |
| `avian_keel_bone` | Вытянутая киль-кость птицеобразной твари |
| `alpha_musk_gland` | Маленький насыщенный феромонный железистый узелок |
| `wyvern_sinew_filament` | Тонкая стекловидная филаментная нить как шёлк охотника |
| `predator_resin_mass` | Смолистый кусок охотничьего клея-трофея, янтарно-коричневый |

**Универсальный шаблон трофея:**
```
Fantasy RPG inventory material loot — small prop [название], weathered plausible craft ingredient, gritty Iron Hills frontier, centered on plain dark parchment or stone, semi-realistic painterly micro-detail, square 1024x1024 icon --ar 1:1
```

---

## Фляги и ёмкости (`icons/items/consumables/*.webp`)

Вертикальная иконка **~1×2 ячейки сетки**: фляга целиком, лёгкий блеск на воде/металле.

### Кожаная фляга (`leather_waterskin`)

```
Fantasy RPG inventory vertical icon — stitched leather waterskin flask, hemp cord wraps, muted brown hide, faint water bulge silhouette, frontier dwarf ranger gear, centered full container, painterly illustration on transparent or charcoal grey background --ar 1:2
```

### Железная фляга (`iron_canteen`)

```
Fantasy RPG metal canteen — riveted dull iron flask, battered plate steel, faint condensation, hunter militia surplus look, centered vertical loot icon minimalist background --ar 1:2
```

### Бурдюк следопыта (`ranger_gourd`)

```
Fantasy RPG gourd-shaped waterskin coated in waxed linen, carved wooden plug, braided cord, earthy greens and creams, scout survival gear, centered vertical illustration --ar 1:2
```

---

## Водные точки карты / POI (иконки и концепт)

Для журнал-карт и декора POI актёра («свежая вода»): **родник, чистый ручей, деревянное корыто**.

```
Fantasy RPG map vignette icon — secluded fresh water spring amid mossy stones, birch twigs framing, carved wooden trough optional, serene cold stream sparkle, readable at small scale, muted greens and grey-blue palette, painterly top-down lite perspective --ar 1:1
```

---

## Подсказка по синхронизации с каталогами

После добавления новых строк в каталог сохраняй **согласование имён файлов**: путь уже задан для фляг в коде как `systems/iron-hills-system/icons/items/consumables/<id>.webp`. Для еды охоты — через каталог `FOOD.img` или общие промпты в `food-prompts.md` при массовой генерации.
