---
sidebar_position: 8
---

# Il DOM

Finora abbiamo scritto codice abbastanza bene nel vuoto. Abbiamo usato `console.log` come meccanismo di output. Non abbiamo davvero fatto nulla in JavaScript che non potesse essere fatto in nessun'altra lingua. Ora inizieremo a utilizzare JavaScript per interagire con la tua pagina web.

Parliamo prima di tutto di cos'è un browser e di come il tuo codice ottiene da te che lo scrivi per essere eseguito in un browser.

In una circostanza tipica.

. Scrivi il codice nel tuo editor (come VSCode).
. Metti il tuo codice su un server in modo che altre persone possano ottenerlo.
. Qualcuno visita il tuo sito web:
.. Qui succedono molte cose. Per ora non ne parleremo.
.. Il loro browser richiede al tuo server il tuo index.html.
.. Il tuo server invia loro una copia dell'html.
.. Il browser legge l'HTML, vede che hai un tag di script `my-script.js` lì.
.. I browser fanno un'altra richiesta per `my-script.js` dal tuo server.
.. Il tuo server invia loro una copia di `my-script.js`.
.. Il browser legge il codice JavaScript e inizia l'esecuzione del codice.

Lo stesso processo si verifica anche con i CSS.

Ok, ecco come funziona se hai messo il tuo codice su qualche server come in un cloud come Microsoft Azure, Amazon Web Services o altri posti come Bluehost o GoDaddy. Quindi come lo stiamo facendo localmente, senza un server, solo sui nostri computer? Il tuo computer sta fondamentalmente falsificando questo processo. Funziona sia come server che come client in modo che sia più facile scrivere codice. Quando apri un file nel tuo browser dal tuo computer, il tuo disco rigido è il server. Questo è stato un punto di confusione per me all'inizio, quindi lo condivido con te.

Il modo in cui JavaScript e HTML/CSS interagiscono tra loro è una cosa chiamata DOM, il modello a oggetti del documento. Il DOM è fondamentalmente un insieme di oggetti e metodi che puoi chiamare da JavaScript per interagire con l'HTML/CSS della pagina.

Nota: qui useremo il tag `script` e inseriremo il JavaScript direttamente al suo interno in modo da poter tenere insieme tutto il codice per questi piccoli esempi. Questo non è qualcosa che faresti in genere (proprio come normalmente separeresti anche il CSS dall'HTML). È possibile ma non consigliato.

Vediamo un esempio:

```html
<style>
  .red-square {
    width: 100px;
    height: 100px;
    background-color: crimson;
  }
</style>

<div class="red-square"></div>

<script>
  const redSquare = document.querySelector('.red-square');
  redSquare.style.backgroundColor = 'limegreen';
</script>
```

Si noti che, nonostante la classe CSS dica che `div` dovrebbe essere di colore `crimson`, in realtà è `limegreen`. Questo perché abbiamo usato JavaScript per cambiarne il colore. Quindi analizziamolo.

* Abbiamo chiamato un metodo su `document`. `document` è una variabile disponibile a livello globale nel browser che usi per interagire con HTML e CSS. Sono molti i metodi che puoi usare. In questo caso, stiamo usando il `querySelector` in cui passi un selettore CSS e ti restituisce il **primo** di quel selettore di corrispondenze che trova (se ne hai molti nella pagina, ottieni solo il primo).

* Da lì, abbiamo un puntatore JavaScript al tag `div.red-square` memorizzato nella variabile `redSquare`, il che significa che possiamo iniziare a manipolarlo.

* Usiamo quindi l'oggetto `style` che rappresenta tutti gli stili CSS che vengono applicati a quell'oggetto in quel momento.

* Quindi impostiamo il `backgroundColor` di quell'elemento. Si noti che è "backgroundColor" e non "background-color" (camelCasing vs kebab-casing). Questo è il modo in cui interagisci con i CSS tramite JavaScript. Tutto ciò che è kebab-cased come `padding-right` diventa camelCased, come `paddingRight`. Anche se fastidioso, sarebbe ancora più fastidioso se non lo cambiassero poiché tutto in JavaScript è camelCased.

* Quindi assegniamo semplicemente che sia il valore che vogliamo. Funziona con qualsiasi proprietà CSS, ad esempio: `tag.style.marginBottom = '50px'`.

C'è molto di più che puoi fare con un elemento oltre a modificarne lo stile. Puoi aggiungere più HTML al suo interno, rimuoverlo, modificare il testo, cercare diversi elementi al suo interno, ottenere la sua posizione sulla pagina, clonarlo e molto altro.

Ok, e se avessimo più elementi che volessimo modificare tutti in una volta. Abbiamo gli strumenti per farlo anche noi!

```html
<ul>
  <li class="js-target">Unchanged</li>
  <li class="js-target">Unchanged</li>
  <li>Won't Change</li>
  <li class="js-target">Unchanged</li>
  <li>Won't Change</li>
  <li class="js-target">Unchanged</li>
</ul>

<script>
  const elementsToChange = document.querySelectorAll('.js-target');
  for (let i = 0; i < elementsToChange.length; i++) {
    const currentElement = elementsToChange[i];
    currentElement.innerText = "Modified by JavaScript!";
  }
</script>
```

## Eventi e listeners

Siamo stati in grado di modificare HTML e CSS usando JavaScript usando `document`. Eccezionale! Faremo un ulteriore passo avanti e inizieremo a coinvolgere l'utente. I siti Web sono pensati per essere reattivi nei confronti degli utenti. Per essere reattivi nei loro confronti, dobbiamo aspettare che facciano cose, come fare clic su un pulsante o digitare un input. Il modo in cui lo facciamo è aspettare che accadano **eventi**. Un evento viene creato ogni volta che si verificano determinati eventi, ad esempio quando un utente fa clic su qualcosa o quando digita qualcosa. Rispondiamo a questi eventi disponendo di quelli che vengono chiamati **event listeners** (ascoltatori di eventi). Diamo ad un listener di eventi una funzione da eseguire ogni volta che si verifica un evento. Diamo un'occhiata alla risposta a un click quando un utente apputno fa click su un pulsante.

```html
<button class="event-button">Click me!</button>
<script>
  const button = document.querySelector('.event-button');
  button.addEventListener('click', function () {
    alert("Hey there!");
  });
</script>
```

Analizziamolo.

* Prendiamo il pulsante tramite `querySelector` e lo memorizziamo nella variabile JavaScript `button`.

* Quindi chiamiamo il metodo `addEventListener` sul pulsante. Questo richiede due parametri (non c'è bisogno di memorizzarlo, puoi sempre cercarlo): il nome dell'evento a cui vuoi rispondere, che in questo caso è l'evento `click`, e una funzione che viene chiamata ogni volta che si verifica quell'evento . Questa funzione è spesso chiamata **callback** perché viene richiamata ogni volta che si verifica 
l'evento.

* Quindi chiamiamo una funzione chiamata `alert`. `alert` è una funzione super, super fastidiosa che fa apparire una finestra di dialogo con qualunque cosa tu la chiami.

* Le persone spesso si confondono vedendo `});` nell'ultima riga. Il primo `}` sta chiudendo la funzione, il secondo `)` sta chiudendo la chiamata alla funzione di `addEventListener` e `;` termina l'istruzione.

Facciamo un altro esempio con un tag `input`.

```html
<input placeholder="type into me!" class="input-to-copy" />
<p class="p-to-copy-to">Nothing has happened yet.</p>

<script>
  const input = document.querySelector('.input-to-copy');
  const paragraph = document.querySelector('.p-to-copy-to');

  input.addEventListener("keyup", function() {
    paragraph.innerText  = input.value;
  });
</script>
```

Prova a digitare nell'input. Vedrai che qualsiasi testo digitato nell'input si rifletterà istantaneamente nel tag `p`. Abbastanza bello, vero?

:::warning innerText, textContent e innerHTML
Usa sempre `innerText` o `textContent` per inserire testo nel DOM. **Non usare `innerHTML` con dati provenienti dall'utente** — permette l'iniezione di codice HTML arbitrario (attacco XSS). Usa `innerHTML` solo con contenuto HTML statico che controlli tu direttamente.

```javascript
// ✅ Sicuro — tratta il valore come testo puro
elemento.textContent = input.value

// ❌ Pericoloso con input utente — esegue eventuale HTML/script iniettato
elemento.innerHTML = input.value
```
:::

* Ora stiamo usando l'evento `keyup`. Questo evento si verifica ogni volta che si rilascia un tasto dopo averlo premuto. Come puoi immaginare, c'è anche un evento "keydown" che viene attivato ogni volta che si preme un tasto. Stiamo usando `keyup` perché `keydown` accade _prima_ che una chiave venga effettivamente registrata, il che significa che saremmo sempre una chiave dietro.

* Facciamo riferimento a `input.value`. La proprietà value di un input riflette tutto ciò che l'utente ha digitato nell'input.

* Prendiamo tutto ciò che è in `input.value` e lo passiamo direttamente a `paragraph.innerText`. Poiché quella funzione viene chiamata ogni volta che un utente digita nell'input, mantiene i due sincronizzati!

Un altro esempio e poi andiamo avanti.

```html
<style>
  .color-box {
    background-color: limegreen;
    width: 100px;
    height: 100px;
  }
</style>

<div class="color-box"></div>
<input class="color-input" placeholder="Type a color here!" />

<script>
  const input = document.querySelector('.color-input');
  const paragraph = document.querySelector('.color-box');

  input.addEventListener("change", function() {
    paragraph.style.backgroundColor = input.value;
  });
</script>
```

Simile al precedente. La differenza fondamentale qui è che stiamo ascoltando gli eventi di "cambiamento". Gli eventi `change` si verificano ogni volta che un utente digita qualcosa nell'input e poi defocalizza l'input facendo clic da qualche altra parte o premendo tab per cambiare lo stato attivo. Prova a digitare "rosso" e quindi a fare clic da qualche altra parte. Inoltre, prova qualcosa che non sia un colore. Nota che se gli dai un colore non valido, semplicemente non cambia nulla.

### Prevenire il comportamento di default

Alcuni elementi HTML hanno un comportamento predefinito: un `<a>` naviga verso un URL, un `<form>` ricarica la pagina al submit. Con `event.preventDefault()` puoi bloccare questo comportamento e gestire l'azione tu stesso con JavaScript.

```html
<form class="form-contatto">
  <input type="text" placeholder="Il tuo nome" class="campo-nome" />
  <input type="email" placeholder="La tua email" class="campo-email" />
  <button type="submit">Invia</button>
</form>
<p class="messaggio"></p>

<script>
  const form = document.querySelector('.form-contatto')
  const messaggio = document.querySelector('.messaggio')

  form.addEventListener('submit', (event) => {
    event.preventDefault() // impedisce il reload della pagina

    const nome = form.querySelector('.campo-nome').value.trim()
    const email = form.querySelector('.campo-email').value.trim()

    if (!nome || !email) {
      messaggio.textContent = 'Compila tutti i campi!'
      return
    }

    messaggio.textContent = `Grazie ${nome}, ti contatteremo a ${email}`
  })
</script>
```

## Delegazione di eventi

Se hai un sacco di elementi su cui devi ascoltare gli eventi, puoi allegare un listener di eventi a ciascuno, ma è un po' noioso da fare. Invece quello che a volte è più facile da fare è usare quello che viene chiamato **event bubbling**. Quando l'evento si attiva su un elemento, dopo che "bolle" fino al suo genitore, quindi al suo genitore e al suo genitore, ecc. finché non si trova nell'elemento radice.

```html
<div class="button-container">
  <button>1</button>
  <button>2</button>
  <button>3</button>
  <button>4</button>
  <button>5</button>
</div>
<script>
  document.querySelector('.button-container').addEventListener('click', function(event) {
    alert(`You clicked on button ${event.target.innerText}`);
  });
</script>
```

Puoi vedere che abbiamo limitato solo il listener di eventi, e quello era il div sopra di esso. Quindi, quando facciamo clic sul pulsante, utilizziamo il parametro `event` che viene passato alla richiamata. Ti starai chiedendo da dove viene. Era sempre lì, lo ignoravamo. Il primo parametro di un listener di eventi è sempre un oggetto evento. Ci sono molte informazioni sull'oggetto evento, ma siamo più interessati a `event.target`. `target` è il tag da cui ha avuto origine l'evento. In questo caso sarà il pulsante che ha causato l'evento. E sappiamo che con i tag puoi usare la proprietà `innerText` per ottenere il testo al loro interno. È così che siamo in grado di avvisare il numero corretto.

## Esercizi

### Esercizio 1 — Tabella dati dinamica

Dato un array di dati di vendita, popola dinamicamente una tabella HTML usando il DOM. Non usare `innerHTML` — usa `createElement` e `appendChild`.

```javascript
const vendite = [
  { mese: 'Gennaio', prodotto: 'Laptop', quantita: 12, totale: 14399 },
  { mese: 'Febbraio', prodotto: 'Mouse', quantita: 45, totale: 1350 },
  { mese: 'Marzo', prodotto: 'Monitor', quantita: 8, totale: 3592 },
  { mese: 'Aprile', prodotto: 'Tastiera', quantita: 30, totale: 1470 }
]

// Struttura HTML di partenza:
// <table id="tabella-vendite">
//   <thead><tr><th>Mese</th><th>Prodotto</th><th>Qtà</th><th>Totale</th></tr></thead>
//   <tbody id="corpo-tabella"></tbody>
// </table>

const tbody = document.querySelector('#corpo-tabella')

vendite.forEach(riga => {
  const tr = document.createElement('tr')
  // Aggiungi 4 celle per: mese, prodotto, quantita, totale (formattato con €)
  // il tuo codice
  tbody.appendChild(tr)
})
```

### Esercizio 2 — Filtro live su lista

Crea un input di ricerca che filtra in tempo reale una lista di prodotti, nascondendo gli elementi che non corrispondono al testo digitato.

```html
<input type="text" id="cerca" placeholder="Cerca prodotto..." />
<ul id="lista-prodotti">
  <li>Laptop Pro</li>
  <li>Mouse Wireless</li>
  <li>Monitor 4K</li>
  <li>Tastiera Meccanica</li>
  <li>Webcam HD</li>
  <li>Cuffie Bluetooth</li>
</ul>

<script>
  const input = document.querySelector('#cerca')
  const items = document.querySelectorAll('#lista-prodotti li')

  input.addEventListener('input', () => {
    const testo = input.value.toLowerCase()
    items.forEach(item => {
      // mostra o nascondi l'elemento in base al testo
      // suggerimento: usa item.style.display = 'none' / ''
    })
  })
</script>
```

### Esercizio 3 — Form con validazione

Crea un form con validazione lato client. Intercetta il submit con `preventDefault()`, valida i campi e mostra messaggi di errore nel DOM.

```html
<form id="form-registrazione">
  <div>
    <label>Nome: <input type="text" id="nome" /></label>
    <span class="errore" id="errore-nome"></span>
  </div>
  <div>
    <label>Email: <input type="email" id="email" /></label>
    <span class="errore" id="errore-email"></span>
  </div>
  <div>
    <label>Età: <input type="number" id="eta" /></label>
    <span class="errore" id="errore-eta"></span>
  </div>
  <button type="submit">Registrati</button>
  <p id="successo"></p>
</form>

<script>
  document.querySelector('#form-registrazione').addEventListener('submit', (event) => {
    event.preventDefault()

    // Azzera errori precedenti
    document.querySelectorAll('.errore').forEach(el => el.textContent = '')

    const nome = document.querySelector('#nome').value.trim()
    const email = document.querySelector('#email').value.trim()
    const eta = parseInt(document.querySelector('#eta').value)

    let valido = true

    // Valida nome: non vuoto
    // Valida email: deve contenere '@' e '.'
    // Valida età: deve essere tra 18 e 99
    // Per ogni errore: imposta il textContent dello span errore corrispondente
    //                  e imposta valido = false

    if (valido) {
      document.querySelector('#successo').textContent =
        `Registrazione completata per ${nome} (${email})`
    }
  })
</script>
```

