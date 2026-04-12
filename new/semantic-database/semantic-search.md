---
sidebar_position: 3
---

# Effettuare ricerche semantiche

Ora che abbiamo inserito molti punti, possiamo eseguire ricerche semantiche.
Apri il file `search.js` e incolla il seguente codice:

```javascript
import { QdrantClient } from "@qdrant/js-client-rest";
import { generateEmbedding } from "./embeddings.js";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

const client = new QdrantClient({
  url: "http://localhost:6333",
  checkCompatibility: false,
});

async function searchPets(queryText, limit = 5) {
  try {
    console.log(`\n🔍 Ricerca: "${queryText}"\n`);

    // Genera embedding per la query
    const queryVector = await generateEmbedding(queryText);

    // Cerca i punti più simili
    const results = await client.search("pets", {
      vector: queryVector,
      limit: limit,
    });

    console.log(`Trovati ${results.length} risultati:\n`);

    results.forEach((result, index) => {
      console.log(`${index + 1}. Score: ${result.score.toFixed(4)}`);
      console.log(`   Nome: ${result.payload.name}`);
      console.log(`   Tipo: ${result.payload.type}`);
      console.log(`   Razza: ${result.payload.breed}`);
      console.log(`   Età: ${result.payload.age} anni`);
      if (result.payload.personality) {
        console.log(`   Personalità: ${result.payload.personality}`);
      }
      console.log("---");
    });
  } catch (error) {
    console.error("Errore durante la ricerca:", error);
  }
}

async function askQuestion() {
  let answer = await rl.question(
    'Inserisci la tua domanda (o "exit" per uscire): ',
  );
  while (answer.toLowerCase() !== "exit") {
    await searchPets(answer);
    answer = await rl.question(
      'Inserisci la tua domanda (o "exit" per uscire): ',
    );
  }
  rl.close();
}

askQuestion();
```

Questo script definisce una funzione `searchPets` che:

1. Genera un embedding per la query di ricerca.
2. Esegue una ricerca nella collezione "pets" per trovare i punti più simili.
3. Stampa i risultati con il punteggio di similarità e i dettagli del payload.

Inoltre, utilizza il modulo `readline` per permettere all'utente di inserire query interattivamente.
Esegui questo script con:

```bash
npm start search.js
```

Dovresti vedere un prompt che ti chiede di inserire una domanda. Prova a digitare:

```
Luna brave reptile

🔍 Ricerca: "Luna brave reptile"

Trovati 5 risultati:

1. Score: 0.8387
   Nome: Luna
   Tipo: reptile
   Razza: Bichon Frise
   Età: 1 anni
   Personalità: brave
---
2. Score: 0.8364
   Nome: Luna
   Tipo: reptile
   Razza: Beagle
   Età: 12 anni
   Personalità: brave
---
3. Score: 0.8138
   Nome: Luna
   Tipo: reptile
   Razza: Havanese
   Età: 15 anni
   Personalità: shy
---
4. Score: 0.8076
   Nome: Luna
   Tipo: reptile
   Razza: Havanese
   Età: 14 anni
   Personalità: loving
---
5. Score: 0.7938
   Nome: Luna
   Tipo: reptile
   Razza: Bichon Frise
   Età: 14 anni
   Personalità: intelligent
---
Inserisci la tua domanda (o "exit" per uscire):
```

Puoi provare altre query come "dog friendly", "cat curious" o "intelligent bird".
Quando hai finito, digita "exit" per uscire.
