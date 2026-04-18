---
sidebar_position: 4
---

# Funzioni

Le funzioni sono i blocchi principali di un programma. Ci consentono di definire un blocco di codice, con un nome, ed eseguirlo tutte le volte che si vuole. In JavaScript una funzione è un oggetto, e quindi un valore, e come tale viene trattato come qualsiasi altro valore. Infatti, come vedremo più avanti in questo libro, una funzione può essere passata ad un altra funzione come parametro, o restituita da un istruzione `return`. Le funzioni ritornano sempre un valore, se non è specificata un istruzione di `return` allora la funzione restituirà `undefined`.

## Definire una funzione

Esistono diversi modi per dichiarare una funzione in JavaScript. Il primo è quello di utilizzare la parole chiave `function` seguita dal nome che si vuole dare alla funzione.

```javascript
function sayHello (name) {
  console.log(`Hello, ${name}`)
}

console.log(sayHello('Davide')) // Stamperà "Hello, Davide"
```

È possibile dichiarare una funzione senza specificarne il nome. Questa tipologia di funzioni viene chiamata _"anonima"_ ed è possibile assegnarla ad una variabile.

```javascript
const sayHello = function (name) {
  console.log(`Hello, ${name}`)
}

console.log(sayHello('Davide')) // Stamperà "Hello, Davide"
```

### Le arrow function

Un ulteriore modo per dichiarare una funzione è utilizzando l'operatore `=>`. Le funzioni dichiarate con questo tipo di operatore sono chiamate _Arrow Function_ (Funzioni Freccia). Tutte le arrow function sono funzioni anonime. Ecco un piccolo esempio di utilizzo:

```javascript
const square = (number) => {
  return number * number
}

const four = square(2)
console.log(four) // Stamperà "4"
```

Quando una arrow function contiene una singola linea di codice è possibile utilizzare una sintassi abbreviata, eliminando le parentesi graffe `{}` e l'istruzione `return`:

```javascript
const square = (number) => number * number

const four = square(2)
console.log(four) // Stamperà "4"
```

Inoltre quando la funzione possiede solo un parametro è possibile omettere le parentesi tonde che le racchiude:

```javascript
const square = number => number * number

const four = square(2)
console.log(four) // Stamperà "4"
```

### this

La parola chiave `this` è uno dei meccanismi più importanti e complessi di JavaScript. Dato il suo spessore didattico, è trattata in dettaglio nel capitolo successivo dedicato.

## Esercizi

### Esercizio 1 — Tre forme, stessa funzione

Scrivi tre versioni della funzione `calcolaArea(base, altezza)` che restituisce l'area di un rettangolo: come function declaration, come function expression e come arrow function.

```javascript
// 1. Function declaration
function calcolaArea(base, altezza) { /* ... */ }

// 2. Function expression
const calcolaAreaExpr = function(base, altezza) { /* ... */ }

// 3. Arrow function (forma compatta)
const calcolaAreaArrow = (base, altezza) => /* ... */

console.log(calcolaArea(5, 3))        // 15
console.log(calcolaAreaExpr(5, 3))    // 15
console.log(calcolaAreaArrow(5, 3))   // 15
```

### Esercizio 2 — Filtra positivi

Crea una funzione `filtraPositivi(numeri)` che accetta un array e restituisce solo i valori positivi. Scrivi la versione con arrow function in una riga sola.

```javascript
const filtraPositivi = numeri => /* il tuo codice */

const dati = [12, -5, 0, 34, -18, 7, -1, 99]
console.log(filtraPositivi(dati)) // [12, 34, 7, 99]
```

### Esercizio 3 — Funzione che restituisce una funzione

Crea una funzione `creaCalcolatore(operazione)` che accetta una stringa (`'somma'`, `'moltiplica'`, `'sottrai'`) e restituisce una arrow function che esegue quell'operazione su due numeri.

```javascript
function creaCalcolatore(operazione) {
  // restituisce una arrow function (a, b) => ...
}

const somma = creaCalcolatore('somma')
const moltiplica = creaCalcolatore('moltiplica')
const sottrai = creaCalcolatore('sottrai')

console.log(somma(10, 5))        // 15
console.log(moltiplica(4, 6))    // 24
console.log(sottrai(20, 8))      // 12
```
