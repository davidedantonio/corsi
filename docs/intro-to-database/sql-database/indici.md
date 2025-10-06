---
sidebar_position: 6
---

# Indici

Gli **indici** sono un modo per velocizzare le query.  
Sono simili agli indici di un libro: invece di scorrere tutte le pagine per trovare un argomento, puoi andare direttamente alla pagina giusta.  
Gli indici sono particolarmente utili per le tabelle grandi con milioni di righe.

Prendiamo questa query:

```sql
SELECT comment_id, user_id, time, LEFT(comment, 20)
FROM comments
WHERE board_id = 39
ORDER BY time DESC
LIMIT 40;
```

Questa è una query piuttosto comune se stiamo realizzando un _message board_: recuperare tutti i commenti per una specifica bacheca.  
Vediamo cosa fa PostgreSQL “dietro le quinte” aggiungendo `EXPLAIN` davanti:

```sql
EXPLAIN SELECT comment_id, user_id, time, LEFT(comment, 20)
FROM comments
WHERE board_id = 39
ORDER BY time DESC
LIMIT 40;
```

💔 Brutte notizie: `Seq Scan on comments`.  
Significa che sta scansionando tutta la tabella dei commenti per trovare i risultati.  
Per evitare questo serve un **indice**. Creiamo un indice su `board_id` per velocizzare la ricerca:

```sql
CREATE INDEX ON comments (board_id);

EXPLAIN SELECT comment_id, user_id, time, LEFT(comment, 20)
FROM comments
WHERE board_id = 39
ORDER BY time DESC
LIMIT 40; -- esegui di nuovo
```

Se controlli di nuovo con `EXPLAIN`, vedrai che ora usa un `Bitmap Heap Scan` invece di un `Seq Scan`. Molto meglio! 🚀

---

Facciamone un altro esempio: tutti gli utenti dovrebbero avere un **username univoco**.  
Garantiamo questo con un indice univoco:

```sql
CREATE UNIQUE INDEX username_idx ON users (username);

INSERT INTO users (username, email, full_name, created_on)
VALUES ('aaizikovj', 'lol@example.com', 'Davide D''Antonio', NOW()); -- questo fallirà
```

- `username_idx` è solo un nome per l’indice. Puoi chiamarlo come preferisci.
- Se provi a inserire uno username già presente, la query fallirà.
- Un effetto positivo: questo campo ora è indicizzato e potrai cercarlo più velocemente.

PostgreSQL ha [molti altri tipi di indici][indexes]. Vale la pena esplorarli!

[indexes]: https://www.postgresql.org/docs/13.0/indexes.html
