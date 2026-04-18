---
sidebar_position: 3
---

# Controllo del Flusso

Nei programmi reali raramente il codice viene eseguito in modo lineare dall'inizio alla fine. Il **controllo del flusso** ci permette di prendere decisioni, ripetere operazioni e saltare blocchi di codice in base a determinate condizioni. In JavaScript gli strumenti principali per controllare il flusso di esecuzione sono le istruzioni condizionali (`if`, `switch`) e i cicli (`for`, `while`).

## if, else if, else

L'istruzione `if` è la forma più semplice di controllo del flusso. Permette di eseguire un blocco di codice solo se una certa condizione è vera (`true`). La sintassi di base è la seguente:

```javascript
if (condizione) {
  // blocco eseguito se condizione è true
}
```

Possiamo aggiungere un blocco alternativo con `else`, eseguito quando la condizione è falsa:

```javascript
const velocita = 130

if (velocita > 110) {
  console.log('Stai andando troppo forte!')
} else {
  console.log('Velocità nei limiti.')
}
```

Quando le alternative sono più di due, usiamo `else if` per concatenare più condizioni:

```javascript
const punteggio = 75

if (punteggio >= 90) {
  console.log('Ottimo')
} else if (punteggio >= 70) {
  console.log('Buono')
} else if (punteggio >= 50) {
  console.log('Sufficiente')
} else {
  console.log('Insufficiente')
}
```

Le condizioni vengono valutate dall'alto verso il basso: appena una risulta vera, il relativo blocco viene eseguito e le restanti vengono ignorate.

### Operatore ternario

Quando vogliamo assegnare un valore in base a una condizione semplice, l'operatore ternario `? :` è un'alternativa compatta all'`if/else`:

```javascript
const eta = 20
const accesso = eta >= 18 ? 'consentito' : 'negato'

console.log(accesso) // consentito
```

La sintassi è `condizione ? valoreSeVero : valoreSeFalso`. È utile per espressioni semplici, ma se la logica è complessa è preferibile usare un `if/else` tradizionale per mantenere il codice leggibile.

## switch

L'istruzione `switch` è utile quando dobbiamo confrontare una variabile con più valori distinti. Rispetto a una serie di `else if`, risulta più leggibile quando i casi sono molti:

```javascript
const giorno = 'lunedì'

switch (giorno) {
  case 'lunedì':
  case 'martedì':
  case 'mercoledì':
  case 'giovedì':
  case 'venerdì':
    console.log('Giorno lavorativo')
    break
  case 'sabato':
  case 'domenica':
    console.log('Weekend')
    break
  default:
    console.log('Giorno non riconosciuto')
}
```

Alcune cose importanti da tenere a mente:

- Il confronto avviene con l'operatore di uguaglianza stretta (`===`).
- L'istruzione `break` è fondamentale: senza di essa, l'esecuzione continua nel `case` successivo (*fall-through*).
- Il blocco `default` viene eseguito se nessun `case` corrisponde ed è opzionale.

Nell'esempio sopra, i `case` di lunedì-venerdì non hanno `break` intenzionalmente: si sfrutta il fall-through per raggrupparli tutti sotto lo stesso comportamento.

## Ciclo for

Il ciclo `for` è il più utilizzato quando sappiamo in anticipo quante volte vogliamo ripetere un'operazione. La sintassi è:

```javascript
for (inizializzazione; condizione; aggiornamento) {
  // corpo del ciclo
}
```

Per esempio, per stampare i numeri da 1 a 5:

```javascript
for (let i = 1; i <= 5; i++) {
  console.log(i)
}
```

Le tre parti della dichiarazione `for` sono:
- **inizializzazione**: eseguita una sola volta all'inizio (`let i = 1`);
- **condizione**: verificata prima di ogni iterazione; se è falsa il ciclo termina (`i <= 5`);
- **aggiornamento**: eseguito alla fine di ogni iterazione (`i++`).

### for...of

Il ciclo `for...of` è la scelta ideale per iterare sugli elementi di un array (o di qualsiasi oggetto iterabile come stringhe o `Map`):

```javascript
const modelli = ['Model S', 'Model 3', 'Model X', 'Model Y']

for (const modello of modelli) {
  console.log(modello)
}

// Model S
// Model 3
// Model X
// Model Y
```

A differenza del `for` classico, non serve gestire indici: ad ogni iterazione la variabile `modello` contiene direttamente il valore corrente dell'array.

### for...in

Il ciclo `for...in` serve invece per iterare sulle **chiavi** di un oggetto:

```javascript
const auto = {
  marca: 'Ferrari',
  modello: 'F8 Tributo',
  anno: 2020
}

for (const chiave in auto) {
  console.log(`${chiave}: ${auto[chiave]}`)
}

// marca: Ferrari
// modello: F8 Tributo
// anno: 2020
```

`for...in` itera sulle proprietà enumerabili dell'oggetto. Non è consigliato usarlo sugli array, in quanto potrebbe includere proprietà non attese provenienti dal prototipo: per gli array è sempre preferibile usare `for...of` o i metodi come `forEach`.

## Ciclo while

Il ciclo `while` ripete un blocco di codice finché la condizione specificata rimane vera. A differenza del `for`, è la scelta naturale quando non sappiamo in anticipo quante iterazioni saranno necessarie:

```javascript
let tentativi = 0

while (tentativi < 3) {
  console.log(`Tentativo numero ${tentativi + 1}`)
  tentativi++
}

// Tentativo numero 1
// Tentativo numero 2
// Tentativo numero 3
```

Attenzione: se la condizione non diventa mai falsa, il ciclo diventa infinito e blocca il programma. È sempre necessario assicurarsi che la condizione possa diventare `false`.

### do...while

Il ciclo `do...while` è simile al `while`, ma con una differenza fondamentale: il corpo del ciclo viene eseguito **almeno una volta** prima che la condizione venga verificata:

```javascript
let input

do {
  input = prompt('Inserisci un numero maggiore di 10:')
} while (Number(input) <= 10)

console.log(`Hai inserito: ${input}`)
```

Questo pattern è utile ogni volta che vogliamo eseguire un'operazione e poi decidere se ripeterla, ad esempio leggere l'input di un utente finché non è valido.

## break e continue

Le istruzioni `break` e `continue` permettono di alterare il comportamento normale di un ciclo.

### break

`break` interrompe immediatamente il ciclo, indipendentemente dalla condizione:

```javascript
const numeri = [3, 7, 2, 9, 4, 11, 1]

for (const n of numeri) {
  if (n > 10) {
    console.log(`Trovato numero maggiore di 10: ${n}`)
    break
  }
  console.log(n)
}

// 3
// 7
// 2
// 9
// 4
// Trovato numero maggiore di 10: 11
```

Non appena viene trovato `11`, il ciclo si interrompe e i valori successivi non vengono elaborati.

### continue

`continue` salta l'iterazione corrente e passa direttamente alla successiva, senza uscire dal ciclo:

```javascript
for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) {
    continue
  }
  console.log(i)
}

// 1
// 3
// 5
// 7
// 9
```

In questo caso, ogni volta che `i` è pari la condizione è vera, `continue` viene eseguito e `console.log` viene saltato: vengono stampati solo i numeri dispari.

## Esercizi

### Esercizio 1 — Classificatore di temperature

Scrivi una funzione `classificaTemperatura(gradi)` che riceve una temperatura in Celsius e restituisce una stringa che la descrive:

- sotto 0: `'Gelido'`
- da 0 a 10: `'Freddo'`
- da 11 a 20: `'Fresco'`
- da 21 a 30: `'Caldo'`
- sopra 30: `'Torrido'`

```javascript
function classificaTemperatura(gradi) {
  // usa if / else if / else
}

console.log(classificaTemperatura(-5))  // Gelido
console.log(classificaTemperatura(5))   // Freddo
console.log(classificaTemperatura(15))  // Fresco
console.log(classificaTemperatura(25))  // Caldo
console.log(classificaTemperatura(35))  // Torrido
```

### Esercizio 2 — Numeri pari in un intervallo

Scrivi una funzione `pariInIntervallo(min, max)` che restituisce un array contenente tutti i numeri pari compresi tra `min` e `max` (inclusi).

```javascript
function pariInIntervallo(min, max) {
  // usa un ciclo for e push, oppure continue per saltare i dispari
}

console.log(pariInIntervallo(1, 10))  // [2, 4, 6, 8, 10]
console.log(pariInIntervallo(5, 15))  // [6, 8, 10, 12, 14]
```

### Esercizio 3 — Giorno della settimana

Scrivi una funzione `descriviGiorno(numero)` che riceve un numero da 1 a 7 e restituisce il nome del giorno corrispondente usando `switch`. Se il numero non è valido, restituisce `'Numero non valido'`.

```javascript
function descriviGiorno(numero) {
  // usa switch
}

console.log(descriviGiorno(1))  // Lunedì
console.log(descriviGiorno(5))  // Venerdì
console.log(descriviGiorno(7))  // Domenica
console.log(descriviGiorno(9))  // Numero non valido
```

### Esercizio 4 — Ricerca in un array

Scrivi una funzione `trovaPrimo(array, condizione)` che restituisce il primo elemento dell'array per cui la funzione `condizione` restituisce `true`. Se nessun elemento soddisfa la condizione, restituisce `null`. Usa `break` per interrompere il ciclo non appena l'elemento è trovato.

```javascript
function trovaPrimo(array, condizione) {
  // usa for...of e break
}

const prezzi = [120, 45, 300, 89, 15, 430]

console.log(trovaPrimo(prezzi, p => p > 200))  // 300
console.log(trovaPrimo(prezzi, p => p < 10))   // null
```
