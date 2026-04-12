---
sidebar_position: 3
---

# Effettuare query SQL di base

Scoprirai che SQL ha una grande profondità. Ci sono persone il cui lavoro consiste principalmente nello scrivere SQL. Ma qui iniziamo con le basi.

[Fai clic qui][sql] per ottenere il file SQL con tutte le tabelle e i dati di esempio del nostro e-commerce. Questa query eliminerà tutte le tabelle esistenti e le ricreerà da zero con circa **10.000 ordini** già inseriti. Puoi rilanciarla in qualsiasi momento per avere una copia pulita. Puoi copiare e incollare tutto nel terminale connesso a PostgreSQL (`psql`) e funzionerà.

## SELECT

Iniziamo con **SELECT**. Serve per cercare dati in un database SQL.

```sql
SELECT * FROM customers;
```

Questo recupera tutti i campi (il simbolo `*` è un _wildcard_) dalla tabella `customers`. Vedrai tutti i clienti registrati nel database.

## LIMIT

Selezioniamo meno record:

```sql
SELECT * FROM customers LIMIT 10;
```

Limita il risultato a 10 record.

## Projection

Selezioniamo solo alcune colonne, non tutte:

```sql
SELECT full_name, city, segment FROM customers LIMIT 15;
```

In generale è una buona pratica selezionare solo le colonne di cui hai bisogno. Alcune tabelle possono avere anche 50+ colonne.

## WHERE

Filtriamo record specifici:

```sql
-- Un cliente specifico
SELECT full_name, email, customer_id FROM customers WHERE customer_id = 10;

-- Solo i clienti VIP
SELECT full_name, city, region FROM customers WHERE segment = 'vip';

-- Prodotti che costano meno di 50 euro
SELECT name, unit_price FROM products WHERE unit_price < 50;
```

## AND e operazioni con date

Supponiamo di voler vedere gli ordini **completati** effettuati **nel 2024**:

```sql
SELECT order_id, customer_id, channel, created_on
FROM orders
WHERE status = 'completed' AND created_on >= '2024-01-01'
LIMIT 10;
```

- Usiamo `AND` per combinare più condizioni.
- Confrontiamo `created_on` (un timestamp) con una data fissa.

Possiamo anche usare intervalli dinamici con `NOW()`:

```sql
SELECT order_id, customer_id, created_on
FROM orders
WHERE status = 'pending' AND created_on < NOW() - interval '30 days'
LIMIT 10;
```

Questa query trova gli ordini in stato `pending` da più di 30 giorni — utile per identificare ordini bloccati.

## ORDER BY

Per trovare i prodotti più costosi:

```sql
SELECT name, unit_price FROM products ORDER BY unit_price DESC LIMIT 10;
```

Per i meno costosi aggiungi `ASC` (che è anche il default):

```sql
SELECT name, unit_price FROM products ORDER BY unit_price ASC LIMIT 10;
```

## COUNT(\*)

Quanti clienti abbiamo in totale?

```sql
SELECT COUNT(*) FROM customers;
```

Quanti ordini sono stati completati?

```sql
SELECT COUNT(*) FROM orders WHERE status = 'completed';
```

Quanti clienti hanno specificato la propria città?

```sql
SELECT COUNT(city) FROM customers;
```

`COUNT(city)` conta solo le righe dove `city` non è `NULL`, a differenza di `COUNT(*)` che conta tutte le righe.

## UPDATE con RETURNING

Un cliente ha cambiato città — aggiorniamo il record:

```sql
UPDATE customers
SET city = 'Roma', region = 'Lazio'
WHERE customer_id = 1
RETURNING *;
```

- Puoi aggiornare più campi separandoli con la virgola.
- `RETURNING *` è opzionale ma utile per vedere subito i dati aggiornati.

Aggiorniamo lo status di un ordine:

```sql
UPDATE orders
SET status = 'completed'
WHERE order_id = 5
RETURNING order_id, status;
```

## DELETE

Per cancellare un record:

```sql
DELETE FROM customers WHERE customer_id = 500;
```

⚠️ Grazie al vincolo `ON DELETE SET NULL` che abbiamo definito, gli ordini di quel cliente non verranno cancellati — il loro `customer_id` sarà semplicemente impostato a `NULL`.

[sql]: https://raw.githubusercontent.com/davidedantonio/intro-to-databases/refs/heads/main/postgres/sample-ecommerce.sql
