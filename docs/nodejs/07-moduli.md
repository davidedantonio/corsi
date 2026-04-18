---
sidebar_position: 7
---

# Moduli

Node.js utilizza il concetto di modulo come unità di misura per strutturare il codice di un'applicazione e soprattutto come 
meccanismo principale per l'occultamento delle informazioni, mantenendo private tutte le variabili che non sono esplicitamente 
esportate. In questo capitolo analizzeremo le metodologie più comuni di utilizzo. Prima dell'avvento dei moduli ECMAScript, 
che oggi è possibile utilizzare nativamente in Node.js, i moduli venivano collegati insieme utilizzando la funzione `require()`, 
un approccio semplice ma potente.

Ora daremo uno sguardo al sistema di moduli di Node.js ed ai principali pattern di definizione. Successivamente vedremo come 
creare e pubblicare un modulo open source utilizzando github e npm.

## Perché i moduli

Uno dei maggiori problemi con JavaScript è l'assenza dello spazio dei nomi. Programmi che vengono eseguiti nell'ambito globale 
inquinandolo con dati che provengono sia dal codice dell'applicazione interna che dalle dipendenze. Una tecnica popolare per risolvere 
questo problema, e che molti di voi conosceranno, è la seguente:

```
var $, jQuery
$, jQuery = (() => {
  return { /* ... */ }
})()
```

Questo pattern prende il nome di *IIFE* (Immediately Invoked Function Expression), conosciuta anche come _Funzione Anonima ad Esecuzione Automatica_ 
e contiene due parti principali:

* La prima è la funzione anonima con ambito lessicale racchiusa all'interno dell'operatore di raggruppamento `()`. Ciò impedisce l'accesso alle variabili all'interno dell'idioma IIFE e l'inquinamento dell'ambito globale.

* La seconda parte crea la funzione immediatamente richiamata attraverso la quale il motore JavaScript interpreterà direttamente la funzione.

Vediamo ora un altro esempio:

```javascript
const module = (() => {
  const privateFoo = () => { ... }
  const privateBar = []
  return {
    publicFoo: () => { ... },
    publicBar: () => { ... }
  }  
})()
```

Anche in questo caso sfruttiamo una funzione di richiamo automatico per creare un ambito privato, esportando solo le parti che dovrebbero essere pubbliche. Nel codice precedente, la variabile del modulo contiene solo l'API esportata, mentre il resto del contenuto del modulo è praticamente inaccessibile dall'esterno. Come vedremo tra poco, l'idea alla base di questo pattern viene utilizzata come base per il sistema di moduli Node.js.

## Coesione ed Accoppiamento

Le due proprietà più importanti da bilanciare durante la costruzione dei moduli sono la *coesione* e l'*accoppiamento*. Possono essere applicate a qualsiasi tipo di componente o sottosistema nell'architettura software, quindi possiamo utilizzarli come linee guida anche durante la creazione di moduli Node.js. Queste due proprietà possono essere definite come segue:

- *Coesione*: questa è la misura del legame tra le funzionalità di un componente. Ad esempio, un modulo che fa solo una cosa, in cui tutte le sue parti contribuire a quell'unico compito ha un'elevata coesione. Un modulo che contiene funzioni per salvare qualsiasi tipo di oggetto in un database - `saveProduct()`, `saveInvoice()`, `saveUser()` e così via ha una bassa coesione.
- *Accoppiamento*: misura quanto un componente dipende da un altro componente in un sistema. Ad esempio, un modulo è strettamente accoppiato a un altro modulo quando legge direttamente o modifica i dati dell'altro modulo. Inoltre, due moduli che interagiscono tramite uno stato globale o condiviso sono strettamente accoppiati. D'altra parte, due moduli che comunicano solo tramite il passaggio di parametri sono strettamente accoppiati.

Lo scenario ideale è quello di avere un'alta coesione ed un basso accoppiamento, che spesso significa avere moduli più comprensibili, riusabili ed estendibili.

## La specifica CommonJS

CommonJS (*CJS*) è uno standard per strutturare e organizzare il codice JavaScript. CJS assiste nello sviluppo di app lato server 
e il suo formato ha fortemente influenzato la gestione dei moduli di NodeJS. In questo libro verrà usata solo questa specifica, ma daremo 
uno sguardo veloce anche allo standard ECMAScript, introdotta nelle ultime versioni di Node.js. 

CommonJS avvolge ogni modulo in una funzione chiamata `require` e include un oggetto chiamato `module.exports`, che esporta il 
codice per la disponibilità richiesta da altri moduli. Tutto quello che devi fare è aggiungere tutto ciò che desideri accessibile 
ad altri file nell'oggetto `exports` e richiedere il modulo nel file dipendente. Prima che il codice di un modulo venga eseguito, 
Node.js lo avvolgerà con una funzione wrapper simile alla seguente:

```javascript
(function(exports, require, module, import.meta.filename, import.meta.dirname) {
  // Codice del nostro modulo
})
```

In questo modo, Node.js ottiene le stesse cose che si propone di fare una *IIFE*:

- Mantiene le variabili di primo livello (definite con `var`, `const` o `let`) nell'ambito del modulo anziché nell'oggetto globale.
- Aiuta a fornire alcune variabili dall'aspetto globale che sono effettivamente specifiche del modulo, come ad esempio:
  - Gli oggetti `module` ed `exports` che l'implementatore può utilizzare per esportare i valori di un modulo.
  - Le variabili di convenienza `__filename` e `__dirname`, contenenti il nome file assoluto del modulo e il percorso della directory.

### Un piccolo esempio

Facciamo un esempio, creiamo un modulo `geometry.js`, utilizzando la specifica CJS, che esporta alcune formule:

```javascript
const { PI, pow } = Math

export const circleArea = r => PI * pow(r, 2)
export const circleCircumference = r => 2 * PI * r
export const squarePerimeter = l => l * 4
export const squareArea = l => pow(l, 2) * 6
```

Il modulo `geometry.js` esporta le funzioni `circleArea()`, `circleCircumference()`, `squarePerimeter()`e `squareArea()`.
Le funzioni e gli oggetti vengono aggiunti alla radice di un modulo specificando proprietà aggiuntive sull'oggetto `exports`.

Le variabili locali al modulo saranno private, perché il modulo è racchiuso dalla funzione wrapper. In questo esempio,
le variabili `PI` e `pow` saranno private. Alla proprietà `module.exports` può essere assegnato anche un valore o una classe. Per esempio:

```javascript
const { PI, pow } = Math

export const circleArea = r => PI * pow(r, 2)
export const circleCircumference = r => 2 * PI * r
export const squarePerimeter = l => l * 4
export const squareArea = l => pow(l, 2) * 6
export const Parallelogram = class {
  constructor (b, h) {
    this.b = b
    this.h = h
  }

  perimeter () {
    return (this.b * 2) + (this.h * 2)
  }

  area () {
    return this.b * this.h
  }
}
```

Per poter utilizzare questo modulo creiamo il file `calculator.js`, che utilizza il modulo `geometry`:

```javascript
const { 
  Parallelogram,
  circleArea,
  squareArea,
  circleCircumference
} = './geometry'

// Creiamo un istanza della classe Parallelogram
const p = new Parallelogram(5, 4)
console.log(`Parallelogram area: ${p.area()}`)
console.log(`Parallelogram perimeter: ${p.perimeter()}`)

// Calcolo dell'area di un quadrato
console.log(`Square area: ${squareArea(4)}`)

// Calcolo della circonferenza e dell'area di un cerchio
console.log(`Circle circumference: ${circleCircumference(9)}`)
console.log(`Circle area: ${circleArea(9)}`)
```

Eseguendo lo script il risultato che otterremo sarà il seguente:

```javascript
Parallelogram area: 20
Parallelogram perimeter: 18
Square area: 96
Circle circumference: 56.548667764616276
Circle area: 254.46900494077323
```

### Scope di un modulo

In precedenza abbiamo detto che la specifica CJS avvolge ogni nostro modulo in un wrapper che ha la seguente forma:

```javascript
(function(exports, require, module, import.meta.filename, import.meta.dirname) {
  // Codice del nostro modulo
})
```

Questa funzione crea uno scope per il nostro modulo, fornendogli alcune utility. Diamo ora uno sguardo a cosa rappresentano le diverse variabili messe a disposizione.

#### dirname e filename

Sono due variabili stringa il cui contenuto rappresenta:

- *`__dirname`*: il nome della directory del modulo corrente.
- *`__filename`*: il nome del file del modulo corrente. Questo è il percorso assoluto del file del modulo corrente con i collegamenti simbolici risolti. Per un programma principale questo non è necessariamente lo stesso del nome del file utilizzato nella riga di comando.

Ecco un piccolo script di esempio:

```javascript
// Nel mio caso stamperà "Dirname is: /Users/davidedantonio/Desktop"
console.log(`Dirname is: ${import.meta.dirname}`)

// Nel mio caso stamperà "Filename is: /Users/davidedantonio/Desktop/filename_dirname.js"
console.log(`Filename is: ${import.meta.filename}`)
```

#### module.exports

In ogni modulo, la variabile `module` è un riferimento all'oggetto che rappresenta il modulo corrente. Per comodità, `module.exports` è accessibile anche tramite `exports module-global`. `module` non è in realtà un globale ma piuttosto locale per ogni modulo.

La variabile module contiene le seguenti informazioni: 

* *`module.children`*: gli oggetti modulo richiesti per la prima volta da questo.
* *`module.exports`*: rappresenta l'istruzione che dice a Node. js quali bit di codice (funzioni, oggetti, stringhe, ecc.) da "esportare" da un determinato file in modo che altri file possano accedere al codice esportato.
* *`module.filename`*: contiene il path assoluto del modulo. Equivale a `__filename`
* *`module.id`*: l'identificatore del modulo. In genere questo è il nome del file completamente risolto.
* *`module.isPreloading`*: `true` se il modulo è in esecuzione durante la fase di precaricamento di Node.js.
* *`module.loaded`*: indica se il modulo ha terminato il caricamento o è in fase di caricamento.
* *`module.paths`*: I percorsi di ricerca per i moduli.

#### exports

Questo è solo zucchero sintattico. Altro non è che un riferimento a `module.exports` che è più breve da digitare.

#### require

La funzione `require()` ci consente di includere moduli nella nostra applicazione. Puoi aggiungere moduli core di Node.js,
moduli userland (`node_modules`) o moduli locali. È il modo più semplice per includere moduli che esistono
in file separati. La funzionalità di base di `require` è che legge un file JavaScript, esegue il file e quindi
procede alla restituzione dell'oggetto `exports`.

### Il modulo principale

Quando un file viene eseguito direttamente da Node.js, `require.main` sarà uguale a `module`. Ciò significa che è possibile determinare se un file è stato eseguito direttamente testando `require.main === module`. Per un file `main.js`, questo sarà vero se eseguito dalla linea di comando con il comando `node main.js`, ma falso se eseguito da `require('./main')`.

```javascript
// file main.js
console.log(require.main === module)
```

Se proviamo ad eseguire il seguente script:

```
$ node main.js
true
```

Se ora creiamo un altro file che include `main.js`:

```javascript
// file main2.js
'./main'
```

Eseguendo questo script il risultato che otterremo sarà:

```
$ node main2.js
false
```

Poiché module fornisce una proprietà filename (normalmente equivalente a `__filename`), il punto di ingresso dell'applicazione corrente può essere ottenuto controllando `require.main.filename`.

## La specifica ECMAScript

I moduli ECMAScript rappresentano lo standard ufficiale per impacchettare il codice JavaScript per il riutilizzo. I moduli vengono definiti utilizzando una varietà di istruzioni di importazione ed esportazione. Node.js tratta il codice JavaScript come moduli CommonJS per impostazione predefinita. ma possiamo dire a Node.js di trattare il codice JavaScript come moduli ECMAScript tramite l'estensione del file `.mjs` anziché `js`, o la proprietà `"type"` nel file `package.json`.

Ora ricreiamo i moduli `geometry` e `calculator` utilizzando questo standard:

```javascript
// geometry module
const { PI, pow } = Math

export const circleArea = r => PI * pow(r, 2)
export const circleCircumference = r => 2 * PI * r
export const squarePerimeter = l => l * 4
export const squareArea = l => pow(l, 2) * 6
export class Parallelogram {
  constructor (b, h) {
    this.b = b
    this.h = h
  }

  perimeter () {
    return (this.b * 2) + (this.h * 2)
  }

  area () {
    return this.b * this.h
  }
}
```

```javascript
import { 
  Parallelogram,
  circleArea,
  squareArea,
  circleCircumference
} from './geometry.mjs'

// Creiamo un istanza della classe Parallelogram
const p = new Parallelogram(5, 4)
console.log(`Parallelogram area: ${p.area()}`)
console.log(`Parallelogram perimeter: ${p.perimeter()}`)

// Calcolo dell'area di un quadrato
console.log(`Square area: ${squareArea(4)}`)

// Calcolo della circonferenza e dell'area di un cerchio
console.log(`Circle circumference: ${circleCircumference(9)}`)
console.log(`Circle area: ${circleArea(9)}`)
```

### Differenze tra moduli ES e CJS

Ci sono alcune differenze sostanziali tra i moduli ES e CJS in Node.js. Le principali sono le seguenti:

* *`require`, `exports` o `module.exports`*: Nella maggior parte dei casi, l'importazione del modulo ES può essere utilizzata per caricare i moduli CommonJS. Se necessario, è possibile costruire una funzione require all'interno di un modulo ES utilizzando `module.createRequire()`.
* *`__filename` e `__dirname`*: Queste due variabili non saranno disponibili nei modulie ES.

La lista completa delle differenze tra queste due specifiche potete trovarla sulla [documentazione ufficiale di Node.js](https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_differences_between_es_modules_and_commonjs)

## Pattern di definizione di un modulo

I moduli non sono solo un meccanismo per importare dipendenze, ma anche un modo per definire API, e quindi la definizione di cosa vogliamo rendere pubblico e privato. Ovviamente l'obbiettivo dev'essere quello di massimizzare l'occultamento delle informazioni (_information hiding_) e garantire il corretto utilizzo dell'API pubblica. Facendo ciò riusciamo a garantire sia l'estendibilità che il riutilizzo del codice.

Nei prossimi paragrafi analizzeremo quali sono le pratiche comuni da utilizzare per definire un modulo.

### Export nominale

Il metodo più semplice per creare una API pubblica è chiamato export nominale, che consiste nell'assegnare tutti i valori che vogliamo esporre nella nostra API, utilizzando `exports` o `module.exports` con un nome specifico. Molti moduli core di Node.js utilizzando questa metodologia di definizione delle loro API.

Di seguito un piccolo modulo implementato utilizzando l'export nominale:

```javascript
// logger.js
import chalk from 'chalk'

export const info = (message) => {
  console.log(chalk.blue(message))
}

export const error = (message) => {
  console.log(chalk.red(message))
}
```

Le funzioni exportate saranno disponibili come proprietà del modulo caricato:

```javascript
// file main.js
import logger from './logger'
logger.info('This is an info message')
logger.error('This is an error message')
```

Possiamo anche utilizzare lo standard ECMAScript per definire ed utilizzare il nostro modulo di logging:

```javascript
// file logger.js
import chalk from 'chalk'

export const info = message => {
  console.log(chalk.blue(message))
}

export const error = message => {
  console.log(chalk.red(message))
}
```

Anche in questo caso le funzioni esportate saranno disponibili come proprietà del nostro modulo:

```javascript
// file main.js
import * as logger from './logger.js'

logger.info('This is an info message')
logger.error('This is an error message')
```

### Export di funzioni

Un'altra metodologia comune nell'esportare le funzionalità di un modulo è quella di assegnare all'intero oggetto `module.exports` una funzione. Questa metodologia consente di esporre una singola funzionalità rendendo il modulo semplice da comprendere ed utilizzare. Riscriviamo ora il nostro modulo `logger` in modo che utilizzi questa metodologia:

```javascript
// logger.js
import chalk from 'chalk'

export default (message) => {
  console.log(chalk.blue(message))
}

module.export const error = (message) => {
  console.log(chalk.red(message))
}
```

In questo caso invocando direttamente la funzione `logger()` verrà stampato a video un messaggio di tipo info:

```javascript
// file main.js
import logger from './logger'

logger('This is an info message')
logger.error('This is an error message')
```

Utilizzando lo standard ECMAScript, invece, il nostro modulo prende la seguente forma:

```javascript
// file logger.js
import chalk from 'chalk'

const info = message => {
  console.log(chalk.blue(message))
}

export default info
export const error = message => {
  console.log(chalk.red(message))
}
```

Il codice precedente esporta la funzione `info()` come esportazione predefinita e un'esportazione nominale per la funzione `error()`. Volendo importare sia l'esportazione predefinita che quella nominale, dobbiamo procedere nel seguente modo:

```javascript
// file main.js
import info, { error } from './logger.js'

info('This is an info message')
error('This is an error message')
```

### Export di una classe

Un modulo oltre ad esportare funzioni può anche esportare la definizione di una classe. La differenza sostanizale che esiste rispetto alle metodologie viste in precedenza, è che utilizzando questa tecnica uno sviluppatore può creare tutte le istanze che vuole e può estenderne il prototipo per aggiungere nuove funzionalità. Vediamo come trasformare il nostro modulo utilizzando questa metodologia:

```javascript
// logger.js
import chalk from 'chalk'

class Logger {
  constructor (name) {
    this.name = name
  }

  log (message) {
    console.log(chalk.blue(message))
  }

  info (message) {
    this.log(message)
  }

  error (message) {
    console.log(chalk.red(message))
  }
}

export default Logger
```

Possiamo utilizzare il modulo nel seguente modo:

```javascript
// file main.js
import Logger from './logger'

const customLogger = new Logger('default')
customLogger.log('This is an info message logger')
customLogger.info('This is an info a message logger')
customLogger.error('This is an error a message logger')

const customLogger2 = new Logger('another')
customLogger2.info('This is another info a message logger')
```

L'implementazione utilizzando la specifica ECMAScript risulta la seguente:

```javascript
// logger.js
import chalk from 'chalk'

class Logger {
  constructor (name) {
    this.name = name
  }

  log (message) {
    console.log(chalk.blue(message))
  }

  info (message) {
    this.log(message)
  }

  error (message) {
    console.log(chalk.red(message))
  }
}

export default Logger
```

Possiamo utilizzare questa classe nel modo seguente:

```javascript
// file main.js
import Logger from './logger.js'

const customLogger = new Logger('default')
customLogger.log('This is an info message logger')
customLogger.info('This is an info a message logger')
customLogger.error('This is an error a message logger')

const customLogger2 = new Logger('another')
customLogger2.info('This is another info a message logger')
```

### Export di un istanza (Singleton Pattern)

Questa tipologia di exportazione utilizza le classi esattamente come la metodologia mostrata nel precedente paragrafo. La differenza sostanziale, è che in questo caso non viene esportata la definizione della classe ma l'istanza di una classe. Di conseguenza uno sviluppatore ha a disposizione una singola istanza della classe e non può crearne altre. Questa metodologia, infatti, viene chiamata anche _"Singleton Pattern"_. Ancora una volta riscriviamo il nostro modulo affinché venga esportata una sola istanza:

```javascript
// logger.js
import chalk from 'chalk'

class Logger {
  constructor (name) {
    this.name = name
  }

  log (message) {
    console.log(chalk.blue(message))
  }

  info (message) {
    this.log(message)
  }

  error (message) {
    console.log(chalk.red(message))
  }
}

export default new Logger('default')
```

Ed il suo utilizzo, questa volta è il seguente:

```javascript
// file main.js
import logger from './logger'

logger.log('This is an info message logger')
logger.info('This is an info a message logger')
logger.error('This is an error a message logger')
```

Anche in questo esempio è possibile utilizzare la specifica ECMAScript:

```javascript
// logger.js
import chalk from 'chalk'

class Logger {
  constructor (name) {
    this.name = name
  }

  log (message) {
    console.log(chalk.blue(message))
  }

  info (message) {
    this.log(message)
  }

  error (message) {
    console.log(chalk.red(message))
  }
}

export default new Logger('default')
```

Possimao utilizzare l'istanza esportata nel seguente modo:

```javascript
// file main.js
import logger from './logger.js'

logger.log('This is an info message logger')
logger.info('This is an info a message logger')
logger.error('This is an error a message logger')
```

## Creare e pubblicare un modulo

Iniziamo la nostra esplorazione impostando una tipica struttura di file e directory per un modulo Node.js. Allo stesso tempo, vedremo come generare automaticamente un file `package.json`. Configureremo anche `npm` (lo strumento di gestione dei pacchetti di Node) con alcune impostazioni predefinite, che potranno quindi essere utilizzate come parte del processo di generazione dei pacchetti.

### Iniziamo

Se Node è installato sul nostro sistema, lo stesso vale per l'eseguibile di npm. npm è il package manager predefinito di Node.js, è utile per installare, creare, manipolare e pubblicare moduli. Contrariamente alla credenza popolare, npm non è un acronimo per *Node Package Manager*; infatti, sta per *npm is Not An Acronym*, che è il motivo per cui non è chiamato *NINAA*. Prima di lanciare qualsiasi comando configuriamo un po' npm. Da una shell digitate il seguente comando:

```
$ npm config set init.author.name "<il nostro nome>”
```

Questo velocizzerà la creazione dei nostri moduli e assicurerà che ogni pacchetto che creiamo abbia il nostro nome.

### Creiamo il modulo

Diciamo di voler creare un modulo che abbia una serie di utility che ci possono servire durante lo sviluppo. Diciamo che il nome `string-utils` ci suona bene quindi creiamo una directory con questo nome:

```
$ mkdir string-utils
$ cd string-utils
```

Ogni modulo Node.js deve avere un file `package.json`, che contiene i metadati relativi al modulo stesso.

Invece di creare manualmente un file `package.json`, possiamo semplicemente eseguire quanto segue comando nella directory appena creata:

```
$ npm init
```

Questo comando ci farà una serie di domande. Possiamo premere Invio per ogni domanda senza fornire una risposta. Nota come il nome del modulo predefinito corrisponde alla directory corrente e l'autore predefinito è il valore init.author.name che abbiamo impostato in precedenza. Un npm init dovrebbe somigliare a quanto segue:

![](./img/ch-7/01.png)

Molto spesso tutte le domande di default vanno bene. Invece di premere il tasto Invio per ogni domanda, possiamo eseguire `npm init -y` per creare immediatamente un file `package.json`, basato sui valori predefiniti. Al termine, dovremmo avere un file `package.json` che assomiglia al seguente:

```
{
  "name": "string-utils",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Davide D'Antonio",
  "license": "MIT"
}
```

### Come funziona npm

Quando Node è installato sul nostro sistema, `npm` viene fornito con esso. L'eseguibile `npm` è scritto in JavaScript e gira su Node. Il comando `npm` config può essere utilizzato per modificare in modo permanente le impostazioni. Nel nostro caso, abbiamo modificato l'impostazione `init.author.name` in modo che `npm init` possa fare riferimento a esso per l'impostazione predefinita durante l'inizializzazione di un modulo.

Possiamo elencare tutte le impostazioni di configurazione correnti con `npm config ls`. Quando eseguiamo `npm init`, le risposte che forniamo vengono archiviate in un oggetto, serializzate come JSON e quindi salvate in un file `package.json` appena creato nella directory corrente.

### Re-inizializziamo

A volte, possono essere disponibili ulteriori metadati dopo aver creato un modulo. Uno scenario tipico può sorgere quando inizializziamo il nostro modulo come repository Git e aggiungiamo un endpoint remoto dopo aver creato il modulo. Per dimostrarlo, creiamo un repository GitHub per il nostro modulo. Andiamo su GitHub e fai clic sul simbolo più in alto a destra, quindi seleziona *New repository*:

![](./img/ch-7/02.png)

Specifichiamo il nome *string-utils* e, successivamente, clicchiamo su *Create Repository*. Tornando al terminale, all'interno della nostra cartella dei moduli, ora possiamo eseguire questo:

```
$ echo -e "node_modules \ n * .log" > .gitignore
$ git init
$ git add .
$ git commit -m 'primo commit'
$ git remote aggiungi origine http://github.com/<username>/string-utils
$ git push -u origin master
```

Ora ecco che arriva la parte magica; inizializziamo di nuovo il modulo (semplicemente premiamo invio per ogni domanda):

```
$ npm init
```

Questa volta il `git remote` che abbiamo appena aggiunto è stato rilevato ed è diventato la risposta predefinita per la domanda del repository git. Accettare questa risposta predefinita significava che i campi repository, bug e homepage erano stati aggiunti al `package.json`.

Il campo repository nel `package.json` è un'aggiunta importante quando si tratta di pubblicare moduli open source poiché sarà reso come un collegamento nella pagina di informazioni sui moduli su http://npmjs.org. Il collegamento al repository consente ai potenziali utenti di esaminare il codice prima dell'installazione. I moduli che non possono essere visualizzati prima dell'uso hanno meno probabilità di essere considerati validi.

### Versioning

`npm` fornisce altre funzionalità utili per la creazione e la gestione del flusso di lavoro dei moduli. Ad esempio, il comando di versione npm può permetterci di gestire il numero di versione del nostro modulo in base alla semantica SemVer (https://semver.org/lang/it/).

Se ci troviamo nella condizione di correggere un bug, aumentiamo il numero PATCH. Abbiamo due modi per farlo, possiamo modificare manualmente il campo versione in `package.json`, impostandolo su `1.0.1`, oppure possiamo eseguire il seguente comando:

```
$ npm version patch
```

Ciò aumenterà il numero della versione in un comando. Inoltre, se il nostro modulo è un repository Git, aggiungerà un commit basato sulla versione (nel nostro caso, `v1.0.1`), che possiamo quindi effettuare il push immediatamente. Quando eseguiamo questo comando, `npm` restituirà sullo standard output il numero di versione. Se abbiamo la necessità di effettuare un check sul numero di versione, non è necessario aprire il file `package.json`. Semplicemente dalla riga di comando digitate:

```
$ npm version
```

Questo stamperà sullo standard output qualcosa simile a questo:

```
{
  'string-utils': '1.0.1',
  npm: '6.8.0',
  ares: '1.15.0',
  cldr: '33.1',
  http_parser: '2.8.0',
  icu: '62.1',
  modules: '64',
  napi: '3',
  nghttp2: '1.34.0',
  node: '10.15.3',
  openssl: '1.1.0j',
  tz: '2018e',
  unicode: '11.0',
  uv: '1.23.2',
  v8: '6.8.275.32-node.51',
  zlib: '1.2.11'
}
```

Il primo campo è il nome del nostro modulo insieme al suo numero di versione. Se abbiamo aggiunto una nuova funzionalità compatibile con le versioni precedenti, possiamo eseguire questo:

```
$ npm version minor
```

Ora la nostra versione è `1.1.0`. Infine, possiamo eseguire quanto segue per un bump di versione principale:

```
$ npm version major
```

Questo imposta la versione del nostro modulo a `2.0.0`. Poiché stiamo solo sperimentando e non abbiamo apportato alcuna modifica, dovremmo impostare la nostra versione. Possiamo farlo tramite il comando `npm`:


```
$ npm version 1.0.0
```

### Installiamo le dipendenze

Il vasto ecosistema di moduli di Node.js, ci consente di avere un alto livello di componibilità. Molti moduli userland sono piccoli e fanno bene una cosa, e questo ci consente di comporre i nostri moduli sopra altri moduli. Nel modulo che stiamo per creare avremo la necessità di installare una dipendenza.

Una delle funzionalità che il nostro modulo metterà a disposizione sarà quello di controllare se una stringa data in input è di un formato  numerico valido. Il modo per vedere se esiste già un modulo che effettua ciò è quello di andare sul sito https://npm.com ed effettuare una ricerca:

![](./img/ch-7/03.png)

Dopo alcune ricerche, decidiamo che il modulo `is-number` è la soluzione migliore. Assicurandoci di essere nella directory del nostro modulo, possiamo installare la dipendenza nel seguente modo:

```
$ npm install --save is-number
```

Se dopo l'installazione diamo uno sguardo al file package.json, vedrete che il modulo è stato installato come dipendenza all'interno del vostro modulo. Ci accorgeremo in particolare che è stato aggiunto l'oggetto dependencies con all'interno il nome della nostra dipendenza, con l'ultima versione disponibile:

```
  ...
  "license": "MIT",
  "dependencies": {
    "is-number": "^7.0.0"
  }
  ...
```

### Installiamo le dipendenze per lo sviluppo

Di solito abbiamo bisogno di alcuni strumenti che ci aiutino durante lo sviluppo e la manutenzione di un modulo o di un'applicazione. L'ecosistema è pieno di moduli di supporto alla programmazione, dal *linting* al *testing*.

In generale, non vogliamo che le persone che utilizzeranno il nostro modulo scarichino le dipendenze di cui non hanno bisogno.

Ora, separiamo le nostre dipendenze in categorie di produzione da quelle di sviluppo. Quando usiamo `npm --save install <dep>`, stiamo installando un modulo di produzione. Per installare una dipendenza di sviluppo, usiamo `--save-dev`. Quindi andiamo avanti e installiamo un linter:

```
$ npm install --save-dev standard
```

`standard` è un linter di JavaScript che applica un set di regole non configurabile. La premessa di questo approccio è che dovremmo smettere di usare tempo prezioso sulla sintassi. Ora se diamo nuovamente uno sguardo alla fine del nostro `package.json`:

```
{
  "name": "string-utils",
  "version": "1.0.0",
  "description": "A wonderful module for nodejs course",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "utils",
    "string"
  ],
  "author": "Davide D'Antonio <davidedantonio@finzanza.tech>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/davidedantonio/string-utils.git"
  },
  "bugs": {
    "url": "https://github.com/davidedantonio/string-utils/issues"
  },
  "homepage": "https://github.com/davidedantonio/string-utils#readme",
  "dependencies": {
    "is-number": "^7.0.0"
  },
  "devDependencies": {
    "standard": "^12.0.1"
  }
}
```

Quando il nostro modulo è verrà installato come sotto dipendenza di un altro modulo, verrà installato solo il modulo `is-number`, mentre il modulo standard verrà ignorato poiché non è rilevante per l'effettiva implementazione del nostro modulo.

### Utilizzare npm run scripts

Il nostro file `package.json` ha attualmente una proprietà scripts simile a questa:

```
"script": {
  "test": "echo \" Errore: nessun test specificato \" && exit 1"
},
```

Modifichiamo il file `package.json` e aggiungiamo un altro campo, chiamato `lint`, nel seguente modo:

```
"script": {
  "test": "echo \" Errore: nessun test specificato \" && exit 1",
  "lint": "standard"
},
```

Ora, finché avremo standard installato come dipendenza di sviluppo del nostro modulo, possiamo eseguire il seguente comando per eseguire un controllo di linting del nostro codice:

```
$ npm run lint
```

Quando eseguiamo uno script npm, la cartella `node_modules/.bin` della directory corrente viene aggiunta alla variabile d'ambiente PATH del contesto di esecuzione. Ciò significa che, anche se non abbiamo l'eseguibile standard nel nostro PATH di sistema, possiamo fare riferimento ad esso in uno script npm come se fosse nel nostro PATH. Cambiamo quindi campo `scripts.test`, come segue:

```
"script": {
  "test": "npm run lint",
  "lint": "standard"
},
```

Perfetto siamo pronti per il prossimo step, quello più importante, scrivere il codice del nostro modulo!

### Scriviamo il codice

Prima di iniziare a scrivere il codice assicuriamoci di avere una cartella chiamata `string-utils`, con all'interno un file `package.json`. Questo file dovrebbe contenere `is-number` come dipendenza. Se non esiste una cartella `node_modules`, dobbiamo assicurarci di eseguire npm install dalla riga di comando con la directory di lavoro impostata sulla directory `string-utils`.

Per iniziare, creiamo un file chiamato index.js nella cartella `string-utils`, quindi apriamolo nel nostro editor di testo preferito.

La prima cosa che dobbiamo fare nel nostro file index.js è quella di specificare le dipendenze che useremo. Nel nostro caso abbiamo solo una dipendenza:

```javascript
import isNumber from 'is-number'
```

Tipicamente tutte le dipendenze di un modulo, vengono dichiarate all'inizio del file. Ora definiamo in dettaglio quale sarà l'API che esporrà il nostro modulo nel dettaglio:

- `isValidEmail`: data una stringa in input, verifica se è un indirizzo email valido.
- `isValidNumber`: dato un numero o una stringa in input, verifica se è un formato numerico valido.
- `ucFirstLetter`: data una stringa, in input effettua l'uppercase del primo carattere.
- `endsWith`: data una stringa ed un suffisso in input, verifica se la stringa termina con il suffisso dato.

Quindi iniziamo a scrivere le funzioni necessarie:

```javascript
'use strict'

const isValidEmail = email => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

const isValidNumber = string => {
  return isNumber(string)
}

const ucFirstLetter = string => {
  if (!string) {
    return ''
  }

  return string.charAt(0).toUpperCase() + string.slice(1)
}

const endsWith = (string, suffix) => {
  if (Array.isArray(string) && suffix) {
    return string[string.length - 1] === suffix
  }

  if (typeof suffix === 'number') {
    suffix = '' + suffix
  }

  if (typeof suffix !== 'string') {
    return false
  }

  return string.slice(-suffix.length) === suffix
}
```

Per rendere il nostro codice un modulo, dobbiamo esportarne le funzionalità, quindi:

```
export default {
  isValidEmail,
  isValidNumber,
  ucFirstLetter,
  endsWith
}
```

Possiamo eseguire alcuni controlli di integrità per garantire che il nostro codice funzioni.

```
$ node -p "'./'.isValidEmail('info@test.com')"
```

Questo stamperà a video true, ossia il valore di ritorno della nostra funzione. Perfetto, è stato facile! Facciamo qualche altro test per essere sicuri che tutto stia funzionando per il meglio.

```
$ node -p "'./'.isValidNumber('12.22')"
```

In questo caso l'invocazione della funzione `isValidNumber('12.22')` ha restituito ciò che ci aspettavamo, `true`. Ma questi sono test validi, fino ad un certo punto. Scriveremo i test per il nostro modulo più avanti in questo libro quando tratteremo l'argomento.

### Pubblichiamo il nostro modulo

Ora siamo pronti a pubblicare il nostro modulo `string-utils` su cui abbiamo lavorato. Se non abbiamo un account https://npmjs.org, dovremo andare su sul link e cliccare su *signup*. Tenete a portata di mano il nome utente di npm; ne avremo bisogno.
Ogni modulo dovrebbe avere un `README` che spiega come funziona. Creiamo un file `README.md`, nella directory `string-utils` con il seguente markdown:

```
# string-utils

This module contains some utils for string:

- Check if an email is a valid email
- Check if string end with specified suffix
- Check if a string is a valid number
- Transform a given string with UC first letter

## Install

npm install --save @davide-demos/string-utils

## API

endsWith(string, suffix) => Boolean

ucFirstLetter(string) => String

isValidNumber(string) => Boolean

isValidEmail(string) => Boolean

## Examples

import beeStringUtils from '@davide-demos/string-utils'

if (beeStringUtils.isValidEmail('davidedantonio@finzanza.tech')) {
  // do something
}

console.log(beeStringUtils.ucFirstLetter('davide')) // Davide

if (beeStringUtils.isValidNumber('12.22')) {
  // do something
}

if (beeStringUtils.endsWith('davide', 'de')) {
  // do something
}
```

:::tip
Markdown è un linguaggio di markup con una sintassi del testo semplice progettata in modo che possa essere convertita in HTML e in molti altri formati usando un tool omonimo. Markdown è spesso usato per formattare file `README`, per scrivere messaggi in forum di discussioni e per creare testo formattato utilizzando un editor di testo semplice.
:::

Nella sezione relativa all'installazione ovviamente sostituite `davide-demos` con il vostro username. Ora, faremo alcuni ritocchi finali al file `package.json`. Innanzitutto, reinizializzeremo il modulo:

```
$ npm init
```

Eseguendo questo comando, possiamo semplicemente premere Invio come risposta a tutte le domande. L'output di `npm init` dovrebbe mostrare che è stato aggiunto un campo descrittivo, con il suo contenuto tratto dal file `README.md`:

```
  "description": "A wonderful module for a Node.js",
```

Ora apriamo il file `package.json` e cambiamo il campo del nome anteponendolo con un simbolo (`@`), seguito dal nostro nome utente `npm`, seguito da `/string-utils`. Quindi:

```
  "name": "@davide-demos/string-utils",
```

Se ci siamo registrati per avere un account `npm`, dobbiamo autorizzare il nostro client con https://npmjs.org. Sulla riga di comando, abbiamo semplicemente bisogno di eseguire questo comando:

```
$ npm login
```

Quindi reinseriamo tutte le informazioni fornite nel momento in cui ci siamo registrati su https://npmjs.org. Prima di procedere assicuriamoci di aver effettuato un push del nostro codice sorgente su Git. Ora, pubblichiamo:

```
$ npm publish --access=public
```

Ora se tutto è andato bene dovreste essere capaci di andare su https://www.npmjs.com/package/@davide-demos/string-utils e visualizzare qualcosa del genere (sostituite a `@davide-demos` la vostra username).

![](./img/ch-7/04.png)

Ora che il nostro modulo si trova nel registro `npm`, può essere installato come dipendenza da altri moduli ed applicazioni. Potete provare eseguendo questi comandi:

```
$ mkdir my-app
$ cd my-app
$ npm init
$ npm install @davide-demos/string-utils
```

Ora all'interno della directory `node_modules` troverete la diretory `@davide-demos/string-utils` con all'interno il codice appena creato.
