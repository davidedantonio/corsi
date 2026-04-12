---
sidebar_position: 6
---

# Indici

Gli **indici** sono un modo per velocizzare le query.  
Sono simili agli indici di un libro: invece di scorrere tutte le pagine per trovare un argomento, puoi andare direttamente alla pagina giusta.  
Gli indici sono particolarmente utili per le tabelle grandi con milioni di righe.

Prendiamo una query tipica del nostro e-commerce: voglio vedere tutti gli ordini di un cliente specifico.

```sql
SELECT order_id, status, channel, created_on
FROM orders
WHERE customer_id = 42
ORDER BY created_on DESC;
```

Questa è una query molto comune — ogni volta che un cliente apre la sua area personale, probabilmente viene eseguita qualcosa di simile. Vediamo cosa fa PostgreSQL dietro le quinte aggiungendo `EXPLAIN`:

```sql
EXPLAIN SELECT order_id, status, channel, created_on
FROM orders
WHERE customer_id = 42
ORDER BY created_on DESC;
```

💔 Brutte notizie: `Seq Scan on orders`.  
Significa che sta scansionando **tutta** la tabella degli ordini per trovare quelli di quel cliente.  
Con 10.000 ordini non è un dramma, ma con milioni di righe diventa un problema serio.

---

## Creare un indice

Creiamo un indice su `customer_id` per velocizzare la ricerca:

```sql
CREATE INDEX ON orders (customer_id);

EXPLAIN SELECT order_id, status, channel, created_on
FROM orders
WHERE customer_id = 42
ORDER BY created_on DESC;
```

Se controlli di nuovo con `EXPLAIN`, vedrai che ora usa un `Index Scan` invece di un `Seq Scan`. Molto meglio! 🚀

Lo stesso vale per la tabella `order_items`: spesso la interroghiamo filtrando per `order_id`:

```sql
CREATE INDEX ON order_items (order_id);
```

---

## Indici composti

Se usi frequentemente due condizioni insieme, puoi creare un **indice composto**.  
Ad esempio, se filtri spesso gli ordini per `customer_id` e `status` insieme:

```sql
CREATE INDEX ON orders (customer_id, status);

EXPLAIN SELECT order_id, created_on
FROM orders
WHERE customer_id = 42 AND status = 'completed';
```

L'indice composto performa meglio di due indici separati quando le due condizioni vengono usate insieme nella stessa query.

---

## Indici univoci

Frequentemente vuoi imporre l'**unicità** su un campo.  
Un buon esempio è l'email dei clienti: nessuno dovrebbe registrarsi due volte con la stessa email.

```sql
CREATE UNIQUE INDEX email_idx ON customers (email);

-- Questo fallirà se l'email esiste già
INSERT INTO customers (full_name, email, city, region, segment)
VALUES ('Test Utente', 'davide@example.com', 'Roma', 'Lazio', 'retail');
```

- `email_idx` è solo un nome per l'indice. Puoi chiamarlo come preferisci.
- Se provi a inserire un'email già presente, la query fallirà con un errore di chiave duplicata.
- Come effetto positivo, l'email ora è indicizzata e le query di ricerca per email saranno molto più veloci.

PostgreSQL ha [molti altri tipi di indici][indexes]. Vale la pena esplorarli!

[indexes]: https://www.postgresql.org/docs/13.0/indexes.html
