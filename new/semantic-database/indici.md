---
sidebar_position: 6
---

# Creare indici

Quando lavori con migliaia o milioni di punti, i **filtri sui metadati possono diventare
lenti** se non ottimizzati. Qdrant risolve questo problema permettendoti di creare indici
sui campi del payload, esattamente come faresti in un database tradizionale.

## Perché creare indici?

Senza indici, Qdrant deve:

1. Scansionare **tutti i punti** nella collezione
2. Controllare ogni payload per vedere se matcha il filtro
3. Questo diventa molto lento con grandi volumi di dati

Con gli indici, Qdrant:

1. Usa una **struttura dati ottimizzata** (hash map, B-tree, ecc.)
2. Trova i punti che matchano **quasi istantaneamente**
3. La ricerca è **ordini di grandezza più veloce**

## Quando creare indici

✅ **Crea indici quando:**

- Filtri frequentemente su un campo (es. type, category)
- Hai più di 10.000 punti
- Le query con filtri sono lente
- Fai ricerche full-text su campi testuali

❌ **Non creare indici quando:**

- Il campo ha troppi valori unici (alta cardinalità)
- Non filtri mai su quel campo
- La collezione è molto piccola (< 1000 punti)
- Scrivi più di quanto leggi (gli indici rallentano insert/update)

Ecco la lista dei tipi di indici supportati:

| Tipo        | Uso                        | Esempio campo        |
| ----------- | -------------------------- | -------------------- |
| **keyword** | Stringhe esatte, categorie | type, status, brand  |
| **integer** | Numeri interi              | age, price, quantity |
| **float**   | Numeri decimali            | rating, temperature  |
| **bool**    | Valori booleani            | is_active, verified  |
| **geo**     | Coordinate geografiche     | location (lat/lon)   |
| **text**    | Ricerca full-text          | description, content |

## Trade-off degli indici

Creare indici ha vantaggi ma anche alcuni svantaggi. Eccoli:

| Vantaggio            | Svantaggio                         |
| -------------------- | ---------------------------------- |
| Ricerche più veloci  | Maggiore uso di memoria            |
| Migliore scalabilità | Tempo extra per creare l'indice    |
| Filtri più complessi | Leggero rallentamento su scritture |

## Come creare indici in Qdrant

Puoi creare indici quando crei una collezione o aggiungerli in seguito. Ecco come fare in Node.js:

```javascript
import { QdrantClient } from "@qdrant/js-client-rest";
import { generateEmbedding } from "./embeddings.js";

const client = new QdrantClient({
  url: "http://localhost:6333",
  checkCompatibility: false,
});

/**
 * Crea tutti gli indici necessari per ottimizzare le query
 */
async function createAllIndexes() {
  try {
    console.log("\n🔧 Creazione indici sui campi del payload...\n");

    // Indice 1: Campo "type" (keyword)
    // Usiamo questo campo in quasi tutte le query
    console.log('Creazione indice su "type"...');
    await client.createPayloadIndex("pets", {
      field_name: "type",
      field_schema: "keyword",
    });
    console.log('✓ Indice "type" creato');

    // Indice 2: Campo "age" (integer)
    // Utile per filtri con range (es. età < 5)
    console.log('Creazione indice su "age"...');
    await client.createPayloadIndex("pets", {
      field_name: "age",
      field_schema: "integer",
    });
    console.log('✓ Indice "age" creato');

    // Indice 3: Campo "breed" (keyword)
    // Per filtrare razze specifiche velocemente
    console.log('Creazione indice su "breed"...');
    await client.createPayloadIndex("pets", {
      field_name: "breed",
      field_schema: "keyword",
    });
    console.log('✓ Indice "breed" creato');

    // Indice 4: Campo "personality" (text - full-text search)
    // Permette ricerca testuale sul campo personality
    console.log('Creazione indice full-text su "personality"...');
    await client.createPayloadIndex("pets", {
      field_name: "personality",
      field_schema: "text",
      // Opzioni per full-text (opzionali)
      tokenizer: "word", // Tokenizza per parola
      min_token_len: 2, // Ignora token < 2 caratteri
      max_token_len: 20, // Ignora token > 20 caratteri
      lowercase: true, // Converti tutto in lowercase
    });
    console.log('✓ Indice full-text "personality" creato');

    // Indice 5: Campo booleano (se presente)
    console.log('Creazione indice su "vaccinated"...');
    await client.createPayloadIndex("pets", {
      field_name: "vaccinated",
      field_schema: "bool",
    });
    console.log('✓ Indice "vaccinated" creato');

    console.log("\n✅ Tutti gli indici creati con successo!\n");

    // Verifica gli indici creati
    await showIndexes();
  } catch (error) {
    // Alcuni errori sono normali (es. indice già esistente)
    if (error.message && error.message.includes("already exists")) {
      console.log("⚠️  Alcuni indici esistono già (ok)");
    } else {
      console.error("Errore durante la creazione degli indici:", error);
    }
  }
}

/**
 * Mostra tutti gli indici presenti nella collezione
 */
async function showIndexes() {
  try {
    const collectionInfo = await client.getCollection("pets");

    console.log("📋 Indici presenti nella collezione:\n");

    if (collectionInfo.payload_schema) {
      Object.entries(collectionInfo.payload_schema).forEach(
        ([field, schema]) => {
          console.log(`  ${field}:`);
          console.log(`    - Tipo: ${schema.data_type || "N/A"}`);
          console.log(
            `    - Indicizzato: ${schema.indexed ? "✅ Sì" : "❌ No"}`,
          );
          if (schema.tokenizer) {
            console.log(`    - Tokenizer: ${schema.tokenizer}`);
          }
        },
      );
    } else {
      console.log("  Nessun indice presente");
    }
  } catch (error) {
    console.error("Errore durante il recupero degli indici:", error);
  }
}

/**
 * Test performance: confronta query con e senza indici
 */
async function benchmarkWithAndWithoutIndexes() {
  try {
    console.log("\n⚡ Benchmark: Query con indici ottimizzati\n");
    console.log("Nota: Queste query beneficiano degli indici creati\n");

    const queryVector = await generateEmbedding("friendly pet");

    // Test 1: Filtro su campo indicizzato (type)
    console.log('Test 1: Filtro su "type" (indicizzato)');
    console.time("  Tempo");
    const result1 = await client.search("pets", {
      vector: queryVector,
      filter: {
        must: [{ key: "type", match: { value: "dog" } }],
      },
      limit: 10,
    });
    console.timeEnd("  Tempo");
    console.log(`  Risultati trovati: ${result1.length}\n`);

    // Test 2: Filtro su range con campo indicizzato (age)
    console.log('Test 2: Range su "age" (indicizzato)');
    console.time("  Tempo");
    const result2 = await client.search("pets", {
      vector: queryVector,
      filter: {
        must: [{ key: "age", range: { gte: 5, lte: 10 } }],
      },
      limit: 10,
    });
    console.timeEnd("  Tempo");
    console.log(`  Risultati trovati: ${result2.length}\n`);

    // Test 3: Filtro multiplo con campi indicizzati
    console.log("Test 3: Filtri multipli su campi indicizzati");
    console.time("  Tempo");
    const result3 = await client.search("pets", {
      vector: queryVector,
      filter: {
        must: [
          { key: "type", match: { value: "dog" } },
          { key: "age", range: { lt: 5 } },
          { key: "breed", match: { value: "Beagle" } },
        ],
      },
      limit: 10,
    });
    console.timeEnd("  Tempo");
    console.log(`  Risultati trovati: ${result3.length}\n`);

    // Test 4: Full-text search su campo indicizzato
    console.log('Test 4: Full-text search su "personality"');
    console.time("  Tempo");
    const result4 = await client.scroll("pets", {
      filter: {
        must: [
          {
            key: "personality",
            match: {
              text: "playful friendly", // Cerca questi termini
            },
          },
        ],
      },
      limit: 10,
      with_vector: false,
    });
    console.timeEnd("  Tempo");
    console.log(`  Risultati trovati: ${result4.points.length}\n`);

    console.log("✅ Tutti i test completati!");
    console.log("💡 Con indici appropriati, le query sono molto più veloci!\n");
  } catch (error) {
    console.error("Errore durante il benchmark:", error);
  }
}

/**
 * Esempio di ricerca full-text avanzata
 */
async function fullTextSearchExample() {
  try {
    console.log("\n🔍 Esempio di ricerca full-text avanzata\n");

    // Cerca animali con personalità "playful" O "energetic"
    const result = await client.scroll("pets", {
      filter: {
        must: [
          { key: "type", match: { value: "dog" } },
          {
            key: "personality",
            match: {
              text: "playful energetic", // OR implicito tra le parole
            },
          },
        ],
      },
      limit: 5,
      with_vector: false,
    });

    console.log(`Trovati ${result.points.length} cani playful/energetic:\n`);
    result.points.forEach((point, index) => {
      console.log(
        `${index + 1}. ${point.payload.name} - Personalità: ${point.payload.personality}`,
      );
    });
  } catch (error) {
    console.error("Errore durante la ricerca full-text:", error);
  }
}

/**
 * Elimina un indice (utile per test o re-indicizzazione)
 */
async function deleteIndex(fieldName) {
  try {
    console.log(`\n🗑️  Eliminazione indice su "${fieldName}"...`);

    await client.deletePayloadIndex("pets", fieldName);

    console.log(`✓ Indice "${fieldName}" eliminato\n`);
  } catch (error) {
    console.error(`Errore durante l'eliminazione dell'indice:`, error);
  }
}

/**
 * Best practices per gli indici
 */
function showBestPractices() {
  console.log("\n📚 Best Practices per gli Indici\n");
  console.log("1. ✅ Indicizza campi usati frequentemente nei filtri");
  console.log('2. ✅ Usa "keyword" per categorie con pochi valori unici');
  console.log('3. ✅ Usa "integer/float" per range numerici');
  console.log('4. ✅ Usa "text" solo per ricerca full-text (è costoso)');
  console.log(
    "5. ❌ Evita di indicizzare campi con alta cardinalità (es. ID univoci)",
  );
  console.log(
    "6. ❌ Non creare indici se la collezione è piccola (< 1000 punti)",
  );
  console.log(
    "7. ⚠️  Ricorda: più indici = più spazio disco + insert più lenti\n",
  );
}

/**
 * Esempi di utilizzo
 */
async function runIndexExamples() {
  // Mostra best practices
  showBestPractices();

  // Crea gli indici
  console.log("═══════════════════════════════════════════");
  console.log("STEP 1: Creazione indici");
  console.log("═══════════════════════════════════════════");
  await createAllIndexes();

  // Benchmark performance
  console.log("\n═══════════════════════════════════════════");
  console.log("STEP 2: Test performance con indici");
  console.log("═══════════════════════════════════════════");
  await benchmarkWithAndWithoutIndexes();

  // Esempio full-text
  console.log("\n═══════════════════════════════════════════");
  console.log("STEP 3: Ricerca full-text");
  console.log("═══════════════════════════════════════════");
  await fullTextSearchExample();

  // Esempio eliminazione (commentato per default)
  // await deleteIndex('personality');
}

runIndexExamples();
```

Questo script fa diverse cose utili:

1. **Crea indici** sui campi più usati nei filtri (`type`, `age`, `breed`, `personality`, `vaccinated`).
2. **Mostra gli indici** attualmente presenti nella collezione.
3. **Esegue benchmark** per confrontare le performance delle query con indici.
4. **Esegue una ricerca full-text** avanzata sul campo `personality`.
5. **Elimina un indice** (utile per test o re-indicizzazione).
6. **Mostra best practices** per la creazione di indici.
7. **Esegue tutto in sequenza** per dimostrare l'uso degli indici.
8. **Gestisce errori comuni** come la creazione di indici già esistenti.
9. **Commenti esplicativi** per ogni sezione del codice.

Esegui questo script dopo aver popolato la collezione "pets" per vedere i benefici degli indici sulle performance delle query con filtri!

Ecco un esempio di output atteso:

```
📚 Best Practices per gli Indici

1. ✅ Indicizza campi usati frequentemente nei filtri
2. ✅ Usa "keyword" per categorie con pochi valori unici
3. ✅ Usa "integer/float" per range numerici
4. ✅ Usa "text" solo per ricerca full-text (è costoso)
5. ❌ Evita di indicizzare campi con alta cardinalità (es. ID univoci)
6. ❌ Non creare indici se la collezione è piccola (< 1000 punti)
7. ⚠️  Ricorda: più indici = più spazio disco + insert più lenti

═══════════════════════════════════════════
STEP 1: Creazione indici
═══════════════════════════════════════════

🔧 Creazione indici sui campi del payload...

Creazione indice su "type"...
✓ Indice "type" creato
Creazione indice su "age"...
✓ Indice "age" creato
Creazione indice su "breed"...
✓ Indice "breed" creato
Creazione indice full-text su "personality"...
✓ Indice full-text "personality" creato
Creazione indice su "vaccinated"...
✓ Indice "vaccinated" creato

✅ Tutti gli indici creati con successo!

📋 Indici presenti nella collezione:

  type:
    - Tipo: keyword
    - Indicizzato: ✅ Sì
  age:
    - Tipo: integer
    - Indicizzato: ✅ Sì
  breed:
    - Tipo: keyword
    - Indicizzato: ✅ Sì
  personality:
    - Tipo: text
    - Indicizzato: ✅ Sì
    - Tokenizer: word
  vaccinated:
    - Tipo: bool
    - Indicizzato: ✅ Sì

═══════════════════════════════════════════
STEP 2: Test performance con indici
═══════════════════════════════════════════

⚡ Benchmark: Query con indici ottimizzati

Nota: Queste query beneficiano degli indici creati

Test 1: Filtro su "type" (indicizzato)
  Tempo: 4.231ms
  Risultati trovati: 10

Test 2: Range su "age" (indicizzato)
  Tempo: 3.892ms
  Risultati trovati: 10

Test 3: Filtri multipli su campi indicizzati
  Tempo: 2.156ms
  Risultati trovati: 8

Test 4: Full-text search su "personality"
  Tempo: 5.678ms
  Risultati trovati: 10

✅ Tutti i test completati!
💡 Con indici appropriati, le query sono molto più veloci!

═══════════════════════════════════════════
STEP 3: Ricerca full-text
═══════════════════════════════════════════

🔍 Esempio di ricerca full-text avanzata

Trovati 5 cani playful/energetic:

1. Max - Personalità: playful
2. Buddy - Personalità: energetic
3. Charlie - Personalità: playful
4. Luna - Personalità: energetic
5. Spot - Personalità: playful
```
