---
sidebar_position: 3
---

# Effettuare query SQL di base

Scoprirai che SQL ha una grande profondità. Ci sono persone il cui lavoro consiste principalmente nello scrivere SQL. Ma qui iniziamo con le basi. La prima cosa che voglio fare è inserire alcuni dati di esempio nel nostro database `users`.

[Fai clic qui][sql] per un set di tabelle di esempio per il tuo database. Questa query eliminerà tutte le tabelle esistenti e le ricreerà da zero. In qualsiasi momento puoi rilanciarla per avere una copia pulita delle tue tabelle. Puoi letteralmente copiare e incollare tutto nel tuo terminale connesso a PostgreSQL (`psql`) e funzionerà. Esiste un modo più elegante per caricarla dalla riga di comando, ma visto che siamo in Docker è più semplice copiare/incollare. Probabilmente impiegherà circa 90 secondi per eseguirsi.

## SELECT

Iniziamo con **SELECT**. Serve per cercare dati in un database SQL. Ripetiamo l’istruzione SELECT della sezione precedente e analizziamola.

```sql
SELECT * FROM users;
```

Questo recupera tutti i campi (il simbolo `*` è un _wildcard_) dalla tabella `users`. In questo esempio saranno 1000 utenti.

## LIMIT

Selezioniamo meno utenti:

```sql
SELECT * FROM users LIMIT 10;
```

Limita il risultato a 10 record.

## Projection

Selezioniamo solo alcune colonne, non tutte:

```sql
SELECT username, user_id FROM users LIMIT 15;
```

In generale è una buona pratica selezionare solo le colonne di cui hai bisogno. Alcune tabelle possono avere anche 50+ colonne.

## WHERE

Filtriamo record specifici:

```sql
SELECT username, email, user_id FROM users WHERE user_id=150;
SELECT username, email, user_id FROM users WHERE last_login IS NULL LIMIT 10;
```

La prima query restituisce l’utente con `user_id` uguale a 150.  
La seconda restituisce 10 utenti che non hanno mai effettuato l’accesso (`last_login` è NULL).

## AND e operazioni con date

Supponiamo di voler vedere utenti che **non hanno mai effettuato login** e il cui account è stato creato **più di sei mesi fa**:

```sql
SELECT username, email, user_id, created_on
FROM users
WHERE last_login IS NULL AND created_on < NOW() - interval '6 months'
LIMIT 10;
```

- Usiamo `AND` per combinare più condizioni.
- Facciamo anche un po’ di “date math”: `created_on` è un timestamp e lo confrontiamo con `NOW()` (ora attuale del server) meno un intervallo di sei mesi.

## ORDER BY

Per trovare gli account più vecchi usiamo un ordinamento:

```sql
SELECT user_id, email, created_on FROM users ORDER BY created_on LIMIT 10;
```

Per i più recenti aggiungi `DESC` (il default è `ASC` — crescente):

```sql
SELECT user_id, email, created_on FROM users ORDER BY created_on DESC LIMIT 10;
```

## COUNT(\*)

Vuoi sapere quanti record totali ci sono?

```sql
SELECT COUNT(*) FROM users;
```

`*` conta tutte le righe.  
Se invece vuoi contare solo gli utenti che hanno mai fatto login (ignorando i valori NULL):

```sql
SELECT COUNT(last_login) FROM users;
```

## UPDATE con RETURNING

Se l’utente con `user_id = 1` fa login, aggiorniamo il campo `last_login`:

```sql
UPDATE users SET last_login = NOW() WHERE user_id = 1 RETURNING *;
```

Aggiorniamo nome e email dell’utente con `user_id = 2`:

```sql
UPDATE users SET full_name= 'Davide D''Antonio', email = 'lol@example.com' WHERE user_id = 2 RETURNING *;
```

- Puoi aggiornare più campi separandoli con la virgola.
- Usa sempre gli apici singoli `'` per le stringhe. I doppi `"` danno errore.
- `RETURNING *` è opzionale ma utile per vedere i dati aggiornati subito.

## DELETE

Per cancellare un record:

```sql
DELETE FROM users WHERE user_id = 1000;
```

[sql]: https://btholt.github.io/complete-intro-to-databases/sample-postgresql.sql
