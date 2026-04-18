---
sidebar_position: 11
---

# Gestione degli Errori e JSON

Quando si lavora con dati reali — file di configurazione, risposte di API, dataset scaricati da un server — le cose non vanno sempre come previsto. Un endpoint può essere irraggiungibile, un JSON può essere malformato, un campo atteso potrebbe mancare. Ignorare questi casi porta a applicazioni che si "rompono silenziosamente": nessun messaggio di errore, nessuna indicazione di cosa è andato storto, dati corrotti propagati a valle.

Per un Data Analyst che usa JavaScript per interrogare API, trasformare dati e aggiornare dashboard, la gestione degli errori non è un dettaglio: è parte integrante della logica di business. Questo capitolo copre gli strumenti fondamentali per scrivere codice robusto: il blocco `try/catch/finally`, i tipi di errore nativi di JavaScript, gli errori personalizzati, la gestione degli errori nelle promises e in `async/await`, e tutto ciò che serve sapere su JSON per serializzare e deserializzare dati in modo sicuro.

## try, catch e finally

Il blocco `try/catch` è il meccanismo principale per intercettare gli errori in JavaScript. Il codice che potrebbe sollevare un'eccezione va scritto all'interno del blocco `try`; se si verifica un errore, l'esecuzione salta immediatamente al blocco `catch`, dove è possibile esaminare l'errore e reagire di conseguenza. Il blocco `finally`, se presente, viene sempre eseguito al termine — sia in caso di successo che di errore — ed è utile per liberare risorse o eseguire operazioni di cleanup.

```javascript
const parseUserInput = (input) => {
  try {
    const value = JSON.parse(input);
    console.log('Valore parsato:', value);
    return value;
  } catch (error) {
    console.error('Impossibile parsare il valore:', error.message);
    return null;
  } finally {
    console.log('Operazione di parsing completata.');
  }
};

parseUserInput('{"nome": "Alice", "eta": 30}'); // OK
parseUserInput('questo non è JSON');              // Errore gestito
```

Il blocco `finally` è particolarmente prezioso in scenari reali: se si apre una connessione a un database o si mostra uno spinner di caricamento nella UI, il `finally` garantisce che la connessione venga chiusa o lo spinner venga nascosto indipendentemente dall'esito dell'operazione.

:::tip Perché è importante
Senza `try/catch`, un errore non gestito interrompe l'esecuzione dell'intero script. In un'applicazione web questo può significare che la pagina smette di rispondere o che dati parziali vengono visualizzati all'utente senza alcun avviso.
:::

## Tipi di errori in JavaScript

JavaScript include sei tipi di errore nativi, ognuno associato a una categoria specifica di problema. Riconoscerli permette di diagnosticare i bug più rapidamente e di scrivere gestori di errori più precisi.

### SyntaxError

Si verifica quando il motore JavaScript non riesce a interpretare il codice perché la sintassi non è valida. Accade tipicamente a tempo di parsing, prima ancora che il codice venga eseguito, ma può manifestarsi anche a runtime con `JSON.parse` o `eval`.

```javascript
try {
  JSON.parse('{chiave: "valore"}'); // chiave senza virgolette: JSON non valido
} catch (error) {
  console.error(error instanceof SyntaxError); // true
  console.error(error.message); // "Unexpected token k in JSON at position 1"
}
```

### ReferenceError

Si verifica quando si tenta di accedere a una variabile che non è stata dichiarata nell'ambito corrente.

```javascript
try {
  console.log(datasetNonEsistente);
} catch (error) {
  console.error(error instanceof ReferenceError); // true
  console.error(error.message); // "datasetNonEsistente is not defined"
}
```

### TypeError

Si verifica quando un'operazione viene eseguita su un valore del tipo sbagliato. È l'errore più comune nel lavoro con dati provenienti da API, dove un campo atteso come array potrebbe risultare `null` o `undefined`.

```javascript
try {
  const dati = null;
  dati.forEach(record => console.log(record)); // null non ha forEach
} catch (error) {
  console.error(error instanceof TypeError); // true
  console.error(error.message); // "Cannot read properties of null"
}
```

### RangeError

Si verifica quando un valore numerico si trova fuori dall'intervallo consentito da una funzione.

```javascript
try {
  const percentuale = (3.14159265).toFixed(200); // massimo consentito: 100
} catch (error) {
  console.error(error instanceof RangeError); // true
  console.error(error.message); // "toFixed() digits argument must be between 0 and 100"
}
```

### URIError

Si verifica quando si passano caratteri non validi alle funzioni `decodeURIComponent` o `encodeURIComponent`.

```javascript
try {
  decodeURIComponent('%'); // sequenza di escape incompleta
} catch (error) {
  console.error(error instanceof URIError); // true
}
```

### EvalError

Storicamente associato all'uso improprio di `eval()`. Nelle versioni moderne di JavaScript è praticamente obsoleto, ma rimane nella specifica per compatibilità. È bene conoscerlo, ma è ancora meglio non usare mai `eval()` nel codice di produzione.

## Creare errori personalizzati

Spesso gli errori nativi non bastano a descrivere con precisione cosa è andato storto nel dominio applicativo. JavaScript permette di creare e lanciare errori personalizzati tramite il costruttore `Error` e la parola chiave `throw`.

```javascript
const validaDataset = (dataset) => {
  if (!Array.isArray(dataset)) {
    throw new Error('Il dataset deve essere un array.');
  }

  if (dataset.length === 0) {
    throw new Error('Il dataset non può essere vuoto.');
  }

  const campiRichiesti = ['id', 'valore', 'timestamp'];
  const primaRiga = dataset[0];

  for (const campo of campiRichiesti) {
    if (!(campo in primaRiga)) {
      throw new Error(`Campo obbligatorio mancante: "${campo}".`);
    }
  }

  return true;
};

try {
  validaDataset([{ id: 1, valore: 42 }]); // manca "timestamp"
} catch (error) {
  console.error('Errore di validazione:', error.message);
  console.error('Stack trace:', error.stack);
}
```

L'oggetto `Error` ha due proprietà fondamentali:

- **`error.message`**: il testo descrittivo dell'errore, leggibile dall'uomo.
- **`error.stack`**: la traccia dello stack di chiamate al momento dell'errore, utilissima per il debug.

Per scenari più complessi, è possibile creare classi di errore personalizzate estendendo `Error`. Questo permette di differenziare i tipi di errore nel blocco `catch` usando `instanceof`.

```javascript
class ErroreValidazione extends Error {
  constructor(campo, messaggio) {
    super(messaggio);
    this.name = 'ErroreValidazione';
    this.campo = campo;
  }
}

class ErroreReteAPI extends Error {
  constructor(statusCode, url) {
    super(`Risposta HTTP ${statusCode} da ${url}`);
    this.name = 'ErroreReteAPI';
    this.statusCode = statusCode;
    this.url = url;
  }
}

// Nel blocco catch è possibile distinguere il tipo di errore
try {
  throw new ErroreValidazione('email', 'Il formato email non è valido.');
} catch (error) {
  if (error instanceof ErroreValidazione) {
    console.error(`Campo "${error.campo}": ${error.message}`);
  } else {
    console.error('Errore generico:', error.message);
  }
}
```

:::tip Perché è importante
Creare gerarchie di errori personalizzati rende il codice più espressivo e manutenibile. Invece di leggere stringhe di messaggio per capire il tipo di errore, il blocco `catch` può prendere decisioni strutturate basate sul tipo di eccezione.
:::

## Errori nelle Promises e async/await

Le operazioni asincrone introducono una complessità aggiuntiva nella gestione degli errori. Un errore che si verifica all'interno di una promise non si propaga attraverso il normale `try/catch` sincrono: deve essere intercettato esplicitamente.

### .catch() sulle Promises

Quando si lavora con le promises in stile `.then()`, il metodo `.catch()` intercetta qualsiasi errore che si propaga nella catena.

```javascript
fetch('https://jsonplaceholder.typicode.com/posts/1')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Post ricevuto:', data.title);
  })
  .catch(error => {
    console.error('Richiesta fallita:', error.message);
  });
```

### try/catch con async/await

Con `async/await`, la gestione degli errori torna al blocco `try/catch` sincrono, rendendo il codice molto più leggibile, specialmente quando ci sono più operazioni asincrone in sequenza.

```javascript
const caricaPost = async (id) => {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Impossibile caricare il post:', error.message);
    return null;
  }
};
```

### Esempio reale: fetch con gestione errori HTTP e di parsing

Un caso frequente nel lavoro con API è dover gestire sia gli errori di rete (la richiesta non è partita o il server non risponde) che gli errori HTTP (il server risponde con un codice di errore come 404 o 500), più il caso in cui il corpo della risposta non è JSON valido.

```javascript
const fetchDatiAnalisi = async (endpoint) => {
  let response;

  try {
    response = await fetch(endpoint);
  } catch (erroreRete) {
    // Errore di rete: nessuna connessione, DNS non risolto, timeout, ecc.
    throw new Error(`Impossibile raggiungere il server: ${erroreRete.message}`);
  }

  if (!response.ok) {
    // Il server ha risposto, ma con un codice di errore
    throw new Error(`Il server ha risposto con errore ${response.status}: ${response.statusText}`);
  }

  let dati;
  try {
    dati = await response.json();
  } catch (erroreJSON) {
    // Il server ha risposto con status 200 ma il corpo non è JSON valido
    throw new SyntaxError(`La risposta del server non è JSON valido: ${erroreJSON.message}`);
  }

  return dati;
};

// Utilizzo
const mostraDati = async () => {
  try {
    const dati = await fetchDatiAnalisi('https://jsonplaceholder.typicode.com/users');
    console.log(`Ricevuti ${dati.length} utenti.`);
  } catch (error) {
    console.error('Errore durante il caricamento dei dati:', error.message);
  }
};

mostraDati();
```

Questa separazione in due `try/catch` distinti è deliberata: permette di distinguere con precisione dove si è verificato l'errore e di fornire messaggi diagnostici accurati.

## JSON: JavaScript Object Notation

JSON (JavaScript Object Notation) è un formato di testo leggero per la rappresentazione e lo scambio di dati strutturati. È diventato lo standard de facto per le API REST e per la configurazione di applicazioni, proprio perché è leggibile dall'uomo e facilmente processabile dalle macchine.

Nonostante il nome contenga "JavaScript", JSON è un formato indipendente dal linguaggio: Python, Java, Go e praticamente ogni linguaggio moderno supportano la lettura e la scrittura di JSON.

### Differenze tra JSON e oggetti JavaScript

Sebbene JSON assomigli molto alla sintassi degli oggetti letterali di JavaScript, ci sono differenze importanti:

| Caratteristica | Oggetto JS | JSON |
|---|---|---|
| Chiavi | Possono essere senza virgolette | Devono essere sempre tra virgolette doppie |
| Stringhe | Virgolette singole o doppie | Solo virgolette doppie |
| Valori consentiti | Qualsiasi tipo JS (funzioni, `undefined`, `Date`, ecc.) | `string`, `number`, `boolean`, `null`, `array`, `object` |
| `undefined` | Supportato | Non supportato (viene omesso) |
| Funzioni | Supportate | Non supportate |
| Commenti | Supportati | Non supportati |

```javascript
// Oggetto JavaScript valido
const configJS = {
  host: 'localhost',
  porta: 5432,
  attivo: true,
  connetti: () => console.log('connesso'), // le funzioni non esistono in JSON
  descrizione: undefined                    // undefined non esiste in JSON
};

// JSON valido equivalente (serializzato)
const configJSON = `{
  "host": "localhost",
  "porta": 5432,
  "attivo": true
}`;
// "connetti" e "descrizione" vengono omesse nella serializzazione JSON
```

## JSON.stringify

`JSON.stringify()` converte un oggetto JavaScript in una stringa JSON. Questo processo si chiama **serializzazione**. È necessario ogni volta che si vuole inviare dati strutturati a un server (il corpo di una richiesta HTTP deve essere testo) o salvarli in `localStorage`.

### Utilizzo base

```javascript
const recordVendite = {
  prodotto: 'Laptop Pro',
  quantita: 42,
  fatturato: 89358.00,
  data: '2025-03-15',
  categorie: ['elettronica', 'informatica']
};

const jsonString = JSON.stringify(recordVendite);
console.log(jsonString);
// {"prodotto":"Laptop Pro","quantita":42,"fatturato":89358,"data":"2025-03-15","categorie":["elettronica","informatica"]}
```

### Indentazione per la leggibilità

Il terzo parametro di `JSON.stringify` specifica il numero di spazi usati per l'indentazione, rendendo l'output leggibile da un essere umano.

```javascript
console.log(JSON.stringify(recordVendite, null, 2));
/*
{
  "prodotto": "Laptop Pro",
  "quantita": 42,
  "fatturato": 89358,
  "data": "2025-03-15",
  "categorie": [
    "elettronica",
    "informatica"
  ]
}
*/
```

### Replacer: filtrare o trasformare i dati

Il secondo parametro, il **replacer**, permette di controllare quali proprietà vengono incluse nella serializzazione. Può essere un array di chiavi da includere, o una funzione di trasformazione.

```javascript
const datiCompleti = {
  id: 101,
  nome: 'Alice Rossi',
  email: 'alice@azienda.it',     // dato sensibile
  password: 'hashedpassword123', // dato sensibile
  reparto: 'Analisi Dati',
  livelloAccesso: 3
};

// Includere solo i campi non sensibili
const datiPubblici = JSON.stringify(datiCompleti, ['id', 'nome', 'reparto'], 2);
console.log(datiPubblici);
/*
{
  "id": 101,
  "nome": "Alice Rossi",
  "reparto": "Analisi Dati"
}
*/
```

### Esempio: salvare in localStorage e inviare a un'API

```javascript
// Salvataggio preferenze utente in localStorage
const preferenze = {
  tema: 'scuro',
  linguaggio: 'it',
  colonneVisibili: ['data', 'prodotto', 'fatturato'],
  righePerPagina: 25
};

localStorage.setItem('preferenze', JSON.stringify(preferenze));

// Invio dati a un'API con fetch
const inviaRecord = async (record) => {
  const response = await fetch('https://api.esempio.com/vendite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(record) // il corpo deve essere una stringa
  });

  if (!response.ok) {
    throw new Error(`Errore nell'invio: ${response.status}`);
  }

  return response.json();
};
```

## JSON.parse

`JSON.parse()` esegue l'operazione inversa: converte una stringa JSON in un oggetto JavaScript. Questo processo si chiama **deserializzazione**.

### Utilizzo base

```javascript
const jsonRicevuto = '{"prodotto":"Laptop Pro","quantita":42,"fatturato":89358}';

const oggetto = JSON.parse(jsonRicevuto);
console.log(oggetto.prodotto);  // "Laptop Pro"
console.log(oggetto.quantita);  // 42
console.log(typeof oggetto);    // "object"
```

### Gestione dell'errore con try/catch

`JSON.parse` lancia un `SyntaxError` se la stringa non è JSON valido. Poiché nel mondo reale i dati provengono da fonti esterne — file, API, input utente — non si può mai dare per scontato che siano ben formati. Avvolgere `JSON.parse` in un `try/catch` non è un'opzione, è una necessità.

```javascript
const deserializzaConfig = (jsonString) => {
  try {
    const config = JSON.parse(jsonString);
    return config;
  } catch (error) {
    console.error('Configurazione non valida:', error.message);
    return null; // o un oggetto di configurazione di default
  }
};

// Caricamento configurazione da localStorage
const caricaPreferenze = () => {
  const raw = localStorage.getItem('preferenze');

  if (raw === null) {
    return { tema: 'chiaro', linguaggio: 'it', righePerPagina: 10 }; // default
  }

  return deserializzaConfig(raw) ?? { tema: 'chiaro', linguaggio: 'it', righePerPagina: 10 };
};
```

:::tip Perché è importante
I dati in `localStorage` possono essere stati scritti da una versione precedente dell'applicazione, modificati manualmente da un utente o corrotti. Non trattare mai dati persistenti come garantiti: validarli e gestire l'errore di parsing è la pratica corretta.
:::

## Lavorare con API: esempio completo

Mettiamo insieme tutto ciò che abbiamo visto in un esempio end-to-end: recuperare una lista di utenti dall'API pubblica di JSONPlaceholder, gestire gli errori a ogni livello e visualizzare i risultati nel DOM.

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <title>Dashboard Utenti</title>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    .errore { color: #c0392b; background: #fdecea; padding: 1rem; border-radius: 4px; }
    .caricamento { color: #7f8c8d; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { text-align: left; padding: 0.5rem 1rem; border-bottom: 1px solid #ddd; }
    th { background: #f4f6f8; }
    button { padding: 0.5rem 1.5rem; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Dashboard Utenti</h1>
  <button id="btnCarica">Carica Utenti</button>
  <div id="stato"></div>
  <div id="contenuto"></div>

  <script>
    const statoEl = document.getElementById('stato');
    const contenutoEl = document.getElementById('contenuto');

    // Recupera e valida i dati dall'API
    const fetchUtenti = async () => {
      let response;

      try {
        response = await fetch('https://jsonplaceholder.typicode.com/users');
      } catch (erroreRete) {
        throw new Error(`Errore di rete: impossibile contattare il server. (${erroreRete.message})`);
      }

      if (!response.ok) {
        throw new Error(`Il server ha risposto con errore ${response.status}: ${response.statusText}`);
      }

      let utenti;
      try {
        utenti = await response.json();
      } catch {
        throw new SyntaxError('La risposta ricevuta non è JSON valido.');
      }

      if (!Array.isArray(utenti) || utenti.length === 0) {
        throw new TypeError('Il formato dei dati ricevuti non è quello atteso.');
      }

      return utenti;
    };

    // Costruisce la tabella HTML con i dati
    const renderTabella = (utenti) => {
      const righe = utenti.map(u => `
        <tr>
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.company?.name ?? 'N/D'}</td>
          <td>${u.address?.city ?? 'N/D'}</td>
        </tr>
      `).join('');

      return `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Azienda</th>
              <th>Città</th>
            </tr>
          </thead>
          <tbody>${righe}</tbody>
        </table>
        <p><small>Dati ricevuti: ${JSON.stringify(utenti.length)} record</small></p>
      `;
    };

    // Gestore del click sul pulsante
    document.getElementById('btnCarica').addEventListener('click', async () => {
      statoEl.innerHTML = '<p class="caricamento">Caricamento in corso...</p>';
      contenutoEl.innerHTML = '';

      try {
        const utenti = await fetchUtenti();
        statoEl.innerHTML = '';
        contenutoEl.innerHTML = renderTabella(utenti);
      } catch (error) {
        statoEl.innerHTML = `<div class="errore"><strong>Errore:</strong> ${error.message}</div>`;
      }
    });
  </script>
</body>
</html>
```

Questo esempio mostra una serie di buone pratiche:

- La funzione `fetchUtenti` si occupa esclusivamente del recupero e della validazione dei dati, lanciando errori specifici per ogni caso d'errore.
- Il gestore del click gestisce tutti gli errori in un unico `catch` e aggiorna la UI di conseguenza.
- Il messaggio di stato ("Caricamento in corso...") viene mostrato prima dell'operazione asincrona e rimosso al termine.

## Esercizi

### Esercizio 1: parseConfigFile

Crea una funzione `parseConfigFile(jsonString)` che usa `JSON.parse` in un `try/catch` e ritorna l'oggetto parsato. Se il JSON non è valido, deve lanciare un errore personalizzato con un messaggio che indichi chiaramente il problema e includa il messaggio originale dell'errore di parsing.

```javascript
class ErroreConfigurazioneNonValida extends Error {
  constructor(messaggioOriginale) {
    super(`Il file di configurazione non contiene JSON valido. Dettaglio: ${messaggioOriginale}`);
    this.name = 'ErroreConfigurazioneNonValida';
  }
}

const parseConfigFile = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new ErroreConfigurazioneNonValida(error.message);
  }
};

// Test
try {
  const config = parseConfigFile('{"host": "localhost", "porta": 5432}');
  console.log('Configurazione caricata:', config);
} catch (error) {
  console.error(error.name, '-', error.message);
}

try {
  const config = parseConfigFile('{host: localhost}'); // JSON non valido
  console.log('Configurazione caricata:', config);
} catch (error) {
  console.error(error.name, '-', error.message);
}
```

### Esercizio 2: fetchConRetry

Scrivi una funzione `fetchConRetry(url, tentativi)` che usa `async/await` per effettuare una richiesta `fetch`. In caso di errore (di rete o HTTP), la funzione deve riprovare automaticamente fino al numero massimo di tentativi specificato. Se tutti i tentativi falliscono, deve lanciare l'ultimo errore ricevuto.

```javascript
const fetchConRetry = async (url, tentativi = 3) => {
  let ultimoErrore;

  for (let tentativo = 1; tentativo <= tentativi; tentativo++) {
    try {
      console.log(`Tentativo ${tentativo} di ${tentativi}...`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Errore HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      ultimoErrore = error;
      console.warn(`Tentativo ${tentativo} fallito: ${error.message}`);

      // Non aspettare dopo l'ultimo tentativo
      if (tentativo < tentativi) {
        // Attesa esponenziale: 500ms, 1000ms, 2000ms...
        const attesa = 500 * Math.pow(2, tentativo - 1);
        await new Promise(resolve => setTimeout(resolve, attesa));
      }
    }
  }

  throw new Error(`Tutti i ${tentativi} tentativi falliti. Ultimo errore: ${ultimoErrore.message}`);
};

// Test con un endpoint valido
fetchConRetry('https://jsonplaceholder.typicode.com/posts/1')
  .then(data => console.log('Dati ricevuti:', data.title))
  .catch(error => console.error('Errore finale:', error.message));

// Test con un endpoint non esistente (simulazione errore)
fetchConRetry('https://jsonplaceholder.typicode.com/inesistente/999', 2)
  .then(data => console.log('Dati ricevuti:', data))
  .catch(error => console.error('Errore finale:', error.message));
```

### Esercizio 3: ApiClient

Crea una classe `ApiClient` con un metodo `get(url)` che centralizza la logica di fetch, verifica `response.ok`, esegue il parsing JSON e gestisce i diversi tipi di errore (rete, HTTP 404, HTTP 500, JSON non valido) con messaggi specifici e informativi.

```javascript
class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async get(percorso) {
    const url = `${this.baseUrl}${percorso}`;
    let response;

    // Gestione errori di rete
    try {
      response = await fetch(url);
    } catch (erroreRete) {
      throw new Error(`Errore di connessione verso "${url}": ${erroreRete.message}`);
    }

    // Gestione errori HTTP specifici
    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error(`Richiesta non valida (400) per "${url}". Controlla i parametri inviati.`);
        case 401:
          throw new Error(`Non autenticato (401): accesso a "${url}" richiede credenziali valide.`);
        case 403:
          throw new Error(`Accesso negato (403): non hai i permessi per accedere a "${url}".`);
        case 404:
          throw new Error(`Risorsa non trovata (404): l'endpoint "${url}" non esiste.`);
        case 429:
          throw new Error(`Troppe richieste (429): hai superato il rate limit dell'API.`);
        case 500:
          throw new Error(`Errore interno del server (500) su "${url}". Riprova più tardi.`);
        case 503:
          throw new Error(`Servizio non disponibile (503): il server è temporaneamente offline.`);
        default:
          throw new Error(`Errore HTTP ${response.status} (${response.statusText}) su "${url}".`);
      }
    }

    // Gestione errori di parsing JSON
    try {
      return await response.json();
    } catch (erroreJSON) {
      throw new SyntaxError(`La risposta di "${url}" non è JSON valido: ${erroreJSON.message}`);
    }
  }
}

// Utilizzo
const client = new ApiClient('https://jsonplaceholder.typicode.com');

const eseguiRichieste = async () => {
  // Richiesta valida
  try {
    const utente = await client.get('/users/1');
    console.log('Utente:', utente.name, '-', utente.email);
  } catch (error) {
    console.error('Errore:', error.message);
  }

  // Richiesta a risorsa inesistente (404)
  try {
    const dati = await client.get('/risorsainesistente/42');
    console.log('Dati:', dati);
  } catch (error) {
    console.error('Errore:', error.message);
  }

  // Lista di post con gestione integrata
  try {
    const posts = await client.get('/posts');
    console.log(`Ricevuti ${posts.length} post. Primo titolo: "${posts[0].title}"`);
  } catch (error) {
    console.error('Errore nel caricamento dei post:', error.message);
  }
};

eseguiRichieste();
```
