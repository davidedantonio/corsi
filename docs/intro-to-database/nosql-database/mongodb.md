---
sidebar_position: 2
---

# MongoDB

[MongoDB][jetbrains] è uno dei database più popolari al mondo oggi.  
Negli ultimi dieci anni si è affermato come un affidabile custode di carichi di lavoro di database sia piccoli che grandi.  
Penso che sia abbastanza poco controverso dire che è uno dei database NoSQL più popolari al mondo, se non **il più popolare**.

Se guardi alla storia di MongoDB, troverai alcuni momenti difficili.  
C’è stato un periodo in cui finì per perdere molti dati e molte persone lo scartarono dopo quell’episodio.  
Potresti imbatterti in storie o persone arrabbiate se cerchi “MongoDB” su Google.  
Ma è passato molto tempo e da allora hanno avuto un record molto solido, quindi non mi preoccuperei troppo.

---

## Avviamo MongoDB

Immergiamoci. Se stai usando Docker come me, esegui i seguenti comandi:

```bash
docker run --name corso-mongo -dit -p 27017:27017 --rm mongo:8.2.1
docker exec -it corso-mongo mongo
```

Questo eseguirà un nuovo container MongoDB alla versione 4.4.1 e lo chiamerà `test-mongo` così possiamo farvi riferimento per nome.  
Poi, con il secondo comando, eseguiamo `mongo` **dentro** il container `test-mongo` per poter lavorare al suo interno.  
L’immagine `mongo` (che è quella ufficiale fornita da MongoDB Inc.) esegue MongoDB automaticamente, quindi non dobbiamo fare altro.  
Dobbiamo solo connetterci all’interno del container ed eseguire i nostri comandi da lì.  
A questo punto dovresti ritrovarti nella shell interattiva di MongoDB.  
Cominciamo a familiarizzare con MongoDB!

---

## Installare il client MongoDB Compass

Se preferisci un’interfaccia grafica, puoi scaricare [MongoDB Compass](https://www.mongodb.com/products/compass).  
È un’applicazione desktop gratuita che ti consente di connetterti a un’istanza MongoDB e interagire con essa tramite un’interfaccia grafica.  
Puoi eseguire query, visualizzare i dati e persino modificare i documenti.
È un ottimo modo per esplorare i tuoi dati e vedere cosa c’è dentro.

## Database e Collezioni

Come altri database, MongoDB ha il concetto di **database** al suo interno.  
Un database è un contenitore generale di gruppi più piccoli di dati chiamati **collezioni**.

Sta a te decidere come strutturare database e collezioni, ma in generale conviene raggruppare elementi simili.  
Ad esempio:

- Se hai una collezione con informazioni sugli utenti e una con le loro notifiche, potresti tenerle nello stesso database ma in collezioni diverse.
- Se hai una collezione di utenti e una di articoli in vendita nel tuo store, potresti preferire tenerle in database separati.

Non ci sono regole rigide: organizza come ti sembra più logico.  
(Un piccolo suggerimento, opzionale: se hai una collezione grande e trafficata e una molto piccola e poco usata, può essere più semplice scalarle separatamente se le tieni in database distinti.)

Le **collezioni** sono gruppi di documenti (oggetti).  
In genere, ogni documento rappresenta una singola entità.  
Se hai una collezione `users`, ogni documento rappresenta un utente.

👉 Evita di mescolare cose diverse nella stessa collezione (es. utenti e prodotti insieme).  
Usa più collezioni.

Le collezioni hanno anche funzionalità interessanti:

- **Capped collections** → puoi dire “tieni solo 100 documenti e rimuovi il più vecchio quando arriva il 101°”.
- **Indici** → puoi aggiungerli per ottimizzare le query (lo vedremo più avanti).

---

## Inseriamo documenti

Nella console di MongoDB esegui:

```javascript
show dbs
```

per vedere tutti i database esistenti.  
Per iniziare a usarne uno:

```javascript
use adoption
```

Ora se digiti:

```javascript
db;
```

vedrai che stai usando il database `adoption`.

Creiamo una collezione chiamata `pets` e inseriamo un documento:

```javascript
db.pets.insertOne({ name: "Luna", type: "dog", breed: "Havanese", age: 8 });
```

Spieghiamo:

- `db` → indica il database corrente scelto con `use adoption`.
- `pets` → è il nome della collezione. Se non esiste viene creata automaticamente.
- `insertOne` → funzione che inserisce un singolo documento.
- `{name: "Luna", type: "dog", breed: "Havanese", age: 8}` → è l’oggetto che stiamo salvando.

Puoi vedere tutti i metodi disponibili per l’inserimento con:

```javascript
db.pets.help();
```

Ora prova:

```javascript
db.pets.count();
```

Vedrai `1`, perché abbiamo un documento nella collezione.

Esegui:

```javascript
db.pets.findOne();
```

e vedrai il documento di Luna.

---

## Inseriamo molti documenti

Ora inseriamo 10.000 documenti casuali:

```javascript
db.pets.insertMany(
  Array.from({ length: 10000 }).map((_, index) => ({
    name: [
      "Luna",
      "Fido",
      "Fluffy",
      "Carina",
      "Spot",
      "Beethoven",
      "Baxter",
      "Dug",
      "Zero",
      "Santa's Little Helper",
      "Snoopy",
    ][index % 9],
    type: ["dog", "cat", "bird", "reptile"][index % 4],
    age: (index % 18) + 1,
    breed: [
      "Havanese",
      "Bichon Frise",
      "Beagle",
      "Cockatoo",
      "African Gray",
      "Tabby",
      "Iguana",
    ][index % 7],
    index: index,
  })),
);
```

Questo crea 10.000 documenti pet con dati generati in modo prevedibile usando l’operatore modulo.

Ora esegui di nuovo:

```javascript
db.pets.countDocuments();
```

Dovresti vedere `10000`.

Perfetto! Ora possiamo iniziare a fare query sui nostri dati.

---

[jetbrains]: https://www.jetbrains.com/lp/devecosystem-2020/databases/
[bson]: https://docs.mongodb.com/manual/reference/bson-types/
