# Iron Hills — иконки брони и щитов

Файлы: `icons/items/armor/{id}.webp` (или `.png`), где `{id}` совпадает с ключом в `ARMORS`.

После добавления файлов:

```bash
node tools/apply-armor-images.mjs
```

В Foundry (GM), после обновления страницы:

```js
await game.ironHills.syncArmorPackFromCatalog()
```

Новые записи каталога без строки в компендиуме появятся только после повторного заполнения пака брони (или импорта) — синхронизация обновляет уже существующие документы.
