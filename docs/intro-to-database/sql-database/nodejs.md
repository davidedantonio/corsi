---
sidebar_position: 7
---

# Integrazione con Node.js

Fino ad ora abbiamo interrogato PostgreSQL direttamente dalla shell `psql`. In questo esempio vediamo come fare la stessa cosa da **Node.js** — che è poi quello che succede in qualsiasi applicazione reale: il codice si connette al database, esegue le query e usa i risultati.

Per semplicità creeremo un **unico script** da lanciare da terminale che stampa un report del nostro e-commerce. Niente server, niente HTML — solo Node.js e PostgreSQL.

---

## Setup del progetto

Crea una nuova cartella e inizializza un progetto Node.js:

```bash
mkdir ecommerce-report
cd ecommerce-report
npm init -y
npm install pg
```

Aggiungi `"type": "module"` nel `package.json` per usare la sintassi `import/export` moderna:

```json
{
  "name": "ecommerce-report",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "pg": "^8.x.x"
  }
}
```

Crea il file `.gitignore`:

```
node_modules
.env
```

Crea il file dello script:

```bash
touch report.js
```

---

## Lo script

Apri `report.js` e incolla questo codice:

```javascript
import pg from "pg";

// --- Connessione al database ---
const client = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "ecommerce",
  password: "mysecretpassword",
  port: 5432,
});

// Funzione di utilità per stampare separatori
function separator(title) {
  console.log("\n" + "=".repeat(50));
  console.log(" " + title);
  console.log("=".repeat(50));
}

async function runReport() {
  await client.connect();

  try {
    // -------------------------------------------
    // 1. Riepilogo generale
    // -------------------------------------------
    separator("📦 RIEPILOGO GENERALE");

    const totCustomers = await client.query(
      "SELECT COUNT(*) AS totale FROM customers"
    );
    console.log(`Clienti totali: ${totCustomers.rows[0].totale}`);

    const totOrders = await client.query(`
      SELECT
        COUNT(*) AS totale,
        COUNT(*) FILTER (WHERE status = 'completed')  AS completati,
        COUNT(*) FILTER (WHERE status = 'pending')    AS in_attesa,
        COUNT(*) FILTER (WHERE status = 'cancelled')  AS cancellati,
        COUNT(*) FILTER (WHERE status = 'refunded')   AS rimborsati
      FROM orders
    `);
    const o = totOrders.rows[0];
    console.log(`Ordini totali:  ${o.totale}`);
    console.log(`  ✅ Completati:  ${o.completati}`);
    console.log(`  ⏳ In attesa:   ${o.in_attesa}`);
    console.log(`  ❌ Cancellati:  ${o.cancellati}`);
    console.log(`  🔄 Rimborsati:  ${o.rimborsati}`);

    // -------------------------------------------
    // 2. Fatturato per categoria
    // -------------------------------------------
    separator("💰 FATTURATO PER CATEGORIA");

    const revenueByCategory = await client.query(`
      SELECT
        c.name AS categoria,
        SUM(oi.quantity * oi.unit_price) AS fatturato
      FROM order_items oi
      JOIN orders o     ON oi.order_id = o.order_id
      JOIN products p   ON oi.product_id = p.product_id
      JOIN categories c ON p.category_id = c.category_id
      WHERE o.status = 'completed'
      GROUP BY c.name
      ORDER BY fatturato DESC
    `);

    revenueByCategory.rows.forEach((row, i) => {
      const fatturato = parseFloat(row.fatturato).toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR",
      });
      console.log(`  ${i + 1}. ${row.categoria.padEnd(20)} ${fatturato}`);
    });

    // -------------------------------------------
    // 3. Top 5 clienti per spesa
    // -------------------------------------------
    separator("🏆 TOP 5 CLIENTI PER SPESA");

    const topCustomers = await client.query(`
      SELECT
        cu.full_name,
        cu.city,
        cu.segment,
        COUNT(DISTINCT o.order_id)        AS num_ordini,
        SUM(oi.quantity * oi.unit_price)  AS totale_speso
      FROM customers cu
      JOIN orders o       ON cu.customer_id = o.customer_id
      JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.status = 'completed'
      GROUP BY cu.customer_id, cu.full_name, cu.city, cu.segment
      ORDER BY totale_speso DESC
      LIMIT 5
    `);

    topCustomers.rows.forEach((row, i) => {
      const spesa = parseFloat(row.totale_speso).toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR",
      });
      console.log(
        `  ${i + 1}. ${row.full_name.padEnd(25)} ` +
        `${row.city.padEnd(15)} [${row.segment}]  ` +
        `${row.num_ordini} ordini  ${spesa}`
      );
    });

    // -------------------------------------------
    // 4. Fatturato mensile (ultimo anno)
    // -------------------------------------------
    separator("📅 FATTURATO MENSILE 2024");

    const monthlyRevenue = await client.query(`
      SELECT
        DATE_TRUNC('month', o.created_on) AS mese,
        COUNT(DISTINCT o.order_id)        AS num_ordini,
        SUM(oi.quantity * oi.unit_price)  AS fatturato
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.status = 'completed'
        AND o.created_on >= '2024-01-01'
        AND o.created_on <  '2025-01-01'
      GROUP BY mese
      ORDER BY mese
    `);

    monthlyRevenue.rows.forEach((row) => {
      const mese = new Date(row.mese).toLocaleString("it-IT", {
        month: "long",
        year: "numeric",
      });
      const fatturato = parseFloat(row.fatturato).toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR",
      });
      console.log(
        `  ${mese.padEnd(20)} ${String(row.num_ordini).padStart(4)} ordini   ${fatturato}`
      );
    });

  } catch (err) {
    console.error("Errore durante l'esecuzione del report:", err.message);
  } finally {
    // Chiudiamo sempre la connessione, anche in caso di errore
    await client.end();
  }
}

runReport();
```

Lancia lo script:

```bash
node report.js
```

Dovresti vedere qualcosa di simile:

```
==================================================
 📦 RIEPILOGO GENERALE
==================================================
Clienti totali: 500
Ordini totali:  10000
  ✅ Completati:  7508
  ⏳ In attesa:   1012
  ❌ Cancellati:  993
  🔄 Rimborsati:  487

==================================================
 💰 FATTURATO PER CATEGORIA
==================================================
  1. Elettronica          € 312.450,00
  2. Casa e Cucina        €  98.230,50
  ...
```

---

## Spiegazione del codice

### Connessione con `pg.Client`

```javascript
const client = new pg.Client({ ... });
await client.connect();
```

`pg.Client` apre **una singola connessione** al database. È la scelta giusta per uno script che esegue query in sequenza. Nelle applicazioni web si usa invece `pg.Pool` che gestisce un pool di connessioni parallele — ma per ora `Client` è più semplice e chiaro.

### Eseguire una query

```javascript
const result = await client.query("SELECT COUNT(*) AS totale FROM customers");
console.log(result.rows[0].totale);
```

`client.query()` restituisce un oggetto con una proprietà `rows` — un array di oggetti JavaScript dove ogni oggetto è una riga del risultato. I nomi delle proprietà corrispondono agli alias definiti con `AS` nella query SQL.

### Query con parametri

Se dovessi filtrare per un valore specifico (es. un `customer_id`), non concatenare mai stringhe direttamente — usa i **parametri posizionali** `$1`, `$2`, ecc.:

```javascript
// ✅ Sicuro — usa parametri
const res = await client.query(
  "SELECT * FROM orders WHERE customer_id = $1 AND status = $2",
  [42, "completed"]
);

// ❌ Mai fare così — vulnerabile a SQL injection
const res = await client.query(
  `SELECT * FROM orders WHERE customer_id = ${id}`
);
```

I parametri vengono sanitizzati automaticamente da `pg`, proteggendo da attacchi **SQL injection**.

### Il blocco try/finally

```javascript
try {
  // esegui le query
} catch (err) {
  console.error(err.message);
} finally {
  await client.end(); // chiude sempre la connessione
}
```

Il blocco `finally` garantisce che la connessione venga **sempre chiusa**, anche se si verifica un errore. Lasciare connessioni aperte è un problema comune nelle applicazioni Node.js — questo pattern lo previene.

---

## Provaci tu

Prova ad aggiungere una nuova sezione al report. Ad esempio:

- I **5 prodotti più venduti** per quantità
- Il **tasso di cancellazione** per canale (`web`, `mobile`, `store`)
- Il **valore medio dell'ordine** (AOV) per segmento cliente

Le query le hai già scritte nella sezione precedente — si tratta solo di adattarle allo script! 🚀
