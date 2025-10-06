---
sidebar_position: 7
---

# Integrazione con Node.js

Creiamo velocemente un piccolo progetto Node.js per aiutarti a trasferire le tue competenze dalla riga di comando al mondo della programmazione.

[Ecco il codice completo su GitHub](https://github.com/davidedantonio/intro-to-databases)

## Setup del progetto

Crea una nuova cartella e inizializza un progetto Node.js:

```bash
mkdir intro-to-databases
cd intro-to-databases
npm init -y

npm install --save pg fastify @fastify/static
```

Aggiungere uno script di avvio nel `package.json`:

```json
"scripts": {
  "start": "node index.js"
}
```

sotto la voce `depescription` aggiungete questa:

```json
  "type": "module",
```

e aggiungete un file `.gitignore`:

```
node_modules
.env
```

Ora create i seguenti file:

```bash
touch index.js
touch /public/list.html
touch /public/search_delete.html
```

Terminata la parte di setup, apri il progetto con il tuo editor di codice preferito. Dovresti vedere questa struttura:

```
intro-to-databases
├── node_modules
├── .gitignore
├── index.js
├── package-lock.json
├── package.json
└── public
    ├── list.html
    └── search_delete.html
```

Ora copiate e incollate il seguente codice in `/public/list.html`:

```html
<html>
  <head>
    <title>Lista Boards</title>
  </head>
  <body>
    <h1>Lista Boards</h1>
    <div id="boards-container"></div>
  </body>

  <script type="text/javascript">
    fetch("http://localhost:5000/boards")
      .then((response) => response.json())
      .then((data) => {
        const body = document.getElementById("boards-container");
        body.innerHTML = "";
        data.forEach((board) => {
          const boardElement = document.createElement("div");
          boardElement.innerHTML = `<h2>${board.board_id} - ${board.board_name}</h2><p>${board.board_description}</p>`;
          body.appendChild(boardElement);
        });
      })
      .catch((error) => console.error("Error fetching boards:", error));
  </script>
</html>
```

E questo in `/public/search_delete.html`:

```html
<html>
  <head>
    <title>Cerca Boards</title>
  </head>
  <body>
    <h1>Cerca Board</h1>
    <div>
      <input type="text" id="search-input" placeholder="Cerca per id" />
      <button id="search-button">Cerca</button>
      <button id="delete-button">Elimina</button>
    </div>
    <div id="boards-container"></div>
  </body>

  <script type="text/javascript">
    const searchButton = document.getElementById("search-button");
    const deleteButton = document.getElementById("delete-button");
    const searchInput = document.getElementById("search-input");
    const boardsContainer = document.getElementById("boards-container");

    deleteButton.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
        fetch(`http://localhost:5000/boards/${query}`, {
          method: "DELETE",
        })
          .then((response) => {
            return response.json();
          })
          .then((result) => {
            boardsContainer.innerHTML = `<p>${result.message}</p>`;
          })
          .catch((error) => {
            boardsContainer.innerHTML = `<p>${error.message}</p>`;
          });
      } else {
        boardsContainer.innerHTML =
          "<p>Per favore, inserisci un id di board valido.</p>";
      }
    });

    searchButton.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
        fetch(`http://localhost:5000/boards/${query}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Board non trovato");
            }
            return response.json();
          })
          .then((board) => {
            boardsContainer.innerHTML = `<h2>${board.board_id} - ${board.board_name}</h2><p>${board.board_description}</p>`;
          })
          .catch((error) => {
            boardsContainer.innerHTML = `<p>${error.message}</p>`;
          });
      } else {
        boardsContainer.innerHTML =
          "<p>Per favore, inserisci un id di board valido.</p>";
      }
    });
  </script>
</html>
```

Normalmente non si mettono i file HTML nella cartella `public`, ma per semplicità in questo esempio lo faremo.
Ora apri il file `index.js` e incolla il seguente codice:

```javascript
import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import pg from "pg";
import path from "path";

const app = Fastify({ logger: true });

const __dirname = path.resolve();

// PostgreSQL client setup
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "message_boards",
  password: "mysecretpassword",
  port: 5432,
});

app.register(FastifyStatic, {
  root: path.join(__dirname, "./public"),
  prefix: "/public/",
});

app.get("/list", async (request, reply) => {
  return reply.sendFile("list.html");
});

app.get("/search", async (request, reply) => {
  return reply.sendFile("search_delete.html");
});

app.get("/boards", async (request, reply) => {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM boards");
    return res.rows;
  } catch (err) {
    app.log.error(err);
    reply.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

app.get("/boards/:id", async (request, reply) => {
  const client = await pool.connect();
  const { id } = request.params;
  try {
    const res = await client.query("SELECT * FROM boards WHERE board_id = $1", [
      id,
    ]);
    if (res.rows.length === 0) {
      reply.status(404).send("Board not found");
    }
    return res.rows[0];
  } catch (err) {
    app.log.error(err);
    reply.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

app.delete("/boards/:id", async (request, reply) => {
  const client = await pool.connect();
  const { id } = request.params;
  try {
    const res = await client.query("DELETE FROM boards WHERE board_id = $1", [
      id,
    ]);

    if (res.rowCount === 0) {
      reply.status(404).send({ message: "Board not found" });
    } else {
      reply.status(200).send({ message: "Board deleted successfully" });
    }
  } catch (err) {
    app.log.error(err);
    reply.status(500).send({ message: "Internal Server Error" });
  } finally {
    client.release();
  }
});

app.listen({ port: 5000 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server listening at ${address}`);
});
```

Ora puoi avviare il server:

```bash
npm start
```

Apri il browser e vai su [http://localhost:5000/list](http://localhost:5000/list) per vedere la lista delle boards.
Vai su [http://localhost:5000/search](http://localhost:5000/search) per cercare o eliminare una board per ID.

## Spiegazione del codice

Il codice sopra crea un semplice server web usando Fastify e si connette a un database PostgreSQL usando il modulo `pg`.
Ecco una spiegazione delle parti principali:

1. **Connessione a PostgreSQL**: Usiamo un pool di connessioni per gestire le connessioni al database in modo efficiente.
2. **Rotte API**:
   - `GET /boards`: Recupera tutte le boards dal database.
   - `GET /boards/:id`: Recupera una board specifica per ID.
   - `DELETE /boards/:id`: Elimina una board specifica per ID.
3. **Gestione degli errori**: Ogni rotta gestisce gli errori
   e restituisce un messaggio di errore appropriato se qualcosa va storto.
4. **Servizio di file statici**: Usiamo `@fastify/static` per servire i file HTML dalla cartella `public`.
5. **Interfaccia utente**: I file HTML contengono JavaScript che fa richieste alle API per mostrare i dati e gestire le azioni dell'utente.
6. **Avvio del server**: Il server ascolta sulla porta 5000 e logga l'indirizzo di ascolto.

Ora hai un semplice progetto Node.js che interagisce con un database PostgreSQL! Puoi espandere questo progetto aggiungendo più funzionalità,
come l'inserimento di nuove boards, l'aggiornamento delle esistenti, e molto altro. Buon coding! 🚀
