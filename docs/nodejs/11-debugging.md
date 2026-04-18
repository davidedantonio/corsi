---
sidebar_position: 11
---

# Debugging

La natura asincrona di JavaScript e di Node.js rendono il debug di un'applocazione un processo non banale. Ma comunque, negli anni, 
Node.js è maturato a tal punto che sono state introdotte diverse metodologie di debugging.

In questo capitolo, vedremo alcune metodologie che possono rendere le nostre applicazioni facili da debuggare. Impareremo anche 
come utilizzare strumenti moderni per eseguire il debug delle nostre applicazioni Node.js. Impareremo a conoscere le API utili ad effettaure 
rapporti diagnostici presenti nelle ultime versioni di Node.js. 

## Debug con Chrome DevTools

Per eseguire il debug di un'applicazione, il processo Node.js deve essere avviato in modalità di ispezione. Questa modalità di avvio mette 
il processo in uno stato di debug ed espone un protocollo remoto, a cui è possibile connettersi tramite debugger come Chrome Devtools. Oltre 
alle funzionalità di debug, la modalità di ispezione garantisce anche la possibilità di eseguire altri controlli diagnostici su un 
processo Node.js. Ora vedremo come eseguire il debug e profilare un processo Node.js.

### Avviare un processo in modalità debug

Vedremo ora come effettuare una diagnosi e come risolvere un problema di una semplice applicazione web. Per farlo utilizzeremo il web 
framework [Fastify](https://fastify.io). Quindi dalla linea di comando inizializziamo un progetto con i seguenti comandi:

```
$ mkdir app
$ cd app
$ npm init -y
$ npm install --save fastify
$ touch index.js
```

Una volta creato il nostro file `index.js`, scriviamo la nostra applicazione web:

```javascript
import fastify from 'fastify'()

const getRandomNumber = (n) => {
  return Math.floor(Math.random() * n) + '1'
}

fastify.get('/:number', async (request, reply) => {
  const { number } = request.params
  const random = getRandomNumber(number)
  return random
})

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    console.error(e)
    process.exit(1)
  }
}

start()
```

Questa semplice applicazione web espone un unico metodo GET che accetta un parametro `number`. In pratica a seconda del numero inviato 
come parametro l'utente dovrebbe ricevere come risposta un numero random tra 0 ed il numero specificato nella rotta. 
Per esempio, `http://localhost:3000/20` dovrà ritornare un numero tra 0 e 20. Avviamo il nostro server con il comando `node index.js` 
e digitiamo `http://localhost:3000/20` nella barra degli indirizzi del nostro browser preferito. Se effettuate diverse volte 
il refresh della pagina noterete che il server ritornerà molte volte un numero maggiore di 20. Sicuramente questi non sono 
risultati che ci aspettiamo come risposta, e ovviamente c'è qualcosa che non va. Quindi vediamo come possiamo avviare il 
nostro server in modalità debug e cerchiamo di capire il perché.

Node.js espone un'utilità di debug tramite il flag `--inspect`, che ci consente di eseguire il debug e profilare i nostri processi 
Node.js utilizzando l'interfaccia di Chrome DevTools. L'integrazione è abilitata tramite il protocollo Chrome DevTools. 
L'esistenza di questo protocollo significa che gli strumenti possono essere scritti per l'integrazione con Chrome DevTools.

La prima cosa da fare è quella di avviare il nostro server in modalità debug. Quindi passiamo il flag `--inspect` come 
argomento al nostro processo Node.js:

```
$ node --inspect index.js 
Debugger listening on ws://127.0.0.1:9229/a05358ff-0991-432e-9579-50f40d087ca8
For help, see: https://nodejs.org/en/docs/inspector
{"level":30,"time":1632554951677,"pid":339628,"hostname":"DebianXPS","msg":"Server listening at http://127.0.0.1:3000"}
```

> `node --debug` e `node --debug-brk` sono flag legacy di Node.js che sono stati deprecati da Node.js v6.3.0. mentre 
`node --inspect` e `node --inspect-brk` sono gli equivalenti moderni che dovrebbero essere usati al posto di questi flag legacy.

### Alla ricerca del bug

Ora che il nostro processo Node.js è avviato in modalità ispezione vediamo come trovare il bug. Una volta avviato il 
processo invece di cliccare direttamente sul link specificato nell'output `ws://127.0.0.1:9229/a05358ff-0991-432e-9579-50f40d087ca8`, 
aprite il vostro browser Chrome e digitate `chrome://inspect/#devices`. Quello che vedrete sarà una pagina come la seguente:

![](./img/ch-11/01.png)

Noterete che il nostro file `index.js` viene visualizzato sotto *Remote Target*. Cliccando sul link *inspect* verrà 
visualizzata la seguente pagina in una nuova finestra del browser:

![](./img/ch-11/02.png)

A questo punto selezionando il tab *Origini* e successivamente *File System*, dal menu a tendina che verrà visualizzato 
in alto a destra dopo aver cliccato sul menu contestuale, selezionare la voce *Apri file*:

![](./img/ch-11/03.png)

Vi si aprirà un menu a tendina in cui potrete ricercare il file sorgente `index.js`. Selezionandolo vi verrà 
mostrato il codice sorgente del nostro file:

![](./img/ch-11/04.png)

A questo punto aggiungiamo un breakpoint, per farlo basta semplicemente cliccare sul numero della riga. Nel 
nostro caso la riga incriminata è la numero 4. Una volta fatto noterete sulla destra un pannello dove è possibile 
visualizzare tutti i breakpoint aggiunti all'interno del nostro codice, come mostrato nell'immagine seguente:

![](./img/ch-11/05.png)

Ora tornate nel browser ed effettuate un refresh della pagina `http://localhost:3000/20`. Noterete che la richiesta si 
bloccherà poiché abbiamo appena aggiunto un breakpoint sulla riga 4. Infatti, tornando in Chrome DevTools notiamo ora una label con scritto 
*Messo in pausa su un punto di interruzione* ed è possibile visualizzare l'intero stack delle chiamate effettuatuate 
dal nostro codice.

![](./img/ch-11/06.png)

Il debugger a questo punto attende una nostra azione. A questo punto possiamo scegliere di passare all'istruzione 
successiva, e quindi `return random`, o possiamo scegliere di entrare nella funzione `getRandomNumber` e procedere un'istruzione alla volta. 
Decidiamo di entrare nella funzione. Per farlo possiamo utlizzare i pulsanti in alto a destra (passando con il 
mouse sopra le icone di questi pulsanti verrà mostrato un suggerimento che identifica l'azione che questo intraprenderà una volta cliccato). 
Identificato il pulsante che ci porterà all'interno della funzione, in questo caso il terzo partendo da sinistra, noterete 
che verrà evidenziata la riga 4 del nostro file:

![](./img/ch-11/07.png)

Cliccando ancora una volta sullo stesso pulsante noterete che il risultato ottenuto non è quello atteso. Di conseguenza è facile 
individuare il bug. Tornando con lo sguardo alla riga 4 ci accorgiamo che stiamo addizionando un carattere, 
nel nostro caso `'1'`, ad un numero.

![](./img/ch-11/08.png)

Abbiamo visto come possiamo utilizzare Chrome DevTools per aggiungere breakpoints all'interno del nostro codice e come 
è possibile debuggarlo una istruzione alla volta. La capacità di debug viene fornita da V8, il motore JavaScript 
utilizzato da Node.js. Quando mandiamo in esecuzione un processo Node.js con il flag `--inspect`, V8 apre una 
porta che accetta connessioni WebSocket. Una volta stabilita una connessione, i comandi sotto forma di pacchetti JSON vengono 
inviati avanti e indietro tra l'inspector ed il client.

L'interfaccia utente di Devtools (che è scritta in HTML, CSS e JavaScript, quindi può essere caricata direttamente in 
una normale scheda del browser) utilizza un protocollo speciale riconosciuto dal browser Chrome. L'interfaccia utente di 
Devtools viene caricata in una modalità speciale (modalità remota), in cui viene fornito un endpoint WebSocket tramite l'URL.

La connessione WebSocket consente la comunicazione bidirezionale tra l'inspector e il client. Il minuscolo server Inspector 
WebSocket è scritto interamente in C e viene eseguito su un thread separato in modo che quando il processo viene messo in pausa, 
l'inspector possa continuare a ricevere e inviare comandi. Al fine di ottenere il livello di controllo che ci viene 
offerto in modalità debug le operazioni V8 sono gestite da un programma *Inspector C++* che è in grado controllare 
il flusso delle informazioni in entrata e in uscita. Ad esempio, se abbiamo impostato un breakpoint, una volta incontrata 
quella riga, a livello C++ corrisponderà una condizione che attiva una funzione che mette in pausa l'Event Loop 
di Node.js. L'Inspector quindi invia un messaggio al client tramite la connessione WebSocket dicendogli che il processo 
è in pausa su una particolare riga e il client aggiorna il suo stato. Allo stesso modo, se l'utente sceglie di entrare 
in una funzione, questo comando viene inviato all'Inspector, che può brevemente riattivare e riattivare l'esecuzione 
nella posizione appropriata, quindi invia un messaggio con la nuova posizione e stato.

## Mettere in pausa un processo appena avviato

Node.js fornisce un flag che è possibile utilizzare per mettere in pausa un'applicazione appena avviata. Questo ci 
consente di aggiungere breakpoints al nostro codice prima che qualsiasi istruzione venga eseguita. Inoltre ci aiuta nel 
debug dell'applicazione quando questa viene avviata. È possibile abilitare questa feature utilizzando il flag `--inspect-brk`. 
Quindi prendendo come esempio l'applicazione Fastify creata nel precedente paragrafo basta digitale dalla linea di comando: 

```
$ node --inspect-brk index.js
```

## Debug dalla linea di comando

Oltre al flag `--inspect-brk`, Node.js fornisce una utility per il debug utilizzabile dalla linea di comando che è 
possibile utilizzare quando non abbiamo a disposizione un'interfaccia utente. È possibile avviare l'applicazione creata 
in precedenza utilizzando questa utility nel modo seguente:

```
$ node inspect index.js
```

Questo comando avvierà il processo in modalità di debug e mostrerà come output le prime tre linee di codice del 
nostro programma:

![](./img/ch-11/09.png)

La modalità di debug dalla linea di comando metterà in pausa il programma sulla prima linea di codice. È possibile 
utilizzare una serie di funzioni che sono utili per effettuare il debug del codice. Una funzione molto utilizzata 
è `list()`, che consente di visualizzare il numero di linee di codice specificate come parametro. Per esempio la funzione 
`list(22)` stamperà a video tutte le linee di codice del nostro programma:

```
debug> list(22)
> 1 import fastify from 'fastify'()
  2 
  3 const getRandomNumber = (n) => {
  4   return Math.floor(Math.random() * n) + '1'
  5 }
  6 
  7 fastify.get('/:number', async (request, reply) => {
  8   const { number } = request.params
  9   const random = getRandomNumber(number)
 10   return random
 11 })
 12 
 13 const start = async () => {
 14   try {
 15     await fastify.listen(3000)
 16   } catch (err) {
 17     console.error(err)
 18     process.exit(1)
 19   }
 20 }
 21 
 22 start()
```

È possibile utilizzare la funzione `setBreakpoint()` o `sb()` per specificare la riga su cui vogliamo aggiungere 
uno specifico breakpoint. Quindi per aggiungere un breakpoint sulla riga 10 basta digitare `setBreakpoint(9)`:

```
debug> setBreakpoint(10)
  5 }
  6 
  7 fastify.get('/:number', async (request, reply) => {
  8   const { number } = request.params
> 9   const random = getRandomNumber(number)
 10   return random
 11 })
 12 
 13 const start = async () => {
 14   try {
 15     await fastify.listen(3000)
```

Noterete che la riga su cui abbiamo aggiiunto il breakpoint viene evidenziata utilizzando il carattere `>`. 
Ora il nostro programma è ancora in pausa e non ha eseguito ancora nessuna istruzione. Per consentire il corretto 
avvio del processo basta digitare `cont` o `c`:

```
debug> cont
< 
```

Ora che il nostro programma si è avviato correttamente, dobbiamo effettuare una richiesta all'endpoint 
`http://localhost:3000/20`. Possiamo utilizzare una *cURL* dalla linea di comando nel seguente modo:

```
$ curl http://localhost:3000/20
```

Noteremo che il comando non stampa a video il risultato ottenuto come dovrebbe, infatti se torniamo alla console dove 
abbiamo avviato il processo noteremo che si è fermato sul breakpoint alla riga 9 del codice:

```
0.0.1","remotePort":41800},"msg":"incoming request"}
break in index.js:9
  7 fastify.get('/:number', async (request, reply) => {
  8   const { number } = request.params
> 9   const random = getRandomNumber(number)
 10   return random
 11 })
```

Ora per entrare nella funzione `getRandomNumber` come abbiamo già fatto con Chrome DevTools, basta digitare il comando `step`:

```
debug> step
break in index.js:4
  2 
  3 const getRandomNumber = (n) => {
> 4   return Math.floor(Math.random() * n) + '1'
  5 }
  6
```

Il processo ci indica su quale linea di codice si è fermato (nel nostro caso la 4), e rimane nuovamente in attesa di una nostra azione. Immagininiamo di voler controllare il valore della variabile `n` prima che l'istruzione `return` venga esguita. Per farlo basta utilizzare il comando `exec` nel seguente modo:

```
debug> exec n
'20'
```

Quindi il valore sembra essere corretto. Quindi continuiamo ad eseguire il codice un'istruzione alla volta e controlliamo il valore ritornato al chiamante:

```
debug> step
break in index.js:10
  8   const { number } = request.params
* 9   const random = getRandomNumber(number)
>10   return random
 11 })
 12 
debug> exec random
'31'
```

Anche in questo caso sembra ci sia qualche problema all'interno del nostro codice. Infatti il valore che dovrebbe 
ritornare la funzione `getRandomNumber(20)` dovrebbe essere un numero compreso tra 0 e 20, ma evidentemente abbiamo anche questa volta 
un problema. A questo punto ci accorgiamo che sulla riga 4 stiamo sommando il valore stringa `'1'` anziché il valore numerico `1`. 
Quindi ora che abbiamo identificato il bug all'interno del codice possiamo uscire dalla modalità di debug in due modi: possiamo usare 
la combinazione di tasti CTRL+C due volte oppure utilizzando il comando `.exit`.

## Debug con VS Code

Abbiamo visto finora le due modalità principali con cui possiamo effettuare il debug di un'applicazione Node.js. Ora vedremo come 
farlo utilizzando l'editor _Visual Studio Code_ di Microsoft. 

![](./img/ch-11/10.png)

Per avviare un processo Node.js in modalità debug basta cliccare sull'icona raffigurante un'icona play con uno skarabeo sopra dal 
menu laterale dell'editor.

![](./img/ch-11/11.png)

A questo punto clicchiamo sul pulsante _Esegui con debug_ per avviare il processo. Quando avviamo il processo per la prima volta 
ci verrà richiesta la selezione dell'ambiente di esecuzione. Ovviamente selezioniamo Node.js nel nostro caso:

![](./img/ch-11/12.png)

A differenza del debugger della riga di comando di Node.js, il debugger di Visual Studio Code avvia immediatamente l'esecuzione 
del codice. Se il programma termina rapidamente, è possibile che non si abbia nemmeno la possibilità di interagire con il 
debugger. Terminato l'avvio l'editor mostrerà sulla sinistra tre riquadri molto simili a quelli visiti in Chrome DevTools:

![](./img/ch-11/13.png)

A questo punto possiamo aggiungere un breakpoint sulla riga 9 cliccando poco prima del numero di riga. Se abbiamo aggiunto correttamente 
il nostro breakpoint visivamente dovreste la riga evidenziata da un puntino rosso. Per rimuovere un breakpoint basta cliccare 
nuovamente sul puntino aggiunto precedentemente:

![](./img/ch-11/14.png)

Ora che siamo finalmente pronti lanciamo il solito comando per inviare una richiesta al server con una *cURL*:

```
$ curl http://localhost:3000/20
```

Appena eseguiamo questo comando, notiamo che non viene stampato nella console il risultato della chiamata. Infatti ritornando 
sull'editor vediamo che il processo è in pausa sulla riga 9:

![](./img/ch-11/15.png)

Esattamente come fatto in precedenza con Chrome DevTools, possiamo utilizzare i tasti mostrati in alto per continuare con 
l'esecuzione del programma oppure andare avanti un passo alla volta (e quindi cliccare sul terzo pulsante partendo da destra):

![](./img/ch-11/16.png)

Quando si analizza la causa di un difetto del programma, esaminare lo stato delle variabili alla ricerca di modifiche impreviste. 
A tale scopo, è possibile usare il pannello Variabili.

Le variabili vengono visualizzate organizzate per ambito:

- Le variabili locali sono accessibili nell'ambito corrente, in genere la funzione corrente.
- Le variabili globali sono accessibili da qualsiasi punto del programma. Sono inclusi anche gli oggetti di sistema del runtime JavaScript, quindi non bisogna sorprendersi se sono presenti parecchi elementi.
- Le variabili di chiusura sono accessibili dalla chiusura corrente, se presente. Una chiusura combina l'ambito locale di una funzione con quello della funzione esterna a cui appartiene.

È possibile espandere gli ambiti e le variabili selezionando la freccia. Quando si espandono gli oggetti, vengono visualizzate tutte 
le proprietà definite al loro interno. È possibile modificare al momento il valore di una variabile facendo doppio clic 
sulla variabile. Passando il puntatore su un parametro di funzione o una variabile direttamente nella finestra dell'editor, 
è anche possibile visualizzarne in anteprima il valore:

![](./img/ch-11/17.png)

Se si vuole tenere traccia dello stato di una variabile nel tempo o in funzioni diverse, può essere noioso eseguire la ricerca 
ogni volta. A tale scopo, è utile usare il pannello Espressione di controllo.

È possibile selezionare il pulsante più per immettere il nome di una variabile o un'espressione da controllare. In alternativa, 
è possibile fare clic con il pulsante destro del mouse su una variabile nel pannello Variabili e selezionare *Aggiungi a espressione di controllo*.

Tutte le espressioni all'interno del pannello Espressioni di controllo verranno aggiornate automaticamente durante l'esecuzione del codice.

![](./img/ch-11/18.png)

Nel nostro caso, ancora una volta, è evidente che il calcolo del numero random è errato. Infatti notiamo che sostituendo il valore stringa che stiamo sommando `'1'` con il valore numerico corretto `1`, il risultato che otteniamo è quello atteso.

## Utilizzare i log

Utilizzare i log nelle nostre applicazioni ci aiutano a capire cosa sta accadendo nella nostra applicazione. I log possono farci a capire cause di arresti anomali, aiutandoci a capire cosa stava succedendo nell'applicazione prima dell'arresto anomalo. Addirittura sono uno strumento molto utile per la raccolta dei dati. Per esempio, se si tiene traccia delle richieste che vengono effettuate alla nostra applicazione, possiamo capire quale endpoint viene invocato più frequentemente. Ora daremo uno sguardo a `pino`, un logger JSON famoso per la sua velocità.

Prima di passare a Pino però, diamo un'occhiata ai requisiti che una buona libreria di logging deve soddisfare:

- *timestamp*: è fondamentale sapere quale evento è accaduto e quando.
- *formattazione*: le righe del log devono essere facilmente comprensibili dagli umani e semplici da analizzare da altre evenntuali applicazioni.
- *destinazione*: dovrebbe essere sempre lo standard output/error, e soprattutto le applicazioni non dovrebbero occuparsi del routing dei log.
- *livelli di log*: in generale i log hanno diversi livelli di gravità, nella maggior parte dei casi non sarai interessato agli eventi di debug o a livello di info.

### Pino logger

Per utilizzare Pino basta installarlo via NPM nel seguente modo:

```
$ mkdir pino-example
$ cd pino-example
$ npm init -y
$ npm install --save pino
$ touch index.js
```

All'interno del nostro file `index.js` aggiungiamo quanto segue:

```javascript
import logger from 'pino'()

logger.info('Hello, Pino!')
```

Eseguendo il codice il otterremo a video il seguente risultato:

```
{"level":30,"time":1632667763021,"pid":702729,"hostname":"DebianXPS","msg":"Hello, Pino!"}
```

Quanto mostrato altro non è che una stringa in formato JSON che contiene alcune informazioni:

- `level`: questa proprietà identifica la tipologia di log (10 = trace, 20 = debug, 30 = info, 40 = warn, 50 = error, 60 = fatal).
- `time`: rappresenta la data in millisecondi in cui il log è stato scritto.
- `pid`: l'identificativo del log.
- `hostname`: l'hostname su cui è stato stampato il log.
- `msg`: il vero contenuto del log, ossia il messaggio.

È possibile configurare l'istanza di Pino a proprio piacimento utilizzando una serie di opzioni, vediamo con qualche esempio:

### Log a più livelli

Il parametro `level` ci consente di stabilire da quale livello Pino deve scrivere il log specifico. Come già mostrato 
in precedenza esistono diversi livelli di log tra cui: `fatal`, `error`, `warn`, `info` (default), `debug`, `trace`. 
In pratica impostando tale parametro su un particolare livello, saranno scritti solo i log a partire dal livello specificato in 
su. Per esempio se `level: 'warn'`, verranno scritti solo i log di tipo `warn`, `error` e `fatal`. Tutti gli altri verranno ignorati:

```javascript
import logger from 'pino'({
  level: 'warn'
})

logger.info('This is an info message log')
logger.warn('This is a warn message log')
logger.error('This is an error message log')
logger.debug('This is will never be printed')
```

Non c'è da meravigliarsi se l'output non mostrerà i messaggi di livello inferiore a `warn`:

```
{"level":40,"time":1632669114357,"pid":704079,"hostname":"DebianXPS","msg":"This is a warn message log"}
{"level":50,"time":1632669114357,"pid":704079,"hostname":"DebianXPS","msg":"This is an error message log"}
{"level":50,"time":1632669114357,"pid":704079,"hostname":"DebianXPS","msg":"This is will never be printed"}
```

Quanto appena mostrato è molto importante quando si utilizza un logger. Magari si è poco interessati ai log informativi in quanto 
è possibile che non ci interessa fare statistiche sulle rotte ma siamo più interessati agli errori che si 
verificano all'interno della nostra applicazione.

Un'altra opzione molto interessante è la possibilità di definire livelli di log aggiuntivi utilizzando l'opzione `customLevels`. 
Le chiavi dell'oggetto corrispondono allo spazio dei nomi del livello di log mentre i valori identificano  il valore numerico del livello:

```javascript
import logger from 'pino'({
  customLevels: {
    custom: 35
  }
})

logger.custom('Hi, this is a custom level log')
```

Di conseguenza quello che verrà stampato sarà qualcosa del tipo:

```
{"level":35,"time":1632669963623,"pid":704780,"hostname":"DebianXPS","msg":"Hi, this is a custom level log"}
```

### I Transports

In Pino, tutti i processi di log sono chiamati _trasportatori_ (in inglese *transports*) e vengono eseguiti come un 
processo separato, reindirizzando lo standard output di un'applicazione allo standard input del trasporto. In pratica 
un trasport è un modulo che restituisce una funzione la quale restituisce uno stream scrivibile.

```javascript
import {  Writable  } from 'node:stream'

export default (options) => {
  const transport = new Writable({
    write (chunk, enc, cb) {
    // applica una trasformazione e lo invia allo standard output
    console.log(chunk.toString().toUpperCase())
    cb()
    }
  })
  return transport
}
```

Ora immaginiamo che questo modulo sia definito nel file `transport.js`. È possibile configurare `pino` affinché utilizzi 
questo "transport" creando un flusso di trasporto con `pino.transport` e passandolo alla funzione `pino`:

```javascript
import pino from 'pino'

const transport = pino.transport({
  target: '/absolute/path/to/transport.js'
})

pino(transport)
```

Il codice del transport viene eseguito in un thread separato. Il thread principale scriverà i log nel thread del 
transport, che a sua volta li scriverà nello stream restituito dalla funzione esportata dal modulo. È possibile 
utilizzare anche transport pubblicati su NPM. In questo caso non è necessario specificare il path assoluto del modulo 
ma semplicemente il nome. Per esempio se il nome del modulo è `fantastic-transport` possiamo utilizzarlo nel seguente modo:

```javascript
import pino from 'pino'

const transport = pino.transport({
  target: 'fantastic-transport'
})

pino(transport)
```

Se desideriamo redirigere il risultato di un transport, per esempio in un file, basta specificare l'opzione 
`options.destination` nel seguente modo:

```javascript
import pino from 'pino'

const transport = pino.transport({
  target: 'fantastic-transport',
  options: { destination: '/dev/null' }
})

pino(transport)
```

Allo stesso modo possiamo utlizzare più transport per diversi livelli di log:

```javascript
import pino from 'pino'

const transport = pino.transport({
  targets: [
    { target: '/absolute/path/to/transport.js', level: 'error' },
    { target: 'fantastic-transport', options: { destination: '/dev/null' }}
  ]
})

pino(transport)
```

### I transport di Pino

In Pino esistono alcuni trasport già pronti all'uso come `pino/file` utile per inviare i log in un file, o 
`pino/pretty` che rendere i log "human readable". Vediamo come utilizzarli con un piccolo esempio. Creiamo un nuovo 
file `pino-file.js` nel progetto `pino-example` creato precedentemente. All'interno scriviamo quanto segue:

```javascript
import pino from 'pino'

const transport = pino.transport({
  target: 'pino/file',
  options: { destination: './log.txt' }
})

const logger = pino(transport)

logger.info("Hello, Pino!")
logger.warn("This is the Pino logger!")
```

Se esguiamo questo programma con il comando `node pino-file.js` non comparirà nulla sullo standard output, 
però noterete che è stato creato un file `log.txt`, all'interno della directory del progetto che 
conterrà qualcosa di simile:

```
{"level":30,"time":1632840143861,"pid":50051,"hostname":"DebianXPS","msg":"Hello, Pino!"}
{"level":40,"time":1632840143861,"pid":50051,"hostname":"DebianXPS","msg":"This is the Pino logger!"}
```

Ogni volta che il programma viene eseguito Pino si occuperà di scrivere nel file `log.txt` i suoi log in 
modalità _"append"_. Ciò significa che rieseguendo nuovamente lo script troveremo altre due 
righe all'interno del file:

```
{"level":30,"time":1632840143861,"pid":50051,"hostname":"DebianXPS","msg":"Hello, Pino!"}
{"level":40,"time":1632840143861,"pid":50051,"hostname":"DebianXPS","msg":"This is the Pino logger!"}
{"level":30,"time":1632840507177,"pid":50392,"hostname":"DebianXPS","msg":"Hello, Pino!"}
{"level":40,"time":1632840507177,"pid":50392,"hostname":"DebianXPS","msg":"This is the Pino logger!"}
```

:::tip
Node.js è fortemente inspirato agli standard POSIX. Di conseguenza Le modalità di apertura di un file possono essere 
molteplici. Date uno sguardo alla [documentazione ufficiale sul sito di Node.js](https://nodejs.org/api/fs.html#fs_fspromises_open_path_flags_mode) per maggiori informazioni sulla funzione `open`.
:::

Un altro trasport che potrebbe essere utile, ma solo in modalità di sviluppo, è sicuramente `pino-pretty`. 
Questo transport speciale non fa altro che rendere i log di Pino più leggibili. Vedremo ora come utilizzare questo transport 
nelle nostre applicazioni con un piccolo esempio. Prima di procedere con l'esempio però è necessario installare 
`pino-pretty` come dipendenza all'interno del nostro progetto. Per farlo basta digitare dalla riga di comando:

```
$ npm install --save pino-pretty
```

Terminata l'installazione creiamo il file `pino-pretty` con il seguente contenuto:

```javascript
import pino from 'pino'

const transport = pino.transport({
  target: 'pino-pretty'
})

const logger = pino(transport)

logger.info("This is pino-pretty info message")
logger.warn("This is pino-pretty warn message")
logger.error("This is pino-pretty error message")
logger.fatal("This is pino-pretty fatal  message")
```

Di default il modulo `pino-pretty` stamperà i log sullo standard output, ma è possibile comunque specificare la 
`options.destination` che si desidera. Eseguendo la nostra applicazione il risultato che otterremo sarà qualcosa del genere:

![](./img/ch-11/19.png)

### Integrazioni ed ecosistema di moduli

Pino fornisce supporto ai principali frameworks dell'ecosistema Node.js e uno tra questi, Fastify, integra Pino come principale 
strumento di gestione dei log. È possibile consultare la lista completa delle integrazioni al seguente link [https://getpino.io](https://getpino.io/#/docs/web).

Inoltre esistono una serie di moduli che si integrano con questa libreria. Per esempio [pino-elastic-search](https://github.com/pinojs/pino-elasticsearch) 
fa in modo che i log della nostra applicazione vengano inviati ad un server Elastic Search, o [pino-mongo-db](https://github.com/pinojs/pino-mongodb) 
che si occupa di salvare i nostri log in un database MongoDB e [tanti altri ancora](https://getpino.io/#/docs/ecosystem).

## Abilitare il debug nativo di Node.js

Quando si hanno problemi nell'effettuare il debug di un'applicazione, può tornare utile entrare in un debug più approfondito 
all'interno del cuore di Node.js e vedere come sta eseguendo il nostro programma. Node.js fornisce una sua modalità di debug 
che ci consente di comprendere meglio ciò che sta accadendo al suo interno. Questa modalità di debug _"avanzata"_ può essere 
abilitata utilizzando la variabile `NODE_DEBUG` nel seguente modo:

```
$ NODE_DEBUG=[module1,...,moduleN] node /path/to/file.js
```

Notate che è possibile assegnare più valori, separati da virgola, alla variabile `NODE_DEBUG`. Questi valori non sono altro 
che i nomi dei moduli core di Node.js che espongono un'interfaccia di debug:

| *`child_process`* | *`http`* | *`net`* | *`stream`* |
|-------------------|----------|---------|------------|---|
|*`cluster`* |*`https`* |*`policy`* |*`timer`*|
|*`esm`* |*`http2`* |*`repl`* |*`tls`*|
|*`fs`* |*`module`* |*`source_map`* |*`worker`* |

Vediamo ora come abilitare i log nativi di Node.js su una semplice applicazione. Inizializziamo un nuovo 
server basato sul framework Fastify:

```
$ mkdir core-logs-fastify
$ cd core-logs-fastify
$ npm init -y
$ npm install --save fastify
```

Creiamo il file `server.js` con il seguente contenuto:

```javascript
import fastify from 'fastify'()

fastify.get('/', async (req, res) => {
  return { message: 'Hello, Fastify!' }
})

const start = async () => {
  try {
    await fastify.listen(3000)
    fastify.log.info('Server listen on port 3000```')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

Ora che il nostro server è pronto non resta che eseguirlo. Possiamo abilitare la modalità di debug sul modulo 
`http`, visto che il nostro server ne farà sicuramente utilizzo:

```
$ NODE_DEBUG=http node server.js
```

Ora se proviamo ad inviare una richiesta al nostro server, utilizzando cURL per esempio, sul 
terminale verranno stampati messagi tipo:

```
(node:1076811) Warning: Setting the NODE_DEBUG environment variable to 'http' can expose sensitive data (such as passwords, tokens and authentication headers) in the resulting log.
(Use `node --trace-warnings ...` to show where the warning was created)
HTTP 1076811: SERVER new http connection
HTTP 1076811: requestTimeout timer moved to req
HTTP 1076811: SERVER socketOnParserExecute 773
HTTP 1076811: write ret = true
HTTP 1076811: outgoing message end.
HTTP 1076811: server socket close
HTTP 1076811: server socket close
```

Questi messaggi verranno stampati per ogni richiesta che viene effettuata alla nostra applicazione. Queste informazioni 
di debug arrivano dal modulo core `http` di Node.js che potete visualizzare al seguente link 
[https://github.com/nodejs/node/blob/master/lib/_http_server.js](https://github.com/nodejs/node/blob/master/lib/_http_server.js).

Visto che un server HTTP Node.js utilizza sicuramente il modulo `stream`, possiamo vedere cosa verrà stampato se viene assegnata 
alla variabile `NODE_DEBUG` il valore `stream`. Quindi riavviamo l'applicazione utilizzando il seguente comando:

```
NODE_DEBUG=stream node server.js
```

Ancora una volta se proviamo ad inviare una richiesta al nostro server, questa volta verranno stampati messaggi come quelli che seguono:

```
STREAM 1198826: read 0
STREAM 1198826: need readable false
STREAM 1198826: length less than watermark true
STREAM 1198826: do read
STREAM 1198826: resume
STREAM 1198826: resume true
STREAM 1198826: flow true
STREAM 1198826: read undefined
STREAM 1198826: need readable true
STREAM 1198826: length less than watermark true
STREAM 1198826: reading, ended or constructing false
...
```

Come già anticipato in precedenza è possibile avviare la nostra applicazione specificando più di un modulo core di 
Node.js. Per farlo basta associare alla variabile `NODE_DEBUG` i nomi dei moduli separati da virgola. Per esempio se vogliamo 
abilitare il modulo `http` ed il modulo `stream`, possiamo utilizzare il seguente comando:

```
$ NODE_DEBUG=http,stream node server.js
```

In questo caso entrambi i moduli stamperanno i loro messaggi sullo standard output. Capire quale modulo sta 
stampando un messaggio è molto semplice, infatti se date uno sguardo ai log mostrati in precedenza noterete che ogni messaggio 
include il nome del modulo, seguito dall'identificativo del processo (*PID*), e poi il messaggio. Questi log ci consentono 
di effettuare un debug approfondito delle nostre applicazioni Node.js e sono molto esplicativi nei loro messaggi.

## Aumentare le dimensioni dello stack trace

Quando un processo Node.js va in errore, viene stampato sullo standard error un messaggio che specifica 
la funzione che ha lanciato l'errore, e la relativa funzione chiamante (e così via). Questa lista di errori stampata prende 
il nome di stack trace (traducibile letteralmente dall'inglese come "traccia dello stack"). L'engine JavaScript di Node.js (V8) 
di default ritorna di default gli ultimi 10 riferimenti a funzione dello stack.

A volte però, abbiamo la necessità di ricevere più di 10 stack frame per comprendere meglio il contesto della causa 
principale dell'errore verificatosi. In pratica ci serve capire la radice da cui è partito l'errore. Node.js a tal 
proposito ci aiuta mediante il flag `--stack-trace-limit`, che ci è utile per aumentare lo stack delle chiamate a 
funzioni. Teniamo in considerazione però, che più è grande questo stack più memoria e CPU verrà utlizzata dal 
nostro processo in esecuzione. Non a caso l'uso è consigliato solo ed esclusivamente in ambienti di sviluppo.

Vediamo ora come possiamo aumentare le dimensioni dello stack trace di un'applicazione Fastify. 
Inizializziamo un nuovo progetto:

```
$ mkdir stackTraceServer
$ cd stackTraceServer
$ npm init -y
$ npm install --save fastify pino-pretty
$ touch server.js myContent.js
```

Una volta terminata la configurazione aggiungiamo il seguente codice nel file `server.js`

```javascript
import fastify from 'fastify'({
  logger: {
    prettyPrint: true,
  }
})
import {  getMyContent  } from './myContent'

fastify.get('/', async (req, res) => {
  res.send(getMyContent())
})

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    process.exit(1)
  }
}

start()
```

Come già anticipato nei precedenti paragrafi, Fastify incorpora il logger Pino nativamente quindi non avremo 
la necessità di installarlo separatamente. È possibile configurare il logger specificando tutte le opzioni necessarie 
sulla proprietà `logger`. Nel nostro caso abbiamo impostato a `true` la proprietà `prettyPrint` di conseguenza abbiamo 
la necessità di installare separatamente `pino-pretty`. Potrete trovare maggiori dettagli su come configurare Pino 
sulla [documentazione uffiale di Fastify](https://www.fastify.io/docs/latest/Logging). Ora che abbiamo terminato con 
il server, vediamo il contenuto del file `myContent.js`:

```javascript
function getMyContent(content, n = 10) {
  if (n !== 0) {
    n--
    return getMyContent(content, n)
  }

  return content.error_variable
}

export { getMyContent }
```

Lo scopo della funzione `getMyContent()` è forzare la creazione di chiamate di funzione in modo 
ricorsivo in modo da superare il limite di default dello stack di chiamate di Node.js. Quindi ad un certo punto riceveremo 
un errore da parte dell'applicazione ma non saremo in grado di capire in che contesto la 
funzione è stata eseguita.

Ora che abbiamo finito di implementare il nostro server, mandiamolo in esecuzione con il comando:

```
$ node server.js
[1633004682411] INFO (36228 on DebianXPS): Server listening at http://127.0.0.1:3000
```

A questo punto utilizzando un browser, o una cURL se preferite, digitate alla barra degli indirizzi `http://localhost:3000`. 
Il risultato che otterremo sarà il seguente:

```
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "Cannot read property 'error_variable' of undefined"
}
```

Se invece diamo uno sguardo alla console vedremo i dettagli della richiesta, con il relativo errore, sullo standard output:

```
[1633014092859] ERROR (47418 on DebianXPS): Cannot read property 'error_variable' of undefined
req: {
  "method": "GET",
  "url": "/",
  "hostname": "localhost:3000",
  "remoteAddress": "127.0.0.1",
  "remotePort": 34148
}
res: {
  "statusCode": 500
}
reqId: "req-1"
err: {
  "type": "TypeError",
  "message": "Cannot read property 'error_variable' of undefined",
  "stack":
    TypeError: Cannot read property 'error_variable' of undefined
    at getMyContent (/stackTraceServer/myContent.js:7:18)
    at getMyContent (/stackTraceServer/myContent.js:4:12)
    at getMyContent (/stackTraceServer/myContent.js:4:12)
    at getMyContent (/stackTraceServer/myContent.js:4:12)
    at getMyContent (/stackTraceServer/myContent.js:4:12)
    at getMyContent (/stackTraceServer/myContent.js:4:12)
    at getMyContent (/stackTraceServer/myContent.js:4:12)
    at getMyContent (/stackTraceServer/myContent.js:4:12)
    at getMyContent (/stackTraceServer/myContent.js:4:12)
    at getMyContent (/stackTraceServer/myContent.js:4:12)
}
```

Ovviamente notiamo che sono state stampate sullo standard output solo dieci chiamate a funzione, ossia il limite dello 
stack trace di V8. Ora riavviamo il nostro server ma questa volta utilizzando il flag `--stack-trace-limit` nel seguente modo:

```
$ node --stack-trace-limit=20 server.js
```

Questa volta, a video vedremo molte più informazioni rispetto all'esecuzione precedente:

```
[1633014685033] ERROR (49981 on DebianXPS): Cannot read property 'error_variable' of undefined
req: {
  "method": "GET",
  "url": "/",
  "hostname": "localhost:3000",
  "remoteAddress": "127.0.0.1",
  "remotePort": 35436
}
res: {
  "statusCode": 500
}
reqId: "req-1"
err: {
  "type": "TypeError",
  "message": "Cannot read property 'error_variable' of undefined",
  "stack":
    TypeError: Cannot read property 'error_variable' of undefined
      at getMyContent (/stackTraceServer/myContent.js:7:18)
      at getMyContent (/stackTraceServer/myContent.js:4:12)
      at getMyContent (/stackTraceServer/myContent.js:4:12)
      at getMyContent (/stackTraceServer/myContent.js:4:12)
      at getMyContent (/stackTraceServer/myContent.js:4:12)
      at getMyContent (/stackTraceServer/myContent.js:4:12)
      at getMyContent (/stackTraceServer/myContent.js:4:12)
      at getMyContent (/stackTraceServer/myContent.js:4:12)
      at getMyContent (/stackTraceServer/myContent.js:4:12)
      at getMyContent (/stackTraceServer/myContent.js:4:12)
      at getMyContent (/stackTraceServer/myContent.js:4:12)
      at Object.<anonymous> (/stackTraceServer/server.js:9:12)
      at preHandlerCallback (/stackTraceServer/node_modules/fastify/lib/handleRequest.js:126:28)
      at preValidationCallback (/stackTraceServer/node_modules/fastify/lib/handleRequest.js:109:5)
      at handler (/stackTraceServer/node_modules/fastify/lib/handleRequest.js:72:7)
      at handleRequest (/stackTraceServer/node_modules/fastify/lib/handleRequest.js:20:5)
      at runPreParsing (/stackTraceServer/node_modules/fastify/lib/route.js:427:5)
      at Object.routeHandler [as handler] (/stackTraceServer/node_modules/fastify/lib/route.js:385:7)
      at Router.lookup (/stackTraceServer/node_modules/find-my-way/index.js:347:14)
      at Server.emit (node:events:369:20)
}
```

A questo punto saremo in grado di capire che l'invocazione principale della nostra funzione `getMyContent` è stata fatta da 
`res.send()` nel file `server.js` alla riga 9 colonna 14. Questa informazione ci aiuterà a capire che il la nostra applicazione 
sta fallendo semplicemente perché non viene passato il valore `content` alla funzione `getMyContent`.

Il flag `--stack-trace-limit` indica al motore JavaScript V8 di conservare più stack su ogni tick del ciclo di eventi. 
Quando si verifica un errore, viene generata un'analisi dello stack che ripercorre le precedenti chiamate di funzione fino 
al limite consentito. Un ulteriore modo per aumentare il limite dello stack frame è quello di specificarlo nella nostra 
applicazione. La seguente linea di codice, infatti, ci consente di aumentare le dimensioni dello stack frame esattamente 
come fatto dal flag `--stack-trace-limit=20`:

```
Error.stackTraceLimit = 20
```

Molto spesso quando siamo in modalità di sviluppo vogliamo avere maggiori dettagli sugli errori e, allo stesso tempo 
in produzione, vogliamo risparmiare risorse preziose. È possibile specificare un valore speciale alla variabile 
`Error.stackTraceLimit` che consente di non avere un limite definito dello stack. Una possibile soluzione al 
problema è la seguente:

```
if (process.env.NODE_ENV !== 'production') {
  Error.stackTraceLimit = Infinity
}
```

## Creare report diagnostici

Questa utility è stata introdotta in Node.js a partire dalla versione `11.8.0` per aiutare gli sviluppatori a 
identificare quasi tutti gli scenari di anomalie di un'applicazione Node.js in produzione. Gli scenari includono la chiusura 
inaspettata del processo come un arresto anomalo, prestazioni lente, perdita di memoria, CPU elevata, errori 
imprevisti, output non corretto e altro ancora.

Sebbene il rapporto non individui il problema esatto o soluzioni specifiche, i suoi dati diagnostici ricchi di contenuti 
offrono suggerimenti vitali sul problema e accelerano il processo di diagnosi.

Questa utility era originariamente disponibile come modulo npm `node-report` ed è stata introdotta nel core Node.js 
perché aiuta in modo significativo a identificare la causa principale di numerosi tipi di problemi, inclusi i problemi 
di supporto inviati ai diversi repository nell'organizzazione Node.js. Prima che facesse parte del core, dovevi 
aggiungere esplicitamente la dipendenza nell'applicazione.

Ora vedremo come configurare ed utilizzare questa utility di diagnosi nelle nostre applicazioni. In particolare vedremo 
come creare un report sulle eccezioni non gestite. Innanzitutto inzializziamo il nostro progetto:

```
$ mkdir diagnosticReport
$ cd diagnosticReport
$ mkdir reports
$ touch server.js
```

La directory `reports` conterrà i reports che la nostra applicazione produrrà durante l'esecuzione. 
Ora scriviamo un'applicazione che produrrà un'errore:

```javascript
import fs from 'node:fs'
import path from 'node:path'

fs.readFileSync('foo.txt')
```

Se eseguiamo questa applicazione terminerà con un errore `ENOENT` in quanto il file `foo.txt` non esiste:

```
node:internal/fs/utils:323
    throw err;
    ^

Error: ENOENT: no such file or directory, open 'foo.txt'
    at Object.openSync (node:fs:505:3)
    at Object.readFileSync (node:fs:401:35)
    at Object.<anonymous> (/home/davide/Projects/nodejs-book/sourceCode/ch9/diagnosticReport/server.js:7:4)
    at Module._compile (node:internal/modules/cjs/loader:1092:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1121:10)
    at Module.load (node:internal/modules/cjs/loader:972:32)
    at Function.Module._load (node:internal/modules/cjs/loader:813:14)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:76:12)
    at node:internal/main/run_main_module:17:47 {
  errno: -2,
  syscall: 'open',
  code: 'ENOENT',
  path: 'foo.txt'
}
```

Per abilitare l'utility di diagnosi dobbiamo compiere due passi. Il primo è quello di specificare dove salvare i nostri report, mentre il secondo è quello di avviare la nostra applicazione utilizzando il flag `--report-uncaught-exception`. Ma facciamo un passo alla volta ed iniziamo aggiungendo queste due linee di codice alla nostra applizione subito l'import dei moduli necessari al suo funzionamento:

```javascript
process.report.directory = path.join(import.meta.dirname, 'reports')
process.report.filename = 'diagnostic-report.json'
```

Una volta effettuata questa modifica al codice avviamo l'applicazione nel seguente modo:

```
$ node --report-uncaught-exception server.js
```

Noterete che l'output dell'applicazione sarà sempre lo stesso, solo che questa volta avremo a disposizione l'intero report 
di quanto accaduto nel file `reports/diagnostic-report.json`. Se apriamo il file noteremo nelle prime righe le 
proprietà `event` e `trigger`, che ci indicheranno la tipologia di errore che si è verificata. Nel nostro caso:

```
  "event": "ENOENT: no such file or directory, open 'foo.txt'",
  "trigger": "Exception",
```

La sezione `header` contiene anche altre informazioni come la versione di Node.js che si sta utilizzando, informazioni sul 
sistema operativo, sulle CPU della macchina, la versione V8, le interfacce di rete che si stanno utilizzando e così via:

```
"reportVersion": 2,
"event": "ENOENT: no such file or directory, open 'foo.txt'",
"trigger": "Exception",
"filename": "diagnostic-report.json",
"dumpEventTime": "2021-10-01T08:22:59Z",
"dumpEventTimeStamp": "1633069379085",
"processId": 488677,
"threadId": 0,
"cwd": "/home/davide/Projects/nodejs-book/sourceCode/ch9/diagnosticReport",
"commandLine": [
  "node",
  "--report-uncaught-exception",
  "server.js"
],
"nodejsVersion": "v14.16.1",
"glibcVersionRuntime": "2.31",
"glibcVersionCompiler": "2.17",
"wordSize": 64,
"arch": "x64",
"platform": "linux",
"componentVersions": {
  "node": "14.16.1",
  "v8": "8.4.371.19-node.18",
  "uv": "1.40.0",
  "zlib": "1.2.11",
  "brotli": "1.0.9",
  "ares": "1.16.1",
  "modules": "83",
  "nghttp2": "1.41.0",
  "napi": "7",
  "llhttp": "2.1.3",
  "openssl": "1.1.1k",
  "cldr": "37.0",
  "icu": "67.1",
  "tz": "2020a",
  "unicode": "13.0"
},
"release": {
  "name": "node",
  "lts": "Fermium",
  "headersUrl": "https://nodejs.org/download/release/v14.16.1/node-v14.16.1-headers.tar.gz",
  "sourceUrl": "https://nodejs.org/download/release/v14.16.1/node-v14.16.1.tar.gz"
},
"osName": "Linux",
"osRelease": "5.10.0-8-amd64",
```

```
"osVersion": "#1 SMP Debian 5.10.46-5 (2021-09-23)",
"osMachine": "x86_64",
"cpus": [
  ...
],
"networkInterfaces": [
  ...
],
"host": "DebianXPS"
```

Continuando a scorrere il file per esempio, troveremo stacka trace JavaScript:

```
"javascriptStack": {
  "message": "Error: ENOENT: no such file or directory, open 'foo.txt'",
  "stack": [
    "at Object.openSync (node:fs:505:3)",
    "at Object.readFileSync (node:fs:401:35)",
    "at Object.<anonymous> (/diagnosticReport/server.js:7:4)",
    "at Module._compile (node:internal/modules/cjs/loader:1092:14)",
    "at Object.Module._extensions..js (node:internal/modules/cjs/loader:1121:10)",
    "at Module.load (node:internal/modules/cjs/loader:972:32)",
    "at Function.Module._load (node:internal/modules/cjs/loader:813:14)",
    "at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:76:12)"
  ],
  "errorProperties": {
    "errno": "-2",
    "syscall": "open",
    "code": "ENOENT",
    "path": "foo.txt"
  }
},
```

O ancora sulle variabili d'ambiente utilizzate dal processo:

```
"environmentVariables": {
  "GJS_DEBUG_TOPICS": "JS ERROR;JS LOG",
  "USER": "davide",
  "XDG_SESSION_TYPE": "wayland",
  "LD_LIBRARY_PATH": "/opt/oracle/instantclient_21_1:",
  "SHLVL": "1",
  "HOME": "/home/davide",
  "OLDPWD": "/home/davide/Projects/nodejs-book/sourceCode/ch9",
  "DESKTOP_SESSION": "gnome",
  "GIO_LAUNCHED_DESKTOP_FILE": "/usr/share/applications/code.desktop",
  "GTK_MODULES": "gail:atk-bridge",
  "MANAGERPID": "3935",
  "DBUS_SESSION_BUS_ADDRESS": "unix:path=/run/user/1000/bus",
  "GIO_LAUNCHED_DESKTOP_FILE_PID": "7180",
  "WAYLAND_DISPLAY": "wayland-0",
  "LOGNAME": "davide",
  "_": "/home/davide/.nvm/versions/node/v14.16.1/bin/node",
  "JOURNAL_STREAM": "8:23459",
  "XDG_SESSION_CLASS": "user",
  "USERNAME": "davide",
  "GNOME_DESKTOP_SESSION_ID": "this-is-deprecated",
  "PATH": "/home/davide/.nvm/versions/node/v14.16.1/bin:/usr/local/bin:/usr/bin:/bin:/usr/games",
  "GDM_LANG": "it_IT.UTF-8",
  "SESSION_MANAGER": "local/DebianXPS:@/tmp/.ICE-unix/4074,unix/DebianXPS:/tmp/.ICE-unix/4074",
  "INVOCATION_ID": "e1d414fb858d49cfb4452e04811a3a1c",
  "XDG_RUNTIME_DIR": "/run/user/1000",
  "XDG_MENU_PREFIX": "gnome-",
  "GNOME_SETUP_DISPLAY": ":1",
  "DISPLAY": ":0",
  "LANG": "it_IT.UTF-8",
  "XDG_CURRENT_DESKTOP": "GNOME",
  "XDG_SESSION_DESKTOP": "gnome",
  "XMODIFIERS": "@im=ibus",
  "XAUTHORITY": "/run/user/1000/.mutter-Xwaylandauth.AC9WA1",
  "SSH_AGENT_LAUNCHER": "openssh",
  "SSH_AUTH_SOCK": "/run/user/1000/keyring/ssh",
  "SHELL": "/usr/bin/zsh",
  "QT_ACCESSIBILITY": "1",
  "GDMSESSION": "gnome",
  "GJS_DEBUG_OUTPUT": "stderr",
  "QT_IM_MODULE": "ibus",
  "PWD": "/home/davide/Projects/nodejs-book/sourceCode/ch9/diagnosticReport",
  "XDG_DATA_DIRS": "/usr/local/share/:/usr/share/:/var/lib/snapd/desktop",
  "CHROME_DESKTOP": "code-url-handler.desktop",
  "ORIGINAL_XDG_CURRENT_DESKTOP": "GNOME",
  "GDK_BACKEND": "x11",
  "ZSH": "/home/davide/.oh-my-zsh",
  "PAGER": "less",
  "LESS": "-R",
  "LSCOLORS": "Gxfxcxdxbxegedabagacad",
  "NVM_DIR": "/home/davide/.nvm",
  "NVM_CD_FLAGS": "-q",
  "NVM_BIN": "/home/davide/.nvm/versions/node/v14.16.1/bin",
  "NVM_INC": "/home/davide/.nvm/versions/node/v14.16.1/include/node",
  "BREAKPAD_DUMP_LOCATION": "/home/davide/.config/Code/exthost Crash Reports",
  "TERM_PROGRAM": "vscode",
  "TERM_PROGRAM_VERSION": "1.60.2",
  "COLORTERM": "truecolor",
  "VSCODE_GIT_IPC_HANDLE": "/run/user/1000/vscode-git-e186da8c0c.sock",
  "GIT_ASKPASS": "/usr/share/code/resources/app/extensions/git/dist/askpass.sh",
  "VSCODE_GIT_ASKPASS_NODE": "/usr/share/code/code",
  "VSCODE_GIT_ASKPASS_MAIN": "/usr/share/code/resources/app/extensions/git/dist/askpass-main.js",
  "TERM": "xterm-256color"
},
```

Nell'esempio precedente abbiamo utilizzato `process.report.directory` e `process.report.filename` nella nostra applicazione. 
Allo stesso modo è possibile utilizzare i flag `--report-directory` e `--report-filename` dalla linea di comando. 
Il risultato che otterremo sarà esattamente lo stesso:

```javascript
import fs from 'node:fs'
import path from 'node:path'

fs.readFileSync('foo.txt')
```

Possiamo a questo punto mandare in esecuzione la nostra applicazione nel seguente modo:

```
$ node --report-directory='./reports' --report-filename='diagnostic-report.json' --report-uncaught-exception server.js
```

### Utilizzare l'API JavaScript

Abbiamo visto come questa utility è in grado di scrivere un riepilogo diagnostico in un file sotto determinate 
condizioni. Oltre al flag `--report-uncaught-exception` è possibile utilizzarne anche altri:

- `--report-on-signal`: genera un report alla ricezione di un segnale specifico.
- `--report-on-fatalerror`: genera un report nel caso si verifichi un fatal error, come an errore OutOfMemory.

Oltre all'utilizzo dei flag dalla riga di comando è possibile generare un report utilizzando l'API JavaScript nel seguente modo:

```javascript
process.report.writeReport()
```

Questa funzione prende in input un parametro `Error`, opzionale, che viene utilizzato dal modulo di reportistica 
per compilare le informazioni della proprietà `javascriptStack`. Facciamo un piccolo esempio per capirne meglio il comportamento. 
Creiamo un file `serverApi.js` con il seguente contenuto:

```javascript
import fs from 'node:fs'
import path from 'node:path'

try {
  fs.readFileSync('foo.txt')
} catch (err) {
  process.report.writeReport(err)
}

// Altro codice che verrà eseguito
```

In questo caso eseguendo l'applicazione verrà generato un report nella stessa directory di esecuzione con un nome 
che segue la convenzione: `report.20211001.094341.1007679.0.001.json`. È possibile però passare un ulteriore parametro 
alla funzione che ne specifica il path del file che si intende utilizzare. Nel caso in cui il file non 
esiste verrà creato automaticamente:

```javascript
import fs from 'node:fs'
import path from 'node:path'

try {
  fs.readFileSync('foo.txt')
} catch (err) {
  process.report.writeReport(path.join(import.meta.dirname, 'reports', 'api-report.json'), err)
}

// Altro codice che verrà eseguito
```