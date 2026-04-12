---
sidebar_position: 6
---

# Aggregazione

La **pipeline di aggregazione** è la funzionalità più potente di MongoDB per l'analisi dei dati. Funziona come una catena di trasformazioni: i documenti entrano nel primo stadio, vengono elaborati, e il risultato passa allo stadio successivo.

Se conosci SQL, puoi pensarla come l'equivalente di `GROUP BY`, `HAVING`, `JOIN` e `SELECT` combinati insieme — ma con una struttura più esplicita e componibile.

---

## Il primo esempio: fatturato per categoria

Vogliamo sapere quanto fatturato ha generato ogni categoria di prodotto. Il problema è che le categorie sono dentro l'array `items` di ogni ordine — dobbiamo prima "esplodere" quell'array.

```javascript
db.orders.aggregate([
  // Stadio 1: solo gli ordini completati
  {
    $match: { status: "completed" }
  },
  // Stadio 2: esplodi l'array items — un documento per ogni item
  {
    $unwind: "$items"
  },
  // Stadio 3: raggruppa per categoria e somma il fatturato
  {
    $group: {
      _id: "$items.category",
      fatturato: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
      unita_vendute: { $sum: "$items.qty" }
    }
  },
  // Stadio 4: ordina per fatturato decrescente
  {
    $sort: { fatturato: -1 }
  }
])
```

Vediamo cosa fa ogni stadio:

- **`$match`** — filtra i documenti, come il `WHERE` in SQL. Va sempre messo il prima possibile per ridurre il numero di documenti da elaborare.
- **`$unwind`** — "esplode" un array: se un ordine ha 3 items, dopo `$unwind` diventa 3 documenti separati. È il pattern fondamentale per analizzare dati annidati.
- **`$group`** — raggruppa i documenti per `_id` e calcola aggregazioni. Gli operatori più usati sono `$sum`, `$avg`, `$min`, `$max`, `$count`.
- **`$sort`** — ordina i risultati.

---

## Fatturato per regione

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $group: {
      _id: "$customer.region",
      fatturato: { $sum: "$total" },
      num_ordini: { $sum: 1 }
    }
  },
  { $sort: { fatturato: -1 } }
])
```

Qui non serve `$unwind` perché stiamo aggregando sul campo `total` del documento radice, non su un array annidato.

---

## Top 5 clienti per spesa

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $group: {
      _id: "$customer.email",
      nome: { $first: "$customer.name" },
      citta: { $first: "$customer.city" },
      segment: { $first: "$customer.segment" },
      totale_speso: { $sum: "$total" },
      num_ordini: { $sum: 1 }
    }
  },
  { $sort: { totale_speso: -1 } },
  { $limit: 5 },
  {
    $project: {
      _id: 0,
      nome: 1,
      citta: 1,
      segment: 1,
      num_ordini: 1,
      totale_speso: 1
    }
  }
])
```

Nota `$first`: quando raggruppi, `$first` prende il valore del primo documento del gruppo. Lo usiamo per recuperare nome e città del cliente dal primo ordine trovato.

`$project` alla fine serve a pulire l'output — include solo i campi che vogliamo mostrare, escludendo `_id`.

---

## Fatturato mensile 2024

```javascript
db.orders.aggregate([
  {
    $match: {
      status: "completed",
      date: {
        $gte: new Date("2024-01-01"),
        $lt:  new Date("2025-01-01")
      }
    }
  },
  {
    $group: {
      _id: {
        anno: { $year: "$date" },
        mese: { $month: "$date" }
      },
      fatturato: { $sum: "$total" },
      num_ordini: { $sum: 1 }
    }
  },
  { $sort: { "_id.anno": 1, "_id.mese": 1 } }
])
```

`$year` e `$month` sono **operatori di data** che estraggono il componente desiderato da un campo timestamp. MongoDB ha molti operatori simili: `$dayOfMonth`, `$hour`, `$week`, ecc.

---

## Prodotti più venduti

Qui torna `$unwind` per esplorare l'array `items` e raggruppare per prodotto:

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.product",
      categoria: { $first: "$items.category" },
      unita_vendute: { $sum: "$items.qty" },
      fatturato: { $sum: { $multiply: ["$items.qty", "$items.price"] } }
    }
  },
  { $sort: { unita_vendute: -1 } },
  { $limit: 10 }
])
```

---

## Confronto canali di vendita

Numero di ordini e fatturato medio per canale:

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $group: {
      _id: "$channel",
      num_ordini: { $sum: 1 },
      fatturato_totale: { $sum: "$total" },
      fatturato_medio: { $avg: "$total" }
    }
  },
  { $sort: { fatturato_totale: -1 } }
])
```

---

## $facet: più aggregazioni in una sola query

`$facet` permette di eseguire **più pipeline parallele** in un'unica query — molto utile per alimentare dashboard con più widget contemporaneamente:

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $facet: {
      per_canale: [
        { $group: { _id: "$channel", totale: { $sum: "$total" } } },
        { $sort: { totale: -1 } }
      ],
      per_segmento: [
        { $group: { _id: "$customer.segment", totale: { $sum: "$total" }, ordini: { $sum: 1 } } },
        { $sort: { totale: -1 } }
      ],
      totale_generale: [
        { $group: { _id: null, fatturato: { $sum: "$total" }, ordini: { $sum: 1 } } }
      ]
    }
  }
])
```

Con una sola query ottieni tre risultati distinti: fatturato per canale, per segmento cliente, e il totale complessivo.

---

Come puoi vedere, aggiungi semplicemente più stadi alla pipeline fino a ottenere esattamente le informazioni che cerchi. Ogni stadio è indipendente e componibile — è una delle parti più eleganti di MongoDB.

Per tutti gli stadi disponibili consulta la [documentazione ufficiale][stages].

[stages]: https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/
