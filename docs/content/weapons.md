# Iron Hills — Контент-план: Оружие

> Полный план тиров 1–10 для категории `weapon`. Опирается на существующий
> `module/constants/items-catalog.mjs` (`WEAPONS`) и материальную прогрессию
> из `MATERIALS`. Заполняет пробелы и даёт промпты для нейронок-генераторов.

---

## 1. Прогрессия материалов (опорный язык тиров)

| Тир | Металл              | Дерево            | Кожа/шкура       | Камень/кристалл       | Стиль / эстетика                                  |
|----:|---------------------|-------------------|------------------|-----------------------|--------------------------------------------------|
|  1  | Медь                | Сосна             | Шкура зверя      | Кремень, камень       | утилитарное, грубое, мягкое                      |
|  2  | Бронза, олово       | Дуб               | Толстая шкура    | Кварц, гранит         | племенное, ремесленное                           |
|  3  | Железо              | Твёрдая древесина | Чешуйчатая шкура | Обсидиан              | стандарт городских кузниц                        |
|  4  | Сталь               | Железное дерево   | Чешуя дрейка     | Рубин                 | классика воинов, гербы, гравировка               |
|  5  | Закалённая сталь    | Древесина духов   | Кожа дрейка      | Сапфир, мана-кристалл | мастерская работа, рунные акценты                |
|  6  | Митрил              | Чёрное дерево     | Шкура варга      | Алмаз                 | эльфийско-гномья роскошь, серебристое сияние     |
|  7  | Тёмное железо       | Вечное дерево     | Шкура виверны    | Кристалл Пустоты      | угрюмая мощь, фиолетовое свечение                |
|  8  | Звёздный металл     | Мировое дерево    | Кожа дракона     | —                     | небесное, синие/фиолетовые искры, метеорная сталь|
|  9  | Орихалк             | —                 | —                | Осколок звезды        | легендарное, золотисто-багровое                  |
| 10  | Адамантий           | —                 | Шкура Левиафана  | Сердце звезды         | мифическое, оружие героев и богов                |

**Правило стилизации:**
- Тиры **1–3** — потёртые, утилитарные, видны следы ремонта.
- Тиры **4–6** — мастерская работа, орнамент, гравировки.
- Тиры **7–8** — магически активные, лёгкое свечение, неестественные цвета.
- Тиры **9–10** — артефактные, светятся, реальность вокруг чуть искажена.

---

## 2. Текущее состояние (что уже есть)

Существующие позиции в `WEAPONS` (по навыкам):

| Тип / навык | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 |
|---|---|---|---|---|---|---|---|---|---|---|
| `knife`         | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `sword` (1H)    | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `sword` (2H)    | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `axe`           | ✅ | ✅ | ✅ | ✅✅| ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `spear`         | ✅ | ✅ | ✅ | ✅✅| ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `mace`          | ✅ | ❌ | ✅ | ✅✅| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `flail`         | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `bow`           | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `crossbow`      | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `throwing`      | ✅ | ✅✅| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `exotic` (staff)| ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

✅ — есть, ✅✅ — две позиции (одноручка + двуручка), ❌ — пробел.

**Проблемы:**
- 1H-меч единственный тип, у которого закрыты все 10 тиров.
- Метательное оружие совсем не растёт — обрывается на T2.
- Нет ни одной булавы выше T4.
- Нет ни одного арбалета выше T4.
- Нет ни одного посоха-боевого выше T5.

---

## 3. Прогрессия параметров (формула)

Существующая прогрессия 1H-меча — опорная модель (всё остальное масштабируется):

| Тир | Damage (1H sword) | Value | Energy | Weight |
|----:|------------------:|------:|-------:|-------:|
|  1  | 4   | 15      | 4 | 1.5 |
|  2  | 6   | 40      | 4 | 1.5 |
|  3  | 8   | 100     | 4 | 1.8 |
|  4  | 11  | 280     | 4 | 1.8 |
|  5  | 14  | 700     | 4 | 1.6 |
|  6  | 18  | 2 000   | 3 | 1.0 |
|  7  | 22  | 5 000   | 4 | 2.0 |
|  8  | 28  | 12 000  | 3 | 1.2 |
|  9  | 36  | 50 000  | 3 | 1.0 |
| 10  | 50  | 120 000 | 3 | 0.8 |

**Множители по типам относительно 1H-меча:**

| Тип        | Damage ×   | Energy   | Weight   | Reach / 2H | Notes                                        |
|---|---:|---:|---:|---|---|
| `knife`    | 0.55–0.6   | −1 от 1H | 0.2–0.4 | 1H         | низкий урон, дешёвый, малый                  |
| `sword 1H` | **1.0**    | базис    | базис    | 1H         | эталон                                       |
| `sword 2H` | 1.4–1.5    | +2       | ×2       | 2H         | реже, дорого                                  |
| `axe 1H`   | 1.05–1.1   | +1       | +0.2     | 1H         | дороже знаков восклицания не нужно            |
| `axe 2H`   | 1.45       | +3       | ×2.2     | 2H         | боевой топор / секира                         |
| `spear`    | 0.95       | −1       | ×1.4     | 2H         | даёт reach (отдельный буст в hit chance)      |
| `mace 1H`  | 1.1        | +1       | +0.2     | 1H         | пробивает броню (уже учтено в правилах)       |
| `mace 2H`  | 1.5        | +3       | ×2.4     | 2H         | боевой молот                                  |
| `flail`    | 0.95       | +1       | базис    | 1H         | игнорирует часть `armorTier` цели             |
| `bow`      | 1.05       | −1       | 0.7      | 2H         | дальность                                     |
| `crossbow` | 1.3        | −2       | ×1.5     | 2H         | дольше зарядка, бьёт сильнее                  |
| `throwing` | 0.5–0.6    | −2       | мало     | 1H, расход | расходник, нужен запас                        |
| `staff`    | 0.7–0.85   | базис    | ×1.4     | 2H         | низкий урон, бонус к колдовству (поздние)     |

---

## 4. Полная тир-таблица оружия (10 × 11)

Жирным — позиции **которых пока нет** в каталоге. Цифры — `damage / value / weight / energyCost`.

### 4.1. Холодное / древковое (ближний бой)

| Тир | knife (1H) | sword 1H | sword 2H | axe 1H | axe 2H | spear (2H) | mace 1H | mace 2H | flail (1H) |
|---|---|---|---|---|---|---|---|---|---|
|  1 | 2 / 8 / 0.3 / 3 | 4 / 15 / 1.5 / 4 | **6 / 40 / 3.2 / 6** | 4 / 12 / 1.5 / 5 | **6 / 35 / 3.0 / 7** | 4 / 10 / 2.0 / 3 | 4 / 10 / 1.5 / 5 | **6 / 30 / 3.0 / 7** | **3 / 14 / 1.5 / 5** |
|  2 | 3 / 20 / 0.3 / 3 | 6 / 40 / 1.5 / 4 | **9 / 110 / 3.5 / 6** | 6 / 35 / 1.8 / 5 | **9 / 100 / 3.5 / 7** | 6 / 30 / 2.2 / 3 | **6 / 30 / 1.8 / 5** | **9 / 90 / 3.5 / 7** | **5 / 38 / 1.8 / 5** |
|  3 | 4 / 50 / 0.4 / 3 | 8 / 100 / 1.8 / 4 | 12 / 150 / 3.5 / 6 | 9 / 90 / 2.0 / 5 | **12 / 240 / 4.0 / 7** | 8 / 80 / 2.5 / 3 | 9 / 85 / 2.0 / 5 | **12 / 230 / 4.0 / 7** | **7 / 95 / 2.0 / 5** |
|  4 | 5 / 130 / 0.4 / 3 | 11 / 280 / 1.8 / 4 | 16 / 400 / 3.5 / 6 | 12 / 250 / 2.0 / 5 | 16 / 350 / 4.0 / 7 | 11 / 220 / 2.5 / 3 | 13 / 240 / 2.2 / 5 | 17 / 320 / 4.5 / 8 | 12 / 260 / 2.0 / 5 |
|  5 | **7 / 350 / 0.4 / 3** | 14 / 700 / 1.6 / 4 | **20 / 1 100 / 3.4 / 6** | **14 / 600 / 2.0 / 5** | **20 / 850 / 4.0 / 7** | **14 / 580 / 2.4 / 3** | **16 / 600 / 2.2 / 5** | **22 / 850 / 4.5 / 8** | **15 / 650 / 2.0 / 5** |
|  6 | 8 / 1500 / 0.2 / 2 | 18 / 2 000 / 1.0 / 3 | **26 / 3 200 / 2.5 / 5** | **18 / 1 800 / 1.5 / 4** | **26 / 2 800 / 3.0 / 6** | 20 / 2 500 / 1.5 / 2 | **20 / 1 800 / 1.6 / 4** | **28 / 2 800 / 3.2 / 7** | **19 / 1 900 / 1.5 / 4** |
|  7 | **11 / 4 200 / 0.3 / 3** | 22 / 5 000 / 2.0 / 4 | **32 / 8 000 / 3.5 / 6** | 24 / 6 000 / 3.5 / 5 | **34 / 8 500 / 4.0 / 7** | **23 / 5 500 / 2.5 / 3** | **25 / 5 500 / 2.5 / 5** | **35 / 8 200 / 4.5 / 8** | **24 / 6 200 / 2.2 / 5** |
|  8 | 14 / 8 000 / 0.2 / 2 | 28 / 12 000 / 1.2 / 3 | **42 / 22 000 / 2.5 / 5** | **30 / 12 500 / 1.8 / 4** | **42 / 22 000 / 3.5 / 6** | **30 / 13 000 / 1.5 / 2** | **32 / 12 500 / 1.6 / 4** | **45 / 22 000 / 3.5 / 7** | **31 / 13 200 / 1.5 / 4** |
|  9 | **20 / 35 000 / 0.2 / 2** | 36 / 50 000 / 1.0 / 3 | **52 / 90 000 / 2.0 / 5** | **40 / 55 000 / 1.5 / 4** | **55 / 95 000 / 3.0 / 6** | **40 / 55 000 / 1.4 / 2** | **42 / 55 000 / 1.4 / 4** | **58 / 95 000 / 3.0 / 7** | **40 / 56 000 / 1.4 / 4** |
| 10 | **30 / 90 000 / 0.2 / 2** | 50 / 120 000 / 0.8 / 3 | **75 / 240 000 / 1.8 / 5** | **55 / 130 000 / 1.4 / 4** | **75 / 240 000 / 2.6 / 6** | **55 / 130 000 / 1.2 / 2** | **58 / 130 000 / 1.4 / 4** | **78 / 240 000 / 2.8 / 7** | **55 / 130 000 / 1.4 / 4** |

### 4.2. Стрелковое и метательное

| Тир | bow (2H) | crossbow (2H) | throwing | exotic / staff (2H) |
|---|---|---|---|---|
|  1 | 4 / 18 / 1.0 / 3 | **3 / 25 / 2.0 / 2** | 2 / 1 / 0.5 / 2 (камни) | 3 / 5 / 2.0 / 4 (дерев.) |
|  2 | 6 / 50 / 1.5 / 3 | 7 / 60 / 2.5 / 2 | 4 / 25 / 0.3 / 2 (ножи) <br> 6 / 15 / 0.8 / 2 (дротик) | **5 / 35 / 2.0 / 4** (окованный) |
|  3 | **8 / 130 / 1.4 / 3** | **10 / 160 / 3.2 / 2** | **6 / 60 / 0.4 / 2** (стальные) | 7 / 70 / 3.0 / 4 (железн.) |
|  4 | 10 / 280 / 1.2 / 3 | 14 / 300 / 4.0 / 2 | **8 / 150 / 0.5 / 2** (балансир.) | **9 / 250 / 2.2 / 4** (стальн.) |
|  5 | **13 / 700 / 1.0 / 3** | **18 / 800 / 4.0 / 2** | **10 / 350 / 0.4 / 2** (закал.) | 6 / 800 / 1.5 / 3 (магический) |
|  6 | 16 / 2 200 / 0.8 / 2 | **22 / 2 600 / 3.5 / 2** | **13 / 1 300 / 0.3 / 2** (митрил.) | **10 / 2 500 / 1.4 / 3** (рунный) |
|  7 | **20 / 5 500 / 0.8 / 3** | **28 / 6 500 / 4.0 / 2** | **16 / 4 200 / 0.3 / 2** (чёрные) | **14 / 6 500 / 1.4 / 3** (тёмный) |
|  8 | **26 / 13 000 / 0.7 / 2** | **35 / 15 000 / 3.5 / 2** | **20 / 9 000 / 0.3 / 2** (звёздн.) | **18 / 14 000 / 1.2 / 3** (звёздн.) |
|  9 | **34 / 50 000 / 0.6 / 2** | **45 / 60 000 / 3.0 / 2** | **28 / 35 000 / 0.2 / 2** (орихалк) | **24 / 55 000 / 1.0 / 3** (орихалк) |
| 10 | **48 / 130 000 / 0.5 / 2** | **62 / 150 000 / 2.5 / 2** | **40 / 90 000 / 0.2 / 2** (адамант) | **34 / 130 000 / 0.8 / 3** (мифич.) |

> Метательное на T9–10 теряет смысл «расходника», но с тиром делается **стопкой 1–2 шт** (как Sigil-предмет).

---

## 5. Готовые JS-фрагменты для заполнения пробелов

Ниже — куски кода, которые можно **вставить как есть** в `module/constants/items-catalog.mjs`
в соответствующие секции `WEAPONS`. Имена id выбраны в стиле существующих (без коллизий).

### 5.1. Ножи — недостающие тиры

```javascript
  hardened_knife:   { id:"hardened_knife",  label:"Закалённый кинжал",   tier:5,  skill:"knife", damage:7,  weight:0.4, value:350,    twoHanded:false, energyCost:3, gridW:1, gridH:2 },
  darkiron_knife:   { id:"darkiron_knife",  label:"Кинжал тёмного железа",tier:7, skill:"knife", damage:11, weight:0.3, value:4200,   twoHanded:false, energyCost:3, gridW:1, gridH:2 },
  orichalcum_knife: { id:"orichalcum_knife",label:"Орихалковый кинжал",  tier:9,  skill:"knife", damage:20, weight:0.2, value:35000,  twoHanded:false, energyCost:2, gridW:1, gridH:2, damageType:"magical" },
  godsplitter_dagger:{id:"godsplitter_dagger",label:"Кинжал Богоруба",    tier:10, skill:"knife", damage:30, weight:0.2, value:90000,  twoHanded:false, energyCost:2, gridW:1, gridH:2, damageType:"magical" },
```

### 5.2. Двуручные мечи — закрыть тиры 1, 2, 5–10

```javascript
  bronze_greatsword:    { id:"bronze_greatsword",   label:"Бронзовый двуруч",   tier:2,  skill:"sword", damage:9,  weight:3.5, value:110,   twoHanded:true, energyCost:6, gridW:1, gridH:4 },
  tempered_greatsword:  { id:"tempered_greatsword", label:"Закалённый двуруч",  tier:5,  skill:"sword", damage:20, weight:3.4, value:1100,  twoHanded:true, energyCost:6, gridW:1, gridH:4 },
  mithril_greatsword:   { id:"mithril_greatsword",  label:"Митрильный двуруч",  tier:6,  skill:"sword", damage:26, weight:2.5, value:3200,  twoHanded:true, energyCost:5, gridW:1, gridH:4 },
  darkiron_greatsword:  { id:"darkiron_greatsword", label:"Двуруч тёмн. железа",tier:7,  skill:"sword", damage:32, weight:3.5, value:8000,  twoHanded:true, energyCost:6, gridW:1, gridH:4 },
  starmetal_greatsword: { id:"starmetal_greatsword",label:"Звёздный двуруч",    tier:8,  skill:"sword", damage:42, weight:2.5, value:22000, twoHanded:true, energyCost:5, gridW:1, gridH:4, damageType:"magical" },
  orichalcum_greatsword:{ id:"orichalcum_greatsword",label:"Двуруч Орихалка",   tier:9,  skill:"sword", damage:52, weight:2.0, value:90000, twoHanded:true, energyCost:5, gridW:1, gridH:4, damageType:"magical" },
  worldsplitter:        { id:"worldsplitter",       label:"Мирорассекатель Великий",tier:10,skill:"sword",damage:75,weight:1.8, value:240000,twoHanded:true, energyCost:5, gridW:1, gridH:4, damageType:"magical" },
```

### 5.3. Топоры — закрыть T5, T6, T8, T9, T10 + двуручные

```javascript
  hardened_axe:      { id:"hardened_axe",     label:"Закалённый топор",      tier:5, skill:"axe", damage:14, weight:2.0, value:600,    twoHanded:false, energyCost:5, gridW:1, gridH:2 },
  mithril_axe:       { id:"mithril_axe",      label:"Митрильный топор",      tier:6, skill:"axe", damage:18, weight:1.5, value:1800,   twoHanded:false, energyCost:4, gridW:1, gridH:2 },
  starmetal_axe:     { id:"starmetal_axe",    label:"Звёздный топор",        tier:8, skill:"axe", damage:30, weight:1.8, value:12500,  twoHanded:false, energyCost:4, gridW:1, gridH:2, damageType:"magical" },
  orichalcum_axe:    { id:"orichalcum_axe",   label:"Орихалковый топор",     tier:9, skill:"axe", damage:40, weight:1.5, value:55000,  twoHanded:false, energyCost:4, gridW:1, gridH:2, damageType:"magical" },
  adamantium_axe:    { id:"adamantium_axe",   label:"Адамантиевый топор",    tier:10,skill:"axe", damage:55, weight:1.4, value:130000, twoHanded:false, energyCost:4, gridW:1, gridH:2, damageType:"magical" },
  // 2H секиры
  bronze_greataxe:   { id:"bronze_greataxe",  label:"Бронзовая секира",      tier:2, skill:"axe", damage:9,  weight:3.5, value:100,    twoHanded:true,  energyCost:7, gridW:1, gridH:3 },
  iron_greataxe:     { id:"iron_greataxe",    label:"Железная секира",       tier:3, skill:"axe", damage:12, weight:4.0, value:240,    twoHanded:true,  energyCost:7, gridW:1, gridH:3 },
  tempered_greataxe: { id:"tempered_greataxe",label:"Закалённая секира",     tier:5, skill:"axe", damage:20, weight:4.0, value:850,    twoHanded:true,  energyCost:7, gridW:1, gridH:3 },
  mithril_greataxe:  { id:"mithril_greataxe", label:"Митрильная секира",     tier:6, skill:"axe", damage:26, weight:3.0, value:2800,   twoHanded:true,  energyCost:6, gridW:1, gridH:3 },
  darkiron_greataxe: { id:"darkiron_greataxe",label:"Секира тёмн. железа",   tier:7, skill:"axe", damage:34, weight:4.0, value:8500,   twoHanded:true,  energyCost:7, gridW:1, gridH:3 },
  starmetal_greataxe:{ id:"starmetal_greataxe",label:"Звёздная секира",       tier:8, skill:"axe", damage:42, weight:3.5, value:22000,  twoHanded:true,  energyCost:6, gridW:1, gridH:3, damageType:"magical" },
  orichalcum_greataxe:{id:"orichalcum_greataxe",label:"Секира Орихалка",      tier:9, skill:"axe", damage:55, weight:3.0, value:95000,  twoHanded:true,  energyCost:6, gridW:1, gridH:3, damageType:"magical" },
  cataclysm_axe:     { id:"cataclysm_axe",    label:"Секира Катаклизма",     tier:10,skill:"axe", damage:75, weight:2.6, value:240000, twoHanded:true,  energyCost:6, gridW:1, gridH:3, damageType:"magical" },
```

### 5.4. Копья — закрыть T5, T7–10

```javascript
  hardened_spear:   { id:"hardened_spear",  label:"Закалённое копьё",  tier:5,  skill:"spear", damage:14, weight:2.4, value:580,    twoHanded:true, energyCost:3, gridW:1, gridH:4 },
  darkiron_spear:   { id:"darkiron_spear",  label:"Копьё тёмн. железа",tier:7,  skill:"spear", damage:23, weight:2.5, value:5500,   twoHanded:true, energyCost:3, gridW:1, gridH:4 },
  starmetal_spear:  { id:"starmetal_spear", label:"Звёздное копьё",    tier:8,  skill:"spear", damage:30, weight:1.5, value:13000,  twoHanded:true, energyCost:2, gridW:1, gridH:4, damageType:"magical" },
  orichalcum_spear: { id:"orichalcum_spear",label:"Копьё Орихалка",    tier:9,  skill:"spear", damage:40, weight:1.4, value:55000,  twoHanded:true, energyCost:2, gridW:1, gridH:4, damageType:"magical" },
  worldspear:       { id:"worldspear",      label:"Копьё Мирового Дерева",tier:10,skill:"spear",damage:55,weight:1.2, value:130000, twoHanded:true, energyCost:2, gridW:1, gridH:4, damageType:"magical" },
```

### 5.5. Булавы и кистени — закрыть всё, кроме T1, T3, T4

```javascript
  bronze_mace:        { id:"bronze_mace",       label:"Бронзовая булава",       tier:2,  skill:"mace",  damage:6,  weight:1.8, value:30,    twoHanded:false, energyCost:5, gridW:1, gridH:2 },
  hardened_mace:      { id:"hardened_mace",     label:"Закалённая булава",      tier:5,  skill:"mace",  damage:16, weight:2.2, value:600,   twoHanded:false, energyCost:5, gridW:1, gridH:2 },
  mithril_mace:       { id:"mithril_mace",      label:"Митрильная булава",      tier:6,  skill:"mace",  damage:20, weight:1.6, value:1800,  twoHanded:false, energyCost:4, gridW:1, gridH:2 },
  darkiron_mace:      { id:"darkiron_mace",     label:"Булава тёмн. железа",    tier:7,  skill:"mace",  damage:25, weight:2.5, value:5500,  twoHanded:false, energyCost:5, gridW:1, gridH:2 },
  starmetal_mace:     { id:"starmetal_mace",    label:"Звёздная булава",        tier:8,  skill:"mace",  damage:32, weight:1.6, value:12500, twoHanded:false, energyCost:4, gridW:1, gridH:2, damageType:"magical" },
  orichalcum_mace:    { id:"orichalcum_mace",   label:"Орихалковая булава",     tier:9,  skill:"mace",  damage:42, weight:1.4, value:55000, twoHanded:false, energyCost:4, gridW:1, gridH:2, damageType:"magical" },
  doomhammer:         { id:"doomhammer",        label:"Молот Рока",             tier:10, skill:"mace",  damage:58, weight:1.4, value:130000,twoHanded:false, energyCost:4, gridW:1, gridH:2, damageType:"magical" },
  // 2H молоты
  iron_warhammer:     { id:"iron_warhammer",    label:"Железный боевой молот",  tier:3,  skill:"mace",  damage:12, weight:4.0, value:230,   twoHanded:true,  energyCost:7, gridW:1, gridH:3 },
  hardened_warhammer: { id:"hardened_warhammer",label:"Закалённый боевой молот",tier:5,  skill:"mace",  damage:22, weight:4.5, value:850,   twoHanded:true,  energyCost:8, gridW:1, gridH:3 },
  mithril_warhammer:  { id:"mithril_warhammer", label:"Митрильный молот",       tier:6,  skill:"mace",  damage:28, weight:3.2, value:2800,  twoHanded:true,  energyCost:7, gridW:1, gridH:3 },
  darkiron_warhammer: { id:"darkiron_warhammer",label:"Молот тёмн. железа",     tier:7,  skill:"mace",  damage:35, weight:4.5, value:8200,  twoHanded:true,  energyCost:8, gridW:1, gridH:3 },
  // Кистени
  bronze_flail:       { id:"bronze_flail",      label:"Бронзовый кистень",      tier:2,  skill:"flail", damage:5,  weight:1.8, value:38,    twoHanded:false, energyCost:5, gridW:1, gridH:2 },
  iron_flail:         { id:"iron_flail",        label:"Железный кистень",       tier:3,  skill:"flail", damage:7,  weight:2.0, value:95,    twoHanded:false, energyCost:5, gridW:1, gridH:2 },
  hardened_flail:     { id:"hardened_flail",    label:"Закалённый кистень",     tier:5,  skill:"flail", damage:15, weight:2.0, value:650,   twoHanded:false, energyCost:5, gridW:1, gridH:2 },
  mithril_flail:      { id:"mithril_flail",     label:"Митрильный кистень",     tier:6,  skill:"flail", damage:19, weight:1.5, value:1900,  twoHanded:false, energyCost:4, gridW:1, gridH:2 },
```

### 5.6. Луки — закрыть T3, T5, T7–10

```javascript
  hunters_bow:    { id:"hunters_bow",   label:"Охотничий лук",       tier:3,  skill:"bow", damage:8,  weight:1.4, value:130,    twoHanded:true, energyCost:3, gridW:1, gridH:4 },
  warbow:         { id:"warbow",        label:"Боевой лук",          tier:5,  skill:"bow", damage:13, weight:1.0, value:700,    twoHanded:true, energyCost:3, gridW:1, gridH:4 },
  darkiron_bow:   { id:"darkiron_bow",  label:"Лук тёмного железа",  tier:7,  skill:"bow", damage:20, weight:0.8, value:5500,   twoHanded:true, energyCost:3, gridW:1, gridH:4 },
  starmetal_bow:  { id:"starmetal_bow", label:"Звёздный лук",        tier:8,  skill:"bow", damage:26, weight:0.7, value:13000,  twoHanded:true, energyCost:2, gridW:1, gridH:4, damageType:"magical" },
  orichalcum_bow: { id:"orichalcum_bow",label:"Орихалковый лук",     tier:9,  skill:"bow", damage:34, weight:0.6, value:50000,  twoHanded:true, energyCost:2, gridW:1, gridH:4, damageType:"magical" },
  starborn_bow:   { id:"starborn_bow",  label:"Лук Звёздного Сердца",tier:10, skill:"bow", damage:48, weight:0.5, value:130000, twoHanded:true, energyCost:2, gridW:1, gridH:4, damageType:"magical" },
```

### 5.7. Арбалеты — закрыть T1, T3, T5–10

```javascript
  hand_crossbow:    { id:"hand_crossbow",   label:"Ручной арбалет",         tier:1, skill:"crossbow", damage:3,  weight:2.0, value:25,     twoHanded:true, energyCost:2, gridW:1, gridH:2 },
  iron_crossbow:    { id:"iron_crossbow",   label:"Железный арбалет",       tier:3, skill:"crossbow", damage:10, weight:3.2, value:160,    twoHanded:true, energyCost:2, gridW:1, gridH:3 },
  arbalest:         { id:"arbalest",        label:"Арбалет-аркбалист",      tier:5, skill:"crossbow", damage:18, weight:4.0, value:800,    twoHanded:true, energyCost:2, gridW:1, gridH:3 },
  mithril_crossbow: { id:"mithril_crossbow",label:"Митрильный арбалет",     tier:6, skill:"crossbow", damage:22, weight:3.5, value:2600,   twoHanded:true, energyCost:2, gridW:1, gridH:3 },
  darkiron_crossbow:{ id:"darkiron_crossbow",label:"Арбалет тёмн. железа",  tier:7, skill:"crossbow", damage:28, weight:4.0, value:6500,   twoHanded:true, energyCost:2, gridW:1, gridH:3 },
  starmetal_crossbow:{id:"starmetal_crossbow",label:"Звёздный арбалет",     tier:8, skill:"crossbow", damage:35, weight:3.5, value:15000,  twoHanded:true, energyCost:2, gridW:1, gridH:3, damageType:"magical" },
  orichalcum_crossbow:{id:"orichalcum_crossbow",label:"Орихалковый арбалет",tier:9, skill:"crossbow", damage:45, weight:3.0, value:60000,  twoHanded:true, energyCost:2, gridW:1, gridH:3, damageType:"magical" },
  voidpiercer:      { id:"voidpiercer",     label:"Пронзатель Пустоты",     tier:10,skill:"crossbow", damage:62, weight:2.5, value:150000, twoHanded:true, energyCost:2, gridW:1, gridH:3, damageType:"magical" },
```

### 5.8. Метательное — расширить до T10

```javascript
  steel_throwing_knives:{ id:"steel_throwing_knives",label:"Стальные мет. ножи",   tier:3, skill:"throwing", damage:6,  weight:0.4, value:60,    twoHanded:false, energyCost:2, gridW:1, gridH:1 },
  balanced_javelin:     { id:"balanced_javelin",     label:"Балансированный дротик",tier:4, skill:"throwing", damage:8,  weight:0.5, value:150,   twoHanded:false, energyCost:2, gridW:1, gridH:3 },
  hardened_throwing:    { id:"hardened_throwing",    label:"Закалённые метат. ножи",tier:5, skill:"throwing", damage:10, weight:0.4, value:350,   twoHanded:false, energyCost:2, gridW:1, gridH:1 },
  mithril_throwing:     { id:"mithril_throwing",     label:"Митрильные мет. ножи",  tier:6, skill:"throwing", damage:13, weight:0.3, value:1300,  twoHanded:false, energyCost:2, gridW:1, gridH:1 },
  darkiron_throwing:    { id:"darkiron_throwing",    label:"Чёрные метат. ножи",    tier:7, skill:"throwing", damage:16, weight:0.3, value:4200,  twoHanded:false, energyCost:2, gridW:1, gridH:1, damageType:"magical" },
  starmetal_throwing:   { id:"starmetal_throwing",   label:"Звёздные мет. ножи",    tier:8, skill:"throwing", damage:20, weight:0.3, value:9000,  twoHanded:false, energyCost:2, gridW:1, gridH:1, damageType:"magical" },
  orichalcum_throwing:  { id:"orichalcum_throwing",  label:"Орихалк. мет. кинжалы", tier:9, skill:"throwing", damage:28, weight:0.2, value:35000, twoHanded:false, energyCost:2, gridW:1, gridH:1, damageType:"magical" },
  godsteel_throwing:    { id:"godsteel_throwing",    label:"Перья Богов",           tier:10,skill:"throwing", damage:40, weight:0.2, value:90000, twoHanded:false, energyCost:2, gridW:1, gridH:1, damageType:"magical" },
```

### 5.9. Посохи — закрыть T2, T4, T6–10

```javascript
  oak_staff:        { id:"oak_staff",       label:"Дубовый посох",       tier:2,  skill:"exotic", damage:5,  weight:2.0, value:35,     twoHanded:true, energyCost:4, gridW:1, gridH:4 },
  steel_staff:      { id:"steel_staff",     label:"Стальной посох",      tier:4,  skill:"exotic", damage:9,  weight:2.2, value:250,    twoHanded:true, energyCost:4, gridW:1, gridH:4 },
  rune_staff:       { id:"rune_staff",      label:"Рунный посох",        tier:6,  skill:"exotic", damage:10, weight:1.4, value:2500,   twoHanded:true, energyCost:3, gridW:1, gridH:4, damageType:"magical" },
  darkwood_staff:   { id:"darkwood_staff",  label:"Посох тёмн. дерева",  tier:7,  skill:"exotic", damage:14, weight:1.4, value:6500,   twoHanded:true, energyCost:3, gridW:1, gridH:4, damageType:"magical" },
  starmetal_staff:  { id:"starmetal_staff", label:"Звёздный посох",      tier:8,  skill:"exotic", damage:18, weight:1.2, value:14000,  twoHanded:true, energyCost:3, gridW:1, gridH:4, damageType:"magical" },
  orichalcum_staff: { id:"orichalcum_staff",label:"Орихалковый посох",   tier:9,  skill:"exotic", damage:24, weight:1.0, value:55000,  twoHanded:true, energyCost:3, gridW:1, gridH:4, damageType:"magical" },
  archmage_staff:   { id:"archmage_staff",  label:"Посох Архимага",      tier:10, skill:"exotic", damage:34, weight:0.8, value:130000, twoHanded:true, energyCost:3, gridW:1, gridH:4, damageType:"magical" },
```

> **После добавления:** запустить миграцию таксономии не нужно (id новые, конфликтов нет).
> Существующие сейвы продолжат работать без изменений.

---

## 6. Промпты для нейронок-генераторов

### 6.1. Базовый шаблон

Любой промпт строится из 5 слоёв:

```
[ОБЪЕКТ] [МАТЕРИАЛ-ТИР] [СОСТОЯНИЕ] [ОСВЕЩЕНИЕ/ФОН] [ТЕХНИЧЕСКИЕ ТЕГИ]
```

**Технические теги (общие для всех тиров):**
```
isolated single object on plain dark background, centered, full item visible,
side view, no human, no hands, sharp focus, high detail, painterly style,
fantasy item icon, 1024x1024, soft rim light, slight specular highlights
```

**Negative prompt (общий):**
```
text, watermark, logo, signature, blurry, low quality, multiple objects,
hands, person, character, perspective distortion, cluttered background, nsfw
```

### 6.2. Стилевая база по тирам

| Тир | Material keywords (EN) | State / mood | Lighting |
|---|---|---|---|
| 1 | `rough copper, crude bronze, untreated wood, tied with sinew` | `worn, scratched, chipped edge, peasant tool` | `dim warm campfire light` |
| 2 | `bronze fittings, oak wood, tin rivets, rough leather` | `tribal, hand-forged, well-used` | `daylight, neutral` |
| 3 | `iron, hardwood, carbonized leather, simple etchings` | `standard issue, town-blacksmith made` | `forge embers in background` |
| 4 | `steel, ironwood, bronze inlays, riveted leather, family crest engraving` | `well-maintained, polished, decorative` | `clean white studio light` |
| 5 | `tempered steel, spirit wood, sapphire inlay, mithril runes` | `master-crafted, faint magical etching` | `cool blue rim light` |
| 6 | `mithril, ebony wood, silver runes, diamond inlay` | `elven/dwarven luxury, glowing engravings` | `soft silver glow, magical particles` |
| 7 | `dark iron, eternal wood, void crystal, purple veins` | `ominous, brooding, menacing presence` | `deep purple glow, smoke wisps` |
| 8 | `starmetal, world-tree wood, blue cosmic veins, dragon-leather grip` | `celestial, otherworldly, slowly rotating runes` | `cosmic blue/violet glow, starfield bokeh` |
| 9 | `orichalcum, golden-red metal, star-shard accents, leviathan leather` | `legendary, ornate, divine craftsmanship` | `golden light, lens flare, sparks` |
| 10 | `adamantium, mythril, star-heart core, godsteel` | `mythical, reality-warping, primordial weapon` | `intense aura, bent space around blade, cracks of light` |

### 6.3. Промпт по типу оружия (вставка `[OBJECT]`)

| Skill key  | Промпт-фрагмент объекта |
|---|---|
| `knife`     | `a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip` |
| `sword 1H`  | `a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip` |
| `sword 2H`  | `a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip` |
| `axe 1H`    | `a single fantasy hand axe, single-bit head, wooden haft, iron banding` |
| `axe 2H`    | `a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets` |
| `spear`     | `a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap` |
| `mace 1H`   | `a single fantasy mace, flanged head, short metal haft, leather grip` |
| `mace 2H`   | `a single fantasy two-handed war hammer, large blunt head with spike on back, long haft` |
| `flail`     | `a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking` |
| `bow`       | `a single fantasy longbow / shortbow, recurve limbs, drawstring, no arrow nocked` |
| `crossbow`  | `a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded` |
| `throwing`  | `a set of three fantasy throwing knives arranged in a fan, balanced, identical` |
| `staff`     | `a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating` |

### 6.4. Готовые промпты для каждого тира (на примере 1H-меча)

> Шаблон: подставь `[OBJECT]` из раздела 6.3 и присоедини стилевую базу из 6.2.

**T1 — Медный меч** *(`copper_sword`)*
```
A single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip,
made of rough copper with crude bronze pommel, untreated oak handle wrapped in sinew,
worn, scratched, chipped edge, peasant militia weapon,
isolated single object on plain dark background, centered, full item visible, side view,
sharp focus, high detail, painterly style, fantasy item icon, 1024x1024,
soft rim light, dim warm campfire light, slight specular highlights
```

**T3 — Железный меч** *(`iron_sword`)*
```
A single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip,
forged of polished iron, oak handle, simple geometric etchings on the blade,
standard issue, town-blacksmith made, well-used but maintained,
isolated single object on plain dark background, centered, full item visible, side view,
sharp focus, high detail, painterly style, fantasy item icon, 1024x1024,
forge embers glow in background
```

**T5 — Закалённый меч** *(`tempered_sword`)*
```
A single fantasy arming sword, slightly curved fuller, straight blade, cross guard with sapphire inlay,
made of tempered blue-silver steel, spirit-wood grip, faint mithril runes etched along the fuller,
master-crafted weapon, faint magical etching, polished surfaces,
isolated single object on plain dark background, centered, full item visible, side view,
sharp focus, high detail, painterly style, fantasy item icon, 1024x1024,
cool blue rim light, runes faintly glowing
```

**T6 — Митрильный меч** *(`mithril_sword`)*
```
A single fantasy arming sword, slim elegant blade, cross guard adorned with silver runes,
forged from mithril (silver-white metal with faint blue sheen), ebony wood handle, diamond pommel,
elven/dwarven luxury craftsmanship, glowing silver engravings,
isolated single object on plain dark background, centered, full item visible, side view,
sharp focus, high detail, painterly style, fantasy item icon, 1024x1024,
soft silver glow, magical particles drifting upward
```

**T7 — Тёмный клинок** *(`dark_blade`)*
```
A single fantasy arming sword, jagged dark blade with purple crystal veins,
forged of dark iron with eternal-wood grip, void-crystal pommel, faint smoke rising from the edge,
ominous brooding weapon, menacing presence, evil-looking,
isolated single object on plain dark background, centered, full item visible, side view,
sharp focus, high detail, painterly style, fantasy item icon, 1024x1024,
deep purple glow, wisps of smoke, ember-like sparks
```

**T8 — Клинок Пустоты** *(`void_blade`)*
```
A single fantasy arming sword, otherworldly blade with cosmic blue and violet veins,
forged from starmetal (deep blue metal with starfield interior), world-tree wood grip,
dragon-leather wrapping, slowly rotating runes along the blade,
celestial weapon, otherworldly, primordial,
isolated single object on plain dark background, centered, full item visible, side view,
sharp focus, high detail, painterly style, fantasy item icon, 1024x1024,
cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes
```

**T10 — Мирорассекатель** *(`world_cutter`)*
```
A single fantasy arming sword of mythical power, blade made of adamantium with starheart core,
golden-red godsteel hilt with leviathan leather grip, reality bending around the edge,
mythical primordial weapon, wielded by gods, cracks of light leaking from the blade,
isolated single object on plain dark background, centered, full item visible, side view,
sharp focus, high detail, painterly style, fantasy item icon, 1024x1024,
intense divine aura, space-time distortion, lens flare, sparks of pure light
```

### 6.5. Шорткат для пакетной генерации

Чтобы быстро сгенерировать пачку, используй этот **CSV-шаблон** (одна строка на предмет):

```
id,prompt,negative
copper_sword,"[T1 шаблон с object=sword 1H]",text watermark blurry hands
bronze_sword,"[T2 шаблон с object=sword 1H]",text watermark blurry hands
iron_sword,"[T3 шаблон с object=sword 1H]",text watermark blurry hands
...
```

**Размер картинки в Foundry:** 256×256 для иконок предметов в инвентаре, 512×512 для chat
preview. ИИ-модели лучше генерируют в 1024×1024, потом ресайзить.

**Куда класть:** `systems/iron-hills-system/icons/items/weapons/{id}.webp`
(если такой папки ещё нет — создашь при первой генерации, я добавлю в `system.json` пути).

---

## 7. План внедрения

1. ✅ Дубль `mithril_helm` / `mithril_chest` исправлен.
2. **Тебе:** прогнать промпты из §6.4 через ИИ-генератор для **уже существующих** позиций (это ~50 предметов).
3. **Мне:** добавить недостающие позиции из §5.1–5.9 в `WEAPONS` (по твоему сигналу).
4. **Тебе:** прогнать промпты для **новых** позиций из §5.
5. После того как картинки будут готовы — добавим поле `img: "icons/items/weapons/{id}.webp"` в каждую позицию.

---

## 8. Открытые вопросы для тебя

- **Дальность лук/арбалет/метательное** — сейчас в `WEAPONS` нет поля `range`, оно фиксированное.
  Ввести? (рекомендую: bow=8, crossbow=10, throwing=4)
- **Спецэффекты артефактов T9–T10** — сейчас они отличаются только цифрами. Хочешь
  им уникальные пассивки (`world_cutter` игнорирует 50% брони, `worldsplitter` шанс
  обезоружить, etc.)? Это правится в `combat-attack-service.resolveSingleAttack` через
  поле `weapon.system.affixes`.
- **Особые имена для T10** — если у тебя свой пантеон/лор для Iron Hills, замени
  `worldsplitter`, `cataclysm_axe`, `voidpiercer`, `godsplitter_dagger`,
  `archmage_staff`, `doomhammer`, `starborn_bow` своими.
