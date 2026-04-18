---
sidebar_position: 10
---

# HTTP

Node.js è stato creato pensando principalmente ai web server. Utilizzando i moduli core di Node.js possiamo costruire un semplice server HTTP 
in pochi secondi, riuscendo a personalizzarlo come più ci piace. In questo capitolo vedremo come utilizzare le API core di Node.js 
per creare un semplice server HTTP, e vedremo come interagire ad un basso livello con i protocolli web. Inizieremo effettuando richieste HTTP
(HyperText Transfer Protocol), creando un server HTTP e imparando come gestire le richieste POST e GET. È importante comprendere come Node.js
interagisce con i protocolli Web sottostanti, poiché questi protocolli Web e concetti fondamentali costituiscono la base della maggior 
parte delle applicazioni Web del mondo reale.

> HTTP è un protocollo stateless originariamente progettato per facilitare la comunicazione tra browser Web e server. Le ricette in 
questo capitolo avranno una grande enfasi su come gestire e inviare richieste HTTP. Sebbene le ricette non richiedano una profonda 
comprensione di come funziona HTTP, varrebbe la pena leggere una panoramica di alto livello se sei completamente nuovo al concetto. 
I documenti [Web MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview) forniscono una panoramica di HTTP.

## URL

Fino a questo punto abbiamo esplorato molti concetti ed aspetti importanti di Node.js, ma ancora non abbiamo visto come realizzare 
un'applicazione client server. Quando parliamo di un'architettura client server facciamo riferimento ad un browser 
che necessita di informazioni il quale effettua una richiesta ad un server per ottenerle. 
Queste informazioni possono essere di diversi tipi: JSON, html, immagini, CSS e così via. Il client, per ottenere le informazioni 
di cui necessita, effettua una richiesta HTTP. Per farlo però bisogna conoscere l'indirizzo della risorsa e quell'indirizzo 
si chiama URL. Un URL è composto da diverse parti, alcune obbligatorie e altre facoltative. Ecco di seguito un esempio di URL:

![](./img/ch-10/01.png)

Analizziamo ora un URL completo e descriviamo ogni sua parte:

* *https*: questa parte dell'URL rappresenta lo schema. Indica il protocollo che il browser deve utilizzare per richiedere la risorsa.
* *user:pass*: questa parte identifica il nome utente e la password per effettuare un autenticazione basata sul protocollo HTTP.
* *sub.example.com*: questa parte rappresenta un nome di dominio, ma può essere utilizzato anche un indirizzo IP.
* *8080*: indica la "porta" tecnica utilizzata per accedere alle risorse sul server web. Di solito viene omesso se il server web utilizza le porte standard del protocollo HTTP (80 per HTTP e 443 per HTTPS) per concedere l'accesso alle proprie risorse. In altri casi è obbligatoria.
* */p/a/t/h*: indica il percorso della risorsa sul server Web. Agli albori del Web, un percorso come questo rappresentava una posizione fisica di file sul server Web.
* *?query=string*: parametri sono un elenco di coppie chiave/valore separate dal simbolo &. Il server Web può utilizzare questi parametri per fare cose extra prima di restituire la risorsa. L'intera stringa rappresenta una _query string_.
* *#hash*: è un'ancora per un'altra parte della risorsa richiesta. Un'ancora rappresenta una sorta di "segnalibro" all'interno della risorsa, che fornisce al browser le indicazioni per mostrare il contenuto che si trova in quel punto "segnalibro".

Il modulo core di Node.js `url` esporta le seguenti proprietà:

```
{
  Url: [Function: Url],
  parse: [Function: urlParse],
  resolve: [Function: urlResolve],
  resolveObject: [Function: urlResolveObject],
  format: [Function: urlFormat],
  URL: [class URL],
  URLSearchParams: [class URLSearchParams],
  domainToASCII: [Function: domainToASCII],
  domainToUnicode: [Function: domainToUnicode],
  pathToFileURL: [Function: pathToFileURL],
  fileURLToPath: [Function: fileURLToPath]
}
```

In particolare la classe `URL`, è molto utile per analizzare i vari pezzi che compongono un url. Facciamo un piccolo esempio:

```javascript
import { URL } from 'node:url'

const url = new URL('https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash')

console.log(url)
```

Questo semplice script stamperà a video l'oggetto completo in ogni sua parte:

```
URL {
  href: 'https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash',
  origin: 'https://sub.example.com:8080',
  protocol: 'https:',
  username: 'user',
  password: 'pass',
  host: 'sub.example.com:8080',
  hostname: 'sub.example.com',
  port: '8080',
  pathname: '/p/a/t/h',
  search: '?query=string',
  searchParams: URLSearchParams { 'query' => 'string' },
  hash: '#hash'
}
```

La proprietà `searchParams` è di sola lettura, ma l'oggetto `URLSearchParams` che fornisce può essere utilizzato per
modificare l'istanza dell'URL; per sostituire tutti i parametri di query dell'URL, utilizzare il setter url.search. 
Per i dettagli, vedere la [documentazione di URLSearchParams](https://nodejs.org/dist/latest-v16.x/docs/api/url.html#url_class_urlsearchparams).

## Creare un server HTTP

I programmi e le applicazioni spesso necessitano di ottenere dati da un'altra fonte o server. Nello sviluppo web moderno, ciò si 
ottiene generalmente inviando una richiesta HTTP GET all'origine o al server. Allo stesso modo, un'applicazione o un programma 
potrebbe anche dover inviare dati ad altre origini o server. Ciò si ottiene generalmente inviando una richiesta HTTP POST 
contenente i dati all'origine o al server di destinazione.

Oltre a essere utilizzati per creare server HTTP, i moduli core `http` ed `https` di Node.js espongono API che possono essere 
utilizzate per inviare richieste ad altri server. Il modulo `http` si basa modulo `net` (la libreria TCP di Node) che a sua 
volta interagisce con una libreria C interna chiamata *libuv*. La libreria libuv C gestisce l'input/output della socket di rete, 
passando i dati tra il livello C e il livello JavaScript. In questo paragrafo, utilizzeremo il modulo `http` sia per inviare che 
per gestire richieste in GET e POST. Sostanzialmente il nostro server si occuperà di gestire una lista di utenti, ognuno dei 
quali ha le seguenti proprietà:

* *id*: un numero intero che identifica l'utente in modo univoco.
* *name*: il nome dell'utente.
* *surname*: il cognome dell'utente.
* *age*: un numero intero che rappresenta l'età dell'utente.

Per mantenere le cose interessanti, il nostro server sarà in realtà un server HTTP RESTful, quindi creiamo una directory 
`rest-server`, contenente un file `index.js`. Iniziamo importando il modulo `http` e dichiariamo alcune variabili:

```javascript
import http from 'node:http'

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000

const dataBase = [{ id: Date.now(), name: 'Marty', surname: 'McFly', age: 53 }]
```

In questa prima fase abbiamo importato il modulo `http`, che ci consetirà a breve di gestire le richieste HTTP, e abbiamo 
definito un host e una porta a cui il nostro server HTTP si collegherà. Una ulteriore variabile è `dataBase` che contiene un 
unico utente. Utilizzeremo questa variabile per simulare il salvataggio e la lettura in un database. Ora creiamo il nostro server:

```javascript
import http from 'node:http'

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

const dataBase = [{ id: Date.now(), name: 'Marty', surname: 'McFly', age: 53 }]

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST')
    return error(res, 405)
  
  if (req.method !== 'GET' && req.url === '/users')
    return getUsers(req, res)

  if (req.method !== 'POST' && req.url === '/user')
    return saveUsers(req, res)
  
  error(res, 404)
})

server.listen(port, host)
```

Quando invochiamo `http.createServer`, viene restituito un oggetto che rappresenta il server HTTP. Chiamiamo immediatamente 
il metodo listen sull'oggetto `server` che indica al modulo `http` di ascoltare i dati in arrivo sulla porta `3000` ed host `0.0.0.0`. 
Questa è una buona pratica poiché consente a noi (o ad un orchestratore) di inserire le impostazioni desiderate nel nostro server 
al momento dell'esecuzione.

Il metodo `http.createServer` accetta una funzione; ed è proprio lei che getisce tutte le richieste in input. Ogni volta che i dati 
vengono ricevuti a livello di socket di rete, se i dati vengono tradotti con successo in una richiesta HTTP il modulo `http` crea un 
oggetto che rappresenta la richiesta (`req`) e la risposta (`res`) e quindi invoca la nostra funzione fornita come parametro, 
passandogli questi due oggetti.

Il nostro gestore richieste imposta i percorsi logici in base alle proprietà `req.url` e `req.method`. La prima cosa che facciamo 
è controllare `req.method`, che contiene il metodo HTTP. Nel nostro caso vogliamo gestire solo le richieste `GET` e `POST`, 
quindi qualsiasi cosa diversa da queste due riceve una risposta `405` (*Method Not Allowed*). 

Infine, se nessun controllo condizionale corrisponde, viene invocata la funzione di errore finale, che invia un codice di stato HTTP 
404 (*Not Found*). La funzione di errore utilizza le costanti `http.STATUS_CODES` per associare i codici HTTP alle loro 
descrizioni equivalenti.

Nel nostro gestore, facciamo riferimento ad altre tre funzioni, `error`, `getUsers` e `saveUsers`. Quindi scriviamo queste tre funzioni. 
La prima è `saveUser`:

```javascript
function saveUser (req, res) {
  if (req.headers["content-type"] !== 'application/json')
    return error(415, res)

  let body = []
  req.on('data', chunk => {
    body.push(chunk)
  })

  req.on('end', () => {
    body = JSON.parse(Buffer.concat(body).toString())
    
    if (!body.name)
      return error(res, 400, 'Field name required')

    if (!body.surname)
      return error(res, 400, 'Field surname required')

    if (!body.age)
      return error(res, 400, 'Field age required')

    const newUser = Object.assign({}, {
      id: Date.now(),
      ...body
    })

    dataBase.push(newUser)
    res.end(JSON.stringify(newUser))
  })
}
```

Quando si riceve una richiesta `POST` o `PUT`, il corpo della richiesta è importante per l'applicazione. Ottenere i dati dal corpo 
della richiesta è un po' più complicato che accedere alle intestazioni. L'oggetto richiesta passato a un gestore implementa 
l'interfaccia `ReadableStream`. Questo stream può essere ascoltato o reindirizzato altrove, proprio come qualsiasi altro stream. 
Possiamo prelevare i dati direttamente dal flusso ascoltando gli eventi `data` ed `end` del flusso. Il pezzo emesso in ogni evento `data` 
è ovviamente un'istanza `Buffer`. Se sai che saranno dati stringa, la cosa migliore da fare è raccogliere i dati in un array.

Nel nostro esempio richiediamo che la nostra richiesta contenga un body in formato JSON. Nel caso in cui non sia così viene restituito 
un errore 415 (*Unsupported Media Type*). Una volta ricevuti tutti i dati, validiamo il body ricevuto in POST. In particolare vogliamo che 
tutti i dati dell'utente che si intende salvare siano compilati. Nel caso in cui uno dei parametri inviati non è compilato, 
restiuiamo un errore 400 (*Bad Request*). Se non si è verificata nessuna delle condizioni appena descritte i dati vengono salvati nell'array 
`dataBase` e i dati del nuovo utente (compresa la proprietà `id`) vengono restituite al client.

> Gestire le richieste PUT e POST può sembrare noioso, e in molti casi lo è. Fortunatamente, ci sono moduli come 
*[concat-stream](https://www.npmjs.com/package/concat-stream)* e *[body](https://www.npmjs.com/package/body)* che possono aiutare a 
nascondere parte di questa logica. È importante avere una buona comprensione di cosa sta succedendo prima di intraprendere quella strada, 
ed è per questo che state leggendo questo libro.

La seconda funzione a cui facciamo riferimento è `getUsers`:

```javascript
function getUsers (req, res) {
  res.end(JSON.stringify(dataBase))
}
```

Questa funzione altro non fa che restituire la lista degli utenti contenuti nell'array `dataBase` in formato JSON. Infine la terza funzione è `error`. 

```javascript
function error (res, code, message = '') {
  res.statusCode = code
  res.end(`{"error": "${http.STATUS_CODES[code]}. ${message}"}`)
}
```

La funzione `error` restituisce la descrizione associata al codice di errore passatogli in input. Molto spesso però solo il messaggio 
di errore non è abbastanza. Quindi se specificato, a questo messaggio verrrà concatenato un messaggio di errore più esplicativo rispetto 
a quello di default.

Ora possiamo provare il nostro server. Avviamo il nostro server in questo modo:

```
$ node index.js
```

Quindi, in un altro terminale, possiamo usare curl per controllare i percorsi:

```
$ curl http://localhost:3000/users
[{"id":1625672181384,"name":"Marty","surname":"McFly","age":53}]
```

```
$ curl http://localhost:3000/fake-url
{"error": "Not Found."}
```

```
$ curl --location --request POST 'http://locahost:3000/user' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Emmett L.",
    "surname": "Brown",
    "age": 90
}'
{"id":1625672484875,"name":"Emmett L.","surname":"Brown","age":90}
```

## Gestire il routing con find-my-way

Il routing definisce il modo in cui le richieste client vengono gestite dagli endpoint dell'applicazione. Esistono diversi modi per gestire 
il routing nelle applicazioni Node.js. Il modo più semplice (ma allo stesso tempo anche quello più complicato) è sicuramente quello di 
gestire le rotte manualmente, esattamente come abbiamo fatto nel precedente paragrafo. Esistono però molti moduli npm tra cui 
[find-my-way](https://www.npmjs.com/package/find-my-way) che fortunatamente ci aiutano e non poco. Questo modulo è famoso per la sua velocità: 
_"Un router HTTP incredibilmente veloce"_. Un'istanza di `find-my-way` espone un metodo `on` utile a registrare nuove rotte. 
Il metodo ha la seguente firma:

```javascript
on(method, path, [opts], handler, [store])
```

Questo metodo registra una nuova rotta. Vediamo come possiamo creare un piccolo web server HTTP con poche righe di codice:

```javascript
import FindMyWay from 'find-my-way'
import http from 'node:http'

const router = FindMyWay()

router.on('GET', '/hello', (req, res) => res.end('{"message": "Hello, World!"}'))
router.on('GET', '/goodbye', (req, res) => res.end('{"message": "Good Bye, World!"}'))

const server = http.createServer((req, res) => {
  router.lookup(req, res)
})

server.listen(3000)
```

Una volta definite le rotte, basta utilizzare il metodo `lookup` nell'handler che gestisce le richieste del nostro server. In pratica questo metodo 
utilizza `req.method` e `req.url` ed effettua una ricercca tra le rotte registrate in precedenza per invocarne il rispettivo handler. 
È possibile definire le nostre rotte anche nel seguente modo:

```javascript
router.get('/hello', (req, res) => res.end('{"message": "Hello, World!"}'))
router.get('/goodbye', (req, res) => res.end('{"message": "Good Bye, World!"}'))
```

È possibile specificare una serie di opzioni quando creiamo un istanza di `find-my-way`. Per esempio è possibile specificare una rotta di 
default nel caso in cui l'url che viene richiesto non esiste: 

```javascript
...
const router = FindMyWay({
  defaultRoute: (req, res) => {
    res.statusCode = 404
    res.send(`{"error": "${http.STATUS_CODES[res.statusCode]}. ${message}"}`)
  }
})
...
```

Potrebbe capitare che un URL venga formattato male, per esempio `/%hello`, in questo caso `find-my-way` invocherà `defaultRoute` 
a meno che non venga specificata l'opzione `onBadUrl`:

```javascript
...
const router = FindMyWay({
  defaultRoute: (req, res) => {
    res.statusCode = 404
    res.send(`{"error": "${http.STATUS_CODES[res.statusCode]}. ${message}"}`)
  },
  onBadUrl: (path, req, res) => {
    res.statusCode = 400
    res.send(`{"error": "${http.STATUS_CODES[res.statusCode]}. ${message}"}`)
  }
})
...
```

Esistono altre opzioni molto interessanti che è possibile specificare quando creiamo un'istanza di `find-my-way`:

* *`ignoreTrailingSlash`*: è un valore booleano che se impostato a `true` ignora gli slash finali nei path specificati.
* *`maxParamLength`*: è un valore intero che imposta la lunghezza per i parametri nei percorsi parametrici. Il valore predefinito è 100 caratteri. Se viene raggiunto il limite di lunghezza massima, verrà invocato `defaultRoute`.
* *`allowUnsafeRegex`*: quando si usa una rotta basata su espressioni regolari, `find-my-way` rileva automaticamente qualle espressioni regolari pericolose. Se si vuole disabilitare questo comportamento basta impostare `allowUnsafeRegex` a `true`.
* *`caseSensitive`*: impostando questo valore a `false` non verrà fatta alcuna distinzione tra lettere maiuscole e minuscole quando viene invocato un URL. Di default questo valore è `true`.

### Aggiungere vincoli alle rotte

Una funzionalità molto interessante di `find-my-way` è quella di poter utilizzare lo stesso path aggiungendo regole sulle rotte. 
Per esempio, è possibile supportare versioni differenti della stessa rotta basandosi su una strategia di versioning, oppure rendere 
disponibile una specifica rotta solo per un determinato host. Aggiungere un vincolo su una rotta è molto semplice, basta passare alla 
rotta un ulteriore oggetto con una proprietà `contraints`:

```javascript
findMyWay.on('GET', '/', { constraints: { version: '1.0.2' } }, (req, res) => {
  // L'handler verrà invocato solo quando nell'header della richiesta
  // è presente la proprietà Accept-Version header con una versione 
  // compatibile alla 1.0.2, o 1.x, o 1.0.x
})

findMyWay.on('GET', '/', { constraints: { host: 'example.com' } }, (req, res) => {
  // Accetta richieste solo dall'host example.com
})
```

È possibile combinare più vincoli, basta ricordare che i vincoli vengono gestiti in AND e non in OR. Oltre a vincoli semplici come quelli 
appena mostrati, `find-my-way` consente di specificare vincoli personalizzati. Date uno sguardo alla 
[documentazione ufficiale](https://github.com/delvedor/find-my-way#custom-constraint-strategies) per ulteriori approfondimenti.

## Rotte parametriche

Per registrare rotte parametriche basta utilizzare i due punti `:` prima del nome del parametro:

```javascript
router.on('GET', '/user/:id', (req, res, params) => {}))
router.on('GET', '/user/:id/:token', (req, res, params) => {}))
```

Anche le wildcard sono supportate. Per esempio se volessimo intercettare tutte le richieste `GET` per tutti i path che iniziano per `/user`:

```javascript
router.on('GET', '/user/*', (req, res, params) => {}))
```

Sono supportati anche i path che fanno utilizzo di espressioni regolari, ma attenzione, le `RegExp` sono molto costose in termini di 
performance. Se si desidera dichiarare un path utilizzando un'espressione regolare, è necessario inserirla tra parentesi tonde dopo il nome del parametro. 
Per esempio:

```javascript
router.on('GET', '/user/:username(^[a-z]{10}$)', (req, res, params) => {}))
```

### Un esempio pratico

Riprendiamo ora l'esempio della gestione degli utenti fatto in precedenza, utilizzando `find-myh-way` per gestire il routing. 
Iniziamo creando una directory che conterrà tutto il necessario per il nostro progetto: `find-my-way-example`. Una volta creata inizializziamo il nostro 
progetto digitando i seguenti comandi: 

```
$ npm init -y
npm init -y
Wrote to /Users/davidedantonio/nodejs-in-pillole/find-my-way-example/package.json:

{
  "name": "find-my-way-example",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": ""
}


npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN find-my-way-example@1.0.0 No description
npm WARN find-my-way-example@1.0.0 No repository field.

+ find-my-way@4.3.3
added 6 packages from 5 contributors and audited 6 packages in 1.665s
found 0 vulnerabilities
```

Ora che il nostro progetto è pronto creiamo un file `index.js` ed iniziamo a dichiarare tutto ciò di cui abbiamo bisogno:

```javascript
import http from 'node:http'
import FindMyWay from 'find-my-way'

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000

const dataBase = [{ id: Date.now(), name: 'Marty', surname: 'McFly', age: 53 }]
```

È cambiato poco rispetto alla dichiarazione delle variabili fatte in precedenza, tranne per il fatto che abbiamo importato il 
modulo `find-my-way`. Allo stesso modo le funzioni `error`, `saveUser` e `getUsers` non avranno bisogno di ulteriori modifiche:

```javascript
function getUsers (req, res) {
  res.end(JSON.stringify(dataBase))
}

function saveUser (req, res) {
  if (req.headers["content-type"] !== 'application/json') {
    error(415, res);
    return;
  }

  let body = []
  req.on('data', chunk => {
    body.push(chunk)
  })

  req.on('end', () => {
    body = JSON.parse(Buffer.concat(body).toString())
    
    if (!body.name) {
      return error(res, 400, 'Field name required')
    }

    if (!body.surname) {
      return error(res, 400, 'Field surname required')
    }

    if (!body.age) {
      return error(res, 400, 'Field age required')
    }

    const newUser = Object.assign({}, {
      id: Date.now(),
      ...body
    })

    dataBase.push(newUser)
    res.end(JSON.stringify(newUser))
  })
}

function error (res, code, message = '') {
  res.statusCode = code
  res.end(`{"error": "${http.STATUS_CODES[code]}. ${message}"}`)
}
```

Ora che abbiamo a disposizione tutto ciò di cui abbiamo bisogno vediamo quali sono i veri cambiamenti che effettuiamo rispetto all'esempio 
fatto nei paragrafi precedenti. La prima cosa di cui ci occupiamo è quella di creare un'istanza di `FindMyWay`: 

```javascript
const router = FindMyWay({
  defaultRoute: (req, res) => error(res, 404)
})
```

Il parametro `defaultRoute` in pratica sosituisce l'ultima istruzione della funzione di callback passata a `createServer` nell'esempio precedente, ossia:

```javascript
...
  if (req.method === 'POST' && req.url === '/user')
    return saveUser(req, res)
  
  error(res, 404)
...
```

La nostra istanza di `FindMyWay` è pronta possiamo dichiarare le rotte `GET /users` e `POST /user`. Per farlo utilizziamo il metodo 
`on` al quale passeremo il metodo che vogliamo utilizzare per la nostra rotta, quindi `GET` o `POST`, e come secondo parametro l'handler 
che gestirà la richiesta, e quindi `getUser` o `saveUser`:

```javascript
router.on('GET', '/users', getUsers)
router.on('POST', '/user', saveUser)
```

Ora che la configurazione del nostro router è terminata non resta che creare il nostro server HTTP e utilizzare il metodo `lookup`, 
che si occuperà di inoltrare tutte le richieste effettuate al nostro server, all'handler corretto:

```javascript
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/fancy+json')
  router.lookup(req, res)
})
```

#### Aggiungiamo qualche rotta

Finora abbiamo gestito solo due metodi della nostra piccola API. Il primo che si occupa di restituire la lista di tutti gli utenti mentre 
il secondo si occupa di salvare un nuovo utente. Implementiamo ora altri tre metodi:

- `GET /user/:id`: il quale si occuperà di restituire i dati dell'utente con l'id passato come parametro.
- `DELETE /user/:id`: che si occuperà di eliminare i dati dell'utente con l'id passato come parametro.
- `PUT /user/:id`: che effettuerà l'aggiornamento dei dati dell'utente con l'id passato come parametro.

##### Recuperare i dati di un utente

Iniziamo dal metodo `GET /user/:id`. Nel nostro esempio il nostro database è un array, quindi per ricercare il nostro utente basta utilizzare il 
metodo `find` nel seguente modo:

```javascript
function getUser(req, res, params) {
  const { id } = params
  const user = dataBase.find(user => user.id === parseInt(id))
  
  if (!user) {
    error(res, 404, 'User not found')
    return
  }

  res.end(JSON.stringify(user))
}
```

La funzione è molto semplice, recuperiamo il parametro `:id` che identifica l'identificativo dell'utente di cui si desiderano i dati, 
dai parametri della rotta. Successivamente utilizziamo la funzione `find` di JavaScript per ricercare l'utente all'interno del nostro array 
di utenti. Nel caso in cui la ricerca non produce risultati verrà restituito un *404* (*Not Found*), mentre in caso di esito positivo verranno 
restituiti i dati dell'utente. Affinché la nostra funzione sia utilizzabile basta aggiungerla alla configurazione del nostro router nel seguente modo:

```javascript
router.on('GET', '/user/:id', getUser)
```

##### Eliminiamo un utente

Ora che abbiamo visto come restituire i dati di un utente, vediamo come eliminare un utente dal nostro database. La funzione che si 
occuperà dell'eliminazione è la seguente:

```javascript
function removeUser(req, res, params) {
  const { id } = params
  const user = dataBase.find(user => user.id === parseInt(id))
  
  if (!user) {
    error(res, 404, 'User not found')
    return
  }

  const index = dataBase.indexOf(user)
  dataBase.splice(index, 1)
  res.statusCode = 204
  res.end()
}
```

Anche in questo caso ricerchiamo l'utente utilizzando l'identificativo inviato come parametro nell'URL e, nel caso in cui non viene trovato 
nessun utente, il metodo resituisce un *404* (*Not Found*), mentre nel caso in cui l'utente viene trovato lo eliminiamo dal nostro database 
(nel nostro caso utilizziamo il metodo `slice` di JavaScript), e restituiamo un *204* (*No Content*). Anche in questo caso affinché 
la funzione venga utlizzata dobbiamo aggiungerla alla configurazione del nostro router:

```
router.on('DELETE', '/user/:id', removeUser)
```

##### La modifica di un utente

Per effettuare la modifica di un utente possiamo riutilizzare la funzione `saveUser` utilizzata per la creazione. Dobbiamo però 
apportare alcune modifiche a questa funzione in quanto per ora si occupa solo di creare un utente. Avendo a disposizione il parametro `params` 
possiamo capire se siamo in creazione o in modifica se quest'ultimo ha una proprietà `id`. Nel caso in cui questa proprietà è presente il 
metodo si occuperà della modifica piuttosto che della creazione. Diamo uno sguardo al codice modificato:

```javascript
function saveUser (req, res, params) { // Aggiungiamo anche il parametro params
  if (req.headers["content-type"] !== 'application/json') {
    error(res, 415);
    return;
  }

  let body = []
  req.on('data', chunk => {
    body.push(chunk)
  })

  req.on('end', () => {
    body = JSON.parse(Buffer.concat(body).toString())
    
    if (!body.name) {
      return error(res, 400, 'Field name required')
    }

    if (!body.surname) {
      return error(res, 400, 'Field surname required')
    }

    if (!body.age) {
      return error(res, 400, 'Field age required')
    }

    const user = {}

    // In questo bisogna creare un utente
    if (!params.id) {
      Object.assign(user, {
        id: Date.now(),
        ...body
      })

      dataBase.push(user)
      res.end(JSON.stringify(user))
    } else { // Bisogna modificare un utente
      const { id } = params
      const user = dataBase.find(user => user.id === parseInt(id))
     
      // Se l'utente non esiste ritorno 404
      if (!user) {
        error(res, 404, 'User not found')
        return
      }

      // Aggiorno i dati dell'utente
      const index = dataBase.indexOf(user)
      Object.assign(user, {
        ...body
      })

      // Salvo i dati nel mio database
      dataBase.splice(index, 1, user)
      res.end(JSON.stringify(user))
    }
  })
}
```

Le modifiche apportate alla funzione `saveUser` fanno si che se il metodo riceve il parametro `params` con una proprietà 
`id` propriamente popolata, il metodo ricerca l'utente all'interno del nostro database e ne effettua l'aggiornamento. Nel 
caso in cui l'utente non viene trovato all'interno del nostro database verrà restituito un *404* (*Not Found*) come risposta. 
Nel caso in cui il parametro `id` non è presente nella richiesta allora i dati dell'utente verranno inseriti all'interno del nostro 
database. A questo punto tutto ciò che rimane da fare è aggiungere la regola di routing nel seguente modo:

```javascript
router.on('PUT', '/user/:id', saveUser)
```

## Effettuare richieste http

Molto spesso i programmi e le applicazioni hanno la necessità di ottenere dati da altre sorgenti o server. Questo solitamente si traduce 
nell'effettuare richieste HTTP alla risorsa o al server. Allo stesso modo un programma o un'applicazione spesso ha la necessità di 
inviare dati ad un'altra risorsa o ad un server remoto. Anche in questo esempio tutto si traduce nell'effettuare una richiesta HTTP POST che 
contiene i dati che si vogliono inviare.

Adesso vedremo come creare una richiesta HTTP utilizzando il modulo `http` di Node.js per inviare una richiesta HTTP prima 
in GET e successivamente in POST.

```javascript
import http from 'node:http'

const req = http.request('http://example.com', res => {
  res.pipe(process.stdout)
})

req.end()
```

Il modulo core di Node.js `http` espone un metodo `request`, il quale ci restituisce un oggetto `http.ClientRequest`. 
Questo oggetto, opportunamente configurato, ci consente di effettuare una richiesta HTTP GET all'URL `http://example.com`. 
Nell'esempio è stato invocato il metodo `req.end()`. Si deve sempre invocare `req.end()` per inviare effettivamente 
la richiesta alla risorsa desiderata. Eseguendo questo script, se la richiesta HTTP è andata a buon fine allora vedrete la 
rappresentazione HTML di `http://example.com` stampata sullo standard output.

![](./img/ch-10/02.png)

Se date uno sguardo alla [documentazione ufficiale](https://nodejs.org/api/http.html#http_http_request_options_callback) di 
`http.request` noterete che è possibile passare un ulteriore parametro opzionale `options` per specificare molte opzioni sulla nostra richiesta. 
Tra le tante opzioni abbiamo a disposizione `method`, che ci consente di impostare che tipologia di richiesta desideriamo effettuare 
(POST, GET, PUT, DELETE ecc.). Di default questa opzione è impostata GET, di conseguenza nell'esempio mostrato in precedenza non 
è necessario specificare il parametro `options`.

Vediamo ora come creare una richiesta POST sempre utilizzando `http.request`. La prima cosa da fare è sicuramente quella di 
definire i dati che vogliamo inviare con la richiesta. Per farlo, definiamo una variabile denominata payload contenente una 
rappresentazione *JavaScript Object Notation* (*JSON*) dei nostri dati:

```javascript
const payload = JSON.stringify({
  name: 'Davide',
  job: 'Full Stack Developer'
})
```

Un ulteriore passo da fare prima di inviare la nostra richiesta HTTP è quella di creare il nostro oggetto `options` che 
desideriamo inviare insieme alla nostra richiesta HTTP POST. Invieremo questi dati a `http://postman-echo.com`. 
L'oggetto avrà la seguente forma: 

```javascript
const options = {
  host: 'postman-echo.com',
  path: '/post',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}
```

:::tip
[Postman](http://postman.com) è una piattaforma per lo sviluppo di API e fornisce un'app client *REST* (*Representational State 
Transfer*) che è possibile scaricare da utilizzare per inviare richieste HTTP. Postman fornisce anche un servizio denominato 
*Postman Echo*, che fornisce un endpoint a cui è possibile inviare le richieste HTTP per il test. 
Per maggiori informazioni consultate l'indirizzo: [https://docs.postman-echo.com/?version=latest](https://docs.postman-echo.com/?version=latest).
:::

Per inviare la nostra richiesta HTTP, basterà aggiungere al nostro script il seguente codice:

```javascript
import http from 'node:http'

const payload = JSON.stringify({
  name: 'Davide',
  job: 'Full Stack Developer'
})

const options = {
  host: 'postman-echo.com',
  path: '/post',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}

const request = http.request(options, res => {
  process.stdout.write('Status Code: ' + res.statusCode + '\n')
  process.stdout.write('Body: ')
  res.pipe(process.stdout)
})

request.end(payload)
```

Eseguendo lo script l'API di Postman dovrebbe rispondere alla nostra richiesta con i dati inviati:

```
Status Code: 200
Body: {"args":{},"data":{"name":"Davide","job":"Full Stack Developer"},"files":{},"form":{},"headers":{"x-forwarded-proto":"http","x-forwarded-port":"80","host":"postman-echo.com","x-amzn-trace-id":"Root=1-6149b83c-5724569842f64d6d3ac2daaa","content-length":"46","content-type":"application/json"},"json":{"name":"Davide","job":"Full Stack Developer"},"url":"http://postman-echo.com/post"}
```

È possibile gestire eventuali errori della nostra richiesta tramite l'evento `error` sull'oggetto restituito dal metodo `http.request()` nel seguente modo:


```
request.on("error", (err) => console.error("Error: ", err))
```

## Effettuare le richieste https

Nel precedente paragrafo abbiamo visto come inviare richieste GET e POST su HTTP, ma vale anche la pena considerare come 
inviare richieste in HTTPS. HTTPS sta per _HyperText Transfer Protocol Secure_. HTTPS è un'estensione del protocollo HTTP. Le 
comunicazioni su HTTPS sono crittografate. Il core di Node.js fornisce un modulo `https`, insieme al modulo `http`, da 
utilizzare quando si ha a che fare con le comunicazioni HTTPS. È possibile modificare le richieste per utilizzare 
HTTPS importando il modulo core `https` e modificando eventuali istanze di `http` in `https`:

```javascript
import https from 'node:https'

https.request(...)
```

:::tip
Esistono diverse librerie pronte all'uso che implmentano client HTTP o HTTP come [undici](https://undici.nodejs.org/) o [axios](https://github.com/axios/axios).
:::