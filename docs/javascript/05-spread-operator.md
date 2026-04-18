---
sidebar_position: 5
---

# L'operatore spread

L'operatore *spread* divide un oggetto in singoli valori ed è comunemente usato per inviare i valori di un oggetto iterabile come argomenti di una funzione. In JavaScript questo operatore viene rappresentato dalla stringa `...`. Come esempio vediamo come trasformare un array e passare i suoi valori come parametri di una funzione.

Prima che l'operatore spread venisse introdotto, la stessa operazione veniva effettuata utilizzando la funzione `Function.apply`, vista nei paragrafi precedenti:

```javascript
function introduceYourself(a, b, c) {
  console.log(a, b, c)
}

const arr = ['Hello,', 'JavaScript', '!']
introduceYourself.apply(null, arr)
```

In questo caso il metodo `Function.apply`, prende in input l'array `arr` e da in pasto alla funzione `introduceYourself` i suoi elementi uno alla volta come parametri. È una funzionalità molto utilizzata dai programmatori JavaScript, ma l'operatore spread ci consente di fare esattamente la stessa cosa senza utilizzare il metodo `Function.apply`. Vediamo come:

```javascript
function sayHello(a, b, c) {
  console.log(a, b, c)
}

const arr = ['Hello,', 'JavaScript', '!']
sayHello(...arr)
```

Eseguendo entrambi gli script il risultato che otterremo sarà il seguente:

```
Hello, JavaScript !
```

## Altri utilizzi dell'operatore spread

L'operatore spread non è utile solo per inviare parametri ad una funzione. Può essere utilizzato in diversi ambiti, soprattutto con operazioni riguardanti gli array. Nei prossimi paragrafi ne vedremo qualcuno.

### Concatenare array

Uno dei modi in cui in JavaScript è possibile concatenare due array, è mediante l'utilizzo della funzione `concat()`. Vediamo qualche esempio di utilizzo:

```javascript
const a = [1, 2, 3, 4, 5]
const b = a.concat([6, 7, 8, 9])

console.log(b) // [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
```

Notiamo che la funzione `concat`, non agisce sulla variabile su cui la invochiamo, bensì restituisce un risultato. Un'altro modo per concatenare due array, è utilizzando il metodo `push` in questo modo:

```javascript
const a = [1, 2, 3, 4, 5]
const b = [6, 7, 8, 9]

Array.prototype.push.apply(a, b);
console.log(a) // [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
```

È possibile però che in questi casi possiamo utilizzare l'operatore spread, vediamo come:

```javascript
const a = [1, 2, 3, 4, 5]
const b = [6, 7, 8, 9]

a.push(...b)

console.log(a) // [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
```

### Valori di un array come parti di un altro array

Immaginiamo di voler effettuare il merge dei due array utilizzati in precedenza con una particolarità; in particolare vogliamo che l'array `[6, 7, 8, 9]` sia contenuto nell'array `[1, 2, 3, 4]`, però tra il valore `2` e `3`. È possibile effettuare questa operazione mediante l'utilizzo dell'operatore spread. Vediamo come:

```javascript
const a = [6, 7, 8, 9]
const b = [1, 2, ...a, 3, 4, 5]

console.log(b) // [ 1, 2, 6, 7, 8, 9, 3, 4, 5 ]
```

### Utilizzare l'operatore spread su più array

È anche possibile utilizzare l'operatore spread su più array su una singola riga di codice. Come nell'esempio seguente:

```javascript
let a = [1, 2]
let b = [3]
let c = [...a, ...b, ...[4, 5]]
let d = [6]

function sum(a, b, c, d, e, f) {
  return a + b + c + d + e + f
}

let result = sum(...c, ...d)
console.log(result) // 21
```

## Spread su oggetti

L'operatore spread funziona anche con gli oggetti. È uno dei pattern più usati in JavaScript moderno per clonare e unire oggetti in modo immutabile.

### Clonare un oggetto

```javascript
const prodotto = { id: 1, nome: 'Laptop', prezzo: 999 }
const clone = { ...prodotto }

clone.prezzo = 799
console.log(prodotto.prezzo) // 999 — l'originale non è stato modificato
console.log(clone.prezzo)    // 799
```

### Unire due oggetti

```javascript
const prodottoBase = { id: 1, nome: 'Laptop', prezzo: 999 }
const sconto = { prezzo: 799, inSaldo: true }

const prodottoScontato = { ...prodottoBase, ...sconto }
console.log(prodottoScontato)
// { id: 1, nome: 'Laptop', prezzo: 799, inSaldo: true }
```

Le proprietà definite più a destra sovrascrivono quelle precedenti con lo stesso nome — nell'esempio, `prezzo` viene sovrascritto dal valore in `sconto`.

### Aggiornare una proprietà specifica

```javascript
const cliente = { id: 42, nome: 'Mario', piano: 'base', attivo: true }

const clienteAggiornato = { ...cliente, piano: 'premium' }
console.log(clienteAggiornato)
// { id: 42, nome: 'Mario', piano: 'premium', attivo: true }

console.log(cliente.piano) // 'base' — l'originale è invariato
```

:::info Spread vs shallow copy
Lo spread crea una **shallow copy** (copia superficiale): le proprietà primitive vengono duplicate, ma le proprietà che sono oggetti o array rimangono riferimenti condivisi all'originale. Per una copia profonda (deep copy) usa `structuredClone(oggetto)`.
:::

:::info Spread vs rest
- **Spread** (`...array`, `...oggetto`): *espande* un iterabile nei suoi elementi singoli.
- **Rest** (`...args` nei parametri): *raccoglie* elementi rimanenti in un array.

Stessa sintassi `...`, uso opposto: spread **sparpaglia**, rest **raccoglie**. Vedi il capitolo successivo per i parametri rest.
:::

## Esercizi

### Esercizio 1 — Unire dati di vendita

Hai due array di vendite semestrali. Uniscili in un unico array usando spread e calcola il totale.

```javascript
const venditePrimoSemestre = [12500, 9800, 14200, 11000, 13700, 10500]
const venditeSecondoSemestre = [15200, 11800, 9500, 16000, 12300, 14800]

// 1. Unisci i due array in `venditeAnnuali` usando spread
const venditeAnnuali = // il tuo codice

// 2. Calcola il totale annuale
const totaleAnnuale = // il tuo codice (suggerimento: usa reduce o un ciclo)

console.log(`Mesi totali: ${venditeAnnuali.length}`)  // 12
console.log(`Fatturato annuale: €${totaleAnnuale}`)    // €151300
```

### Esercizio 2 — Aggiornare un piano cliente

Crea una funzione `aggiornaPiano(cliente, nuovoPiano)` che restituisce un nuovo oggetto cliente con il piano aggiornato, senza modificare l'originale.

```javascript
function aggiornaPiano(cliente, nuovoPiano) {
  // usa spread per creare un nuovo oggetto con piano aggiornato
}

const cliente = { id: 1, nome: 'Mario Rossi', email: 'mario@email.it', piano: 'base' }

const clientePremium = aggiornaPiano(cliente, 'premium')
console.log(clientePremium.piano)  // 'premium'
console.log(cliente.piano)         // 'base' — l'originale è invariato

// Sfida: estendi la funzione per accettare un oggetto di aggiornamenti
// aggiornaPiano(cliente, { piano: 'premium', scadenza: '2027-12-31' })
```
