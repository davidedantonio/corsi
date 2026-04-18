---
sidebar_position: 4.5
---

# La parola chiave `this`

Uno dei meccanismi che possono creare confusione quando si ha a che fare con JavaScript è la parola chiave `this`: è una parola chiave speciale che identifica un automatismo che definisce l'ambito di una funzione. Ogni funzione, mentre è in esecuzione, possiede un riferimento al contesto di esecuzione corrente, chiamato `this`, il quale non fa mai riferimento ad un tipo primitivo ma ad un oggetto. Ci sono poche regole fondamentali su come la parola chiave `this` viene associata al contesto di esecuzione e tutte dipendono da dove il codice di una funzione viene eseguito. Nel corso di questa sezione analizzeremo queste regole, partendo da alcuni concetti chiave del linguaggio JavaScript molto legate alla parola chiave `this`, come l'ambito ed il contesto.

## Non facciamo confusione

Una delle cose fondamentali da non fare quando si parla della parola chiave `this` in JavaScript, è quella di pensare che si riferisca ad una classe, ad oggetti, istanze e tutte le altre cose del mondo della programmazione orientata agli oggetti. Inoltre, non bisogna paragonare questa parola chiave a quella degli altri linguaggi di programmazione. Un'altra cosa importante da chiarire è che il contesto ("Context") e l'ambito ("Scope") di una funzione non sono la stessa cosa. Molti sviluppatori confondono i due termini, descrivendo in modo errato uno per l'altro. Quindi chiariamo subito il significato di questi due concetti prima di proseguire.

*L'ambito ha a che fare con la visibilità delle variabili*. In JavaScript, si ottiene attraverso l'utilizzo delle funzioni. Quando usiamo la parola chiave var all'interno di una funzione, la variabile che stai inizializzando è privata per la funzione e non può essere vista al di fuori. Ma se dichiariamo altre funzioni al suo interno, allora quelle funzioni "interne" possono accedere a quella variabile perché si trovano nello stesso ambito. Le funzioni possono anche alle variabili dichiarate al loro interno ed a quelle dichiarate all'esterno, ma mai a quelle dichiarate all'interno di funzioni nidificate. Questo in JavaScript prende il nome di ambito.

*Il contesto, è legato agli oggetti*. Si riferisce all'oggetto a cui appartiene una funzione. Quando si utilizza la parola chiave JavaScript `this`, si fa riferimento all'oggetto a cui appartiene la funzione. Il contesto di esecuzione, in cui `this` viene valutato, altro non è che il luogo in cui una particolare funzione viene invocata e in che modo viene invocata.

## Ambito globale

Per comprendere bene questa regola fondamentale partiamo dal seguente frammento di codice:

```javascript
function introduceYourself () {
  console.log(`My name is ${this.name}`)
}

introduceYourself()
```

Nelle prime tre linee di codice abbiamo dichiarato una funzione `introduceYourself` che fa riferimento alla parola chiave `this` ed in particolare alla proprietà `name`. Subito dopo la dichiarazione di questa funzione la invochiamo. In questo caso `this`, non fa riferimento a nessun oggetto ma all'ambito globale di esecuzione del browser, quindi visto che l'abito globale non possiede alcuna proprietà `name` non c'è da stupirsi se il risultato che verrà restituito è `undefined`. Questo accade quando il codice non viene eseguito in _"modalità rigorosa"_ (`strict mode`). Infatti se proviamo a modificare il codice aggiungendo `strict mode` all'inizio del nostro file:

```javascript
'use strict'

function introduceYourself () {
  console.log(`My name is ${this.name}`)
}

introduceYourself()
```

Otterremo un `TypeError` in fase di esecuzione:

```javascript
Uncaught TypeError: Cannot read properties of undefined (reading 'name')
    at introduceYourself (<anonymous>:4:34)
    at <anonymous>:7:1
```

## Legame implicito

Per comprendere la seconda regola riprendiamo la funzione `introduceYourself` definita nell'esempio precedente e creiamo due oggetti con un riferimento ad essa. Ricordiamo che l'obiettivo è quello di essere in grado di guardare la definizione di una funzione utilizzando la parola chiave `this` e capire a cosa fa riferimento. Questa regola riuscirà a farci capire a cosa fa riferimento `this` nell'80% delle volte.

```javascript
function introduceYourself () {
  console.log(`My name is ${this.name}`)
}

const person1 = { name: 'Paul', introduceYourself: introduceYourself }
const person2 = { name: 'Steve', introduceYourself: introduceYourself }
```

Nel codice appena mostrato abbiamo due oggetti `person1` e `person2` con due proprietà. La prima proprietà è `name`, una stringa, che identifica il nome di una persona. Ora se vogliamo invocare la funzione `introduceYourself` sull'oggetto `person1` e `person2` dobbiamo utilizzare il punto `.`, nel modo seguente:

```javascript
person1.introduceYourself()
person2.introduceYourself()
```

Questo ci porta al punto chiave principale della regola. Per capire a cosa fa riferimento la parola chiave `this`, dobbiamo guardare prima a sinistra del punto in cui la funzione viene invocata. Se è presente un _"punto"_, guarda a sinistra di quel punto per trovare l'oggetto a cui fa riferimento la parola chiave `this`.

Nell'esempio sopra, `person1` e `person2` si trovano a _"sinistra del punto"_, il che significa che la parola chiave `this` fa riferimento prima all'oggetto `person1` e poi all'oggetto `person2`. Quindi è come se, all'interno della funzione `introduceYourself`, l'interprete JavaScript lo cambiasse `this` in `person1` e `person2`.

Eseguendo lo script il risultato che otterrete sarà il seguente:

```
Paul
Steve
```

Ora facciamo un esempio simile, ma leggermente più avanzato. Definiamo una terza proprietà, `father`, al nostro oggetto `person2` che è il riferimento a `person1`:

```javascript
function introduceYourself () {
  console.log(`My name is ${this.name}`)
}

const person1 = { name: 'Paul', introduceYourself: introduceYourself }
const person2 = { name: 'Steve', introduceYourself: introduceYourself, father: person1 }

person2.introduceYourself()
person2.father.introduceYourself()
```

Come già detto in precedenza, l'80% delle volte dobbiamo vedere quello che c'è alla _"sinistra del punto"_ per capire a chi fa riferimento `this` quando invochiamo la funzione `introduceYourself`. Quando `introduceYourself` viene invocata la prima volta l'oggetto alla sinistra del punto è `person2` di conseguenza `this.name` farà riferimento alla stringa _"Steve"_. Quando `introduceYourself` viene invocata la seconda volta, invece, alla sinistra del punto c'è la proprietà `father`, che è un riferimento a `person1`, di conseguenza `this.name` farà riferimento alla stringa _"Paul"_.

## Legame esplicito

Riconsideriamo per un attimo l'esempio fatto nel precedente paragrafo, ma questa volta senza creare alcun riferimento tra la funzione `introduceYourself` e l'oggetto `person`.

```javascript
function introduceYourself () {
  console.log(`My name is ${this.name}`)
}

const person = { name: 'Paul' }
```

Sappiamo che per sapere a cosa fa riferimento la parola chiave `this`, dobbiamo prima guardare dove viene invocata la funzione. Ora, questo solleva la domanda, come possiamo invocare `introduceYourself` ma farlo invocare con la parola chiave `this` che fa riferimento all'oggetto utente? Non possiamo semplicemente utilizzare `person.introduceYourself()` come abbiamo fatto prima perché person non ha un metodo `introduceYourself`. In JavaScript, ogni funzione contiene un metodo che ci consente di fare esattamente questo. E quel metodo si chiama `call`.

:::tip
*`call`* è un metodo presente su ogni funzione che permette di specificare, come primo parametro, il contesto in cui verrà invocata quella funzione. In altre parole, il primo argomento che passerai sarà ciò a cui fa riferimento la parola chiave `this` all'interno di quella funzione. Per maggiori informazioni consultare la [documentazione MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call).
:::

Detto ciò, possiamo invocare `introduceYourself` nel contesto `person` in questo modo:

```javascript
introduceYourself.call(person)
```

Rispetto alla regola di associazione implicita, questa volta non dobbiamo guardare alla _"sinistra del punto"_, bensì dobbiamo guardare solo ed esclusivamente al primo parametro della funzione `call`, quello sarà l'ambito a cui farà riferimento `this` nella funzione `introduceYourself`. È esattamente questo il motivo per cui questa regola viene definita come legame esplicito, perché stiamo esplicitamente (utilizzando `.call`), specificando a cosa fa riferimento la parola chiave `this`.

```javascript
function introduceYourself () {
  console.log(`My name is ${this.name}`)
}

const person = { name: 'Paul' }
introduceYourself.call(person)
```

Eseguendo questo script il risultato sarà il seguente:

```
My name is Paul
```

Ora proviamo a modificare la nostra funzione `introduceYourself` in modo che abbia due ulteriori argomenti, `gender` e `age`.

```javascript
function introduceYourself (gender, age) {
  console.log(`My name is ${this.name}, I'm a ${gender} of ${age} years old!`)
}
```

Ora se vogliamo passare gli argomenti alla funzione `call`, dobbiamo farlo uno alla volta dopo aver specificato il primo argomento che ne identifica il contesto.

```javascript
'use strict'

function introduceYourself (gender, age) {
  console.log(`My name is ${this.name}, I'm a ${gender} of ${age} years old!`)
}

const person = { name: 'Paul' }
const arguments = ['male', 36]
introduceYourself.call(person, arguments[0], arguments[1])
```

Ecco come passare argomenti a una funzione invocata con `call`. Tuttavia, è un po' fastidioso dover passare gli argomenti uno per uno dal nostro array di argomenti. Sarebbe bello se potessimo passare l'intero array come secondo argomento e JavaScript li diffonderebbe per noi. Questo è esattamente ciò che fa `apply`. `apply` funziona esattamente come `.call`, ma invece di passare gli argomenti uno per uno, possiamo passare un singolo array e `apply` si occuperà di distribuire ogni elemento dell'array per noi come argomenti della funzione.

Quindi ora usando `apply`, il nostro codice può cambiare in questo modo:

```javascript
'use strict'

function introduceYourself (gender, age) {
  console.log(`My name is ${this.name}, I'm a ${gender} of ${age} years old!`)
}

const person = { name: 'Paul' }
const arguments = ['male', 36]
introduceYourself.apply(person, arguments)
```

Finora, con la nostra regola _"Legame esplicito"_, abbiamo imparato a conoscere `.call` e `.apply` che consentono entrambi di invocare una funzione, specificando a cosa farà riferimento la parola chiave `this` all'interno di quella funzione. L'ultima funzione che dobbiamo conoscere ora è `bind`. Questa funzione è identica a `call` ma invece di invocare immediatamente la funzione, restituirà una nuova funzione che possiamo invocare in un secondo momento. Quindi, se guardiamo il nostro codice precedente, utilizzando `bind`, sarà il seguente:

```javascript
'use strict'

function introduceYourself (gender, age) {
  console.log(`My name is ${this.name}, I'm a ${gender} of ${age} years old!`)
}

const person = { name: 'Paul' }
const arguments = ['male', 36]
const newPrint = introduceYourself.bind(person, arguments[0], arguments[1])
newPrint()
```

## La parola chiave new

Un ulteriore modo per comprendere a cosa fa riferimento `this` è la parola chiave `new`. Se non hai familiarità con questa parola chiave in JavaScript, considera che ogni volta che invochi una funzione con la parola chiave `new`, l'interprete JavaScript creerà un nuovo oggetto per te e lo chiamerà `this`. Quindi, naturalmente, se una funzione è stata chiamata con `new`, la parola chiave `this` fa riferimento a quel nuovo oggetto creato dall'interprete.

```javascript
function Person (name, age) {
  this.name = name
  this.age = age
}

const me = new Person('Davide', 36)
```

Nell'esempio appena mostrato JavaScript crea un nuovo oggetto chiamato __"`this`"__ che delega a `Person.prototype` le ricerche non riuscite. Se una funzione viene chiamata con la parola chiave `new`, allora è questo nuovo oggetto creato dall'interprete a cui fa riferimento parola chiave `this`.

## Legame lessicale

La parola chiave `this` in JavaScript è probabilmente più complessa di quanto dovrebbe essere. Ecco la buona notizia, questa prossima regola è la più intuitiva. È probabile che tu abbia sentito parlare e abbia usato le funzioni freccia (meglio conosciute come __"arrow function"__). Sono state introdotte a partire da ES6. Consentono di scrivere funzioni in un formato più conciso.

```javascript
persons.map(person => person.name)
```

Ancor più della concisione, questo tipo di funzioni hanno un approccio molto più intuitivo quando si tratta della parola chiave `this`. A differenza delle normali funzioni, le __arrow function__ non hanno `this`. Invece, `this` è determinato lessicalmente. È un modo elegante per dire che `this` è determinato seguendo le normali regole di ricerca delle variabili nella catena prototipale. Chiariamo meglio il concetto con un esempio, prendiamo in considerazione il seguente esempio:

```javascript
const person = {
  name: 'Davide',
  age: 36,
  gender: 'male',
  frameworks: ['Fastify', 'React', 'Vue'],
  introduceYourself() {
    const message = `My name is ${this.name}, I'm a ${this.gender} of ${this.age} years old! My favourite frameworks are: `

    const langs = this.frameworks.reduce(function (str, framework, i) {
      if (i === this.frameworks.length - 1) {
        return `${str} and ${framework}.`
      }

      return `${str} ${framework},`
    }, "")

    console.log(message.concat(langs))
  }
}

person.introduceYourself()
```

Se proviamo ad eseguire questo codice, avreno un errore a runtime:

```
VM561:10 Uncaught TypeError: Cannot read properties of undefined (reading 'length')
    at <anonymous>:10:33
    at Array.reduce (<anonymous>)
    at Object.introduceYourself (<anonymous>:9:35)
    at <anonymous>:21:8
```

Quando invochiamo `person.introduceYourself()`, ci aspettiamo di vedere _My name is Davide, I'm a male of 36 years old! ..._. Secondo il nostro errore, `this.frameworks` non è definito. Esaminiamo i nostri passaggi per capire a cosa si riferisce `this` e soprattutto cerchiamo di capire perché non fa riferimento a `person` come dovrebbe essere.

Per prima cosa, dobbiamo guardare dove viene invocata la funzione. La funzione viene passata a `.reduce` quindi non ne abbiamo idea. In realtà non vediamo mai l'invocazione della nostra funzione anonima poiché JavaScript lo fa da solo nell'implementazione di `.reduce`. Questo è il problema. Dobbiamo specificare che vogliamo che la funzione anonima che passiamo a `.reduce` venga invocata nell'ambito di `person`. In questo modo `this.frameworks` farà riferimento a `person.frameworks`. Come abbiamo visto in precedenza, possiamo usare `.bind`:

```javascript
const person = {
  name: 'Davide',
  age: 38,
  gender: 'male',
  frameworks: ['Fastify', 'React', 'Vue'],
  introduceYourself() {
    const message = `My name is ${this.name}, I'm a ${this.gender} of ${this.age} years old! My favourite frameworks are: `

    const langs = this.frameworks.reduce(function (str, framework, i) {
      if (i === this.frameworks.length - 1) {
        return `${str} and ${framework}.`
      }

      return `${str} ${framework},`
    }.bind(this), "")

    console.log(message.concat(langs))
  }
}

person.introduceYourself()
```

Abbiamo visto come `.bind` può risolverci ancora una volta il problema, ma in che modo è collegato alle _arrow functions_? Prima abbiamo detto che all'interno delle _arrow functions_, `this` viene determinato lessicalmente e quindi segue la catena prototipale finché non trova la variabile `frameworks`. Nell'esempio mostrato in precedenza, seguendo la catena prototipale, `this` fa riferimento proprio a `person` e quindi `this.frameworks`. Non c'è motivo di creare un nuovo contesto di esecuzione solo perché abbiamo utilizzato la funzione `.reduce`. Quindi rimuovendo la funzione `.bind(this)` ed utilizzando una _arrow function_ anonima, il codice avrà il seguente aspetto:

```javascript
const person = {
  name: 'Davide',
  age: 36,
  gender: 'male',
  frameworks: ['Fastify', 'React', 'Vue'],
  introduceYourself() {
    const message = `My name is ${this.name}, I'm a ${this.gender} of ${this.age} years old! My favourite frameworks are: `

    const langs = this.frameworks.reduce((str, framework, i) => {
      if (i === this.frameworks.length - 1) {
        return `${str} and ${framework}.`
      }

      return `${str} ${framework},`
    }, "")

    console.log(message.concat(langs))
  }
}

person.introduceYourself()
```

Anche in questo caso il risultato che otterremo sarà:

```
My name is Davide, I'm a male of 36 years old! My favourite frameworks are:  Fastify, React, and Vue.
```

Questo risultato dimostra come le _arrow function_ non hanno il loro proprio `this`. Invece l'interprete JavaScript cercherà nell'ambito (genitore) che lo racchiude per determinare a cosa si riferisce.

## Esercizi

### Esercizio 1 — Contatore con bind

Crea un oggetto `contatore` con una proprietà `valore: 0` e un metodo `incrementa()`. Poi usa `.bind()` per creare una funzione standalone che funzioni senza il contesto dell'oggetto.

```javascript
const contatore = {
  valore: 0,
  incrementa() {
    this.valore++
    console.log(`Valore: ${this.valore}`)
  }
}

// Legame implicito — funziona
contatore.incrementa() // Valore: 1

// Senza bind — this è undefined in strict mode
const incrementaStandalone = contatore.incrementa
// incrementaStandalone() // ❌ TypeError

// Con bind — funziona
const incrementaConBind = contatore.incrementa.bind(contatore)
incrementaConBind() // Valore: 2
incrementaConBind() // Valore: 3
```

### Esercizio 2 — Timer con arrow function

Crea una classe `Timer` con un metodo `avvia()` che usa `setInterval`. Usa una arrow function all'interno di `setInterval` per evitare problemi con `this`. Aggiungi un metodo `ferma()`.

```javascript
class Timer {
  constructor() {
    this.secondi = 0
    this.intervallo = null
  }

  avvia() {
    // usa arrow function nel setInterval per preservare this
    this.intervallo = setInterval(() => {
      this.secondi++
      console.log(`Secondi: ${this.secondi}`)
    }, 1000)
  }

  ferma() {
    clearInterval(this.intervallo)
    console.log(`Timer fermato dopo ${this.secondi} secondi`)
  }
}

const timer = new Timer()
timer.avvia()
setTimeout(() => timer.ferma(), 5000) // si ferma dopo 5 secondi
```
