---
sidebar_position: 2
---

# PostgreSQL

Abbiamo esaminato un po’ i concetti generali dei database relazionali nella sezione precedente, ora iniziamo a interagire concretamente con alcuni database.

## Avviamo PostgreSQL

Cominciamo facendo partire un container PostgreSQL.  
Io userò la versione **17.0** (l’ultima immagine disponibile al momento) e ti consiglio di fare lo stesso per seguire questo tutorial.  
Anche se potrebbero esserci versioni più recenti, questa è quella compatibile con gli esempi.

```bash
docker run -d \
  --name corso-postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5432:5432 \
  -v corso_pgdata:/var/lib/postgresql/data \
  postgres:17.0
```

Dobbiamo impostare una password, altrimenti PostgreSQL non si avvierà di default.  
Non preoccuparti, questo non è il modo in cui lo useresti in produzione.

---

## Database e Tabelle

**PostgreSQL** ha lo stesso concetto di _database_ di MongoDB.  
Un database è un insieme di tabelle legate allo stesso ambito di problema.  
Sarai tu a decidere come raggruppare i dati.  
Alcune applicazioni possono stare tutte in un unico database; altre avranno bisogno di più database.  
In generale, ciò che va scalato separatamente (ad esempio le transazioni di pagamento e gli articoli di un negozio) può essere suddiviso.

Le **tabelle** sono simili alle collezioni di MongoDB: un insieme di record, come un foglio Excel.  
Ogni record è come un oggetto in MongoDB: una riga nella tabella, ad esempio un utente nella tabella degli utenti.

Le tabelle hanno uno **schema definito**.  
Come in Excel, ogni colonna rappresenta un tipo di informazione, e in PostgreSQL questo schema deve essere dichiarato in anticipo e non può essere creato “al volo”.  
Modificare lo schema di una tabella è un’operazione pesante e su grandi dataset può richiedere ore o giorni.  
Qui è molto più importante pianificare bene prima.

---

## Le nostre prime query SQL

Prima cosa da fare: creare un nuovo database usando SQL.  
Tutte le varianti di SQL sono simili, ma non sempre compatibili al 100%.  
Quindi, anche se questo è simile a MySQL, non è identico.

Nota: scrivo tutte le **parole chiave SQL in maiuscolo** per rendere le query più leggibili — è una pratica comune e consigliata.

Di default sei connesso al database `postgres` (quello predefinito).  
Creiamo il nostro database chiamato `message_board`.

Esegui la tua prima query (ricorda di includere sempre il `;` alla fine: in SQL non è opzionale come in JavaScript!).

```sql
CREATE DATABASE message_boards;
```

Dovresti vedere `CREATE DATABASE` come conferma che è stato creato.  
Ora possiamo connetterci a questo nuovo database:

```sql
\c message_boards;
-- \connect message_boards funziona uguale
```

La notazione con `\` serve a dare comandi amministrativi alla CLI `psql` di PostgreSQL.  
In questo caso ci stiamo collegando al nuovo database.

Prova anche qualche altro comando utile:

```sql
-- vedere tutti i database
\l

-- vedere tutte le tabelle nel database (probabilmente ancora nessuna)
\d

-- vedere tutti i comandi disponibili
\?

-- vedere gli help delle query
\h

-- eseguire un comando shell
\! ls && echo "ciao dalla shell!"
```

💡 In SQL i commenti si scrivono con `--`.

---

## Prima tabella

Ora che abbiamo un database e siamo connessi, creiamo la nostra prima tabella:

```sql
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username VARCHAR (25) UNIQUE NOT NULL,
  email VARCHAR (50) UNIQUE NOT NULL,
  full_name VARCHAR (100) NOT NULL,
  last_login TIMESTAMP,
  created_on TIMESTAMP NOT NULL
);
```

Vediamo cosa significa:

- **CREATE TABLE**: comando per creare una nuova tabella, qui chiamata `users`.
- `user_id`: campo intero incrementale; il primo utente avrà `1`, il secondo `2`, ecc.  
  Il `GENERATED ALWAYS AS IDENTITY` significa che PostgreSQL gestisce l’incremento automatico.  
  `PRIMARY KEY` indica che questo campo sarà l’indice principale.
- Prima si usava il tipo `SERIAL`, ma `GENERATED ALWAYS AS IDENTITY` è più moderno e conforme allo standard SQL.
- In MongoDB avevamo `_id`; in PostgreSQL non viene creato automaticamente.
- `username` e `email` sono stringhe (`VARCHAR`) con lunghezze massime rispettivamente di 25 e 50 caratteri.  
  Sono uniche (`UNIQUE`) e non possono essere vuote (`NOT NULL`).
- `full_name` non è unico, quindi puoi avere due utenti con lo stesso nome completo.
- `last_login` rappresenta l’ultimo accesso, ma può essere `NULL` se l’utente non ha mai fatto login.
- `created_on` terrà la data di creazione dell’utente.

📌 Ci sono molti altri tipi di dato in PostgreSQL: [vedi qui][types].

---

## Primo record

Inseriamo un utente nella tabella `users` (equivale ad aggiungere una riga in un foglio Excel):

```sql
INSERT INTO users (username, email, full_name, created_on) VALUES ('ddantonio', 'lol@example.com', 'Davide D''Antonio', NOW());
```

- `INSERT INTO`: indica che vogliamo inserire un nuovo record nella tabella `users`.
- Le parentesi `()` indicano l’ordine dei campi da popolare nella sezione `VALUES`.
- Non stiamo fornendo `user_id` perché PostgreSQL lo genera da solo.
- Non stiamo fornendo `last_login` perché non è richiesto.
- Per `created_on` usiamo `NOW()`, una funzione integrata che restituisce l’orario attuale.

Se la query ha successo vedrai `INSERT 0 1` — significa che è stato inserito **1 record**.

---

## Visualizzare il primo record

Ora recuperiamo i dati inseriti con una semplice query:

```sql
SELECT * FROM users;
```

Dovresti vedere la riga che hai appena creato!  
Ottimo lavoro — sei pronto per continuare ad approfondire SQL nella prossima sezione.

[types]: https://www.postgresql.org/docs/18/datatype.html#DATATYPE-TABLE
