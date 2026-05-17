# Iron Hills — иконки зелий

Файлы: `icons/items/potions/{id}.webp`, ключ `{id}` из `POTIONS`.

```bash
node tools/apply-potion-images.mjs
```

В Foundry (GM):

```js
await game.ironHills.syncPotionPackFromCatalog()
```

Промпты: `node tools/generate-potion-prompts.mjs` → `docs/content/potions-prompts.*`.
