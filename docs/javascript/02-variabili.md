---
sidebar_position: 2
---

# Variabili

In JavaScript una variabile può essere dichiarata con la parola chiave *`var`*. Quando dichiariamo una variabile utilizzando questa parola chiave all'interno di uno script (per esempio *`var`* `tesla = 'MODEL S'`), questa sarà visibile in tutto lo script, anche se viene richiamata all'interno di una funzione. Al contrario, se un variabile di questo tipo viene dichiarata all'interno di una funzione all'interno di uno script, questa sarà visibile solo all'interno di quella funzione e non all'esterno. Vediamo come funziona con un semplice esempio:

```javascript
var tesla = 'MODEL S'

function printModels() {
  var f8 = 'F8 Tributo'

  if (f8 === 'F8 Tributo') {
    var monza = 'Monza SP2'
  }

  console.log(f8) // F8 Tributo
  console.log(tesla) // MODEL S
  console.log(monza) // Monza SP2
}

console.log(tesla) // MODEL S
printModels()
```

Se eseguiamo il codice appena mostrato il risultato che otterrete sarà il seguente:

```bash
F8 Tributo
MODEL S
Monza SP2
MODEL S
```

Questo è solo un semplice esempio a titolo dimostrativo, ma ci è utile per notare due cose:

* la variabile `tesla` è visibile all'interno e all'esterno della funzione `printModels`;
* la variabile `monza` è visibile all'esterno del blocco `if`.

Per chi proviene da altri linguaggi di programmazione questo comportamento può sembrare anomalo in quanto si aspettano che la variabile che le due condizioni sopra elencate non si verifichino. Per questo motivo dalla sesta edizione dello standard ECMAScript (ES2015), sono state introdotte due nuove parole chiave per dichiarare variabili, `let` e `const`, che consentono di dichiarare variabili che sono visibili, e quindi utilizzabili, solo ed esclusivamente all'interno di un blocco di codice. Le variabili così definite prendono il nome di variabili _block scoped_.


## La parola chiave let

Con la parola chiave *`let`* è possibile dichiarare una variabile che è valida solo all'itnerno di un blocco di codice. Per chiarirne meglio il funzionamento proviamo a sostituire nello script mostrato in precedenza la parola chiave `let` al posto di `var`, e vediamo cosa succede:

```javascript
let tesla = 'MODEL S'

function printModels() {
  let f8 = 'F8 Tributo'

  if (f8 === 'F8 Tributo') {
    let monza = 'Monza SP2'
  }

  console.log(f8) // F8 Tributo
  console.log(tesla) // MODEL S
  console.log(monza) // Reference Error
}

console.log(tesla) // MODEL S
printModels()
```

Se proviamo ad eseguire questo script, il risultato che otterrete a video sarà qualcosa tipo:

```
MODEL S
F8 Tributo
MODEL S

VM47:12 Uncaught ReferenceError: monza is not defined
    at printModels (<anonymous>:12:15)
    at <anonymous>:16:1
```

Dopo aver effettuato la sostituzione, lo script non restituisce più lo stesso risultato ottenuto in precedenza. Questo perché la variabile `monza` risulta accessibile solo ed esclusivamente all'interno del blocco `if`. Un'altra differenza sostanziale tra `var` e `let` è che con `var` è possibile ridichiarare le variabili con lo stesso nome, mentre con `let` questo non è possibile. A titolo di esempio prendiamo il seguente frammento di codice:

```javascript
var tesla = 'MODEL S'
var tesla = 'MODEL 3'

console.log(tesla)
```

Lo script in questo caso non andrà in errore anzi stamperà il seguente risultato:

```
MODEL 3
```

Adesso sostituiamo la parola chiave `var` con `let`, quindi:

```javascript
let tesla = 'MODEL S'
let tesla = 'MODEL 3'

console.log(tesla)
```

Riceveremo un errore del genere:

```
Uncaught SyntaxError: Identifier 'tesla' has already been declared
```

Da ciò si evince facilmente che se si dichiara una variabile con la parola chiave `let` e, all'interno dello stesso blocco di codice, si dichiara un'altra variabile con la stessa parola chiave e lo stesso nome, al contrario di quanto visto con la parola chiave `var` si riceverà un `SyntaxError`.

## La parola chiave const

La parola chiave *`const`* è utile quando vogliamo dichiarare una varibile in sola lettura, una costante, all'interno del nostro script. Proviamo subito con un esempio:

```javascript
const tesla = 'MODEL S'
tesla = 'MODEL 3'

console.log(tesla)
```

Eseguendo questo script il risultato sarà il seguente:

```
Uncaught TypeError: Assignment to constant variable.
    at <anonymous>:2:7
```

Questo accade perché, a differenza delle varibili dichiarate con `let`, questo tipo di variabili una volta inizializzate non è più possibile modificarne il contenuto.

Le regole di visibilità di questo tipo di variabili sono le stesse che abbiamo descritto per le varibili dichiarate con `let`, quindi anche queste sono _block scoped_, ossia varibili che sono visibili solo all'interno di un determinato blocco di codice. Riprendendo l'esempio descritto nel precedente paragrafo e sostituendo la parola chiave `const` al posto di `let`:

```javascript
const tesla = 'MODEL S'

function printModels() {
  const f8 = 'F8 Tributo'

  if (f8 === 'F8 Tributo') {
    const monza = 'Monza SP2'
  }

  console.log(f8)
  console.log(monza)
}

console.log(tesla)
printModels()
```

Eseguendolo l'output sarà esattamente lo stesso ottenuto in precedenza, quindi:

```
Uncaught ReferenceError: monza is not defined
    at printModels (<anonymous>:11:15)
    at <anonymous>:15:1
```

## Variabili primitive

JavaScript possiede solo sette tipi di variabili primitive:

* *String*
* *Number*
* *BigInt*
* *Boolean*
* *Symbol*
* *null*
* *undefined*

### String

In JavaScript le stringhe sono sequenze di caratteri con cui è possibile rappresentare la maggior parte dei caratteri del mondo. Non esiste il tipo `char` o altro per rappresentare il singolo carattere: l'unico modo per farlo è quello di dichiarare una stringa con lunghezza pari a uno. Le stringhe possono essere racchiuse tra apici singoli, doppi o accento grave (backtick). Le stringhe racchiuse con i backticks sono stringhe template, possono essere multiriga e supportano anche l'interpolazione.

#### Lunghezza di una stringa

Per ottenere la lunghezze di una stringa, possiamo utilizzare la proprietà `length`:

```javascript
> let hello = 'Hello, JavaScript!'
undefined
> hello.length
18
> 'Hello, JavaScript!'.length
18
```

Se proviamo a leggere la proprietà `length` su una stringa `null` o `undefined` otterremo il seguente errore: 

```javascript
> hello = null
null
> hello.length
VM197:1 Uncaught TypeError: Cannot read properties of null (reading 'length')
    at <anonymous>:1:7
```

#### Concatenare le stringhe

Per concatenare due stringhe è possibile utilizzare l'operatore `+` o un template utilizzando i backticks:

```javascript
> 'Hello' + ', ' + 'JavaScript!'
'Hello, JavaScript!'

> const hello = 'Hello', js = 'JavaScript'
undefined
> `${hello}, ${js}!`
'Hello, JavaScript!'
```

#### concat

In JavaScript esistono molte funzioni per la manipolazione delle stringhe Per esempio è possibile concatenare due o più stringhe anche con la funzione `concat`, in aggiunta alle metodologie viste nel paragrafo precedente:

```javascript
> const hello = 'Hello, ', js = 'JavaScript!'
undefined
> `${hello} ${js}`
'Hello, JavaScript!'
```

#### includes e indexOf

Per controllare se una stringa è contenuta un un'altra è possibile utilizzare la funzione `indexOf` o `includes`:

```javascript
> 'Hello, JavaScript!'.includes('JavaScript')
true

> 'Hello, JavaScript!'.indexOf('JavaScript')
7
```

Noterete una differenza sostanziale fra le due. In pratica la funzione `includes` restituisce `true` se trova l'occorrenza che stiamo cercando all'interno della stringa, mentre `indexOf` ritorna la posizione del primo carattere dell'occorrenza che ha trovato, ossia `7`. Se invece nessuna occorrenza viene trovata all'interna della stringa allora `includes` restituirà `false` mentre `indexOf` restituirà `-1`:

```javascript
> 'Hello, JavaScript!'.includes('pippo')
false

> 'Hello, JavaScript!'.indexOf('pippo')
-1
```

#### substr e splice

Per estrare una porzione da una stringa, è possibile utilizzare la funzione `substr` o `splice`. La differenza sostanziale fra queste due funzioni è che la prima accetta come parametri la posizione del primo carattere e come secondo parametro il numero di caratteri da estrarre, mentre la seconda come secondo parametro vuole pa posizione dell'ultimo carattere da estrarre. Quindi se vogliamo estrarre la sottostringa `JavaScript` da `Hello, JavaScript!`:

```javascript
> 'Hello, JavaScript!'.substr(7, 10)
'JavaScript'

> 'Hello, JavaScript!'.slice(7, 17)
'JavaScript'
```

#### charAt

Se desideriamo estrarre un carattere da una stringa basta utilizzare le parentesi quadre e l'indice del carattere della stringa che vogliamo estrarre, per esempio `hello[2]`. Anche se non avete mai avuto esperienza con JavaScript troverete sicuramente familiare questa notazione. Un'altro modo per estrarre un carattere da una stringa è quella di utilizzare la funzione `charAt`:

```javascript
> const hello = 'Hello, World!'
undefined
> hello[2]
'l'

> hello.charAt(2)
'l'
```

#### split

Se abbiamo la necessita di trasformare una stringa in un array di sottostringhe possiamo utilizzare la funzione `split`. Questa funzione accetta un parametro in input che rappresenta il separatore che vogliamo utilizzare per suddividere la nostra stringa. Se viene utilizzata una stringa vuota come parametro `('')`, allora gli elementi dell'array risultate saranno i singoli caratteri della stringa. Diamo uno sguardo al suo funzionamento:

```javascript
> const hello = 'Hello, World!', hello_ = 'H_e_l_l_o_W_o_r_l_d_!'
undefined
> hello.split('')
[
  'H', 'e', 'l', 'l',
  'o', ',', ' ', 'W',
  'o', 'r', 'l', 'd',
  '!'
]

> hello.split(', ')
[ 'Hello', 'World!' ]

> hello_.split('_')
[
  'H', 'e', 'l', 'l',
  'o', 'W', 'o', 'r',
  'l', 'd', '!'
]
```

### Number

In JavaScript tutti i numeri sono in formato 64-bit secondo lo https://it.wikipedia.org/wiki/IEEE_754[standard IEEE 754]. Il tipo primitivo `Number` è un oggetto che viene utilizzato per rapprentare numeri come `10` o `-7.92` e così via. Quindi con `Number` possiamo rappresentare numeri interi, float, esadecimali, ottali o numeri esponenziali. La funzione `Number` inoltre può convertire una stringa in un numero e, nel caso in cui la stringa non è un numero valido ritorna il valore `NaN`.

```javascript
> Number('236')
236
> Number('236.23')
236.23
> Number('pippo')
NaN
> Number(undefined)
NaN
> Number(null)
0
```

Una cosa a cui prestare molta attenzione quando lavorate con in numeri in JavaScript è che per molti valori vengono approssimati. Per esempio:

```javascript
> 1.1 + 1.3
2.4000000000000004
```

di conseguenza se provate ad effettuare determinati controlli il risultato che otterrete potrebbe non essere quello atteso:

```
> 1.1 + 1.3 === 2.4
false
```

#### Costanti

*Number* possiede alcune proprietà statiche che possiamo utilizzare per effettuare confronti o operazioni:

```javascript
> Number.MAX_VALUE
1.7976931348623157e+308
> Number.MIN_VALUE
5e-324
```

```javascript
> Number.NEGATIVE_INFINITY
-Infinity
> Number.POSITIVE_INFINITY
Infinity
```

```javascript
> Number.MAX_SAFE_INTEGER
9007199254740991
> Number.MIN_SAFE_INTEGER
-9007199254740991
```

```javascript
> Number.EPSILON
2.220446049250313e-16
> (0.1 + 0.2) - 0.3 < Number.EPSILON
true
```

```javascript
> Number.NaN
NaN
```

#### parseInt e parseFloat

Se abbiamo la necessità di trasformare una stringa in un numero intero o float, possiamo utilizzare le funzioni `parseInt` e `parseFloat`. Queste funzioni accettano una stringa come parametro in input e nel caso in cui la stringa passata non è un numero valido, restituiscono il valore `NaN`:

```javascript
> Number.parseInt('33')
33
> Number.parseInt('33.33')
33
> Number.parseInt('')
NaN
> Number.parseInt('pippo')
NaN
> Number.parseInt(null)
NaN
> Number.parseInt(undefined)
NaN
```

```javascript
> Number.parseFloat('323.22')
323.22
> Number.parseFloat('pippo')
NaN
> Number.parseFloat('')
NaN
> Number.parseFloat(null)
NaN
> Number.parseFloat(undefined)
NaN
```

Nel caso in cui la stringa data in input inizia con un valore numerico e successivamente una serie di caratteri non validi, le funzioni valutano solo la parte numerica. Vediamo come funziona con degli esempi:

```javascript
> Number.parseInt('123pippo')
123
> Number.parseInt('123.83pippo')
123
> Number.parseInt('pi123ppo')
NaN
> Number.parseInt('pippo123')
NaN
```

```javascript
> Number.parseFloat('123.83pippo')
123.83
> Number.parseFloat('123pippo')
123
> Number.parseFloat('pi123.22ppo')
NaN
> Number.parseFloat('pippo123.22')
NaN
```

#### isFinite

JavaScript è leggermente diverso dagli altri linguaggi, infatti se provate a dividere un numero per zero non si ottiene un errore a runtine bensì il valore `Infinity` o `-Infinity`:

```javascript
> 22 / 0
Infinity
> - 22 / 0
-Infinity
```

Per verificare se un numero è intero e finito, e quindi diverso da `Infinity`, `-Infinity` o `NaN`, è possibile utilizzare la funzione `Number.isFinite`. Questa funzione restituisce `true` o `false`:

```javascript
> Number.isFinite(22/0)
false
> Number.isFinite(-22/0)
false
> Number.isFinite('pippo')
false
> Number.isFinite(22/2)
true
```

#### isInteger

Il metodo `Number.isInteger` prende in input un parametro e restituisce `true` se il parametro in input è un numero intero, `false` altrimenti.

```
> Number.isInteger(42)
true
> Number.isInteger('342')
false
> Number.isInteger('pippo')
false
> Number.isInteger(42.3)
false
> Number.isInteger(null)
false
> Number.isInteger(undefined)
false
```

#### toFixed

Questa funzione viene utilizzata per troncare numeri a virgola fissa. Prende in input un numero intero `n` e restituisce una stringa, che rappresenta il numero troncato alla posizione `n` dopo la virgola arrotondando per eccesso. Nel caso in cui viene invocato su un numero intero, questo verrà rappresentato con `n` zeri dopo la virgola.

```javascript
> const float = 123.456789, integer = 123, nullElement = null, undefinedElement = undefined, string = 'pippo'
undefined
> float.toFixed(3)
'123.457'
> integer.toFixed(3)
'123.000'
> nullElement.toFixed(3)
Uncaught TypeError: Cannot read property 'toFixed' of null
> undefinedElement.toFixed(3)
Uncaught TypeError: Cannot read property 'toFixed' of undefined
> string.toFixed(3)
Uncaught TypeError: string.toFixed is not a function
```

#### isNaN

la funzione `Number.isNaN` è utile per verificare se un valore passatogli in input è di tipo `NaN` (_Not a Number_):

```javascript
> Number.isNaN(342)
false
> Number.isNaN(NaN)
true
> Number.isNaN('342')
false
> Number.isNaN('pippo')
false
```

Bisogna fare molta attenzione in questo caso a non confondere `Number.isNaN` con la funzione globale `isNaN` in quanto hanno comportamenti molto diversi. Infatti provando a rifare gli stessi esempi riportati in precedenza, i risultati cambiano:

```javascript
> isNaN(342)
false
> isNaN(NaN)
true
> isNaN('342')
false
> isNaN('pippo')
true
```

La differenza sostanziale tra le due funzioni e che `Number.isNaN` verifica se il valore passato in input è di tipo `NaN`, mentre la funzione globale `isNaN` è in grado capire se il parametro dato in input possa rappresentare un numero o meno.

### Boolean

Questa tipologia di variabile è molto semplice da utilizzare in JavaScript. Uno specifico valore può essere `true` o `false` e potete convertire qualsiasi valore in `boolean` utilizzando la funzione `Boolean`:

```javascript
> Boolean('pippo')
true
> Boolean(22)
true
> Boolean(1)
true
> Boolean(-1)
true
> Boolean(true)
true
> Boolean('')
false
> Boolean(false)
false
> Boolean(0)
false
> Boolean(null)
false
> Boolean(undefined)
false
> Boolean(NaN)
false
```

Non avrete quasi mai bisogno di questa funzione in quanto è lo stesso JavaScript ad effettuare questa conversione quando è necessario, in base a due regole fondamentali:

* stringa vuota(`''`), `false`, `0`, `undefined`, `null`, `undefined` e `NaN` avranno tutti il valore `false`;
* tutti gli altri valori prendono il valore `true`.

### BigInt

`BigInt` è una primitiva numerica in JavaScript che può rappresentare numeri interi con precisione arbitraria. Con `BigInt` è possibile effettuare operazioni su numeri interi di grandi che vanno oltre il limite di numeri interi come `Number`:

```javascript
> BigInt(123)
123n
> 123n === BigInt(123)
true
> BigInt(12.3)
Uncaught:
RangeError: The number 12.3 cannot be converted to a BigInt because it is not an integer
  at BigInt (<anonymous>)
> BigInt('12.3')
Uncaught SyntaxError: Cannot convert 12.3 to a BigInt
```

### Symbol

`Symbol` è un tipo di variabile molto particolare. È stato introdotto solo nel 2015, quindi solo pochi anni fa, ed è stato da subito dichiarato come un dato primitivo, quindi come `string`, `boolean` ecc. La particolarità di una variabile di tipo `Symbol` è che una volta creata, il suo valore viene mantenuto privato e per uso interno. Tutto ciò che rimane dopo la creazione di una variabile di questo tipo è un riferimento unico a `Symbol`. Per creare una variabile di questo tipo basta richiamare la funzione `Symbol()` con un parametro opzionale di tipo stringa che rappresenta la descrizione, per esempio:

```javascript
> const symbol1 = Symbol(), symbol2 = Symbol('name'), symbol3 = Symbol('name')
undefined
```

Come già accennato, ogni volta che creiamo una variabile di questo tipo, otteniamo un riferimento unico, di conseguenza ogni variabile è diversa dall'altra:

```javascript
> symbol2 === symbol3
false
```

Molto spesso questa tipologia di variabili viene utilizzata per definire le proprietà di un oggetto, al fine di evitare conflitti tra i nomi delle proprietà dell'oggetto:

```javascript
> const NAME = Symbol('name')
const student = {
  [NAME]: 'Davide'
}

student[NAME]

'Davide'
```

### null e undefined

Il tipo di dati primitivo `null` viene solitamente utilizzato per definire una variabile che non ha dati, a differenza di `undefined` che viene utilizzata per definire l'assenza di un valore definito. Infatti: 

* tutte le variabili che sono state dichiarate senza un valore saranno di tipo `undefined`;
* tutte le espressioni che tentano di accedere ad una proprietà non definita su un oggetto sarà `undefined`;
* tutte le funzioni che non hanno un istruzione `return`, ritornano `undefined`.

## Esercizi

### Esercizio 1 — Convertitore di temperature

Scrivi una funzione `convertiTemperatura(valore, da, a)` che converte tra Celsius (`'C'`), Fahrenheit (`'F'`) e Kelvin (`'K'`).

```javascript
function convertiTemperatura(valore, da, a) {
  // Formule:
  // C → F: (valore * 9/5) + 32
  // F → C: (valore - 32) * 5/9
  // C → K: valore + 273.15
  // K → C: valore - 273.15
}

console.log(convertiTemperatura(100, 'C', 'F'))  // 212
console.log(convertiTemperatura(32, 'F', 'C'))   // 0
console.log(convertiTemperatura(0, 'C', 'K'))    // 273.15
console.log(convertiTemperatura(300, 'K', 'C'))  // 26.85
```

### Esercizio 2 — Normalizzare nomi prodotto

Dato un array di nomi prodotto in formato grezzo, scrivi una funzione `normalizzaNome(nome)` che li porta nel formato corretto (prima lettera maiuscola per ogni parola, niente spazi iniziali/finali, underscore sostituiti da spazi).

```javascript
function normalizzaNome(nome) {
  // usa: trim(), toLowerCase(), replace(), split(), map(), join()
}

const nomiGrezzi = ['  laptop pro  ', 'MOUSE WIRELESS', 'tastiera_meccanica', '  MONITOR 4K']
const nomiPuliti = nomiGrezzi.map(normalizzaNome)

console.log(nomiPuliti)
// ['Laptop Pro', 'Mouse Wireless', 'Tastiera Meccanica', 'Monitor 4k']
```

### Esercizio 3 — Somma sicura

Crea una funzione `sommaValori(a, b)` che accetta due parametri che potrebbero essere numeri o stringhe numeriche. Se uno dei valori non è convertibile in numero, lancia un errore con `throw`.

```javascript
function sommaValori(a, b) {
  // usa typeof e Number() per gestire la conversione
  // lancia un Error se un valore non è numerico
}

console.log(sommaValori(5, 3))        // 8
console.log(sommaValori('10', 5))     // 15
console.log(sommaValori('2.5', '3.5')) // 6

try {
  sommaValori('abc', 5)
} catch (e) {
  console.log(e.message) // "Valore non numerico: abc"
}
```