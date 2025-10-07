---
sidebar_position: 4
---

# Effettuare ricerche strutturate

Una delle caratteristiche più potenti di Qdrant è la capacità di **combinare** ricerca semantica con
filtri tradizionali sui metadati. Questo ti permette di:

- Restringere i risultati a specifiche categorie
- Filtrare per range di valori (età, prezzo, data, ecc.)
- Escludere determinati risultati
- Creare logiche complesse con operatori booleani

## Struttura dei filtri in Qdrant

Qdrant supporta tre tipi principali di condizioni logiche:

### must - Operatore AND

Tutte le condizioni devono essere vere (equivalente a && in JavaScript)

```json
{
  "must": [
    { "key": "type", "match": { "value": "dog" } },
    { "key": "age", "range": { "gte": 5 } }
  ]
}
// Trova: cani E con età >= 5
```

### should - Operatore OR

Almeno una delle condizioni deve essere vera (equivalente a || in JavaScript)

```json
{
  "should": [
    { "key": "breed", "match": { "value": "Beagle" } },
    { "key": "breed", "match": { "value": "Havanese" } }
  ]
}
// Trova: Beagle O Havanese
```

### must_not - Operatore NOT

Nessuna delle condizioni deve essere vera (equivalente a ! in JavaScript)

```json
{
  "must_not": [{ "key": "type", "match": { "value": "reptile" } }]
}
// Trova: tutto TRANNE i rettili
```

## Tipi di condizioni disponibili

### match - Corrispondenza esatta

```json
{ "key": "type", "match": { "value": "dog" } }
// Trova: type = dog
```

### range - Intervallo di valori

```json
// Maggiore di
{ key: 'age', range: { gt: 5 } }

// Maggiore o uguale
{ key: 'age', range: { gte: 5 } }

// Minore di
{ key: 'age', range: { lt: 10 } }

// Minore o uguale
{ key: 'age', range: { lte: 10 } }

// Range combinato (tra 5 e 10)
{ key: 'age', range: { gte: 5, lte: 10 } }
```

### Match any - Uno tra molti valori

```json
{
  "key": "breed",
  "match": {
    "any": ["Beagle", "Havanese", "Golden Retriever"]
  }
}
// Il campo 'breed' può essere uno qualsiasi dei valori nell'arraya
```

## Match Except - Escludi valori specifici

```json
{
  "key": "personality",
  "match": {
    "except": ["aggressive", "shy"]
  }
}
// Escludi animali con personalità 'aggressive' o 'shy'
```

## Composizione di filtri complessi

I filtri possono essere combinati per creare query molto specifiche. Ecco un esempio che combina più condizioni:

```json
{
  "must": [
    { "key": "type", "match": { "value": "dog" } },
    {
      "should": [
        { "key": "age", "range": { "lt": 3 } },
        { "key": "personality", "match": { "value": "playful" } }
      ]
    }
  ],
  "must_not": [{ "key": "breed", "match": { "value": "Chihuahua" } }]
}
// Trova: cani CHE SIANO (cuccioli O giocherelloni) MA NON Chihuahua
```

## Vantaggi dei filtri con ricerca semantica

Combinare filtri strutturati con ricerca semantica offre numerosi vantaggi:

- **Precisione**: Restringi i risultati a categorie specifiche, migliorando la rilevanza.
- **Flessibilità**: Crea query complesse che riflettono esattamente le tue esigenze.
- **Performance**: Riduci il numero di vettori da confrontare, velocizzando le ricerche.
- **Esperienza utente migliorata**: Offri risultati più pertinenti e personalizzati.

## Ordine di esecuzione

Qdrant ottimizza automaticamente l'esecuzione:

1. Prima applica i filtri sui metadati (molto veloce con indici)
2. Poi cerca tra i risultati filtrati usando la similarità vettoriale

Questo significa che i filtri sono molto efficienti e non rallentano significativamente la ricerca!

## Esempio pratico in Node.js

Ecco un esempio di come effettuare una ricerca semantica con filtri in Node.js usando il
client ufficiale di Qdrant:

```javascript
import { QdrantClient } from "@qdrant/js-client-rest";
import { generateEmbedding } from "./embeddings.js";

const client = new QdrantClient({ url: "http://localhost:6333" });

async function searchWithFilter(queryText, filter, limit = 5) {
  try {
    console.log(`\n🔍 Ricerca: "${queryText}"`);
    console.log(`📋 Filtri:`, JSON.stringify(filter, null, 2), "\n");

    const queryVector = await generateEmbedding(queryText);

    const results = await client.search("pets", {
      vector: queryVector,
      filter: filter,
      limit: limit,
    });

    console.log(`Trovati ${results.length} risultati:\n`);

    results.forEach((result, index) => {
      console.log(`${index + 1}. Score: ${result.score.toFixed(4)}`);
      console.log(
        `   ${result.payload.name} - ${result.payload.breed} ${result.payload.type}`,
      );
      console.log(
        `   Età: ${result.payload.age} anni, Personalità: ${result.payload.personality || "N/A"}`,
      );
      console.log("---");
    });
  } catch (error) {
    console.error("Errore durante la ricerca:", error);
  }
}

async function runFilteredSearches() {
  // ESEMPIO 1: Filtro semplice con AND
  // Cerca solo cani giovani (età < 5) e giocherelloni
  console.log("\n═══════════════════════════════════════════");
  console.log("ESEMPIO 1: Filtro AND - Cani giovani");
  console.log("═══════════════════════════════════════════");

  await searchWithFilter("playful energetic companion", {
    must: [
      { key: "type", match: { value: "dog" } },
      { key: "age", range: { lt: 5 } },
    ],
  });

  // ESEMPIO 2: Filtro con OR
  // Cerca gatti O uccelli indipendenti
  console.log("\n═══════════════════════════════════════════");
  console.log("ESEMPIO 2: Filtro OR - Gatti o Uccelli");
  console.log("═══════════════════════════════════════════");

  await searchWithFilter("independent pet that doesn't need much attention", {
    should: [
      { key: "type", match: { value: "cat" } },
      { key: "type", match: { value: "bird" } },
    ],
  });

  // ESEMPIO 3: Filtro con NOT
  // Cerca animali anziani (età > 10) ma NON rettili
  console.log("\n═══════════════════════════════════════════");
  console.log("ESEMPIO 3: Filtro NOT - Anziani ma no rettili");
  console.log("═══════════════════════════════════════════");

  await searchWithFilter("wise elderly pet with lots of experience", {
    must: [{ key: "age", range: { gt: 10 } }],
    must_not: [{ key: "type", match: { value: "reptile" } }],
  });

  // ESEMPIO 4: Range combinato
  // Cerca animali di età media (tra 5 e 10 anni)
  console.log("\n═══════════════════════════════════════════");
  console.log("ESEMPIO 4: Range - Età media (5-10 anni)");
  console.log("═══════════════════════════════════════════");

  await searchWithFilter("mature but still active pet", {
    must: [{ key: "age", range: { gte: 5, lte: 10 } }],
  });

  // ESEMPIO 5: Match Any - Razze specifiche
  // Cerca specifiche razze di cani
  console.log("\n═══════════════════════════════════════════");
  console.log("ESEMPIO 5: Match Any - Razze specifiche");
  console.log("═══════════════════════════════════════════");

  await searchWithFilter(
    "loyal family dog",
    {
      must: [
        { key: "type", match: { value: "dog" } },
        {
          key: "breed",
          match: {
            any: ["Golden Retriever", "Beagle", "Havanese"],
          },
        },
      ],
    },
    10,
  );

  // ESEMPIO 6: Condizioni annidate complesse
  // Cerca: Cani CHE SIANO (cuccioli O energici) MA NON aggressivi
  console.log("\n═══════════════════════════════════════════");
  console.log("ESEMPIO 6: Logica complessa annidata");
  console.log("═══════════════════════════════════════════");

  await searchWithFilter("perfect family pet safe with children", {
    must: [
      { key: "type", match: { value: "dog" } },
      {
        should: [
          { key: "age", range: { lte: 3 } },
          { key: "personality", match: { value: "energetic" } },
        ],
      },
    ],
    must_not: [{ key: "personality", match: { value: "aggressive" } }],
  });

  // ESEMPIO 7: Solo filtri, nessuna ricerca semantica
  // Utile quando vuoi solo filtrare senza ordinare per similarità
  console.log("\n═══════════════════════════════════════════");
  console.log("ESEMPIO 7: Solo filtri - Tutti i gatti");
  console.log("═══════════════════════════════════════════");

  // Usa un vettore "neutro" per ottenere risultati senza preferenze semantiche
  const neutralVector = new Array(768).fill(0);

  const results = await client.search("pets", {
    vector: neutralVector,
    filter: {
      must: [{ key: "type", match: { value: "cat" } }],
    },
    limit: 5,
  });

  console.log(`Trovati ${results.length} gatti (ordinamento casuale):\n`);
  results.forEach((result, index) => {
    console.log(
      `${index + 1}. ${result.payload.name} - ${result.payload.breed}`,
    );
  });

  // ESEMPIO 8: Filtro con Match Except
  // Cerca cani, escluse personalità specifiche
  console.log("\n═══════════════════════════════════════════");
  console.log("ESEMPIO 8: Match Except - Escludi personalità");
  console.log("═══════════════════════════════════════════");

  await searchWithFilter("friendly social dog", {
    must: [
      { key: "type", match: { value: "dog" } },
      {
        key: "personality",
        match: {
          except: ["aggressive", "shy", "independent"],
        },
      },
    ],
  });
}

runFilteredSearches();
```

Eseguito questo script, vedrai come i filtri influenzano i risultati della ricerca semantica,
permettendoti di ottenere esattamente ciò che cerchi in modo efficiente e preciso!

```bash
node search_filters.js

═══════════════════════════════════════════
ESEMPIO 1: Filtro AND - Cani giovani
═══════════════════════════════════════════

🔍 Ricerca: "playful energetic companion"
📋 Filtri: {
  "must": [
    { "key": "type", "match": { "value": "dog" } },
    { "key": "age", "range": { "lt": 5 } }
  ]
}

Trovati 5 risultati:

1. Score: 0.8234
   Buddy - Golden Retriever dog
   Età: 1 anni, Personalità: energetic
---
2. Score: 0.7891
   Max - Beagle dog
   Età: 3 anni, Personalità: playful
---
...
```
