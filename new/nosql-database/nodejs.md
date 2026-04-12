---
sidebar_position: 7
---

# Integrazione con Node.js

Creiamo velocemente un piccolo progetto Node.js per aiutarti a trasferire le tue competenze dalla riga di comando al mondo della programmazione.

[Ecco il codice completo su GitHub](https://github.com/davidedantonio/intro-to-databases)

## Setup del progetto

Crea una nuova cartella e inizializza un progetto Node.js:

```bash
mkdir nodejs-mongodb
cd nodejs-mongodb
npm init -y
npm install --save mongodb fastify @fastify/static
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
touch pets.js
touch /public/list.html
touch /public/search_delete.html
```

Terminata la parte di setup, apri il progetto con il tuo editor di codice preferito. Dovresti vedere questa struttura:

```
nodejs-mongodb
├── node_modules
├── .gitignore
├── pets.js
├── index.js
├── package-lock.json
├── package.json
└── public
    ├── list.html
    └── search_delete.html
```

Ora siamo pronti per scrivere il codice. Apri il file `index.js` e incolla il seguente codice:

```javascript
import Fastify from "fastify";
import { MongoClient } from "mongodb";
import FastifyStatic from "@fastify/static";
import path from "path";
import Pets from "./pets.js";

const URL = "mongodb://localhost:27017";
const DB_NAME = "adoptions";

const app = Fastify({ logger: true });
const client = new MongoClient(URL);

// Register a plugin to connect to MongoDB
app.register(async (fastify) => {
  await client.connect();
  const db = client.db(DB_NAME);
  fastify.decorate("db", db);

  app.register(FastifyStatic, {
    root: path.join(path.resolve(), "public"),
    prefix: "/public/",
  });

  app.register(Pets);
});

app.listen({ port: 5000 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server listening at ${address}`);
});
```

Questo codice fa alcune cose:

1. Importa le librerie necessarie.
2. Configura Fastify come server web.
3. Si connette a MongoDB.
4. Registra un plugin per servire file statici dalla cartella `public`.
5. Registra il modulo `pets.js` che conterrà le nostre rotte.
6. Avvia il server sulla porta 5000.

Ora apri il file `pets.js` e incolla il seguente codice:

```javascript
import Fastify from "fastify";
import { MongoClient } from "mongodb";
import FastifyStatic from "@fastify/static";
import path from "path";
import Pets from "./pets.js";

const URL = "mongodb://localhost:27017";
const DB_NAME = "adoptions";

const app = Fastify({ logger: true });
const client = new MongoClient(URL);

// Register a plugin to connect to MongoDB
app.register(async (fastify) => {
  await client.connect();
  const db = client.db(DB_NAME);
  fastify.decorate("db", db);

  app.register(FastifyStatic, {
    root: path.join(path.resolve(), "public"),
    prefix: "/public/",
  });

  app.register(Pets);
});

app.listen({ port: 5000 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server listening at ${address}`);
});
```

Questo modulo definisce le rotte per gestire le operazioni CRUD sugli animali domestici. Utilizza il database MongoDB per memorizzare e recuperare i dati.

Ora apri il file `public/list.html` e incolla il seguente codice:

```html
<html>
  <head>
    <title>Pets List</title>
  </head>
  <body>
    <h1>Pets List</h1>
    <div id="pets-list"></div>

    <script>
      async function fetchPets() {
        const response = await fetch("http://localhost:5000/pets");
        const pets = await response.json();
        const petsListDiv = document.getElementById("pets-list");
        petsListDiv.innerHTML = "";

        pets.forEach((pet) => {
          const petDiv = document.createElement("div");
          petDiv.innerHTML = `
            <h2>${pet.name}</h2>
            <p>ID: ${pet._id}</p>
            <p>Name: ${pet.name}</p>
            <p>Type: ${pet.type}</p>
            <p>Age: ${pet.age}</p>
            <p>Breed: ${pet.breed}</p>
            <hr/>
          `;
          petsListDiv.appendChild(petDiv);
        });
      }

      // Fetch and display pets when the page loads
      window.onload = fetchPets;
    </script>
  </body>
</html>
```

Questo file HTML crea una semplice interfaccia utente per visualizzare l'elenco degli animali domestici. Quando la pagina viene caricata, esegue una richiesta fetch al server per ottenere i dati degli animali e li visualizza nella pagina.
Ora apri il file `public/search_delete.html` e incolla il seguente codice:

```html
<html>
  <head>
    <title>Pets List</title>
  </head>
  <body>
    <h1>Pets List</h1>
    <input type="text" id="pet-id-input" placeholder="Enter Pet ID" />
    <button id="search-button">Search Pet</button>
    <button id="delete-button">Delete Pet</button>
    <div id="pets-list"></div>

    <script>
      const searchButton = document.getElementById("search-button");
      const deleteButton = document.getElementById("delete-button");
      const petIdInput = document.getElementById("pet-id-input");
      const petsListDiv = document.getElementById("pets-list");

      searchButton.addEventListener("click", async () => {
        const petId = petIdInput.value;
        if (!petId) {
          alert("Please enter a Pet ID.");
          return;
        }

        try {
          const response = await fetch(`http://localhost:5000/pets/${petId}`);
          if (response.ok) {
            const pet = await response.json();
            petsListDiv.innerHTML = `
              <h2>${pet.name}</h2>
              <p>ID: ${pet._id}</p>
              <p>Name: ${pet.name}</p>
              <p>Type: ${pet.type}</p>
              <p>Age: ${pet.age}</p>
              <p>Breed: ${pet.breed}</p>
              <hr/>
            `;
          } else {
            petsListDiv.innerHTML = "<p>Pet not found.</p>";
          }
        } catch (error) {
          console.error("Error fetching pet:", error);
          petsListDiv.innerHTML = "<p>Error fetching pet data.</p>";
        }
      });

      deleteButton.addEventListener("click", async () => {
        const petId = petIdInput.value;
        if (!petId) {
          alert("Please enter a Pet ID.");
          return;
        }

        try {
          const response = await fetch(`http://localhost:5000/pets/${petId}`, {
            method: "DELETE",
          });
          if (response.ok) {
            petsListDiv.innerHTML = "<p>Pet deleted successfully.</p>";
          } else {
            petsListDiv.innerHTML = "<p>Failed to delete pet.</p>";
          }
        } catch (error) {
          console.error("Error deleting pet:", error);
          petsListDiv.innerHTML = "<p>Error deleting pet.</p>";
        }
      });
    </script>
  </body>
</html>
```

Questo file HTML crea un'interfaccia utente per cercare ed eliminare animali domestici in base al loro ID. Gli utenti possono inserire un ID, quindi fare clic sui pulsanti "Search Pet" o "Delete Pet" per eseguire le rispettive operazioni. I risultati vengono visualizzati nella pagina.
