---
sidebar_position: 3
---

# Oggetti

Tutto ciò che in JavaScript non è un tipo primitivo è un oggetto. Un oggetto altro non è che un insieme di coppie chiavi valori (`key: value`), dove i valori possono essere a loro volta oggetti, variabili primitive o funzioni. Se un oggetto ha più coppie chiave valore, queste devono essere separate da una virgola `,`. È possibile dichiarare un oggetto in due modi, il primo è quello di utilizzare il costruttore `Object` ed il secondo è quello di dichiarare una variabile in cui le coppie chiave valore vengono racchiuse da `{}`. Vediamo come fare con un piccolo esempio:

```javascript
const student = {
  name: 'Davide',
  number: '123456'
}

const classroom = new Object({
  name: 'Computer Science I',
  teacher: 'Dennis Ritchie'
})

console.log(student)
console.log(classroom)
```

Eseguendo questo script il risultato che otterremo sarà il seguente:

```json
{ name: 'Davide', number: '123456' }
{ name: 'Computer Science I', teacher: 'Dennis Ritchie' }
```

È possibile accedere ad una proprietà di un oggetto utilizzando il punto `.`:

```javascript
const student = {
  name: 'Davide',
  number: '123456'
}

const classroom = new Object({
  name: 'Computer Science I',
  teacher: 'Dennis Ritchie'
})

console.log(`Student: ${student.name}`)
console.log(`Teacher: ${classroom.teacher}`)
```

eseguendo questo script il risultato che otterremo sarà:

```
Student: Davide
Teacher: Dennis Ritchie
```

:::tip
La parola chiave *`const`* rende una variabile non modificabile, non il contenuto assegnatogli. Quando il contenuto di una variabile di questo tipo è un oggetto, significa che l'oggetto stesso può ancora essere modificato. Pertanto, è possibile modificare il contenuto dell'oggetto dichiarato con variabile `const`, ma non è possibile assegnare un nuovo oggetto a una variabile `const`.
:::

## Definire le proprietà di un oggetto

Esistono diversi modi per definire le proprietà di un oggetto in JavaScript. Il primo è quello di specificare il nome dell'oggetto seguito da: un punto, il nome della nuova proprietà, un segno di uguale e il valore della nuova proprietà:

```javascript
const student = {
  name: 'Davide',
  number: '123456'
}

student.birthday = '4th July'

console.log(student)
```

questo script stamperà a video 

```json
{ name: 'Davide', number: '123456', birthday: '4th July' }
```

### Object.assign

Combinare le proprietà tra due oggetti è una prassi comune. Farlo proprietà per proprietà però non solo è limitativo, ma anche noioso. La funzione statica `Object.assign` ci aiuta a farlo con poche linee di codice. Vediamo come funziona con un piccolo esempio:

```javascript
const obj = {}
const student = {
  name: 'Davide',
  number: '123456'
}

Object.assign(obj, student, {
  birthday: '4th July'
})

console.log(obj)
```

eseguendo lo script otterremo il seguente risultato:

```json
{ name: 'Davide', number: '123456', birthday: '4th July' }
```

La funzione itera tutte le proprietà degli oggetti passati in input, partendo dall'ultimo, e li assegna all'oggetto dato in input in precedenza. Quindi nell'esempio appena descritto la proprietà `birthday` viene assegnata all'oggetto `student` e le proprietà dell'oggetto `student` a loro volta vengono assegnate ad `obj`. Se la proprietà che stiamo assegnando esiste nell'oggetto più a sinistra passato come parametro, questa verrà sovrascritta con quella nuova. Modificando lo script nel modo seguente:

```javascript
const obj = {
  birthday: '2nd July'
}

const student = {
  name: 'Davide',
  number: '123456',
  birthday: '3rd July'
}

Object.assign(obj, student, {
  birthday: '4th July'
})

console.log(obj)
```

Tenendo conto di quanto detto in precedenza, non c'è da meravigliarsi se il risultato che otterremo eseguendo questo script sarà lo stesso di quello ottenuto nel precedente esempio:

```json
{ name: 'Davide', number: '123456', birthday: '4th July' }
```

### Object.defineProperty

La funzione statica `Object.defineProperty` ci consente di definire non solo il nome della proprietà ed eventualmente il suo valore, bensì ci fornisce una serie di opzioni che possono essere utili sulla proprietà che stiamo andando a definire. In particolare la funzione prende in input tre parametri:

1. L'oggetto a cui si vuole aggiungere una proprietà.
2. Il nome della proprietà.
3. Un'oggetto le cui proprietà descrivono sia i dati che le modalità di accesso alla proprietà. Vediamo quali sono:
  * `configurable`: se impostata a `true` la proprietà può essere eliminata o modificata. Il suo valore di default è `false`
  * `enumerable`: se impostata a `true` la proprietà sarà visibile durante l'enumerazione delle proprietà sull'oggetto (per esempio `for..in` o `Object.keys()`). Il suo valore di default è `false`.
  * `value`: il valore che vogliamo assegnare alla proprietà. Il suo valore di default è `undefined`.
  * `writable`: se impostata a `true` la proprietà può essere sovrascritta. Il suo valore di default è `false`.
  * `get`: una funzione che rappresenta il metodo che ritorna il valore della proprietà aggiunta. Il suo valore di default è `undefined`.
  * `set`: una funzione che rappresenta il metodo che imposta il valore della proprietà aggiunta. Il suo valore di default è `undefined`.

Vediamo come utilizzare questa funzione con qualche esempio pratico. Definiamo una nuova proprietà `birthday` sul nostro oggetto `student`. Questa proprietà sarà solo leggibile una volta definita e non sarà modificabile quindi, oltre a dare un valore iniziale alla proprità `value`, impostiamo anche la proprietà `writable` a `false`:

```javascript
'use strict'

const student = {
  name: 'Davide',
  number: '123456'
}

Object.defineProperty(student, 'birthday', {
  writable: false,
  value: '4th July'
})

console.log(student) // [1]
console.log(student.birthday) // [2]

// [3]
student.birthday = 'Another date'
console.log(student.birthday)
```

eseguendo lo script otterrete un'errore in fase di esecuzione:

```
Uncaught TypeError: Cannot assign to read only property 'birthday' of object '#<Object>'
    at <anonymous>:16:18
```

Analizziamo i tre punti evidenziati nello script: 

1. Non avendo definito la proprietà `enumerable` questa avrà il valore di default a `false`, di conseguenza quando proviamo a stampare l'intero oggetto a video con `console.log`, la proprietà `birthday` ed il suo relativo valore non verranno visualizzate. 
2. Il secondo `console.log` stamperà correttamente a video il valore della proprietà `birthday`.
3. Avendo impostato il valore dell'opzione `writable` a `false`, la proprietà `birthday` non potrà essere sovrascritta di conseguenza otterremo un errore in fase di esecuzione.

Vediamo come cambia il comportamento del punto `1` e del punto `3`, effettuando qualche modifica al nostro codice:

```javascript
...
Object.defineProperty(student, 'birthday', {
  writable: true,
  enumerable: true,
  value: '4th July'
})
...
```

Avendo impostato la proprietà `writable` a `true`, e avendo specificato la proprietà `enumerable` a `true`, lo script non terminerà con un errore e verrà visualizzata anche la proprietà `birthday` che in precedenza non era visibile:

```
{ name: 'Davide', number: '123456', birthday: '4th July' }
4th July
Another date
```

In JavaScript è possibile eliminare la proprietà di un oggetto utilizzando `delete`. Prendendo in considerazione sempre l'oggetto `student`, proviamo ad eliminare la proprietà `birthday` definita in precedenza. Aggiungiamo queste due righe alla fine del nostro script:

```javascript
...
Object.defineProperty(student, 'birthday', {
  writable: true,
  enumerable: true,
  value: '4th July'
})

...

delete student.birthday
console.log(student)
```

Se eseguiamo questo script otterremo il seguente errore in fase di esecuzione:

```
Uncaught TypeError: Cannot delete property 'birthday' of #<Object>
    at <anonymous>:12:1
```

Otteniamo questo errore in quanto il parametro `configurable` è impostato di default a `false`. Questo significa che non è possibile eliminare la proprietà `birthday` dal nostro oggetto. Se proviamo ad impostarlo a `true` nel modo seguente:

```javascript
...
Object.defineProperty(student, 'birthday', {
  enumerable: true,
  writable: true,
  enumerable: true,
  value: '4th July'
})

...

delete student.birthday
console.log(student)
```

lo script non terminerà più con un errore, anzi i risultati attesi saranno correttamente stampati a video:

```
{ name: 'Davide', number: '123456', birthday: '4th July' }
4th July
Another date
{ name: 'Davide', number: '123456' }
```

## Iterare le proprietà di un oggetto

Come visto nella sezione precedente, `Object.assign` è una funzione molto utile per assegnare una nuova proprietà ad un oggetto. Spesso però capita di avere la necessità di effettuare operazioni che si basano sulle proprietà di un oggetto. In questa sezione vedremo come farlo in tre diversi modi.

### Object.keys

La funzione `Object.keys` ritorna l'elenco delle proprietà definite per un oggetto in un array di stringhe. Vediamo come funziona con un piccolo esempio:

```javascript
const obj = {
  foo: 'Foo value',
  bar: 'Bar value'
}

for (const prop of Object.keys(obj)) {
  console.log(prop)
}
```

Se eseguiamo lo script, verranno stampate le seguenti righe a video:

```
foo
bar
```

La funzione `Object.keys` ritorna un array i cui valori sono i nomi delle proprietà dell'oggetto. Possiamo iterare questo array con un ciclo `for..of`. La variabile `prop` ad ogni iterazione conterrà il nome della proprietà corrente.

### Object.entries

Un'altra funzione interessante che JavaScript mette a disposizione è `Object.entries`. A differenza della funzione `Object.keys`, questa funzione ritorna le coppie chiave valore dell'oggetto su cui viene invocato:

```javascript
const obj = {
  foo: 'Foo value',
  bar: 'Bar value'
}

for (const [prop, value] of Object.entries(obj)) {
  console.log(`${prop}: ${value}`)
}
```

Eseguendo lo script, il risultato che otterremo a video sarà il seguente:

```
foo: Foo value
bar: Bar value
```

La sintassi `[prop, value]` destruttura l'array ricevuto come in due variabili distinte, che rappresentano rispettivamente il nome ed il valore della proprietà, restituita ad ogni ciclo dell'iterazione che stiamo effettuando. In alternativa, possiamo utilizzare una singola variabile, ad esempio `item`, in cui troveremo alla posizione `0` il nome della proprietà e alla posizione `1` il rispettivo valore.

### Object.getOwnPropertyNames

`Object.getOwnPropertyNames` è una funzione che restituisce un array i cui elementi sono stringhe corrispondenti alle proprietà enumerabili e non dell'oggetto dato in input. Vediamo come funziona con un esempio:

```javascript
const obj = {
  foo: 'Foo value',
  bar: 'Bar value'
}

Object.defineProperty(obj, 'notEnum', {
  value: 'Not enumerable var'
})

console.log(Object.keys(obj))
console.log(Object.getOwnPropertyNames(obj))
```

A differenza degli esempi fatti in precedenza con `Object.keys`, la funzione `Object.getOwnPropertyNames` restituisce tutte le proprietà dell'oggetto passatogli in input, comprese quelle non enumerabili. Infatti eseguendo lo script il risultato che otterremo sarà il seguente:

```
[ 'foo', 'bar' ]
[ 'foo', 'bar', 'notEnum' ]
```

La funzione restituisce tutte le proprietà dell'oggetto indipendentemente dal fatto che queste siano enumerabili.

## Esercizi

### Esercizio 1 — Oggetto Prodotto con proprietà protetta

Crea un oggetto `prodotto` e usa `Object.defineProperty` per rendere il `codice` non modificabile.

```javascript
const prodotto = {
  nome: 'Laptop Pro',
  prezzo: 1299.99,
  quantita: 5,
  disponibile: true
}

// Aggiungi la proprietà 'codice' non modificabile con Object.defineProperty
Object.defineProperty(prodotto, 'codice', {
  value: 'LAP-001',
  writable: false,
  enumerable: true,
  configurable: false
})

// Aggiungi un metodo descrizione()
prodotto.descrizione = function () {
  return `[${this.codice}] ${this.nome} — €${this.prezzo} (qty: ${this.quantita})`
}

console.log(prodotto.descrizione())
// [LAP-001] Laptop Pro — €1299.99 (qty: 5)

// Prova a modificare il codice (in strict mode lancia un TypeError)
'use strict'
prodotto.codice = 'NUOVO'  // TypeError: Cannot assign to read only property
```

### Esercizio 2 — Merge di configurazioni

Usa `Object.assign` per creare una configurazione finale che unisce default e impostazioni utente.

```javascript
const configDefault = {
  lingua: 'it',
  tema: 'chiaro',
  notifiche: true,
  elementiPerPagina: 10,
  timeout: 30000
}

const configUtente = {
  tema: 'scuro',
  elementiPerPagina: 25
}

// Crea la configurazione finale senza modificare configDefault
const configFinale = // il tuo codice

console.log(configFinale.lingua)           // 'it'
console.log(configFinale.tema)             // 'scuro'
console.log(configFinale.elementiPerPagina) // 25
console.log(configDefault.tema)            // 'chiaro' — invariato
```

### Esercizio 3 — Inventario dinamico

Costruisci un oggetto inventario partendo da un array di prodotti.

```javascript
const prodotti = [
  { codice: 'LAP-001', nome: 'Laptop Pro', qty: 5 },
  { codice: 'MOU-042', nome: 'Mouse Wireless', qty: 23 },
  { codice: 'MON-007', nome: 'Monitor 4K', qty: 8 },
  { codice: 'KEY-019', nome: 'Tastiera Meccanica', qty: 12 }
]

// 1. Costruisci l'oggetto inventario usando un ciclo for...of
//    La chiave è il codice, il valore è l'oggetto prodotto
const inventario = {}
for (const prodotto of prodotti) {
  // il tuo codice
}

// 2. Scrivi la funzione cercaProdotto(codice)
function cercaProdotto(codice) {
  // usa l'accesso diretto per chiave (O(1), non serve Object.keys)
}

console.log(cercaProdotto('MOU-042'))
// { codice: 'MOU-042', nome: 'Mouse Wireless', qty: 23 }

console.log(cercaProdotto('XXX-999'))
// undefined

// 3. Stampa il totale dei prodotti a magazzino usando Object.values
const totalePezzi = Object.values(inventario).reduce((tot, p) => tot + p.qty, 0)
console.log(`Totale pezzi a magazzino: ${totalePezzi}`) // 48
```