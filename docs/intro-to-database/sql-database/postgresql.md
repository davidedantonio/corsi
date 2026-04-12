---
sidebar_position: 2
---

# PostgreSQL

Abbiamo esaminato un po’ i concetti generali dei database relazionali nella sezione precedente, ora iniziamo a interagire concretamente con alcuni database.

## Avviamo PostgreSQL

Cominciamo facendo partire un container PostgreSQL. Io userò la versione **17.0** (l’ultima immagine disponibile al momento) e ti consiglio di fare lo stesso per
seguire questo tutorial. Anche se potrebbero esserci versioni più recenti, questa è quella compatibile con gli esempi.

```bash
docker run -d \
  --name corso-postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5432:5432 \
  -v corso_pgdata:/var/lib/postgresql/data \
  postgres:17.0
```

Dobbiamo impostare una password, altrimenti PostgreSQL non si avvierà di default. Non preoccuparti, questo non è il modo in cui lo useresti in produzione.

---

## Database e Tabelle

**PostgreSQL** ha lo stesso concetto di _database_ di MongoDB. Un database è un insieme di tabelle legate allo stesso ambito di problema. Sarai tu a decidere come raggruppare i dati.
Alcune applicazioni possono stare tutte in un unico database; altre avranno bisogno di più database. In generale, ciò che va scalato separatamente (ad esempio le transazioni di
pagamento e gli articoli di un negozio) può essere suddiviso.

Le **tabelle** sono simili alle collezioni di MongoDB: un insieme di record, come un foglio Excel. Ogni record è come un oggetto in MongoDB: una riga nella tabella, ad
esempio un utente nella tabella degli utenti.

Le tabelle hanno uno **schema definito**.

Come in Excel, ogni colonna rappresenta un tipo di informazione, e in PostgreSQL questo schema deve essere dichiarato in anticipo e non può essere creato “al volo”. Modificare lo schema
di una tabella è un’operazione pesante e su grandi dataset può richiedere ore o giorni. Qui è molto più importante pianificare bene prima.

---

## Le nostre prime query SQL

Prima cosa da fare: creare un nuovo database usando SQL. Tutte le varianti di SQL sono simili, ma non sempre compatibili al 100%. Quindi, anche se questo è simile a MySQL, non è identico.

Nota: scrivo tutte le **parole chiave SQL in maiuscolo** per rendere le query più leggibili — è una pratica comune e consigliata.

Di default sei connesso al database `postgres` (quello predefinito). Creiamo il nostro database chiamato `ecommerce`.

Esegui la tua prima query (ricorda di includere sempre il `;` alla fine: in SQL non è opzionale come in JavaScript!).

```sql
CREATE DATABASE ecommerce;
```

Dovresti vedere `CREATE DATABASE` come conferma che è stato creato.  
Ora possiamo connetterci a questo nuovo database:

```sql
\c ecommerce;
-- \connect ecommerce funziona uguale
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

Ora che abbiamo un database e siamo connessi, creiamo la nostra prima tabella: i **clienti** del nostro e-commerce.

```sql
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  full_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  city        VARCHAR(50),
  region      VARCHAR(50),
  segment     VARCHAR(20) CHECK (segment IN (‘retail’, ‘wholesale’, ‘vip’)),
  created_on  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Vediamo cosa significa:

- **CREATE TABLE**: comando per creare una nuova tabella, qui chiamata `customers`.
- `customer_id`: campo intero incrementale; il primo cliente avrà `1`, il secondo `2`, ecc.  
  Il `GENERATED ALWAYS AS IDENTITY` significa che PostgreSQL gestisce l’incremento automatico.  
  `PRIMARY KEY` indica che questo campo sarà l’indice principale.
- Prima si usava il tipo `SERIAL`, ma `GENERATED ALWAYS AS IDENTITY` è più moderno e conforme allo standard SQL.
- In MongoDB avevamo `_id`; in PostgreSQL non viene creato automaticamente.
- `email` è una stringa `VARCHAR` con massimo 100 caratteri, univoca (`UNIQUE`) e obbligatoria (`NOT NULL`).
- `city` e `region` sono opzionali — un cliente potrebbe non averle fornite.
- `segment` usa un vincolo `CHECK` per accettare solo i valori `retail`, `wholesale` o `vip`.
- `created_on` tiene la data di registrazione, con valore di default `NOW()`.

📌 Ci sono molti altri tipi di dato in PostgreSQL: [vedi qui][types].

---

## Primo record

Inseriamo un cliente nella tabella `customers`:

```sql
INSERT INTO customers (full_name, email, city, region, segment)
VALUES (‘Davide D’’Antonio’, ‘davide@example.com’, ‘Milano’, ‘Lombardia’, ‘vip’);
```

- `INSERT INTO`: indica che vogliamo inserire un nuovo record nella tabella `customers`.
- Le parentesi `()` indicano l’ordine dei campi da popolare nella sezione `VALUES`.
- Non stiamo fornendo `customer_id` perché PostgreSQL lo genera da solo.
- Per `created_on` non passiamo nulla — verrà usato il valore `DEFAULT NOW()`.

Se la query ha successo vedrai `INSERT 0 1` — significa che è stato inserito **1 record**.

---

## Visualizzare il primo record

Ora recuperiamo i dati inseriti con una semplice query:

```sql
SELECT * FROM customers;
```

Dovresti vedere la riga che hai appena creato!  
Ottimo lavoro — sei pronto per continuare ad approfondire SQL nella prossima sezione.

[types]: https://www.postgresql.org/docs/18/datatype.html#DATATYPE-TABLE
