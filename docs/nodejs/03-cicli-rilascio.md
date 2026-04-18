---
sidebar_position: 3
---

# Cicli di rilascio

Da quando è stata istituita la Node.js Foundation, il progetto Node.js ha puntato sul garantire una piattaforma stabile per le imprese 
che hanno investito su questa tecnologia. Esistono diverse linee di rilascio (__branches__), ognuna delle quali rappresenta una 
specifica versione di Node.js. 

Ognuna di queste versioni ha una sua stabilità ed il suo set di funzionalità, nonché una specifica versione.

## Concetti chiave

Esistono alcuni concetti chiave da chiarire per comprendere i cicli di rilascio di Node.js. Il primo concetto riguarda il versioning del progetto del codice. 
In particolare in Node.js viene utilizzato il [Versionamento Semantico](https://semver.org/lang/it/). 
Il versionamento semantico non è altro che una convenzione formale che utilizza tre numeri suddivisi da un punto (per esempio `1.2.3`). 
Ognuna delle posizioni occupate denota una specifica informazione rispetto ad un'altra versione in termini di compatibilità.
Queste tre posizioni sono conociute come `MAJOR.MINOR.PATCH`. In particolare:

* *`PATCH`*: questo numero viene incrementato quando avviene una modifica nel codice che non aggiunge nuove funzionalità o modifica il comportamento di quelle esistenti. Un bug fix è un esempio di rilascio di questo tipo.
* *`MINOR`*: questo numero viene incrementato quando avviene una modifica all'API del nostro software. L'aggiunta di un nuova nuova funzionalità a quelle esistenti è un esempio di rilascio di tipo `MINOR`. Questo tipo di rilascio può includere anche rilasci di tipo `PATCH`.
* *`MAJOR`*: questo numero viene incrementato quando viene introdotta una modifica nel codice incompatibile con le altre versioni. La modifica della firma di un metodo con un parametro obbligatorio, per esempio, è un rilascio di questo tipo. Questa tipologia di rilascio può includere sia rilasci di tipo `MINOR` e rilasci di tipo `PATCH`.

Dopo aver chiarito cos'è e come funziona il versionamento semantico, possiamo dare la definizione 
di *linea di rilascio*. Una linea di rilascio rappresenta qualsiasi versione principale (quindi rilasci di tipo `MAJOR`) 
di Node.js, quindi la versione `12.0.0`, `14.0.0`, `15.0.0` e così via.

## Tipologie di rilascio

Ora che sappiamo cos'è una linea di rilascio e come questa è versionata, possiamo definire le tipologie di rilascio. Esistono tre tipologie di rilascio in Node.js:

- __Current__: è linea di rilascio più recente di Node.js, quella aperta a modifiche non banali da parte degli autori. Questa linea di rilascio ha una durata di sei mesi.

- __LTS__: è l'acronimo di _Long-Term Support_ e viene applicata diverse linee di rilascio che verranno supportate e manutenute dagli autori per un periodo di tempo esteso. Questa tipologia di rilascio ha due fasi principali:
  
  - __Active__: è la fase che si riferisce al perido di tempo in cui vengono aggiunte nuove funzionalità e miglioramenti o risolti i bug di sicurezza. 
  - __Maintenance__: è la fase in cui vengono rilasciate solo correzioni di bug e patch di sicurezza per un periodo di tempo limitato. Quando una tipologia di rilascio LTS si trova in questa fase, significa che il suo ciclo di vita sta per terminare.

- __EOL__: è l'acronimo di _End of life_. Quando una versione di Node.js arriva in questa fase non verranno più effettuati rilasci di nessun tipo.

## Ciclo di vita

Una delle cose da chiarire sulle versioni di Node.js è che le versioni con numero pari come Node.js `10.x.x`, Node.js `12.x.x`, Node.js `14.x.x` e così via saranno rilasci di versioni di tipo LTS. Al contrario le versioni con numero dispari quindi Node.js `11.x.x`, Node.js `13.x.x`, Node.js `15.x.x`, andranno in EOL non appena viene rilasciata il prossimo rilascio MAJOR. Quindi possiamo dire che le versioni LTS sono le versioni di Node.js con numero pari, mentre quelle non LTS sono le versioni di numero dispari.

Ogni linea di rilascio di tipo LTS, ha un ciclo di vita ben definito. Questo ciclo di vita include le fasi di rilascio _Current_, _Active LTS_, _Maintenance_ ed infine _EOL_.

![](./img/ch-3/01.png)

Dando uno sguardo all'immagine notiamo che quando viene creata una nuova linea di rilascio di tipo LTS questa entra subito nella fase _Current_ solitamente per un periodo che va da Aprile ad Ottobre. Successivamente entra nella fase _Active_ per un periodo di diciotto mesi ed infine, prima di raggiungere l'_End Of Life_, resta in una fase di _Maintenance_ per un periodo di dodici mesi. In altre parole il ciclo di vita di un rilascio LTS di Node.js ha una durata di trentasei mesi. Queste date sono indicative e sono soggette a variazioni da parte degli autori. Man mano che questi cicli di rilascio si susseguono nel tempo vengono applicate a più linee di rilascio, di conseguenza il progetto inizia ad avere un supporto su più livelli per le versioni LTS. L'immagine sottostante mostra il ciclo di vita di diverse versioni LTS nelle diverse fasi del loro ciclo di vita:

![](./img/ch-3/02.png)

## Quale versione utilizzare

Se la vostra applicazione è un API che verrà rilasciata in un ambiente di produzione, allora sarebbe opportuno utilizzare 
l'ultima versione LTS disponibile. Se inveces state creando uno strumento che è di supporto agli sviluppatori, come ad esempio 
uno strumento che effettua lo scaffold di un progetto, allora è probabile che il vostro codice dev'essere supportato da diverse 
versioni contemporaneamente.