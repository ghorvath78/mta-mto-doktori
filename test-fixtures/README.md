# Kompatibilitási minta adatlapok

A `v<n>/` mappákban az adott sémaverzióval mentett, **befagyasztott** PDF adatlapok vannak (ld. `packages/form-schemas`).
A tesztek (`pnpm test`) ellenőrzik, hogy ezek a migrációk után is hiánytalanul betölthetők a jelenlegi űrlapokba.

- A meglévő fájlokat soha ne mentsd újra, és ne cseréld le: a régi formátum megőrzése a céljuk.
- Egy adatlap verzióemelése után az új verzióval mentett mintákat egy új mappába (pl. `v2/`) tedd.
- A fájlnév az adatlap fajtájával kezdődjön (`kerelmezoi-`, `eloterjesztoi-`, `bizottsagi-`); a teszt a PDF-be ágyazott
  összes form JSON-t megvizsgálja.
