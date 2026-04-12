---
sidebar_position: 7
---

# Integrazione con Node.js

Così come abbiamo fatto per PostgreSQL, vediamo come interrogare MongoDB da **Node.js**. Creeremo lo stesso tipo di script da terminale — un report che esegue alcune aggregazioni e stampa i risultati in console.

Il confronto con lo script PostgreSQL è interessante: le query cambiano forma (pipeline di aggregazione invece di SQL), ma la struttura del codice è quasi identica.

---

## Setup del progetto

```bash
mkdir mongodb-report
cd mongodb-report
npm init -y
npm install mongodb
```

Aggiungi `"type": "module"` nel `package.json`:

```json
{
  "name": "mongodb-report",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "mongodb": "^6.x.x"
  }
}
```

Crea i file:

```bash
touch report.js
touch .gitignore
```

Nel `.gitignore`:

```
node_modules
.env
```

---

## Lo script

Apri `report.js` e incolla questo codice:

```javascript
import { MongoClient } from "mongodb";

const URI     = "mongodb://localhost:27017";
const DB_NAME = "ecommerce";

const client = new MongoClient(URI);

function separator(title) {
  console.log("\n" + "=".repeat(50));
  console.log(" " + title);
  console.log("=".repeat(50));
}

async function runReport() {
  await client.connect();
  const db = client.db(DB_NAME);
  const orders = db.collection("orders");

  try {
    // -------------------------------------------
    // 1. Riepilogo generale
    // -------------------------------------------
    separator("📦 RIEPILOGO GENERALE");

    const totale = await orders.countDocuments();
    const completati = await orders.countDocuments({ status: "completed" });
    const pending    = await orders.countDocuments({ status: "pending" });
    const cancellati = await orders.countDocuments({ status: "cancelled" });
    const rimborsati = await orders.countDocuments({ status: "refunded" });

    console.log(`Ordini totali:  ${totale}`);
    console.log(`  ✅ Completati:  ${completati}`);
    console.log(`  ⏳ In attesa:   ${pending}`);
    console.log(`  ❌ Cancellati:  ${cancellati}`);
    console.log(`  🔄 Rimborsati:  ${rimborsati}`);

    // -------------------------------------------
    // 2. Fatturato per categoria
    // -------------------------------------------
    separator("💰 FATTURATO PER CATEGORIA");

    const revenueByCategory = await orders.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.category",
          fatturato: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      { $sort: { fatturato: -1 } },
    ]).toArray();

    revenueByCategory.forEach((row, i) => {
      const fatturato = row.fatturato.toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR",
      });
      console.log(`  ${i + 1}. ${row._id.padEnd(20)} ${fatturato}`);
    });

    // -------------------------------------------
    // 3. Top 5 clienti per spesa
    // -------------------------------------------
    separator("🏆 TOP 5 CLIENTI PER SPESA");

    const topCustomers = await orders.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$customer.email",
          nome:         { $first: "$customer.name" },
          citta:        { $first: "$customer.city" },
          segment:      { $first: "$customer.segment" },
          totale_speso: { $sum: "$total" },
          num_ordini:   { $sum: 1 },
        },
      },
      { $sort: { totale_speso: -1 } },
      { $limit: 5 },
    ]).toArray();

    topCustomers.forEach((row, i) => {
      const spesa = row.totale_speso.toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR",
      });
      console.log(
        `  ${i + 1}. ${row.nome.padEnd(25)} ` +
        `${row.citta.padEnd(15)} [${row.segment}]  ` +
        `${row.num_ordini} ordini  ${spesa}`
      );
    });

    // -------------------------------------------
    // 4. Fatturato mensile 2024
    // -------------------------------------------
    separator("📅 FATTURATO MENSILE 2024");

    const monthlyRevenue = await orders.aggregate([
      {
        $match: {
          status: "completed",
          date: { $gte: new Date("2024-01-01"), $lt: new Date("2025-01-01") },
        },
      },
      {
        $group: {
          _id: { anno: { $year: "$date" }, mese: { $month: "$date" } },
          fatturato:  { $sum: "$total" },
          num_ordini: { $sum: 1 },
        },
      },
      { $sort: { "_id.anno": 1, "_id.mese": 1 } },
    ]).toArray();

    monthlyRevenue.forEach((row) => {
      const data = new Date(row._id.anno, row._id.mese - 1, 1);
      const mese = data.toLocaleString("it-IT", { month: "long", year: "numeric" });
      const fatturato = row.fatturato.toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR",
      });
      console.log(
        `  ${mese.padEnd(20)} ${String(row.num_ordini).padStart(4)} ordini   ${fatturato}`
      );
    });

  } catch (err) {
    console.error("Errore:", err.message);
  } finally {
    await client.close();
  }
}

runReport();
```

Lancia lo script:

```bash
node report.js
```

---

## Spiegazione del codice

### Connessione con MongoClient

```javascript
const client = new MongoClient(URI);
await client.connect();
const db     = client.db(DB_NAME);
const orders = db.collection("orders");
```

`MongoClient` apre la connessione, `db()` seleziona il database, `collection()` punta alla collezione. Da qui in poi usi `orders` esattamente come usavi `db.orders` nella shell.

### Eseguire una query

```javascript
const risultati = await orders.find({ status: "completed" }).toArray();
```

`find()` restituisce un **cursore** — per ottenere tutti i risultati come array JavaScript chiama `.toArray()`. Per contare usa `countDocuments()`.

### Eseguire una pipeline di aggregazione

```javascript
const risultati = await orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$channel", totale: { $sum: "$total" } } },
  { $sort: { totale: -1 } }
]).toArray();
```

`aggregate()` accetta lo stesso array di stadi che usavi nella shell — la sintassi è identica. Alla fine `.toArray()` materializza i risultati.

### Il blocco try/finally

```javascript
try {
  // esegui le query
} catch (err) {
  console.error(err.message);
} finally {
  await client.close(); // chiude sempre la connessione
}
```

Come per PostgreSQL, `finally` garantisce che la connessione venga sempre chiusa, anche in caso di errore.

---

## Confronto con lo script PostgreSQL

Se hai già fatto lo script per PostgreSQL noterai che la struttura è quasi identica:

| PostgreSQL (`pg`)        | MongoDB (`mongodb`)           |
|--------------------------|-------------------------------|
| `new pg.Client()`        | `new MongoClient()`           |
| `client.connect()`       | `client.connect()`            |
| `client.query(SQL)`      | `collection.aggregate([...])`  |
| `result.rows`            | `.toArray()`                  |
| `client.end()`           | `client.close()`              |

Cambia la sintassi delle query, non il pattern di utilizzo.

---

## Provaci tu

Prova ad aggiungere una sezione al report:

- I **prodotti più venduti** per quantità (hint: `$unwind` + `$group` su `items.product`)
- Il **fatturato per canale** con valore medio ordine (hint: `$avg` su `total`)
- Gli ordini con **totale superiore a 1000€** per regione

Le pipeline le hai già viste nella sezione aggregazione — si tratta solo di portarle nello script! 🚀
