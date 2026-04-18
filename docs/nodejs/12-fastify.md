---
sidebar_position: 12
---

# Fastify

Gli ambiti di utilizzo di Node.js sono molteplici: microservizi, applicazioni real-time come i chatbot o anche la domotica.
Uno degli utilizzi più comuni però è quello di creare applicazioni web, come abbiamo avuto modo di vedere il modulo `http`. 
Infatti, abbiamo visto che Node.js fornisce API di basso livello utili alla gestione di richieste HTTP. Dato che questo utilizzo 
è molto comune, sono stati creati molti framework nel corso degli anni: giusto per citarne alcuni [Express](https://expressjs.com),
[Koa](https://koajs.com), [Hapi](https://hapi.dev) e [Fastify](https://fastify.io). 

Questi framework sono basati sulle API di basso livello, fornendo un alto livello di astrazione agli sviluppatori facilitandoli 
nella creazione di applicazioni web.

In questa sezione daremo uno sguardo al framework [Fastify](https://fastify.io) e vedremo come utilizzarlo per creare una semplice 
API restful. Alla fine di questo capitolo sarete in grado di:

## Overview del framework

Come già anticipato, Fastify è un framework per Node.js, ideato in Italia da Matteo Collina e Tomas della Vedova, ed è altamente focalizzato sulla fornitura della migliore esperienza di sviluppo con il minimo overhead ed una potente architettura a plugin. Il suo sviluppo è ispirato ad Hapi ed Express e, per quanto ne sappiamo, è uno dei framework web più veloci attualmente in circolazione. Sebbene Fastify possa essere utilizzato per creare applicazioni web, eccelle davvero quando si creano API basate su JSON.

### È veloce

Come lo stesso nome suggerisce: Fastify è veloce! Sfruttando al meglio tutte le prestazioni di Node.js, questo framework è stato 
costruito da zero per essere quanto più veloce possibile. Tutto il codice utilizzato per i benchmarks è disponibile su 
[Github](https://github.com/fastify/benchmarks/#benchmarks), e nella tabella sottostante possiamo dare uno sguardo ai risultati dei 
benchmarch effettuati, a parità di hardware, per i framework più famosi in circolazione. Quesi benchmark sono basati su una semplice
 applicazione che restituisce la struttura JSON `{ hello: 'world' }`:

| Framework    | *Router* | *Requests/s* | *Latency* | *Throughput* |
| ------------ | -------- | ------------ | --------- | ------------ |
| Fastify      | yes      | 34528.0      | 28.46     | 6.16 Mb      |
| Express      | yes      | 8646.8       | 115.07    | 1.54 Mb      |
| hapi         | yes      | 20369.9      | 48.59     | 3.63 Mb      |
| koa          | no       | 27100.0      | 36.39     | 4.83 Mb      |
| restify      | yes      | 24198.4      | 40.82     | 4.36 Mb      |

Questi benchmark sono stati effettuati su una macchina linux x64 con 2 CPUs e 6.8GB di memoria utilizzando la versione di Node.js 
14.17.5. Noterete dai risultati che Fastify risulta molto più veloce e performante rispetto ai suoi principali concorrenti. I principali 
motivi per cui questo framework è così veloce sono sicuramente da attribuire all'utilizzo di [`fast-json-stringify`](https://github.com/fastify/fast-json-stringify), 
per raddoppiare il throughput del rendering di un JSON, e sicuramente al fatto che integra la libreria di routing 
[`find-my-way`](https://github.com/delvedor/find-my-way), già utilizzata nelle precedenti sezioni, che riduce i tempi di routing di 
un fattore pari a 10 rispetto alle alternative in circolazione.

### Architettura

L'architettura di Fastify è molto semplice ed elegante. È composta essenzialemente da tre parti principali: la prima che si occupa 
dell'avvio dell'applicazione, una seconda che espone API utili all'estendibilità (plugins, hooks e decorators), mentre la terza è 
quella che si occupa del routing. Sostanzialmente l'architettura di Fastify è la seguente:

![](./img/ch-12/01.png)


#### Loader

Al livello più basso di questa architettura abbiamo un loader, [Avvio](https://github.com/fastify/avvio), che si occupa di effettuare 
il bootstrap dell'intera applicazione. Avvio è basato su grafi ed è in grado di caricare in modo coerente e deterministico tutti i 
plugins con le loro catene di dipendenze e di iniettarli nell'applicazione Fastify in modo asincrono.

![](./img/ch-12/02.png)

#### Decorator

Questa è una delle features più interessanti del framework. Se abbiamo la necessità di aggiungere una funzionalità, o una configurazione, 
che verrà utilizzata in modo trasversale in tutto il nostro sistema, potete utilizzare l’API decorate. Il suo utilizzo è semplicissimo:

```javascript
fastify.decorate('utility', () => {
  // qualcosa di veramente utile!!
})
```

oppure, è possibile semplicemente aggiungere una configurazione, come per esempio:

```javascript
fastify.decorate('config', {
  db: 'file.db',
  port: 3306
})
```

Una volta “decorata” l’istanza Fastify, è possibile accedervi in qualsiasi momento utilizzando il nome datogli come proprietà:

```javascript
fastify.utility()
console.log(fastify.config.db)
```

#### Plugins

Fastify consente ad uno sviluppatore di estenderne le funzionalità aggiungendo plugin alla propria applicazione. Un plugin può 
essere qualsiasi cosa: un'insieme di rotte, un gruppo di funzioni di utility o una connessione ad un database. 
Utilizzando il metodo fornito dall'API di Fastify, `register`, è possibile aggiungere un plugin alla nostra applicazione.

Quando si registra un plugin, Fastify crea un nuovo ambito di esecuzione. Questo significa che se si apportano modifiche all'istanza 
Fastify che si sta utilizzando, per esempio utilizzando una `decorate`, questa sarà visibile solo ai figli e non agli antenati. 
Questo consente l'incapsulamento completo di un plugin, creando un grafo aciclico diretto (*DAG*), e non si hanno 
problemi di dipendenze incrociate. Graficamente appare quanto mostrato nell'immagine che segue:

![](./img/ch-12/03.png)

Un modo per far si che i plugin incapsulati devono essere accessibili da qualsiasi contesto in cui vengono richiesti, allora possiamo 
utilizzare `fastify-plugin`. 

![](./img/ch-12/04.png)

Fastify ha una [vasta gamma di plugins](https://www.fastify.io/ecosystem/) già sviluppati, compresi quelli per il rendering 
di modelli, per l’integrazione di React, il supporto GraphQL, la pubblicazione di file statici e driver di database.

#### Hooks

Gli hooks (letteralmente tradotti come _"ganci"_) sono delle funzioni particolari che vengono eseguite immediatamente 
prima o dopo che un particolare evento si sia verificato. In Fastify è possibile distinguere due tipologie di hook: 
quelle che intervengono nel ciclo di vita dell'applicazione e quelle che intervengono durante una richiesta o una risposta. 
È possibile registrare un hook in un istanza Fastify utilizzando il metodo `addHook` nel seguente modo:

```javascript
fastify.addHook('EventName', (req, res, done) => {
  // Alcune operazioni utili

  done()
})
```

Oppure utilizzando la sintassi `async/await` nel seguente modo:

```
fastify.addHook('EventName', async (req, res) => {
  // Alcune operazioni utili
  await customFunction()
})
```

Per quanto riguarda gli hook a livello applicativo, abbiamo a disposizione quattro eventi:

- `onReady`: questo evento viene lanciato prima che il server inizi ad ascoltare le richieste e quando viene invocato `.ready()`.
- `onClose`: questo evento viene lanciato appena la nostra applicazione terminata.
- `onRoute`: viene lanciato quando una nuova rotta viene registrata Fastify.
- `onRegister`: viene lanciato ogniqualvolta viene invocato il metodo `.register()` sull'istanza Fastify.

Invece, per quanto riguarda gli hook che interagistono nel [ciclo di vita](https://www.fastify.io/docs/latest/Lifecycle) di una 
richiesta, o di una risposta, abbiamo ben nove eventi:

- `onRequest`: viene lanciato immediatamente dopo la ricezione di una richiesta.
- `preParsing`: viene lanciato prima che venga effettuato il parsing della richiesta in entrata. In questa fase è possibile trasformare i dati della richiesta.
- `preValidation`: viene lanciato prima che venga effettuata la validazione della richiesta. Anche in questa fase è possibile modificare i dati della richiesta.
- `preHandler`: viene lanciato prima che la funzione che si occuperà della richiesta venga invocato.
- `preSerialization`: viene invocato prima che la serializzazione del payload venga effettuato.
- `onError`: viene lanciato ogniqualvolta si verifica un errore all'interno dell'applicazione. Può essere utilizzato per effettuare un analisi dei log.
- `onResponse`: viene lanciato quando una risposta da parte dell'applicazione viene inviata. Di conseguenza non è possibile inviare ulteriori dati al client.
- `onTimeout`: viene lanciato ogni volta che una richiesta effettuata al server va in timeout (solo se la proprietà `connectionTimeout` è definita sull'istanza di Fastify).

#### Routing

Come già accennato, Fastify integra `find-my-way` come modulo predefinito per la gestione del routing dell'applicazione. 
Abbiamo già discusso di `find-my-way` nel capitolo _"Modulo HTTP"_.

## Una semplice applicazione Fastify

Ora che abbiamo terminato una panoramica sulle principali funzionalità del framework, non ci resta altro da fare che 
inizializzare un progetto che utilizzi Fastify. Iniziamo creando un semplice server con una singola rotta. Dal 
terminale digitiamo i seguenti comandi:

```
$ mkdir simpleServer
$ cd simpleServer
$ npm init -y
$ npm install --save fastify
$ touch server.js
```

Ora che il nostro progetto è stato inzializzato. Scriviamo nel file `server.js` quanto segue:

```javascript showLineNumbers
import fastify from 'fastify'({
  logger: true
})

fastify.get('/', async (req, res) => {
  return { message: 'Hello, World!' }
})

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

Abbiamo già incontrato questo piccolo esempio nei capitoli precedenti, ma non abbiamo ancora commentato riga per riga cosa accade.

Dalla riga 1-3 abbiamo importato ed istanziato il nostro server Fastify. Nel nostro esempio abbiamo speficato solo la proprietà 
logger, di conseguenza l'istanza Pino verrà avviata con i parametri di default (livello `info`). Sono tante le proprietà che è 
possibile definire quando creiamo un'istanza Fastify. Per esempio la proprietà `bodyLimit` ci consente di specificare la 
dimensione massima, in bytes, del payload di una richiesta POST, oppure `maxParamLength` che ci consente di specificare il 
numero massimo di caratteri dei parametri inviati su una richiesta GET. È possibile dare uno sguardo alla lista completa delle 
proprietà che si possono specificare consultando [la documentazione ufficiale](https://www.fastify.io/docs/latest/Server) di Fastify.

Dalla riga 5-7 sull'istanza fastify, chiamiamo la funzione `get()` per aggiungere una rotta HTTP GET. Passiamo a questa 
funzione due parametri. Il primo parametro è il path che desideriamo registrare mentre il secondo è la nostra funzione asincrona 
che gestirà la richiesta sul path registrato.

La funzione specificata viene eseguita ogni volta che il server riceve una richiesta sul path e sul metodo specificati. 
Fastify espone funzioni equivalenti sull'oggetto fastify per gli altri metodi HTTP, inclusi `post()`, `delete()` e così via.

C'è un modo più dettagliato per registrare le rotte con Fastify, usando la funzione `route()`. Di seguito vediamo come è 
possibile dichiarare la stessa rotta con la sintassi della funzione `route()`:

```javascript
fastify.route({
  method: 'GET',
  url: '/',
  handler: async (request, reply) => {
    return { message: 'Hello, World!' }
  }
})
```

Dalla riga 9-16 abbiamo creato una funzione asincrona `start()`. Come suggerisce il nome, questa funzione gestisce 
l'avvio del nostro server. La funzione `fastify.listen(3000)` avvia il server Fastify sulla porta specificata. Di 
default il server sarà in ascolto su `localhost` quando non forniamo un valore host nell'oggetto. Possiamo anche omettere la 
porta e fastify allocherà una porta libera casuale. Il server non si avvierà finché non saranno caricati tutti i plugin, 
ossia finché Avvio non ha terminato il bootstrap dell'applicazione. Notate che `fastify.listen()` è avvolta in un blocco 
`try/catch` per consentirci di catturare e gestire eventuali errori. In tal caso stampiamo sullo standard error il 
messaggio (utilizzando l'istanza di Pino integrata nel framework) e quindi terminiamo il programma con `process.exit(1)`.

## Il nostro primo plugin

Vediamo ora come possiamo creare il nostro primo plugin con Fastify. È una cosa estremamente semplice, basta creare una 
funzione che prende in input tre parametri:

- `fastify`: l'istanza di Fastify creata.
- `options`: una serie di opzioni che Fastify gestisce in modo nativo.
- `done`: una funzione di callback. 

Un plugin può contenere nuove rotte, incapsulare a sua volta un altro plugin con una `register` o invocare una `decorate`.

```javascript
export default function (fastify, options, done) {
  fastify.decorate('sayHello', (name) => ({ message: `Hello, ${name}!` }))
  
  fastify.get('/:name', (req, res) => {
    const { name } = req.params
    res.send(fastify.sayHello(name))
  })

  fastify.register('./another-plugin')
  done()
}
```

Nel caso in cui vogliamo utilizzare la sintassi `async/await`, possiamo omettere il parametro `done`:

```javascript
export default async function (fastify, options) {
  fastify.decorate('sayHello', (name) => ({ message: `Hello, ${name}!` }))
  
  fastify.get('/:name', (req, res) => {
    const { name } = req.params
    res.send(fastify.sayHello(name))
  })

  fastify.register('./another-plugin')
}
```

In precedenza abbiamo detto che in Fastify un plugin può rappresentare qualsiasi cosa, anche un insieme di rotte. Quindi 
quello che faremo ora sarà trasformare la rotta dichiarata nel modulo principale `server.js` in un plugin utilizzabile 
da Fastify. Per comodità copiamo il progetto creato in precedenza in una nuova directory:

```
$ cp -R simpleServer pluginServer
```

Una volta terminata la copia creiamo un nuovo file nella directory `simpleServer`:

```
$ cd pluginServer
$ touch hello.js
```

Dal file `server.js` copiate le righe dalla 5 alla 7 e incollate il contenuto nel file `hello.js` in modo che abbia il seguente aspetto:

```javascript
export default async (fastify) => {
  fastify.get('/', async (req, res) => {
    return { message: 'Hello, World!' }
  })
}
```

Ora torniamo al file `server.js` e sostituiamo le righe copiate in precedenza con:

```javascript
import helloRoute from './hello'

fastify.register(helloRoute)
```

A questo punto il file `server.js` avrà il seguente aspetto:

```javascript
import fastify from 'fastify'({
  logger: true
})
import helloRoute from './hello'

fastify.register(helloRoute)

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

Ora eseguiamo l'applicazione con `$ node server.js` e navighiamo all'indirizzo `http://localhost:3000` dal vostro browser preferito e 
l'output mostrato nella finestra sarà il seguente:

```
{"message":"Hello, World!"}
```

In alternativa è possibile utilizzare cURL dalla riga di comando nel seguente modo:

```
$ curl http://localhost:3000
{"message":"Hello, World!"}
```

Il risultato che abbiamo ottenuto è esattamente lo stesso di quello dell'esempio mostrato in precedenza ma questa volta 
abbiamo utilizzato i plugin di Fastify per incapsulare e separare la logica della nostra rotta dal modulo principale. 
Nelle applicazioni molto grandi, si utilizza molto questa tecnica quindi aspettatevi di creare molti plugin per separare 
le specifiche funzionalità.

### I parametri di un plugin

È possibile passare un ulteriore parametro `options` alla funzione `fastify.register`. Questo parametro, al momento, 
supporta tre proprietà specifiche per Fastify:

- `prefix`
- `logLevel`
- `logSerializers`

> Una cosa importante da ricordare è che queste opzioni vengono ignorate quando si utilizza `fastify-plugin`.

#### Il parametro prefix

A volte è necessario mantenere due o più versioni diverse della stessa API; un approccio classico consiste nell'aggiungere 
un prefisso a tutte le rotte con il numero di versione dell'API, ad esempio `/v1/custom/path` e `/v2/custom/path`. 
Fastify ci offre un modo rapido e intelligente per creare versioni diverse della stessa API senza modificare manualmente 
tutti i path. Vediamo come funziona. Riprendiamo l'esempio fatto in precedenza, creiamo un nuovo file all'interno del 
progetto e chiamiamolo `helloV2.js`. Al suo interno scriviamo quanto segue:

```javascript
export default async (fastify, options) => {
  fastify.get('/', async (req, res) => {
    return { message: 'Hello, World v2!' }
  })
}
```

Ora nel file `server.js` aggiungiamo quanto segue:

```javascript
import helloRouteV2 from './helloV2'
fastify.register(helloRouteV2)
```

A questo punto il file `server.js` dovrebbe avere gossomodo il seguente aspetto:

```javascript
import fastify from 'fastify'({
  logger: true
})
import helloRoute from './hello'
import helloRouteV2 from './helloV2'

fastify.register(helloRoute)
fastify.register(helloRouteV2)

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

Se a questo punto proviamo ad avviare la nostra applicazione con il comando `$ node server.js`, riceveremo il seguente 
errore in fase di avvio:


```
$ node server.js
{"level":50,"time":1633168776700,"pid":496555,"hostname":"DebianXPS","generatedMessage":false,"code":"ERR_ASSERTION","actual":false,"expected":true,"operator":"==","stack":"AssertionError [ERR_ASSERTION]: Method 'GET' already declared for route '/' with constraints '{}'\n    at Router._insert (/home/davide/Projects/nodejs-book/sourceCode/ch-10/prefixPluginServer/node_modules/find-my-way/index.js:285:7)\n    at Router._on (/home/davide/Projects/nodejs-book/sourceCode/ch-10/prefixPluginServer/node_modules/find-my-way/index.js:213:8)\n    at Router.on (/home/davide/Projects/nodejs-book/sourceCode/ch-10/prefixPluginServer/node_modules/find-my-way/index.js:82:8)\n    at Object.afterRouteAdded (/home/davide/Projects/nodejs-book/sourceCode/ch-10/prefixPluginServer/node_modules/fastify/lib/route.js:254:16)\n    at /home/davide/Projects/nodejs-book/sourceCode/ch-10/prefixPluginServer/node_modules/fastify/lib/route.js:181:25\n    at Object._encapsulateThreeParam (/home/davide/Projects/nodejs-book/sourceCode/ch-10/prefixPluginServer/node_modules/avvio/boot.js:551:7)\n    at Boot.timeoutCall (/home/davide/Projects/nodejs-book/sourceCode/ch-10/prefixPluginServer/node_modules/avvio/boot.js:447:5)\n    at Boot.callWithCbOrNextTick (/home/davide/Projects/nodejs-book/sourceCode/ch-10/prefixPluginServer/node_modules/avvio/boot.js:428:19)\n    at Boot._after (/home/davide/Projects/nodejs-book/sourceCode/ch-10/prefixPluginServer/node_modules/avvio/boot.js:273:26)\n    at Plugin.exec (/home/davide/Projects/nodejs-book/sourceCode/ch-10/prefixPluginServer/node_modules/avvio/plugin.js:132:19)","type":"Error","msg":"Method 'GET' already declared for route '/' with constraints '{}'"}
```

Questo accade perché sia il plugin `hello` che `helloV2` espongono la stessa rotta GET `/`. Possiamo risolvere un problema 
in due modi. Il primo è quello di rinominare le rotte all'interno dei plugin, ed è una cosa che sconsiglio vivamente. 
La seconda, invece, è quella di utilizzare il parametro `prefix` dell'oggetto `options` passato come secondo parametro alla 
funzione `register` nel seguente modo:

```javascript
fastify.register(helloRoute, { prefix: '/v1' })
fastify.register(helloRouteV2, { prefix: '/v2' })
```

A questo punto, Fastify non si lamenterà perche stiamo usando lo stesso nome per due path diversi, perché al momento della 
compilazione gestirà automaticamente il prefisso. Quindi la prima versione verrà esposta `http://localhost:3000/v1` e la seconda 
versione verrà esposta `http://localhost:3000/v2`. A questo punto avviando l'applicazione con il comando `$ node server.js` 
non riceveremo più l'errore precedente e navigando all'indirizzo `http://localhost:3000/v1` il risultato che otterremo 
sarà il seguente:

```
{"message":"Hello, World!"}
```

Mentre all'indirizzo `http://localhost:3000/v2` il risultato sarà:

```
{"message":"Hello, World v2!"}
```

#### Il parametro logLevel

A volte può essere necessario avere due livelli di log distinti per le diverse rotte. Per esempio immaginate che stiamo 
rilasciando una nuova versione di una funzionalità e vogliamo che i log siano più verbosi rispetto alla versione che già 
è in produzione da tempo. Fastify a questo punto ci viene in aiuto con il parametro `logLevel` dell'oggetto `options` 
passato come secondo parametro alla funzione `register`. Questo parametro ovviamente conterrà il 
[livello di log](https://github.com/pinojs/pino/blob/master/docs/api.md#level-string) che desideriamo.

Torniamo ancora una volta all'esempio fatto nel paragrafo precedente e aggiungiamo il parametro `logLevel`:

```javascript
fastify.register(helloRoute, { prefix: '/v1', logLevel: 'warnig' })
fastify.register(helloRouteV2, { prefix: '/v2', logLevel: 'debug' })
```

Ora se avviate l'applicazione con il comando `$ node server.js` noterete che quando viene effettuata una richiesta su `/v2` a video comparirà un log tipo:

```
{"level":30,"time":1633172098979,"pid":809407,"hostname":"DebianXPS","reqId":"req-1","req":{"method":"GET","url":"/v2","hostname":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":48216},"msg":"incoming request"}
{"level":30,"time":1633172098997,"pid":809407,"hostname":"DebianXPS","reqId":"req-1","res":{"statusCode":200},"responseTime":15.975655999965966,"msg":"request completed"}
```

Mentre se effettuiamo una richiesta su `/v1` non verrà stampato nulla. Infatti avendo passato il parametro `logLevel: 'warn'` 
verranno stampati solo ed esclusivamente i log con livello `warn`. Proviamo quindi a fare un piccolo test. Nel file `hello.js` 
aggiungiamo la seguente riga prima dell'istruzione `return`.

```javascript
fastify.log.warn('This is a WARNING log message!')
```

A questo punto se riavviamo l'applicazione ed effettuiamo una richiesta si `/v1` a video apparirà il seguente messaggio di log:

```
{"level":40,"time":1633172405223,"pid":841625,"hostname":"DebianXPS","msg":"This is a WARNING log message!"}
```

Ricordate che il livello di log personalizzato viene applicato solo alle rotte, e non all'istanza Fastify globale, a cui 
accediamo con `fastify.log`.

#### Il parametro logSerializer

In alcuni contesti, potrebbe essere necessario scrivere log di oggetti molto grandi, ma potrebbe essere uno spreco di risorse 
per alcuni path. In questo caso, possiamo definire dei serializzatori e utlizzarli solo in un determinato contesto. Per esempio 
immaginiamo di voler creare un serializzatore personalizzato con nome `v2Serializer` sulla rotta `/v2` creata nell'esempio 
precedente:

```javascript
fastify.register(helloRouteV2, { 
  prefix: '/v2',
  logLevel: 'info',
  logSerializers: {
    v2Serializer: (value) => `V2 Serializer called at - ${value}`
  }
})
```

Una volta definito il nuovo serializzatore possiamo utilizzarlo nel nostro plugin `helloV2` nel seguente modo:

```javascript
export default async (fastify, options) => {
  fastify.get('/', async (req, res) => {
    req.log.info({ v2Serializer: new Date(), url: req.url })

    return { message: 'Hello, World v2!' }
  })
}
```

Avviando la nostra applicazione dalla riga di comando e navigando all'url `http://localhost:3000/v2` verrà stampato un 
log con la seguente struttura:

```
{"level":30,"time":1633177162848,"pid":978772,"hostname":"DebianXPS","reqId":"req-1","v2Serializer":"V2 Serializer called at - Sat Oct 02 2021 14:19:22 GMT+0200 (Ora legale dell’Europa centrale)","url":"/v2"}
```

> Notate che nell'esempio appena descritto non abbiamo utlizzato `fastify.log.info` ma `req.log.info`. Infatti se provassimo 
ad utlizzare l'istanza Pino che fa riferimento al Fastify globale iniettato nel nostro plugin, questa stamperebbe semplicemente 
l'oggetto passato come parametro senza passare per il serializzatore custom `v2Serializer`. Fastify inietta il nostro serializzatore 
custom solo sugli oggetti `req` e `res` passate alla funzione responsabile. 

Per maggiori informazioni sui serializzatori personalizzati di Pino date uno sguardo alla [documentazione ufficiale](https://github.com/pinojs/pino/blob/master/docs/api.md#bindingsserializers-object).

## Lavorare con i database

Molte applicazioni richiedono l'accesso e l'archiviazione dei dati e, in molti casi, un database relazionale tradizionale si 
adatta ai requisiti dell'applicazione. In un database relazionale, i dati avranno probabilmente una relazione definita, organizzata 
in tabelle. Tuttavia, più recentemente c'è stato l'emergere di database non relazionali, che solitamente vengono definiti come 
database NoSQL. Questa tipologia di database si adattano a quella tiplogia di dati dove non esiste una struttura facilmente predefinita 
o dove è richiesta flessibilità nella struttura dei dati. In questa sezione daremo uno sguardo a come utilizzare alcuni alcuni database, 
relazionali e non, più utilizzati in circolazione.

### Docker

Nei prossimi esempi utlizzeremo Docker per effettuare il provisioning di container che gestiranno i diversi ambienti che utilizzeremo. 
Il motivo principale per cui utilizzeremo container Docker è quello di evitare di effetuare l'installazione manuale dei diversi 
ambienti. Se non avete ancora docker installato sulla vostra macchina consultate la [guida ufficiale](https://docs.docker.com/get-docker/).

Se non siete disposti ad utilizzare Docker, ovviamente sarete obbligati ad installare manualmente i diversi ambienti. Una ulteriore 
alternativa può essere quella di connettersi ad un servizio remoto.

### Cosa implementeremo

Nei successivi esempi implementeremo una API restful utile alla gestione di una videoteca virtuale. Per ogni esempio implementeremo 
soltando due o più rotte:

- `GET /film/list`: questo endpoint ritornerà la lista completa dei films della videoteca.
- `POST /film`: questo endpoint si occuperà della registrazione di un nuovo film.
- `PUT /film/:id`: questo endpoint si preoccuperà di aggiornare i dati di un film.
- `DELETE /film/:id`: quest'ultimo endpoint eliminerà il film dal catalogo.

Un film avrà le seguenti caratteristiche:

- *Data di uscita*
- *Titolo*
- *Casa di produzione*
- *Cast*
- *Descrizione*
- *Prezzo*

### Persistenza dati in database MySQL

MySQL è un _"Relational Database Management System"_ (*RDBMS*) open source. È basato sul linguaggio SQL 
(*Structured Query Language*) che è considerato lo standard per la comunicazione con i database relazionali. Esistono molte implementazioni 
di SQL in giro, ed ognuna possiede le sue estensioni e le sue funzionalità. SQL fornisce una sere di comandi base per eseguire il 
salvataggio, la modifica, l'eliminazione. Ora vedremo come comunicare con un database MySQL utilizzando il framework Fastify.

#### Installiamo MySQL

Come già anticipato in precedenza utilizzeremo Docker per installare e avviare il server in locale. Docker Hub, la piattaforma 
su cui è possibile creare e gestire container Docker, fornisce l'immagine ufficiale di MySQL ([https://hub.docker.com/_/mysql](https://hub.docker.com/_/mysql)). 
Quindi da un terminale digitiamo il seguente comando:

```
$ docker run --publish 3306:3306 --name fastify-mysql --env MYSQL_ROOT_PASSWORD=123456 --detach mysql:5
```

Nel caso in cui non abbiamo già l'immagine di MySQL a disposizione sulla nostra macchina Docker si occuperà di scaricarla e avviarla 
per noi. In tal caso il seguente output verrà mostrato sul nostro terminale:

```
Unable to find image 'mysql:5' locally
5: Pulling from library/mysql
07aded7c29c6: Pull complete 
f68b8cbd22de: Pull complete 
30c1754a28c4: Pull complete 
1b7cb4d6fe05: Pull complete 
79a41dc56b9a: Pull complete 
00a75e3842fb: Pull complete 
b36a6919c217: Pull complete 
5e11fe494f45: Pull complete 
9c7de1f889a7: Pull complete 
cf6a13d05a76: Pull complete 
fc5aa81f393a: Pull complete 
Digest: sha256:360c7488c2b5d112804a74cd272d1070d264eef4812d9a9cc6b8ed68c3546189
Status: Downloaded newer image for mysql:5
a4a0187fdc6c81d22c5e73f582ead9b004e3aed6abeefe697b98b9f8fa0a28c0
```

Il flag `--detach` dice a Docker di eseguire il processo in background e di conseguenza non vedremo i log di MySQL nel nostro 
terminale. Per verificare che la nostra immagine sia in esecuzione senza errore digitate dalla linea di comando:

```
$ docker ps
```

Sullo schermo apparirà una tabella simile a quella sottostante che ci indica tutti i container docker installati, con altre informazioni 
come il nome, le porte esposte, se il container è in esecuzione e così via:

![](./img/ch-12/05.png)

Terminata l'installazione iniziamo a creare il database e la tabella di cui abbiamo bisogno. Dalla riga di comando digitiamo quanto segue:

```
$ docker exec -t -i fastify-mysql /bin/bash
```

Questo comando docker ci consente di connettersi alla shell bash del container creato in precedenza. 

- *`-i`* è la scorciatoia per l'opzione *`--interactive`*. Questa opzione viene utilizzata per mantenere aperto lo standard input anche se non collegato.
- *`-t`* è la scorciatoia per l'opzione *`--tty`*, usata per allocare uno pseudo-TTY.

Una volta connessi al container, non ci resta che collegarci alla shell MySQL con il comando:

```
$ mysql -u root -p
```

A questo punto verrà richiesta la password. Inserendo `123456`, ossia la password definita quando abbiamo creato il container. 
Se tutto è andato bene dovremmo essere connessi alla she MySQL:

```
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 4
Server version: 5.7.35 MySQL Community Server (GPL)

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

Dalla shell iniziamo a creare il nostro database con il seguente comando:

```
mysql> CREATE SCHEMA video_library;
Query OK, 1 row affected (0.00 sec)
```

Ora che il nostro database è stato creato creaiamo la nostra unica tabella `films`. Dalla console MySQL continuiamo digitando i seguenti comandi:

```
mysql> USE video_library;
Database changed

mysql> CREATE TABLE films ( id INT AUTO_INCREMENT, release_date DATETIME NOT NULL, title VARCHAR(100) NOT NULL, description TEXT NOT NULL, production VARCHAR(100) NOT NULL, cast TEXT NOT NULL, price DOUBLE NOT NULL, CONSTRAINT films_pk PRIMARY KEY (id) );
Query OK, 0 rows affected (0.03 sec)
```

```
mysql> SHOW TABLES;
+-------------------------+
| Tables_in_video_library |
+-------------------------+
| films                   |
+-------------------------+
1 row in set (0.00 sec)
```

Ora che abbiamo creato il nostro database non ci resta che inizializzare il progetto.

##### Inizializziamo il progetto

Iniziamo con il creare la directory del progetto e l'installazione delle dipendenze necessarie:

```
$ mkdir mysqlApp
$ cd mysqlApp
$ npm init -y
$ npm install fastify fastify-mysql --fastify-plugin dotenv
$ mkdir routes plugins
$ touch server.js routes/films.js plugins/mysql.js .env
```

A questo punto la struttura del progetto dovrebbe essere la seguente:

```
./mysqlApp
├── node_modules
├── package.json
├── package-lock.json
├── plugins
│   └── mysql.js
├── routes
│   └── films.js
└── server.js
```

Noterete che abbiamo installato una dipendenza in più questa volta: [`fastify-mysql`](https://github.com/fastify/fastify-mysql). 
Come già accennato in precedenza, il team di sviluppo di Fastify ha già provveduto a fornire agli sviluppatori che ne fanno utilizzo 
tutta una serie di plugin pronti all'uso. Con questo plugin è possibile condividere lo stesso pool di connessioni MySQL in ogni 
parte del tuo server. È un wrapper del modulo [mysql2](https://github.com/sidorares/node-mysql2) e le opzioni che passi alla 
registrazione verranno passate al generatore di pool MySQL.

Infine, il modulo `dotenv`, invece, ci aiuterà a gestire le variabili d'ambiente che ci consentiranno di effettuare la connessione 
al nostro database MySQL. Creiamo quindi un file `.env` contenente le seguenti variabili d'ambiente:

```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=video_library
```

Iniziamo dal file `server.js`. Il suo contenuto, per il momento sarà una semplice applicazione Fastify che non espone nessuna rotta:

```javascript
import fastify from 'fastify'({
  logger: true
})
import 'dotenv/config'

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

Ora nel file `mysql.js` registriamo il nostro plugin `fastify-mysql` utilizzando `fastify-plugin`:

```javascript
import mysql from 'fastify-mysql'
import fp from 'fastify-plugin'

export default fp(async (fastify, opts) => {
  const pluginOpts = Object.assign({}, {
    promise: true,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
  }, opts)

  fastify.register(mysql, pluginOpts)
})
```

Utilizzando `fastify-plugin` non verrà creato un nuovo scope incapsulato. In questo modo il modulo `mysql` sarà accessibile da 
tutti all'interno della nostra applicazione. 

Se non vogliamo utilizzare il modulo `fastify-plugin`, è possibile utilizzare una proprietà nascosta `skip-override`, ma non è 
consigliabile. Se in futuro l'API di Fastify dovesse cambiare sarà una nostra responsabilità aggiornare il modulo, mentre se si 
utilizza il `fastify-plugin`, possiamo essere certi della retrocompatibilità. Di seguito il modulo `mysql.js` riscritto 
utilizzando la prorietà `skip-override`:

```javascript
import mysql from 'fastify-mysql'

async function mysqlPlugin (fastify, opts) {
  const pluginOpts = Object.assign({}, {
    promise: true,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
  }, opts)

  fastify.register(mysql, pluginOpts)
}

mysqlPlugin[Symbol.for('skip-override')] = true
export default mysqlPlugin
```

A questo punto non ci resta che registrare il nostro modulo nell'applicazione principale:

```javascript
fastify.register('./plugins/mysql')
```

Se proviamo ad avviare la nostra applicazione con il comando `$ node server.js` non dovremmo ricevere errori ed essere certi 
che la connessione al nostro database MySQL è stata effettuata correttamente. A questo punto possiamo creare la struttura 
del modulo `routes.js`:

```javascript
export default async (fastify, opts) => {
  fastify.post('/', async (req, res) => { })

  fastify.get('/list', async (req, res) => { })

  fastify.put('/:id', async (req, res) => { })

  fastify.delete('/:id', async (req, res) => { })
}
```

Ci occuperemo dell'implementazione dei metodi fra poco. Quello che faremo ora è registrare il plugin `routes.js` nel modulo 
principale della nostra applicazione. Le nostre rotte verranno esposte sulla rotta `/film`, quindi aggiungiamo la seguente 
riga al file `server.js` immediatamente dopo la register del plugin `mysql.js`:

```javascript
fastify.register('./routes/films', { prefix: '/film' })
```

##### Creazione

Ora che tutto è pronto iniziamo ad implementare il metodo che si occuperà della creazione:

```javascript
fastify.post('/', async (req, res) => {
  let connection = null
  const {
    release_date,
    title,
    description,
    production,
    cast,
    price
  } = req.body

  try {
    connection = await fastify.mysql.getConnection()
    const [ result ] = await connection.query(
      `INSERT INTO films
      (
        release_date,
        title,
        description,
        production,
        cast,
        price
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        release_date,
        title,
        description,
        production,
        cast,
        price
      ]
    )

    return { id: result.insertId }
  } catch (err) {
    fastify.log.error(err)
    return res
      .code(500)
      .send({ message: err.message })
  } finally {
    if (connection !== null) {
      connection.release()
    }
  } 
})
```

Nel momento in cui abbiamo registrato il plugin `mysql.js` sull'istanza di Fastify avremo a disposizione un'istanza del 
plugin `mysql2` a cui possiamo accedere utilizzando `fastify.mysql`. Il metodo `getConnection()`, esposto dal plugin, 
ritorna la connessione stabailita dal plugin `fastify-mysql` basata sulle credenziali che abbiamo specificate nelle variabili 
d'ambiente.

Quando fastify riceve una richiesta POST metterà a disposizione la proprietà `req.body` che conterrà tutte le varibili 
inviategli via POST. Rivetute tutte le variabili utili alla creazione di un nuovo record nella tabella `films`. Una volta 
recuperati questi valori e stabilita una connessione al nostro database, effettuiamo una query di `INSERT` utilizzando il metodo 
`query()` esposto dal modulo `mysql2`. Questo metodo restituisce un array contenente due valori:

- Alla prima posizione viene restituito il risultato della query appena eseguita.
- Alla seconda, invece, vengono restituiti metadati extra sui risultati, se disponibili.

Nel nostro esempio siamo interessati solo al risultato della query appena eseguita.  Se non si verifica nessun errore l'id 
corrispondente all'inserimento appena effettuato e la connessione al nostro database verrà chiusa. Nel caso in cui si verifica un 
errore verrà eseguito il codice del blocco `catch`, quindi verrà loggato l'errore con `fastify.log.error` e resituito un 
500 (*HTTP Internal Server Error*), con il messaggio dell'errore che si è verificato.

Il codice del blocco `finally`, verrà sempre eseguito a prescindere dal fatto che si  sia verificato o meno un errore. 
Nel caso in cui la variabile `connection` contiene una connessione valida al nostro database, viene invocata la funzione 
`release()` che rilascia la connessione al pool di connessioni. Questa non chiude la connessione, la rende semplicemente 
disponibile per essere utilizzata per altre query.

Avviamo la nostra applicazione con il comando `$ node server.js`, e utilizziamo Postman per inviare una richiesta POST 
a `http://localhost:3000/film` con il seguente body in formato JSON:

```
{
  "release_date": "1985-12-20",
  "title": "Goonies",
  "production": "Warner Bros. Pictures, Amblin Entertainment",
  "description": "A group of young misfits called The Goonies discover ...",
  "cast": "Sean Astin, Josh Brolin, Jeff Cohen, Corey Feldman...",
  "price": 20
}
```

Se tutto è andato a buon fine dovreste ricevere come risultato l'identificativo del record MySQL corrispondente:

![](./img/ch-12/06.png)

##### Lista

Implementare questo metodo è estremamente semplice. Non bisogna fare altro che ritornare tutti i record della tabella `films`. Diamo uno sguardo al codice:

```javascript
fastify.get('/list', async (req, res) => {
  let connection = null

  try {
    connection = await fastify.mysql.getConnection()
    const [ films ] = await connection.query(`SELECT * FROM films`)
    return films
  } catch (err) {
    fastify.log.error(err)
    res
      .code(500)
      .send({ message: err.message })
    return;
  } finally {
    if (connection !== null) {
      connection.release()
    }
  } 
})
```

Tutta la gestione degli errori è uguale a quella implementata nel precedente metodo. Anche in questo caso se si verifica un 
errore nel blocco `try` questo viene catturato dal blocco `catch`, il quale scrive un log contenente l'errore verificatosi 
e ritorna un 500 (*Internal Server Error*) al client. Infine nel blocco `finally`, nel caso in cui la variabile `connection` 
fa riferimento ad una connessione valida, allora le risorse vengono rilasciate.

Nel blocco `try`, richiediamo una connessione disponibile dal pool di connessioni disponibili, successivamente utilizziamo il 
metodo query per effettuare un'interrogazione al nostro database. Nel caso in cui non si verificano errori ritorneremo il 
risultato al client: 

```javascript
connection = await fastify.mysql.getConnection()
const [ films ] = await connection.query(`SELECT * FROM films`)
return films
```

A questo punto, utilizzando Postman, è possibile effettuare una richiesta GET all'indirizzo `http://localhost:3000/film/list` 
e ricevere un risultato come quello illustrato in figura:

![](./img/ch-12/07.png)

### Persistenza dati un database MongoDB

[MongoDB](https://www.mongodb.com) è un database NoSQL orientato ai documenti utilizzato per l'archiviazione di dati di grande volume. 
Invece di utilizzare tabelle e righe come nei tradizionali database relazionali come MySQL, MongoDB fa uso di raccolte e documenti. 
I documenti sono costituiti da coppie chiave-valore che sono l'unità di base dei dati in MongoDB. Le raccolte contengono insiemi di 
documenti e funzioni equivalenti alle tabelle di database relazionali. MongoDB è un database che è venuto alla luce intorno alla 
metà degli anni 2000.

MongoDB memorizza i dati in documenti flessibili JSON-like, il che significa che i campi possono variare da un documento all'altro 
ed è possibile modificare nel tempo la struttura dei dati. Infatti nell'esempio che vedremo non abbiamo la necessità di creare tabelle 
come fatto in precedenza con MySQL. Basterà inviare i dati al nostro server, secondo un certo formato, e lui si occuperà del salvataggio.

Ogni documento di una collection ha un campo `_id` che viene utilizzato per identificare in modo univoco il documento in una particolare 
collection e quindi funge da chiave primaria. Il campo `_id` può essere utilizzato in qualsiasi formato e il formato predefinito 
è [`ObjectId`](https://docs.mongodb.com/manual/reference/bson-types/#std-label-objectid).

#### Installiamo MongoDB

Utilizziamo Docker per installare un server MongoDB. Docker Hub fornisce anche in questo caso l'immagine ufficiale di MongoDB 
([https://hub.docker.com/_/mongo](https://hub.docker.com/_/mongo)). Installarla è molto semplice dal terminale digitiamo il 
seguente comando:

```
$ docker run --publish 27017:27017 --name fastify-mongo --detach mongo:4
```

Nel caso in cui non abbiamo già l’immagine di MongoDB a disposizione sulla nostra macchina Docker si occuperà di scaricarla e avviarla 
per noi. In tal caso il seguente output verrà mostrato sul nostro terminale:

```
Unable to find image 'mongo:4' locally
4: Pulling from library/mongo
f3ef4ff62e0d: Pull complete 
b1a49f973a13: Pull complete 
a94d4dd6d900: Pull complete 
f6e410f3a61f: Pull complete 
84513ed7bcb6: Pull complete 
c81f961faa63: Pull complete 
a4146772698c: Pull complete 
7d67abd2e683: Pull complete 
0930c7be04e9: Pull complete 
c583d7bc3a62: Pull complete 
Digest: sha256:8419b709b5ebe0d750599d2622b640f1362baa3633a84ea7669c478043447804
Status: Downloaded newer image for mongo:4
d57727d0dc77186d098ff5132aefc3074ee35e8238edcc83eb7b3e80890a354c
```

Per verificare che tutto è andato a buon fine digitiamo dal terminale il comando `$ docker ps`:

![](./img/ch-12/08.png)

Per impostazione predefinita il nostro server MongoDB sarà disponibile su `localhost:27017`.

##### Inizializziamo il progetto

Ora che MongoDB è in esecuzione, possiamo inizializzare un nuovo progetto con i seguenti comandi. La struttura dei files e 
delle directory sarà pressapoco uguale a quella creata per il progetto `mysqlApp`:

```
$ mkidr mongoDbApp
$ cd mongoDbApp
$ npm init -y
$ npm install --save fastify fastify-plugin fastify-mongodb dotenv
$ mkdir plugins routes
$ touch server.js plugins/mongo.js routes/films.js .env
```

A questo punto l'albero della directory del progetto dovrebbe avere il seguente aspetto:

```
./mongoDbApp
├── node_modules
├── package.json
├── package-lock.json
├── plugins
│   └── mongo.js
├── routes
│   └── films.js
└── server.js
```

In questo caso abbiamo installato [`fastify-mongodb`](https://github.com/fastify/fastify-mongodb) come dipendenza in quanto andremo 
ad effettuare operazioni su un database MongoDB. Con questo plugin è possibile condividere lo stesso pool di connessioni MongoDB 
in ogni parte del nostro server. Anche in questo caso il plugin è un wrapper del driver [ufficiale MongoDB](https://github.com/mongodb/node-mongodb-native), 
le opzioni che passiamo per la registrazione verranno inoltrate al client Mongo. Il driver mongodb è `v4.x.x`. 

A questo punto non ci resta che iniziare creando il nostro file di environment `.env` nella directory principale del progetto 
e definire le variabili d'ambiente che ci saranno utili per la connessione:

```
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=video_library
```

Ora che tutto è pronto inziamo, come al solito dal nostro file server.js. Il suo contenuto sarà pressocché uguale a quello del server 
di `mysqlApp` tranne che per la riga 6. Infatti in questo caso il nome del file del plugin non sarà più `mysql.js` ma `mongo.js`:

```javascript
import fastify from 'fastify'({
  logger: true
})

import 'dotenv/config'
fastify.register('./plugins/mongo')
fastify.register('./routes/films', { prefix: '/film' })

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

Ora nel file `mongo.js`, andremo a registrare il plugin `fastify-mongodb` utilizzando `fastify-plugin` nel seguente modo:

```javascript
import mongo from 'fastify-mongodb'
import fp from 'fastify-plugin'

export default fp(async (fastify, opts) => {

  const pluginOpts = Object.assign({}, {
    url: `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`
  }, opts)

  fastify.register(mongo, pluginOpts)
})
```

I parametri di connessione al database sono piuttosto semplici. Il parametro `url` corrisponderà alla stringa `mongodb://localhost:27017/video_library` 
e verrà ustato dal plugin per effettuare le operazioni sulla collection `films`. Ora che tutto è pronto, apriamo il file `films.js` ed iniziamo 
ad implementare i metodi partendo dalla seguente struttura:

```javascript
export default async (fastify, opts) => {
  const collection = fastify.mongo.db.collection('films')

  fastify.post('/', async (req, res) => { })

  fastify.get('/list', async (req, res) => { })

  fastify.put('/:id', async (req, res) => { })

  fastify.delete('/:id', async (req, res) => { })
}
```

Una cosa da notare è che in questo caso non andremo a richiedere una connessione ogni volta che l'handler di una specifica rotta viene invocato. 
Il riferimento alla connessione è già presente in `fastify.mongo.db` e non ci resta altro che richiedere quello alla collection desiderata 
`films` utilizzando il metodo `collection()`. A questo punto collection metterà a disposizione una API con diversi metodi utili tra cui:

- `find`: che consente di effettuare ricerche su una collection.
- `insertOne`: utile all'inserimento di un documento.
- `insertMany`: utile all'inserimento di più documenti inviati come array di oggetti.
- `deleteMany`: con cui è possibile eliminare più documenti che rispettano le condizioni passate come parametri.
- `deleteOne`: che consente di eliminare un singolo documento che rispetta le condizioni passategli come parametri.
- `updateOne`: utile all'aggiornamento di una collection.
- `createIndex`: che migliora le performance della nostra applicazione creando indici sui campi dei documenti di una collection.

Questi sono i metodi più utilizzati. Se volete approfondire l'API date uno sguardo alla [documentazione ufficiale](https://github.com/mongodb/node-mongodb-native) 
del modulo su cui il plugin Fastify è basato.

##### Creazione

Il metodo che si occuperà della creazione di un nuovo film sarà il seguente:

```javascript
fastify.post('/', async (req, res) => {
  const film = req.body

  try {
    const response = await collection.insertOne(film)
    return { id: response.insertedId }
  } catch (err) {
    fastify.log.error(err.message)
    return res
      .code(500)
      .send({ message: err.message })
  }
})
```

Quando Fastify riceve una richiesta POST, automaticamente crea una proprietà `body` sull'oggetto `req` con tutte le variabili 
passate in POST a quella rotta. Quindi, ammettendo che il client abbia inviato tutti i dati correttamente, body conterrà una richiesta 
che rispecchia quello che l'handler si aspetta. Parleremo più avanti in questo libro di come effettuare la validazione dei dati su una 
rotta, per il momento facciamo solo affidamento al buon senso del client.

La variabile collection mette a disposizione diversi metodi tra cui [`insertOne()`](https://docs.mongodb.com/manual/reference/method/db.collection.insertOne/) 
che nel nostro caso ci consentirà di inserire il documento nella collection `films`. Nel caso in cui l'operazione va a buon fine 
nella variabile `response` avremo a disposizione un oggetto simile al seguente: 

```
{
  acknowledged: true,
  insertedId: new ObjectId("615d38b6a244815428640618")
}
```

Nel nostro caso ci interessa l'identificativo del documento appena inserito, quindi ci preoccupiamo di ritornare al client questo dato 
con l'istruzione `return`. Nel caso in cui si verifica un errore in fase di esecuzione, questo verrà catturato dal blocco `catch`, verrà 
scritto sullo standard error e verrà inviato il messaggio al client con un codice di risposta 500 (*HTTP Internal Server Error*).

A questo punto avviamo la nostra applicazione con il comando `$ node server.js`, e come al solito utilizziamo Postman per inviare 
una richiesta in POST con il seguente body in formato JSON:

```
{
  "release_date": "1985-12-20",
  "title": "Goonies",
  "production": "Warner Bros. Pictures, Amblin Entertainment",
  "description": "A group of young misfits called The Goonies discover ...",
  "cast": "Sean Astin, Josh Brolin, Jeff Cohen, Corey Feldman...",
  "price": 20
}
```

Se l'operazione è andata a buon fine dovremmo ricevere come risultato l'identificativo del documento appena creato nella collection `films`:

![](./img/ch-12/09.png)

##### Lista

Anche in questo caso l'implementazione dell'handler della richiesta è piuttosto semplice. Utilizziamo il metodo 
[`find()`](https://docs.mongodb.com/manual/reference/method/db.collection.find/) che ci consentirà di ricevere tutte i documenti 
presenti nella collection `films`. Diamo uno sguardo all'implementazione:

```javascript
fastify.get('/list', async (req, res) => {
  try {
    const response = await collection.find({}).toArray()
    return response
  } catch (err) {
    fastify.log.error(err.message)
    return res
      .code(500)
      .send({ message: err.message })
  }
})
```

Il metodo `find({}).toArray()` restituirà tutti i documenti della collection in formato array. Volendo è possibile definire un 
ordinamento per una o più proprietà. Per esempio nel caso in cui vogliamo che i film vengano restituiti per prezzo in ordine decrescente, 
basterà utilizzare il metodo `sort()` specificando la proprietà ed il relativo ordinamento:

```javascript
await collection
  .find({})
  .sort({ price: -1 })
  .toArray()
```

In questo caso il valore `-1` dice a MongoDB che vogliamo che il prezzo venga ordinato in modo decrescente, quindi se proviamo a rieffettuare 
una GET all'indirizzo `http://localhost:3000/film/` noteremo che la lista dei film verrà ritornata in ordine descrescente di prezzo:

![](./img/ch-12/10.png)

##### Modifica

Per effettuare la modifica di una collection è possibile utilizzare la funzione [`updateOne()`](https://docs.mongodb.com/manual/reference/method/db.collection.updateOne/) 
a cui è possibile passare l'identificativo della collection, nel nostro caso passata come parametro nella barra degli indirizzi, e 
le proprietà che si desidera modificare. Di seguito l'implementazione completa:

```javascript
fastify.put('/:id', async (req, res) => {
  const { ObjectId } = fastify.mongo
  const { id } = req.params
  const film = req.body

  try {
    const result = await collection.updateOne(
      { '_id': new ObjectId(id) },
      { $set: film }
    )

    if (result.modifiedCount === 0) {
      return res
        .code(404)
        .send({ message: `Document with ID ${id} not found.` })
    }

    return res
      .code(204)
      .send()
  } catch (err) {
    fastify.log.error(err)
    return res
      .code(500)
      .send({ message: err.message })
  }
})
```

Prima di entrare nel blocco `try/catch` inizializziamo le seguenti variabili: 

- `ObjectId`: è un costruttore che ci consentirà di ricostruire l'ObjectId partendo da una stringa. 
- `id`: rappresenta l'id della collection films in formato stringa.
- `film`: i dati che si desiderano aggiornare.

Successivamente all'inizializzazione di queste tre variabili invochiamo il metodo `updateOne()`, indicandogli l'identificativo del 
documento di cui vogliamo effettuare l'aggiornamento e, come secondo parametro, un'oggetto contente le proprietà del documento che 
vogliamo aggiornare. Se tutto è andato a buon fine, la variabile `result` conterrà alcuni dettagli sull'operazione che abbiamo 
effettuato. Per esempio se l'operazione è terminata con successo, avrà un formato simile al seguente:

```
{
  "acknowledged": true,
  "modifiedCount": 1,
  "upsertedId": null,
  "upsertedCount": 0,
  "matchedCount": 1
}
```

Nel caso in cui l'identificativo stringa inviato come parametro non è presente all'interno della nostra collection il valore 
`matchedCount` sarà uguale a 0 quindi restituiremo all'utente una risposta 404 (*Not found*) con il relativo messaggio. Nel caso in 
cui l'operazione verrà effettuata correttamente restituiremo una risposta 204 (*No content*).

In questo scenario, non sarà presente alcun dato nella risposta ma noteremo che il codice sarà 204, come nel seguente screenshot:

![](./img/ch-12/11.png)

##### Eliminazione

Per fare in modo che un documento venga eliminato dalla nostra collection `films` bisognerà invocare il metodo DELETE `/film:id` 
il quale farà utilizzo del metodo [`deleteOne()`](https://docs.mongodb.com/manual/reference/method/db.collection.deleteOne/) esposto 
dal modulo MongoDB. Ecco l'implementazione completa:

```javascript
fastify.delete('/:id', async (req, res) => {
  const { ObjectId } = fastify.mongo
  const { id } = req.params

  try {
    const result = await collection.deleteOne(
      { '_id': new ObjectId(id) }
    )

    if (result.deletedCount === 0) {
      return res
        .code(404)
        .send({ message: `Document with ID ${id} not found.` })
    }

    return res
    .code(204)
    .send()
  } catch (err) {
    fastify.log.error(err)
    return res
      .code(500)
      .send({ message: err.message })
  }
})
```

Anche in questo caso prima di entrare nel blocco `try/catch` inzializziamo le variabili `ObjectId` e `id` di cui abbiamo discusso 
nel precedente paragrafo quando abbiamo parlato della modifica.

Terminata l'inizializzazione invochiamo il metodo `updateOne()` indicandogli l’identificativo del documento da eliminare. Se 
l'operazione è andata a buon fine e non si sono verificati errori nell'operazione, MongoDB ci restituirà un'oggetto che conterrà 
la sintesi di quando avvenuto, in particolare la variabile `deletedCount` indica il numero di documenti eliminati dalla collection. 
Se l'identificativo viene trovato allora la proprietà verrà impostata a 1 e il nostro metodo ritornerà un 204 (*No Content*). 
In caso contrario, invece, il valore verrà impostato a 0 quindi il nostro metodo restituirà un 404 (*Not Found*).

Possiamo effettuare un test velocemente utilizzando Postman inviando una richiesta DELETE all'indirizzo `http://localhost:3000/film/:id` 
e controllare se tutto va a buon fine:

![](./img/ch-12/12.png)

### Persistenza dati in Redis

Redis è un contenitore dati esattamente come MySQL e MongoDB con l'unica differenza che mantiene tutto in memoria. Nel suo utilizzo 
comune Redis viene utilizzato per il caching dei dati o come broker di messaggi. Usato nel modo corretto però, Redis può essere 
utilizzato anche come semplice base dati. In questa sezione vedremo come è possibile creare la nostra API utilizzando Redis come 
base dati e il plugin [`fastify-redis`](https://github.com/fastify/fastify-redis).

> Un [broker di messaggi](https://en.wikipedia.org/wiki/Message_broker) è un programma intermedio che traduce un messaggio 
dal protocollo di messaggistica formale del mittente al protocollo di messaggistica formale del ricevitore. I broker di 
messaggi sono elementi di telecomunicazione o reti di computer in cui le applicazioni software comunicano scambiando messaggi 
definiti in modo formale.

#### Installiamo Redis

Utilizziamo Docker per installare un server Redis. Anche qui Docker Hub fornisce l'immagine ufficiale di Redis 
([https://hub.docker.com/_/redis](https://hub.docker.com/_/redis)). Installiamola digitando il seguente comando dal nostro terminale:

```
$ docker run --publish 6379:6379 --name fastify-redis --detach redis
```

Così come accaduto negli altri casi, nel caso in cui non abbiamo l'immagine di Redis a disposizione sulla nostra macchina, 
Docker si occupera di scaricarla e avviarla per noi. In tal caso una serie di righe verranno stampate sullo standard output 
del nostro terminale:

```
Unable to find image 'redis:latest' locally
latest: Pulling from library/redis
07aded7c29c6: Already exists 
1a5d64c027a4: Pull complete 
189d72810950: Pull complete 
ae0debab837c: Pull complete 
ddc207d933b8: Pull complete 
fc4cecccd6e7: Pull complete 
Digest: sha256:11f7040a861a1456ecad6d58babe47e2c8d05b626187a671bd72aa876d7cd419
Status: Downloaded newer image for redis:latest
e84e7a9a73ee46b12e534c4bd4c9ef232d2f04f9e2227e8692b71d3f4ec51e48
```

Verifichiamo che tutto è andato a buon fine con il comando `$ docker ps`:

![](./img/ch-12/13.png)

Di default il nostro server Redis sarà disponibile su `locahost:6379`. Ora che siamo pronti, è possibile procedere con l'inizializzazione del progetto.

#### Inizializziamo il progetto

La struttura del nostro progetto sarà pressocché identica alle precedenti. Iniziamo con l'inizializzazione eseguendo questi comandi dal terminale:

```
$ mkdir redisApp
$ cd redisApp
$ npm init -y
$ npm install --save fastify fastify-redis fastify-plugin dotenv uuid
$ mkdir plugins routes
$ touch server.js plugins/redis.js routes/films.js .env
```

Una volta terminato l'albero della directory `redisApp` avrà il seguente aspetto:

```
./redisApp
├── node_modules
├── package.json
├── package-lock.json
├── plugins
│   └── redis.js
├── routes
│   └── films.js
└── server.js
```

Da notare che in questo caso utilizziamo il plugin [`fastify-redis`](https://github.com/fastify/fastify-redis). Utilizzando questo plugin nelle 
nostre applicazioni Fastify è possibile condividere la stessa connessione Redis in ogni parte del nostro server. Il plugin è un wrapper 
del modulo [ioredis](https://github.com/luin/ioredis), il quale viene utilizzato come client. Le opzioni possono essere passate al plugin 
vengono inoltrate al client Redis.

Da notare anche l'utilizzo del modulo [`uuid`](https://www.npmjs.com/package/uuid). Questo modulo ci consentirà di creare UUID, 
utilizzabili come chiavi in Redis, secondo la specifica [RFC4122](https://www.ietf.org/rfc/rfc4122.txt).

Ora che il progetto è stato inizializzato, creiamo il file che conterrà le variabili d'ambiente che utilizzerà il 
nostro plugin `fastify-redis`:

```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_FILM_NAMESPACE=films
```

Il nostro file `server.js` è sempre simile ai precedenti tranne per il fatto che registriamo un plugin Fastify con un path diverso rispetto ai precedenti:

```javascript
import fastify from 'fastify'({
  logger: true
})

import 'dotenv/config'
fastify.register('./plugins/redis')
fastify.register('./routes/films', { prefix: '/film' })

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

In questo esempio faremo utilizzo dei namespace di Redis. Quindi nel file `redis.js` andremo a registrare il plugin `fastify-redis` nel seguente modo:

```javascript
import redis from 'fastify-redis'
import fp from 'fastify-plugin'

export default fp(async (fastify, opts) => {
  fastify.register(redis, { 
    host: process.env.REDIS_HOST, 
    port: process.env.REDIS_PORT,
    namespace: process.env.REDIS_FILM_NAMESPACE
  })
})
```

Nel nostro caso faremo utilizzo di un solo un namespace, ma il plugin consente la gestione di diversi namespace nel seguente modo:

```javascript
fastify
  .register('fastify-redis', {
    host: '127.0.0.1',
    port: 6380,
    namespace: 'hello'
  })
  .register('fastify-redis', {
    host: '127.0.0.1',
    port: 6380,
    namespace: 'world'
  })
```

Ora che tutto è pronto partiamo dalla solita struttura iniziale del file `films.js`:

```javascript
import {  v4: uuidv4  } from 'uuid'

export default async (fastify, opts) => {
  const { REDIS_FILM_NAMESPACE: namespace } = process.env
  const films = fastify.redis[namespace]

  fastify.post('/', async (req, res) => { })

  fastify.get('/list', async (req, res) => { })

  fastify.put('/:id', async (req, res) => { })

  fastify.delete('/:id', async (req, res) => { })
}
```

Avendo utilizzato una varibile d'ambiente per il namespace che conterrà tutti nostri film, abbiamo la necessità di utilizzarla anche per recuperare il client Redis che il plugin Fastify ci metterà a disposizione. Nel nostro esempio sarà `fastify.redis.films`.

##### Creazione

Il metodo che si occuperà del salvataggio delle informazioni inerenti ad un film utilizzerà il metodo `set()` esposto dal client Redis. Vediamo come:

```javascript
fastify.post('/', async (req, res) => {
  const film = req.body
  const uuid = uuidv4()

  Object.assign(film, {
    id: uuid
  })

  try {
    const response = await films.set(uuid, JSON.stringify(film))
    
    if (response === 'OK') {
      return { id: uuid }
    }
    
    throw new Error(response)
  } catch (err) {
    fastify.log.error(err)
    return res
      .code(500)
      .send({ message: err.message })
  }
})
```

L'API esposta dall'oggetto `films` ci mette a disposizione una serie di metodi per gestire le coppie chiave-valore salvate nel 
namespace. Per creare una nuova coppia chiave-valore utilizziamo il metodo `set(key, value)` esposto dall'API Redis e di una chiave 
univoca. Utilizziamo la funzione `uuid.uuidv4()` per generare la chiave, e la utilizziamo come identificativo nel nostro film e 
come chiave in Redis.

Se l'operazione è andata a buon fine Redis resituirà la stringa `OK` come risultato. A questo punto restituiremo al client 
l'id del film appena creato, così come fatto negli altri esempi.

Nel caso in cui si verifica un errore in fase di esecuzione, questo verrà catturato dal blocco `catch`, verrà scritto sullo 
standard error e verrà inviato il  messaggio al client con un codice di risposta 500 (*HTTP Internal Server Error*).

Terminata l'implementazione del primo metodo, possiamo avviare l'applicazione con il comando `$ node server.js` e utilizzare 
Postman per inviare una richiesta POST con il seguente body in formato JSON:

```
{
  "release_date": "1986-08-01",
  "title": "Flight of theNavigator",
  "production": "PSO Productions Viking Film AS",
  "description": "On the night of July 4, 1978, in Fort Lauderdale, Florida, 12-year-old David Freeman walks through the woods to pick up his 8-year-old younger brother...",
  "cast": "Joey Cramer, Sarah Jessica Parker, Veronica Cartwright...",
  "price": 30
}
```

Se tutto è andato a buon fine Redis avrà restituito `OK` e il nostro handler ritornerà la nuova chiave appena creata, in questo 
caso l'identificativo `4e82c2cf-7a23-41f7-b70d-fa32913f5020`:

![](./img/ch-12/14.png)

##### Lista

L'implementazione della richiesta si suddivide in due fasi. Nella prima ci faremo restituire tutte le chiavi registrate nel namespace 
`films`, mentre nella seconda utilizzando un ciclo `for..of` richiederemo i dati associati ad ogni singola chiave restituita in modo 
da poter restituire i dati al client. Di seguito ecco i dettagli implementativi:

```javascript
fastify.get('/list', async (req, res) => {
  try {
    const response = await films.keys('*')
    const filmList = []
    
    for (const k of response) {
      let film = await films.get(k)
      film = JSON.parse(film)
      
      filmList.push(film)
    }

    return filmList
  } catch (err) {
    fastify.log.error(err)
    return res
      .code(500)
      .send({ message: err.message })
  }
})
```

Il metodo `keys()` resituisce, in un array, tutte le chiavi che rispettano il criterio di ricerca passatogli come parametro. 
Per fare in modo che questo metodo restituisca tutte le chiavi presenti nel namespace basta passargli il carattere `'*'`. Da questo 
punto di vista Redis è molto performante nell'effettuare ricerche di questo tipo, infatti su un laptop entry level può effettuare 
la scansione di un milione di chiavi in pochissimi millisecondi.

Una volta ricevute le chiavi da Redis, effettuiamo un ciclo `for..of` e richiediamo il valore associato ad ogni singola chiave 
utilizzando il metodo `get(key)`. Effettuiamo il `JSON.parse` dei dati e li salviamo in un array temporaneo che restituiremo al 
client una volta terminato il ciclo.

Nel caso in cui si verifica un errore in fase di esecuzione, questo verrà catturato dal blocco `catch`, verrà scritto sullo 
standard error e verrà inviato il  messaggio al client con un codice di risposta 500 (*HTTP Internal Server Error*).

Effettuiamo un test con Postman per verificare che tutto funzioni correttamente. Creiamo una richiesta GET verso 
`http://localhost:3000/film/list`. Il risultato che otterremo è qualcosa tipo:

![](./img/ch-12/15.png)

##### Modifica

Anche in questo caso la modifica si suddivide in due fasi. Nella prima verificheremo che l'identificativo inviato come parametro 
della richiesta sia presente nel nostro namespace Redis. Nella seconda, invece, andremo a salvare i dati nel nostro namespace. 
Ecco come si presenta il metodo:

```javascript
fastify.put('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const data = await films.get(id)
    if (!data) {
      return res
        .code(404)
        .send({ message: `No data found with ID ${id}` })
    }

    const film = JSON.parse(film)
    Object.assign(film, {
      ...req.body
    })

    await films.set(id, JSON.stringify(film))

    return res
      .code(204)
      .send()
  } catch (err) {
    fastify.log.error(err)
    return res
      .code(500)
      .send({ message: err.message })
  }
})
```

Noterete che utilizziamo il metodo `get()` per verificare se la chiave, ed il relativo valore, sono presenti in Redis. Nel caso 
in cui l'identificativo inviato come parametro non è presente, viene restituito un 404 (*Not Found*) al client. 

:::tip
Questa operazione è necessaria in quanto utilizziamo il metodo `set()` di Redis per l'aggiornamento e senza un controllo il 
metodo sarebbe praticamente uguale alla creazione. Invece noi vogliamo che sia un aggiornamento di una coppia chiave-valore.
:::

Se il metodo `get()` restituisce i dati del film che vogliamo aggiornare, utilizziamo `JSON.parse` per trasformarlo in un 
oggetto JavaScript e successivamente aggiorniamo i dati del film ed effettuiamo nuovamente un salvataggio in Redis utilizzando il 
metodo `set()`. Il metodo restituirà un 204 (*No Content*) nel caso l'operazione va a buon fine.

Nel caso in cui si verifica un errore in fase di esecuzione, questo verrà catturato dal blocco `catch`, verrà scritto sullo 
standard error e verrà inviato il  messaggio al client con un codice di risposta 500 (*HTTP Internal Server Error*).

A questo punto possiamo effettuare un test con Postman inviando una richiesta PUT all'indirizzo `http://localhost:3000/film/:id`. 
Se tutto è stato implementato bene il risultato sarà qualcosa di simile a quanto mostrato in figura: 

![](./img/ch-12/16.png)

##### Eliminazione

Arriviamo ora all'ultimo metodo, quello dell'eliminazione. Per effettuare questa operazione utilizziamo il metodo `del()`:

```javascript
fastify.delete('/:id', async (req, res) => {
  try {
    const response = await films.del(req.params.id)

    if (response === 0) {
      return res
        .code(404)
        .send({ message: `No data found with ID ${id}` })
    }

    return res
      .code(204)
      .send()
  } catch (err) {
    fastify.log.error(err)
    return res
      .code(500)
      .send({ message: err.message })
  }
})
```

Quando invocato, viene passato l'identificativo inviato come parametro alla funzione `del()` che provvederà all'eliminazione 
dei dati in Redis. Il metodo restituisce un intero che corrisponde al numero di chiavi-valore eliminati dal namespace. 

Se il numero ritornato dalla funzione è uguale a 0 allora ritorniamo un 404 (*Not Found*) al client con il relativo 
messaggio di errore. In caso contrario verrà inviata una risposta con codice 204 (*No Content*).

Come nei casi precedenti, nel caso in cui si verifica un errore in fase di esecuzione, questo verrà catturato dal blocco 
`catch`, verrà scritto sullo standard error e verrà inviato il  messaggio al client con un codice di risposta 
500 (*HTTP Internal Server Error*).

Utilizziamo Postman inviando una richiesta DELETE all'indirizzo `http://localhost:3000/film/:id`. Se tutto è stato implementato 
bene il risultato sarà qualcosa di simile a quanto mostrato in figura:

![](./img/ch-12/17.png)

### Persistenza dati in Elasticsearch

[Elasticsearch](https://www.elastic.co/elasticsearch/) è un motore di ricerca e analisi distribuito e open source per tutti i 
tipi di dati, inclusi testuali, numerici, geospaziali, strutturati e non strutturati. È basato su Apache Lucene ed è stato 
rilasciato per la prima volta nel 2010 da Elasticsearch N.V. (ora noto come Elastic). Conosciuto per le sue semplici API REST, 
la natura distribuita, la velocità e la scalabilità, Elasticsearch è il componente centrale di Elastic Stack, un set di strumenti 
open source per l’acquisizione, l’arricchimento, l’archiviazione, l’analisi e la visualizzazione dei dati. Comunemente 
denominato [ELK Stack](https://www.elastic.co/elastic-stack/) (dopo Elasticsearch, Logstash e Kibana), Elastic Stack ora 
include una ricca raccolta di integratori noti come Beats per l’invio di dati a Elasticsearch.

Sostanzialmente Elasticsearch è un database orientato ai documenti. Dati grezzi fluiscono in Elasticsearch da una varietà di fonti, inclusi log, metriche di sistema e applicazioni web. L’inserimento dei dati è il processo mediante il quale questi dati grezzi vengono analizzati, normalizzati e arricchiti prima di essere indicizzati in Elasticsearch. Una volta indicizzati in Elasticsearch, gli utenti possono eseguire query complesse sui propri dati e utilizzare aggregazioni per recuperare riepiloghi complessi dei propri dati. Da https://www.elastic.co/kibana/[Kibana], gli utenti possono creare visualizzazioni potenti dei propri dati, condividere dashboard e gestire lo stack.

##### Installiamo Elasticsearch

Faremo utilizzo di Docker per installare ed eseguire Elasticsearch sulla nostra macchina. Docker Hub fornisce l'immagine ufficiale 
di Elasticsearch ([https://hub.docker.com/_/elasticsearch](https://hub.docker.com/_/elasticsearch)) che è possibile installare con 
il comando seguente:

```
docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -n fastify-elasticsearch --detach elasticsearch:7.5.2
```

Nel caso in cui non abbiamo a disposizione l'immagine di Elasticsearch, Docker si preoccuperà di scaricarla e avviarla per noi. 
In tal caso una serie di righe verranno stampate sullo standard output del nostro terminale:

```
Unable to find image 'elasticsearch:7.5.2' locally
7.5.2: Pulling from library/elasticsearch
ab5ef0e58194: Pull complete 
ac819c75e084: Pull complete 
cca059a702d3: Pull complete 
4a32d65abda1: Pull complete 
c82eff1e95f2: Pull complete 
63248d573ce9: Pull complete 
6ce84b7d8f21: Pull complete 
Digest: sha256:48eb5c1bb32224cee8fdf8362bc1f0ef1fce39acf7d5f68023c9f1f3c89f1f0d
Status: Downloaded newer image for elasticsearch:7.5.2
eac0fe5caf6e98723082ea82d2001c12099f346051552a7de49d922e049ef24b
```

Una volta terminata l'installazione, possiamo utilizzare il comando `$ docker ps` e controllare che il nostro ambiente sia in esecuzione:

![](./img/ch-12/19.png)

Per verificare che tutto si è concluso correttamente è possibile navigare all'indirizzo `http://localhost:9200` e verificare se vengono 
restituite una serie di informazioni in formato JSON:

```
{
  "name" : "b5db270d86d3",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "8H0-2otpQNuj2Lz024CmAg",
  "version" : {
    "number" : "7.5.2",
    "build_flavor" : "default",
    "build_type" : "docker",
    "build_hash" : "8bec50e1e0ad29dad5653712cf3bb580cd1afcdf",
    "build_date" : "2020-01-15T12:11:52.313576Z",
    "build_snapshot" : false,
    "lucene_version" : "8.3.0",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```

#### Inizializziamo il progetto

La struttura del progetto è sempre simile a quella utilizzata per gli altri progetti creati in questo capitolo:

```
$ mkdir elasticApp
$ cd elasticApp
$ npm init -y
$ npm install fastify fastify-elasticsearch --fastify-plugin dotenv uuid
$ mkdir routes plugins
$ touch server.js routes/films.js plugins/elasticsearch.js .env
```

Una volta eseguiti i comandi, la struttura dei files e delle directory del nostro progetto avrà il seguente aspetto:

```
./elasticApp
├── node_modules
├── package.json
├── package-lock.json
├── plugins
│   └── elasticsearch.js
├── routes
│   └── films.js
└── server.js
```

In questo progetto utilizzeremo il plugin Fastify [https://github.com/fastify/fastify-elasticsearch](https://github.com/fastify/fastify-elasticsearch). 
Questo plugin consente di condividere lo stesso client Elasticsearch in ogni parte nel nostro server. Il plugin altro non è che un wrapper del 
[modulo ufficiale](https://www.npmjs.com/package/@elastic/elasticsearch) Elasticsearch. Il plugin accetta le stesse opzioni del client ufficiale.

Anche in questo caso utilizzeremo il modulo [uuid](https://www.npmjs.com/package/uuid) per creare id univoci per i nostri documenti.

Ora possiamo definire alcune variabili d'ambiente che ci serviranno per inizializzare il nostro plugin Fastify. Nel 
file `.env` aggiungiamo quanto segue:

```
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_INDEX=films
```

Il nostro file `server.js` si occuperà di registrare i plugin e di eseguire il nostro server HTTP, esattamente come negli esempi in precedenza:

```javascript
import fastify from 'fastify'({
  logger: true
})

import 'dotenv/config'
fastify.register('./plugins/elasticsearch')
fastify.register('./routes/films', { prefix: '/film' })

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

Nel file `elasticsearch.js` provvediamo alla registrazione del plugin Fastify nel seguente modo:

```javascript
import elasticsearch from 'fastify-elasticsearch'
import fp from 'fastify-plugin'

export default fp(async (fastify, opts) => {
  const {
    ELASTICSEARCH_HOST: host,
    ELASTICSEARCH_PORT: port
  } = process.env

  fastify.register(elasticsearch, { 
    node: `http://${host}:${port}`
  })
})
```

Per impostazione predefinita, `fastify-elasticsearch` tenterà di eseguire il ping del cluster non appena si avvia Fastify, 
ma in alcuni casi il ping potrebbe non essere supportato a causa delle autorizzazioni dell'utente. Se lo si desidera, è possibile 
disabilitare il ping iniziale con l'opzione `healthcheck`:

```javascript
import elasticsearch from 'fastify-elasticsearch'
import fp from 'fastify-plugin'

export default fp(async (fastify, opts) => {
  const {
    ELASTICSEARCH_HOST: host,
    ELASTICSEARCH_PORT: port
  } = process.env

  fastify.register(elasticsearch, { 
    node: `http://${host}:${port}`,
    healtcheck: false // disabilita il ping
  })
})
```

Inoltre se si desidera connettersi a diversi cluster è possibile passare come opzione la variabile `namespace` nel seguente modo:

```javascript
fastify.register('fastify-elasticsearch', {
  node: 'http://localhost:9200',
  namespace: 'cluster1'
})

fastify.register('fastify-elasticsearch', {
  node: 'http://localhost:9201',
  namespace: 'cluster2'
})
```

Il nostro plugin sembra essere pronto, ma manca ancora una piccola cosa, la creazione di un indice. Un indice in Elasticsearch 
rappresenta una raccolta di documenti correlati tra di loro. Elastisearch archivia questi documenti in formato JSON. Ogni documento 
possiede quindi una serie di chiavi (proprietà) con i corrispondenti valori (stringhe, numeri, valori booleani o altri tipi di dati). 
A questo punto possiamo utilizzare `fastify.decorate` per aggiungere una funzione che verrà richiamata ogni volta che il nostro 
server verrà avviato. Chiameremo questa funzione `configureIndices`. Nel file `elasticsearch.js` aggiungiamo le seguenti linee 
di codice:

```javascript
...

export default fp(async (fastify, opts) => {
  const {
    ...
    ELASTICSEARCH_INDEX: index
  } = process.env

  ...

  fastify.decorate('configureIndices', async () => {
    let result = await fastify.elastic.indices.exists({ index: index })
  
    if (result.statusCode === 404) {
      await fastify.elastic.indices.create({
        index: index,
        body: {
          mappings: {
            properties: {
              id: { type: 'text' },
              release_date: { type: 'date' },
              title: { type: 'text' },
              production: { type: 'text' },
              description: { type: 'text' },
              cast: { type: 'text' },
              price: { type: 'integer' }
            }
          }
        }
      })

      fastify.log.info(`Index with name ${index} created successfully!`)
    }
  })
})
```

La funzione utilizza il client esposto dal plugin Fastify sulla proprietà `fastify.elastic` che mette a disposizione una serie di 
proprietà ed API che possiamo utilizzare per comunicare con Elasticsearch. Potete dare uno sguardo alla 
[documentazione ufficiale](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html) dell'API JavaScript. 

L'oggetto `indices` esposto dall'API mette a disposizione una serie di funzioni utili per creare e gestire gli indici in 
Elasticsearch. La prima che utilizziamo è [`indices.exists()`](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_indices_exists). 
Questa funzione prende in input un oggetto strutturato con alcune proprietà tra cui `index`. Il valore può essere una stringa o 
una serie di stringhe separate da virgola e restituisce 200 nel caso in cui gli indici sono stati trovati o 404 nel caso in cui 
uno o più indici non sono stati creati.

Se il risultato è 404 allora procediamo alla creazione del nostro indice utilizzando la funzione [`indices.create()`](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_indices_exists) 
che prende in input un'oggetto con una serie proprietà tra cui il nome dell'indice che vogliamo creare, `index`, 
e `body`. In quest'ultima possiamo specificare una mappatura dei campi che l'indice si aspetta di ricevere in un certo 
formato. Nel caso in cui il formato non è rispettato, in fase di creazione o modifica, l'API ritornerà un errore. Esistono diversi 
formati che si possono specificare quando dichiariamo una mappatura. L'elenco completo è possibile consultarlo sulla 
[documentazione ufficiale](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html) di Elasticsearch.

Nel caso in cui la creazione dell'indice avviene senza errori stamperemo a video un messaggio dell'avvenuta creazione.

Ora che tutto è pronto creiamo lo scheletro delle rotte che implementeremo. Nel file `films.js` scriviamo quanto segue:

```javascript
import {  v4: uuidv4  } from 'uuid'

export default async (fastify, opts) => {  
  const { ELASTICSEARCH_INDEX: index } = process.env
  await fastify.configureIndices()

  fastify.post('/', async (req, res) => { })

  fastify.get('/list', async (req, res) => { })

  fastify.put('/:id', async (req, res) => { })

  fastify.delete('/:id', async (req, res) => { })
}
```

Ad ogni avvio del server, nel momento in cui si effettua la registrazione del plugin `films.js` verrà invocata la funzione 
`fastify.configureIndices()` di cui abbiamo discusso in precedenza. Infatti se proviamo ad avviare il server, comparirà il 
seguente log nel terminale:

```
$ node server.js
{"level":30,"time":1633776590605,"pid":34150,"hostname":"DebianXPS","msg":"Index with name films created successfully!"}
{"level":30,"time":1633776590610,"pid":34150,"hostname":"DebianXPS","msg":"Server listening at http://127.0.0.1:3000"}
```

Ovviamente negli avvii successivi il log non verrà più stampato in quanto l'indice già esiste.

##### Creazione

La creazione di un nuovo documento in Elasticsearch utilizza il metodo [`create()`](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html) 
esposto dall'API del client. Vediamo come utilizzarlo per salvare i dati relativi al nostro film preferito:

```javascript
fastify.post('/', async (req, res) => {
  const film = req.body
  const id = uuidv4()

  Object.assign(film, {
    id: id
  })

  try {
    await fastify.elastic.create({
      id: id,
      index: index,
      body: film
    })

    return { id: id }
  } catch (err) {
    fastify.log.error(err)
    return res
      .code(500)
      .send({ message: err.message })
  }
})
```

Il metodo riceve in input un oggetto con diverse proprietà tra cui: 

- `id`: l'identificativo del nostro documento. In questo esempio abbiamo utilizzato una stringa univoca generata da `uuidv4()`.
- `index`: il nome dell'indice in cui salvare il documento.
- `body`: l'oggetto che vogliamo salvare.

In caso di errori verrà restituito al client un 500 (*HTTP Internal Server Error*) con il relativo messaggio dell'errore che si è 
verificato, altrimenti verrà restituito l'identificativo del documento appena salvato.

Ora possiamo effettuare un test con Postman. Avviamo il server con il comando `$ node server.js` e inviamo una richiesta POST all'indirizzo 
`http://localhost:3000/film` con il seguente body:

```
{
  "release_date": "1986-08-01",
  "title": "Flight of the Navigator",
  "production": "PSO Productions Viking Film AS",
  "description": "On the night of July 4, 1978, in Fort Lauderdale, Florida, 12-year-old David Freeman walks through the woods to pick up his 8-year-old younger brother...",
  "cast": "Joey Cramer, Sarah Jessica Parker, Veronica Cartwright...",
  "price": 30
}
```

Se tutto è andato bene, l'output ricevuto sarà simile a quello illustrato nella figura sottostante:

![](./img/ch-12/18.png)

##### Lista

L'implementazione di questo metodo è molto semplice. La funzione 
[`search()`](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_search) esposta dall'API 
del client JavaScript di Elasticsearch ci consente di effetuare ricerche sui documenti salvati in precedenza. Nel nostro caso non abbiamo 
la necessità di effettuare ricerche particolari quindi eseguiamo una ricerca senza condizioni sull'indice `films`. 
Vediamo in dettaglio l'implementazione:

```
fastify.get('/list', async (req, res) => {
  try {
    const { body: result } = await fastify.elastic.search({
      index: index
    })

    return result.hits.hits.map(entry => entry._source)
  } catch (err) {
    fastify.log.error(err)
    return res
      .code(500)
      .send({ message: err.message })
  }
})
```

Il risultato che ci verrà restituito da Elasticsearch è un oggetto abbastanza complesso e contiene molte informazioni. Eccone un esempio:

```
{
  "body": {
    "took": 7,
    "timed_out": false,
    "_shards": {
      "total": 1,
      "successful": 1,
      "skipped": 0,
      "failed": 0
    },
    "hits": {
      "total": {
        "value": 1,
        "relation": "eq"
      },
      "max_score": 1,
      "hits": [
        {
          "_index": "films",
          "_type": "_doc",
          "_id": "605b5d00-bc69-49ec-bca3-e4f80bf63df1",
          "_score": 1,
          "_source": {
            "release_date": "1986-08-01",
            "title": "Flight of the Navigator",
            "production": "PSO Productions Viking Film AS",
            "description": "On the night of July 4, 1978, in Fort Lauderdale, Florida, 12-year-old David Freeman...",
            "cast": "Joey Cramer, Sarah Jessica Parker, Veronica Cartwright...",
            "price": 30,
            "id": "605b5d00-bc69-49ec-bca3-e4f80bf63df1"
          }
        },
        {
          "_index": "films",
          "_type": "_doc",
          "_id": "6e8a651b-b16f-441d-8f14-c3333dd2fcb7",
          "_score": 1,
          "_source": {
            "release_date": "1985-12-20",
            "title": "Goonies",
            "production": "Warner Bros. Pictures, Amblin Entertainment",
            "description": "A group of young misfits called The Goonies discover ...",
            "cast": "Sean Astin, Josh Brolin, Jeff Cohen, Corey Feldman...",
            "price": 20,
            "id": "6e8a651b-b16f-441d-8f14-c3333dd2fcb7"
          }
        }
      ]
    }
  },
  "statusCode": 200,
  "headers": {
    ...
  },
  "meta": {
    ...
  }
}
```

Da notare che quello che ci interessa restituire si trova al path `body.hits.hits`. Quindi utilizziamo la destrutturazione per prendere 
in considerazione solo la variabile `body` dal risultato restituito e utilizziamo `map()` per ciclare l'array `body.hits.hits` e 
prendere in considerazione solo il contenuto che ci interessa per ogni oggetto restutito, ossia il contenuto della variabile `_source`.

In caso di errore, verrà restituito un errore 500 (*HTTP Internal Server Error*) con il relativo messaggio dell'errore verificatosi.

Utilizzando Postman possiamo effettuare un test inviando una richiesta GET all'indirizzo `http://localhost:3000/film/list`:

![](./img/ch-12/20.png)

##### Modifica

Per effettuare la modifica di un documento all'interno del nostro indice `films` in Elasticsearch, utilizzeremo il metodo 
[`update()`](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_update) esposto 
dall'API JavaScript. Di seguito l'implementazione:

```javascript
fastify.put('/:id', async (req, res) => {
  const { id } = req.params
  
  try {
    const { statusCode, body } = await fastify.elastic.get({
      index: index,
      id: id
    }, { ignore: [404] })

    if (statusCode === 404) {
      return res
        .code(404)
        .send({ message: `No document found with ${id}` })
    }

    const film = Object.assign(body._source, {
      id: id,
      ...req.body
    })

    await fastify.elastic.update({
      index: index,
      id: id,
      refresh: 'wait_for',
      body: { doc: film }
    })

    return res
      .code(204)
      .send()
  } catch (err) {
    fastify.log.error(err)
    return res
      .code(500)
      .send({ message: err.message })
  }
})
```

Prima di effettuare l'update controlliamo se è presente il documento con l'identificativo utilizzando il metodo 
[get()](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_get). Effettuiamo una ricerca puntuale 
per l'identificativo del documento. Il secondo parametro `{ ignore: [404] }` dice al client JavaScript di non lanciare un'eccezione 
nel caso in cui il documento non viene trovato nell'indice. Nel caso in cui il documento non viene trovato, la 
variabile `statusCode` conterrà il valore 404 (*Not Found*), e ci preoccupiamo di restituire al client questo valore con il 
relativo messaggio d'errore. Se il documento esiste nel nostro indice, allora effettuiamo l'aggiornamento dei dati utilizzando 
il metodo [`update()`](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_update). 
Se tutto è andato a buon fine, viene restituito al client un 204 (*No Content*).

> È possibile anche utilizzare solo il metodo `update()` specificando il secondo parametro `{ ignore: [404] }`, ma in tal caso abbiamo 
la necessità di inviare tutte le proprietà nel body della richiesta HTTP, altrimenti il documento viene sovrascritto e conterrà solo 
le proprietà specificate nella richiesta.

Nel caso in cui si verifica un errore verrà restituito un 500 (*HTTP Internal Server Error*) al client con il dettaglio sull'errore 
che si è verificato.

È possibile utilizzare Postman per effettuare un test. Inviando una richiesta PUT all'indirizzo `http://localhost:3000/film/:id` 
con il relativo body contente le proprietà che desideriamo aggiornare:

![](./img/ch-12/21.png)

##### Eliminazione

Non verranno dati dettagli implementativi di questo metodo, bensì viene lasciato come esercizio da svolgere alla fine di questo capitolo.

## Validare e serializzare le rotte

Molto spesso è necessario che le API convalidino i dati delle richieste in ingresso. In sostanza parliamo della convalida di 
oggetti JSON, utili a garantire la presenza o meno di proprietà obbligatorie ed il rispetto di eventuali formati (numero, 
stringa, email etc.). Queste convalide solitamente vengono eseguite nel contesto [JSON Schema](https://json-schema.org). 
JSON Schema è un linguaggio grammaticale utile per la definizione del contenuto e della semantica di oggetti JSON. Consente 
di specificare metadati sul significato e sulla validazione delle proprietà di un oggetto.

Fastify utilizza un approccio basato su schema per validare le rotte e serializzare le risposte. Non è obbligatorio ma è consigliato 
l'utilizzo di JSON Schema per la validazione. Quest'ultima viene effettuata dal modulo [Ajv v6](https://www.npmjs.com/package/ajv/v/6.12.6), 
mentre la serializzazione dei dati viene effettuata da [fast-json-stringify](https://www.npmjs.com/package/fast-json-stringify).

### Sintattica e semantica

Quando validiamo sintatticamente un oggetto JSON senza uno schema stiamo semplicemente validando la sintassi. 
La *validazione sintattica* si preoccupa solo ed esclusivamente del formato dell’oggetto. Esistono molti tool online che fanno 
questo lavoro come ad esempio [JSON formatter](https://jsonformatter.curiousconcept.com/).

La *validazione semantica*, invece, va oltre la validazione sintattica. Esegue i controlli sulla sintassi e sui dati 
dell’oggetto JSON. Questo tipo di validazione garantisce che il client invii solo ed esclusivamente le coppie chiave/valore 
consentiti dallo schema. La validazione semantica, inoltre, può aiutare anche nel controllo del formato dei dati (i valori). 
Per esempio, è possibile validare un numero di telefono, un datetime, un codice postale, un indirizzo email e così via.

### Validare le rotte in Fastify con JSON Schema

Come già anticipato in precedenza la validazione viene effettuata dal modulo Ajv v6 ma è possibile utilizzare qualsiasi 
validatore si preferisce. Validare i dati in input è veramente semplice, basta specificare i valori da validare nella 
proprietà `schema` della nostra rotta. La proprietà `schema` è un oggetto su cui è possibile specificare le seguenti proprietà:

- *`body`*: valida i dati del body di una richiesta POST, PUT e PATCH.
- *`params`*: valida i dati inviati come parametri sulla rotta.
- *`query`*: valida i dati inviati come query string.
- *`headers`*: valida i dati contentuti nell'intestazione di una richiesta.

Tutte le validazioni possono essere JSON Schema completi o semplici validazioni come campi obbligatori e messaggi d'errore. 
Negli esempi riguardanti il salvataggio dei dati fatti nei paragrafi precedenti, non ci siamo preoccupati di validare i dati 
in ingresso. Vediamo ora come validare i dati in input utilizzando JSON Schema. Per esempio, validiamo la rotta che si occupa 
della creazione di un film. Copiamo il progetto `mongoApp` in un nuovo progetto (ma qualsiasi altro progetto andrebbe bene 
allo stesso modo):

```
$ cp -R mongoApp jsonSchemaApp
$ cd jsonSchemaApp
```

Il codice che si occupa della creazione di un film attualmente si presenta nel seguente modo:

```javascript
fastify.post('/', async (req, res) => {
  const film = req.body

  try {
    const response = await collection.insertOne(film)
    return { id: response.insertedId }
  } catch (err) {
    fastify.log.error(err.message)
    return res
      .code(500)
      .send({ message: err.message })
  }
})
```

Quando una rotta viene dichiarata in Fastify è possibile specificare una [serie di opzioni](https://www.fastify.io/docs/latest/Routes/#options). 
Per esempio possiamo aggiungere un hook (`preHandler`, `onRequest` e altro ancora) o specificare il livello di log, o ancora una 
specifica versione. Tra le opzioni è possibile specificare lo schema JSON che si occuperà della validazione dei dati in input:

```javascript
fastify.post('/', {
  schema: {
    description: 'This method save film information',
    body: {
      type: 'object',
      properties: {
        release_date: { type: 'string', format: 'date' },
        title: { type: 'string', maxLength: 150 },
        production: { type: 'string' },
        description: { type: 'string' },
        cast: { type: 'string' },
        price: { type: 'integer' }
      },
      required: ['title', 'price', 'release_date']
    }
  }
}, async (req, res) => {
  ...
})
```

In questo esempio abbiamo specificato lo schema del body della richiesta POST, e quindi della creazione di un film. Abbiamo 
specificato che il body deve essere necessariamente un oggetto JSON che rispetti le seguenti regole:

- *`release_date`*: di tipo stringa in formato data. Il campo è obbligatorio.
- *`title`*: di tipo stringa con lunghezza massima di 150 caratteri. Il campo è obbligatorio.
- *`production`*: di tipo stringa.
- *`description`*: di tipo stringa.
- *`cast`*: di tipo stringa.
- *`price`*: di tipo intero. Il campo è obbligatorio.

Proviamo a fare un test utilizzando Postman. Avviamo la nostra applicazione dalla linea di comando digitando `$ node server.js` 
e utilizzando Postman inviamo la seguente richiesta POST all'indirizzo `http://localhost:3000/film` con il seguente body:

```
{
  "release_date": "1986-08-01",
  "production": "PSO Productions Viking Film AS",
  "description": "On the night of July 4, 1978, in Fort Lauderdale, Florida, 12-year-old David Freeman...",
  "cast": "Joey Cramer, Sarah Jessica Parker, Veronica Cartwright...",
  "price": 30
}
```

Noterete che la proprietà `title` è stata omessa di proposito. Inviando questa richiesta riceveremo la seguente risposta:

![](./img/ch-12/22.png)

Il server risponde automaticamente con 400 (*Bad Request*), in quanto non è stata specificata la proprietà `title` 
nel corpo della richiesta. Facciamo ancora un'altro esempio. Questa volta aggiungiamo il campo obbligatorio `title` 
e passiamo il valore `price` come una stringa e non come un valore numerico. Quindi il corpo della richiesta sarà 
il seguente:

```
{
  "release_date": "1986-08-01",
  "title": "Flight of the Navigator",
  "production": "PSO Productions Viking Film AS",
  "description": "On the night of July 4, 1978, in Fort Lauderdale, Florida, 12-year-old David Freeman...",
  "cast": "Joey Cramer, Sarah Jessica Parker, Veronica Cartwright...",
  "price": "this is a string not a number"
}
```

Anche in questo caso, il server risponderà con un 400 (*Bad Request*):

![](./img/ch-12/23.png)

In presenza di uno schema di validazione della richiesta, Fastify in caso di errore di validazione, non esegue l'handler da 
noi specificato. Infatti se diamo uno sguardo al [ciclo di vita](https://www.fastify.io/docs/latest/Lifecycle) di una 
richiesta noteremo che la validazione è lo step che viene eseguito immediatamente prima dell'hook `preHandler`:

![](./img/ch-12/24.png)

Nel caso in cui la richiesta presenta errori di validazione sarà il framework stesso a ritornare una risposta 
negativa, con il relativo messaggio di errore, al client.

#### Schemi condivisi

Fastify fornisce un'API per aggiungere schemi all'istanza Fastify e riutilizzarli ovunque noi vogliamo all'interno della 
nostra applicazione. Una volta aggiunto lo schema all'istanza è possibile utilizzare la parola chiave `$ref`. Immaginiamo 
di avere lo schema in un file separato `filmSchema.js`: 

```javascript
export default {
  $id: 'film',
  type: 'object',
  properties: {
    release_date: { type: 'string', format: 'date' },
    title: { type: 'string', maxLength: 150 },
    production: { type: 'string' },
    description: { type: 'string' },
    cast: { type: 'string' },
    price: { type: 'integer' }
  },
  required: ['title', 'price', 'release_date']
}
```

Ora che lo schema è identificabile in modo univoco, possiamo aggiungerlo all'istanza Fastify nel seguente modo:

```javascript
...
import filmSchema from './filmSchema'
fastify.addSchema(filmSchema)
...
```

A questo punto possiamo utilizzare la parola chiave `$ref` sulla nostra rotta nel modo seguente:

```javascript
fastify.post('/', {
  schema: {
    body: { $ref: 'film#' }
  }
}, async (req, res) => {
  ...
})
```

Se il validatore e il serializzatore sono personalizzati, il metodo `.addSchema` non sarà utile poiché gli attori non 
sono più controllati da Fastify. Per accedere agli schemi aggiunti all'istanza Fastify, puoi semplicemente 
usare `.getSchemas()` o `getSchema()`:

```javascript
fastify.addSchema({
  $id: 'film',
  type: 'object',
  properties: {
    release_date: { type: 'string', format: 'date' },
    title: { type: 'string', maxLength: 150 },
    production: { type: 'string' },
    description: { type: 'string' },
    cast: { type: 'string' },
    price: { type: 'integer' }
  },
  required: ['title', 'price', 'release_date']
})

const allSchemas = fastify.getSchemas()
const filmSchema = fastify.getSchema('film')
```

#### Serializzare le risposte

Solitamente Fastify viene utilizzato per scrivere API Restful, quindi i dati che invieremo ai client saranno in 
formato JSON. Fastify ha un potente strumento per aiutarci, [`fast-json-stringify`](https://www.npmjs.com/package/fast-json-stringify), 
che viene utilizzato se forniamo alla nostra rotta lo schema delle response che la nostra API può restituire. 
È molto importante utilizzare uno schema di output, in quanto può aumentare drasticamente il throughput ci aiuta a prevenire la 
divulgazione accidentale di informazioni sensibili. Tornando alla nostra rotta, vediamo come definire lo schema delle response:

```javascript
fastify.post('/', {
  schema: {
    body: { $ref: 'film#' },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      400: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      500: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    }
  }
}, async (req, res) => {
  ...
})
```

In questo esempio è importante notare due cose. La prima è che le risposte di errore inviate sono identiche quindi anche 
in questo caso possiamo utilizzare uno schema condiviso come fatto in precedenza. Per esempio possiamo creare uno schema 
condiviso con `$id: 'error#'`, in un file separato, e poi aggiungerlo all'istanza Fastify utilizzando `.addSchema()`. 
Quindi creiamo il nostro file `errorSchema.js` con il seguente contenuto:

```javascript
export default {
  $id: 'error',
  type: 'object',
  properties: {
    message: { type: 'string' }
  }
}
```

Fatto ciò aggiungiamo lo schema all'istanza Fastify:

```javascript
...
import errorSchema from './errorSchema'
fastify.addSchema(errorSchema)
...
```

E aggiorniamo lo schema della nostra rotta nel modo seguente:

```javascript
fastify.post('/', {
  schema: {
    body: { $ref: 'film#' },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      400: { $ref: 'error#' },
      500: { $ref: 'error#' }
    }
  }
}, async (req, res) => {
  ...
})
```

La seconda cosa da notare è che nel caso avviene un errore di validazione 400 (*Bad Request*), il processo di validazione 
tenterà di restituire al client un messaggio tipo:

```
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "body.price should be integer"
}
```

Avendo specificato uno schema per la risposta 400 che prevede l'invio di un oggetto, con una singola proprietà `message` 
di tipo stringa, al client verrà inviata solo quella informazione:

```
{
  "message": "body.price should be integer"
}
```

Se proviamo ad effettuare un test con Postman accade quanto mostrato nell'immagine sottostante:

![](./img/ch-12/25.png)

#### Scrivere una buona documentazione

Quando creiamo un'API stiamo essentizialmente scrivendo un contratto. Un contratto tra chi la implementa e il consumatore 
finale. E come la maggior parte degli altri contratti, per funzionare nel modo previsto, un'API dovrebbe documentare i 
suoi vari aspetti. Aspetti come gli endpoint che offre, le operazioni supportate dagli endpoint, la firma che un'operazione 
comprende e la risposta, o le risposte, che possono essere restituite da una richiesta. Inoltre, per soddisfare le richieste 
in continua evoluzione, un'API si evolve nel tempo. In uno scenario del genere, documentare bene un'API non è una scelta ma 
parte integrante delle sue offerte per garantire una migliore esperienza a chi ne usufruisce.

##### La specifica OpenAPI

La specifica [OpenAPI](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md) è uno standard utilizzato per descrivere 
le API Restful. In pratica in un singolo file (YAML o JSON), ci consente di descrivere l'intera API. Per esempio è possibile:

- Definire gli endpoint disponibili, per esempio GET `/film/list` o POST `/film` e così via.
- Definire tutti i parametri di input ed i diversi output per ogni singolo endpoint.
- Definire eventuali metodi di autenticazione.
- Informare l'utilizzatore sui termini di licenza, utilizzo e altre informazioni utili.

Sono stati costruiti una serie di tools su questa specifica che ci possono aiutare nel definire la struttura, le regole e la 
documentazione della nostra API. L'intera famiglia di tools prende il nome di Swagger e include:

- [Swagger Editor](http://editor.swagger.io/?_ga=2.11593332.1161932768.1634288541-1542361088.1634288541): un editor basato su browser che consente di scrivere le specifiche OpenAPI.
- [Swagger UI](https://swagger.io/swagger-ui): che renderizza le specifiche OpenAPI sotto forma di documentazione interattiva.
- [Swagger Codgen](https://github.com/swagger-api/swagger-codegen): un tool che genera lo stub della nostra API nel linguaggio di programmazione desiderato.

:::tip
YAML è un formato per la serializzazione di dati utilizzabile da esseri umani. Il linguaggio sfrutta concetti di altri 
linguaggi come il C, il Perl e il Python e idee dal formato XML e dal formato per la posta elettronica. [Fonte Wikipedia](https://it.wikipedia.org/wiki/YAML)
:::

##### La specifica OpenAPI e JSON Schema

OpenAPI 3.0 utilizza un sottoinsieme esteso di JSON Schema per descrivere i formati dei dati. _"Sottoinsieme esteso"_ significa 
che alcune parole chiave sono supportate e altre no, alcune parole chiave hanno un utilizzo leggermente diverso rispetto allo 
schema JSON e vengono introdotte parole chiave aggiuntive. È possibile consultare la [documentazione ufficiale](https://swagger.io/docs/specification/data-models/keywords/) 
per maggiori dettagli a riguardo.

##### Swagger UI e Fastify

Con Fastify possiamo generare la nostra interfaccia Swagger ed esporla su una rotta specifica. Il team di Fastify ha sviluppato 
[`fastify-swagger`](https://github.com/fastify/fastify-swagger), un plugin che fornisce l'interfaccia Swagger UI generando lo schema 
Open API partendo dagli schema definiti sulle nostre rotte. Nel caso contrario, ossia se vogliamo generare le rotte per un'applicazione 
Fastify partendo dal uno schema OpenApi, allora date uno sguardo [`fastify-swaggergen`](https://github.com/seriousme/fastify-swaggergen).

Vediamo ora come installare ed utilizzare il plugin `fastify-swagger` partendo dal progetto `jsonSchemaApp` visto nel precedente 
paragrafo. Creiamo un nuovo progetto copiando il contenuto del precedente progetto e installiamo le dipendenze mancanti con i comandi:

```
$ cp -R jsonSchemaApp swaggerApp
$ cd swaggerApp
$ npm install --save fastify-swagger
```

Ora facciamo in modo che la struttura dei file e delle diretory sia la seguente:

```
./swaggerApp
├── package.json
├── package-lock.json
├── plugins
│   └── mongo.js
├── routes
│   └── films.js
├── schemas
│   ├── errorSchema.js
│   ├── filmSchema.js
│   └── idSchema.js
└── server.js
```

Nel file `server.js` abbiamo aggiunto i tre schema definiti nel seguente modo:

```javascript
...
import filmSchema from './schemas/filmSchema'
import errorSchema from './schemas/errorSchema'
import idSchema from './schemas/idSchema'

fastify.addSchema(filmSchema)
fastify.addSchema(errorSchema)
fastify.addSchema(idSchema)
...
```

Abbiamo arricchito lo schema che definisce il documento del film come segue:

```javascript
export default {
  $id: 'film',
  type: 'object',
  properties: {
    release_date: { 
      description: 'The release date of a film',
      type: 'string',
      format: 'date'
    },
    title: {
      description: 'The film title',
      type: 'string',
      maxLength: 150
    },
    production: {
      description: 'The production list (comma separated)',
      type: 'string'
    },
    description: {
      description: 'A short short description of the film',
      type: 'string'
    },
    cast: {
      description: 'The actors of the film (comma separated)',
      type: 'string'
    },
    price: {
      description: 'The price in dollar',
      type: 'integer'
    }
  },
  required: ['title', 'price', 'release_date']
}
```

Noterete che abbiamo arricchito lo schema con alcune descrizioni necessarie alla nostra documentazione. Allo stesso modo 
abbiamo modificato lo schema `errorSchema.js` nel modo seguente:

```javascript
export default {
  $id: 'error',
  type: 'object',
  description: 'The message object',
  properties: {
    message: { type: 'string' }
  }
}
```

Ed infine lo schema dell'identificativo univoco per ogni documento:

```javascript
export default {
  $id: 'id',
  description: 'Document identifier for film collection',
  _id: { type: 'string', format: 'uuid' }
}
```

Ora definiamo uno schema su tutte le rotte implementate nel seguente modo:

```javascript
export default async (fastify, opts) => {
  const collection = fastify.mongo.db.collection('films')

  fastify.get('/list', {
    schema: {
      tags: ['film'],
      description: 'This method all films',
      response: {
        200: {
          type: 'array',
          items: {
            allOf: [
              { $ref: 'film#' },
              { $ref: 'id#' }
            ]
          }
        },
        500: { $ref: 'error#' }
      }
    }
  }, async (req, res) => { ... })
```


```javascript
  fastify.post('/', {
    schema: {
      tags: ['film'],
      description: 'This method save film information',
      body: { $ref: 'film#' },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { $ref: 'id#' }
          }
        },
        400: { $ref: 'error#' },
        500: { $ref: 'error#' }
      }
    }
  }, async (req, res) => { ... })
```

```javascript
  fastify.put('/:id', {
    schema: {
      tags: ['film'],
      params: {
        type: 'object',
        properties: {
          id: { $ref: 'id#' }
        }
      },
      body: { $ref: 'film#' },
      response: {
        '4xx': { $ref: 'error#' },
        500: { $ref: 'error#' }
      }      
    }
  }, async (req, res) => { ... })
```

```javascript
  fastify.delete('/:id', {
    schema: {
      tags: ['film'],
      params: {
        type: 'object',
        properties: {
          id: { $ref: 'id#' }
        }
      },
      response: {
        '4xx': { $ref: 'error#' },
        500: { $ref: 'error#' }
      }      
    }
  }, async (req, res) => { ... })
}
```

Ora che le rotte sono tutte validate, utilizzeremo il plugin `fastify-swagger` per generare la nostra documentazione utilizzando 
Swagger UI. Creiamo il file `./plugins/swagger.js` con il seguente contentuto:

```javascript
import swagger from 'fastify-swagger'
import fp from 'fastify-plugin'

export default fp(async (fastify, opts) => {
  const pluginOpts = Object.assign({}, {
    routePrefix: '/documentation',
    swagger: {
      info: {
        title: 'Virtual Film Catalogue',
        description: 'A catalog where you can buy all your favourite films',
        version: '1.0.0'
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      },
      host: 'localhost',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'film', description: 'All Films related endpoints' }
      ]
    },
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    exposeRoute: true
  }, opts)

  fastify.register(swagger, pluginOpts)
})
```

Ora non ci resta che registrare il plugin appena creato. Nel file `server.js` aggiungiamo la riga:

```javascript
...
fastify.register('./plugins/swagger')
...
```

Ora aprite il browser all'indirizzo `http://localhost:3000/documentation`. Dovreste trovarvi di fronte all'interfaccia di Swagger UI:

![](./img/ch-12/26.png)

Dalla pagina è possibile provare tutti i metodi che abbiamo implementato direttamente dall'interfaccia di Swagger UI. Per 
esempio se espandiamo la sezione GET `/film/list` e clicchiamo sul pulsante *Try it out* e successivamente su *Execute* 
riceveremo tutti i documenti salvati nella collection film:

![](./img/ch-12/27.png)

Quella che abbiamo appena visto è solo una configurazione base del plugin `fastify-swagger`. Il mio consiglio è quello di 
approfondire le varie opzioni che è possibile configurare dando uno sguardo alla [documentazione su Github](https://github.com/fastify/fastify-swagger).

## CLI di Fastify

L'ecosistema di Fastify include anche una CLI (_"Command Line Interface"_) installabile via NPM. Questa CLI ci consente di 
creare e gestire velocemente le nostre applicazioni con pochi semplici comandi. La prima cosa da fare è installare 
`fastify-cli` sulla nostra macchina con il comando:

```
$ npm install -g fastify-cli
```

Una volta terminata l'installazione sarà disponibile il comando `fastify` nella nostra shell. 
Iniziamo digitando il comando `fastify help`:

![](./img/ch-12/28.png)

### Generiamo un progetto

`fastify-cli` ci aiuta strutturando per noi il progetto Dal terminale digitiamo il seguente comando:

```
$ fastify generate filmApp
```

Automaticamente verrà generato per noi il seguente albero di files e directory:

```
.
├── app.js
├── package.json
├── plugins
│   ├── README.md
│   ├── sensible.js
│   └── support.js
├── routes
│   ├── example
│   │   └── index.js
│   ├── README.md
│   └── root.js
└── test
    ├── helper.js
    ├── plugins
    │   └── support.test.js
    └── routes
        ├── example.test.js
        └── root.test.js
```

Da notare che sono state create tre directory per noi:

- `plugins`: questa directory conterrà tutti i plugin che la nostra applicazione utilizzerà.
- `routes`: questa directory conterrà tutte le nostre rotte.
- `test`: questa directory conterrà tutti files che verranno eseguiti per effetturare i test.

Infine, e non meno importate, il file `app.js` che si occupa di caricare tutti i plugins e le rotte dichiarate. 
`fastify-cli` utilizza il plugin [`fasitfy-autoload`](https://github.com/fastify/fastify-autoload) che ha l'incarico 
di caricare tutti i plugins trovati in una directory e configurando automaticamente le rotte che corrispondono 
alla struttura delle cartelle. Un utilizzo molto semplice del plugin è il seguente:

```javascript
fastify.register('fastify-autoload', {
  dir: path.join(import.meta.dirname, 'plugins'),
  options: Object.assign({}, opts)
})
```

Nell'esempio appena descritto, tutti i plugins della directory `plugins` verranno caricati automaticamente 
nell'istanza di Fastify. In questo modo non dobbiamo più preoccuparci di invocare il metodo `.register()` per 
registrare tutti i nostri plugins.

Il file `app.js` è il punto d'ingresso della nostra applicazione. Dando uno sguardo al suo contenuto noteremo che non 
viene istanziato un server, ne tantomeno vengono specificate opzioni particolari per la sua esecuzione. Di questo e di 
altre cose se ne occuperà la CLI di Fastify per noi. L'unica preoccupazione di `app.js` è quella di caricare i plugins 
che ci serviranno per lo sviluppo della nostra applicazione:

```javascript
'use strict'

import path from 'node:path'
import AutoLoad from 'fastify-autoload'

export default async function (fastify, opts) {
  fastify.register(AutoLoad, {
    dir: path.join(import.meta.dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  fastify.register(AutoLoad, {
    dir: path.join(import.meta.dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}
```

Da notare che l'ordine di caricamento delle directory non è casuale. Vengono caricati prima tutti i plugins che la 
nostra applicazione utilizza (`fastify-mongo`, `fastify-swagger` e così via) e successivamente tutte le nostre rotte. 
Di default vengono registrati due plugins: `support.js` che è solo un plugin di esempio e `sensible.js` che effettua 
la registra il plugin `fastify-sensible` che aggiunge tutta una serie di utility alla nostra istanza Fastify. 
Date uno sguardo alla [documentazione ufficiale](https://github.com/fastify/fastify-sensible) per maggiori dettagli. 
La directory `routes` invece, contiene due endpoint di esempio `root.js` e `example/index.js`. Vedremo fra poco il loro funzionamento.

### Avviare l'applicazione

Ora che abbiamo generato il nostro progetto installiamo le dipendenze utilizzando il comando `$ npm install`. Terminata 
l'installazione, possiamo utilizzare uno dei task creati per noi dalla CLI:

- `npm start`: avvia l'applicazione.
- `npm run dev`: avvia l'applicazione in modalità sviluppo.
- `npm run test`: avvia i test specificati nella directory `test`.

Se avviamo l'applicazione con il comando `$ npm run dev` viene avviata l'applicazione in modalità sviluppo. Viene 
utilizzato di default il plugin [`pino-colada`](https://github.com/lrlna/pino-colada) che stampa i log con un formato chiaro e leggibile: 

![](./img/ch-12/29.png)

Ora che il nostro server è stato avviato utilizziamo cURL per verificare che tutto funzioni correttamente. Come già anticipato 
in precedenza il plugin `fastify-autoload` sfrutta l'albero delle directory per creare i path delle rotte, di conseguenza tutte 
le rotte specificate nel file `/routes/example/index.js` verranno esposte automaticamente sulla rotta `/example`. Dalla linea 
di comando digitiamo:

```
$ curl http://localhost:3000/example
this is an example
```

Mentre se effettuiamo una cURL all'indirizzo `http://localhost:3000` risponderà l'handler del file `/routes/root.js`:

```
$ curl http://localhost:3000        
{"root":true}
```

:::tip
Se un singolo file diventa troppo grande, basta creare una cartella e aggiungere un file `index.js`: questo file deve essere un plugin Fastify e verrà caricato automaticamente dall'applicazione. Ora puoi aggiungere tutti i file che vuoi all'interno di quella cartella. In questo modo è possibile creare percorsi complessi all'interno di un singolo monolite, ed eventualmente estrarli.
:::

### Diverse opzioni

Il comando `fastify` gestisce una serie di opzioni da linea di comando ognuna delle quali ha la sua variabile 
di ambiente corrispondente. Di default `fastify-cli` utilizza `dotenv`, quindi caricherà in automatico tutte le variabili 
d'ambiente, se specificate, del nostro file `.env`. Di seguito una tabella che schematizza il tutto:

|*Descrizione* |*Opzione abbreviata* |*Opzione* |*Variabile di ambiente* |
|--------------|---------------------|----------|------------------------|
|Porta di ascolto dell'applicazione|`-p`|`--port`|`FASTIFY_PORT`|
|Indirizzo su cui mettersi in ascolto|`-a`|`--address`|`FASTIFY_ADDRESS`|
|Socket su cui mettersi in ascolto|`-s`|`--socket`|`FASTIFY_SOCKET`|
|Modulo da precaricare|`-r`|`--require`|`FASTIFY_REQUIRE`|
|Livello di log|`-l`|`--log-level`|`FASTIFY_LOG_LEVEL`|
|Livello di log|`-l`|`--log-level`|`FASTIFY_LOG_LEVEL`|
|Path del modulo di configurazione del logger.|`-L`|`--logging-module`|`FASTIFY_LOGGING_MODULE`|
|Avvia Fastify in modalità di debug con l'ispector Node.js|`-d`|`--debug`|`FASTIFY_DEBUG`
|Porta su cui avviare il debug (default: 9320)|`-I`|`--debug-port`|`FASTIFY_DEBUG_PORT`|
|Imposta l'host per l'ispector||`--debug-host`|`FASTIFY_DEBUG_HOST`|
|Stampa i log utilizzando Pino Colada|`-P`|`--pretty-logs`|`FASTIFY_PRETTY_LOGS`|
|Imposta un watcher sulla directory corrente. Se un file cambia il processo viene riavviato|`-w`|`--watch`|`FASTIFY_WATCH`|
|Ingora i cambiamenti sui files e le directory specificate||`--ignore-watch`|`FASTIFY_INGORE_WATCH`|
|Stampa gli eventi lanciati dal watcher||`--verbose-watch`|`FASTIFY_VERBOSE_WATCH`|
|Utilizza opzioni personalizzate|`-o`|`--options`|`FASTIFY_OPTIONS`|
|Imposta un prefisso|`-x`|`--prefix`|`FASTIFY_PREFIX`|
|Imposta il timeout per l'avvio di un plugin|`-T`|`--plugin-timeout`|`FASTIFY_PLUGIN_TIMEOUT`|
|Imposta il valore massimo per un payload in bytes||`--body-limit`|`FASTIFY_BODY_LIMIT`|

Quando si esegue la distribuzione in un Docker, è consigliabile impostare un indirizzo Fastify di `0.0.0.0` 
perché questi contenitori non per impostazione predefinita espongono le porte mappate a localhost.

Per i contenitori creati ed eseguiti specificamente dal demone Docker, `fastify-cli` è in grado di rilevare che il 
processo del server è in esecuzione all'interno di un contenitore Docker e l'indirizzo di ascolto `0.0.0.0` è impostato 
automaticamente.

### Creiamo la nostra Applicazione

Vediamo ora come trasformare il nostro progetto `swaggerApp` in un'applicazione basata su `fastify-cli`. Iniziamo 
eliminando i files superflui, facciamo in modo che la struttura delle directory sia la seguente:

```
./filmApp
├── node_modules
├── app.js
├── package.json
├── package-lock.json
├── plugins
│   └── sensible.js
├── routes
│   └── root.js
└── test
    ├── helper.js
    ├── plugins
    └── routes
        └── root.test.js
```

Ora dalla linea di comando digitiamo quanto segue per installare i plugins mancanti. In questo caso serviranno solo 
`fastify-mongodb` e `fastify-swagger`, quindi:

```
$ npm install --save fastify-swagger fastify-mongodb
```

Ora copiamo i seguenti file dal progetto `swaggerApp`:

- copiamo il file `.env` nella directory principale del progetto;
- copiamo i files `mongo.js` e `swagger.js` nella directory `plugins`;
- copiamo il file `film.js` nella directory `routes`;

Se avete copiato i files correttamente l'albero di files e directory del nostro progetto sarà il seguente:

```
.
├── .env
├── app.js
├── package.json
├── package-lock.json
├── plugins
│   ├── swagger.js
│   ├── mongo.js
│   └── sensible.js
├── routes
│   ├── films.js
│   └── root.js
└── test
    ├── helper.js
    ├── plugins
    └── routes
        └── root.test.js
```

Se proviamo ad eseguire l'applicazione, notiamo che le rotte esposte da `film.js` non avranno più il prefisso `/film`, 
quindi dobbiamo aggiungerlo. Il plugin `fastify-autoload` ci viene in aiuto con un opzione: `autoPrefix`. Aggiungendo alla 
fine del file `film.js` la seguente riga di codice:

```javascript
module.export const autoPrefix = '/film'
```

il plugin si preoccuperà di aggiungere il prefisso `/film` alle nostre rotte. `fastify-autoload` mette a diposizione 
diverse opzioni per gestire i prefissi delle rotte. Per avere un quadro completo di queste opzioni basta consultare la 
[documentazione ufficiale](https://github.com/fastify/fastify-autoload#plugin-configuration) su Github.
