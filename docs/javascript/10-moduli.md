---
sidebar_position: 10
---

# I moduli

Agli albori del Web, i siti Web erano costituiti principalmente da HTML e CSS. Se del JavaScript veniva caricato in una pagina, di solito era sotto forma di piccoli frammenti che fornivano effetti e interattività. Di conseguenza, i programmi JavaScript venivano spesso scritti interamente in un file e caricati in un scripttag. Uno sviluppatore potrebbe suddividere il codice JavaScript in più file, ma tutte le variabili e le funzioni verrebbero comunque aggiunte all'ambito globale.

Ma poiché i siti Web si sono evoluti con l'avvento di framework come Angular, React e Vue e con le aziende che creano applicazioni Web avanzate anziché applicazioni desktop, JavaScript ora svolge un ruolo importante nel browser. Di conseguenza, è molto più necessario utilizzare codice di terze parti per attività comuni, suddividere il codice in file modulari ed evitare di inquinare lo spazio dei nomi globale.

La specifica [ECMAScript 2015](https://www.ecma-international.org/wp-content/uploads/ECMA-262_6th_edition_june_2015.pdf) ha introdotto i moduli nel linguaggio JavaScript, che ha consentito l'uso di istruzioni importe export. In questo tutorial imparerai cos'è un modulo JavaScript e come utilizzare `import` ed `export` nel tuo codice.

## La programmazione modulare

Prima che il concetto di moduli apparisse in JavaScript, quando uno sviluppatore voleva organizzare il proprio codice in segmenti, creava più file e li collegava come script separati. Per dimostrarlo, crea un file di esempio `index.html` e due file JavaScript `functions.js` e `script.js`.

Il file `index.html` visualizzerà la somma, la differenza, il prodotto e il quoziente di due numeri e si collegherà ai due file JavaScript nei script tag. Apri `index.html` in un editor di testo e aggiungi il seguente codice:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>JavaScript Modules</title>
  </head>

  <body>
    <h1>Answers</h1>
    <h2><strong id="x"></strong> and <strong id="y"></strong></h2>

    <h3>Addition</h3>
    <p id="addition"></p>

    <h3>Subtraction</h3>
    <p id="subtraction"></p>

    <h3>Multiplication</h3>
    <p id="multiplication"></p>

    <h3>Division</h3>
    <p id="division"></p>

    <script src="functions.js"></script>
    <script src="script.js"></script>
  </body>
</html>
```

Questo HTML visualizzerà il valore delle variabili `x` e `y` in un tag `h2` e il valore delle operazioni su tali variabili nei seguenti elementi `p`. Gli idattributi degli elementi sono impostati per la manipolazione del DOM, che avverrà nel file `script.js`; questo file imposterà anche i valori di `x` e `y`.

Il file `functions.js` conterrà le funzioni matematiche che verranno utilizzate nel secondo script. Apri il file `functions.js` e aggiungi quanto segue:

```javascript
function sum(x, y) {
  return x + y
}

function difference(x, y) {
  return x - y
}

function product(x, y) {
  return x * y
}

function quotient(x, y) {
  return x / y
}
```

Infine, il file `script.js` determinerà i valori di `x` e `y`, applicherà loro le funzioni e visualizzerà il risultato:

```javascript
const x = 10
const y = 5

document.getElementById('x').textContent = x
document.getElementById('y').textContent = y

document.getElementById('addition').textContent = sum(x, y)
document.getElementById('subtraction').textContent = difference(x, y)
document.getElementById('multiplication').textContent = product(x, y)
document.getElementById('division').textContent = quotient(x, y)
```

Dopo aver salvato i file apri il file `index.html`. Dovresti visualizzare qualcosa del genere:

![](./img/10.png)

Per i siti Web con alcuni piccoli script, questo è un modo efficace per dividere il codice. Tuttavia, ci sono alcuni problemi associati a questo approccio, tra cui:

- **Inquinare lo spazio dei nomi globale**: tutte le variabili che hai creato nei tuoi script— sum, difference, ecc. ora esistono sull'oggetto `window`. Se si tentasse di utilizzare un'altra variabile richiamata sumin un altro file, diventerebbe difficile sapere quale valore verrebbe utilizzato in qualsiasi punto degli script, poiché utilizzerebbero tutti la stessa variabile `window.sum`. L'unico modo in cui una variabile poteva essere privata era inserendola all'interno di un ambito di funzione (IIFE). Potrebbe anche esserci un conflitto tra un `id` nel DOM denominato `x` e `var x`.

- **Gestione delle dipendenze**: gli script dovrebbero essere caricati in ordine dall'alto verso il basso per garantire la disponibilità delle variabili corrette. Salvare gli script come file diversi dà l'illusione della separazione, ma è essenzialmente come avere un singolo `<script>` inline nella pagina del browser.

Prima che ES6 aggiungesse moduli nativi al linguaggio JavaScript, la community ha tentato di trovare diverse soluzioni. Le prime soluzioni sono state scritte in JavaScript vanilla, come la scrittura di tutto il codice negli oggetti o nelle funzioni immediatamente richiamate (IIFE) e il loro posizionamento su un singolo oggetto nello spazio dei nomi globale. Questo è stato un miglioramento rispetto all'approccio con più script, ma presentava ancora gli stessi problemi di inserire almeno un oggetto nello spazio dei nomi globale e non ha reso più semplice il problema della condivisione coerente del codice tra terze parti.

Successivamente, sono emerse alcune soluzioni di moduli: **CommonJS**, un approccio sincrono implementato in Node.js.

L'avvento di queste soluzioni ha reso più facile per gli sviluppatori condividere e riutilizzare il codice sotto forma di pacchetti, moduli che possono essere distribuiti e condivisi, come quelli che si trovano su npm. Tuttavia, poiché esistevano molte soluzioni e nessuna era nativa di JavaScript, è stato necessario implementare strumenti come Babel, Webpack o Browserify per utilizzare i moduli nei browser.

A causa dei numerosi problemi con l'approccio a più file e la complessità delle soluzioni proposte, gli sviluppatori erano interessati a portare l'approccio di programmazione modulare al linguaggio JavaScript. Per questo motivo, **ECMAScript 2015** supporta l'uso di moduli JavaScript.

Un modulo è un pacchetto di codice che funge da interfaccia per fornire funzionalità da utilizzare per altri moduli, oltre a poter fare affidamento sulla funzionalità di altri moduli. Un modulo esporta per fornire codice e importa per utilizzare altro codice. I moduli sono utili perché consentono agli sviluppatori di riutilizzare il codice, forniscono un'interfaccia stabile e coerente che molti sviluppatori possono utilizzare e non inquinano lo spazio dei nomi globale.

I moduli (a volte indicati come moduli _ECMAScript_ o moduli _ES_) sono ora disponibili in modo nativo in JavaScript e nel resto di questo modulo esplorerai come utilizzarli e implementarli nel tuo codice.

## I moduli nativi in JavaScript

I moduli in JavaScript utilizzano le parole chiave `import` ed `export`:

- `import`: Utilizzato per leggere il codice esportato da un altro modulo.
- `export`: Utilizzato per fornire codice ad altri moduli.

Per dimostrare come usarlo, aggiorna il tuo file `functions.js` in modo che sia un modulo ed esporta le funzioni. Aggiungerai `export` davanti a ciascuna funzione, che li renderà disponibili a qualsiasi altro modulo.

Di conseguenza il nostro file avrà ora il seguente aspetto:

```javascript
export function sum(x, y) {
  return x + y
}

export function difference(x, y) {
  return x - y
}

export function product(x, y) {
  return x * y
}

export function quotient(x, y) {
  return x / y
}
```

Ora, in `script.js`, utilizzerai importper recuperare il codice dal modulo `functions.js` all'inizio del file.

```javascript
import { sum, difference, product, quotient } from './functions.js'

const x = 10
const y = 5

document.getElementById('x').textContent = x
document.getElementById('y').textContent = y

document.getElementById('addition').textContent = sum(x, y)
document.getElementById('subtraction').textContent = difference(x, y)
document.getElementById('multiplication').textContent = product(x, y)
document.getElementById('division').textContent = quotient(x, y)
```

Si noti che le singole funzioni vengono importate denominandole tra parentesi graffe.

Per assicurarti che questo codice venga caricato come modulo e non come uno script normale, aggiungi `type="module"` ai tag `script` in `index.html`. Qualsiasi codice che utilizza `import` o `export` deve utilizzare questo attributo:

```html
<script type="module" src="functions.js"></script>
<script type="module" src="script.js"></script>
```

A questo punto potrai ricaricare la pagina con gli aggiornamenti e il sito utilizzerà i moduli. Il supporto dei browser è molto elevato, ma è disponibile [caniuse](https://caniuse.com/) per verificare quali browser lo supportano. Tieni presente che se stai visualizzando il file come collegamento diretto a un file locale, riscontrerai questo errore:

```
Access to script at 'file:///Users/your_file_path/script.js' from origin 'null' has been blocked by CORS policy: Cross-origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, chrome-untrusted, https.
```

A causa della politica CORS, i moduli devono essere utilizzati in un ambiente server, che è possibile configurare localmente con http-server o su Internet con un provider di hosting.

:::warning I moduli richiedono un server HTTP
Non puoi aprire un file HTML con moduli ES6 direttamente dal file system (`file://`) — il browser blocca le richieste per motivi di sicurezza CORS. Usa sempre un server locale:
- **VS Code**: estensione _Live Server_
- **Node.js**: `npx serve .`
- **Python**: `python3 -m http.server 3000`
:::

I moduli sono diversi dai normali script in alcuni modi:

- I moduli non aggiungono nulla all'ambito globale `window`.
- I moduli sono sempre in modalità `strict`.
- Il caricamento dello stesso modulo due volte nello stesso file non avrà alcun effetto, poiché i moduli vengono eseguiti solo una volta.
- I moduli richiedono un ambiente server.
- I moduli sono ancora spesso utilizzati insieme ad un bundler come Webpack per un maggiore supporto del browser e funzionalità aggiuntive, ma sono anche disponibili per l'uso direttamente nei browser.

Successivamente, vedremo altri esempi di utilizzo di `import` ed `export`.

## Export nominale

Come dimostrato in precedenza, l'utilizzo della sintassi `export` consentirà di importare singolarmente i valori che sono stati esportati con il loro nome. Ad esempio, consideriamo questa versione semplificata di `functions.js`:

```javascript
export function sum() {}
export function difference() {}
```

Questo ci consentirebbe di importare `sum` e `difference` utilizzando i loro nomi e le parentesi graffe `{}`:

```javascript
import { sum, difference } from './functions.js'
```

È anche possibile utilizzare un alias per rinominare la funzione. Potresti farlo per evitare conflitti di denominazione all'interno dello stesso modulo. In questo esempio, `sum` verrà rinominato in `add` e `difference` verrà rinominato in `subtract`.

```javascript
import {
  sum as add,
  difference as subtract
} from './functions.js'

add(1, 2) // 3
```

Chiamare `add()` qui produrrà il risultato della funzione `sum()`.

Usando la sintassi `*`, puoi importare il contenuto dell'intero modulo in un oggetto. In questo caso, `sum` e `difference` diventeranno metodi sull'oggetto `mathFunctions`.

```javascript
import * as mathFunctions from './functions.js'

mathFunctions.sum(1, 2) // 3
mathFunctions.difference(10, 3) // 7
```

È possibile esportare valori primitivi, espressioni e definizioni di funzioni, funzioni asincrone, classi e classi istanziate, purché dispongano di un identificatore:

```javascript
// Primitive values
export const number = 100
export const string = 'string'
export const undef = undefined
export const empty = null
export const obj = { name: 'Homer' }
export const array = ['Bart', 'Lisa', 'Maggie']

// Function expression
export const sum = (x, y) => x + y

// Function definition
export function difference(x, y) {
  return x - y
}

// Asynchronous function
export async function getBooks() {}

// Class
export class Book {
  constructor(name, author) {
    this.name = name
    this.author = author
  }
}

// Instantiated class
export const book = new Book('Lord of the Rings', 'J. R. R. Tolkien')
```

Tutte queste esportazioni possono essere importate correttamente. L'altro tipo di esportazione che esplorerai nella sezione successiva è noto come esportazione predefinita.

## Export predefinito (default)

Negli esempi precedenti, abbiamo esportato più esportazioni nominali e le abbiamo importate singolarmente o come un oggetto con ciascuna esportazione come metodo sull'oggetto. I moduli possono anche contenere un'esportazione predefinita, utilizzando la parola chiave `default`. Un'esportazione predefinita non verrà importata con parentesi graffe, ma verrà importata direttamente in un identificatore denominato.

Ad esempio, prendi i seguenti contenuti per il file `functions.js`:

```javascript
export default function sum(x, y) {
  return x + y
}
```

Nel file `script.js` ora possiamo importarla nel seguente modo:

```javascript
import sum from './functions.js'

sum(1, 2) // 3
```

Questo può essere pericoloso, poiché non ci sono restrizioni sul nome che puoi dare all'export predefinito in fase di import. In questo esempio, la funzione predefinita viene importata come `differencese` ma in realtà è sempre la funzione `sum`:

```javascript
import difference from './functions.js'

difference(1, 2) // 3
```

Per questo motivo, si preferisce spesso utilizzare le esportazioni nominali. A differenza delle esportazioni nominale, le esportazioni predefinite non richiedono un identificatore: è possibile utilizzare un valore primitivo di per sé o una funzione anonima come esportazione predefinita. Di seguito è riportato un esempio di un oggetto utilizzato come esportazione predefinita:

```javascript
export default {
  name: 'Lord of the Rings',
  author: 'J. R. R. Tolkien',
}
```

E importare questo valore nel seguente modo:

```javascript
import book from './functions.js'
```

Allo stesso modo, l'esempio seguente mostra l'esportazione di una funzione freccia anonima come esportazione predefinita:

```javascript
export default () => 'This function is anonymous'
```

E qeusta può essere importata nel seguente modo:

```javascript
import anonymousFunction from './functions.js'
```

Le esportazioni nominali e le esportazioni predefinite possono essere utilizzate insieme, come in questo modulo che esporta due valori denominati e un valore predefinito:

```javascript
export const length = 10
export const width = 5

export default function perimeter(x, y) {
  return 2 * (x + y)
}
```

In questo modo possiamo importare l'export predefinito e quelli nominali nel seguente modo:

```javascript
import calculatePerimeter, { length, width } from './functions.js'

calculatePerimeter(length, width) // 30
```

Le pratiche di progettazione della programmazione modulare consentono di separare il codice in singoli componenti che possono contribuire a rendere il codice riutilizzabile e coerente, proteggendo al contempo lo spazio dei nomi globale. Un'interfaccia del modulo può essere implementata in JavaScript nativo con le parole chiave `import` ed `export`.

## Esercizi

### Esercizio 1 — Modulo utilità

Crea due file. In `utils.js` esporta funzioni di formattazione con named export. In `app.js` importa solo quelle che ti servono.

```javascript
// utils.js
export function formattaEuro(valore) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(valore)
}

export function formattaData(dateString) {
  return new Date(dateString).toLocaleDateString('it-IT')
}

export function calcolaPercentuale(valore, totale) {
  return ((valore / totale) * 100).toFixed(1) + '%'
}
```

```javascript
// app.js
import { formattaEuro, calcolaPercentuale } from './utils.js'

const fatturato = 125430.5
const budget = 200000

console.log(formattaEuro(fatturato))                         // €125.430,50
console.log(calcolaPercentuale(fatturato, budget))           // 62.7%
```

### Esercizio 2 — Modulo dati con default export

Crea `dati.js` con un array di prodotti come default export. Crea `catalogo.js` che lo importa, lo filtra e riesporta.

```javascript
// dati.js
const prodotti = [
  { id: 1, nome: 'Laptop Pro', prezzo: 1299, disponibile: true },
  { id: 2, nome: 'Mouse', prezzo: 29, disponibile: false },
  { id: 3, nome: 'Monitor 4K', prezzo: 449, disponibile: true },
  { id: 4, nome: 'Tastiera', prezzo: 89, disponibile: true }
]

export default prodotti
```

```javascript
// catalogo.js
import prodotti from './dati.js'

export const prodottiDisponibili = prodotti.filter(p => p.disponibile)
export const prezzoMedio = prodottiDisponibili.reduce((s, p) => s + p.prezzo, 0) / prodottiDisponibili.length
```

```javascript
// main.js
import prodotti from './dati.js'
import { prodottiDisponibili, prezzoMedio } from './catalogo.js'

console.log(`Totale prodotti: ${prodotti.length}`)
console.log(`Disponibili: ${prodottiDisponibili.length}`)
console.log(`Prezzo medio disponibili: €${prezzoMedio.toFixed(2)}`)
```

### Esercizio 3 — Barrel file (re-export)

Crea una struttura con più moduli e un file `index.js` che li ri-esporta tutti, semplificando gli import nel codice finale.

```javascript
// matematica.js
export const somma = (a, b) => a + b
export const sottrai = (a, b) => a - b
export const moltiplica = (a, b) => a * b
export const dividi = (a, b) => b !== 0 ? a / b : null
```

```javascript
// statistica.js
export const media = (...valori) => valori.reduce((s, v) => s + v, 0) / valori.length
export const massimo = (...valori) => Math.max(...valori)
export const minimo = (...valori) => Math.min(...valori)
```

```javascript
// index.js — barrel file
export * from './matematica.js'
export * from './statistica.js'
```

```javascript
// app.js — importa tutto da un solo punto
import { somma, moltiplica, media, massimo } from './index.js'

const dati = [12, 45, 7, 89, 34]
console.log(somma(10, 20))        // 30
console.log(moltiplica(6, 7))     // 42
console.log(media(...dati))       // 37.4
console.log(massimo(...dati))     // 89
```
