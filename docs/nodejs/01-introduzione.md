---
sidebar_position: 1
---

# Introduzione

Tutti conoscono Node.js! La mia esperienza con questo mondo è iniziata nel 2011, quando per la mia tesi di laurea ho avuto 
la necessità di dover creare un sistema di notifiche asincrono per un social network. Cercando in rete mi ritrovai davanti ad un 
video su youtube dove un certo Ryan Dahl introduceva una nuova tecnologia basata sul motore V8 di Google. 
In pochi minuti, durante la demo, Ryan implementò una chat in tempo reale. Pensai: WOW! Possibile che con poche righe di codice 
si riesca a fare tutto questo? All’epoca Node.js non era per niente stabile, `v0.4` più o meno, ma cosa posso dire: è stato amore a prima vista!

Ormai Node.js è maturo, tanto aver raggiunto l'adozione da parte di alcune delle più grandi aziende al mondo (Netflix, 
Linkedin, NASA, Amazon ecc.), ma può risultare anche abbastanza giovane da non essere preso in cosiderazione dai manager aziendali. 
Uno dei principali motivi per cui Node.js è popolare è perché utilizza JavaScript come linguaggio principale per creare applicazioni 
lato server, e questo ha fatto si che lo stesso JavaScript si è dovuto evolvere per far fronte alle necessità degli sviluppatori. 
Siccome JavaScript è un linguaggio che la maggior parte degli sviluppatori hanno utilizzato almeno una volta nella loro vita, 
il passaggio da una qualsiasi altra tecnologia web (PHP, Ruby, C#) a Node.js risulta molto più semplice.

## Ma cos'è Node.js

Node.js non è un framework. Node.js è un runtime che consente di eseguire codice JavaScript come un qualsiasi altro 
linguaggio di programmazione su qualsiasi piattaforma. Questa definizione può non sembrare tanto stupefacente, ma in 
realtà chi si occupa di programmazione web sa bene che JavaScript nasce come linguaggio di scripting lato client e che, pertanto, 
può essere eseguito solo all'interno di un browser. Possiamo paragonare Node.js alla JVM (Java Virtual Machine), 
che si occupa si eseguire il codice Java.

## Il Web prima di Node.js

Prima dell'avvento di Node.js, scrivere un'applicazione web era un processo piuttosto standard. Avete una macchina con 
un web server configurato (come Apache, Tomcat o IIS) in attesa su una determinata porta (solitamente la 80 per le richieste HTTP), 
che resta in ascolto finché non riceve una richiesta. Quando un client effettua una richiesta per accedere ad una risorsa, 
il web server riceve la richiesta e crea un thread per gestirla. Nella magggior parte dei casi questo thread deve accedere 
ad altre risorse del sistema come un database MySQL, un server cache, o semplicemente effettuare operazioni sul filesystem.
Questo implica che il thread, ad un certo punto della sua vita, rimarrà bloccato in attesa dei dati richiesti. Solo quando 
li riceve, il thread effettua le sue ultime operazioni, come strutturare i dati richiesti per inviarli al client o liberare 
la risorsa che ha occupato, e termina la sua esecuzione.

Se analizziamo il comportamento appena descritto, si deduce facilmente che un web server implementato utilizzando questo 
tipo di approccio, non è in grado di gestire più di una connessione sullo stesso thread. Inoltre, se il web server arriva 
ad un numero massimo di connessioni simultanee, non è in grado di gestirne altre fino a quando almeno thread non termina 
la propria esecuzione. Schematicamente accade quanto mostrato nella figura seguente: 

![](./img/ch-1/01.png)

Un altro aspetto molto importante da prendere in considerazione quando viene utilizzato questo approccio, è il tempo di 
inattività in cui il thread rimane in attesa dei dati che una determinata risorsa di sistema gli deve fornire. Facciamo 
un esempio per comprendere meglio quanto appena detto. Immaginiamo di avere un client che effettua una richiesta, e che 
i dati di cui necessita risiedano in un database MySQL. Quando la richiesta arriva, il web server crea il thread per 
gestire la richiesta del client. Supponendo che la query impieghi dieci secondi per ritornare i dati richiesti, il thread 
rimane bloccato in uno stato di inattività finché non riceve i dati restituiti dalla query e nel frattempo non è in grado 
di gestire altre richieste in ingresso. C'è anche da dire che i thread non sono economici in termini di risorse di sistema, 
consumano memoria e producono molte commutazioni di contesto, per cui avere un thread in esecuzione per molto tempo non è 
il miglior compromesso in termini di efficienza.

:::tip
In informatica la commutazione di contesto (in inglese *context switch*) è una particolare operazione del sistema 
operativo che conserva lo stato del processo o thread, in modo da poter essere ripreso in un altro momento.
:::

Per quanto possa essere semplice da capire ed utilizzare, questo modello è inefficiente se le vostre applicazioni passano 
la maggior parte del loro tempo ad attendere i risultati di una query, uno scenario abbastanza comune nelle applicazioni moderne.

Nel corso degli anni sono state sviluppate e messe in pratica molte soluzioni per affrontare questo tipo di problemi. 
Potete sostituire i server HTTP più potenti e ricchi di funzionalità, come Apache, con server più leggeri e performanti come Nginx, 
o potete scalare orizzontalmente le vostre architetture affiancando più server per aumentare il numero di connessioni simultanee 
che potete soddisfare.

## La nascita di Node.js

Mentre nel 2009 gli sviluppatori di tutto il mondo erano impegnati nella lotta contro la gestione delle risorse dei server, 
e sui limiti delle richieste che questi possono elaborare, JavaScript stava tornando alla ribalta. Gli sviluppatori dei browser 
hanno ripulito le implementazioni e aggiunto nuove funzionalità per renderlo più potente e meno sgorbutico. Nascono librerie 
come jQuery e magicamente la programmazione JavaScript diventa più divertente e produttiva. 

Le più grandi aziende di sviluppo software come Google, Mozilla, Apple, e Microsoft combattono l'uno contro l'altro per aggiudicarsi 
il titolo di re di sviluppatore di browser. Grazie all'introduzione del responsive design, in cui un applicazione modifica il 
proprio comportamento ed il proprio aspetto in base al dispositivo che la richiede, queste aziende stanno investendo molto per 
introdurre questo linguaggio all'interno dei loro prodotti. In particolare, JavaScript V8 di Google Chrome è molto veloce, oltre 
ad essere open source ed utilizzato praticamente da chiunque.

Nello stesso periodo, un tale di nome Ryan Dahl stava lavorando per Joyent, un'azienda californiana che si occupa ancora oggi 
di cloud e virtualizzazione di servizi. Ryan cercava di sviluppare tecnologie push per applicazioni web, simili a quelle che utilizza 
Gmail, ma non riusciva a trovare nulla che lo soddisfaceva. Alla fine, avendo a disposizione l'interprete V8 di Google ed una 
libreria di elaborazione di eventi chiamata __libev__, optò per l'utilizzo di JavaScript e realizzò la prima versione di quello 
che ancora oggi chiamiamo Node.js.

Il fatto di rendere indipendente il motore JavaScript dal browser ha permesso l'ascesa di Node.js. L'idea innovativa che 
distingueva Node.js dagli altri environment dell'epoca, risiedeva nel fatto che era realizzato intorno ad un modello non bloccante 
di programmazione ad eventi. In altre parole, non consentiva di scrivere codice bloccante. Se prima di Node.js la vostra applicazione 
web, per elaborare una richiesta e generare una risposta, deve lanciare una query su un database, avvia la sua esecuzione e informa 
Node.js su cosa fare quando sarà restituito un risultato. Nel frattempo, la vostra applicazione sarà in grado di gestire nuove 
richieste in ingresso, oppure una qualsiasi altra operazione necessaria, come l'elaborazione di una richiesta precedente.

Grazie a questo cambiamento radicale nel modo di gestire le richieste HTTP, e le applicazioni web in generale, è stato possibile 
sviluppare server web che arrivano a gestire centinaia, se non migliaia di richieste simultanee su macchine che non hanno a 
disposizione molte risorse. L'altra faccia della medaglia di Node.js è che non si tratta per forza di un ambiente ottimale per 
svolgere attività lunghe e complesse, quindi fate le vostre valutazioni prima di iniziare ad utilizzarlo per i vostri progetti.

## Node.js e V8

*V8* è una libreria open source scritta in C++ che fornisce un ambiente di esecuzione ad alte prestazioni per il codice 
JavaScript. Quando V8 è stato distribuito come parte di Chrome nel 2008, è stato concepito come una libreria per l'esecuzione 
di JavaScript caricata nel browser, su richiesta del documento web caricato, ma le cose sono cambiate nel 2009 quando Ryan Dahl 
ha creato Node.js.

Node.js ha portato JavaScript a consentire lo sviluppo di applicazioni lato server. È basato su V8, ma invece di essere un browser 
web, fornisce l'accesso al sistema operativo sottostante. Quindi ricordiamoci che non stiamo parlando di JavaScript arbitrario proveniente 
dal Web, ma di codice sviluppato internamente a Node.js. In sostanza, Node.js fornisce a JavaScript le chiamate API di sistema che 
linguaggi come C, C ++, Java, Python, ecc. hanno sempre avuto. Ne consegue che Node.js è il collante attorno ad alcuni componenti chiave:

- Motore JavaScript V8 di Google
- Moduli C++ per operazioni di I/O di basso livello (__libuv__).
- Un Event Loop (di cui parleremo in seguito)

Ovviamente, questa è una semplificazione, ma l'idea è che Node.js svolga un ruolo simile a quello del browser web Chrome. 

![](./img/ch-1/02.png)


Laddove un browser web come Google Chrome espone oggetti API come `window`, `localStorage` o `window` a JavaScript in esecuzione 
all'interno di V8, Node.js espone I/O di basso livello, come il file system (`fs`), la rete (`http`) ecc. Ecco perché Node.js è 
perfetto per lo sviluppo di applicazioni server: ha fornito l'accesso al sistema operativo al codice JavaScript.

Un'altra differenza rispetto al codice JavaScript implementato nei browser, è che Node.js utilizza di default lo standard 
[CommonJS](https://en.wikipedia.org/wiki/CommonJS), mentre nel browser viene utilizzato quello 
[standard ECMAScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

> A Novembre 2019 è stato annunciato anche il supporto dello standard ECMAScript per la scrittura dei moduli in Node.js. Gli autori 
possono dire a Node.js di trattare il codice JavaScript come moduli ECMAScript tramite l'estensione del file `.mjs`, la proprietà 
`type` all'interno del file `package.json` o il flag `--input-type` dalla riga di comando.

### Altri motori JavaScript

V8 non è l'unico motore JavaScript in circolazione. Anche gli altri browser hanno il loro motore JavaScript:

- Firefox è basato su [SpiderMonkey](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey).
- Safari utilizza [JavaScriptCore](https://developer.apple.com/documentation/javascriptcore).
- Microsoft Edge inizialmente aveva il suo motore JavaScript ([Chakra](https://github.com/chakra-core/ChakraCore)), ma 
recentemente è stato [ricostruito utilizzando Chronium](https://support.microsoft.com/en-us/microsoft-edge/download-the-new-microsoft-edge-based-on-chromium-0f4a3dd7-55df-60f5-739f-00010dba52cf).
