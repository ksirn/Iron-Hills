# Iron Hills - AI prompts: consumables and field medicine

> Source: `CONSUMABLES` in `items-catalog.mjs`. Regenerate: `node tools/generate-tactical-art-prompts.mjs`

Generation notes:
- Keep exact target file names from `docs/content/art-batch.*`.
- Respect `gridW`, `gridH`, `aspect`, and `resolution`; the prompt already includes the correct framing.
- Prefer one visible object or one readable spell effect, not a scene.

Negative prompt:
```
text, watermark, logo, signature, blurry, low quality, multiple unrelated objects, cluttered background, human hands, human face, character portrait, modern plastic, hospital equipment, sci-fi device, nsfw
```


## Tier 1

### Антисептический раствор (`antiseptic_wash`, cureDisease, 1x1, AR 1:1, 1024x1024)

```
Concept "Антисептический раствор", antiseptic wash bottle, blue glass, waxed label blank, herbal sediment and clean cloth wrap, infection cleansing, antiseptic blue clarity, herbal purity, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Чистая повязка (`clean_dressing`, reduceBleeding, 1x1, AR 1:1, 1024x1024)

```
Concept "Чистая повязка", rolled field bandage and folded dressing bundle, red wax seal, clean linen texture, blood control, clean pressure dressing, practical battlefield first aid, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Полевой бинт (`field_bandage`, reduceBleeding, 1x1, AR 1:1, 1024x1024)

```
Concept "Полевой бинт", rolled field bandage and folded dressing bundle, red wax seal, clean linen texture, blood control, clean pressure dressing, practical battlefield first aid, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Кожаная фляга (`leather_waterskin`, vessel, 1x1, AR 1:1, 1024x1024)

```
Concept "Кожаная фляга", leather waterskin with cork stopper, stitched seams, small water bead highlights, survival utility, practical fantasy expedition medicine, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Шина (`splint`, splint, 1x2, AR 1:2, 768x1536)

```
Concept "Шина", wooden splint pair tied with linen straps, bone pins and soft padding visible, fracture stabilization, rigid supports, recovery after crushing hit, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, vertical compact object framing, 768x1536, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:2
```

### Жгут (`tourniquet`, tourniquet, 1x1, AR 1:1, 1024x1024)

```
Concept "Жгут", compact leather tourniquet strap with brass windlass and buckle, coiled readable silhouette, major bleeding control, urgent limb stabilization, rugged and reliable, humble frontier craft, worn cloth, dull leather, simple clay or iron fittings, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```


## Tier 2

### Свёртывающий порошок (`clotting_powder`, stopMinorBleeding, 1x1, AR 1:1, 1024x1024)

```
Concept "Свёртывающий порошок", hemostatic cloth packet and clotting powder sachet, sealed field-medic pouch, instant clotting, powder dust, alchemical seal against bleeding, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Полевая шовная скрутка (`field_suture_roll`, bandage, 1x1, AR 1:1, 1024x1024)

```
Concept "Полевая шовная скрутка", suture roll with curved needle, clean thread spool, tiny brass needle case, precise stitching and wound closure, calm professional treatment, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Кровоостанавливающий пакет (`hemostatic_pack`, stopMinorBleeding, 1x1, AR 1:1, 1024x1024)

```
Concept "Кровоостанавливающий пакет", hemostatic cloth packet and clotting powder sachet, sealed field-medic pouch, instant clotting, powder dust, alchemical seal against bleeding, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Железная фляга (`iron_canteen`, vessel, 1x1, AR 1:1, 1024x1024)

```
Concept "Железная фляга", iron canteen with leather strap, dented field metal, screw cap, survival utility, practical fantasy expedition medicine, reliable guild-apprentice craft, clean seams, bronze pins, functional finish, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```


## Tier 3

### Шина с костяными фиксаторами (`bone_pin_splint`, splint, 1x2, AR 1:2, 768x1536)

```
Concept "Шина с костяными фиксаторами", wooden splint pair tied with linen straps, bone pins and soft padding visible, fracture stabilization, rigid supports, recovery after crushing hit, field-proven adventurer gear, reinforced details, readable silhouette, vertical compact object framing, 768x1536, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:2
```

### Обезболивающий глоток (`painkiller_draught`, stimulant, 1x1, AR 1:1, 1024x1024)

```
Concept "Обезболивающий глоток", small battle stimulant ampoule in leather injector sleeve, amber liquid, caution cord, short combat surge, bitter stimulant, controlled urgency, field-proven adventurer gear, reinforced details, readable silhouette, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Бурдюк следопыта (`ranger_gourd`, vessel, 1x1, AR 1:1, 1024x1024)

```
Concept "Бурдюк следопыта", traveler gourd canteen with ranger cord wrap, carved wooden stopper, survival utility, practical fantasy expedition medicine, field-proven adventurer gear, reinforced details, readable silhouette, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Травматологический набор (`trauma_kit`, stabilizeBody, 2x2, AR 1:1, 1024x1024)

```
Concept "Травматологический набор", compact trauma kit pouch opened just enough to show bandage roll, splint slats, tonic vial, body stabilization after multiple wounds, organized emergency kit, field-proven adventurer gear, reinforced details, readable silhouette, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```


## Tier 4

### Боевой стимулятор (`battle_stimulant`, stimulant, 1x1, AR 1:1, 1024x1024)

```
Concept "Боевой стимулятор", small battle stimulant ampoule in leather injector sleeve, amber liquid, caution cord, short combat surge, bitter stimulant, controlled urgency, professional mercenary quality, polished steel fittings, careful packing, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Полевой травмпакет (`field_trauma_pack`, stabilizeBody, 2x2, AR 1:1, 1024x1024)

```
Concept "Полевой травмпакет", compact trauma kit pouch opened just enough to show bandage roll, splint slats, tonic vial, body stabilization after multiple wounds, organized emergency kit, professional mercenary quality, polished steel fittings, careful packing, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```

### Хирургический набор (`surgical_kit`, surgery, 2x2, AR 1:1, 1024x1024)

```
Concept "Хирургический набор", fantasy surgical field kit, folded leather case with bone saw, sutures, forceps, antiseptic vial, serious wound treatment, surgical precision, recovery of damaged body zones, professional mercenary quality, polished steel fittings, careful packing, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```


## Tier 5

### Восстановительная ампула (`restoration_ampoule`, healHP, 1x1, AR 1:1, 1024x1024)

```
Concept "Восстановительная ампула", restorative green ampoule with silver cap, clean healing glow, tiny bandage tie, restorative healing warmth, wound closing magic, safe green glow, masterwork guild finish, subtle runes, clean alchemical glass and fine leather, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```


## Tier 6

### Мастерский хирургический комплект (`master_surgery_pack`, surgery, 2x2, AR 1:1, 1024x1024)

```
Concept "Мастерский хирургический комплект", fantasy surgical field kit, folded leather case with bone saw, sutures, forceps, antiseptic vial, serious wound treatment, surgical precision, recovery of damaged body zones, elite expedition quality, mithril or silver accents, faint magical residue, balanced square inventory composition, 1024x1024, single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size --ar 1:1
```
