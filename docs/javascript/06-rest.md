---
sidebar_position: 6
---

# I parametri rest

Così come l'operatore spread, anche l'operatore rest viene rappresentato dalla stringa `...`. Rappresenta solitamente l'ultimo elemento di una funzione ed indica tutti quei parametri della funzione che non sono stati dichiarati nella firma della funzione. Prima dell'avvento di ES6 i programmatori utilizzavano l'oggetto `arguments`, che è un oggetto ma fornisce un interfaccia simile a quella di un array. Ecco un esempio:

```javascript
function foo(a, b) {
  console.log(arguments)
}

foo(1, 2, 3, 4, 5)
```

Se eseguiamo questo frammento di codice notiamo che `arguments` non è un array (da come il nome potrebbe far pensare), bensì un oggetto strutturato nel seguente modo:

```javascript
{
  '0': 1,
  '1': 2,
  '2': 3,
  '3': 4,
  '4': 5
}
```

Quindi volendo fare in modo di avere tutti i parametri che non sono dichiarati nella firma della funzione, dobbiamo inventarci qualcosa tipo:

```javascript
function foo(a, b) {
  const args = Array.prototype.slice.call(arguments, foo.length)
  console.log(a, b)
  console.log(args)
}

foo(1, 2, 3, 4, 5)
```

Il risultato che vedrete a video sarà il seguente:

```
1 2
[ 3, 4, 5 ]
```

Questo sarebbe molto più facile se usassimo il parametro rest nella dichiarazione della nostra funzione. Prendedo in esame la funzione descritta in precedenza, vediamo come fare:

```javascript
function foo(a, b, ...args) {
  console.log(a, b)
  console.log(args)
}

foo(1, 2, 3, 4, 5)
```

Il risultato che verrà stampato a video sarà esattamente lo stesso che abbiamo ottenuto nell'esempio descritto in precedenza.

## La destrutturazione

La destrutturazione è una delle funzionalità più interessanti introdotte in JavaScript. In pratica ci constente di estrarre, dati da un array o un oggetto in variabili ben specifiche. Questa funzionalità è già presente in python e perl, e dall'avvento di ES6 è presente anche in JavaScript.

### La destrutturazione di un array

Immaginiamo di avere un array di quattro stringhe e di voler avere quattro distinte variabili, una per ogni stringa contenuta nell'array. Per farlo il codice è il seguente:

```javascript
const array = ['Hello', 'World!', 'I am', 'Davide']
const a = array[0]
const b = array[1]
const c = array[2]
const d = array[3]

console.log(a, b, c, d) // Hello World! I am Davide
```

Possiamo utilizzare la destrutturazione degli array ed avere lo stesso risultato utilizzando una sola riga di codice. Per farlo basta fare nel seguente modo:

```javascript
const array = ['Hello', 'World!', 'I am', 'Davide']
const [a, b, c, d] = array

console.log(a, b, c, d) // Hello World! I am Davide
```

Converrete con me che ora il codice è molto più leggibile rispetto all'esempio precedente vero? Il risultato è esattamente lo stesso, ma il codice sembra più pulito ed elegante. È possibile, inoltre, ingnorare le posizioni dell'array di cui non necessitiamo. Per esempio immaginiamo di avere la necessità di utilizzare solo le ultime due stringhe contenute all'interno di questo array. Prima della funzionalità di destrutturazione bisognava farlo in questo modo:

```javascript
const array = ['Hello', 'World!', 'I am', 'Davide']
const a = array[array.length - 2]
const b = array[array.length - 1]

console.log(a, b) // I am Davide
```

Invece con la destrutturazione possiamo ignorare le prime due posizioni dell'array nel seguente modo, ottenendo lo stesso risultato:

```javascript
const array = ['Hello', 'World!', 'I am', 'Davide']
const [ , , a, b] = array

console.log(a, b) // I am Davide
```

Nel caso in cui si ha la necessità di possedere, in due distinte variabili, le prime due posizioni dell'array:

```javascript
const array = ['Hello', 'World!', 'I am', 'Davide']
const [a, b] = array

console.log(a, b) // Hello, World!
```

Potremmo anche utilizzare l'operatore rest per fare in modo che il resto delle posizioni dell'array che non ci interessano, finiscano un nuovo array. Per esempio

```javascript
const array = ['Hello', 'World!', 'I am', 'Davide']
const [a, b, ...rest] = array

console.log(a, b, rest) // Hello, World! [ 'I am', 'Davide' ]
```

:::danger
Ricordate che se utilizzate la destrutturazione, è possibile utilizzare l'operatore rest solo ed esclusivamente come ultimo elemento del vostro risultato.
:::

### Destrutturazione di un array come parametro di una funzione

È possibile utilizzare la destrutturazione degli array come parametri di una funzione. Pe esempio:

```javascript
function printGreeting([a = 'Bye', b = 'bye', ...rest] = []) {
  console.log(a, b)
}

printGreeting(['Hello', 'World!']) // Hello, World!
printGreeting()
```

In questo caso nel momento in cui alla funzione viene passato un parametro `undefined`, come nella seconda invocazione della funzione, verrà stampato il messaggio `Bye bye`.

### La destrutturazione di un oggetto

Così come per gli array, anche con gli oggetti è possibile destrutturare un assegnamento facendo in modo che le sue proprietà vengano assegnate a variabili distinte. Prima di ES6 i programmatori si preoccupavano di assegnare ad una variabile il valore della proprietà di un oggetto. Ecco un esempio:

```javascript
const car = {
  model: 'TESLA MODEL S',
  price: 60000
}

const model = car.model
const price = car.price
console.log(`Model: ${model}`) // Model: TESLA MODEL S
console.log(`Price: ${price} €`) // Price: 60000 €
```

In JavaScript è possibile fare questa operazione in una singola linea di codice:

```javascript
const car = {
  model: 'TESLA MODEL S',
  price: 60000
}

const { model, price } = car
console.log(`Model: ${model}`) // Model: TESLA MODEL S
console.log(`Price: ${price} €`) // Price: 60000 €
```

Sulla parte sinistra dell'assegnamento, bisogna inserire i nomi delle variabili, aventi i nomi corrispondenti alle proprietà dell'oggetto che si vuole destrutturare. Sulla destra, invece, inseriamo l'oggetto che si desidera destrutturare. Il valore dell'oggetto `car.model` e `car.price` verranno assegnati rispettivamente alle varibili `model` e `price`. L'ordine non ha importanza. Ma , nel caso in cui vogliamo assegnare i valori dell'oggetto a variabili con nomi diversi:

```javascript
const car = {
  model: 'TESLA MODEL S',
  price: 60000
}

const { model: m, price: p } = car
console.log(`Model: ${m}`) // Model: TESLA MODEL S
console.log(`Price: ${p} €`) // Price: 60000 €
```

In questo modo i valori delle proprietà `car.model` e `car.price` verranno assegnati rispettivamente alle variabili `m` e `p`. In parole povere i due punti `:` indicano `cosa : va dove`. Durante la destrutturazione di un oggetto è possibile definire anche valori di default alle variabili. Per esempio:

```javascript
const car = {
  model: 'TESLA MODEL S',
  price: 60000
}

const { model, price, km = 20000 } = car
console.log(`Model: ${model}`) // Model: TESLA MODEL S
console.log(`Price: ${price} €`) // Price: 60000 €
console.log(`Km: ${km}`) // Km: 20000
```

#### Destrutturazione di un oggetto come parametro di una funzione

È possibile utilizzare la destrutturazione degli oggetti come parametri di una funzione. Per esempio:

```javascript
function printCar({model = 'Ferrari', price = 200000, km = 10} = {}) {
  console.log(`Model: ${model}`) // Model: TESLA MODEL S
  console.log(`Price: ${price} €`) // Price: 60000 €
  console.log(`Km: ${km}`) // Km: 10
}

printCar({ model: 'TESLA MODEL S', price: 60000 })
```

## Esercizi

### Esercizio 1 — Aggregatore di dati

Scrivi una funzione `aggregaDati(titolo, ...valori)` che accetta un titolo e un numero variabile di valori numerici, e restituisce un oggetto con statistiche.

```javascript
function aggregaDati(titolo, ...valori) {
  // usa Math.min, Math.max, reduce per i calcoli
}

console.log(aggregaDati('Vendite Q1', 1200, 850, 2100, 970, 1450))
// {
//   titolo: 'Vendite Q1',
//   min: 850,
//   max: 2100,
//   media: 1314,
//   totale: 6570
// }
```

### Esercizio 2 — Destructuring avanzato

Usa destructuring annidato per estrarre in una sola riga: `id`, nome cliente, email cliente, e nome del primo prodotto da ogni ordine.

```javascript
const ordini = [
  {
    id: 'ORD-001',
    cliente: { nome: 'Mario Rossi', email: 'mario@email.it' },
    prodotti: [{ nome: 'Laptop Pro', qty: 1 }, { nome: 'Mouse', qty: 2 }],
    totale: 1299.99
  },
  {
    id: 'ORD-002',
    cliente: { nome: 'Giulia Bianchi', email: 'giulia@email.it' },
    prodotti: [{ nome: 'Monitor 4K', qty: 1 }],
    totale: 449.50
  }
]

for (const ordine of ordini) {
  const { id, cliente: { nome, email }, prodotti: [{ nome: nomeProdotto }] } = ordine
  console.log(`${id} — ${nome} (${email}) — primo prodotto: ${nomeProdotto}`)
}
```

### Esercizio 3 — Configurazione con valori default

Scrivi una funzione `creaGrafico` che usa destructuring con default sui parametri. Testala con tre chiamate diverse.

```javascript
function creaGrafico({
  tipo = 'barre',
  colore = '#007bff',
  larghezza = 400,
  altezza = 300,
  titolo = 'Grafico'
} = {}) {
  return { tipo, colore, larghezza, altezza, titolo }
}

console.log(creaGrafico())
// tutti i valori di default

console.log(creaGrafico({ tipo: 'torta', titolo: 'Vendite per categoria' }))
// tipo e titolo sovrascritti, resto default

console.log(creaGrafico({ tipo: 'linea', colore: '#28a745', larghezza: 800, altezza: 500, titolo: 'Trend mensile' }))
// nessun default usato
```

In questo caso, passiamo un oggetto vuoto `{}` come parametro di default, per prevenire il caso in cui la funzione venga invocata senza alcun parametro.