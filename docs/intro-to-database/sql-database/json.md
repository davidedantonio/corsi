---
sidebar_position: 5
---

# JSON in PostgreSQL

## Attenzione: JSON vs JSONB

Questo corso ha scelto erroneamente di usare il tipo di dato `JSON` quando avrebbe dovuto usare `JSONB`.  
Tutto ciò che viene spiegato funzionerà comunque con entrambi, ma quando crei un tuo database dovresti quasi sempre (diciamo pure sempre) scegliere
**JSONB**, perché memorizza i dati in un formato più ottimizzato e più adatto alle query, mentre `JSON` è di fatto un semplice campo di testo.

Quindi sentiti libero di usare `JSONB` ovunque vedi scritto `JSON` sapendo però che nei tuoi progetti reali userai `JSONB`.  

[Per ulteriori informazioni leggi questo articolo sul blog][jsonb].

---

## JSONB in un e-commerce

A volte hai dati che non hanno uno schema ben definito.  
Nel nostro e-commerce un caso classico sono le **specifiche tecniche dei prodotti**: un notebook ha RAM, CPU e schermo; una scarpa ha taglia e materiale; un alimento ha ingredienti e valori nutrizionali. Creare una colonna per ogni possibile attributo sarebbe impraticabile.

Questa è una situazione in cui i database documentali come MongoDB funzionano molto bene: la loro natura **schemaless** è perfetta in questi casi.

Tuttavia PostgreSQL ha una superpotenza: il tipo di dato **JSONB**.  
Ti consente di inserire oggetti JSON in una colonna e poi interrogarli tramite SQL — il meglio di entrambi i mondi.

Aggiungiamo una tabella per le specifiche tecniche dei prodotti:

```sql
CREATE TABLE product_specs (
  spec_id    INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
  specs      JSONB NOT NULL
);

INSERT INTO product_specs (product_id, specs) VALUES
  (1,  '{ "display": "6.7 pollici AMOLED", "ram": "12GB", "storage": "256GB", "battery": "5000mAh" }'),
  (2,  '{ "display": "15.6 pollici IPS", "ram": "16GB", "storage": "512GB SSD", "weight": "1.4kg", "os": "Windows 11" }'),
  (3,  '{ "type": "over-ear", "anc": true, "battery": "30h", "bluetooth": "5.2" }'),
  (15, '{ "capacity": "5L", "wattage": 1500, "programs": ["aria", "grill", "rotisserie"], "dishwasher_safe": true }'),
  (17, '{ "type": "automatica", "bar": 15, "capacity": "1.8L", "compatible": ["espresso", "lungo", "cappuccino"] }');
```

- Il tipo **JSONB** ci permette di salvare strutture dati flessibili interrogabili in seguito.
- PostgreSQL verifica che il JSON sia ben formato prima di inserirlo.
- Puoi annidare quanto vuoi i dati: qualsiasi JSON valido è accettato.

---

## Fare query su JSONB

In SQL usiamo due operatori: `->` e `->>`.

- `->` restituisce il valore come **JSON** (oggetto, array, stringa — sempre JSON).
- `->>` restituisce il valore come **testo semplice**.

### Trovare tutti i tipi di schermo

```sql
SELECT product_id, specs -> 'display' AS display
FROM product_specs
WHERE specs -> 'display' IS NOT NULL;
```

### Filtrare prodotti con ANC attivo

```sql
SELECT product_id, specs ->> 'type' AS tipo
FROM product_specs
WHERE specs ->> 'anc' = 'true';
```

⚠️ Nota: usiamo `->>` per ottenere il valore come testo, così possiamo confrontarlo con la stringa `'true'`.

### Estrarre dati con JOIN al catalogo prodotti

```sql
SELECT
  p.name AS prodotto,
  ps.specs ->> 'ram' AS ram,
  ps.specs ->> 'storage' AS storage
FROM product_specs ps
INNER JOIN products p ON ps.product_id = p.product_id
WHERE ps.specs ->> 'ram' IS NOT NULL;
```

### Interrogare array annidati

Per verificare se un prodotto supporta una certa modalità (es. `espresso`), puoi usare l'operatore `@>` (contiene):

```sql
SELECT p.name
FROM product_specs ps
INNER JOIN products p ON ps.product_id = p.product_id
WHERE ps.specs @> '{"compatible": ["espresso"]}';
```

### SELECT DISTINCT sui valori JSON

Per ottenere tutti i tipi di prodotto distinti:

```sql
SELECT DISTINCT content ->> 'type' FROM product_specs;
```

Se usi `->` invece di `->>` otterrai un errore perché PostgreSQL non sa confrontare tipi JSON grezzi — `->>` restituisce testo, che è confrontabile.

---

## Quando usare JSONB vs tabelle separate

JSONB è potente, ma non è la soluzione a tutto. Usalo quando:

- Gli attributi variano molto da prodotto a prodotto (come le specifiche tecniche).
- Non hai bisogno di fare JOIN o aggregazioni su quei campi.
- Lo schema è soggetto a cambiamenti frequenti.

Se invece sai già che un campo verrà usato spesso nelle query (es. `status`, `price`, `category`), è meglio avere una colonna dedicata — è più veloce da interrogare e più facile da indicizzare.

[jsonb]: https://www.citusdata.com/blog/2016/07/14/choosing-nosql-hstore-json-jsonb/
