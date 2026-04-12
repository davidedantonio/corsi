---
sidebar_position: 5
---

# Creare indici

I database sono onestamente meraviglie della tecnologia. Frequentemente riescono a gestire le query senza alcuna configurazione aggiuntiva — ma a volte ti imbatterai in problemi di prestazioni. Le query diventano lente, causano carico elevato sul server, lo rendono instabile. In questi casi gli **indici** possono aiutarti.

Un indice è una struttura dati separata che MongoDB mantiene per trovare i documenti rapidamente — come l'indice di un libro. Il compromesso: gli indici rendono le scritture leggermente più lente e occupano spazio su disco, ma le query di lettura diventano molto più veloci.

---

## Explain

Consideriamo una query comune: trovare tutti gli ordini di un cliente specifico per email.

```javascript
db.orders.find({ "customer.email": "mario.rossi0@example.com" })
```

Vediamo come MongoDB la esegue aggiungendo `.explain("executionStats")`:

```javascript
db.orders.find({ "customer.email": "mario.rossi0@example.com" }).explain("executionStats")
```

Le cose da guardare nell'output sono:

- **`winningPlan.stage`** — se vedi `COLLSCAN` significa che MongoDB sta scansionando **tutta la collezione** documento per documento. È come cercare un contatto in rubrica leggendo ogni pagina dall'inizio.
- **`totalDocsExamined`** — quanti documenti ha dovuto esaminare per trovare i risultati.

Con 10.000 documenti e un `COLLSCAN`, MongoDB esamina tutti e 10.000 anche se il risultato è un solo documento. Non va bene!

---

## Creare un indice

```javascript
db.orders.createIndex({ "customer.email": 1 })

// Verifica subito il miglioramento
db.orders.find({ "customer.email": "mario.rossi0@example.com" }).explain("executionStats")
```

Ora vedrai `IXSCAN` (index scan) invece di `COLLSCAN`, e `totalDocsExamined` sarà pari esattamente al numero di risultati trovati — non più 10.000.

Un altro indice utile per le query più comuni:

```javascript
// Filtriamo spesso per status
db.orders.createIndex({ status: 1 })

// Filtriamo spesso per data
db.orders.createIndex({ date: -1 })
```

Per vedere tutti gli indici esistenti sulla collezione:

```javascript
db.orders.getIndexes()
```

---

## Indici composti

Se usi spesso due campi insieme nella stessa query, un **indice composto** è più efficiente di due indici separati:

```javascript
// Spesso filtriamo per status E channel insieme
db.orders.createIndex({ status: 1, channel: 1 })

db.orders.find({ status: "completed", channel: "web" }).explain("executionStats")
```

Nota: l'ordine dei campi nell'indice composto conta. L'indice `{ status: 1, channel: 1 }` è efficiente per query che filtrano per `status` da solo, o per `status` + `channel` insieme. Non è utile per query che filtrano solo per `channel`.

---

## Indici su campi annidati e array

MongoDB può indicizzare anche i campi dentro sotto-documenti e array:

```javascript
// Indice su campo annidato
db.orders.createIndex({ "customer.region": 1 })

// Indice su campo dentro un array — MongoDB lo chiama "multikey index"
db.orders.createIndex({ "items.category": 1 })
db.orders.createIndex({ "items.product": 1 })
```

Con questi indici le query sugli item diventano molto più veloci:

```javascript
db.orders.find({ "items.product": "Smartphone XPro 12" }).explain("executionStats")
```

---

## Indici univoci

Per garantire che un campo non abbia duplicati usa un **indice univoco**. Nel nostro caso, `order_id` deve essere unico:

```javascript
db.orders.createIndex({ order_id: 1 }, { unique: true })

// Questo ora fallirà se order_id esiste già
db.orders.insertOne({ order_id: "ORD-00001", ... })
```

---

## Indice testuale

MongoDB supporta la **ricerca full-text** su campi stringa. Ogni collezione può avere un solo indice testuale, ma può coprire più campi:

```javascript
db.orders.createIndex({
  "customer.name": "text",
  "items.product": "text"
})

// Cerca documenti che contengono "Smartphone" o "Milano"
db.orders.find({ $text: { $search: "Smartphone" } })

// Ordina per rilevanza
db.orders.find(
  { $text: { $search: "Notebook Milano" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```

Per approfondire i tipi di indice disponibili in MongoDB consulta la [documentazione ufficiale][indexes].

[indexes]: https://www.mongodb.com/docs/manual/indexes/
