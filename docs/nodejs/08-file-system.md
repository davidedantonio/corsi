---
sidebar_position: 8
---

# File System

Quando è stato creato, JavaScript era un linguaggio prevalentemente utilizzato all'interno dei browser web. 
Con l'avvento di Node.js questa limitazione è venuta meno, infatti il linguaggio può essere utilizzato lato server e 
può interagire con il file system. Node.js fornisce questa interazione mediante il modulo core `fs` ed il modulo di supporto `path`.
Ora vedremo come interagire con i files in modo sincrono e asincrono. Node.js è stato creato per gestire il codice 
asincrono e basato su un modello non bloccante. Comprendere come leggere e scrivere codice asincrono è un apprendimento 
fondamentale per questa sezione.

## Path

Il modulo core `path` è fondamentale per manipolare e normalizzare i percorsi di files e directory sui diversi 
sistemi operativi. Spesso abbiamo la necessità di individuare il path relativo di un file rispetto al modulo attualmente 
in escuzione. In precedenza, quando abbiamo discusso i moduli, abbiamo evidenziato il fatto che in ogni modulo Node.js 
si ha accesso a due variabili "speciali": `__dirname` e `__filename`. In particolare la variabile `__filename` 
contiene il path assoluto del modulo in esecuzione, mentre `__dirname` contiene il percorso assoluto della directory 
dove il nostro modulo è in esecuzione.

Se immaginiamo di avere un file `/examples/example-1.js` con il seguente contenuto:

```javascript
console.log(import.meta.dirname)
console.log(import.meta.filename)
```

L'output che questo script produrrà su un sistema UNIX like sarà qualcosa tipo:
 
```
/Users/davidedantonio/examples
/Users/davidedantonio/examples/example-1.js
```

Su un sistema Windows, immaginando che il file risieda nel drive `C` sarà qualcosa del genere:


```
C:\\Users\\davidedantonio\\examples
C:\\Users\\davidedantonio\\examples\\example-1.js
```

Ora se supponiamo di voler gestire un file `log.txt` nella stessa directory, e vogliamo gestirne il contenuto in modo indipendente 
dalla piattaforma, possiamo farlo utilizzando il metodo `path.join`:


```javascript
import {  join  } from 'node:path'
console.log('out file:', join(import.meta.dirname, 'out.txt'))
```

Al metodo `path.join` possono essere passati tutti gli argomenti desiderati, ad esempio `path.join('foo', 'bar', 'baz')` creerà la 
stringa *'foo/bar/baz'* o *'foo\\bar\\baz'* a seconda della piattaforma. Su un sistema Windows il risultato sarà qualcosa tipo 
*C:\\Users\\davidedantonio\\examples\\log.txt* mentre su un sistema UNIX sarà */Users/davidedantonio/examples/log.txt*.

A parte `path.isAbsolute` che, come suggerisce il nome, restituirà `true` se un determinato percorso è assoluto, i metodi di `path` 
disponibili possono essere ampiamente suddivisi in generatori di percorsi e decostruttori di percorsi.

Accanto a `path.join`, gli altri costruttori di percorsi sono:

* *`path.relative`*: dati due percorsi assoluti, calcola il path relativo tra di essi.
* *`path.resolve`*: accetta più argomenti stringa che rappresentano percorsi. Concettualmente ogni path rappresenta la navigazione verso quel percorso. La funzione `path.resolve` restituisce una stringa del path che risulterebbe dalla navigazione in ciascuna delle directory nell'ordine utilizzando il comando `cd` della riga di comando. Ad esempio `path.resolve('/foo', 'bar', 'baz')` restituirebbe *'/foo/bar/baz'*, che è simile all'esecuzione di `cd /foo` quindi `cd bar` quindi `cd baz` sulla riga di comando e quindi scoprire qual è la directory di lavoro corrente.
* *`path.normalize`*: risolve `..` e `.` punto nei path e rimuove gli slash, o backslash, extra, ad esempio `path.normalize('/foo/../bar//baz')` restituirebbe *'/bar/baz'*.
* *`path.format`*: crea una stringa da un oggetto. La forma dell'oggetto che `path.format` accetta, corrisponde all'oggetto restituito da `path.parse` che vedremo a breve.

I decostruttori di path, invece solo i seguenti: 

* *`path.parse`*: restituisce un oggetto le cui proprietà rappresentano elementi significativi del path.
* *`path.extname`*: restituisce l'estensione del path, dall'ultima occorrenza del punto alla fine della stringa nell'ultima parte del path. Se non c'è il punto nell'ultima parte del path, o se non ci sono punti diversi dal primo carattere del nome base del path, viene restituita una stringa vuota.
* *`path.dirname`*: restituisce il nome della directory di un path, simile al comando UNIX `dirname`.
* *`path.basename`*: Il metodo restituisce l'ultima parte di un path, simile al comando UNIX `basename`.

Eploriamo questi metodi con un esempio:

```javascript
import {  parse, basename, dirname, extname  } from 'node:path'

console.log('filename parsed:', parse(import.meta.filename))
console.log('filename basename:', basename(import.meta.filename))
console.log('filename dirname:', dirname(import.meta.filename))
console.log('filename extname:', extname(import.meta.filename))
```

Se stiamo editando ancora il file `example-1.js` creato in precedenza, il risultato che otterremo, su una macchina UNIX, sarà il seguente:

```
filename parsed: { root: '/',
  dir: '/Users/davidedantonio/examples',
  base: 'example-1.js',
  ext: '.js',
  name: 'example-1' }
filename basename: example-1.js
filename dirname: /Users/davidedantonio/examples
filename extname: .js
```

Il metodo `parse` restituisce un oggetto con le proprietà `root`, `dir`, `base`, `ext` e `name`. I valori `root` e `name` possono 
essere calcolati solo utilizzando il metodo `path`, mentre le proprietà `base`, `dir` ed `ext` possono essere calcolate individualmente 
con i metodi `path.dirname` e `path.basename`.

## Manipolare files con il modulo fs

Come già detto più volte, Node.js fornisce diversi moduli di base, incluso il modulo `fs`. `fs` sta per File System e questo modulo 
fornisce le API per interagire con il file system. Questo modulo possiede API di basso livello ed altre di alto livello. Le API di 
basso livello rispecchia fedelmente quelle di un sistema POSIX. Per esempio `fs.open` è un metodo che apre un file e, se non esiste, 
lo crea restituendo il file descriptor. Anche se non utilizzeremo le API di basso livello, perché sono utilizzate molto raramente nel 
codice, c'è da dire che le API di alto livello sono implementate su di esse.

Le API di altro livello per leggere e scrivere un file sono suddivise nel seguente modo:

- Sincrone
- Basate su callbacks
- Basate su promises
- Basate su streams

### Leggere e scrivere files in modo sincrono

Tutti i metodi esposti dall'API del modulo `fs` terminano con `Sync`, per esempio `fs.readFileSync`. Tutti questi metodi 
bloccano l'Event Loop finché l'operazione non è terminata. Questi metodi sono utilizzati prevalentemente per caricare dati 
all'avvio di un applicazione, quindi files di piccole dimensioni, e se ne sconsiglia l'utilizzo durante l'esecuzione dell'applicazione. 
Facciamo un piccolo esempio, creiamo un file `hello.txt` contenente la stringa _"Hello, world!"_:

```
$ touch hello.txt
$ echo Hello, World! > hello.txt
```

> `touch` è un'utility inclusa nei sistemi operativi basati su UNIX che viene utilizzata per aggiornare la data di
accesso e di modifica di un file o di una directory all'ora corrente. Tuttavia, quando `touch` viene eseguito senza 
argomenti aggiuntivi su un file inesistente, creerà un file vuoto con quel nome. `touch` è un modo tipico per creare un file vuoto.

```javascript
import fs from 'node:fs'
import path from 'node:path'
const file = path.join(import.meta.dirname, 'hello.txt')

const contents = fs.readFileSync(file, { encoding: 'utf8' })
console.log(`File content: ${contents}`)

const upperCaseContent = contents.toUpperCase()
fs.writeFileSync(file, upperCaseContent)
console.log('File Updated!')
```

:::tip
Pensaci sempre due volte prima di utilizzare un'API sincrona in JavaScript. JavaScript viene eseguito in un ciclo di 
eventi a thread singolo; un'operazione sincrona di lunga durata blocca l'Event Loop.
:::

In questo esempio abbiamo letto il contenuto del file `hello.txt`, lo abbiamo stampato sullo standard output, e abbiamo 
riscritto il contenuto all'interno del file `hello.txt` ma tutto in maiuscolo.

Nelle prime due righe di codice abbiamo importato i moduli necessari, `path` e `fs`. Successivamente abbiamo dichiarato una 
variabile `file` che conterrà il path assoluto del file `hello.txt`. Per farlo abbiamo utilizzato `path.join` a cui abbiamo 
passato `__dirname` ed `hello.txt` (quindi il file si troverà nella stessa directory dello script che stiamo eseguendo). 
Successivamente, leggiamo il file utilizzando la funzione `fs.readFileSync()`. Passiamo a questa funzione il percorso del 
file da leggere e la codifica, "utf8". Il parametro di codifica è facoltativo: quando il parametro viene omesso, la funzione 
restituirà per impostazione predefinita un oggetto `Buffer`. Per il contenuto del del file, abbiamo utilizzato la funzione 
`toUpperCase()` disponibile sugli oggetti stringa. Infine, abbiamo aggiornato il file utilizzando la funzione `fs.writeFileSync()`. 
Abbiamo passato alla funzione `fs.writeFileSync()` due parametri. Il primo era il percorso del file che volevamo aggiornare e il 
secondo parametro è il contenuto del file aggiornato.

Eseguendo lo script il risultato che otterremo sarà il seguente:
 
```
File content: Hello, World!
File Updated!
```

Mentre se stampiamo a video il contenuto del file `hello.txt`, vedremo che contiene la stringa _"HELLO, WORLD!"_:

```
$ cat hello.txt
HELLO, WORLD!
```

È possibile aggiungere un terzo parametro facoltativo alla funzione `writeFileSync`. Si tratta di un oggetto che può contenere
[diverse opzioni](https://nodejs.org/dist/latest-v14.x/docs/api/fs.html#fs_fs_writefilesync_file_data_options) di scrittura del file: 
`econding`, `mode` e `flag`. Per esempio supponiamo di voler leggere il contenuto del file `hello.txt` (attualmente in maiuscolo), 
e aggiungere alla fine del file nuovamente la stringa tutta in minuscolo. Per farlo basta invocare la funzione `writeFileSync` con 
`flag: 'a'`. Quindi modifichiamo il nostro script affinché si verifichi quanto detto:

```javascript
import fs from 'node:fs'
import path from 'node:path'
const file = path.join(import.meta.dirname, 'hello.txt')

const contents = fs.readFileSync(file, { encoding: 'utf8' })
console.log(`File content: ${contents}`)

const lowerCaseContent = contents.toLowerCase()
fs.writeFileSync(file, lowerCaseContent, { flag: 'a' })
console.log('File Updated!')
```

Eseguendo lo script il risultato sarà il seguente:

```
File content: HELLO, WORLD!
File Updated!
```

Mentre il contenuto del file risulterà il seguente:
 
```
$ cat hello.txt
HELLO, WORLD!
hello, world!
```

Abbiamo dato uno sguardo a come leggere e scrivere un file in modo sincrono. Tuttavia le prime versioni di Node.js erano basate 
su callbacks, prima dell'avvento delle promises, e della sintassi *async/await*. Tutte le versioni attualmente supportate di Node.js 
supportano le callbacks, le promises e la sintassi *async/await*. Esploriamo come possiamo lavorare con i file in modo asincrono 
utilizzando queste tecniche.

Se c'è un problema con un'operazione, le API sincrone lanceranno un eccezione. Quindi, per eseguire la gestione degli errori, le 
operazioni devono essere avvolte in un *try/catch*. Facciamo un esempio, proviamo a leggere un file che non esiste in modalità sincrona:

```javascript
import fs from 'node:fs'
import path from 'node:path'

const contents = fs.readFileSync(path.join(import.meta.dirname, 'noFile.txt'), { encoding: 'utf8' })
console.log(contents)
```

Eseguendo questo script il risultato che otterremo sarà il seguente:
 
```
node noFileSync.js
fs.js:114
    throw err;
    ^

Error: ENOENT: no such file or directory, open '/Users/davidedantonio/examples/noFile.txt'
    at Object.openSync (fs.js:443:3)
    at Object.readFileSync (fs.js:343:35)
    at Object.<anonymous> (/Users/davidedantonio/examples/noFileSync.js:4:21)
    at Module._compile (internal/modules/cjs/loader.js:778:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)
    at Module.load (internal/modules/cjs/loader.js:653:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
    at Function.Module._load (internal/modules/cjs/loader.js:585:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:831:12)
    at startup (internal/bootstrap/node.js:283:19)
```

### Leggere e scrivere un file in modo asincrono

La programmazione asincrona può consentire ad alcune attività o elaborazioni di continuare mentre sono in corso altre operazioni. 
Ricreiamo ora lo script precedente con modulo `fs` utilizzando le funzioni asincrone disponibili, in particolare le 
funzioni che utilizzano le callbacks:

```javascript
import fs from 'node:fs'
import path from 'node:path'
const file = path.join(import.meta.dirname, 'hello.txt')

fs.readFile(file, { encoding: 'utf8' }, (err, contents) => {
  if (err) {
    console.log(err)
    return
  }

  console.log(`File content: ${contents}`)
  const upperContents = contents.toUpperCase(contents)

  fs.writeFile(file, upperContents, (err) => {
    if (err) {
      console.error(err)
      return
    }

    console.log('File Updated!')
  })
})
```

Da notare che ora abbiamo una funzione asincrona che invoca un'altra funzione asincrona. Non è consigliabile avere troppe callbacks 
nidificate, in quanto influisce negativamente sia per la lettura che per la risoluzione di bug all'interno del codice. Ci sono approcci 
che possono essere adottati per evitare il callbacks hell. Un approccio sarebbe quello di suddividere le callback in funzioni. Ad esempio, 
il nostro file potrebbe essere riscritto in modo che la chiamata `writeFile()` contenga nella sua funzione di callback l'invocazione di 
una funzione denominata, `updateFile()`, che si occuperà di aggiornare il file:

```javascript
import fs from 'node:fs'
import path from 'node:path'
const file = path.join(import.meta.dirname, 'hello.txt')

function updateFile(contents) {
  fs.writeFile(file, contents, (err) => {
    if (err) {
      console.error(err)
      return
    }

    console.log('File Updated!')
  })
}

fs.readFile(file, { encoding: 'utf8' }, (err, contents) => {
  if (err) {
    console.log(err)
    return
  }

  console.log(`File content: ${contents}`)
  const upperContents = contents.toUpperCase(contents)
  updateFile(upperContents)
})
```

Se provate ad eseguire entrambi gli esempi, al termine dell'esecuzione il contentuto del file `hello.txt` sarà tutto in maiuscolo 
e verrà mostrato il seguente output:

```
File content: Hello, World!
File Updated!
```

Un altro approccio potrebbe essere l'uso delle Promise. Ma poiché le prime versioni di Node.js non supportavano Promises, 
l'uso dei callback è ancora prevalente in molti moduli e applicazioni esistenti. L'API `fs.promises` fornisce la maggior 
parte degli stessi metodi asincroni disponibili nel modulo `fs`, ma i metodi restituiscono promises invece di accettare callback.

Diamo un'occhiata allo stesso esempio di lettura e scrittura usando `fs.promises` e usando `async/await` per risolvere le promises:

```javascript
import {  readFile, writeFile  } from 'node:fs'.promises
import path from 'node:path'
const file = path.join(import.meta.dirname, 'hello.txt')

async function readWriteUpperCase() {
  try {
    const contents = await readFile(file, { encoding: 'utf8' })
    console.log(`File content: ${contents}`)
    
    const upperContents = contents.toUpperCase(contents)
    await writeFile(file, upperContents)
    
    console.log('File Updated!')
  } catch (e) {
    console.error(err)
    return
  }
}

readWriteUpperCase()
```

## Streaming di Files

Il modulo `fs` espone i metodi `fs.createReadStream` e `fs.createWriteStream` che ci consentono di leggere e scrivere file in blocchi. 
Gli stream sono ideali quando si gestiscono file molto grandi che possono essere elaborati in modo incrementale. Leggendo blocchi di 
dati in sequenza, possiamo lavorare con file molto grandi che sarebbero generalmente troppo grandi per essere letti in memoria ed elaborati 
nel loro insieme. Gli stream sono fondamentali per le applicazioni di big data o per i servizi di streaming multimediale, in cui i dati 
sono troppo grandi per essere consumati contemporaneamente.

In questo paragrafo vedremo come creare sia uno stream leggibile che uno stream scrivibile. Creeremo prima uno stream scrivibile 
per scrivere un file di grandi dimensioni. Quindi leggeremo quel file di grandi dimensioni utilizzando uno stream leggibile:

```javascript
import fs from 'node:fs'
import path from 'node:path'
const filePath = path.join(import.meta.dirname, 'bigFile.txt')

const bigFile = fs.createWriteStream(filePath)
for (let i = 0; i < 10000000; i++) {
  bigFile.write('Welcome to Node.js in Pillole!\n')
}
```

Eseguendo questo script verrà creato un file di quasi 300M. Per verificare che il file esiste digitate dal terminale il seguente comando:

```
$ ls -lh bigFile.txt
-rw-r--r--  1 davide  staff   296M 28 Giu 08:32 bigFile.txt
```

Ora creiamo lo script che si occupera della lettura del file utilizzando `fs.createReadStream` che si occuperà di 
leggere il contenuto del nostro file, trasforma tutto il suo contenuto in maiuscolo, e lo scrive in un nuovo file `bigFileUppercase.txt`. 
Il pattern che vedremo di seguito è eccellente se si ha a che fare con un file di grandi dimensioni perché l'utilizzo della memoria rimarrà 
costante poiché il file viene letto in piccoli blocchi e scritto in piccoli blocchi:

```javascript
import {  pipeline  } from 'node:stream'
import path from 'node:path'
import {  createReadStream, createWriteStream  } from 'node:fs'

pipeline(
  createReadStream(path.join(import.meta.dirname, 'bigFile.txt')),
  createWriteStream(path.join(import.meta.dirname, 'bigFileUppercase.txt')),

  (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('finished writing')
  }
)
```

Questo script non fa altro che copiare il contenuto del file `bigFile.txt` in un nuovo file `bigFileUppercase.txt`. 
Per riprodurre lo scenario di lettura, trasformare il testo in maiuscolo e scrittura, avremo bisogno di uno stream intermedio di trasformazione:

```javascript
import {  pipeline  } from 'node:stream'
import path from 'node:path'
import {  createReadStream, createWriteStream  } from 'node:fs'
import {  Transform  } from 'node:stream'

const createUppercaseStream = () => {
  return new Transform({
    transform (chunk, enc, next) {
      const uppercased = chunk.toString().toUpperCase()
      next(null, uppercased)
    }
  })
}

pipeline(
  createReadStream(path.join(import.meta.dirname, 'bigFile.txt')),
  createUppercaseStream(),
  createWriteStream(path.join(import.meta.dirname, 'bigFileUppercase.txt')),

  (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('finished writing')
  }
)
```

Gli streams leggibili sono iterabili in modo asincrono. Ciò significa che possiamo usare la sintassi `for await...of` 
per eseguire il loop sui dati dello stream:

```javascript
import {  pipeline  } from 'node:stream'
import path from 'node:path'
import {  createReadStream, createWriteStream  } from 'node:fs'

async function * createUppercaseStream(source) {
  for await (let chunk of source) {
    yield chunk.toString().toUpperCase()
  }
}

pipeline(
  createReadStream(path.join(import.meta.dirname, 'bigFile.txt')),
  createUppercaseStream,
  createWriteStream(path.join(import.meta.dirname, 'bigFileUppercase.txt')),

  (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('finished writing')
  }
)
```

## Leggere directory

Le directory altro non sono che una particolare tipologia di file, che contengono una lista di files. Le API esposte dal
modulo `fs` per la gestire le directory sono simili a quelle esposte per la gestione dei files. I pro ei contro di ogni 
approccio utilizzato sono gli stessi della lettura e della scrittura di file. L'esecuzione sincrona è consigliata quando 
si fa affidamento su operazioni asincrone. Gli approcci basati su callbacks o promises sono le migliori per la maggior parte 
dei casi. Prima di vedere il funzionamento di ogni singolo approccio, supponiamo di avere una directory strutturata nel seguente modo:

```
.
├── document.docx
├── file-1.txt
├── file-2.txt
├── read_dir.js
└── script.js
```

Il file `read_dir.js` sarà il file che esegue il nostro codice.

### Leggere directory in modo sincrono

Per leggere una directory in modo sincrono è possibile utilizzare il metodo `fs.readdirSync`:

```javascript
import {  readdirSync  } from 'node:fs'

try {
  const files = readdirSync(import.meta.dirname)
  console.log('Sync method: ', files)
} catch (e) {
  console.error(e)
}
```

Questo script sospende l'esecuzione fino a quando la directory non è stata letta e restituisce un array di nomi di file. 
Questo viene passato alla funzione `console.log` e quindi scritto al terminale. Poiché si tratta di un metodo sincrono, 
può essere generato in caso di problemi durante la lettura della directory, quindi la chiamata al metodo è racchiusa in un 
`try/catch` per gestire l'errore. L'output del nostro script sarà il seguente:

```
Sync method:  [
  'document.docx',
  'file-1.txt',
  'file-2.txt',
  'read_dir.js',
  'script.js'
]
```

### Leggere directory con le callbacks

Per leggere una directory utilizzando le callback basta utilizzare il metodo `fs.readdir`:

```javascript
import {  readdir  } from 'node:fs'

readdir(import.meta.dirname, (err, files) => {
  if (err) {
    console.error(err)
    return
  }
  console.log('Callback method: ', files)
})
```

Utilizzando il metodo `readdir`, una volta che la directory è stata letta verrà chiamato il secondo argomento (la nostra 
funzione di callback) con il secondo argomento che è un array di file nella directory fornita. In caso di errore, il primo 
argomento della nostra funzione di callback sarà un oggetto `Error`, quindi effettuaiamo un controllo per verificare se c'è 
stato un errore. Nel caso in cui non si verifica nessun errore, i files vengono stampati a video con console.log. Loutput 
mostrato a video in questo caso sarà:
 
```
Callback method:  [
  'document.docx',
  'file-1.txt',
  'file-2.txt',
  'read_dir.js',
  'script.js'
]
```

### Leggere directory con le promises

Per leggere una directory utilizzando le callback basta utilizzare il metodo `fs.readdir` basato su promises:

```javascript
import {  readdir  } from 'node:fs'.promises

async function readDirectory (path) {
  try {
    const files = await readdir(path)
    console.log('Promise method: ', files)
  } catch (e) {
    throw new Error(e)
  } 
}

readDirectory(import.meta.dirname)
  .catch(console.error)
```

L'invocazione `readdir(path)` restituisce una promise attesa nella funzione asincrona `readDirectory`. La directory viene 
letta in modo asincrono, quindi l'esecuzione non verrà bloccata. Tuttavia, poiché `readDirectory` è una funzione asincrona, 
la funzione stessa verrà messa in pausa fino a quando la promise attesa restituita dalla funzione `readdir` non si risolve 
con l'array di files (o viene rifiutata a causa di un errore). Questo valore viene archiviato nell'array `files` e quindi 
passato a `console.log`. Se `readdir` viene rifiutata, anche la promessa restituita automaticamente dalla funzione `readDirectory` 
verrà rifiutata. Questo è il motivo per cui quando viene chiamata l'esecuzione, al risultato viene aggiunto `catch(console.error)` 
in cui gestiamo l'eventuale l'errore. Al termine dell'esecuzione il risultato sarà il seguente:

```
Promise method:  [
  'document.docx',
  'file-1.txt',
  'file-2.txt',
  'read_dir.js',
  'script.js'
]
```

### Leggere directory con gli streams

Le directory estremamente grandi possono anche essere lette come uno stream usando il metodo `fs.opendir`, 
`fs.opendirSync` o `fs.promises.opendir` che fornisce un'interfaccia simile a un flusso:

```javascript
import {  opendir  } from 'node:fs'.promises

async function readDirectory (path) {
  try {
    const dir = await opendir(path)
    const files = []
    for await (const dirent of dir) {
      files.push(dirent.name)
    }

    console.log('Stream method: ', files)
  } catch (err) {
    throw new Error(err)
  }
}

readDirectory(import.meta.dirname)
  .catch(console.error)
```

La funzione `opendir` restituisce un puntatore alla directory che possiamo iterare in modo asincrono utilizzando la
notazione `for await...of`. Ad ogni iterazione dello streams salviamo il nome del file corrente all'interno dell'array 
`files`. Nel caso in cui si verifica un errore durante la lettura della directory, questo verrà catturato e propagato al 
chiamante, che lo gestirà con handler `.catch()` corrispondente. Nel caso in cui non si verifica nessun errore, a video 
appare il seguente risultato:

```
Stream method:  [
  'file-2.txt',
  'file-1.txt',
  'script.js',
  'read_dir.js',
  'document.docx'
]
```

## File metadata

I metadati sui file possono essere ottenuti con i seguenti metodi:

- `fs.stat`, `fs.statSync`, `fs.promises.stat`
- `fs.lstat`, `fs.lstatSync`, `fs.promises.lstat`

L'unica differenza tra i metodi `stat` e `lstat` è che `stat` segue i link simbolici e `lstat` otterrà i metadati per 
i collegamenti simbolici invece di seguirli.

Questi metodi restituiscono un'istanza `fs.Stat` che ha una varietà di proprietà e metodi per la ricerca di metadati su un file, vedere la sezione 
[Class: `fs.Stats`](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_class_fs_stats) della documentazione di Node.js per l'API completa.

Vedremo ora come rilevare se un determinato percorso punta a un file o una directory e esamineremo le diverse statistiche temporali disponibili.
A questo punto, dovremmo comprendere la differenza e i compromessi tra le API di sincronizzazione e asincrone, quindi per questi esempi
utilizzeremo `fs.statSync`.

Iniziamo leggendo la directory di lavoro corrente e scoprendo se ogni voce è una directory o meno.

```javascript
import {  readdirSync, statSync  } from 'node:fs'

const files = readdirSync(import.meta.dirname)

for (const name of files) {
  const stat = statSync(name)
  const typeLabel = stat.isDirectory() ? 'dir: ' : 'file: '
  console.log(typeLabel, name)
}
```

Supponiamo di avere una directory strutturata nel seguente modo:

```
.
├── directory
├── document.docx
├── file-1.txt
├── file-2.txt
├── read_dir.js
└── script.js
```

Se `script.js` è il file con il codice mostrato in precedenza ed eseguiamo `node script.js` in quella cartella, vedremo qualcosa del genere:

```
dir:  directory
file:  document.docx
file:  file-1.txt
file:  file-2.txt
file:  read_dir.js
file:  script.js
```

Estendiamo il nostro esempio con le statistiche temporali. Sono disponibili quattro statistiche per i file:

- Access time
- Change time
- Modified time
- Birth time

La differenza tra l'ora di modifica e l'ora di modifica, l'ora di modifica si applica solo alle scritture (sebbene possa essere 
manipolata da `fs.utime`), mentre l'ora di modifica si applica alle scritture e qualsiasi cambiamento di stato come la modifica 
di autorizzazioni o proprietà.

Con le opzioni predefinite, le statistiche temporali sono offerte in due formati, uno è un oggetto `Date` e l'altro è 
millisecondi dall'epoca. Useremo gli oggetti `Date` e li convertiremo in stringhe di impostazioni locali.

Aggiorniamo il nostro codice per visualizzare le quattro diverse statistiche temporali per ogni file:

```javascript
import {  readdirSync, statSync  } from 'node:fs'

const files = readdirSync('.')

for (const name of files) {
  const stat = statSync(name)
  const typeLabel = stat.isDirectory() ? 'dir: ' : 'file: '
  const { atime, birthtime, ctime, mtime } = stat
  console.group(typeLabel, name)
  console.log('atime:', atime.toLocaleString())
  console.log('ctime:', ctime.toLocaleString())
  console.log('mtime:', mtime.toLocaleString())
  console.log('birthtime:', birthtime.toLocaleString())
  console.groupEnd()
  console.log()
}
```

Questo script produrrà il seguente output:

```
dir:  directory
  atime: 2021-6-28 12:50:23 PM
  ctime: 2021-6-28 12:50:34 PM
  mtime: 2021-6-28 12:50:23 PM
  birthtime: 2021-6-28 12:50:23 PM

file:  document.docx
  atime: 2021-6-28 11:37:07 AM
  ctime: 2021-6-28 11:37:07 AM
  mtime: 2021-6-28 11:37:07 AM
  birthtime: 2021-6-28 11:37:07 AM

file:  file-1.txt
  atime: 2021-6-28 11:35:55 AM
  ctime: 2021-6-28 11:35:55 AM
  mtime: 2021-6-28 11:35:55 AM
  birthtime: 2021-6-28 11:35:55 AM

file:  file-2.txt
  atime: 2021-6-28 11:36:01 AM
  ctime: 2021-6-28 11:36:01 AM
  mtime: 2021-6-28 11:36:01 AM
  birthtime: 2021-6-28 11:36:01 AM

file:  read_dir.js
  atime: 2021-6-28 12:55:54 PM
  ctime: 2021-6-28 12:55:53 PM
  mtime: 2021-6-28 12:55:53 PM
  birthtime: 2021-6-28 11:38:01 AM

file:  script.js
  atime: 2021-6-28 11:36:20 AM
  ctime: 2021-6-28 11:36:19 AM
  mtime: 2021-6-28 11:36:19 AM
  birthtime: 2021-6-28 11:36:09 AM
```

## Watching

Il metodo `fs.watch` è un modulo core di Node.js utile alla gestione degli eventi del file system. Tuttavia, è di livello piuttosto 
basso e non è la più amichevole delle API. Ora esploreremo il metodo principale di `fs.watch`. Tuttavia, vale la pena considerare la 
libreria dell'ecosistema, `chokidar` per le esigenze di monitoraggio dei file in quanto fornisce un'API di alto livello più gradevole.
Iniziamo con l'effettuare il watching della directory corrente e loggando il nome dei files ad ogni evento:

```javascript
import {  watch  } from 'node:fs'

watch(import.meta.dirname, (evt, filename) => {
  console.log(evt, filename)
})
```

![](./img/ch-8/01.png)

L'output nella sezione a sinistra viene emesso in tempo reale per ogni comando nella sezione a destra. Analizziamo i comandi 
nella sezione a destra e l'output della sezione a sinistra:

- La creazione di un nuovo file denominato test (`node -e "fs.writeFileSync('test', 'test')"`) genera un evento chiamato rename.
- La creazione di una cartella chiamata test-dir (`node -e "fs.mkdirSync('test-dir')"`) genera un evento chiamato rename.
- L'impostazione dei permessi di test-dir (`node -e "fs.chmodSync('test-dir', 0o644)"`) genera un evento chiamato rename.
- La scrittura dello stesso contenuto nel file di test (`node -e "fs.writeFileSync('test', 'test')"`) genera un evento denominato change.
- L'impostazione dei permessi di test-dir (`node -e "fs.chmodSync('test-dir', 0o644)"`) una seconda volta genera un evento di modifica questa volta.
- L'eliminazione del file di test (`node -e "fs.unlinkSync('test')"`) genera un evento rename.

Può essere ovvio a questo punto che l'evento fornito non è molto utile. L'API `fs.watch` fa parte della funzionalità di basso 
livello del modulo `fs`, sta ripetendo gli eventi generati dal sistema operativo sottostante. Quindi possiamo usare una libreria 
come `chokidar` come discusso all'inizio di questa sezione oppure possiamo interrogare e memorizzare informazioni sui file per 
determinare che le operazioni sono in corso.

Possiamo scoprire se un file viene aggiunto mantenendo un elenco di file e rimuovendo i file quando scopriamo che un file è 
stato rimosso. Se il file ci è noto, possiamo distinguere ulteriormente tra un aggiornamento del contenuto e un aggiornamento 
dello stato controllando se l'ora di modifica è uguale all'ora di modifica. Se sono uguali si tratta di un aggiornamento del 
contenuto, poiché un'operazione di scrittura causerà l'aggiornamento di entrambi. Se non sono uguali è un aggiornamento di stato.

```javascript
import {  join, resolve  } from 'node:path'
import {  watch, readdirSync, statSync  } from 'node:fs'

const cwd = resolve(import.meta.dirname)
const files = new Set(readdirSync(import.meta.dirname))

watch(import.meta.dirname, (evt, filename) => {
  try {
    const { ctimeMs, mtimeMs } = statSync(join(cwd, filename))
    if (files.has(filename) === false) {
      evt = 'created'
      files.add(filename)
    } else {
      if (ctimeMs === mtimeMs) evt = 'content-updated'
      else evt = 'status-updated'
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      files.delete(filename)
      evt = 'deleted'
    } else {
      console.error(err)
    }
  } finally {
    console.log(evt, filename)
  }
})
```

Questo approccio utilizza un `Set` (un elenco univoco), inizializzandolo con l'array di file già presenti nella directory 
di lavoro corrente. La directory di lavoro corrente viene recuperata utilizzando `resolve(__dirname)`, Sebbene sia più usuale 
utilizzare `process.cwd()`. Se il set di file non ha un nome file particolare, 
il parametro `evt` viene riassegnato a `"created"`. Il metodo `fs.statSync` genera un eccezione, probabilmente perché il file non esiste. 
In tal caso, il blocco `catch` riceverà un oggetto errore con una proprietà `code` impostata su `"ENOENT"`. In questo caso, il nome del 
file viene rimosso dal set di file e `evt` viene riassegnato a "eliminato". Eseguire il backup nel blocco try, se `filename` è nel set 
`files`, controlliamo se `ctimeMs` è uguale a `mtimeMs` (queste sono statistiche temporali fornite in millisecondi). Se sono uguali, 
`evt` è impostato su `"content-updated"`, in caso contrario è impostato su `"status-updated"`.

Se eseguiamo il nostro codice e aggiungiamo un nuovo file e lo cancelliamo, produrrà nomi di eventi più adatti:

![](./img/ch-8/02.png)

Oltre al metodo `fs.watch` il modulo `fs` ha un ulteriore metodo di controllo, `fs.watchFile`. Mentre `fs.watch` è più reattivo e può 
osservare intere directory, in modo ricorsivo, ha varie inconsistenze e problemi operativi su piattaforme diverse (ad esempio, l'impossibilità 
di segnalare nomi di file su macOs, può segnalare eventi due volte o non riportarli affatto).

### Watching di file con chokidar

Il metodo `fs.watchFile` è lento, richiede molta CPU e osserva solo un singolo file. Il metodo `fs.watch` è inaffidabile.
Mettiamo in gioco `chokidar` (https://github.com/paulmillr/chokidar). Il modulo `chokidar` avvolge la funzionalità di monitoraggio 
principale lo rende più affidabile su tutte le piattaforme, più configurabile e meno impegnativo per la CPU. Osserva anche intere 
directory in modo ricorsivo. Creiamo un nuovo osservatore che guardi un intero albero di directory. Creiamo una nuova cartella, 
`watching-with-chokidar`, con una sottodirectory chiamata my-folder, che a sua volta ha un'altra sottocartella chiamata `my-subfolder`:

```
$ mkdir -p watching-with-chokidar/my-folder/my-subfolder
$ cd watching-with-chokidar
$ npm init -y
$ npm install --save chokidar human-time
```

Adesso creiamo il nostro file `watcher.js` ed iniziamo richiedendo le principali dipendenze:

```javascript
import chokidar from 'chokidar'
import human from 'human-time'
const watcher = chokidar.watch(process.argv[2] || '.', {
  alwaysStat: true
})
```


Ora ascolteremo l'evento `ready` (ovvero `chokidar` ha scansionato il contenuto della directory), e restiamo in ascolto dei vari eventi di modifica:

```javascript
watcher.on('ready', () => {
  watcher
    .on('add', (file, stat) => {
      console.log(`${file} created ${human((stat.birthtime))}`)
    })
    .on('unlink', (file) => {
      console.log(`${file} removed`)
    })
    .on('change', (file, stat) => {
      const msg = (+stat.ctime === +stat.mtime) ? 'updated' : 'modified'
      console.log(`${file} ${msg} ${human((stat.ctime))}`)
    })
    .on('addDir', (dir, stat) => {
      console.log(`${dir} folder created ${human((stat.birthtime))}`)
    })
    .on('unlinkDir', (dir) => {
      console.log(`${dir} folder removed`)
    })
})
```

Ora dovremmo essere in grado di far girare il nostro osservatore, puntarlo nella mia cartella e apportare modifiche osservabili:

```
$ node watcher.js my-folder
```

E, in un altro terminale digitate questi comandi:

```
$ cd my-folder
$ echo "me again" > my-file.txt
$ chmod 700 my-file.txt
$ echo "more" >> my-file.txt
$ rm my-file.txt
$ cd my-subfolder
$ echo "deep" > deep.txt
$ rm deep.txt
$ cd ..
$ rm -fr my-subfolder
$ mkdir my-subfolder
```

Il risultato che otterrete sarà qualcosa simile a questo:

![](./img/ch-8/03.png)
