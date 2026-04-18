---
sidebar_position: 6.5
---

# Metodi degli Array

Gli array sono la struttura dati più usata in JavaScript per lavorare con collezioni di valori. Oltre ai cicli classici, JavaScript mette a disposizione una serie di metodi funzionali che rendono il codice più leggibile ed espressivo — particolarmente utili per chi elabora dati.

## forEach

`forEach` esegue una funzione per ogni elemento dell'array. Non restituisce nulla — è utile per effetti collaterali come stampare o aggiornare il DOM.

```javascript
const prodotti = ['Laptop', 'Mouse', 'Monitor', 'Tastiera']

prodotti.forEach((prodotto, indice) => {
  console.log(`${indice + 1}. ${prodotto}`)
})
// 1. Laptop
// 2. Mouse
// 3. Monitor
// 4. Tastiera
```

## map

`map` trasforma ogni elemento dell'array e restituisce un **nuovo array** con i risultati. L'array originale non viene modificato.

```javascript
const prezzi = [999, 29, 449, 89]

// Applica uno sconto del 10%
const prezziScontati = prezzi.map(prezzo => prezzo * 0.9)
console.log(prezziScontati) // [899.1, 26.1, 404.1, 80.1]

// Estrarre proprietà da un array di oggetti
const ordini = [
  { id: 1, prodotto: 'Laptop', totale: 1299 },
  { id: 2, prodotto: 'Mouse', totale: 29 },
  { id: 3, prodotto: 'Monitor', totale: 449 }
]

const totali = ordini.map(o => o.totale)
console.log(totali) // [1299, 29, 449]
```

## filter

`filter` restituisce un **nuovo array** con solo gli elementi per cui la funzione restituisce `true`.

```javascript
const prodotti = [
  { nome: 'Laptop', prezzo: 1299, disponibile: true },
  { nome: 'Mouse', prezzo: 29, disponibile: false },
  { nome: 'Monitor', prezzo: 449, disponibile: true },
  { nome: 'Tastiera', prezzo: 89, disponibile: false }
]

const disponibili = prodotti.filter(p => p.disponibile)
console.log(disponibili.length) // 2

const economici = prodotti.filter(p => p.prezzo < 100)
console.log(economici.map(p => p.nome)) // ['Mouse', 'Tastiera']
```

## find e findIndex

`find` restituisce il **primo elemento** che soddisfa la condizione (o `undefined` se non esiste). `findIndex` restituisce l'**indice** di quell'elemento (o `-1`).

```javascript
const clienti = [
  { id: 1, nome: 'Mario Rossi', attivo: true },
  { id: 2, nome: 'Giulia Bianchi', attivo: false },
  { id: 3, nome: 'Luca Verdi', attivo: true }
]

const cliente = clienti.find(c => c.id === 2)
console.log(cliente.nome) // 'Giulia Bianchi'

const indice = clienti.findIndex(c => c.id === 2)
console.log(indice) // 1

const nonEsiste = clienti.find(c => c.id === 99)
console.log(nonEsiste) // undefined
```

## some e every

`some` restituisce `true` se **almeno un** elemento soddisfa la condizione. `every` restituisce `true` se **tutti** gli elementi la soddisfano.

```javascript
const magazzino = [
  { prodotto: 'Laptop', qty: 5 },
  { prodotto: 'Mouse', qty: 0 },
  { prodotto: 'Monitor', qty: 3 }
]

// Almeno un prodotto esaurito?
const haEsauriti = magazzino.some(p => p.qty === 0)
console.log(haEsauriti) // true

// Tutti i prodotti disponibili?
const tuttiDisponibili = magazzino.every(p => p.qty > 0)
console.log(tuttiDisponibili) // false
```

## reduce

`reduce` riduce l'array ad un **singolo valore** accumulando i risultati. È il metodo più potente e versatile.

```javascript
const ordini = [
  { prodotto: 'Laptop', qty: 1, prezzo: 1299 },
  { prodotto: 'Mouse', qty: 3, prezzo: 29 },
  { prodotto: 'Monitor', qty: 2, prezzo: 449 }
]

// Calcola il fatturato totale
const fatturato = ordini.reduce((totale, ordine) => {
  return totale + (ordine.qty * ordine.prezzo)
}, 0)

console.log(fatturato) // 2284 (1299 + 87 + 898)

// Conta elementi per categoria
const inventario = ['laptop', 'mouse', 'laptop', 'monitor', 'mouse', 'laptop']
const conteggio = inventario.reduce((acc, prodotto) => {
  acc[prodotto] = (acc[prodotto] || 0) + 1
  return acc
}, {})

console.log(conteggio) // { laptop: 3, mouse: 2, monitor: 1 }
```

## Concatenare i metodi (chaining)

I metodi array possono essere incatenati: l'output di uno diventa l'input del successivo. Questo permette di esprimere trasformazioni complesse in modo leggibile.

```javascript
const ordini = [
  { id: 1, prodotto: 'Laptop', importo: 1299, completato: true },
  { id: 2, prodotto: 'Mouse', importo: 29, completato: false },
  { id: 3, prodotto: 'Monitor', importo: 449, completato: true },
  { id: 4, prodotto: 'Tastiera', importo: 89, completato: true },
  { id: 5, prodotto: 'Webcam', importo: 79, completato: false }
]

// Fatturato degli ordini completati
const fatturatoCompletati = ordini
  .filter(o => o.completato)        // solo completati: [1, 3, 4]
  .map(o => o.importo)              // estrai importi: [1299, 449, 89]
  .reduce((tot, imp) => tot + imp, 0) // somma: 1837

console.log(`Fatturato completati: €${fatturatoCompletati}`) // €1837
```

## Esercizi

### Esercizio 1 — Pipeline di dati

Dato un array di ordini, usa `filter`, `map` e `reduce` in catena per calcolare il fatturato totale solo degli ordini completati.

```javascript
const ordini = [
  { id: 'ORD-001', prodotto: 'Laptop', quantita: 2, prezzoUnitario: 1299, completato: true },
  { id: 'ORD-002', prodotto: 'Mouse', quantita: 5, prezzoUnitario: 29, completato: false },
  { id: 'ORD-003', prodotto: 'Monitor', quantita: 1, prezzoUnitario: 449, completato: true },
  { id: 'ORD-004', prodotto: 'Tastiera', quantita: 3, prezzoUnitario: 89, completato: true },
  { id: 'ORD-005', prodotto: 'Webcam', quantita: 2, prezzoUnitario: 79, completato: false }
]

const fatturatoCompletati = ordini
  // 1. filtra solo gli ordini completati
  // 2. trasforma in importo totale per ordine (quantita * prezzoUnitario)
  // 3. somma tutti gli importi

console.log(`Fatturato: €${fatturatoCompletati}`) // €3063
```

### Esercizio 2 — Media voti per studente

Dato un array di studenti con i loro voti, usa `map` per creare un nuovo array con nome e media calcolata con `reduce`.

```javascript
const studenti = [
  { nome: 'Alice', voti: [8, 7, 9, 6, 8] },
  { nome: 'Bruno', voti: [6, 5, 7, 8, 6] },
  { nome: 'Chiara', voti: [9, 10, 9, 8, 10] },
  { nome: 'Davide', voti: [7, 6, 8, 7, 9] }
]

const risultati = studenti.map(studente => ({
  nome: studente.nome,
  media: /* calcola la media con reduce */
}))

console.log(risultati)
// [
//   { nome: 'Alice', media: 7.6 },
//   { nome: 'Bruno', media: 6.4 },
//   { nome: 'Chiara', media: 9.2 },
//   { nome: 'Davide', media: 7.4 }
// ]

// Sfida: trova lo studente con la media più alta usando reduce su risultati
```

### Esercizio 3 — Ricerca prodotti

Scrivi una funzione `cercaProdotti(prodotti, categoria, prezzoMax)` che filtra i prodotti disponibili, della categoria richiesta, con prezzo ≤ prezzoMax.

```javascript
const catalogo = [
  { nome: 'Laptop Pro', categoria: 'Elettronica', prezzo: 1299, disponibile: true },
  { nome: 'Mouse Wireless', categoria: 'Accessori', prezzo: 29, disponibile: true },
  { nome: 'Monitor 4K', categoria: 'Elettronica', prezzo: 449, disponibile: false },
  { nome: 'Tastiera Meccanica', categoria: 'Accessori', prezzo: 89, disponibile: true },
  { nome: 'Webcam HD', categoria: 'Accessori', prezzo: 79, disponibile: true },
  { nome: 'Cuffie BT', categoria: 'Audio', prezzo: 149, disponibile: true }
]

function cercaProdotti(prodotti, categoria, prezzoMax) {
  return prodotti.filter(/* il tuo codice */)
}

console.log(cercaProdotti(catalogo, 'Accessori', 100))
// [
//   { nome: 'Mouse Wireless', ... },
//   { nome: 'Tastiera Meccanica', ... },
//   { nome: 'Webcam HD', ... }
// ]

console.log(cercaProdotti(catalogo, 'Elettronica', 500))
// [] — Monitor 4K non è disponibile, Laptop supera il prezzo
```
