---
sidebar_position: 4
---

# Aggiornare le collezioni

## insertOne e insertMany

Hai già incontrato `insertOne` nella sezione precedente. `insertMany` funziona allo stesso modo ma accetta un **array** di documenti. In generale usa sempre la versione esplicita (`insertOne` / `insertMany`) invece del generico `insert`, perché ti obbliga a essere preciso sul tipo di operazione e genera errori chiari se passi il tipo sbagliato. Lo stesso vale per `deleteOne`/`deleteMany` e `updateOne`/`updateMany`.

---

## Aggiornamenti (Updates)

Per aggiornare un documento devi fornire un **filtro** (quale documento trovare) e un **oggetto di aggiornamento** (cosa cambiare).

Aggiorniamo lo status di un ordine da `pending` a `completed`:

```javascript
db.orders.updateOne(
  { order_id: "ORD-00010" },
  { $set: { status: "completed" } },
);
```

Il primo oggetto è il filtro, il secondo usa l'operatore `$set` per aggiornare solo il campo specificato — **senza toccare il resto del documento**.

Aggiorniamo più campi contemporaneamente — aggiungiamo una nota e aggiorniamo il canale:

```javascript
db.orders.updateOne(
  { order_id: "ORD-00010" },
  { $set: { channel: "store", note: "Ordine ritirato in negozio" } },
);
```

Per aggiornare **tutti** i documenti che corrispondono al filtro usa `updateMany`. Ad esempio, tutti gli ordini `pending` più vecchi di una certa data diventano `cancelled`:

```javascript
db.orders.updateMany(
  {
    status: "pending",
    date: { $lt: new Date("2024-01-01") },
  },
  { $set: { status: "cancelled" } },
);
```

---

## Operatori di update più usati

Oltre a `$set` esistono altri operatori utili:

```javascript
// $inc — incrementa un valore numerico
db.orders.updateOne(
  { order_id: "ORD-00010" },
  { $inc: { total: 10.0 } }, // aggiunge 10€ al totale
);

// $unset — rimuove un campo dal documento
db.orders.updateOne({ order_id: "ORD-00010" }, { $unset: { note: "" } });

// $push — aggiunge un elemento a un array
db.orders.updateOne(
  { order_id: "ORD-00010" },
  {
    $push: {
      items: {
        product: "Yoga Mat Premium",
        category: "Sport e Fitness",
        qty: 1,
        price: 29.0,
      },
    },
  },
);
```

Per tutti gli operatori disponibili consulta la [documentazione ufficiale][update].

---

## Upsert

MongoDB ha il concetto di **upsert** (update + insert): se il documento esiste lo aggiorna, altrimenti lo crea. È utile quando non sai con certezza se un documento è già presente.

```javascript
db.orders.updateOne(
  { order_id: "ORD-99999" },
  {
    $set: {
      order_id: "ORD-99999",
      customer: {
        name: "Cliente Test",
        email: "test@example.com",
        city: "Roma",
        region: "Lazio",
        segment: "retail",
      },
      status: "pending",
      channel: "web",
      date: new Date(),
      items: [],
      total: 0,
    },
  },
  { upsert: true },
);
```

Se `ORD-99999` non esiste, viene creato. Se esiste, viene aggiornato.  
⚠️ Assicurati che il filtro identifichi **univocamente** un documento, altrimenti rischi comportamenti inattesi.

---

## Eliminazioni (Deletes)

`deleteOne` e `deleteMany` funzionano come `find`, ma eliminano i documenti invece di restituirli.

Elimina un ordine specifico:

```javascript
db.orders.deleteOne({ order_id: "ORD-99999" });
```

Elimina tutti gli ordini cancellati del 2023:

```javascript
db.orders.deleteMany({
  status: "cancelled",
  date: { $lt: new Date("2024-01-01") },
});
```

---

## findOneAndUpdate

A volte serve **trovare e aggiornare** un documento in un'unica operazione atomica, ricevendo indietro il documento modificato. `findOneAndUpdate` fa esattamente questo:

```javascript
db.orders.findOneAndUpdate(
  { order_id: "ORD-00042" },
  { $set: { status: "completed" } },
  { returnDocument: "after" }, // restituisce il documento DOPO l'aggiornamento
);
```

Esistono anche `findOneAndReplace` e `findOneAndDelete` con la stessa logica.

---

## bulkWrite

Quando devi eseguire **molte operazioni insieme** (mix di insert, update, delete), usa `bulkWrite`. Invece di fare chiamate separate al database, le mandi tutte in un colpo solo — molto più efficiente:

```javascript
db.orders.bulkWrite([
  {
    updateOne: {
      filter: { order_id: "ORD-00001" },
      update: { $set: { status: "completed" } },
    },
  },
  {
    updateOne: {
      filter: { order_id: "ORD-00002" },
      update: { $set: { status: "cancelled" } },
    },
  },
  { deleteOne: { filter: { order_id: "ORD-00003" } } },
]);
```

[update]: https://docs.mongodb.com/manual/reference/operator/update/#id1
