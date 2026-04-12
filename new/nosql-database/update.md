---
sidebar_position: 4
---

# Aggiornare le collection

## insert, insertOne e insertMany

Hai già incontrato `insert` all’inizio di questa sezione, ma voglio chiarire la differenza tra `insertOne` e `insertMany`.
`insert` fa essenzialmente il lavoro di entrambi: se gli dai un array inserisce più documenti, se gli dai un oggetto ne inserisce uno solo.
I metodi `insertOne` e `insertMany` sono comodi perché, se dai accidentalmente un tipo sbagliato (ad esempio un oggetto quando volevi dare un array),
generano un errore e ti obbligano a correggere. Con `insert` hai più possibilità di fare un’operazione sbagliata.

In generale, usa `insertOne` e `insertMany`. Questo vale anche per `delete` vs `deleteMany`/`deleteOne`, `update` vs `updateMany`/`updateOne`, ecc.

## Aggiornamenti (Updates)

Quando aggiorni dei documenti, devi fornire un **filtro** e ciò che vuoi aggiornare. Esempio:

```javascript
db.pets.updateOne(
  { type: "dog", name: "Luna", breed: "Havanese" },
  { $set: { owner: "Davide D'Antonio" } },
);
```

Il primo oggetto è la **query** (uguale a quella che useresti con `.find()`). Il secondo è l’**oggetto di aggiornamento**. Qui puoi usare diversi **operatori di update**.
Altro esempio: supponiamo che oggi sia il compleanno di **tutti i cani 🎂** e vogliamo aumentare di 1 la loro età:

```javascript
db.pets.updateMany({ type: "dog" }, { $inc: { age: 1 } });
```

Questo incrementa l’età di tutti i documenti con `type: "dog"`. Esistono molte altre opzioni per gli aggiornamenti, puoi consultare la documentazione. [Operatori di update][update].

Nota che `updateOne` e `updateMany` accettano anche un terzo parametro con opzioni aggiuntive. Un’opzione importante è **upsert**.

Esiste anche `replaceOne`: funziona come `updateOne` ma sostituisce completamente il documento (rimuovendo i campi che non fornisci nell’update).

## Upsert

MongoDB ha il concetto di **upsert** (update + insert). Significa: “se non trovi un documento, inseriscilo; se lo trovi, aggiornalo”.
Esempio: vuoi aggiornare un cane chiamato “Sudo” e assegnargli come proprietaria “Sarah Drasner”. Se non esiste, crealo.

```javascript
db.pets.updateOne(
  {
    type: "dog",
    name: "Sudo",
    breed: "Wheaten",
  },
  {
    $set: {
      type: "dog",
      name: "Sudo",
      breed: "Wheaten",
      age: 5,
      index: 10000,
      owner: "Sarah Drasner",
    },
  },
  {
    upsert: true,
  },
);
```

Assicurati che la tua query identifichi in modo **univoco** un documento, altrimenti rischi duplicati o dati incompleti.

## Eliminazioni (Deletes)

`deleteOne` e `deleteMany` funzionano come `find`, ma invece di restituire documenti li eliminano.
Esempio: elimina tutti i “rettili Havanese” (che non ha senso):

```javascript
db.pets.deleteMany({ type: "reptile", breed: "Havanese" });
```

## findAnd\*

A volte serve **trovare e contemporaneamente aggiornare/eliminare/sostituire** un documento.
Esistono tre comandi: `findOneAndUpdate`, `findOneAndReplace` e `findOneAndDelete`.
Funzionano come `updateOne`/`replaceOne`/`deleteOne` ma **ritornano** il documento modificato/eliminato.

## bulkWrite

Quando devi eseguire **molte query in una volta sola** (serie di insert, update, delete), puoi usare `bulkWrite`.
`bulkWrite` accetta un array di operazioni che verranno eseguite in ordine.
Nel CLI di Mongo non è molto comodo, ma nel codice è utilissimo: invece di fare chiamate seriali lente, mandi tutto insieme.

[update]: https://docs.mongodb.com/manual/reference/operator/update/#id1
