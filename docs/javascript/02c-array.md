---
sidebar_position: 4
---

# Array

Fino ad ora abbiamo sempre salvato un valore alla volta in una variabile:

```javascript
const frutto1 = 'mela'
const frutto2 = 'banana'
const frutto3 = 'arancia'
```

Questo funziona, ma immagina di dover gestire non 3 frutti, ma 100 prodotti di un negozio, o 1000 studenti di una scuola. Creare una variabile per ognuno sarebbe impossibile.

Un **array** risolve esattamente questo problema: è una variabile che può contenere **più valori insieme**, in una lista ordinata.

```javascript
const frutti = ['mela', 'banana', 'arancia']
```

In un colpo solo abbiamo salvato tre valori in una sola variabile. Molto meglio!

## Come si crea un array

Per creare un array si usano le **parentesi quadre** `[]` e si separano i valori con una virgola:

```javascript
const colori = ['rosso', 'verde', 'blu']
const numeri = [10, 20, 30, 40, 50]
const misto = ['ciao', 42, true]       // può contenere tipi diversi
const vuoto = []                        // array senza elementi
```

Un array può contenere qualsiasi tipo di valore: stringhe, numeri, booleani, oggetti e persino altri array.

## Come si accede a un elemento

Ogni elemento dell'array ha una **posizione**, chiamata **indice**. La cosa importante da sapere è che **gli indici partono da 0**, non da 1.

```javascript
const frutti = ['mela', 'banana', 'arancia']
//               indice 0   indice 1   indice 2
```

Per leggere un elemento si usano le parentesi quadre con l'indice:

```javascript
const frutti = ['mela', 'banana', 'arancia']

console.log(frutti[0])  // mela
console.log(frutti[1])  // banana
console.log(frutti[2])  // arancia
console.log(frutti[3])  // undefined (non esiste)
```

## Quanti elementi ha un array?

Per sapere quanti elementi ci sono in un array si usa la proprietà `length`:

```javascript
const frutti = ['mela', 'banana', 'arancia']

console.log(frutti.length)  // 3
```

`length` è molto utile, ad esempio, per accedere all'ultimo elemento:

```javascript
const frutti = ['mela', 'banana', 'arancia']

const ultimo = frutti[frutti.length - 1]
console.log(ultimo)  // arancia
```

## Aggiungere e rimuovere elementi

Per aggiungere un elemento **in fondo** all'array si usa `push`:

```javascript
const frutti = ['mela', 'banana']

frutti.push('arancia')

console.log(frutti)  // ['mela', 'banana', 'arancia']
```

Per rimuovere l'**ultimo** elemento si usa `pop`:

```javascript
const frutti = ['mela', 'banana', 'arancia']

frutti.pop()

console.log(frutti)  // ['mela', 'banana']
```

Per aggiungere un elemento **all'inizio** si usa `unshift`, per rimuovere il **primo** elemento si usa `shift`:

```javascript
const frutti = ['mela', 'banana']

frutti.unshift('kiwi')
console.log(frutti)  // ['kiwi', 'mela', 'banana']

frutti.shift()
console.log(frutti)  // ['mela', 'banana']
```

## Come scorrere un array

Molto spesso non ci interessa un singolo elemento, ma vogliamo fare qualcosa **con tutti gli elementi** uno alla volta. Per farlo si usa un ciclo, che abbiamo visto nel capitolo precedente.

### con for...of

Il modo più semplice e leggibile per scorrere tutti gli elementi è il ciclo `for...of`:

```javascript
const frutti = ['mela', 'banana', 'arancia']

for (const frutto of frutti) {
  console.log(frutto)
}

// mela
// banana
// arancia
```

Ad ogni giro del ciclo, la variabile `frutto` contiene automaticamente l'elemento corrente della lista.

### con il ciclo for classico

Se hai bisogno anche dell'indice (la posizione) di ogni elemento, puoi usare il ciclo `for` classico:

```javascript
const frutti = ['mela', 'banana', 'arancia']

for (let i = 0; i < frutti.length; i++) {
  console.log(`Posizione ${i}: ${frutti[i]}`)
}

// Posizione 0: mela
// Posizione 1: banana
// Posizione 2: arancia
```

## Vuoi fare di più con gli array?

Questi sono i fondamentali per iniziare a lavorare con gli array. JavaScript mette però a disposizione molti altri strumenti potenti, come `map`, `filter`, `reduce` e tanti altri, che ti permettono di trasformare, filtrare e aggregare i dati in modo molto efficace.

Li trovi spiegati nel dettaglio nel capitolo dedicato: [Metodi degli Array](./06b-array-methods.md).

## Esercizi

### Esercizio 1 — Lista della spesa

Crea un array `spesa` con almeno 4 prodotti. Poi:
- stampa il primo e l'ultimo elemento
- stampa quanti prodotti ci sono
- aggiungi un nuovo prodotto in fondo
- rimuovi il primo prodotto

```javascript
const spesa = ['pane', 'latte', 'uova', 'pasta']

// primo elemento
console.log(spesa[???])

// ultimo elemento
console.log(spesa[???])

// numero di prodotti
console.log(???)

// aggiungi 'burro' in fondo
spesa.???(???)

// rimuovi il primo elemento
spesa.???()

console.log(spesa)
```

### Esercizio 2 — Stampa tutti gli elementi

Dato il seguente array di città, usa un ciclo `for...of` per stampare ogni città nel formato `"Visito: Roma"`, `"Visito: Milano"` ecc.

```javascript
const citta = ['Roma', 'Milano', 'Napoli', 'Torino', 'Firenze']

for (const citta of citta) {
  // stampa "Visito: <nome città>"
}
```

### Esercizio 3 — Trova il massimo

Scrivi una funzione `trovaMassimo(numeri)` che riceve un array di numeri e restituisce il valore più grande. Usa un ciclo `for` classico.

```javascript
function trovaMassimo(numeri) {
  let massimo = numeri[0]

  for (let i = 1; i < numeri.length; i++) {
    // se numeri[i] è maggiore di massimo, aggiorna massimo
  }

  return massimo
}

console.log(trovaMassimo([3, 7, 2, 19, 4]))   // 19
console.log(trovaMassimo([100, 50, 75, 200]))  // 200
```
