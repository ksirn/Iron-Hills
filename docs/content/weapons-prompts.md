# Iron Hills — AI-промпты для всех weapon-позиций

> Автогенерация из `WEAPONS` (см. `tools/generate-weapon-prompts.mjs`).
> Если в каталоге появятся новые позиции — перегенерируй командой:
> `node tools/generate-weapon-prompts.mjs`

**Правила использования:**
- Каждый промпт уже содержит правильный aspect ratio (`--ar 1:3`, `--ar 1:4`, ...) и resolution.
- Картинку клади в `icons/items/weapons/{id}.webp` (где `{id}` указан в заголовке блока).
- После добавления картинок выполни `node tools/apply-weapon-images.mjs` — скрипт пропишет `img:` в `items-catalog.mjs`.

**Negative prompt (один на все):**
```
text, watermark, logo, signature, blurry, low quality, multiple objects, hands, person, character, perspective distortion, cluttered background, horizontal layout, sideways, nsfw
```


## Тир 1

### Медный топор *(`copper_axe`, axe, 1×2, AR 1:2, 768x1536)*

```
Concept of "Медный топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, dim warm campfire light --ar 1:2
```

### Короткий лук *(`short_bow`, bow, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Короткий лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, dim warm campfire light --ar 1:3
```

### Ручной арбалет *(`hand_crossbow`, crossbow, 2H, 1×2, AR 1:2, 768x1536)*

```
Concept of "Ручной арбалет", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, dim warm campfire light --ar 1:2
```

### Деревянный посох *(`wooden_staff`, exotic, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Деревянный посох", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, dim warm campfire light --ar 1:4
```

### Медный нож *(`copper_knife`, knife, 1×2, AR 1:2, 768x1536)*

```
Concept of "Медный нож", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, dim warm campfire light --ar 1:2
```

### Медная булава *(`copper_mace`, mace, 1×2, AR 1:2, 768x1536)*

```
Concept of "Медная булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, dim warm campfire light --ar 1:2
```

### Медное копьё *(`copper_spear`, spear, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Медное копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, dim warm campfire light --ar 1:4
```

### Медный меч *(`copper_sword`, sword, 1×3, AR 1:3, 512x1536)*

```
Concept of "Медный меч", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, dim warm campfire light --ar 1:3
```

### Метательные камни *(`throwing_stones`, throwing, 1×1, AR 1:1, 1024x1024)*

```
Concept of "Метательные камни", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of rough copper, crude bronze, untreated wood, tied with sinew, worn, scratched, chipped edge, peasant militia tool, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, dim warm campfire light --ar 1:1
```


## Тир 2

### Бронзовый топор *(`bronze_axe`, axe, 1×2, AR 1:2, 768x1536)*

```
Concept of "Бронзовый топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, neutral daylight --ar 1:2
```

### Бронзовая секира *(`bronze_greataxe`, axe, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Бронзовая секира", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, neutral daylight --ar 1:3
```

### Длинный лук *(`long_bow`, bow, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Длинный лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, neutral daylight --ar 1:4
```

### Лёгкий арбалет *(`lt_crossbow`, crossbow, 2H, 1×2, AR 1:2, 768x1536)*

```
Concept of "Лёгкий арбалет", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, neutral daylight --ar 1:2
```

### Дубовый посох *(`oak_staff`, exotic, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Дубовый посох", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, neutral daylight --ar 1:4
```

### Бронзовый кистень *(`bronze_flail`, flail, 1×2, AR 1:2, 768x1536)*

```
Concept of "Бронзовый кистень", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, neutral daylight --ar 1:2
```

### Бронзовый нож *(`bronze_knife`, knife, 1×2, AR 1:2, 768x1536)*

```
Concept of "Бронзовый нож", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, neutral daylight --ar 1:2
```

### Бронзовая булава *(`bronze_mace`, mace, 1×2, AR 1:2, 768x1536)*

```
Concept of "Бронзовая булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, neutral daylight --ar 1:2
```

### Бронзовый молот *(`bronze_warhammer`, mace, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Бронзовый молот", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, neutral daylight --ar 1:3
```

### Бронзовое копьё *(`bronze_spear`, spear, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Бронзовое копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, neutral daylight --ar 1:4
```

### Бронзовый двуруч *(`bronze_greatsword`, sword, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Бронзовый двуруч", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, neutral daylight --ar 1:4
```

### Бронзовый меч *(`bronze_sword`, sword, 1×3, AR 1:3, 512x1536)*

```
Concept of "Бронзовый меч", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, neutral daylight --ar 1:3
```

### Дротик *(`javelin`, throwing, 1×3, AR 1:3, 512x1536)*

```
Concept of "Дротик", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, neutral daylight --ar 1:3
```

### Метательные ножи *(`throwing_knives`, throwing, 1×1, AR 1:1, 1024x1024)*

```
Concept of "Метательные ножи", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of bronze fittings, oak wood, tin rivets, rough leather wrap, tribal, hand-forged, well-used, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, neutral daylight --ar 1:1
```


## Тир 3

### Железный топор *(`iron_axe`, axe, 1×2, AR 1:2, 768x1536)*

```
Concept of "Железный топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, forge embers glow in background --ar 1:2
```

### Железная секира *(`iron_greataxe`, axe, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Железная секира", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, forge embers glow in background --ar 1:3
```

### Охотничий лук *(`hunters_bow`, bow, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Охотничий лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, forge embers glow in background --ar 1:4
```

### Железный арбалет *(`iron_crossbow`, crossbow, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Железный арбалет", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, forge embers glow in background --ar 1:3
```

### Железный посох *(`iron_staff`, exotic, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Железный посох", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, forge embers glow in background --ar 1:4
```

### Железный кистень *(`iron_flail`, flail, 1×2, AR 1:2, 768x1536)*

```
Concept of "Железный кистень", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, forge embers glow in background --ar 1:2
```

### Железный нож *(`iron_knife`, knife, 1×2, AR 1:2, 768x1536)*

```
Concept of "Железный нож", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, forge embers glow in background --ar 1:2
```

### Железная булава *(`iron_mace`, mace, 1×2, AR 1:2, 768x1536)*

```
Concept of "Железная булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, forge embers glow in background --ar 1:2
```

### Железный молот *(`iron_warhammer`, mace, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Железный молот", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, forge embers glow in background --ar 1:3
```

### Железное копьё *(`iron_spear`, spear, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Железное копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, forge embers glow in background --ar 1:4
```

### Железный двуруч *(`iron_greatsword`, sword, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Железный двуруч", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, forge embers glow in background --ar 1:4
```

### Железный меч *(`iron_sword`, sword, 1×3, AR 1:3, 512x1536)*

```
Concept of "Железный меч", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, forge embers glow in background --ar 1:3
```

### Железный дротик *(`iron_javelin`, throwing, 1×3, AR 1:3, 512x1536)*

```
Concept of "Железный дротик", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of polished iron, hardwood haft, carbonized leather, simple etchings, standard issue, town-blacksmith made, well-maintained, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, forge embers glow in background --ar 1:3
```


## Тир 4

### Стальной топор *(`steel_axe`, axe, 1×2, AR 1:2, 768x1536)*

```
Concept of "Стальной топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, clean white studio light --ar 1:2
```

### Боевой топор (2р.) *(`war_axe`, axe, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Боевой топор (2р.)", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, clean white studio light --ar 1:3
```

### Составной лук *(`composite_bow`, bow, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Составной лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, clean white studio light --ar 1:4
```

### Тяжёлый арбалет *(`hv_crossbow`, crossbow, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Тяжёлый арбалет", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, clean white studio light --ar 1:3
```

### Стальной посох *(`steel_staff`, exotic, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Стальной посох", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, clean white studio light --ar 1:4
```

### Стальной кистень *(`steel_flail`, flail, 1×2, AR 1:2, 768x1536)*

```
Concept of "Стальной кистень", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, clean white studio light --ar 1:2
```

### Стальной нож *(`steel_knife`, knife, 1×2, AR 1:2, 768x1536)*

```
Concept of "Стальной нож", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, clean white studio light --ar 1:2
```

### Стальная булава *(`steel_mace`, mace, 1×2, AR 1:2, 768x1536)*

```
Concept of "Стальная булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, clean white studio light --ar 1:2
```

### Боевой молот *(`war_hammer`, mace, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Боевой молот", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, clean white studio light --ar 1:3
```

### Алебарда *(`halberd`, spear, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Алебарда", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, clean white studio light --ar 1:4
```

### Стальное копьё *(`steel_spear`, spear, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Стальное копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, clean white studio light --ar 1:4
```

### Стальной двуруч *(`steel_greatsword`, sword, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Стальной двуруч", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, clean white studio light --ar 1:4
```

### Стальной меч *(`steel_sword`, sword, 1×3, AR 1:3, 512x1536)*

```
Concept of "Стальной меч", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, clean white studio light --ar 1:3
```

### Стальной дротик *(`steel_javelin`, throwing, 1×3, AR 1:3, 512x1536)*

```
Concept of "Стальной дротик", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving, well-maintained, polished, decorative, soldier-grade, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, clean white studio light --ar 1:3
```


## Тир 5

### Закалённый топор *(`hardened_axe`, axe, 1×2, AR 1:2, 768x1536)*

```
Concept of "Закалённый топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cool blue rim light, runes faintly glowing --ar 1:2
```

### Закалённая секира *(`tempered_greataxe`, axe, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Закалённая секира", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cool blue rim light, runes faintly glowing --ar 1:3
```

### Рекурсивный лук *(`recurve_bow`, bow, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Рекурсивный лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cool blue rim light, runes faintly glowing --ar 1:4
```

### Арбалест *(`arbalest`, crossbow, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Арбалест", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cool blue rim light, runes faintly glowing --ar 1:3
```

### Магический посох *(`mage_staff`, exotic, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Магический посох", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cool blue rim light, runes faintly glowing --ar 1:4
```

### Закалённый кистень *(`hardened_flail`, flail, 1×2, AR 1:2, 768x1536)*

```
Concept of "Закалённый кистень", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cool blue rim light, runes faintly glowing --ar 1:2
```

### Закалённый кинжал *(`hardened_knife`, knife, 1×2, AR 1:2, 768x1536)*

```
Concept of "Закалённый кинжал", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cool blue rim light, runes faintly glowing --ar 1:2
```

### Закалённая булава *(`hardened_mace`, mace, 1×2, AR 1:2, 768x1536)*

```
Concept of "Закалённая булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cool blue rim light, runes faintly glowing --ar 1:2
```

### Закалённый молот *(`tempered_warhammer`, mace, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Закалённый молот", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cool blue rim light, runes faintly glowing --ar 1:3
```

### Закалённое копьё *(`hardened_spear`, spear, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Закалённое копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cool blue rim light, runes faintly glowing --ar 1:4
```

### Закалённый двуруч *(`tempered_greatsword`, sword, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Закалённый двуруч", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cool blue rim light, runes faintly glowing --ar 1:4
```

### Закалённый меч *(`tempered_sword`, sword, 1×3, AR 1:3, 512x1536)*

```
Concept of "Закалённый меч", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cool blue rim light, runes faintly glowing --ar 1:3
```

### Стальной чакрам *(`steel_chakram`, throwing, 1×1, AR 1:1, 1024x1024)*

```
Concept of "Стальной чакрам", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes, master-crafted, faint magical etching, polished surfaces, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, cool blue rim light, runes faintly glowing --ar 1:1
```


## Тир 6

### Митрильный топор *(`mithril_axe`, axe, 1×2, AR 1:2, 768x1536)*

```
Concept of "Митрильный топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, soft silver glow, magical particles drifting upward --ar 1:2
```

### Митрильная секира *(`mithril_greataxe`, axe, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Митрильная секира", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, soft silver glow, magical particles drifting upward --ar 1:3
```

### Митрильный лук *(`mithril_bow`, bow, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Митрильный лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, soft silver glow, magical particles drifting upward --ar 1:4
```

### Митрильный арбалет *(`mithril_crossbow`, crossbow, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Митрильный арбалет", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, soft silver glow, magical particles drifting upward --ar 1:3
```

### Посох архимага *(`archmage_staff`, exotic, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Посох архимага", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, soft silver glow, magical particles drifting upward --ar 1:4
```

### Митрильный кистень *(`mithril_flail`, flail, 1×2, AR 1:2, 768x1536)*

```
Concept of "Митрильный кистень", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, soft silver glow, magical particles drifting upward --ar 1:2
```

### Митрильный нож *(`mithril_knife`, knife, 1×2, AR 1:2, 768x1536)*

```
Concept of "Митрильный нож", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, soft silver glow, magical particles drifting upward --ar 1:2
```

### Митрильная булава *(`mithril_mace`, mace, 1×2, AR 1:2, 768x1536)*

```
Concept of "Митрильная булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, soft silver glow, magical particles drifting upward --ar 1:2
```

### Митрильный молот *(`mithril_warhammer`, mace, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Митрильный молот", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, soft silver glow, magical particles drifting upward --ar 1:3
```

### Митрильное копьё *(`mithril_spear`, spear, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Митрильное копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, soft silver glow, magical particles drifting upward --ar 1:4
```

### Митрильный двуруч *(`mithril_greatsword`, sword, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Митрильный двуруч", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, soft silver glow, magical particles drifting upward --ar 1:4
```

### Митрильный меч *(`mithril_sword`, sword, 1×3, AR 1:3, 512x1536)*

```
Concept of "Митрильный меч", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, soft silver glow, magical particles drifting upward --ar 1:3
```

### Митрильный чакрам *(`mithril_chakram`, throwing, 1×1, AR 1:1, 1024x1024)*

```
Concept of "Митрильный чакрам", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay, elven and dwarven luxury craftsmanship, glowing engravings, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, soft silver glow, magical particles drifting upward --ar 1:1
```


## Тир 7

### Тёмный топор *(`dark_axe`, axe, 1×2, AR 1:2, 768x1536)*

```
Concept of "Тёмный топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:2
```

### Секира тёмного железа *(`darkiron_greataxe`, axe, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Секира тёмного железа", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:3
```

### Лук тёмного железа *(`darkiron_bow`, bow, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Лук тёмного железа", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:4
```

### Арбалет тёмного железа *(`darkiron_crossbow`, crossbow, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Арбалет тёмного железа", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:3
```

### Посох тёмного железа *(`darkiron_staff`, exotic, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Посох тёмного железа", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:4
```

### Цеп тёмного железа *(`darkiron_flail`, flail, 1×2, AR 1:2, 768x1536)*

```
Concept of "Цеп тёмного железа", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:2
```

### Кинжал тёмного железа *(`darkiron_knife`, knife, 1×2, AR 1:2, 768x1536)*

```
Concept of "Кинжал тёмного железа", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:2
```

### Молот тёмного железа *(`darkiron_mace`, mace, 1×2, AR 1:2, 768x1536)*

```
Concept of "Молот тёмного железа", a single fantasy mace, flanged head, short metal haft, leather grip, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:2
```

### Молот тёмного железа *(`darkiron_warhammer`, mace, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Молот тёмного железа", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:3
```

### Пика тёмного железа *(`darkiron_pike`, spear, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Пика тёмного железа", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:4
```

### Тёмный клинок *(`dark_blade`, sword, 1×3, AR 1:3, 512x1536)*

```
Concept of "Тёмный клинок", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:3
```

### Двуруч тёмного железа *(`darkiron_greatsword`, sword, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Двуруч тёмного железа", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, deep purple glow, wisps of smoke, ember-like sparks --ar 1:4
```

### Чакрам тёмного железа *(`darkiron_chakram`, throwing, 1×1, AR 1:1, 1024x1024)*

```
Concept of "Чакрам тёмного железа", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke, ominous, brooding, menacing presence, evil-looking, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, deep purple glow, wisps of smoke, ember-like sparks --ar 1:1
```


## Тир 8

### Звёздный топор *(`starmetal_axe`, axe, 1×2, AR 1:2, 768x1536)*

```
Concept of "Звёздный топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:2
```

### Звёздная секира *(`starmetal_greataxe`, axe, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Звёздная секира", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:3
```

### Звёздный лук *(`starmetal_bow`, bow, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Звёздный лук", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:4
```

### Звёздный арбалет *(`starmetal_crossbow`, crossbow, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Звёздный арбалет", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:3
```

### Звёздный посох *(`starmetal_staff`, exotic, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Звёздный посох", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:4
```

### Звёздный кистень *(`starmetal_flail`, flail, 1×2, AR 1:2, 768x1536)*

```
Concept of "Звёздный кистень", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:2
```

### Кинжал Пустоты *(`void_dagger`, knife, 1×2, AR 1:2, 768x1536)*

```
Concept of "Кинжал Пустоты", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:2
```

### Звёздная булава *(`starmetal_mace`, mace, 1×2, AR 1:2, 768x1536)*

```
Concept of "Звёздная булава", a single fantasy mace, flanged head, short metal haft, leather grip, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:2
```

### Звёздный молот *(`starmetal_warhammer`, mace, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Звёздный молот", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:3
```

### Звёздное копьё *(`starmetal_spear`, spear, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Звёздное копьё", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:4
```

### Звёздный двуруч *(`starmetal_greatsword`, sword, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Звёздный двуруч", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:4
```

### Клинок Пустоты *(`void_blade`, sword, 1×3, AR 1:3, 512x1536)*

```
Concept of "Клинок Пустоты", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:3
```

### Звёздный чакрам *(`starmetal_chakram`, throwing, 1×1, AR 1:1, 1024x1024)*

```
Concept of "Звёздный чакрам", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes, celestial, otherworldly, primordial, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes --ar 1:1
```


## Тир 9

### Орихалковый топор *(`orichalcum_axe`, axe, 1×2, AR 1:2, 768x1536)*

```
Concept of "Орихалковый топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, edge dripping with blood-red light, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, golden divine light, lens flare, sparks of pure energy --ar 1:2
```

### Секира Орихалка *(`orichalcum_greataxe`, axe, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Секира Орихалка", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, edge dripping with blood-red light, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, golden divine light, lens flare, sparks of pure energy --ar 1:3
```

### Лук Орихалка *(`orichalcum_bow`, bow, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Лук Орихалка", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, edge dripping with blood-red light, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, golden divine light, lens flare, sparks of pure energy --ar 1:4
```

### Арбалет Орихалка *(`orichalcum_crossbow`, crossbow, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Арбалет Орихалка", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, golden divine light, lens flare, sparks of pure energy --ar 1:3
```

### Посох Орихалка *(`orichalcum_staff`, exotic, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Посох Орихалка", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, crimson essence swirling around the blade, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, golden divine light, lens flare, sparks of pure energy --ar 1:4
```

### Цеп Орихалка *(`orichalcum_flail`, flail, 1×2, AR 1:2, 768x1536)*

```
Concept of "Цеп Орихалка", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, crackling lightning arcs along the surface, hooked / barbed shape designed to catch and disarm, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, golden divine light, lens flare, sparks of pure energy --ar 1:2
```

### Орихалковый кинжал *(`orichalcum_knife`, knife, 1×2, AR 1:2, 768x1536)*

```
Concept of "Орихалковый кинжал", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, edge dripping with blood-red light, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, golden divine light, lens flare, sparks of pure energy --ar 1:2
```

### Молот Орихалка *(`orichalcum_mace`, mace, 1×2, AR 1:2, 768x1536)*

```
Concept of "Молот Орихалка", a single fantasy mace, flanged head, short metal haft, leather grip, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, crackling lightning arcs along the surface, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, golden divine light, lens flare, sparks of pure energy --ar 1:2
```

### Молот Орихалка *(`orichalcum_warhammer`, mace, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Молот Орихалка", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, crackling lightning arcs along the surface, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, golden divine light, lens flare, sparks of pure energy --ar 1:3
```

### Копьё Орихалка *(`orichalcum_spear`, spear, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Копьё Орихалка", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, hooked / barbed shape designed to catch and disarm, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, golden divine light, lens flare, sparks of pure energy --ar 1:4
```

### Клинок Орихалка *(`orichalcum_blade`, sword, 1×3, AR 1:3, 512x1536)*

```
Concept of "Клинок Орихалка", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, crimson essence swirling around the blade, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, golden divine light, lens flare, sparks of pure energy --ar 1:3
```

### Двуруч Орихалка *(`orichalcum_greatsword`, sword, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Двуруч Орихалка", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, crackling lightning arcs along the surface, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, golden divine light, lens flare, sparks of pure energy --ar 1:4
```

### Чакрам Орихалка *(`orichalcum_chakram`, throwing, 1×1, AR 1:1, 1024x1024)*

```
Concept of "Чакрам Орихалка", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings, legendary, ornate, divine craftsmanship, hero-tier, metal seems to phase through reality, edge dripping with blood-red light, razor-sharp focal lines, killing-strike geometry, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, golden divine light, lens flare, sparks of pure energy --ar 1:1
```


## Тир 10

### Адамантиевый топор *(`adamantium_axe`, axe, 1×2, AR 1:2, 768x1536)*

```
Concept of "Адамантиевый топор", a single fantasy hand axe, single-bit head, wooden haft, iron banding, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, metal seems to phase through reality, edge dripping with blood-red light, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:2
```

### Секира Катаклизма *(`cataclysm_axe`, axe, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Секира Катаклизма", a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, edge dripping with blood-red light, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:3
```

### Лук Ветроискателя *(`windseeker_bow`, bow, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Лук Ветроискателя", a single fantasy longbow, recurve limbs, drawstring, no arrow nocked, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, metal seems to phase through reality, edge dripping with blood-red light, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:4
```

### Арбалет Ищущего Пустоту *(`voidseeker_crossbow`, crossbow, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Арбалет Ищущего Пустоту", a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:3
```

### Посох Мирового Корня *(`worldroot_staff`, exotic, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Посох Мирового Корня", a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, crimson essence swirling around the blade, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:4
```

### Костолом *(`bonebreaker_flail`, flail, 1×2, AR 1:2, 768x1536)*

```
Concept of "Костолом", a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, metal seems to phase through reality, crackling lightning arcs along the surface, hooked / barbed shape designed to catch and disarm, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:2
```

### Кинжал Богоруба *(`godsplitter_dagger`, knife, 1×2, AR 1:2, 768x1536)*

```
Concept of "Кинжал Богоруба", a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, edge dripping with blood-red light, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:2
```

### Молот Катаклизма *(`cataclysm_hammer`, mace, 2H, 1×3, AR 1:3, 512x1536)*

```
Concept of "Молот Катаклизма", a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, aura of finality, soul-reaping shimmer, crackling lightning arcs along the surface, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:3
```

### Богоразитель *(`godcrusher_mace`, mace, 1×2, AR 1:2, 768x1536)*

```
Concept of "Богоразитель", a single fantasy mace, flanged head, short metal haft, leather grip, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, aura of finality, soul-reaping shimmer, crackling lightning arcs along the surface, razor-sharp focal lines, killing-strike geometry, vertical orientation, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 768x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:2
```

### Богопронзитель *(`godpiercer`, spear, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Богопронзитель", a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, aura of finality, soul-reaping shimmer, hooked / barbed shape designed to catch and disarm, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:4
```

### Мирорассекатель *(`world_cutter`, sword, 1×3, AR 1:3, 512x1536)*

```
Concept of "Мирорассекатель", a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, crimson essence swirling around the blade, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, vertical orientation, weapon pointing up, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 512x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:3
```

### Мирорассекатель Великий *(`worldsplitter`, sword, 2H, 1×4, AR 1:4, 384x1536)*

```
Concept of "Мирорассекатель Великий", a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, aura of finality, soul-reaping shimmer, crackling lightning arcs along the surface, razor-sharp focal lines, killing-strike geometry, extreme vertical orientation, weapon pointing up, full length visible top-to-bottom, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 384x1536, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:4
```

### Чакрам Длани Богов *(`godhand_chakram`, throwing, 1×1, AR 1:1, 1024x1024)*

```
Concept of "Чакрам Длани Богов", a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical, made of adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge, mythical primordial weapon, wielded by gods, cracks of light leaking from the metal, blade glowing through armor like cutting through paper, edge dripping with blood-red light, aura of finality, soul-reaping shimmer, razor-sharp focal lines, killing-strike geometry, fan layout, balanced composition, isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights, 1024x1024, intense divine aura, space-time distortion, lens flare, sparks of pure light --ar 1:1
```
