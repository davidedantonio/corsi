---
sidebar_position: 6
---

# Programmazione asincrona

La natura asincrona di JavaScript si sposa alla perfezione con Node.js. Il modello di programmazione asincrono non ci consente di 
essere predittivi sull'ordine in cui le cose accadranno. Usando questo modello, se si avvia un'azione il programma continua ad essere 
eseguito restituendo subito il controllo al chiamante.

Questo può causare non pochi problemi ai programmatori che provengono da linguaggi sincroni, come PHP, Java o C#, in cui una 
funzione ritorna solo dopo che ha svolto il proprio lavoro. Ciò ha lo svantaggio che le richieste successive verranno eseguite solo al termine 
della precedente. Di conseguenza il tempo totale impiegato sarà la somma di tutti i tempi di risposta. Un altro aspetto da considerare 
è che in un modello di programmazione sincrono il fatto che si debba aspettare che un'azione termini è implicito, mentre nella 
programmazione asincrona è esplicito.

In questa sezione vedremo:

* Le Callbacks
* Le Promises
* Gli Eventi
* Gli Streams

## Le callbacks

In JavaScript è possibile passare una funzione come argomento ad un'altra funzione. Nella programmazione asincrona in generale operazioni 
come leggere un file, o effettuare una richiesta HTTP ad un servizio restful, sono operazioni che vengono lanciate ed il controllo viene 
restituito al chiamante. Questo vuol dire che tutte le istruzioni che successive vengono eseguite immediatamente, anche se l'operazione 
precedente non è completata. In uno scenario come quello appena descritto, abbiamo la necessità di avere un meccanismo che ci avvisi quando 
l'operazione termina con successo, ma anche quando si è verificato qualche errore. Un meccanismo per ricevere questi risultati al termine 
dell'operazione è quello di passare una funzione come parametro di un altra funzione, la quale verrà richiamata al termine dell'operazione. 
Queste funzioni passate come parametro prendono il nome di *callback*. Le callback sono un concetto generale, identifica solo il meccanismo 
con cui il risultato viene propagato e non è utilizzato solo ed esclusivamente nella programmazione asincrona. 

Facciamo un piccolo esempio per comprenderne meglio il funzionamento. Immaginate una semplice funzione `sayHello`, che prende in input una variabile 
`name`, e restituisca una stringa che rappresenta un saluto personalizzato:

```javascript
function sayHello (name) {
  return `Hello, ${name}!`
}

const result = sayHello('Davide')
console.log(result)
```

Non c'è nulla di speciale in questo piccolo esempio. Quando la funzione `sayHello` viene richiamata, elabora una piccola stringa e la restituisce con un'istruzione `return`. Questo viene definito anche come *stile diretto* ed è, per chi proviene dalla programmazione sincrona, il modo più comune di restituire un risultato. Eseguendo il codice quello che otterremo quanto segue:

```javascript
Hello, Davide!
```

Ora vediamo come trasformare la funzione `sayHello` facendo in modo che utilizzi una funzione di callback:

```javascript
function sayHello (name, callback) {
  callback(`Hello, ${name}!`)
}

function introduceYourself (value) {
  console.log(value)
}

sayHello('Davide', introduceYourself)
```

Abbiamo sostituito l'istruzione `return` con l'invocazione alla funzione `introduceYourself` inviata come parametro. Di conseguenza 
il valore di ritorno verrà passato direttamente a questa funzione, la quale si occuperà di stampare il risultato. Inoltre la 
funzione `sayHello` è sincrona, infatti completerà al sua esecuzione solo quando terminerà quella della funzione `introduceYourself`. 
Aggiungiamo due `console.log` al codice che confermano quanto appena detto:

```javascript
console.log('Before hello')
sayHello('Davide', introduceYourself)
console.log('After hello')
```

Eseguendo lo script a video comparirà quanto segue:

```
Before hello
Hello, Davide!
After hello
```

Modifichiamo adesso la funzione `sayHello` in modo che diventi asincrona e vediamo come il comportamento del nostro script cambia radicalmente:

```javascript
function sayHello (name, callback) {
  setTimeout(function () {
    callback(`Hello, ${name}!`)
  }, 1000)
}
...
```

Nel frammento di codice mostrato, abbiamo utilizzato `setTimeout()` per simulare una chiamata asincrona della callback. `setTimeout()` 
esegue la funzione passatagli come parametro dopo il numero di millisecondi specificato (nel nostro caso un secondo). Questa è 
chiaramente un'operazione asincrona, e quindi un qualcosa che avverrà nel futuro. Ora se proviamo ad eseguire lo script con la modifica 
effettuata, vediamo come il risultato cambia radicalmente:

```
Before hello
After hello
Hello, Davide!
```

Il modulo principale inizia la sua esecuzione e stampa a video `Before hello`, successivamente esegue la funzione `sayHello`. 
Questa funzione esegue `setTimeout`, la quale non aspetta che venga eseguita la callback, ma restituisce subito il controllo al chiamante, 
che termina la sua esecuzione in quanto non ha altre istruzioni da eseguire. A sua volta `sayHello` restituisce il controllo al chiamante, 
il modulo principale, il quale stampa a video `After hello`. Una volta scaduto il timer, la callback viene eseguita e quindi a video comparirà 
la scritta `Hello, Davide!`.

### Leggere un file

Vediamo un esempio pratico di utilizzo di callback in Node.js utilizzando il modulo core `fs`. Ne parleremo in dettaglio più avanti, 
per il momento ci interessa la funzione `readFile`. Questa funzione prende in input il path di un file, e una callback:

```javascript
fs.readFile(path[, options], callback)
```

Vediamo un semplice esempio di utilizzo:

```javascript
import fs from 'node:fs'
fs.readFile(import.meta.filename, function (err, content) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log(content.toString())
})
```

Eseguendo questo script verrà stampata nella console il codice sorgente appena mostrato. Il motivo per cui viene stampato il contenuto 
dello script, è perché ogni file eseguito da un processo Node.js possiede una proprietà particolare *`__filename`* che non è altro che 
il path del file attualmente in esecuzione. Quindi, come già accennato in precedenza il primo argomento della funzione è il percorso del 
file che si vuole leggere. La funzione `fs.readFile` schedula un task e, quando la lettura viene completata, esegue la callback passata come 
secondo argomento. Questa funzione di callback passatagli come secondo argomento, possiede due parametri `err` e `content`. Nel caso 
in cui si verifica un errore, la variabile `err` sarà un oggetto di tipo errore altrimenti sarà `null`.

Il tempo impiegato dalla funzione `fs.readFile` dipende dalle dimensioni del file. Per esempio se immaginiamo di avere tre file di 
dimensioni significativamente diverse, allora la relativa callback di ogni invocazione di `fs.readFile`, sarebbe relazionata alle dimensioni 
degli stessi file. Anche se vengono invocate partendo dal più grande al più piccolo. Facciamo un piccolo esempio creiamo tre file di dimensioni 
significativamente diverse tra loro utilizzando il comando `dd`:

```
$ dd if=/dev/urandom of=bigFile.txt bs=1024 count=1000000
1000000+0 records in
1000000+0 records out
1024000000 bytes transferred in 9.213004 secs (111147242 bytes/sec)
$ dd if=/dev/urandom of=mediumFile.txt bs=1024 count=10000
10000+0 records in
10000+0 records out
10240000 bytes transferred in 0.085275 secs (120081843 bytes/sec)
$ dd if=/dev/urandom of=smallFile.txt bs=1024 count=100
100+0 records in
100+0 records out
102400 bytes transferred in 0.001593 secs (64286294 bytes/sec)
```

Dopo l'esecuzione di questi tre comandi, il file `bigFile.txt` sarà circa 1Gb, il file `mediumFile.txt` di 10Mb ed infine `smallFile.txt` 
appena 100Kb. Ora creiamo uno script nella stessa directory dove abbiamo creato i nostri tre file con il seguente contenuto:

```javascript
import {  readFile  } from 'node:fs'

readFile('./bigFile.txt', (err, contents) => {
  console.log('I am the bigFile.txt')
})

readFile('./mediumFile.txt', (err, contents) => {
  console.log('I am the mediumFile.txt')
})

readFile('./smallFile.txt', (err, contents) => {
  console.log('I am the smallFile.txt')
})
```

La stampa del contenuto del file ed il controllo degli errori sono stati volutamente omessi in quanto l'esempio è solo a scopo 
illustrativo. L'esempio vuole solo dimostrare chi termina prima la propria esecuzione. Eseguendo questo script il risultato che 
otterremo sarà il seguente: 

```
I am the smallFile.txt
I am the mediumFile.txt
I am the bigFile.txt
```

Non c'è da meravigliarsi se l'ordine in cui vengono stampati i messaggi. Le tre invocazioni della funzione `readFile` avvengono 
quasi nello stesso istante. Infatti questo è un modo per avere l'esecuzione parallela in Node.js. Ecco in dettaglio cosa accade: 

* Viene invocata `readFile` sul file `bigFile.txt`, la quale schedula l'attività di lettura del file e restituisce il controllo al processo principale;
* viene invocata `readFile` sul file `mediumFile.txt`, la quale schedula l'attività di lettura del file e restituisce il controllo al processo principale;
* viene invocata `readFile` sul file `smallFile.txt`, la quale schedula l'attività di lettura del file e restituisce il controllo al processo principale;
* dopo qualche millesimo di secondo, la callback passata come secondo parametro alla funzione `readFile` sulla lettura del file `smallFile.txt` sarà invocata. Questo accade in quanto le dimensioni del file sono significativamente piccole rispetto agli altri due. Quindi viene stampato a video _"I am the smallFile.txt"_;
* successivamente, poi viene invocata la callback passata come secondo argomento alla funzione `readFile` sul file `mediumFile.txt`. Questo accade perché le dimensioni del file sono molto inferiori a quelle di `bigFile.txt`, quindi viene stampato a video il secondo messaggio _"I am the mediumFile.txt"_;
* dopo qualche secondo invece, verrà invocata l'ultima callback, quella passata come secondo argomento alla funzione `readFile` sul file `bigFile.txt`, e quindi a video apparirà il terzo ed ultimo messaggio _"I am the bigFile.txt"_.

### Esecuzione sequenziale

Cosa accadrebbe se le dimensioni dei tre file descritti nel precedente esempio fossero pressoché uguali? Modifichiamo il contenuto dei 
tre file creati in precedenza e facciamo in modo che: 

* Il file `bigFile.txt` contenga la stringa: _"I am the bigFile.txt"_
* Il file `mediumFile.txt` contenga la stringa: _"I am the mediumFile.txt"_
* Il file `smallFile.txt` contenga la stringa: _"I am the smallFile.txt"_

Ora prendiamo di nuovo in considerazione il nostro esempio, ma prima apportiamo una piccola modifica:

```javascript
import {  readFile  } from 'node:fs'
const bigFile = './bigFile.txt'
const mediumFile = './mediumFile.txt'
const smallFile = './smallFile.txt'

const printResult = (err, contents) => {
  if (err) {
    console.error(err)
    return false
  }
  console.log(contents.toString())
}

readFile(bigFile, printResult)
readFile(mediumFile, printResult)
readFile(smallFile, printResult)
```

Nell'esempio appena mostrato non è possibile stabilire l'ordine in cui verranno stampati i messaggi a video in quanto le 
dimensioni dei file sono pressocché identiche. Infatti se proviamo ad eseguire il file più e più volte i risultati saranno quasi 
sempre diversi. Se vogliamo che i messaggi vengano stampati in un certo ordine, per esempio `bigFile`, `mediumFile` e `smallFile`, l'invocazione 
di `readFile` dev'essere annidata all'interno della callback dell'invocazione precedente:

```javascript
import {  readFile  } from 'node:fs'
const bigFile = './bigFile.txt'
const mediumFile = './mediumFile.txt'
const smallFile = './smallFile.txt'

const printResult = (err, contents) => {
  if (err) {
    console.error(err)
    return false
  }
  console.log(contents.toString())
}

readFile(bigFile, (err, contents) => {
  printResult(err, contents)
  
  readFile(mediumFile, (err, contents) => {
    printResult(err, contents)
  
    readFile(smallFile, (err, contents) => {
      printResult(err, contents)
    })
  })
})
```

L'esecuzione in serie con le callbacks si ottiene attendendo l'invocazione della callback prima di avviare la successiva operazione 
asincrona. Eseguendo questo script il risultato che otterremo sarà sempre il seguente.

```
I am the bigFile.txt
I am the mediumFile.txt
I am the smallFile.txt
```

Cosa succede se vogliamo che tutti i contenuti di ogni file siano concatenati e stampati una volta che tutti i file sono stati 
caricati? L'esempio seguente inserisce il contenuto di ogni file in un array e quindi stampa l'array quando tutti i file 
vengono caricati:

```javascript
import {  readFile  } from 'node:fs'
const bigFile = './bigFile.txt'
const mediumFile = './mediumFile.txt'
const smallFile = './smallFile.txt'
const filesContent = []

const printResult = (err, contents) => {
  if (err) {
    console.error(err)
    return false
  }
  console.log(contents.toString())
}

readFile(bigFile, (err, contents) => {
  if (err)
    printResult(err)
  else 
    filesContent.push(contents)
  
  readFile(mediumFile, (err, contents) => {
    if (err)
      printResult(err)
    else 
      filesContent.push(contents)
  
    readFile(smallFile, (err, contents) => {
      if (err)
        printResult(err)
      else 
        filesContent.push(contents)
      
      printResult(null, filesContent)
    })
  })
})
```

In questo esempio le callback sono sempre annidate una dentro l'altra solo che non stampiamo ogni volta il contenuto del 
file sulla console, bensì salviamo il suo contenuto all'interno di un array `filesContent` fino ad arrivare all'ultima callback 
che invocherà `printResult`. In questo caso eseguendo lo script il risultato che otterremo sarà il seguente:

```
I am the bigFile.txt,I am the mediumFile.txt,I am the smallFile.txt
```

Un altro metodo per mantenere l'ordine di lettura è quello di utilizzare una funzione ricorsiva, vediamo come:

```javascript
import {  readFile  } from 'node:fs'
const files = ['./bigFile.txt', './mediumFile.txt', './smallFile.txt']
const filesContent = []
let index = 0

const printResult = (err, contents) => {
  if (err) {
    console.error(err)
    return false
  }
  console.log(contents.toString())
}

const readFileRecursive = (file) => {
  readFile(file, (err, contents) => {
    index++
    if (err)
      printResult(err)
    else 
      filesContent.push(contents)
    if (index < files.length) 
      readFileRecursive(files[index])
    else
      printResult(null, filesContent)
  })
}

readFileRecursive(files[index])
```

Nell'esempio appena descritto, abbiamo definito una funzione ricorsiva `readFileRecursive`, una variabile `index` che tiene traccia 
del file che attualmente è in fase di lettura, ed un array `files` che contiene i path dei file da leggere, e di conseguenza 
l'ordine di lettura. Ogni volta che un file viene letto, viene aggiunto il suo contenuto in `filesContent` e successivamente viene 
incrementata la variabile `index` che, finché è più piccola di `files.length` richiama nuovamente `readFileRecursive`, altrimenti 
invoca la funzione `printResult` per stampare il risultato. Anche in questo caso eseguendo lo script il risultato che otterremo sarà:

```
I am the bigFile.txt,I am the mediumFile.txt,I am the smallFile.txt
```

> Una cosa molto importante da tenere in mente è che non importa che queste operazioni siano operazioni di lettura di file. 
I modelli di stream di controllo si applicano universalmente a tutte le operazioni asincrone.

### Alcune convenzioni

Esistono anche una serie di convenzioni che sono adottate dall'intera community di Node.js. Alcune di queste convenzioni riguardano 
proprio la scrittura delle callbacks.

#### Il primo argomento è un errore

In Node.js è previsto che ogni funzione di callback accetta come primo argomento un oggetto `Error`. Se nessun errore si verifica 
all'interno del nostro codice questo parametro dev'essere `null`. Se si utilizzano le funzioni anonime, vi ritroverete di fronte un 
frammento di codice simile al seguente:

```javascript
fs.readFile('/etc/passwd', (err, data) => {
  if (err)
    throw err
  console.log(data)
})
```

C’è un motivo per cui questo è un pattern utile: se immaginate di avere una catena di funzioni asincrone che dovevano essere eseguite 
una dopo l’altra. Tipo leggere un file, effettuare il retrieve di dati da un database, scrivere qualcosa nel database e produrre i 
risultati in una funzione di callback.

Ora immaginate che qualcosa vada storto nella prima funzione (durante la lettura del file). È ovvio che non si desidera eseguire 
ciecamente le altre funzioni nella riga successiva, bensì è conveniente propagare immediatamente l’errore e non eseguire le altre 
operazioni. Quando non si verifica alcun errore, allora è possibile proseguire con le operazioni successive.

Un’altra importante convenzione da prendere in considerazione è che l’errore deve sempre essere di tipo `Error`. Ciò significa che 
stringhe o numeri semplici non devono mai essere passati come oggetti di errore.

#### Le callback sono le ultime

Se la nostra funzione accetta una funzione di callback come argomento, dovrebbe essere l’ultimo argomento. Tale callback, a sua 
volta, dovrà accettare un oggetto `Error` come primo argomento così come descritto in precedenza. Prendiamo come esempio la seguente 
funzione dell’API di base Node.js:

```javascript
fs.readFile(nomeFile, [options], callback)
```

Eventuali argomenti aggiuntivi e facoltativi devono essere inseriti tra l’errore e il parametro callback. Come possiamo vedere dalla 
firma della funzione, la callback è sempre messa nell’ultima posizione, anche in presenza di argomenti opzionali. Il motivo di questa 
convenzione è che la chiamata alla funzione è più leggibile nel caso in cui la callback viene definita alla fine.

## Le promises

Le promises (promesse) sono parte dello standard ECMAScript 2015 (o ES6 dirsivoglia), e sono state aggiunte nativamente a partire dalla 
versione 4 di Node.js. Le promises rappresentano un gran passo avanti nella gestione della propagazione dei risultati delle operazioni 
asincrone basate su callbacks viste in precedenza. Come vedremo più avanti, le promises rendono il codice asincrono più leggibile e 
robusto rispetto all'alternativa basata su callback.

### Cos'è una Promise?

Una `Promise` è semplicemente un oggetto che può produrre un risultato, o un errore, di una operazione asincrona in un determinato 
momento nel futuro. Una `Promise` può trovarsi in tre stati possibili: 

* *Pending*: quando l'operazione asincrona non è ancora terminata.
* *Respinta*: quando l'operazione asincrona è terminata con un errore. La funzione `onRejected()` viene invocata.
* *Risolta*: quando l'operazione asincrona è terminata con un esito positivo. La funzione `onFulfilled()` viene invocata.
* *Saldata*: quando l'operazione asincrona non è in *pending* (con un errore o con successo).

Uno standard per le promises è stato definito dalla comunità, questo standard prende il nome di [Promises/A+](https://promisesaplus.com/implementations). 
Ci sono molte implementazioni conformi allo standard, incluso lo standard JavaScript che ECMAScript promises.

Le promises devono seguire una serie di regole ben definite:

* Una promise o _"thenable"_ è un oggetto che fornisce un metodo `.then()` conforme allo standard.
* Una promise in pending può passare a uno stato risolta o respinta.
* Una promise risolta o respinta è saldata e non deve passare in nessun altro stato.
* Una volta saldata una promise, deve avere un valore (che può essere `undefined`). Quel valore non deve cambiare.

Ogni istanza di `Promise` deve avere un metodo `then()` con la firma seguente

```javascript
myPromise.then(onFulfilled, onRejected)
```

Nella firma appena mostrata `myPromise` è un'istanza di `Promise` creata utilizzando l'operatore `new`. Il costruttore di `Promise` 
crea una nuova istanza che viene risolta o respinta in base alla funzione che viene fornita come argomento. La funzione fornita al 
costruttore riceverà due argomenti:

```javascript
new Promise((resolve, reject) => {})
```

Le promises non espongono il loro stato interno. Piuttosto pensate alla promise come una scatola nera. Solo la funzione responsabile 
della creazione della promise sarà a conoscenza del suo stato o dell'accesso per risolverla o rifiutarla. Notiamo che il costruttore 
di `Promise` prende in input due parametri:

* *`resolve(obj)`*: è una funzione che restituisce il risultato che risolve la `Promise`. `obj` sarà il valore per risolvere la promise se `obj` è una promise o un thenable.
* *`reject(err)`*: Questa funzione rifiuta la promise con un motivo ben preciso `err`. Una convenzione comune è che `err` sia un'istanza di `Error`.

Riprendiamo l'esempio della lettura di un file. Utilizziamo la funzione che già abbiamo utilizzato in precedenza `fs.readFile` e 
trasformiamola in modo tale che restituisca una `Promise`. Il codice mostrato di seguito è solo un esempio per comprendere il 
funzionamento di una `Promise`. Più avanti vedremo che in Node.js è possibile utilizzare anche le promises per la lettura di un file:

```javascript
import fs from 'node:fs'

const readFilePromise = file => new Promise((resolve, reject) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      reject(err)
    }

    resolve(data)
  })
})

readFilePromise('./hello.txt').
  then(
    data => console.log(data), 
    err => console.error(`An error occurred: ${err.message}`)
  )
```

In questo esempio, abbiamo creato una funzione `readFilePromise` che prende in input una stringa `file` che rappresenta il percorso del 
file di cui vogliamo leggere il contenuto. Questa funzione restituisce una istanza di `Promise` e nel suo costruttore abbiamo inserito 
il codice necessario per la lettura di un file, vista più volte negli esempi precedenti, utilizzando la funzione `fs.readFile`. 
Nel caso in cui la callback di del metodo `readFile` restituisce un errore, invochiamo la funzione `reject` passandogli la variabile 
`err` della callback. Nel caso in cui non si verifica nessun errore, invochiamo la funzione `resolve` con il contenuto del nostro file.

Ora, immaginando che nella directory corrente sia presente un file il cui contenuto è la stringa _"Hello, from the future!"_, 
non c'è da meravigliarsi se sul terminale verrà stampato il seguente messaggio:

```
Hello, from the future!
```

Verifichiamo che anche in caso di errore il nostro scrip si comporti come deve. Sostituiamo `./hello.txt` con un path errato, 
per esempio `./bad_hello.txt`. Il risultato sarà il seguente:

```
An error occurred: ENOENT: no such file or directory, open './bad_hello.txt'
```

In questo caso la funzione di callback di `fs.readFile`, restituirà un errore. Di conseguenza la nostra promise verrà respinta.

### Il metodo util.promisify

Il metodo `util.promisify()` definisce un modulo di utility della libreria standard Node.js. Viene fondamentalmente utilizzato 
per convertire un metodo che restituisce risultati attraverso le callbacks in un oggetto `Promise`. Come già visto nei precedenti paragrafi 
dove abbiamo analizzato le callbacks, diventa molto difficile lavorare con questo approccio e capita di dover annidare una callback dentro 
l'altra. Il metodo `util.promisify()` quindi, è in grado di fare questa trasformazione per noi. Per esempio possiamo riscrivere 
l'esempio del precedente paragrafo nel seguente modo:

```javascript
import fs from 'node:fs'
import {  promisify   } from 'node:util'
const readFile = promisify(fs.readFile)

readFile('./hello.txt', 'utf8')
  .then(
    data => console.log(data),
    err => console.error(`An error occurred: ${err.message}`)
  )
```

### Catene di promises

Se `.then()` restituisce un risultato allora questo risultato sarà sempre una nuova promise. È possibile concatenare le promises 
con un controllo preciso su come e dove vengono gestiti gli errori. Le promises ti consentono di imitare il normale comportamento di 
try/catch del codice sincrono. Esattamente come il codice sincrono, il concatenamento risulterà in una sequenza che viene eseguita 
in serie. In altre parole, possiamo fare quanto segue:

```javascript
import fs from 'node:fs'
import {  promisify   } from 'node:util'
const readFile = promisify(fs.readFile)

readFile(import.meta.filename)
  .then(data => data.toString())
  .then(console.log)
  .catch(err => console.error(`An error occurred: ${err.message}`))
```

In questo caso il primo `then` restituisce una promise che si risolve quando viene ritornato il contenuto del file trasformato in 
stringa. Quindi, quando il secondo viene chiamato sul risultato del primo, allora viene chiamata la funzione del secondo con il 
risultato del primo. Anche se una promise intermedia viene creata dalla prima, abbiamo ancora bisogno di un solo `catch` affinché 
eventuali errori vengano gestiti.

#### Leggere tre file in sequenza

Torniamo per un momento all'esempio di lettura sequenziale di tre files analizzato con le callbacks nel precedente paragrafo, e 
vediamo come risolvere lo stesso problema utilizzando una catena di promises. Abbiamo i tre file `bigFile.txt`, `mediumFile.txt` 
e ´smallFile.txt` e vogliamo che il risultato che viene stampato a video sia:

```
I am the bigFile.txt
I am the mediumFile.txt
I am the smallFile.txt
```

Una delle soluzioni era quella di annidare le callbacks una dentro l'altra per ottenere il risultato desiderato:

```javascript
readFile(bigFile, (err, contents) => {
  printResult(err, contents)
  
  readFile(mediumFile, (err, contents) => {
    printResult(err, contents)
  
    readFile(smallFile, (err, contents) => {
      printResult(err, contents)
    })
  })
})
```

Vediamo ora come possiamo trasformare questa implementazione utilizzando le promises. In precedenza abbiamo affermato che se 
`then` restituisce un valore allora quel valore sarà a una promise. Quindi possiamo creare una catena di prototipi dove propaghiamo la 
lettura del file successivo al `then` successivo:

```javascript
import fs from 'node:fs'
import {  promisify   } from 'node:util'
const readFile = promisify(fs.readFile)
const bigFile = './bigFile.txt'
const mediumFile = './mediumFile.txt'
const smallFile = './smallFile.txt'

const printResult = contents => {
  console.log(contents.toString())
}

readFile(bigFile)
  .then(data => {
    printResult(data)

    return readFile(mediumFile)
  })
  .then(data => {
    printResult(data)

    return readFile(smallFile)
  })
  .then(data => {
    printResult(data)
  })
  .catch(err => console.error(`An error occurred: ${err.message}`))
```

Una volta che `bigFile.txt` è stato letto, il primo handler `then` restituisce una promise per la lettura di `mediumFile.txt`. Il 
secondo handler `then` riceve il contenuto di `mediumFile.txt` e restituisce una promise per la lettura di `smallFile.txt`. Il terzo 
handler quindi stampa il contenuto di `smallFile.txt` e restituisce se stesso. Il gestore `catch` gestirà eventuali errori da una qualsiasi 
delle promise intermedie.

Ora riconsideriamo lo stesso scenario dell'array di files di cui ci siamo occupati nella sezione precedente. Ecco come si potrebbe 
ottenere lo stesso comportamento con le promises:

```javascript
import fs from 'node:fs'
import {  promisify   } from 'node:util'
const readFile = promisify(fs.readFile)
const files = ['./bigFile.txt', './mediumFile.txt', './smallFile.txt']
const data = []

const printResults = contents => {
  console.log(contents.toString())
}

let index = 0
const read = (file) => {
  return readFile(file).then((contents) => {
    index++
    data.push(contents)
    
    if (index < files.length) {
      return read(files[index])
    }

    return data
  })
}

read(files[index])
  .then((data) => {
    printResults(Buffer.concat(data))
  })
  .catch(err => console.error(`An error occurred: ${err.message}`))
```

La complessità qui è all'incirca la stessa di un approccio basato su callback. Tuttavia, vedremo in seguito che la combinazione 
di promise con *async/await* riduce drasticamente la complessità dell'esecuzione seriale. Come con l'esempio basato su callback, 
utilizziamo un array di dati e le variabili di conteggio e indice. Ma un handler `then` viene chiamato sulla promise `readFile` 
e se `index < files.length` l'handler `then` restituisce una promise di `readFile` per il file successivo nell'array. Questo ci 
permette di disaccoppiare nettamente il recupero dei dati dalla stampa dei dati. Il gestore quindi vicino alla parte inferiore 
del codice riceve l'array di dati popolato e lo stampa.

### Metodi statici

Oltre a `resolve` e `reject` il costrtuttore `Promise` restituisce altri metodi statici elencati di seguito:

* *`Promise.resolve(obj)`*: questo metodo crea una nuova `Promise` da un'altra `Promise`, un thenable o un valore. Se viene risolta una promise, quella promise viene restituita così com'è. Se viene fornito un thenable, viene convertito nell'implementazione della promise in uso. Se viene fornito un valore, la promise sarà risolta con quel valore.
* *`Promise.reject(err)`*: questo metodo crea una promise che rifiuta con `err` come motivo.
* *`Promise.all(iterable)`*: questo metodo crea una promise che, se risolta, ritorna un array contenente tutti i risultati delle promise date in input. Se una qualsiasi promise nell'oggetto iterabile viene rifiutata, la promise restituita da `Promise.all()` verrà rifiutata con il primo motivo di rifiuto. Ogni elemento nell'oggetto iterabile può essere una promise, un attributo generico o un valore.
* *`Promise.allSettled(iterable)`*: questo metodo attende che tutte le promesse di input vengano soddisfatte o rifiutate e quindi restituisce un array di oggetti contenente il valore risultante o il motivo del rifiuto per ogni promise datagli in input. Ogni oggetto di output ha una proprietà di stato, che può essere uguale a `'fulfilled'` o `'rejected'`, e una proprietà che contiene o il risultato, o il motivo del rifiuto. La differenza con `Promise.all()` è che `Promise.allSettled()` aspetterà sempre che ogni Promise venga risolta o rifiutata, invece di rifiutare immediatamente quando una delle promise viene rifiutata.
* *`Promise.race(iterable)`*: questo metodo restituisce una promise che è equivalente alla prima promise che termina.
* *`Promise.any(iterable)`*: accetta un array di promises come argomento. Se tutte le promises vengono risolte, la prima risolta verrà restituita da `Promise.any()`. Se tutte le promise vengono rifiutate, verrà restituito un `AggregateError`.

Infine, i seguenti sono i principali metodi disponibili su un'istanza `Promise`:

* *`promise.then(onFulfilled, onRejected)`*: questo è il metodo essenziale di una promise.
* *`promise.catch(onRejected)`*: questo metodo è solo zucchero sintattico per `promise.then(undefined, onRejected)`.
* *`promise.finally(onFinally)`*: Questo metodo ci permette di impostare una callback `onFinally`, che viene invocato quando la promise è saldata (o risolta o respinta). A differenza di `onFulfill` e `onRejected`, la callback `onFinally` non riceverà alcun argomento come input e qualsiasi valore restituito da esso verrà ignorato.

### Async/await

A partire dalla specifica ECMAScript 2017, sono state introdotte nel linguaggio due nuove parole chiave `async function` ed `await`. 
Sostanzialmente queste due parole chiave sono zucchero sintattico per le promises. L'utilizzo di *async/await*, ci 
consentono di scrivere funzioni che sembrano bloccare lo stream delle operazioni asincrone. Come vedremo a breve, la lettura di 
un frammento di codice che utilizza questa combinazione, risulterà molto più leggibile e simile al tradizionale codice sincrono. 
Ad oggi è altamente consigliato l'utilizzo di *async/await* in JavaScript, ma c'è da dire che non copre tutti gli scenari delle 
operazioni asincrone.

#### Dichiarare una funzione con async

Analizziamo ora il funzionamento della parola chiave `async`. Per utilizzarla basta aggiungerla prima della dichiarazione di 
una funzione. Per esempio immaginiamo di avere una semplice funzione `sum` che effettua la somma di due numeri:

```javascript
async function sum (a, b) {
  return a + b
}
```

che possiamo definire anche nel modo seguente:

```javascript
const sum = async (a, b) => a + b
```

Ora se proviamo ad utilizzare la funzione `sum` come una classica funzione sincrona:

```javascript
const sum = async (a, b) => a + b

const result = sum(5, 4)
console.log(result)
```

Otterrete il seguente risultato:

```
Promise { 9 }
```

Questo ci fa capire che quando utilizziamo la parola chiave `async` nella dichiarazione di una funzione, allora quella funzione 
non restituirà direttamente il valore specificato nell'istruzione `return` della funzione, ma restituirà una `Promise`. Quindi 
per gestire il risultato dobbiamo ancora una volta utilizzare un handler `then()` per gestire il risultato:

```javascript
const sum = async (a, b) => a + b

sum(5, 4)
  .then(result => console.log(result))
```

In questo caso il risultato che otterremo sarà quello atteso e quindi `9`.

#### La parola chiave await

I vantaggi di una funzione dichiarata utilizzando la parola chiave `async` diventano più chiari quando viene utilizzato in combinazione 
della parola chiave `await`. La parola chiave `await` può essere utilizzata solo all'interno delle funzioni dichiarate con `async`, 
è può essere utilizzata con una promise. Questo sospenderà l'esecuzione della funzione asincrona fino a quando la promise non viene 
risolta. Il valore risolto di questa promise viene restituito da un'espressione `await`. Riprendiamo ancora una volta l'esempio della 
lettura di un file:

```javascript
import {  readFile  } from 'node:fs'.promises

async function printResult () {
  const contents = await readFile(import.meta.filename)
  console.log(contents.toString())
}

printResult().catch(console.error)
```

Abbiamo creato una funzione asincrona chiamata `printResult`. All'interno di questa funzione usiamo la parola chiave `await` sul valore 
di ritorno di `readFile(__filename)`, che è una promise. L'esecuzione della funzione `async printResult` viene sospesa finché la promise 
restituita da `readFile(__filename)` non viene risolta. Quando si risolve, alla costante del contenuto verrà assegnato alla variabile `contents`.

Per avviare la funzione asincrona la chiamiamo come qualsiasi altra funzione. Come già discusso nel precedente paragrafo, 
una funzione asincrona restituisce sempre una promise, quindi chiamiamo il metodo `catch` per garantire che vengano gestiti 
eventuali errori. Ad esempio, se `readFile` avesse un errore, la promessa attesa verrebbe rifiutata, questo farebbe rifiutare 
la funzione di esecuzione e la gestiremmo nel gestore `catch`. 

#### try/catch

Un modo più lineare e leggibile per gestire gli errori quando utilizziamo *async/await* è quello di racchiudere le espressioni 
`await` in un blocco `try/catch`. Modifichiamo la nostra funzione `printResult`, in modo tale che utilizzi questo approccio. 
Inoltre faremo in modo che la promise venga rifiutata passando un path erraro alla funzione `readFile`.

```javascript
import {  readFile  } from 'node:fs'.promises

async function printResult () {
  try {
    const contents = await readFile('./bad_file.txt')
    return contents
  } catch (e) {
    console.error(e.message)
  }
}

printResult()
```

Un'altra soluzione è quella di propagare l'errore. Per farlo possiamo utilizzare l'espressione `throw` e, all'esterno della 
funzione possiamo utilizzare o un altro blocco `try/catch` o l'handler `.catch()`:

```javascript
import {  readFile  } from 'node:fs'.promises

async function printResult () {
  try {
    const contents = await readFile('./bad_file.txt')
    return contents
  } catch (e) {
    throw new Error(e)
  }
}

printResult().catch(console.error)
```

Oppure:

```javascript
import {  readFile  } from 'node:fs'.promises

async function printResult () {
  try {
    const contents = await readFile('./bad_file.txt')
    return contents
  } catch (e) {
    throw new Error(e)
  }
}

try {
  printResult()
} catch (e) {
  console.error(e)
}
```

In entrambi i casi a video verrà stampato l'errore seguente:

```
ENOENT: no such file or directory, open './bad_file.txt'
```

#### Esecuzione sequenziale

Torniamo ancora una volta all'esempio di lettura sequenziale dei tre files `bigFile.txt`, `mediumFile.txt` e `smallFile.txt`, 
in modo sequenziale rispettando il seguente ordine: 

```
I am the bigFile.txt
I am the mediumFile.txt
I am the smallFile.txt
```

Nei precedenti paragrafi abbiamo utilizzato due tecniche diverse:

* *Annidamento di calbacks*: in questo caso la soluzione è stata quella di annidare le callbacks una dentro l'altra per rispettare l'ordine di lettura.
* *Catena di promises*: in questo caso, invece, abbiamo provveduto alla stampa del contenuto del file e abbiamo restituito una `Promise` in modo che venisse catturata dal successivo handler `.then()`.

Ora vedremo come ottenere lo stesso risultato utilizzando la sintassi `async/await`:

```javascript
import {  readFile  } from 'node:fs'.promises
const bigFile = './bigFile.txt'
const mediumFile = './mediumFile.txt'
const smallFile = './smallFile.txt'

const printResult = contents => {
  console.log(contents.toString())
}

async function readFiles () {
  try {
    printResult(await readFile(bigFile))
    printResult(await readFile(mediumFile))
    printResult(await readFile(smallFile))
  } catch (e) {
    throw new Error(e)
  }
}

readFiles().catch(console.error)
```

Per determinare l'ordine in cui vogliamo che le operazioni vengano eseguite quando utilizziamo `async/await`, basta semplicemente scrivere le operazioni che vogliamo eseguire in quell'ordine. Anche concatenare i file dopo che sono stati caricati è banale con `async/await`:

```javascript
import {  readFile  } from 'node:fs'.promises
const bigFile = './bigFile.txt'
const mediumFile = './mediumFile.txt'
const smallFile = './smallFile.txt'

const printResult = contents => {
  console.log(contents.toString())
}

async function concatFiles () {
  try {
    const data = [
      await readFile(bigFile),
      await readFile(mediumFile),
      await readFile(smallFile)
    ]

    printResult(Buffer.concat(data))
  } catch (e) {
    throw new Error(e)
  }
}

concatFiles().catch(console.error)
```

Si noti che non è necessario utilizzare le variabili `index` o `files.length` per tenere traccia dell'esecuzione asincrona delle operazioni. Siamo stati anche in grado di popolare l'array di dati in modo dichiarativo invece di inserire lo stato al suo interno. La sintassi `async/await` consente implementazioni dichiarative asincrone.

Che dire dello scenario con un array di file di lunghezza sconosciuta? Il seguente è un approccio `async/await` a questo:

```javascript
import {  readFile  } from 'node:fs'.promises
const files = ['./bigFile.txt', './mediumFile.txt', './smallFile.txt']

const printResult = contents => {
  console.log(contents.toString())
}

async function concatFiles () {
  const data = []
  try{
    for (const file of files) {
      data.push(await readFile(file))
    }
  } catch (e) {
    throw new Error(e)
  }
  
  printResult(Buffer.concat(data))
}

concatFiles().catch(console.error)
```

Qui usiamo un `await` all'interno di un ciclo `for..of`. Per gli scenari in cui le operazioni essere chiamate in sequenza questo è appropriato. Tuttavia, per gli scenari in cui l'output deve essere ordinato solo, ma l'ordine in cui vengono risolte le operazioni asincrone è irrilevante, possiamo utilizzare `Promise.all`:

```javascript
import {  readFile  } from 'node:fs'.promises
const files = ['./bigFile.txt', './mediumFile.txt', './smallFile.txt']

const printResult = contents => {
  console.log(contents.toString())
}

async function concatFiles () {
  try {
    const readers = files.map((file) => readFile(file))
    const data = await Promise.all(readers)
    printResult(Buffer.concat(data))
  } catch (e) {
    throw new Error(e)
  }
}

concatFiles().catch(console.error)
```

Qui usiamo `map` sull'array `files` per creare un array di promises restituito da `readFile`. Chiamiamo questo array `readers`. 
Aspettiamo che tutte le promises vengano risolte con `Promise.all(readers)` e otteniamo un array di buffer. A questo punto è lo 
stesso dell'array di dati che abbiamo visto negli esempi precedenti. Questa è l'esecuzione parallela con output ordinato in sequenza.

## Gli eventi

Uno dei moduli fondamentali in Node.js è il modulo `events`. Questo modulo espone un costruttore `EventEmitter` che ci 
consente di creare oggetti (_subjects_) che sono emettitori di eventi, che vengono poi catturati da altre identità chiamate _listeners_. 
Il modo più semplice per creare un nuovo `EventEmitter` è quello di utilizzare l'operatore `new` nel seguente modo:

```javascript
import EventEmitter from 'node:events'

const myEventEmitter = new EventEmitter()
```

Un ulteriore modalità di utilizzo è quella di estendere la classe `EventEmitter`:

```javascript
import EventEmitter from 'node:events'

class MyEventEmitter extends EventEmitter {
  constructor (opts = {}) {
    super(opts)
    this.name = opts.name
  }
}
```

### Propagare eventi

Per propagare un evento basta invocare il metodo `emit` su un istanza di `EventEmitter`. Questo metodo produce un nuovo evento e fornisce argomenti aggiuntivi da passare ai listener. La sua firma è la seguente:

```javascript
emit(event, [arg1], [...])
```

Il primo argomento `event` rappresenta il namespace dell'evento. Per fare in modo che i listeners si possano mettere in ascolto su 
uno specifico evento, il namespace dev'essere noto. Tutti gli argomenti successivi verranno inoltrati al listener. Facciamo un piccolo esempio:

```javascript
import EventEmitter from 'node:events'

const greetingsEmitter = new EventEmitter()
greetingsEmitter.emit('sayHello', 'Hello, Davide!')
greetingsEmitter.emit('sayGoodBye', 'Good Bye, Davide!')
```

oppure

```javascript
import EventEmitter from 'node:events'

class GreetingsEmitter extends EventEmitter {
  constructor (opts = {}) {
    super(opts)
    this.name = opts.name
  }

  sayHello () {
    this.emit('sayHello', `Hello, ${this.name}!`)
  }

  sayGoodBye () {
    this.emit('sayGoodBye', `Good Bye, ${this.name}`)
  }
}
```

Nella prossima sezione daremo uno sguardo a come possiamo restare in ascolto sugli eventi `sayHello` e `sayGoodBye`. 
Schematicamente ecco ciò che accade:

![](./img/ch-6/01.png)

### Ascoltare un evento

Per restare in ascolto su un determinato evento, possiamo utilizzare due metodi. Il primo è `addListener` ed il secondo è `on`. Entrambi i metodi accettano come parametri il parametro `event` e la funzione listener per gestire l'evento nel momento in cui viene propagato:

```javascript
addListener(event, listener)
on(event, listener)
```

Ora che conosciamo le firme dei metodi, vediamo come possono essere utilizzati:

```javascript
import EventEmitter from 'node:events'

const greetingsEmitter = new EventEmitter()

greetingsEmitter.addListener('sayHello', console.log)
greetingsEmitter.addListener('sayGoodBye', console.log)

greetingsEmitter.emit('sayHello', 'Hello, Davide!')
greetingsEmitter.emit('sayGoodBye', 'Good Bye, Davide!')
```

Allo stesso modo se utilizziamo il metodo `on`:

```javascript
...
greetingsEmitter.on('sayHello', console.log)
greetingsEmitter.on('sayGoodBye', console.log)
...
```

In entrambi i casi provando ad eseguire lo script il risultato che otterremo sarà il seguente: 

```
Hello, Davide!
Good Bye, Davide!
```

Volendo aggiornare lo schema mostrato in precedenza, ecco ciò che accade:

![](./img/ch-6/02.png)

L'ordine con cui dichiariamo i listener è molto importante, infatti se proviamo a registrare i listeners dopo aver propagato gli eventi: 

```javascript
...
greetingsEmitter.emit('sayHello', 'Hello, Davide!')
greetingsEmitter.emit('sayGoodBye', 'Good Bye, Davide!')

greetingsEmitter.on('sayHello', console.log)
greetingsEmitter.on('sayGoodBye', console.log)
...
```

sulla console non appariranno i messaggi visti in precedenza. Questo perché gli eventi vengono propagati prima che il listener venga aggiunto. Un'altra cosa molto importante è che i listener vengono eseguiti nello stesso ordine in cui vengono aggiunti. Per esempio se proviamo a registrare due volte lo stesso evento `sayHello`:

```javascript
...
greetingsEmitter.on('sayHello', greeting => console.log(greeting))
greetingsEmitter.on('sayHello', greeting => console.log(`${greeting} Again!`))

greetingsEmitter.emit('sayHello', 'Hello, Davide!')
...
```

il risultato che otterremo sarà il seguente:

```
Hello, Davide!
Hello, Davide! Again!
```

Il metodo `prependListener` può aiutarci ad aggiungere un evento in cima alla lista degli eventi. Per esempio:

```javascript
...
greetingsEmitter.on('sayHello', greeting => console.log(`${greeting} Again!`))
greetingsEmitter.prependListener('sayHello', greeting => console.log(greeting))

greetingsEmitter.emit('sayHello', 'Hello, Davide!')
...
```

Notate che abbiamo registrato prima il listener contenente la parola _"Again!"_ e successivamente un altro listener sull'evento `sayHello`, utilizzando il metodo `prependListener`. Utilizzando questo metodo, il secondo listener registrato sarà propagato prima dell'evento registrato in precedenza. Anche in questo caso nella console appariranno i seguenti messaggi:

```
Hello, Davide!
Hello, Davide! Again!
```

Aggiornando nuovamente gli schema mostrati in precedenza, ecco cosa accade graficamente:

![](./img/ch-6/01.png)

### Singolo utilizzo

Un evento può essere propagato più di una volta. Per farlo basta invocare più volte il metodo `emit`:

```javascript
import EventEmitter from 'node:events'

const greetingsEmitter = new EventEmitter()

greetingsEmitter.on('sayHello', console.log)

greetingsEmitter.emit('sayHello', 'Hello, Davide!')
greetingsEmitter.emit('sayHello', 'Hello, Milena!')
greetingsEmitter.emit('sayHello', 'Hello, Giovanni!')
greetingsEmitter.emit('sayHello', 'Hello, Fuffy!')
```

È possibile però che a volte si abbia la necessità che un determinato evento venga propagato solo una volta. Per farlo basta utilizzare la funzione `once`. Questo metodo particolare propaga l'evento e successivamente lo rimuove. La sua firma è la seguente:

```javascript
once(event, listener)
```

Ora utilizziamo questo metodo nell'esempio visto precedentemente. Per farlo basta sostituire `once` al posto di `addListener` oppure `on`:

```javascript
import EventEmitter from 'node:events'

const greetingsEmitter = new EventEmitter()

greetingsEmitter.once('sayHello', console.log)

greetingsEmitter.emit('sayHello', 'Hello, Davide!')
greetingsEmitter.emit('sayHello', 'Hello, Milena!')
greetingsEmitter.emit('sayHello', 'Hello, Giovanni!')
greetingsEmitter.emit('sayHello', 'Hello, Fuffy!')
```

Eseguendo questo script con le modifiche citate in precedenza, verrà gestito solo il primo evento propagato. Tutti gli altri verranno ignorati. Infatti provando ad eseguire lo script, verrà stampato solo il messaggio:

```
Hello, Davide!
```

### Rimuovere un listener

Il metodo `removeListener` può essere utilizzato per rimuovere un listener registrato in precedenza. Ecco la sua firma:

```javascript
removeListener(event, listener)
```

Possiamo notare che il metodo `removeListener` accetta due parametri. Il primo è il nome dell'evento, mentre il secondo è la funzione listener associata. Nel prossimo esempio, il listener `greet1` verrà invocato due volte, mentre `greet2` cinque volte:

```javascript
import {  EventEmitter  } from 'node:events'
const greetingsEmitter = new EventEmitter()

const greet1 = () => { console.log('Hello!') }
const greet2 = () => { console.log('Hello, again!') }

greetingsEmitter.on('sayHello', greet1)
greetingsEmitter.on('sayHello', greet2)

setInterval(() => {
  greetingsEmitter.emit('sayHello')
}, 200)

setTimeout(() => {
  greetingsEmitter.removeListener('sayHello', greet1)
}, 500)

setTimeout(() => {
  greetingsEmitter.removeListener('sayHello', greet2)
}, 1100)
```

Eseguendo questo script otterremo il seguente risultato:

```
Hello!
Hello, again!
Hello!
Hello, again!
Hello, again!
Hello, again!
Hello, again!
```

L'evento `sayHello` viene propagato ogni 200 millisecondi. Dopo 500 millisecondi la funzione `greet1` viene rimossa. Quindi `greet1` viene chiamato solo due volte prima di essere rimosso. Ma al punto 1100 millisecondi, `greet2` viene rimosso. Quindi `greet2` viene invocata cinque volte.

Il metodo `removeAllListeners` può essere utilizzato per rimuovere i listener senza avere un riferimento alla loro funzione. Può non accettare argomenti, nel qual caso ogni ascoltatore su un oggetto emettitore di eventi verrà rimosso, oppure può prendere un nome di evento per rimuovere tutti gli ascoltatori per un determinato evento.

Lo script che segue propagherà due eventi di `sayHello` due volte, mentre propagherà cinque volte il listener `sayHi`:

```javascript
import {  EventEmitter  } from 'node:events'
const greetingsEmitter = new EventEmitter()

const sayHello = () => { console.log('Hello!') }
const sayHelloAgain = () => { console.log('Hello, again!') }
const sayHi = () => { console.log('Hi!') }

greetingsEmitter.on('sayHello', sayHello)
greetingsEmitter.on('sayHello', sayHelloAgain)
greetingsEmitter.on('sayHi', sayHi)

setInterval(() => {
  greetingsEmitter.emit('sayHello')
  greetingsEmitter.emit('sayHi')
}, 200)

setTimeout(() => {
  greetingsEmitter.removeAllListeners('sayHello')
}, 500)

setTimeout(() => {
  greetingsEmitter.removeAllListeners()
}, 1100)
```

Gli eventi `sayHello` e `sayHi` vengono propagati ogni 200 millisecondi. Dopo 500 millisecondi tutti i listeners di `sayHello` vengono rimossi, quindi i due listeners vengono invocati due volte prima di essere rimossi. Dopo 1100 millisecondi viene chiamato il metodo `removeAllLIsteners` senza argomenti, che rimuove il restante listener `sayHi`, che viene invocato cinque volte.

## Buffers e Streams

Per comprendere meglio il concetto di buffer e stream (o flusso) immaginiamo di avere una pila di mattoni da qualche parte, e che volete costruire un muro a dieci metri di distanza da questa pila di mattoni con l'aiuto di un vostro amico. Per iniziare abbiamo due opzioni. Possiamo aspettare il nostro amico che ci porti l'intera pila di mattoni, oppure iniziare a costruire appena abbiamo una quantità minima per iniziare a lavorare, mentre nel frattempo il nostro amico continua a portarci gli altri mattoni. L'opzione più efficiente è sicuramente la seconda non vi pare? Questo è un classico esempio di come uno stream (in questo caso uno stream di mattoni) può migliorare l'efficienza di un processo. Un altro esempio comune con cui abbiamo molta familiarità nella vita quotidiana sarebbe lo streaming di un film invece di scaricare prima l'intero film e poi guardarlo.

### Un flusso d'acqua

Le informazioni sono come l'acqua, fluiscono da un luogo all'altro, come uno stream di bit. La stessa dinamica si realizza quando due peer comunicano tra di loro utilizzando la rete, oppure quando un'applicazione comunica con una periferica, o viceversa. Tuttavia, può accadere che uno dei due attori coinvolti, per un motivo o per un altro, sia più lento rispetto all'altro; pertanto rischieremmo una perdita di dati se non avessimo un luogo in cui memorizzare questi dati nel frattempo che il destinatario non sia in grado di riceverne altri.

Riprendendo l'esempio dell'acqua, immaginate due serbatoi: il primo con un rubinetto aperto a valle ed un secondo, con una portata maggiore, che continua a versare acqua nel serbatoio:

![](./img/ch-6/04.png)

Notate come la velocità del flusso d'acqua a monte è superiore a quella che può consumare a valle. Pertanto, il serbatoio deve immagazzinare temporaneamente (_Buffer_) l'acqua in eccesso mentre la valle consuma lentamente. Riprendendo l'esempio dei mattoni fatto in precedenza, la quantità minima per iniziare a lavorare con i mattoni rappresenta esattamente lo stesso concetto di immagazzinamento temporaneo. Quindi il primo concetto che chiariremo ora, prima di procedere con un'analisi più approfondita degli streams, è il quello di _Buffer_.

### L'istanza Buffer

La gestione dei dati binari nella programmazione lato server è una capacità essenziale. In Node.js i dati binari vengono gestiti con il costruttore Buffer. Quando una codifica non è impostata, la lettura dal file system o da un socket di rete o da qualsiasi tipo di I/O si tradurrà in un'altra istanza simile a un array che eredita dal costruttore `Buffer`.

Il costruttore `Buffer` è globale, quindi non è necessario richiedere alcun modulo principale per utilizzare l'API `Buffer` core di Node. Quando il costruttore `Buffer` è stato introdotto per la prima volta in Node.js, il linguaggio JavaScript non aveva un tipo binario nativo. Con l'evolversi del linguaggio, sono stati introdotti `ArrayBuffer` e una varietà di array tipizzati per fornire "viste" diverse di un buffer. Ad esempio, è possibile accedere a un'istanza `ArrayBuffer` con un `Float64Array` in cui ogni set di 8 byte viene interpretato come un numero a virgola mobile a 64 bit, o un `Int32Array` in cui ogni 4 byte rappresenta un intero con segno a complemento a due a 32 bit o un `Uint8Array` in cui ogni byte rappresenta un intero senza segno compreso tra 0 e 255. Quando queste nuove strutture di dati sono state aggiunte a JavaScript, gli interni del costruttore `Buffer` sono stati riformattati sopra l'array tipizzato `Uint8Array`. Quindi un oggetto buffer è sia un'istanza di Buffer che un'istanza (al secondo grado) di `Uint8Array`: 

```javascript
const b = Buffer.alloc(10)
console.log(b instanceof Buffer) // true
console.log(b instanceof Uint8Array) // true
```

Ciò significa che ci sono API aggiuntive che possono essere utilizzate oltre ai metodi `Buffer`. Per ulteriori informazioni, vedere "`Uint8Array`" di MDN web docs. E per un elenco completo delle API Buffers che si trovano in cima all'https://nodejs.org/dist/latest-v12.x/docs/api/buffer.html[API `Uint8Array`].

Una cosa fondamentale da notare è che il metodo `Buffer.prototype.slice` sovrascrive il metodo `Uint8Array.prototype.slice` per fornire un comportamento diverso. Mentre il metodo slice `Uint8Array` prenderà una copia di un buffer tra due indici, il metodo slice `Buffer` restituirà un'istanza buffer che fa riferimento ai dati binari nel buffer originale su cui è stata chiamata la slice:

```javascript
let b1 = Buffer.alloc(10)
console.log(b1)

let b2 = b1.slice(2, 3)
console.log(b2)
b2[0] = 100
console.log(b2[0])
console.log(b2)

let b3 = new Uint8Array(10)
console.log(b3)

let b4 = b3.slice(2, 3)
console.log(b4)

b4[0] = 100
console.log(b4[0])
console.log(b4)
```

Il risultato che otterrete eseguendo lo script sarà il seguente:

```
<Buffer 00 00 00 00 00 00 00 00 00 00>
<Buffer 00>
100
<Buffer 64>
Uint8Array [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
Uint8Array [ 0 ]
100
Uint8Array [ 100 ]
```

Quando creiamo `b2` chiamando `b1.slice(2, 3)` questo è in realtà un riferimento al terzo byte in `b1`. Quindi, quando assegniamo `b2[0]` a `100`, anche `b1[2]` viene aggiornato allo stesso, perché è lo stesso pezzo di memoria. Tuttavia, utilizzando direttamente un `Uint8Array`, prendendo una porzione di `b3` per creare `b4` si crea invece una copia del terzo byte in `b3`. Quindi, quando `b4[0]` è assegnato a `100`, `b3[2]` rimane a `0` perché ogni buffer si riferisce a una porzione di memoria completamente separata.

#### Allocare buffer

Per allocare un buffer in Node.js non abbiamo la necessità di utilizzare l'operatore `new`. Il modo più semplice per creare un buffer di un certo numero di byte è quello di utilizzare `Buffer.alloc`:

```javascript
const buff = Buffer.alloc(10)
```

Il codice appena mostrato alloca un buffer di 10 byte. Di default `Buffer.alloc` crea un buffer con tutti zero al suo interno.

```
<Buffer 00 00 00 00 00 00 00 00 00 00>
```

> Quando un buffer viene stampato la sua rappresentazione è in esadecimale. Per esempio se abbiamo un buffer con un singolo byte che rappresenta il numero 100 allora la sua rappresentazione sarà `<Buffer 64>`.

Quello appena descritto non è l'unico modo per creare un buffer. È il modo più sicuro. Esiste anche un metodo meno sicuro che è `allocUnsafe`:

```javascript
const buff = Buffer.allocUnsafe(10)
```

Quando viene creato un buffer vengono prese locazioni di memoria non utilizzate. Ma queste locazioni di memoria, se sono state utilizzate, conterranno dati utilizzati in precedenza e non vengono cancellate. Questo comporta un rischio per la sicurezza. L'utilizzo di `Buffer.allocUnsafe` è solo un modo più veloce per allocare un buffer.

#### Convertire stringhe in buffer

Le stringhe in JavaScript sono una struttura dati utilizzata di frequente, quindi è importante spiegare come convertire le stringhe in buffer e da buffer in stringhe. Un buffer può essere creato da una stringa utilizzando `Buffer.from`:

```javascript
const buffer = Buffer.from('Hello, world!')
```

Quando una stringa viene passata a `Buffer.from` i caratteri nella stringa vengono convertiti in valori di byte:

```
<Buffer 48 65 6c 6c 6f 2c 20 77 6f 72 6c 64 21>
```

Per convertire una stringa in una rappresentazione binaria, è necessario assumere una codifica. La codifica predefinita utilizzata da Buffer.from è UTF8. La codifica UTF8 può avere fino a quattro byte per carattere, quindi non è sicuro presumere che la lunghezza della stringa corrisponda sempre alla dimensione del buffer convertito.

```javascript
console.log('ciao'.length) // Stamperà 4
console.log(Buffer.from('🇮🇹').length) // Stamperà 8
```

Tuttavia, quando la stringa viene convertita in un buffer, ha una lunghezza di 8. Questo perché nella codifica UTF8, l'emoji della bandiera italiana è rappresentato con otto byte: 

```
<Buffer f0 9f 87 ae f0 9f 87 b9>
```

#### Convertire buffer in stringhe

Per convertire un buffer in una stringa, chiama il metodo `toString` su un'istanza Buffer:

```javascript
const buffer = Buffer.from('🇮🇹')
console.log(buffer) // Stampa <Buffer f0 9f 87 ae f0 9f 87 b9>
console.log(buffer.toString()) // Stampa 🇮🇹
console.log(buffer + '') // Stampa 🇮🇹
```

Nell'ultima riga del codice di esempio, concateniamo anche il buffer a una stringa vuota. Questo ha lo stesso effetto della chiamata al metodo `toString`.

Al metodo toString può anche essere passata una codifica come argomento:

```javascript
const buffer = Buffer.from('🇮🇹')
console.log(buffer) // Stampa <Buffer f0 9f 87 ae f0 9f 87 b9>
console.log(buffer.toString('hex')) // Stampa f09f87aef09f87b9
console.log(buffer.toString('base64')) // Stampa 8J+HrvCfh7k=
```

#### JSON buffer

JSON è un formato di serializzazione molto comune, in particolare quando si lavora con applicazioni basate su JavaScript. Quando `JSON.stringify` incontra un oggetto, tenterà di chiamare un metodo `toJSON` su quell'oggetto, se esiste. Le istanze del buffer hanno un metodo `toJSON` che restituisce un semplice oggetto JavaScript per rappresentare il buffer in un modo compatibile con `JSON`:

```javascript
const buffer = Buffer.from('🇮🇹').toJSON()
const json = JSON.stringify(buffer)
const parsed = JSON.parse(json)

console.log(parsed)
console.log(Buffer.from(parsed.data))
```

Il risultato che otterremo a video sarà il seguente:

```
{ type: 'Buffer',
  data: [ 240, 159, 135, 174, 240, 159, 135, 185 ] }
<Buffer f0 9f 87 ae f0 9f 87 b9>
```

### Streams

Gli streams sono una delle migliori funzionalità core di Node e sono stati una parte importante dell'ecosistema sin dai primi giorni di Node. Oggi esistono migliaia di moduli su npm che ci aiutano a comporre tutti i tipi di fantastiche app basate su streaming, consentendoci di lavorare con grandi volumi di dati in ambienti con risorse limitate.

In Node.js, il modulo `stream` offre la possibilità di lavorare con gli streams. Anche se non avete mai utilizzato il modulo stream in modo esplicito, ci sono molte funzionalità sottostanti nelle applicazioni NodeJS che utilizzano gli stream. "Stream" è un concetto semplice, ma può sembrare molto complesso se non lo si conosce. Molte API principali di Node.js come `process`, `net`, `http` e `fs`, espongono streams. Gli streams sono basati su `EventEmitter` ed i principali eventi propagati dalle varie implementazioni di `Stream` che si possono incontrare comunemente sono:

* *data*
* *end*
* *error*
* *finish*
* *close*

Il modulo core `stream` di Node.js espone sei costruttori per creare uno stream:

* *Stream*
* *Readable*
* *Writable*
* *Duplex*
* *Transform*
* *PassThrough*

Il costruttore `Stream` è l'esportazione predefinita del modulo `stream` ed eredita dal costruttore `EventEmitter` del modulo `events`. Il costruttore `Stream` viene usato raramente direttamente, ma viene ereditato dagli altri costruttori.

```
Object.getPrototypeOf(stream.prototype)
{
  _events: undefined,
  _eventsCount: 0,
  _maxListeners: undefined,
  setMaxListeners: [Function: setMaxListeners],
  getMaxListeners: [Function: getMaxListeners],
  emit: [Function: emit],
  addListener: [Function: addListener],
  on: [Function: addListener],
  prependListener: [Function: prependListener],
  once: [Function: once],
  prependOnceListener: [Function: prependOnceListener],
  removeListener: [Function: removeListener],
  off: [Function: removeListener],
  removeAllListeners: [Function: removeAllListeners],
  listeners: [Function: listeners],
  rawListeners: [Function: rawListeners],
  listenerCount: [Function: listenerCount],
  eventNames: [Function: eventNames]
}
```

Ci sono due modalità di streaming:

* Streams binari
* Streams di oggetti

La modalità di uno stream è determinata dalla relativa opzione `objectMode` passata quando viene creata un'istanza dello stream. Di default `objectMode` predefinito è `false`, il che significa che la modalità predefinita è binaria. I streams in modalità binaria leggono o scrivono solo istanze di buffer.

#### Stream leggibili

Uno stream leggibile può essere utilizzato per leggere i dati da un'origine sottostante come un descrittore di file. I dati possono essere archiviati in un buffer all'interno dello stream leggibile se l'applicazione consuma più lentamente di quanto il sistema operativo legge dall'origine.

![](./img/ch-6/05.png)

Il costruttore `Readable` estente il costruttore `Stream`, che a sua volta estende `EventEmitter`, quindi gli streams leggibili sono a loro volta propagatori di eventi. Appena i dati sono disponibili viene propagato l'evento `data`. Questa tipologia di streams possono essere usati per leggere dati da una richiesta HTTP, leggere dati immessi in input da un comando, leggere un file e altro ancora. 

L'esempio riportato di seguito mostra come leggere un file utilizzando uno stream leggibile:

```javascript
import fs from 'node:fs'
const rs = fs.createReadStream(import.meta.filename)

rs.on('data', data => { 
  console.log('Data chunk:\n', data)
})

rs.on('end', () => {
  console.log('Read is finished')
})
```

Il modulo `fs` qui viene utilizzato a scopo dimostrativo, le interfacce di stream leggibili sono generiche. Il file system è trattato nel prossimo capitolo, quindi eviteremo spiegazioni approfondite. Ma è sufficiente dire che il metodo `createReadStream` crea un'istanza di un'istanza del costruttore `Readable` e quindi fa sì che emetta eventi `data` per ogni blocco del file che è stato letto. In questo caso il file sarebbe il file effettivo che esegue questo codice, il `__filename` implicitamente disponibile si riferisce al file che esegue il codice. Poiché è così piccolo, verrebbe emesso solo un evento di dati, ma i streams leggibili hanno un'opzione `highWaterMark` predefinita di 16 kb. Ciò significa che è possibile leggere 16 kb di dati prima di emettere un evento dati. Quindi, nel caso di uno stream di lettura di file, un file da 64 kb emetterebbe quattro eventi di dati. Quando non ci sono più dati da leggere per uno stream leggibile, viene emesso un evento `end`.

```
Data chunk:
 <Buffer 63 6f 6e 73 74 20 66 73 20 3d 20 72 65 71 75 69 72 65 28 27 66 73 27 29 0a 63 6f 6e 73 74 20 72 73 20 3d 20 66 73 2e 63 72 65 61 74 65 52 65 61 64 53 ... 142 more bytes>
Read is finished
```

Possiamo creare noi stessi uno stream leggibile inventato utilizzando il costruttore `Readable`. Per esempio:

```javascript
import {  Readable  } from 'node:stream'

const createReadStream = () => {
  const data = ['Hello', 'Node.js', 'in', 'pillole']
  return new Readable({
    read () {
      if (data.length === 0) this.push(null)
      else this.push(data.shift())
    }
  })
}

const rs = createReadStream()
rs.on('data', data => { 
  console.log('Data chunk:\n', data)
})

rs.on('end', () => {
  console.log('Read is finished!')
})
```

Per creare uno stream leggibile, il costruttore `Readable` viene invocato con la parola chiave `new` e passato un oggetto options con un metodo `read`. La funzione di lettura viene chiamata ogni volta che Node.js richiede nuovi dati dallo stream leggibile. La parola chiave `this` nel metodo read punta all'istanza `Readable`, quindi i dati vengono inviati dallo stream di lettura chiamando il metodo push sull'istanza dello stream risultante. Quando non sono rimasti dati, viene chiamato il metodo push, passando `null` come argomento per indicare che questa è la fine dello stream. A questo punto Node farà sì che lo stream leggibile propaghi l'evento `end`.

Quando questo viene eseguito vengono propagati quattro eventi di dati, perché la nostra implementazione spinge ogni elemento nello stream, un pezzo alla volta. Il metodo `read` che forniamo all'oggetto options passato al costruttore `Readable` accetta un argomento `size` che viene utilizzato in altre implementazioni, come la lettura di un file, per determinare quanti byte leggere. Come abbiamo discusso, questo sarebbe in genere il valore impostato dall'opzione `highWaterMark` che per impostazione predefinita è 16 kb.

Quanto segue mostra cosa succede quando eseguiamo questo codice:

```
Data chunk:
 <Buffer 48 65 6c 6c 6f>
Data chunk:
 <Buffer 4e 6f 64 65 2e 6a 73>
Data chunk:
 <Buffer 69 6e>
Data chunk:
 <Buffer 70 69 6c 6c 6f 6c 65>
Read is finished!
```

Una cosa da notare e che abbiamo inserito le stringhe nel nostro stream leggibile, ma quando le raccogliamo nell'evento `data` sono buffer. I streams leggibili emettono buffer per impostazione predefinita, il che ha senso poiché la maggior parte dei casi d'uso per i streams leggibili si occupa di dati binari.

Nella sezione precedente, abbiamo discusso dei buffer e delle varie codifiche. Possiamo impostare un'opzione di codifica quando istanziamo lo stream leggibile affinché lo stream gestisca automaticamente la decodifica del buffer:

```javascript
import {  Readable  } from 'node:stream'

const createReadStream = () => {
  const data = ['Hello', 'Node.js', 'in', 'pillole']
  return new Readable({
    encoding: 'utf8',
    read () {
      if (data.length === 0) this.push(null)
      else this.push(data.shift())
    }
  })
}

const rs = createReadStream()
rs.on('data', data => { 
  console.log('Data chunk:\n', data)
})

rs.on('end', () => {
  console.log('Read is finished!')
})
```

In questo caso l'output sarà il seguente:

```
Data chunk:
 Hello
Data chunk:
 Node.js
Data chunk:
 in
Data chunk:
 pillole
Read is finished!
```

Ora, quando ogni evento di `data` viene propagato, riceve una stringa invece di un buffer. Tuttavia, poiché la modalità di stream predefinita è `objectMode: false`, la stringa viene inviata allo stream leggibile, convertita in un buffer e quindi decodificata in una stringa utilizzando UTF8. Quando creiamo uno stream leggibile senza l'intenzione di utilizzare i buffer, possiamo invece impostare `objectMode` su `true`:

```javascript
import {  Readable  } from 'node:stream'

const createReadStream = () => {
  const data = ['Hello', 'Node.js', 'in', 'pillole']
  return new Readable({
    objectMode: true,
    read () {
      if (data.length === 0) this.push(null)
      else this.push(data.shift())
    }
  })
}

const rs = createReadStream()
rs.on('data', data => { 
  console.log('Data chunk:\n', data)
})

rs.on('end', () => {
  console.log('Read is finished!')
})
```

Questa volta la stringa viene inviata dallo stream leggibile senza prima essere convertita in un buffer. Ancora una volta il risultato sarà il seguente:

```
Data chunk:
 Hello
Data chunk:
 Node.js
Data chunk:
 in
Data chunk:
 pillole
Read is finished!
```

Un ulteriore modo per creare un buffer leggibile è quello di utilizzare il metodo statico `Readable.from`. Questo metodo crea uno stream iterabile partendo da un array con `objectMode: true`, quindi nel nostro esempio saranno restituire stringhe:

```javascript
import {  Readable  } from 'node:stream'

const rs = Readable.from(['Hello', 'Node.js', 'in', 'pillole'])
rs.on('data', data => { 
  console.log('Data chunk:\n', data)
})

rs.on('end', () => {
  console.log('Read is finished!')
})
```

#### Stream scrivibili

Uno stream scrivibile viene utilizzato per scrivere dati da un'applicazione a una determinata destinazione. Per evitare la perdita di dati o il sovraccarico della destinazione nel caso in cui la destinazione sia più lenta dell'applicazione di scrittura, i dati possono essere archiviati in un buffer interno.

![](./img/ch-6/06.png)

Il costruttore `Writable` crea streams scrivibili. Uno stream scrivibile può essere utilizzato per scrivere un file, scrivere dati su una risposta HTTP o scrivere sul terminale. Il costruttore `Writable` eredita dal costruttore `Stream` che eredita dal costruttore `EventEmitter`, quindi anche i streams scrivibili sono emettitori di eventi. Per inviare dati a uno stream scrivibile, viene utilizzato il metodo `write`:

```javascript
import fs from 'node:fs'

const ws = fs.createWriteStream('./out.txt')
ws.on('finish', () => { console.log('finished writing') })

ws.write('Hello\n')
ws.write('Node.js\n')
ws.write('in\n')
ws.write('pillole\n')
ws.end('Write process finished!')
```

Il metodo `write`, invocato quattro volte, scrive la stringa passatagli come parametro nel file `out.txt`. Anche il metodo `end` scrive una stringa all'interno del file prima che venga propagato l'evento `finish`. Il nostro codice di esempio prenderà gli input della stringa, li convertirà in un'istanza Buffer e quindi li scriverà nel file out. Una volta scritta la riga finale, verrà emessa la scrittura terminata. Il nostro file `out.txt` conterrà:

```
Hello
Node.js
in
pillole
Write process finished!
```

Come con l'esempio dello stream di lettura, non concentriamoci sul modulo `fs`, le caratteristiche dei streams scrivibili sono universali. Analogamente ai streams leggibili, i streams scrivibili sono per lo più utili per l'I/O, ma possiamo anche creare un esempio di stream di scrittura inventato:

```javascript
import {  Writable  } from 'node:stream'

const createWriteStream = (data) => {
  return new Writable({
    write (chunk, enc, next) {
      data.push(chunk)
      next()
    }
  })
}

const data = []
const ws = createWriteStream(data)
ws.on('finish', () => { 
  console.log('Write process finished!\n', data) 
})

ws.write('Hello\n')
ws.write('Node.js\n')
ws.write('in\n')
ws.write('pillole\n')
ws.end('Nothing more to write!')
```

Per creare uno stream scrivibile, chiama il costruttore `Writable` con la parola chiave `new`. L'oggetto opzioni del costruttore Writable può avere una funzione `write`, che accetta tre argomenti, che abbiamo chiamato `chunk`, `enc` e `next`. `chunk` è ogni pezzo di dati scritto nello stream, `enc` è una codifica che ignoriamo nel nostro caso e `next` è la callback che deve essere chiamata per indicare che siamo pronti per il prossimo `chunk` di dati.

Il motivo per cui viene chiamata la callback `next` è quello di consentire operazioni asincrone all'interno della funzione `write`, questo è essenziale per eseguire I/O asincrono. Vedremo un esempio di lavoro asincrono in uno stream prima di chiamare un callback nella sezione seguente. Nella nostra implementazione aggiungiamo ogni blocco all'array di dati che passiamo alla nostra funzione `createWriteStream`.

Quando lo streaming è terminato, i dati vengono mostrati:

```
Write process finished!
 [
  <Buffer 48 65 6c 6c 6f 0a>,
  <Buffer 4e 6f 64 65 2e 6a 73 0a>,
  <Buffer 69 6e 0a>,
  <Buffer 70 69 6c 6c 6f 6c 65 0a>,
  <Buffer 4e 6f 74 68 69 6e 67 20 6d 6f 72 65 20 74 6f 20 77 72 69 74 65 21>
]
```

Come con gli stream leggibili, l'opzione `objectMode` predefinita è `false`, quindi ogni stringa scritta nella nostra istanza scrivibile dello stream viene convertita in un buffer prima che diventi l'argomento `chunk` passato alla funzione `write`. Questo può essere disattivato impostando l'opzione `decodeStrings` su `false`: 

```javascript
import {  Writable  } from 'node:stream'

const createWriteStream = (data) => {
  return new Writable({
    decodeStrings: false,
    write (chunk, enc, next) {
      data.push(chunk)
      next()
    }
  })
}

const data = []
const ws = createWriteStream(data)
ws.on('finish', () => { 
  console.log('Write process finished!\n', data) 
})

ws.write('Hello\n')
ws.write('Node.js\n')
ws.write('in\n')
ws.write('pillole\n')
ws.end('Nothing more to write!')
```

In questo caso l'output sarà il seguente:

```
Write process finished!
 [
  'Hello\n',
  'Node.js\n',
  'in\n',
  'pillole\n',
  'Nothing more to write!'
]
```

Ciò consentirà solo la scrittura di stringhe o `Buffers` nello stream, il tentativo di passare qualsiasi altro valore JavaScript comporterà un errore:

```javascript
import {  Writable  } from 'node:stream'

const createWriteStream = (data) => {
  return new Writable({
    decodeStrings: false,
    write (chunk, enc, next) {
      data.push(chunk)
      next()
    }
  })
}

const data = []
const ws = createWriteStream(data)
ws.on('finish', () => { 
  console.log('Write process finished!\n', data) 
})

ws.write('Hello\n')
ws.write('Node.js\n')
ws.write(1) // questo causerà un errore
ws.write('pillole\n')
ws.end('Nothing more to write!')
```

Il codice sopra comporterebbe un errore, causando l'arresto anomalo del processo perché stiamo tentando di scrivere un valore JavaScript che non è una stringa in uno stream binario:

```
node:internal/streams/writable:322
      throw new ERR_INVALID_ARG_TYPE(
      ^
TypeError [ERR_INVALID_ARG_TYPE]: The "chunk" argument must be of type string or an instance of Buffer or Uint8Array. Received type number (1)
```

Se vogliamo supportare le stringhe e qualsiasi altro valore JavaScript, possiamo invece impostare `objectMode` su `true` per creare uno stream scrivibile in modalità oggetto:

```javascript
import {  Writable  } from 'node:stream'

const createWriteStream = (data) => {
  return new Writable({
    objectMode: true,
    write (chunk, enc, next) {
      data.push(chunk)
      next()
    }
  })
}

const data = []
const ws = createWriteStream(data)
ws.on('finish', () => { 
  console.log('Write process finished!\n', data) 
})

ws.write('Hello\n')
ws.write('Node.js\n')
ws.write(1)
ws.write('pillole\n')
ws.end('Nothing more to write!')
```

Creando uno stream in modalità oggetto, la scrittura del numero `1` nello stream non causerà più un errore:

```
Write process finished!
 [
  'Hello\n',
  'Node.js\n',
  1,
  'pillole\n',
  'Nothing more to write!'
]
```

Gli streams scrivibili in genere sarebbero streams binari. Tuttavia, in alcuni casi gli streams leggibili e scrivibili in modalità oggetto possono essere utili. Nei prossimi paragrafi esamineremo i restanti tipi di stream.

#### Stream leggibili e scrivibili

Oltre ai costruttori di stream `Readable` e `Writable`, ci sono altri tre costruttori di streams di base che hanno interfacce sia leggibili che scrivibili:

- Duplex
- Transform
- PassThrough

Esploreremo l'utilizzo di tutti e tre, ma creeremo solo lo stream utente più comune: lo stream `Transform`.

##### Duplex

Uno stream duplex è un ibrido di uno stream leggibile e uno stream scrivibile. Un'applicazione connessa ad uno stream duplex può sia leggere che scrivere. L'esempio più comune di uno stream duplex è `net.Socket`. In uno stream di questo tipo, le parti di lettura e scrittura sono indipendenti ed hanno i propri buffer.

![](./img/ch-6/07.png)

Il prototipo del costruttore `Duplex` eredita dal costruttore `Readable` ma combina anche funzionalità dal costruttore `Writable`.

Con uno stream `Duplex`, vengono implementati entrambi i metodi di lettura e scrittura, ma non deve esserci una relazione casuale tra di loro. In questo, solo perché qualcosa è scritto in uno stream `Duplex` non significa necessariamente che comporterà una modifica a ciò che può essere letto dallo stream, anche se potrebbe. Un esempio concreto aiuterà a renderlo chiaro, un socket di rete TCP è un ottimo esempio di stream `Duplex`:

```javascript
import net from 'node:net'

net.createServer((socket) => {
  const interval = setInterval(() => {
    socket.write('beat')
  }, 1000)

  socket.on('data', (data) => {
    socket.write(data.toString().toUpperCase())
  })
  
  socket.on('end', () => { clearInterval(interval) })
}).listen(3000)
```

La funzione `net.createServer` accetta una funzione `listener` che viene chiamata ogni volta che un client si connette al server. Alla funzione `listener` viene passata un'istanza di stream `Duplex` che abbiamo chiamato `socket`. Ogni secondo viene chiamato `socket.write('beat')`, questo è il primo posto in cui viene utilizzato il lato scrivibile dello stream. Lo stream viene anche ascoltato per gli eventi `data` e l'evento `end`, in questi casi stiamo interagendo con il lato leggibile dello stream `Duplex`. All'interno del listener di eventi dati scriviamo anche nello stream inviando indietro i dati in arrivo dopo averli trasformati in lettere maiuscole. L'evento end è utile per pulire le risorse o le operazioni in corso dopo che un client si è disconnesso. Nel nostro caso lo usiamo per cancellare l'intervallo di un secondo.

Per interagire con il nostro server, creeremo anche un piccolo client. Anche il socket client è uno stream `Duplex`:

```javascript
import net from 'node:net'
const socket = net.connect(3000)

socket.on('data', (data) => {
  console.log('got data:', data.toString())
})

socket.write('hello')

setTimeout(() => {
  socket.write('all done')
  setTimeout(() => {
    socket.end()
  }, 250)
}, 3250)
```

Lo scopo di questo esempio non è comprendere il modulo `net` nella sua interezza, ma capire che espone un'astrazione API comune, uno stream `Duplex` e vedere come funziona l'interazione con uno stream `Duplex`.

##### Transform

Uno stream `Transform` è un ibrido speciale, in cui la parte leggibile è collegata in qualche modo alla parte scrivibile. Un esempio comune potrebbe essere uno stream `crypto`. In questo caso, l'applicazione scrive i dati semplici nello stream e legge i dati crittografati dallo stesso flusso.

![](./img/ch-6/08.png)

Il costruttore `Transform` eredita dal costruttore `Duplex`. Gli streams di trasformazione sono streams duplex con un vincolo aggiuntivo applicato per imporre una relazione causale tra le interfacce di lettura e scrittura. Un buon esempio è la compressione:

```javascript
import {  createGzip  } from 'node:zlib'
const transform = createGzip()

transform.on('data', (data) => {
  console.log('gzip data', data.toString('base64'))
})

transform.write('first')
setTimeout(() => {
  transform.end('second')
}, 500)
```

Quando i dati vengono scritti nell'istanza dello stream `transform`, gli eventi `data` vengono emessi sul lato leggibile di tali dati in formato compresso. Prendiamo i buffer di dati in arrivo e li convertiamo in stringhe, utilizzando le codifiche `BASE64`. Ciò si traduce nel seguente output:

```
gzip data H4sIAAAAAAAAEw==
gzip data S8ssKi4pTk3Oz0sBAP/7ZB0LAAAA
```

Il modo in cui i streams `Transform` creano questa relazione causale è attraverso il modo in cui viene creato uno stream di trasformazione. Invece di fornire funzioni `read` e `write`, un'opzione `transform` viene passata al costruttore `Transform`:

```javascript
import {  Transform  } from 'node:stream'
import {  scrypt  } from 'node:crypto'

const createTransformStream = () => {
  return new Transform({
    decodeStrings: false,
    encoding: 'hex',
    transform (chunk, enc, next) {
      scrypt(chunk, 'a-salt', 32, (err, key) => {
        if (err) {
          next(err)
          return
        }
        next(null, key)
      })
    }
  })
}

const transform = createTransformStream()
transform.on('data', (data) => {
  console.log('data:', data)
})

transform.write('Hello\n')
transform.write('Node.js\n')
transform.write('in\n')
transform.write('pillole\n')
transform.end('Nothing more to write!')
```

La funzione `transform` ha la stessa firma della funzione di `write` passata agli streams scrivibili. Accetta `chunk`, `enc` e la funzione `next`. Tuttavia, nella funzione `transform` la funzione `next` può essere passato un secondo argomento che dovrebbe essere il risultato dell'applicazione di qualche tipo di operazione di trasformazione al `chunk` in arrivo.

Nel nostro caso abbiamo utilizzato il metodo `crypto.scrypt` basato su callback asincrono, poiché sempre il focus chiave qui è sull'implementazione degli streams.

La callback `crypto.scrypt` viene chiamata una volta che una chiave è derivata dagli input, o può essere chiamato se si è verificato un errore. In caso di errore passiamo l'oggetto `error` alla callback `next`. In questo scenario, il nostro stream transform emetterebbe un evento di errore. In caso di successo chiamiamo `next(null, key)`. Il passaggio del primo argomento come `null` indica che non si è verificato alcun errore e il secondo argomento viene emesso come evento dati dal lato leggibile dello stream. Dopo aver istanziato il nostro stream e averlo assegnato alla costante `transform`, scriviamo alcuni payload nello stream e quindi disconnettiamo le stringhe esadecimali che riceviamo nel listener di eventi `data`. I dati vengono ricevuti come *esadecimale* perché abbiamo impostato l'*encoding* (parte delle opzioni dello stream `Readable`) per imporre che i dati emessi vengano decodificati in formato esadecimale. Questo produce il seguente risultato:

```
data: 7a4022fbdbc39b1deba3a26df9dd467c12990bb63af27d35a60afd3a8a635319
data: 9538394d1ac276d2a306dcabea64c2ad5f235466d9f5aed4e637daf5a9bbb355
data: 642c7df7a7071b80b322f401caf5b4658fc4569a13be3c5c8ff0cea20d9045b6
data: 4c9ef4b5c4b93e7a304d449cec7ff6e43c7413f3e0f703c7b0c90c2f18910cf0
data: 6c2edaba36cd1508793aa3b0566ceb9d31a7feab52564774535b6e593cb56bad
```

##### PassThrough

Il costruttore `PassThrough` eredita dal costruttore `Transform`. È essenzialmente uno stream di trasformazione in cui non viene applicata alcuna trasformazione. Per coloro che hanno familiarità con la programmazione funzionale, questo ha un'applicabilità simile alla funzione di identità (`(val) => val`), ovvero è un segnaposto utile quando è previsto uno stream di trasformazione ma non si desidera alcuna trasformazione.

#### Determinare la fine di uno stream

Come abbiamo discusso in precedenza, ci sono almeno quattro modi in cui uno stream può diventare potenzialmente non operativo:

- Evento **close**
- Evento **error**
- Evento **finish**
- Evento **end**

Spesso abbiamo bisogno di sapere quando uno stream è stato chiuso in modo che le risorse possano essere rilasciate, altrimenti potrebbero verificarsi perdite di memoria.
Invece di ascoltare tutti e quattro gli eventi, la funzione di utilità `stream.finished` fornisce un modo semplificato per farlo:

```javascript
import net from 'node:net'
import {  finished  } from 'node:stream'

net.createServer((socket) => {
  const interval = setInterval(() => {
    socket.write('beat')
  }, 1000)

  socket.on('data', (data) => {
    socket.write(data.toString().toUpperCase())
  })
  
  finished(socket, (err) => {
    if (err) {
      console.error('Socket Error', err)
    }
    clearInterval(interval)
  })
}).listen(3000)
```

Prendendo l'esempio mostrato in precedenza, abbiamo sostituito il listener di eventi **end** con una chiamata alla funzione **finished**. Lo stream (socket) viene passato a **finished** come primo argomento e il secondo argomento è una callback per quando lo stream termina per qualsiasi motivo. Il primo argomento della callback è un potenziale oggetto di errore. Se lo stream propagasse un evento **error**, la callback verrebbe chiamato con l'oggetto **error** emesso da quell'evento. Questo è un modo molto più sicuro per rilevare quando uno stream finisce e dovrebbe essere una pratica standard, poiché copre ogni eventualità.

### Piping Streams

In molti casi, gli stream sono ancora più utili se collegati tra loro. Per quanto ovvio possa sembrare, questo si chiama "piping". Puoi connettere uno stream leggibile a un altro stream scrivibile/duplex o uno stream di tipo Transform utilizzando il metodo `pipe()` dello stream leggibile.

![](./img/ch-6/09.png)

Ora possiamo mettere insieme tutto ciò che abbiamo imparato e scoprire come utilizzare un'astrazione concisa ma potente: il piping. Il piping è disponibile nelle shell della riga di comando da decenni, ad esempio ecco un comando Bash comune:

```
cat some-file | grep find-something
```

L'operatore pipe (`|`) ordina alla console di leggere il flusso di output proveniente dal comando di sinistra (`cat some-file`) e di scrivere quei dati sul comando di destra (`grep find-something`). Il concetto è lo stesso in Node, ma viene utilizzato il metodo pipe.

Adattiamo il server client TCP dall'esempio fatto in precedenza per utilizzare il metodo pipe. Ecco il server client di prima:

```javascript
import net from 'node:net'
const socket = net.connect(3000)

socket.on('data', (data) => {
  console.log('got data:', data.toString())
})

socket.write('hello')
setTimeout(() => {
  socket.write('all done')
  setTimeout(() => {
    socket.end()
  }, 250)
}, 3250)
```

Sostituiamo l'evento `data` con una pipe.

```javascript
import net from 'node:net'
const socket = net.connect(3000)

socket.pipe(process.stdout)

socket.write('hello')
setTimeout(() => {
  socket.write('all done')
  setTimeout(() => {
    socket.end()
  }, 250)
}, 3250)
```

L'avvio del server di esempio mostrato nel paragrafo precedente e l'esecuzione del client modificato produce quanto segue:

```
HELLObeatbeatbeatALL DONE
```

L'oggetto `process` verrà esplorato in dettaglio nei prossimi capitoli, ma per comprendere il codice è importante sapere che `process.stdout` è uno stream `Writable`. Qualsiasi cosa scritta in `process.stdout` verrà stampata come output del processo. Nota che non ci sono newline, questo perché prima usavamo `console.log`, che aggiunge un newline ogni volta che viene chiamato.

Il metodo pipe esiste sui flussi `Readable` (il socket di richiamo è un'istanza di flusso `Duplex` e che `Duplex` eredita da `Readable`) e viene passato a un flusso scrivibile (o un flusso con funzionalità scrivibili). Internamente, il metodo `pipe` imposta un listener `data` sullo stream leggibile e scrive automaticamente nel flusso scrivibile non appena i dati diventano disponibili.

Poiché **pipe** restituisce il flusso passato ad essa, è possibile chiamare insieme pipe: `streamA.pipe(streamB).pipe(streamC)`. Questa è una pratica comunemente osservata, ma è anche una cattiva pratica creare pipeline in questo modo. Se uno stream nel mezzo non riesce o si chiude per qualsiasi motivo, gli altri stream nella pipeline non si chiuderanno automaticamente. Ciò può creare gravi perdite di memoria e altri bug. Il modo corretto per reindirizzare più flussi è utilizzare la funzione di utilità `stream.pipeline`.

Combiniamo lo stream `Transform` che abbiamo creato nel paragrafo _"Stream leggibili e scrivibili"_ e il server TCP così come lo abbiamo modificato nel paragrafo _"Determinare la fine di uno stream"_ per creare una pipeline di stream:

```javascript
import net from 'node:net'
import {  Transform, pipeline  } from 'node:stream'
import {  scrypt  } from 'node:crypto'

const createTransformStream = () => {
  return new Transform({
    decodeStrings: false,
    encoding: 'hex',
    transform (chunk, enc, next) {
      scrypt(chunk, 'a-salt', 32, (err, key) => {
        if (err) {
          next(err)
          return
          }
        next(null, key)
      })
    }
  })
}

net.createServer((socket) => {
  const transform = createTransformStream()
  const interval = setInterval(() => {
    socket.write('beat')
  }, 1000)
  
  pipeline(socket, transform, socket, (err) => {
    if (err) {
      console.error('there was a socket error', err)
    }
    clearInterval(interval)
  })
}).listen(3000)
```

Se avviamo sia il server TCP modificato che il client TCP modificato, questo porterà al seguente risultato:

```
eb7ee7467667aeaa343ce22b58ead0a2cb4f640682c04746bfe5f2802a0908ccbeatbeatbeat3cca2402bf1973c8a30955e37b8656c104641db9e3bb09f823ab7b85919db4bc
```

I primi 64 caratteri sono la rappresentazione esadecimale di una chiave derivata dalla stringa `"hello"` che il processo del nodo client ha 
scritto nel flusso `Duplex` del socket TCP del client. Questo è stato emesso come evento di dati sul flusso Duplex del socket TCP nel processo
Node del server. È stato quindi scritto automaticamente nella nostra istanza dello stream `transofrm`, che ha derivato una chiave utilizzando 
`crypto.scrypt` all'interno dell'opzione di trasformazione passata al costruttore `Transform` nella nostra funzione `createTransformStream`. 
Il risultato è stato quindi passato come secondo argomento della callback `next`. Ciò ha quindi provocato l'emissione di un evento `data` 
dal flusso `transform` con la stringa esadecimale della chiave derivata. I dati sono stati quindi riscritti nel flusso del socket lato server. 
Di nuovo nel processo Node client, questi dati in entrata sono stati emessi come evento `data` dallo stream socket lato client e scritti 
automaticamente nel flusso scrivibile `process.stdout` dal processo Node client. I successivi 12 caratteri sono i tre battiti scritti a 
intervalli di un secondo nel server. I 64 caratteri finali sono la rappresentazione esadecimale della chiave derivata della stringa "tutto fatto" 
scritta nel socket lato client. Da lì quel payload passa attraverso lo stesso identico processo del primo payload `"hello"`.

Il comando **pipeline** chiamerà pipe su ogni flusso passato ad esso e consentirà di passare una funzione come funzione finale. Nota come abbiamo 
rimosso il metodo di utilità **finished**. Questo perché la funzione finale passata alla funzione **pipeline** verrà chiamata se uno qualsiasi dei 
flussi nella **pipeline** si chiude o non riesce per qualsiasi motivo.
