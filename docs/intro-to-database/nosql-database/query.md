---
sidebar_position: 3
---

# Interrogare le collezioni

Ora che abbiamo 10.000 ordini nel database, è il momento di **interrogare** la collezione per estrarre informazioni utili.

---

## findOne

Iniziamo con la query più semplice:

```javascript
db.orders.findOne();
```

Restituisce il **primo** documento della collezione. Senza argomenti equivale a "dammi qualsiasi documento".

Cerchiamo un ordine specifico per `order_id`:

```javascript
db.orders.findOne({ order_id: "ORD-00042" });
```

Cerchiamo il primo ordine effettuato da un cliente di Milano:

```javascript
db.orders.findOne({ "customer.city": "Milano" });
```

Nota la **dot notation** `"customer.city"`: permette di accedere ai campi annidati all'interno di un sotto-documento. Questo è uno dei pattern più usati in MongoDB.

---

## find

Per trovare **tutti** i documenti che corrispondono a una condizione:

```javascript
db.orders.find({ status: "completed" });
```

Per default MongoDB restituisce 20 risultati alla volta sotto forma di **cursore**. Digita `it` per iterare sui successivi 20.

Filtriamo gli ordini dal canale mobile:

```javascript
db.orders.find({ channel: "mobile" });
```

Ordini di clienti VIP:

```javascript
db.orders.find({ "customer.segment": "vip" });
```

---

## countDocuments, limit e toArray

```javascript
// Quanti ordini completati ci sono?
db.orders.countDocuments({ status: "completed" });

// I primi 5 ordini cancellati
db.orders.find({ status: "cancelled" }).limit(5);

// Tutto in un array (attenzione alle grandi collezioni!)
db.orders.find({ status: "refunded" }).toArray();
```

---

## Operatori di query

Vogliamo trovare tutti gli ordini con un totale superiore a 500€:

```javascript
db.orders.find({ total: { $gt: 500 } });
```

Ordini tra 100€ e 300€:

```javascript
db.orders.find({ total: { $gte: 100, $lte: 300 } });
```

Gli operatori più usati sono:

- `$gt` — greater than (maggiore di)
- `$gte` — greater than or equal to (maggiore o uguale a)
- `$lt` — less than (minore di)
- `$lte` — less than or equal to (minore o uguale a)
- `$eq` — equals (uguale a)
- `$ne` — not equals (diverso da)
- `$in` — valore presente in un array
- `$nin` — valore **non** presente in un array

Ordini con status `pending` o `cancelled`:

```javascript
db.orders.find({ status: { $in: ["pending", "cancelled"] } });
```

Ordini **non** completati:

```javascript
db.orders.find({ status: { $ne: "completed" } });
```

---

## Operatori logici

Ordini completati dal canale web con totale superiore a 1000€:

```javascript
db.orders.find({
  $and: [{ status: "completed" }, { channel: "web" }, { total: { $gt: 1000 } }],
});
```

Ordini da clienti di Milano **oppure** Roma:

```javascript
db.orders.find({
  $or: [{ "customer.city": "Milano" }, { "customer.city": "Roma" }],
});
```

In alternativa, per il caso `$or` su stesso campo puoi usare `$in`:

```javascript
db.orders.find({ "customer.city": { $in: ["Milano", "Roma"] } });
```

---

## Interrogare array annidati

Uno dei vantaggi di MongoDB è poter interrogare direttamente i **campi dentro gli array**. Nel nostro caso, vogliamo trovare ordini che contengono un prodotto specifico:

```javascript
// Ordini che contengono almeno un item della categoria Elettronica
db.orders.find({ "items.category": "Elettronica" });

// Ordini che contengono lo Smartphone XPro 12
db.orders.find({ "items.product": "Smartphone XPro 12" });

// Ordini con almeno un item con prezzo superiore a 500€
db.orders.find({ "items.price": { $gt: 500 } });
```

MongoDB scansiona automaticamente tutti gli elementi dell'array `items` e restituisce il documento se **almeno uno** soddisfa la condizione. Questo pattern in SQL richiederebbe un JOIN su `order_items`.

---

## Ordinamenti (sort)

Ordini per totale decrescente (i più costosi prima):

```javascript
db.orders.find({ status: "completed" }).sort({ total: -1 }).limit(10);
```

Ordini più recenti:

```javascript
db.orders.find().sort({ date: -1 }).limit(10);
```

`-1` significa **decrescente**, `1` significa **crescente**.

---

## Proiezioni

Per restituire solo alcuni campi del documento:

```javascript
// Solo order_id, customer.name e total — escludendo _id
db.orders.find(
  { status: "completed" },
  { order_id: 1, "customer.name": 1, total: 1, _id: 0 },
);
```

`1` significa "includi questo campo", `0` significa "escludi". Nota che `_id` viene sempre incluso di default — per escluderlo devi esplicitamente impostarlo a `0`.

Proiezione utile per avere una vista leggera degli ordini senza l'array `items`:

```javascript
db.orders
  .find(
    { "customer.segment": "vip" },
    {
      order_id: 1,
      "customer.name": 1,
      "customer.city": 1,
      status: 1,
      total: 1,
      _id: 0,
    },
  )
  .sort({ total: -1 });
```
