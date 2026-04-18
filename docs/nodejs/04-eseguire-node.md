---
sidebar_position: 4
---

# Eseguire Node.js

Node.js fornisce una shell virtuale chiamata *REPL*  (_Read Eval Print Loop_), che consente di testare facilmente piccoli frammenti di codice in Node.js. Una volta avviata, questa shell interattiva esegue ciclicamente quattro fasi:

1. *Read*: legge il codice dato in input dall'utente.
2. *Eval*: valuta e valida l'input.
3. *Print*: stampa a video il risultato del codice dato in input.
4. *Loop*: resta in attesa di un nuovo input da parte dell'utente.

Per avviare shell interattiva di REPL basta digitare dal terminale il comando `node`:

```
$ node
Welcome to Node.js v14.16.1.
Type ".help" for more information.
>
```

Una volta avviata viene stampato a video un messaggio di benvenuto seguito dal carattere `>`. In questo stato la shell rimane 
in attesa che venga digitato del codice. Potete iniziare subito con un esempio molto semplice per esempio `1 + 1`:

```
$ node
Welcome to Node.js v14.16.1.
Type ".help" for more information.
> 1 + 1
2
>
```

o ancora potete dichiarare variabili ed effettuare alcune operazioni. Per esempio:

```
> const a = 10, b = 5
> a + b 
15
>
```

### Alcuni comandi speciali

Esistono alcuni comandi speciali nella shell virtuale REPL

| Comando  |  Descrizione  |
|----------|:-------------:|
| `.help` |  Stampa a video la lista di tutti i comandi |
| `.save <filename>` | Salva la sessione REPL corrente in un file |
| `.exit` | Esce dalla modalità REPL |
| `.break`| Quando si è in modalità multiriga basta digitare questo comando per interrompere l'immissione di nuovi caratteri |
| `.clear` | Reimposta il contesto REPL su un oggetto vuoto e cancella qualsiasi espressione su più righe in ingresso |
| `.load <filename>` | Carica la sessione REPL salvata precedentemente in un file |
| `TAB` (due volte) | Stampa a video la lista di tutti i moduli core di Node.js e JavaScript utilizzabili |
| Freccia Su/Giù | Naviga attraverso i comandi eseguiti in precedenza |
| `CTRL-C` |Interrompe il comando in esecuzione |
| `CTRL-C (due volte)` | Esce dalla modalità REPL |

### La modalità editor

Un comando interessante è `.editor`. Quando si digita questo comando si entra in una modalità particolare in cui è possibile creare script un po' più complessi:

```
> .editor
// Entering editor mode (Ctrl+D to finish, Ctrl+C to cancel)
function sayHello(name) {
  return `Hello, ${name}`
}

sayHello('Davide')

// CTRL + D
'Hello, Davide'
>
```

### Utilizzare i moduli core

Quando ci troviamo nella modalità REPL è possibile digitare due volte il tasto TAB per visualizzare l'elenco completo delle funzionalità JavaScript e dei moduli core che Node.js mette a disposizione:

![](./img/ch-4/01.png)

Facciamo un piccolo esempio. Creiamo una directory `examples` e al suo interno un file `hello.txt`, il cui contenuto è la stringa `Hello, World!`:

```
$ mkdir examples && cd examples
$ echo 'Hello, World!' > hello.txt
```

Ora entriamo in modalità REPL dalla directory appena creata e utilizziamo il modulo core di Node.js `fs` (che approfondiremo più avanti in questo libro) per leggere il contenuto di un file. Questo modulo espone una serie di metodi utili alla gestione del file system e uno di questi è il metodo `readFileSync`, a cui possiamo passare il path del file appena creato.

```
$ node
> fs.readFileSync('hello.txt', 'utf-8')
'Hello, World!\n'
```

### Valutazione dinamica del codice

Oltre alla modalità REPL, Node.js può valutare frammeti di codice direttamente dalla linea di comando. Anche questa metodologia è molto utile per creare piccoli frammenti di codice che utilizzano JavaScript o i moduli core di Node.js. Esistono due flag che possono essere utilizzati dalla linea di comando `-p` o `--print` che valuta un espressione e ne stampa il risultato, ed il flag `-e` o `--eval` che valuta solo l'espressione senza stampare a video il risultato ottenuto. Vediamo con dei piccoli esempi come funzionano:

```
$ node -p "10 + 5"
15
```

In questo primo esempio l'espressione viene prima valutata e poi viene stampato il risultato nella console `15`. Se invece utilizziamo solo il flag `-e`a video non comparirebbe nulla: 

```
$ node -e "10 + 5"
```

mentre se aggiungiamo di proposito un errore, l'interprete si accorge di quest'ultimo e stampa a video lo stack trace ottenuto valutando quel frammento di codice:

```
$ node -e "ciao + 5"
[eval]:1
ciao + 5
^

ReferenceError: ciao is not defined
  at [eval]:1:1
  at Script.runInThisContext (vm.js:122:20)
  at Object.runInThisContext (vm.js:329:38)
  at Object.<anonymous> ([eval]-wrapper:6:22)
  at Module._compile (internal/modules/cjs/loader.js:778:30)
  at evalScript (internal/bootstrap/node.js:590:27)
  at startup (internal/bootstrap/node.js:265:9)
  at bootstrapNodeJSCore (internal/bootstrap/node.js:623:3)
```

Anche in questo caso possiamo utilizzare i moduli core di Node.js esattamente come li abbiamo utilizzati nella shell virtuale REPL. Riprendendo l'esempio fatto in precedenza:

```
$ node -p "fs.readFileSync('hello.txt', 'utf-8')"
Hello, World!
```

### Il nostro primo script

La modalità REPL non è l'unico modo per scrivere ed eseguire codice in Node.js. La metodologia più utilizzata è sicuramente quella di creare un file `.js` e mandarlo in esecuzione dalla riga di comando con l'eseguibile `node`. Quindi aprite il vostro editor JavaScript preferito (come VS Code o Web Storm) e create un file `sum.js` il cui contenuto è il seguente: 

```
const a = 10, b = 5
console.log(`${a} + ${b} = ${a + b}`)
```

Ora salvate il file e dalla riga di comando digitate

```
$ node sum.js
```

Dovreste avere il seguente output:

```
10 + 5 = 15
```

#### Controllo della sintassi

È possibile effettuare il controllo della sintassi del nostro script senza eseguirlo. Questa opzione potrebbe sembrare inutile ma in realtà può essere utilizzata in diversi casi. Per esempio se il nostro script ha generato del codice in modo automatico e necessitiamo del controllo della sintassi. In alternativa i moderni editor JavaScript fanno più che bene lo stesso lavoro.

Per effettuare il controllo della sintassi di uno script Node.js basta utilizzare il flag `-c` o `--check` dalla riga di comando nel seguente modo

```
$ node --check sum.js
```

oppure

```
$ node -c sum.js
```

In questo caso il nostro script non contiene errori di sintassi quindi il comando non restituirà nessun output nella console. Se invece introduciamo un errore di sintassi nello script. Per esempio:


```
const a = 10, b = 5,,,, // c'è un errore di sintassi qui
console.log(`${a} + ${b} = ${a + b}`)
```

e rilanciamo uno dei comandi impartiti in precedenza, otterremo qualcosa del genere come output

```
$ node -c hello.js
/Users/davide/example/sum.js:1
(function (...) { const a = 10, b = 5,,,,
                                      ^

SyntaxError: Unexpected token ,
  at new Script (vm.js:83:7)
  at checkScriptSyntax (internal/bootstrap/node.js:620:5)
  at startup (internal/bootstrap/node.js:280:11)
  at bootstrapNodeJSCore (internal/bootstrap/node.js:623:3)
```

### Parametri dalla riga di comando

L'oggetto `process` è un oggetto globale a cui è possibile accedere in qualsiasi momento si voglia senza richiederlo. È uno dei pochi oggetti o proprietà globali forniti da Node.js (come `console` per esempio), ed è importante in quanto fornisce molte informazioni sia sul processo in esecuzione che sull'environment. Una proprietà che per esempio questo oggetto speciale mette a disposizione è `release`, la quale contiene alcune informazioni sulla release che si sta utilizzando, inclusi gli URL dei sorgenti:

```
$ node -p "process.release"
{
  name: 'node',
  lts: 'Fermium',
  sourceUrl: 'https://nodejs.org/download/release/v14.16.1/node-v14.16.1.tar.gz',
  headersUrl: 'https://nodejs.org/download/release/v14.16.1/node-v14.16.1-headers.tar.gz'
}
```

Un'altra proprietà interessante è `versions`. Questa proprietà è a sua volta un oggetto le cui proprietà elencano le versioni di tutte le dipendenze della versione che stiamo utilizzando. Per esempio la proprietà `v8` ci indica la versione di V8 utilizzata, la proprietà `uv` che si riferisce alla versione di _libuv_ utilizzata o la proprietà `node` che ci indica la versione di Node.js installata sul nostro sistema.

```
$ node -p "process.versions"
{
  node: '14.16.1',
  v8: '8.4.371.19-node.18',
  uv: '1.40.0',
  zlib: '1.2.11',
  brotli: '1.0.9',
  ares: '1.16.1',
  modules: '83',
  nghttp2: '1.41.0',
  napi: '7',
  llhttp: '2.1.3',
  openssl: '1.1.1k',
  cldr: '37.0',
  icu: '67.1',
  tz: '2020a',
  unicode: '13.0'
}
```

Esiste una proprietà molto utile che ci consente di accedere agli argomenti passati dalla riga di comando, questa proprietà si chiama `argv`. Questa proprietà non è altro che un array in cui alla prima posizione troviamo sempre l'eseguibile node che stiamo utilizzando

```
$ node -p "process.argv"
[ '/Users/davide/.nvm/versions/node/v14.16.1/bin/node' ]
```

Ora immaginate di avere un file `sumArgs.js`, con il seguente contenuto:

```javascript
console.log(process.argv)
```

ed eseguitelo dalla riga di comando con il comando `node`:

```
$ node -w sumArgs.js
```

L'output che otterrete sarà qualcosa di questo tipo:

```
[
  '/Users/davide/.nvm/versions/node/v14.16.1/bin/node',
  '/Users/davide/example/sumArgs.js'
]
```

Rispetto all'esempio precedente, dove abbiamo usato il flag `-p` per stampare il contenuto della variabile `argv`, è cambiato qualcosa. Nella seconda posizione dell'array troviamo il path del file JavaScript che stiamo eseguendo. Tutti gli altri elementi rimanenti saranno eventuali argomenti della riga di comando aggiuntivi. Quindi ora che ci è chiaro il funzionamento di questa proprietà speciale dell'oggetto globale `process` proviamo a fare un altro esempio, aggiungendo un pizzico di complessità in più. Modifichiamo il file `sumArgs.js` affinché contenga il seguente codice:

```javascript
const args = process.argv.splice(2) // [1]
const sum = parseInt(args[0]) + parseInt(args[1]) // [2]

console.log(`${args[0]} + ${args[1]} = ${sum}`) // [3]
```

Queste poche linee di codice effettuano la somma di due numeri inseriti come argomenti dalla riga di comando. Commentiamo punto per punto quello che abbiamo fatto:

1. Utilizziamo la funzione `splice` per fare in modo che nell'array `args` contenga solo gli argomenti passati dalla riga di comando inseriti dopo il path del file JavaScript che vogliamo eseguire. Nel nostro caso `args` conterrà due elementi stringa `['10', '5']`.

2. Facciamo in modo che i due numeri dati in input siano due numeri interi e ne facciamo la somma. Il cast ad intero è necessario in quanto tutti gli argomenti passati dalla riga di comando di default sono stringhe.

3. Stampiamo a video il risultato utilizzando `console.log`.

Se non abbiamo commesso nessun errore nel nostro codice, eseguendo questo script dalla linea di comando otterremo il seguente risultato:

```
$ node sumArgs.js 10 5
10 + 5 = 15
```

#### Aggiungiamo qualche controllo

Cosa accade se anziché passare un numero come argomento passo una variabile non definita? Proviamo a vedere:

```
$ node sumArgs.js 10 ciao
10 + ciao = NaN
```

C'era da aspettarselo che il risultato non sarebbe stato quello atteso. O sbaglio? Come possiamo migliorare questo comportamento anomalo? Molto semplice. Aggiungiamo qualche controllo sulla correttezza degli argomenti passati in input al nostro script. 

> **_NOTA:_**: `NaN` è un simbolo di avvertimento indicante che il risultato di un'operazione (numerica) è stata eseguita su operandi non validi. `NaN` è l'acronimo di _"Not a Number"_. Discuteremo di questa tipologia di variabile più avanti nel libro.

Effettuiamo una piccola modifica al nostro file, in modo che contenga il seguente codice:

```javascript
const args = process.argv.splice(2)

function printErrorAndExit (arg) { [1]
  console.log(`Attention: "${arg}" is not a number!`) 
  process.exit(1)
}

if (isNaN(args[0])) { // [2]
  printErrorAndExit(args[0])
}

if (isNaN(args[1])) { // [2]
  printErrorAndExit(args[1])
}

const sum = parseInt(args[0]) + parseInt(args[1])
console.log(`${args[0]} + ${args[1]} = ${sum}`)
```

Vediamo cosa abbiamo aggiunto nel nostro codice affinché vengano passati solo numeri come argomenti dalla riga di comando:

- Dichiariamo una funzione il cui compito è quello di stampare a video un messaggio di errore e terminare il processo. Per terminare il processo utilizziamo una funzione dell'oggetto globale `process` di cui non abbiamo parlato in precedenza, ossia `exit`. Questa funzione ha il compito di terminare in modo sincrono il nostro processo con uno stato di uscita (nel nostro caso `1`).

- Utilizzando la funzione globale `isNaN` ci assicuriamo che i gli argomenti passati dalla riga di comando siano numeri. Nel caso in cui `args[0]` o `args[1]` non siano numeri, richiamiamo la funzione `printErrorAndExit` per fare in modo che il processo non prosegua ulteriormente.

> **_NOTA:_**: Lo [stato di uscita](https://en.wikipedia.org/wiki/Exit_status) di un processo nella programmazione di computer è un piccolo numero passato da un processo figlio (o chiamato) a un processo genitore (o chiamante) quando ha terminato di eseguire una procedura specifica o un'attività delegata.

#### Generalizziamo il comportamento

Proviamo a migliorare il comportamento del nostro piccolo sommatore di numeri rendendolo più generico. Per farlo dobbiamo apportare alcune piccole modifiche al codice affinché vengano rispettati i seguenti criteri:

- Devono essere dati in input due o più parametri. In caso contrario stampiamo un messaggio di errore e terminiamo l'esecuzione.

-  La funzione che stampa gli errori e termina l'esecuzione, dovrà stampare tutti gli errori che abbiamo riscontrato nei parametri e poi terminare l'esecuzione.

-  Il controllo di validità dei parametri, così come la somma, non deve avvenire su due elementi ma sugli `n` elementi passati in input.

-  Nel caso in cui si riscontra almeno un errore, stampare il risultato e terminare l'esecuzione. In caso contrario stampiamo la somma degli `n` numeri dati in input.

Proviamo ad analizzare uno alla volta i punti sopra elencati. La prima richiesta è quella di verificare se sono stati dati in input almeno due numeri. Fare questo controllo è veramente molto semplice. Basta verificare se l'array `args` contiene almeno due elementi. Per farlo controlliamo se la proprietà `length` è minore di `2` e, nel caso in cui lo è, stampiamo a video un messaggio di errore e terminiamo l'esecuzione:

```javascript
const args = process.argv.splice(2)

...

if (args.length < 2) {
  console.log('You must give at least two numbers')
  process.exit(1)
}
```

Risolto il primo punto vediamo come generalizzare la funzione `printErrorAndExit`, relativa al punto due, in modo che riceva un array di errori, anziché un singolo errore, e li stampi a video tutti prima di terminare l'esecuzione. Anche questa è una modifica abbastanza semplice. Basta ciclare tutti gli elementi dell'array ricevuto in input ed effettuare una stampa a video con `console.log`:

```javascript
function printErrorAndExit (errors) {
  console.log(`Attention! The following errors occurs:`)
  for (const error of errors) {
    console.log(`-> Element "${error}" is not a Number!`)
  }

  process.exit(1)
}
```

Passiamo ora al controllo di validità dei parametri passati in input. In questo caso effettueremo il controllo su tutti i parametri utilizzando un ciclo `for..of` e su ogni elemento effetturare il controllo della validità dell'input con `isNaN`. Nel caso in cui la funzione `isNaN` restituisce `true` allora salviamo l'elemento in un array denominato `errors`, altrimenti sommiamo il valore ad una variabile `sum` precedentemente inizializzata:

```javascript
const args = process.argv.splice(2)
const errors = []
let sum = 0

...

for (let arg of args) {
  if (isNaN(arg)) {
    errors.push(arg)
    continue
  }

  sum += parseInt(arg)
}
```

Ciclando tutti gli argomenti passati in input questo ciclo `for..of` controlla per ognuno di essi se è un elemento valido per poterne effettuare la somma. Nel caso in cui non lo è aggiunge l'elemento all'array `errors`. In caso contrario lo somma alla variabile `sum` inzializzata a `0` precedentemente. Quindi se non si verifica nessun errore, `sum` conterrà esattamente il risultato che vogliamo stampare a video. Nel caso in cui l'elemento `errors` contiene almeno un elemento allora dobbiamo richiamare la funzione `printErrorAndExit` che abbiamo modificato in precedenza e terminare l'esecuzione, altrimenti stampiamo a video la somma degli `n` numeri passati come parametri in input:

```
if (errors.length > 0) {
  printErrorAndExit(errors)
}

console.log(`The sum is ${sum}!`)
```

Ecco di seguito il risultato ottenuto

```javascript
const args = process.argv.splice(2)
const errors = []
let sum = 0

if (args.length < 2) {
  console.log('You must give at least two numbers')
  process.exit(1)
}

function printErrorAndExit (errors) {
  console.log(`Attention! The following errors occurs:`)
  for (const error of errors) {
    console.log(`-> Element "${error}" is not a Number!`)
  }

  process.exit(1)
}

for (let arg of args) {
  if (isNaN(arg)) {
    errors.push(arg)
    continue
  }

  sum += parseInt(arg)
}

if (errors.length > 0) {
  printErrorAndExit(errors)
}

console.log(`The sum is ${sum}!`)
```

Effettuando alcuni test basici possiamo vedere come si comporta il nostro generatore di numeri. Iniziamo mandandolo in esecuzione senza parametri:

```
$ node sumArgs.js
You must give at least two numbers
```

Se invece proviamo a passare cinque parametri di cui due errati:

```
$ node sumArgs4.js 1 due 3 quattro 5
Attention! The following errors occurs:
-> Element "due" is not a Number!
-> Element "quattro" is not a Number!
```

Mentre infine se inseriamo tutti parametri corretti:

```
$ node sumArgs.js 1 2 3 4 5
The sum is 15!
```