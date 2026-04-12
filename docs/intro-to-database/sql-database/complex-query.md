---
sidebar_position: 4
---

# Effettuare query complesse

Entriamo nelle query più complesse. Il nostro database e-commerce ha cinque tabelle collegate tra loro — ed è qui che i database relazionali mostrano tutta la loro potenza, permettendo di rispondere a domande analitiche reali come "qual è il fatturato per categoria?" o "quali sono i clienti che spendono di più?".

---

## Riepilogo delle tabelle

Ricordiamo rapidamente le tabelle che abbiamo a disposizione e come si collegano:

```
customers → orders → order_items → products → categories
```

Ogni ordine appartiene a un cliente, ogni riga ordine appartiene a un ordine e punta a un prodotto, ogni prodotto appartiene a una categoria.

---

## JOIN

Supponiamo di voler vedere gli ordini recenti con il nome del cliente:

```sql
SELECT
  o.order_id,
  cu.full_name,
  cu.city,
  o.status,
  o.channel,
  o.created_on
FROM orders o
INNER JOIN customers cu ON o.customer_id = cu.customer_id
WHERE o.created_on >= '2024-01-01'
ORDER BY o.created_on DESC
LIMIT 20;
```

La chiave qui è `INNER JOIN`: unisce i record di due tabelle dove i valori corrispondono (specificati in `ON`). Se un ordine ha `customer_id = NULL` (cliente cancellato), quel record viene escluso.

Ci sono diversi tipi di JOIN:

![Diagramma di JOIN tra tabelle](/img/SQL_joins.png)

- `INNER JOIN` → solo righe con corrispondenza in entrambe le tabelle.
- `LEFT JOIN` → tutte le righe della tabella sinistra, anche senza corrispondenza a destra.
- `RIGHT JOIN` → tutte le righe della tabella destra.
- `FULL OUTER JOIN` → tutte le righe da entrambe le tabelle.

---

## JOIN su più tabelle

Vediamo il dettaglio completo di un ordine: cliente, prodotti acquistati, categoria e importo:

```sql
SELECT
  o.order_id,
  cu.full_name,
  p.name AS prodotto,
  c.name AS categoria,
  oi.quantity,
  oi.unit_price,
  (oi.quantity * oi.unit_price) AS totale_riga
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.order_id
INNER JOIN customers cu ON o.customer_id = cu.customer_id
INNER JOIN products p ON oi.product_id = p.product_id
INNER JOIN categories c ON p.category_id = c.category_id
WHERE o.order_id = 42;
```

Nota l'uso degli **alias** (`o`, `cu`, `p`, `c`, `oi`) per abbreviare i nomi delle tabelle e rendere la query più leggibile.

---

## Subquery (Sottoquery)

Vogliamo trovare tutti gli ordini di un cliente specifico cercandolo per nome, non per ID:

```sql
SELECT order_id, status, channel, created_on
FROM orders
WHERE customer_id = (
  SELECT customer_id FROM customers WHERE email = 'luca.rossi0@example.com'
);
```

- La subquery tra parentesi `()` restituisce il `customer_id`.
- Quel valore viene usato immediatamente nella query esterna.
- Assicurati che la subquery ritorni **solo una riga** (altrimenti errore).

---

## GROUP BY e aggregazioni

Qui inizia la parte più interessante per l'analisi dei dati.

### Fatturato per categoria

```sql
SELECT
  c.name AS categoria,
  COUNT(DISTINCT o.order_id) AS num_ordini,
  SUM(oi.quantity * oi.unit_price) AS fatturato
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.order_id
INNER JOIN products p ON oi.product_id = p.product_id
INNER JOIN categories c ON p.category_id = c.category_id
WHERE o.status = 'completed'
GROUP BY c.name
ORDER BY fatturato DESC;
```

- `GROUP BY` raggruppa i risultati per `categoria`.
- `SUM(oi.quantity * oi.unit_price)` calcola il fatturato per ogni gruppo.
- `COUNT(DISTINCT o.order_id)` conta gli ordini unici (senza duplicati dovuti alle righe).

### Numero ordini e fatturato per regione

```sql
SELECT
  cu.region,
  COUNT(DISTINCT o.order_id) AS num_ordini,
  SUM(oi.quantity * oi.unit_price) AS fatturato
FROM orders o
INNER JOIN customers cu ON o.customer_id = cu.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.status = 'completed'
GROUP BY cu.region
ORDER BY fatturato DESC;
```

### Fatturato mensile 2024

```sql
SELECT
  DATE_TRUNC('month', o.created_on) AS mese,
  COUNT(DISTINCT o.order_id) AS num_ordini,
  SUM(oi.quantity * oi.unit_price) AS fatturato
FROM orders o
INNER JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.status = 'completed'
  AND o.created_on >= '2024-01-01'
  AND o.created_on < '2025-01-01'
GROUP BY mese
ORDER BY mese;
```

`DATE_TRUNC('month', ...)` tronca un timestamp al primo giorno del mese — è il modo standard in PostgreSQL per raggruppare dati per mese, trimestre o anno.

---

## HAVING

`HAVING` è come un `WHERE` ma applicato **dopo** il `GROUP BY` — ti permette di filtrare sui risultati aggregati.

Vogliamo solo le categorie con un fatturato superiore a 50.000 euro:

```sql
SELECT
  c.name AS categoria,
  SUM(oi.quantity * oi.unit_price) AS fatturato
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.order_id
INNER JOIN products p ON oi.product_id = p.product_id
INNER JOIN categories c ON p.category_id = c.category_id
WHERE o.status = 'completed'
GROUP BY c.name
HAVING SUM(oi.quantity * oi.unit_price) > 50000
ORDER BY fatturato DESC;
```

⚠️ Non puoi usare `WHERE fatturato > 50000` perché `fatturato` è un alias calcolato dopo il `GROUP BY`. `HAVING` esiste proprio per questo.

---

## LEFT JOIN: includere anche i casi senza corrispondenza

Con `INNER JOIN` i clienti che non hanno mai effettuato un ordine non compaiono. Per includerli usiamo `LEFT JOIN`:

```sql
SELECT
  cu.full_name,
  cu.segment,
  COUNT(o.order_id) AS num_ordini
FROM customers cu
LEFT JOIN orders o ON cu.customer_id = o.customer_id
GROUP BY cu.customer_id, cu.full_name, cu.segment
ORDER BY num_ordini ASC
LIMIT 20;
```

I clienti senza ordini appariranno con `num_ordini = 0`.

---

## CASE WHEN: logica condizionale nelle query

`CASE WHEN` permette di inserire logica condizionale direttamente in SQL. È l'equivalente di un `if/else`.

Confronto fatturato 2023 vs 2024 per canale di vendita:

```sql
SELECT
  channel,
  SUM(CASE WHEN EXTRACT(YEAR FROM o.created_on) = 2023
           THEN oi.quantity * oi.unit_price END) AS fatturato_2023,
  SUM(CASE WHEN EXTRACT(YEAR FROM o.created_on) = 2024
           THEN oi.quantity * oi.unit_price END) AS fatturato_2024
FROM orders o
INNER JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.status = 'completed'
GROUP BY channel
ORDER BY fatturato_2024 DESC;
```

Tasso di cancellazione per segmento cliente:

```sql
SELECT
  cu.segment,
  COUNT(*) AS totale_ordini,
  SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancellati,
  ROUND(
    100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*),
    2
  ) AS tasso_cancellazione_pct
FROM orders o
INNER JOIN customers cu ON o.customer_id = cu.customer_id
GROUP BY cu.segment
ORDER BY tasso_cancellazione_pct DESC;
```

---

✅ Conoscere bene le tue tabelle, le chiavi esterne e i tipi di JOIN è fondamentale per scrivere query SQL robuste ed efficienti. Nella prossima sezione vedremo come velocizzare le query con gli **indici**.
