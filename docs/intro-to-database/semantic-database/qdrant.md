---
sidebar_position: 2
---

# Qdrant

Qdrant è un database vettoriale open-source progettato specificamente per memorizzare,
cercare e gestire vettori ad alta dimensionalità insieme ai loro payload. È diventato
particolarmente popolare nell'era dell'AI e del machine learning, dove la ricerca semantica
e il retrieval basato su similarità sono essenziali.

A differenza dei database tradizionali che organizzano i dati in righe e colonne o documenti,
Qdrant si specializza nel gestire vettori - rappresentazioni numeriche di dati complessi come
testo, immagini o audio - e nel trovare rapidamente elementi simili tra loro.

## Perché usare Qdrant?

I database vettoriali come Qdrant sono fondamentali quando lavori con:

- **Ricerca semantica**: trovare contenuti in base al significato, non solo parole chiave esatte
- **Sistemi RAG (Retrieval-Augmented Generation)**: arricchire le risposte dei LLM con informazioni contestuali
- **Recommendation systems**: suggerire prodotti o contenuti simili
- **Ricerca per similarità di immagini**: trovare foto simili in grandi archivi
- **Clustering e classificazione**: raggruppare automaticamente dati correlati

Il vantaggio principale rispetto a MongoDB o altri database documentali è la capacità di
effettuare ricerche basate sulla similarità semantica piuttosto che su match esatti. Quando
cerchi "cucciolo adorabile", Qdrant può trovare anche "cane carino" grazie alla vicinanza vettoriale.

## Installazione di Qdrant

Immergiamoci. Se stai usando Docker come me, esegui i seguenti comandi:

```bash
docker run --name corso-qddocker run -p 6333:6333 -p 6334:6334 \
    -v "$(pwd)/qdrant_storage:/qdrant/storage:z" \
```

Questo eseguirà un nuovo container Qdrant e lo chiamerà corso-qdrant. Qdrant espone due porte:

- **6333**: API REST per le operazioni CRUD
- **6334**: gRPC API (opzionale, per performance migliori)

Qdrant parte automaticamente e puoi verificare che funzioni aprendo il browser su
`http://localhost:6333/dashboard` dove troverai una comoda interfaccia web.
Utilizza il [sito ufficiale](https://qdrant.tech/documentation/quick_start/) e seguire le
istruzioni per la tua piattaforma.

## Installazione di Ollama

Per generare gli embeddings useremo Ollama, un'ottima alternativa locale a OpenAI.
Vai su [https://ollama.com/download](https://ollama.com/download) e scarica la versione
corretta per il tuo sistema operativo. Installa il pacchetto come qualsiasi altra applicazione.

Dopo l'installazione, apri il terminale e digita:

```bash
ollama list
```

Ora scarichiamo un modello per gli embeddings. Useremo `nomic-embed-text`, ottimo per
generare embeddings semantici:

```bash
ollama pull nomic-embed-text
```

Per verificare che tutto funzioni, prova a generare un embedding di prova:

```bash
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": "Ciao come va?"
}' | jq
```

Dovresti vedere un output JSON con il vettore generato.

## Collection e punti

In Qdrant, i concetti principali sono:

- **Collezioni**: contenitori logici per i tuoi vettori, simili alle collezioni MongoDB
- **Punti (Points)**: singoli record che contengono un vettore e opzionalmente un payload (metadati)
- **Vettori**: array di numeri float che rappresentano i tuoi dati in uno spazio ad alta dimensionalità

Ogni punto ha:

- Un **ID** univoco
- Un **vettore** (l'embedding)
- Un **payload** opzionale (metadati in formato JSON, come in MongoDB), con cui e possibile
  eseguire filtri avanzati durante la ricerca

## Usare Qdrant con Node.js

A di MongoDB, PostgreSQL e Redis, Qdrant offre un'API REST semplice da usare.
Di conseguenza, possiamo usare `fetch` o `axios` per interagire con Qdrant, quindi
abbiamo la necessità di installare un client specifico. Ovviamente, utilizzeremo quello
per Node.js. Sentiti libero/a di usare `axios` se preferisci, o un altro linguaggio di
programmazione a tua scelta. Sul sito ufficiale trovi SDK per molti linguaggi diversi.

Iniziamo creando un nuovo progetto Node.js:

```bash
mkdir qdrant-nodejs
cd qdrant-nodejs
npm init -y
npm install @qdrant/js-client-rest ollama
```

Aggiungiamo uno script di avvio nel `package.json`:

```json
"scripts": {
    "start": "node index.js"
}
```

sotto la voce `depescription` aggiungete questa:

```json
  "type": "module",
```

e aggiungete un file `.gitignore`:

```
node_modules
.env
```

Ora create il file `index.js`:

```bash
touch setup.js
touch insert.js
touch search.js
touch update.js
```

## Setup del database

Terminata la parte di setup, apri il progetto con il tuo editor di codice preferito.
Dovresti vedere questa struttura:

```
qdrant-nodejs
├── node_modules
├── .gitignore
├── insert.js
├── search.js
├── setup.js
├── update.js
├── package-lock.json
└── package.json
```

Ora siamo pronti per scrivere il codice. Apri il file `setup.js` e incolla il seguente codice:

```javascript
import { QdrantClient } from "@qdrant/js-client-rest";
import { Ollama } from "ollama";

// Connettiti a Qdrant (in locale)
const qdrantClient = new QdrantClient({ url: "http://localhost:6333" });

// Connettiti a Ollama
const ollama = new Ollama({ host: "http://localhost:11434" });

async function setup() {
  try {
    // Prima verifica se la collezione esiste già
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      (col) => col.name === "pets",
    );

    if (collectionExists) {
      console.log('Collezione "pets" già esistente. Eliminazione...');
      await qdrantClient.deleteCollection("pets");
    }

    // Genera un embedding di test per ottenere la dimensione
    const testEmbedding = await ollama.embeddings({
      model: "nomic-embed-text",
      prompt: "test",
    });

    const vectorSize = testEmbedding.embedding.length;
    console.log(`Dimensione vettori: ${vectorSize}`);

    // Crea la collezione "pets"
    await qdrantClient.createCollection("pets", {
      vectors: {
        size: vectorSize, // nomic-embed-text genera vettori di 768 dimensioni
        distance: "Cosine", // metrica di distanza: Cosine, Euclid, Dot
      },
    });

    console.log('Collezione "pets" creata con successo!');

    // Verifica che la collezione esista
    const allCollections = await qdrantClient.getCollections();
    console.log(
      "Collezioni disponibili:",
      allCollections.collections.map((c) => c.name),
    );
  } catch (error) {
    console.error("Errore durante il setup:", error);
  }
}

setup();
```

Questo script si connette a Qdrant e Ollama, elimina la collezione "pets" se esiste già,
genera un embedding di test per determinare la dimensione dei vettori, e crea una
nuova collezione "pets" con la dimensione corretta.

Eseguendo questo script con:

```bash
npm start setup.js
```

dovresti vedere un output simile a questo:

```
Dimensione vettori: 768
Collezione "pets" creata con successo!
Collezioni disponibili: [ 'pets' ]
```

## Inserimento dei dati

Ora passiamo a creare il file `embeddings.js` per generare gli embeddings con Ollama:

```javascript
import { Ollama } from "ollama";

const ollama = new Ollama({ host: "http://localhost:11434" });

/**
 * Genera un embedding per un testo usando Ollama
 */
export async function generateEmbedding(text) {
  try {
    const response = await ollama.embeddings({
      model: "nomic-embed-text",
      prompt: text,
    });

    return response.embedding;
  } catch (error) {
    console.error("Errore durante la generazione dell'embedding:", error);
    throw error;
  }
}

/**
 * Genera embeddings per un array di testi
 */
export async function generateEmbeddings(texts) {
  const embeddings = [];

  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }

  return embeddings;
}
```

Questo modulo esporta due funzioni: `generateEmbedding` per generare un embedding
per un singolo testo, e `generateEmbeddings` per generare embeddings per un array
di testi.

Ora apri il file `insert.js` e incolla il seguente codice:

```javascript
import { QdrantClient } from "@qdrant/js-client-rest";
import { generateEmbedding } from "./embeddings.js";

const client = new QdrantClient({
  url: "http://localhost:6333",
  checkCompatibility: false,
});

async function insertPets() {
  try {
    // Dati degli animali
    const petsData = [
      {
        id: 1,
        text: "Havanese dog named Luna, 8 years old, very friendly and playful",
        payload: { name: "Luna", type: "dog", breed: "Havanese", age: 8 },
      },
      {
        id: 2,
        text: "Beagle dog named Fido, 5 years old, loves to run and play fetch",
        payload: { name: "Fido", type: "dog", breed: "Beagle", age: 5 },
      },
      {
        id: 3,
        text: "Tabby cat named Fluffy, 3 years old, independent and curious",
        payload: { name: "Fluffy", type: "cat", breed: "Tabby", age: 3 },
      },
      {
        id: 4,
        text: "African Gray parrot named Carina, 12 years old, very intelligent",
        payload: {
          name: "Carina",
          type: "bird",
          breed: "African Gray",
          age: 12,
        },
      },
      {
        id: 5,
        text: "Golden Retriever puppy named Buddy, 1 year old, energetic and loves people",
        payload: {
          name: "Buddy",
          type: "dog",
          breed: "Golden Retriever",
          age: 1,
        },
      },
    ];

    console.log("Generazione embeddings...");

    // Genera embeddings e crea i punti
    const points = [];
    for (const pet of petsData) {
      console.log(`Processando: ${pet.payload.name}...`);
      const vector = await generateEmbedding(pet.text);

      points.push({
        id: pet.id,
        vector: vector,
        payload: pet.payload,
      });
    }

    // Inserisci i punti nella collezione
    await client.upsert("pets", {
      wait: true,
      points: points,
    });

    console.log(`\n✓ Inseriti ${points.length} animali nella collezione!`);

    // Verifica il conteggio
    const collectionInfo = await client.getCollection("pets");
    console.log(
      `Totale punti nella collezione: ${collectionInfo.points_count}`,
    );
  } catch (error) {
    console.error("Errore durante l'inserimento:", error);
  }
}

insertPets();
```

Questo script definisce una funzione `insertPets` che:

1. Definisce un array di dati sugli animali, ciascuno con un ID, una descrizione testuale e un payload di metadati.
2. Genera un embedding per ciascun animale usando la funzione `generateEmbedding`.
3. Crea un array di punti, ciascuno contenente l'ID, il vettore e il payload.
4. Inserisce tutti i punti nella collezione "pets" di Qdrant usando il metodo `upsert`.
5. Stampa il numero totale di punti nella collezione per verifica.

Esegui questo script con:

```bash
npm insert.js
```

Dovresti vedere un output simile a questo:

```
Generazione embeddings...
Processando: Luna...
Processando: Fido...
Processando: Fluffy...
Processando: Carina...
Processando: Buddy...

✓ Inseriti 5 animali nella collezione!
Totale punti nella collezione: 5
```

## Inseriamo tanti punti

Per inserire molti punti, possiamo creare un file `insert_many.js` che genera
e inserisce un gran numero di punti in modo efficiente. Ecco come fare:

```javascript
import { QdrantClient } from "@qdrant/js-client-rest";
import { generateEmbedding } from "./embeddings.js";

const client = new QdrantClient({ url: "http://localhost:6333" });

const names = [
  "Luna",
  "Fido",
  "Fluffy",
  "Carina",
  "Spot",
  "Beethoven",
  "Baxter",
  "Max",
  "Bella",
  "Charlie",
];
const types = ["dog", "cat", "bird", "reptile"];
const breeds = [
  "Havanese",
  "Bichon Frise",
  "Beagle",
  "Cockatoo",
  "African Gray",
  "Tabby",
  "Iguana",
  "Golden Retriever",
];
const adjectives = [
  "friendly",
  "playful",
  "curious",
  "intelligent",
  "energetic",
  "calm",
  "independent",
  "loving",
  "shy",
  "brave",
];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomAge() {
  return Math.floor(Math.random() * 15) + 1;
}

async function insertManyPets() {
  try {
    const batchSize = 50; // Processa 50 alla volta
    const totalPets = 1000;
    let currentId = 6; // Partiamo da 6 perché 1-5 sono già usati

    console.log(
      `Inserimento di ${totalPets} animali in batch da ${batchSize}...\n`,
    );

    for (let batch = 0; batch < totalPets / batchSize; batch++) {
      const points = [];

      console.log(`Batch ${batch + 1}/${totalPets / batchSize}...`);

      for (let i = 0; i < batchSize; i++) {
        const name = getRandomItem(names);
        const type = getRandomItem(types);
        const breed = getRandomItem(breeds);
        const age = getRandomAge();
        const personality = getRandomItem(adjectives);

        const text = `${breed} ${type} named ${name}, ${age} years old, ${personality}`;

        // Genera embedding
        const vector = await generateEmbedding(text);

        points.push({
          id: currentId++,
          vector: vector,
          payload: {
            name: name,
            type: type,
            breed: breed,
            age: age,
            personality: personality,
          },
        });
      }

      // Inserisci il batch
      await client.upsert("pets", {
        wait: true,
        points: points,
      });

      console.log(
        `  ✓ Batch ${batch + 1} completato (${points.length} animali)`,
      );
    }

    // Verifica il conteggio finale
    const collectionInfo = await client.getCollection("pets");
    console.log(
      `\n✓ Totale punti nella collezione: ${collectionInfo.points_count}`,
    );
  } catch (error) {
    console.error("Errore durante l'inserimento:", error);
  }
}

insertManyPets();
```

Questo script genera e inserisce 1000 animali in batch di 50 alla volta. Ogni animale ha un nome,
tipo, razza, età e personalità generati casualmente. Gli embeddings vengono generati per ogni descrizione
testuale e i punti vengono inseriti nella collezione "pets".

Ovviamente impiegherà un po' di tempo, ma alla fine dovresti vedere un output simile a questo:

```
Inserimento di 1000 animali in batch da 50...
Batch 1/20...
  ✓ Batch 1 completato (50 animali)
Batch 2/20...
  ✓ Batch 2 completato (50 animali)
...Batch 20/20...
  ✓ Batch 20 completato (50 animali)

...

✓ Totale punti nella collezione: 1005
```
