---
sidebar_position: 3
---

# Interrogare le collection

Ora che abbiamo inserito molti documenti nel nostro database, è il momento di **interrogare** il database
per ottenere informazioni. Esistono vari motivi e metodi per interrogare un database. Potresti interrogare un database
per ottenere **uno specifico record**, ad esempio quando cerchi l’oggetto utente per mostrare una pagina profilo,
oppure potresti interrogare **molte cose in una volta**, ad esempio quando un utente cerca animali domestici e
vuoi mostrare cinque risultati.

## findOne

Iniziamo con le query di base. Esegui questo nella console.

```javascript
db.pets.findOne();
```

Questo cercherà e troverà il **primo** elemento nel database che corrisponde alla tua query e lo restituirà.
In questo caso **non** abbiamo fornito una query, il che equivale a dire “dammi qualsiasi cosa”.
Probabilmente otterrai indietro il primo elemento che hai inserito nel tuo database che, nel mio caso, è
un cane Havanese di nome **Luna**.

Ok, ora supponiamo di voler trovare l’elemento con indice **1337** inserito nel database. Prova questo:

```javascript
db.pets.findOne({ index: 1337 });
```

Questo troverà **un** elemento (del quale comunque ce n’è uno solo) in cui `index` è uguale a **1337**.
Un altro esempio: troviamone uno in cui è un cane di nome **Spot**.

```javascript
db.pets.findOne({ name: "Spot", type: "dog" });
```

## find

Finora abbiamo cercato **un** record alla volta. Se vuoi trovare **tutti** i documenti che corrispondono
alla tua query, devi usare `find` invece di `findOne`. Proviamolo.

```javascript
db.pets.find({ type: "dog" });
```

Nota che questo ti sta restituendo **solo venti** risultati. Per impostazione predefinita, MongoDB ti consegna
venti risultati alla volta sotto forma di quello che viene chiamato **iteratore** o **cursore** (_cursor_).
Un iteratore ti fornirà venti record alla volta e ti consentirà di **iterare** sui risultati. Spesso è una
modalità utile perché in teoria potresti voler scorrere l’intera collezione, e questo ti permette di farlo **a blocchi**.

Prova ora a iterare. Esegui questo:

```
it
it
it
```

Noterai che ogni volta ottieni **venti** record differenti. `it` dirà all’iteratore che vuoi **iterare di nuovo**
sull’ultimo iteratore usato.

## countDocuments, limit e toArray

Ok, proviamo questo:

```javascript
db.pets.countDocuments({ type: "dog" }); // probabilmente un numero piuttosto grande
db.pets.find({ type: "dog" }).limit(40);
it; // dopo questo il cursore terminerà
```

`countDocuments` ti permette di capire **quanti** elementi ci sono. `limit` dice al cursore **quando** fermarsi.
Ma se vuoi semplicemente ottenere **tutto in una volta**? Prova `toArray`:

```javascript
db.pets.find({ type: "dog" }).limit(40).toArray();
```

Questo scaricherà tutto in un **array**, comodo se vuoi tutto in un colpo solo. Ci sono una miriade di altre opzioni
che determinano come vengono restituiti i dati, ma potrai trovarle facilmente quando ti serviranno.

## Operatori di query

E se volessimo trovare **tutti i gatti anziani** nel nostro dataset? MongoDB te lo permette! Proviamo:

```javascript
db.pets.countDocuments({ type: "cat", age: { $gt: 12 } });
```

Nota che puoi usare questi [operatori di query][operators] **ovunque** stai fornendo una query (es. `findOne`, `find`,
ecc.). Quelli che userai più spesso sono:

- `\$gt` — greater than (maggiore di)
- `\$gte` — greater than or equal to (maggiore o uguale a)
- `\$lt` — less than (minore di)
- `\$lte` — less than or equal to (minore o uguale a)
- `\$eq` — equals (uguale a; di solito non necessario)
- `\$ne` — not equals (diverso da)
- `\$in` — valore presente nell’array (MongoDB può memorizzare anche array e oggetti!)
- `\$nin` — valore **non** presente nell’array

Se volessi vedere **tutti i Fido** che **non** sono cani, potresti fare:

```javascript
db.pets.find({
  type: { $ne: "dog" },
  name: "Fido",
});
```

## Operatori logici

Facciamo un passo oltre: puoi usare anche operatori **logici**. Diciamo che vuoi trovare **uccelli** tra **4 e 8 anni**:

```javascript
db.pets.find({
  type: "bird",
  $and: [{ age: { $gte: 4 } }, { age: { $lte: 8 } }],
});
```

Hai anche a disposizione `$or`, `$nor` e `$not`. Tieni presente che `$not` e `$ne` sono diversi: il primo è un
**operatore logico**, il secondo è “diverso da” (come `!==`).

## Operatori speciali

Questi ora non ti serviranno, ma sappi che puoi interrogare per **tipo** (verificare se qualcosa è numero, array,
oggetto, ecc.) con `$type` e che puoi verificare se un documento **ha** o **non ha** un campo con `$exists`.

C’è molto altro che puoi fare. MongoDB ha persino [operatori geospaziali][geo] per interrogare se **due punti sul
globo** sono vicini tra loro!

## Ordinamenti (sort)

Spesso avrai bisogno di **ordinare** i risultati delle tue query. Diciamo che stai creando una pagina di ricerca
per questi animali (anticipazione di ciò che faremo!). Forse la persona che cerca sul tuo sito è un’anima gentile
e vuole adottare alcuni **cani anziani**. Potrebbe dire: ordina per **età** in **ordine decrescente**.

```javascript
db.pets.find({ type: "dog" }).sort({ age: -1 });
```

`-1` significa **decrescente** e, come avrai intuito, `1` significa **crescente**.

## Proiezioni

Infine, per concludere la nostra breve lezione sulle query (c’è ancora molto da vedere), parliamo di **proiezioni**.
Il modo più semplice di usarle è **limitare quali campi** vengono restituiti.

```javascript
db.pets.find({ type: "dog" }, { name: 1, breed: 1 });
```

`1` significa “includi sicuramente questo campo”. In questo caso stiamo includendo **solo** `name` e `breed`. Se
lasci fuori qualcosa (come `age`), allora **non** verrà restituito. Nota che `_id` **viene** restituito comunque.
Se **non** lo vuoi, devi **escluderlo esplicitamente**:

```javascript
db.pets.find({ type: "dog" }, { name: 1, breed: 1, _id: 0 });
db.pets.find({ type: "dog" }, { name: true, breed: true, _id: false }); // true/false funzionano ugualmente
```

Funziona anche **solo escludendo** campi (cioè: includi tutto ciò che **non** ho escluso):

```javascript
db.pets.find({ type: "dog" }, { _id: 0 });
```

<!-- [operators]: -->
<!-- [geo]: -->
