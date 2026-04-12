---
sidebar_position: 2
---

# MongoDB

[MongoDB][jetbrains] è uno dei database più popolari al mondo oggi.  
Negli ultimi dieci anni si è affermato come un affidabile custode di carichi di lavoro di database sia piccoli che grandi.  
Penso che sia abbastanza poco controverso dire che è uno dei database NoSQL più popolari al mondo, se non **il più popolare**.

Se guardi alla storia di MongoDB, troverai alcuni momenti difficili.  
C'è stato un periodo in cui finì per perdere molti dati e molte persone lo scartarono dopo quell'episodio.  
Potresti imbatterti in storie o persone arrabbiate se cerchi "MongoDB" su Google.  
Ma è passato molto tempo e da allora hanno avuto un record molto solido, quindi non mi preoccuperei troppo.

---

## Avviamo MongoDB

Immergiamoci. Se stai usando Docker come me, esegui i seguenti comandi:

```bash
docker run --name corso-mongo -dit -p 27017:27017 --rm mongo:8.2.1
docker exec -it corso-mongo mongosh
```

Il primo comando avvia un container MongoDB. Il secondo apre `mongosh` — la shell interattiva moderna di MongoDB — all'interno del container.  
A questo punto dovresti ritrovarti nel prompt di MongoDB. Cominciamo!

---

## Installare il client MongoDB Compass

Se preferisci un'interfaccia grafica, puoi scaricare [MongoDB Compass](https://www.mongodb.com/products/compass).  
È un'applicazione desktop gratuita che ti consente di connetterti a un'istanza MongoDB, eseguire query, visualizzare i dati e modificare i documenti.  
È un ottimo modo per esplorare i tuoi dati e vedere cosa c'è dentro.

---

## Database e Collezioni

Come altri database, MongoDB ha il concetto di **database** al suo interno.  
Un database è un contenitore di **collezioni**, e una collezione è un gruppo di **documenti**.

Nel nostro caso useremo un unico database chiamato `ecommerce` con una collezione principale: `orders`.

Ogni documento nella collezione `orders` rappresenta un **ordine completo**, con i dati del cliente e i prodotti acquistati **annidati direttamente dentro**:

```javascript
{
  order_id: "ORD-00001",
  customer: {
    name: "Mario Rossi",
    email: "mario.rossi@example.com",
    city: "Milano",
    region: "Lombardia",
    segment: "retail"
  },
  status: "completed",
  channel: "web",
  date: ISODate("2024-03-15T10:22:00"),
  items: [
    { product: "Smartphone XPro 12",      category: "Elettronica", qty: 1, price: 799.00 },
    { product: "Mouse wireless ErgoFlow", category: "Elettronica", qty: 2, price: 39.00  }
  ],
  total: 877.00
}
```

Confronta questa struttura con il database SQL che abbiamo costruito in precedenza: lì avevamo **5 tabelle separate** (`customers`, `categories`, `products`, `orders`, `order_items`) collegate da chiavi esterne. Qui abbiamo **un solo documento** che contiene tutto.

Questo è il vantaggio del modello documentale: i dati che vengono letti insieme vengono **salvati insieme**. Non serve nessun JOIN.

---

## Inseriamo documenti

Nella shell MongoDB esegui:

```javascript
show dbs
```

per vedere tutti i database esistenti. Poi:

```javascript
use ecommerce
```

MongoDB creerà il database `ecommerce` automaticamente al primo inserimento. Verifichiamo:

```javascript
db;
```

Creiamo la collezione `orders` inserendo il nostro primo ordine:

```javascript
db.orders.insertOne({
  order_id: "ORD-00001",
  customer: {
    name: "Mario Rossi",
    email: "mario.rossi@example.com",
    city: "Milano",
    region: "Lombardia",
    segment: "retail",
  },
  status: "completed",
  channel: "web",
  date: new Date("2024-03-15"),
  items: [
    {
      product: "Smartphone XPro 12",
      category: "Elettronica",
      qty: 1,
      price: 799.0,
    },
    {
      product: "Mouse wireless ErgoFlow",
      category: "Elettronica",
      qty: 2,
      price: 39.0,
    },
  ],
  total: 877.0,
});
```

- `db` → indica il database corrente.
- `orders` → è il nome della collezione. Se non esiste, viene creata automaticamente.
- `insertOne` → inserisce un singolo documento.

Verifichiamo:

```javascript
db.orders.countDocuments(); // → 1
db.orders.findOne(); // → il documento appena inserito
```

---

## Inseriamo molti documenti

Abbiamo due modi per caricare i 10.000 ordini di esempio.

### Opzione 1 — mongoimport

[Scarica il file JSON](https://raw.githubusercontent.com/davidedantonio/intro-to-databases/refs/heads/main/mongodb/ecommerce-mongo.json) con i 10.000 ordini e importalo con `mongoimport` direttamente da terminale:

```bash
mongoimport \
  --host localhost:27017 \
  --db ecommerce \
  --collection orders \
  --file ecommerce-mongo.json \
  --drop
```

- `--drop` elimina la collezione esistente prima di importare — utile per ricominciare da zero.
- Il formato **JSONL** (JSON Lines) ha un documento per riga, ed è il formato nativo di `mongoimport`.
- `mongoimport` è incluso nel pacchetto **MongoDB Database Tools** — se non ce l'hai, [scaricalo qui](https://www.mongodb.com/try/download/database-tools).

Verifica il risultato nella shell:

```javascript
db.orders.countDocuments(); // → 10000
```

### Opzione 2 — MongoDB Compass

Se preferisci un'interfaccia grafica, puoi usare MongoDB Compass. Apri Compass, connettiti al tuo database, vai alla collezione `orders` e usa l'opzione di importazione per caricare il file JSON.

---

[jetbrains]: https://www.jetbrains.com/lp/devecosystem-2020/databases/
