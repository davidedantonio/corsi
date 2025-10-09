---
sidebar_position: 5
---

# JSON in PostgreSQL

## Attenzione: JSON vs JSONB

Questo corso ha scelto erroneamente di usare il tipo di dato `JSON` quando avrebbe dovuto usare `JSONB`.  
Tutto ciò che viene spiegato funzionerà comunque con entrambi, ma quando crei un tuo database dovresti quasi sempre (diciamo pure sempre) scegliere
**JSONB**, perché memorizza i dati in un formato più ottimizzato e più adatto alle query, mentre `JSON` è di fatto un semplice campo di testo.

Quindi sentiti libero di usare `JSONB` ovunque vedi scritto `JSON` oppure puoi continuare a usare `JSON` sapendo però che nei tuoi progetti reali userai `JSONB`.  
In questo documento ho già corretto i riferimenti da JSON a JSONB, ma nei video sentirai ancora dire JSON.

[Per ulteriori informazioni leggi questo articolo sul blog][jsonb].

---

## JSON

A volte hai dati che non hanno uno schema ben definito.  
Se provassi a inserirli in una tabella tradizionale di PostgreSQL, finiresti per avere nomi di campo molto generici da interpretare via codice, oppure dovresti creare molte tabelle diverse per rappresentare schemi differenti.

Questa è una situazione in cui i database documentali come MongoDB funzionano molto bene: la loro natura **schemaless** è perfetta in questi casi.

Tuttavia PostgreSQL ha una superpotenza qui: il tipo di dato **JSONB**.  
Ti consente di inserire oggetti JSONB in una colonna e poi interrogarli tramite SQL.

Esempio: vogliamo aggiungere una funzione al nostro _message board_ che consenta agli utenti di inserire contenuti ricchi (poll, immagini, video).  
In futuro potresti voler supportare anche tweet, documenti e altri tipi di embed che ancora non immaginiamo.  
Con un normale schema relazionale diventerebbe complicato e poco flessibile; con **JSONB** invece possiamo farlo in modo semplice.

```sql
DROP TABLE IF EXISTS rich_content;

CREATE TABLE rich_content (
  content_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  comment_id INT REFERENCES comments(comment_id) ON DELETE CASCADE,
  content JSONB NOT NULL
);

INSERT INTO rich_content
  (comment_id, content)
VALUES
  (63, '{ "type": "poll", "question": "What is your favorite color?", "options": ["blue", "red", "green", "yellow"] }'),
  (358, '{ "type": "video", "url": "https://youtu.be/dQw4w9WgXcQ", "dimensions": { "height": 1080, "width": 1920 }}'),
  (358, '{ "type": "poll", "question": "Is this your favorite video?", "options": ["yes", "no", "oh you"] }');
```

- Il tipo **JSONB** è la vera star: ci permette di salvare oggetti JSON interrogabili in seguito.
- PostgreSQL verifica che il JSON sia ben formato prima di inserirlo.
- Puoi annidare quanto vuoi i dati, qualsiasi JSON valido è accettato.

---

## Fare query su JSONB

In SQL usiamo due operatori: `->` e `->>`.

- `->` restituisce il valore come **JSON** (oggetto, array, stringa — sempre JSON).
- `->>` restituisce il valore come **testo semplice**.

### Trovare tutti i tipi di contenuto

```sql
SELECT content -> 'type' FROM rich_content;
```

Esempio di risultato:

```
"poll"
"video"
"poll"
"image"
"image"
```

Per rimuovere i duplicati possiamo usare **SELECT DISTINCT**:

```sql
SELECT DISTINCT content -> 'type' FROM rich_content;
```

❌ Questo darà errore: PostgreSQL non sa come confrontare tipi JSON.  
Occorre forzare a testo:

```sql
SELECT DISTINCT CAST(content -> 'type' AS TEXT) FROM rich_content;
```

Oppure molto più semplice, usare `->>`:

```sql
SELECT DISTINCT content ->> 'type' FROM rich_content;
```

### Filtrare solo i poll

```sql
SELECT content ->> 'type' AS content_type, comment_id
FROM rich_content
WHERE content ->> 'type' = 'poll';
```

⚠️ Nota: non puoi usare `content_type` nella clausola WHERE perché viene calcolata dopo.

### Estrarre dati annidati (dimensioni)

```sql
SELECT
  content -> 'dimensions' ->> 'height' AS height,
  content -> 'dimensions' ->> 'width' AS width,
  comment_id
FROM
  rich_content;
```

Per escludere i record senza dimensioni:

```sql
SELECT
  content -> 'dimensions' ->> 'height' AS height,
  content -> 'dimensions' ->> 'width' AS width,
  comment_id
FROM
  rich_content
WHERE
  content -> 'dimensions' IS NOT NULL;
```

[jsonb]: https://www.citusdata.com/blog/2016/07/14/choosing-nosql-hstore-json-jsonb/
