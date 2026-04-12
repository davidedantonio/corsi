---
sidebar_position: 5
---

# Creare indici

I database sono onestamente meraviglie della tecnologia. Ricordo che nel mio corso di informatica ho dovuto scriverne uno e
riusciva a malapena ad eseguire le query rudimentali necessarie per superare l'esame. Questi database stanno alimentando tutto
ciò che ti circonda ed elaborano petabyte di dati su larga scala.

Frequentemente questi database possono gestire queste query senza alcun tipo di configurazione aggiuntiva; sin da subito sono
molto veloci e flessibili. Tuttavia a volte ti imbatterai in alcuni problemi di prestazioni per vari motivi. Le query
saranno molto lente, causeranno un carico elevato sul server in esecuzione, renderanno il server instabile, o anche tutte
queste cose insieme. In questi casi gli **indici** possono aiutarti. Gli indici sono una struttura dati separata che il database
mantiene per poter trovare le cose rapidamente. Il compromesso qui è che gli indici possono rendere gli inserimenti, gli
aggiornamenti e le cancellazioni un po' più lenti perché devono anche aggiornare gli indici oltre al fatto che occupano semplicemente
più spazio su disco. Ma in cambio ottieni query molto veloci oltre ad alcune altre proprietà interessanti che esploreremo
come l'applicazione di chiavi univoche.

## Explain

Iniziamo dicendo che decisamente non sono un DBA, un amministratore di database o un architetto di database a seconda di
chi chiedi. Ci sono persone i cui interi lavori consistono nel fare cose come questa: sapere come ottimizzare i database per
adattarli ai casi d'uso. Invece, ti guiderò attraverso alcuni casi d'uso e ti mostrerò gli strumenti che conosco per
cercare soluzioni migliori. Da lì è meglio lavorare con persone che hanno una conoscenza approfondita di ciò che stai cercando di fare.

Considera questa query abbastanza semplice:

```javascript
db.pets.find({ name: "Fido" });
```

Abbastanza semplice: trova tutti gli animali domestici di nome Fido. Tuttavia questa query fa una cosa veramente terribile:
causerà effettivamente al database di guardare **ogni singolo record** nel database. Per noi che giochiamo sul nostro
computer questo non è un grosso problema ma se lo stai eseguendo molto in produzione questo sarà molto costoso e fragile.
In questo caso, sarebbe molto più utile se ci fosse un indice per aiutarci. Vediamo prima cosa può dirci explain.

```javascript
db.pets.find({ name: "Fido" }).explain("executionStats");
```

Le due cose da notare qui sono la strategia che ha usato per fare la nostra query e quanti record ha esaminato. In questo
caso guarda _ogni_ record nel nostro database e ha usato una strategia `COLLSCAN` che è la stessa cosa di una ricerca
lineare alias ricerca O(n). Non va bene! Costruiamo un indice per far funzionare questo molto meglio!

## Creare un Indice

```javascript
db.pets.createIndex({ name: 1 });
db.pets.find({ name: "Fido" }).explain("executionStats");
db.pets.find({ name: "Fido" }).count();
db.pets.getIndexes();
```

Nota che è andato più veloce. Nel mio caso l'aumento di velocità è stato di circa il 300%. Poi nota che il numero di
record esaminati è lo stesso numero del conteggio. Infine puoi sempre ispezionare quali indici esistono usando getIndexes.

## Indici Composti

Se stai usando frequentemente due chiavi insieme, come tipo e razza per esempio, potresti considerare di usare un
indice composto. Questo creerà un indice di quelle due cose insieme. Nel caso specifico in cui stai interrogando con
quelle cose insieme performerà meglio di due indici separati delle due cose. Poiché questo non è destinato ad essere
un trattato approfondito sugli indici, ti lascerò esplorare questo quando ne avrai bisogno.

## Indici Univoci

Frequentemente vuoi imporre l'unicità su uno dei campi nel tuo database. Un buon esempio è che un'email nel tuo
database utenti dovrebbe essere univoca, cioè un utente non dovrebbe essere in grado di registrarsi due volte
con lo stesso indirizzo email. Il nostro database di animali domestici non ha davvero un buon caso d'uso per un
indice univoco ma facciamone uno sull'indice per mostrarti come crearne uno. Poiché `_id` esiste già è ridondante
creare un altro indice numerico univoco.

```javascript
db.pets.createIndex({ index: 1 }, { unique: true });
```

Se ottieni un errore come quello qui sotto, esegui un deleteOne sulla chiave duplicata per eliminarne una e poi riprova.

```json
{
  "ok": 0,
  "errmsg": "Index build failed: 681332bb-c753-45fb-80c2-00ef2ec1a4e7: Collection test.pets ( 2aa18781-33ae-4aa8-846b-934594558b72 ) :: caused by :: E11000 duplicate key error collection: test.pets index: index_1 dup key: { index: 10000.0 }",
  "code": 11000,
  "codeName": "DuplicateKey",
  "keyPattern": {
    "index": 1
  },
  "keyValue": {
    "index": 10000
  }
}
```

Una volta che l'hai indicizzato prova questa query:

```javascript
db.pets.insertOne({ name: "Doggo", index: 10 });
```

Ora questo fallirà perché 10 esiste già. Come bonus, ora `index` è indicizzato quindi può interrogarlo facilmente.

```javascript
db.pets.find({ index: 1337 }).explain("executionStats");
```

Nota che guarda solo un record!

## Indice Testuale

Frequentemente qualcosa che vuoi fare si chiama "ricerca full text". Questo è simile a ciò che accade quando cerchi qualcosa su Google:
vuoi che elimini le "stop words" (cose come a, il, e, ecc.) e vuoi che faccia una corrispondenza fuzzy. Come se stessi cercando
"Luna Havanese cane" mi aspetterei di trovare tutti i cani di nome Luna che sono Havanese.

Prima di tutto, questo è direttamente possibile in MongoDB (prima non lo era). Tuttavia c'è un intero stile di database che lo
fa per te, chiamato motori di ricerca. [Apache Solr][solr] è quello che usavo nel mio vecchio lavoro. Ci sono compromessi e cose
che un server completamente separato può fare per te che MongoDB non può. E puoi scalarli separatamente il che può essere utile.

Quindi in MongoDB creerai un indice testuale. Ogni collezione può avere solo un indice testuale quindi assicurati di indicizzare
tutti i campi che vuoi in quello che scegli. Nel nostro caso indicizziamo tipo, razza e nome.

Vale anche la pena menzionare che per impostazione predefinita fa la ricerca testuale in inglese. È possibile impostarlo su
altre lingue o nessuna lingua. [Vedi qui][text-index].

```javascript
db.pets.createIndex({
  type: "text",
  breed: "text",
  name: "text",
});
```

Okay, quindi ora che l'abbiamo indicizzato, come lo cerchiamo? Userai un operatore speciale \$text.

```javascript
db.pets.find({ $text: { $search: "dog Havanese Luna" } });
```

Okay, quindi nota che questo sta facendo una corrispondenza "any" e non sta ordinando sul punteggio più accurato.
Frequentemente questo non è quello che vuoi: vuoi la cosa che corrisponde più da vicino ai tuoi termini di ricerca. Possiamo farlo,
semplicemente non lo fa per impostazione predefinita.

```javascript
db.pets
  .find({ $text: { $search: "dog Havanese Luna" } })
  .sort({ score: { $meta: "textScore" } });
```

Questo ora ti invierà quelli che assomigliano più da vicino a ciò che stai cercando. Se vuoi vedere i punteggi testuali effettivi,
ecco come puoi vederli.

```javascript
db.pets
  .find(
    { $text: { $search: "dog Havanese Luna" } },
    { score: { $meta: "textScore" } },
  )
  .sort({ score: { $meta: "textScore" } });
```

Un'altra nota, gli operatori `""` e `-` di Google funzionano qui. Se vuoi cercare tutti i Luna che non sono gatti puoi fare questo:

```javascript
db.pets
  .find({ $text: { $search: "-cat Luna" } })
  .sort({ score: { $meta: "textScore" } });
```

C'è di più nell'operatore di ricerca \$text che ti lascerò esplorare. [Vedi qui][text].

[solr]: https://lucene.apache.org/solr/
[text-index]: https://docs.mongodb.com/manual/tutorial/specify-language-for-text-index/
[text]: https://docs.mongodb.com/manual/reference/operator/query/text/index.html
