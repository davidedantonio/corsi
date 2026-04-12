---
sidebar_position: 6
---

# Aggregazione

MongoDB ha una funzionalità divertente chiamata aggregazione. Ci sono due modi per farlo, pipeline di aggregazione e map-reduce.
Map-reduce è esattamente quello che ti aspetteresti se vieni da un background di programmazione funzionale: fornisci a MongoDB una
funzione map che eseguirà su ogni elemento nell'array e poi una funzione reduce per aggregare la tua collezione in un insieme più piccolo di dati.

MongoDB ha anche rilasciato una funzionalità più recente di pipeline di aggregazione che tendono a performare meglio e possono
anche essere più facili da mantenere. Con queste fornisci un oggetto di configurazione alla pipeline di `aggregation`.

Cosa succederebbe se volessimo sapere quanti cuccioli, cani adulti e cani anziani abbiamo nella nostra collezione di animali domestici?
Proviamo proprio questo:

```javascript
db.pets.aggregate([
  {
    $bucket: {
      groupBy: "$age",
      boundaries: [0, 3, 9, 15],
      default: "very senior",
      output: {
        count: { $sum: 1 },
      },
    },
  },
]);
```

- Con le pipeline di aggregazione, fornisci una serie di passaggi da fare. In questo caso abbiamo solo un passaggio, raggruppare gli animali domestici in 0-2 anni, 3-8 anni, 9-15 anni e "very senior" (che è il bucket predefinito).
- Con l'output stai definendo cosa vuoi passare al passaggio successivo. In questo caso vogliamo solo sommarli aggiungendo 1 al conteggio ogni volta che vediamo un animale domestico che corrisponde a un bucket.

Questi sono tutti gli animali domestici. Vogliamo solo i cani. Aggiungiamo un altro stadio.

```javascript
db.pets.aggregate([
  {
    $match: {
      type: "dog",
    },
  },
  {
    $bucket: {
      groupBy: "$age",
      boundaries: [0, 3, 9, 15],
      default: "very senior",
      output: {
        count: { $sum: 1 },
      },
    },
  },
]);
```

Usando lo stadio `$match` dell'aggregazione, possiamo escludere ogni animale domestico che non è un cane.

Ultimo esempio, cosa succederebbe se volessimo ordinare i risultati per quale gruppo ha più animali domestici?

```javascript
db.pets.aggregate([
  {
    $match: {
      type: "dog",
    },
  },
  {
    $bucket: {
      groupBy: "$age",
      boundaries: [0, 3, 9, 15],
      default: "very senior",
      output: {
        count: { $sum: 1 },
      },
    },
  },
  {
    $sort: {
      count: -1,
    },
  },
]);
```

Come puoi vedere, aggiungi semplicemente più stadi all'aggregazione fino a quando raccogli le informazioni che
stai cercando. Ci sono molte più cose che puoi fare, quindi [ecco un link a tutti gli stadi di aggregazione esistenti][stages].

Questa è decisamente una delle parti più divertenti di MongoDB. Usavamo le funzionalità di aggregazione di MongoDB
per catturare i truffatori nella nostra app di annunci classificati!

[stages]: https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/
