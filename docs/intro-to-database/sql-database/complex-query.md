---
sidebar_position: 4
---

# Effettuare query complesse

Entriamo in query più complesse.  
Per prima cosa ci serviranno due nuove tabelle: **comments** e **boards**.  
Stiamo costruendo la struttura dati per un semplice sistema di _message board_ che contiene utenti, commenti e bacheche.

La parte interessante è che ogni commento è scritto da un utente (quindi deve fare riferimento alla tabella `users`) ed è pubblicato in una bacheca (quindi deve riferirsi alla tabella `boards`).  
Questo è ciò che si chiama **dato relazionale**, ed è dove i database relazionali mostrano tutta la loro potenza.

---

## Foreign Keys (Chiavi esterne)

Ecco gli schemi per `users`, `boards` e `comments`:

```sql
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username VARCHAR (25) UNIQUE NOT NULL,
  email VARCHAR (50) UNIQUE NOT NULL,
  full_name VARCHAR (100) NOT NULL,
  last_login TIMESTAMP,
  created_on TIMESTAMP NOT NULL
);

CREATE TABLE boards (
  board_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  board_name VARCHAR (50) UNIQUE NOT NULL,
  board_description TEXT NOT NULL
);

CREATE TABLE comments (
  comment_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  board_id INT REFERENCES boards(board_id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  time TIMESTAMP
);
```

- Le prime due tabelle dovrebbero essere familiari. La novità qui è il tipo di dato **TEXT**, che è simile a `VARCHAR` ma senza un limite definito (praticamente illimitato).
- `user_id INT REFERENCES users(user_id)` definisce una **foreign key**: un campo che fa riferimento alla chiave primaria di un’altra tabella (`users` in questo caso).
- `ON DELETE CASCADE` dice a PostgreSQL di cancellare automaticamente i commenti dell’utente se l’utente viene eliminato.  
  Senza questa opzione (default: `NO ACTION`), non potresti cancellare l’utente finché i suoi commenti non vengono rimossi.  
  Altri comportamenti possibili: `ON DELETE SET NULL` per impostare `user_id` a NULL se l’utente viene cancellato.
- Stesso discorso per `board_id`, che fa riferimento alla tabella `boards`.

---

## JOIN

Immagina che un utente apra una bacheca e voglia vedere i commenti:

```sql
SELECT comment_id, user_id, LEFT(comment, 20) AS preview
FROM comments
WHERE board_id = 39;
```

- `LEFT(stringa, X)` restituisce i primi X caratteri della stringa (esiste anche `RIGHT` per gli ultimi X).
- `AS` rinomina la colonna risultante (qui rinominiamo l’output di `LEFT(comment, 20)` in `preview`).

Questo ritornerà dati tipo:

```
 comment_id | user_id |       preview
------------+---------+----------------------
         63 |     858 | Maecenas tristique,
        358 |     876 | Mauris enim leo, rho
        429 |     789 | Maecenas ut massa qu
...
```

Ma i tuoi utenti non vogliono vedere l’`user_id`; vogliono lo **username**.  
Quella informazione è nella tabella `users`.  
Come unire i dati?

```sql
SELECT
  comment_id,
  comments.user_id,
  users.username,
  time,
  LEFT(comment, 20) AS preview
FROM
  comments
INNER JOIN
  users
ON
  comments.user_id = users.user_id
WHERE
  board_id = 39;
```

✨ Magia!  
La chiave qui è `INNER JOIN`: unisce record di due tabelle dove i valori corrispondono (specificati in `ON`).

Ci sono diversi tipi di `JOIN`.
INNER è un buon punto di partenza: significa “trova dove gli `user_id` corrispondono”.
Se trovi un record in cui l’`user_id` esiste in una tabella ma non nell’altra, escludilo dai risultati.

Questa distinzione al momento non è particolarmente utile per noi, perché tutti gli user_id sono garantiti nella tabella users grazie ai vincoli di chiave esterna che abbiamo definito.
Tuttavia, se un commento avesse un `user_id` che non esiste, quel commento verrebbe omesso dai risultati.

![Diagramma di JOIN tra tabelle](/img/SQL_joins.png)

- `INNER` significa: prendi solo righe dove c’è corrispondenza tra le due tabelle.
- Esistono altri JOIN:
  - **LEFT JOIN** → prendi tutto dalla tabella di sinistra anche se non c’è match.
  - **RIGHT JOIN** → prendi tutto dalla tabella di destra.
  - **FULL OUTER JOIN** → prendi tutto da entrambe le tabelle, anche se non combacia.
  - **CROSS JOIN** → prodotto cartesiano (tutte le combinazioni, molto pesante).
  - **SELF JOIN** → unisci una tabella con sé stessa.
- `NATURAL JOIN` abbina automaticamente le colonne con lo stesso nome, ma è meno usato perché può essere ambiguo.

---

## Subquery (Sottoquery)

Esempio: trovare tutti i commenti scritti da **Maynord Simonich**.

Senza subquery:

1. Cerchi l’`user_id` di Maynord nella tabella `users`.
2. Poi usi quell’`user_id` per cercare i commenti.

Con subquery in un unico comando:

```sql
SELECT comment_id, user_id, LEFT(comment, 20)
FROM comments
WHERE user_id = (
  SELECT user_id FROM users WHERE full_name = 'Maynord Simonich'
);
```

- La subquery tra parentesi `()` restituisce l’`user_id`.
- Quel valore viene usato immediatamente nella query esterna.
- Assicurati che la subquery ritorni **solo una riga** (altrimenti errore).

---

## GROUP BY e aggregazioni

Supponiamo di voler mostrare le 10 bacheche con più commenti:

```sql
SELECT
  boards.board_name,
  COUNT(*) AS comment_count
FROM
  comments
INNER JOIN
  boards
ON
  boards.board_id = comments.board_id
GROUP BY
  boards.board_name
ORDER BY
  comment_count DESC
LIMIT 10;
```

- `GROUP BY` raggruppa per `board_name`.
- `COUNT(*)` conta quanti commenti ha ogni bacheca.

Se invece vuoi le bacheche **meno popolari**, puoi ordinare in modo crescente:

```sql
SELECT
  boards.board_name,
  COUNT(*) AS comment_count
FROM
  comments
INNER JOIN
  boards
ON
  boards.board_id = comments.board_id
GROUP BY
  boards.board_name
ORDER BY
  comment_count ASC
LIMIT 10;
```

⚠️ Problema: con `INNER JOIN` le bacheche senza commenti **non compaiono**.  
Per includerle, serve un **RIGHT JOIN** (o un LEFT JOIN se inverti l’ordine delle tabelle):

```sql
SELECT
  boards.board_name,
  COUNT(comment_id) AS comment_count
FROM
  comments
RIGHT JOIN
  boards
ON
  boards.board_id = comments.board_id
GROUP BY
  boards.board_name
ORDER BY
  comment_count;
```

- Qui usiamo `COUNT(comment_id)` invece di `COUNT(*)` per non contare righe nulle come commenti.

---

✅ Conoscere bene le tue tabelle, le chiavi esterne e i tipi di JOIN è fondamentale per scrivere query SQL robuste ed efficienti.
