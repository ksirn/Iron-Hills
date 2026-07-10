# Imagegen Preview Sheets

Preview-only sheets captured from built-in image generation. These are not final in-game assets yet.

## Workflow

1. Review these preview sheets for visual direction.
2. Slice or regenerate chosen cells as individual candidate images under art-candidates/items/...
3. Run node tools/promote-art-candidates.mjs in dry-run mode before replacing final icons.
4. Rerun content readiness and Foundry runtime smoke checks after promotion.

## Sheets

| Category | Slug | Title | Grid | File | Notes |
| --- | --- | --- | --- | --- | --- |
| armor | 2026-06-18-armor-helmets | Armor helmets and headwear | 3x2 | docs/content/generated-image-sheets/2026-06-18-armor-helmets.png | Good visual tier separation; No final catalog replacements yet |
| armor | 2026-06-18-armor-arms-hands | Armor arms and hands | 3x2 | docs/content/generated-image-sheets/2026-06-18-armor-arms-hands.png | Readable paired silhouettes; Needs individual cell slicing before use |
| armor | 2026-06-18-armor-legs-feet | Armor legs and feet | 3x2 | docs/content/generated-image-sheets/2026-06-18-armor-legs-feet.png | Good footwear/leg distinction; No final catalog replacements yet |
| clothing | 2026-06-18-clothing-robes | Clothing and robes | 3x2 | docs/content/generated-image-sheets/2026-06-18-clothing-robes.png | Useful for future clothing catalog or armor subtype expansion |
| npcs | 2026-06-18-npc-archetypes | NPC archetype portraits | 3x2 | docs/content/generated-image-sheets/2026-06-18-npc-archetypes.png | Selected cells promoted as `icons/tokens/npc/{role}_{tierBand}.webp` actor portraits |
| monsters | 2026-06-18-monster-archetypes | Monster archetype portraits | 3x2 | docs/content/generated-image-sheets/2026-06-18-monster-archetypes.png | Selected close matches promoted as `icons/tokens/monsters/{bestiaryId}.webp` actor portraits |
| spells | 2026-06-18-spell-schools | Spell school identity icons | 4x2 | docs/content/generated-image-sheets/2026-06-18-spell-schools.png | Good physical artifact language for schools; Can guide default school fallback art |
| spells | 2026-06-18-spell-offensive | Offensive spell icons | 4x2 | docs/content/generated-image-sheets/2026-06-18-spell-offensive.png | Strong silhouettes for action-bar icons |
| spells | 2026-06-18-spell-aoe-geometry | AoE geometry spell icons | 4x2 | docs/content/generated-image-sheets/2026-06-18-spell-aoe-geometry.png | Tactical readability is the main value of this sheet |
| spells | 2026-06-18-spell-support-control | Support and control spell icons | 4x2 | docs/content/generated-image-sheets/2026-06-18-spell-support-control.png | Some cells may need regeneration before final use because support effects can drift toward face-like silhouettes |
| magic-items | 2026-06-18-magical-items | Magical inventory items | 4x2 | docs/content/generated-image-sheets/2026-06-18-magical-items.png | Good bridge between magic catalog and Tarkov-style trade inventory |
| spells | 2026-06-18-spell-high-tier-destruction | High-tier destructive spell icons | 4x2 | docs/content/generated-image-sheets/2026-06-18-spell-high-tier-destruction.png | High-tier power reads well without becoming a full battlefield scene |
| spells | 2026-06-18-spell-high-tier-utility | High-tier utility and summon spell icons | 4x2 | docs/content/generated-image-sheets/2026-06-18-spell-high-tier-utility.png | Summon effects show gates and bindings instead of full creatures, which fits action-bar spell icons |
| attachments | 2026-06-18-utility-attachments | Utility attachment icons | 5x4 | docs/content/generated-image-sheets/2026-06-18-utility-attachments.png | Generated with built-in imagegen for utility gear replacement pass |
| belts | 2026-06-18-utility-belts | Belt and harness icons | 4x3 | docs/content/generated-image-sheets/2026-06-18-utility-belts.png | Generated with built-in imagegen for utility gear replacement pass |
| backpacks | 2026-06-18-utility-backpacks | Backpack and satchel icons | 5x3 | docs/content/generated-image-sheets/2026-06-18-utility-backpacks.png | Generated with built-in imagegen for utility gear replacement pass |
| tools | 2026-06-18-utility-tools-low-mid | Low and mid tier tool icons | 5x3 | docs/content/generated-image-sheets/2026-06-18-utility-tools-low-mid.png | Generated with built-in imagegen for utility gear replacement pass |
| tools | 2026-06-18-utility-tools-high | High tier workshop tool icons | 5x3 | docs/content/generated-image-sheets/2026-06-18-utility-tools-high.png | Generated with built-in imagegen for utility gear replacement pass |
| consumables | 2026-06-18-utility-consumable-vessels | Drink vessel consumable icons | 3x1 | docs/content/generated-image-sheets/2026-06-18-utility-consumable-vessels.png | Generated with built-in imagegen for utility gear replacement pass |

## 2026-06-18 Materials Candidate Sheets

### Materials metals and woods

- File: `docs/content/generated-image-sheets/2026-06-18-materials-metals-woods.png`
- Source: `C:/Users/mitma/.codex/generated_images/019e0f8c-4831-7a21-a68b-03461ae405ca/ig_0f1e7fecb4b1a8f3016a345bc42a288194add097978ee8ec57.png`
- Grid: `5x4`
- Items: copper_ore, copper_ingot, tin_ore, bronze_ingot, iron_ore, iron_ingot, steel_ingot, hardened_steel, mithril_ore, mithril_ingot, dark_iron_ore, dark_iron, starmetal_ore, starmetal, orichalcum, adamantium, pine_wood, oak_wood, hardwood, ironwood

### Materials hides and fabrics

- File: `docs/content/generated-image-sheets/2026-06-18-materials-hides-fabrics.png`
- Source: `C:/Users/mitma/.codex/generated_images/019e0f8c-4831-7a21-a68b-03461ae405ca/ig_0f1e7fecb4b1a8f3016a345c011c908194bfcefd5be0df47ad.png`
- Grid: `5x4`
- Items: spirit_wood, ebony, eternal_wood, world_tree, sun_oak_board, genesis_timber, animal_hide, tanned_leather, thick_hide, scale_hide, drake_scale, drake_hide, warg_pelt, wyvern_hide, dragon_hide, hydra_hide, leviathan_hide, raw_fiber, cloth, fine_cloth

### Materials textiles and minerals

- File: `docs/content/generated-image-sheets/2026-06-18-materials-textiles-minerals.png`
- Source: `C:/Users/mitma/.codex/generated_images/019e0f8c-4831-7a21-a68b-03461ae405ca/ig_0f1e7fecb4b1a8f3016a345c3806fc81948b5ce5b01032e2a6.png`
- Grid: `5x4`
- Items: silk, spider_silk, moonweave, shadowweave, starthread, void_weave, aurora_thread, genesis_weave, stone, flint, coal, quartz, granite, obsidian, ruby, sapphire, diamond, mana_crystal, aeon_geode, void_crystal

### Materials reagents and supplies

- File: `docs/content/generated-image-sheets/2026-06-18-materials-reagents-supplies.png`
- Source: `C:/Users/mitma/.codex/generated_images/019e0f8c-4831-7a21-a68b-03461ae405ca/ig_0f1e7fecb4b1a8f3016a345c73de548194885074caddb9cadd.png`
- Grid: `5x4`
- Items: star_shard, star_heart, herb_common, herb_healing, mushroom_bog, root_bitter, poison_fang, flower_moon, monster_gland, venom_sac, spirit_bloom, phoenix_feather, giant_heart, dragon_blood, abyss_lichen, god_tears, rope, forge_coal, glass, oil_flask

### Materials arcane utility and monster harvest

- File: `docs/content/generated-image-sheets/2026-06-18-materials-arcane-harvest.png`
- Source: `C:/Users/mitma/.codex/generated_images/019e0f8c-4831-7a21-a68b-03461ae405ca/ig_0f1e7fecb4b1a8f3016a345cb379cc8194a32f799df793f0af.png`
- Grid: `5x4`
- Items: mana_stone, enchant_dust, artisans_resin, soul_essence, planar_clip, arcane_mesh, relic_shard, epoch_seed, beast_sinew_spool, small_pelt_uncured, fang_shard, wisp_moth_powder, serpent_sac_mild, bristle_keg_rings, avian_keel_bone, alpha_musk_gland, wyvern_sinew_filament, predator_resin_mass


