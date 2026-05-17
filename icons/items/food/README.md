# Iron Hills — иконки еды и напитков

Файлы: `icons/items/food/{id}.webp`, ключ `{id}` из `FOOD`.

```bash
node tools/apply-food-images.mjs
```

В Foundry (GM):

```js
await game.ironHills.syncFoodPackFromCatalog()
```

Промпты: `node tools/generate-food-prompts.mjs` → `docs/content/food-prompts.*`.

Новые строки каталога попадают в компендиум при повторном `buildCompendiums` или импорте; синхронизация обновляет уже существующие записи.
