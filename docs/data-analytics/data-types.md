---
sidebar_position: 5
---

# Formato e tipi di dati

Eccoci di nuovo! Oggi esploreremo tre concetti fondamentali, strettamente correlati: **i file di dati**,
i **formati dei dati** e i **tipi dei dati**.

Se hai mai iniziato a imparare un linguaggio di programmazione, avrai notato che i tipi di dati sono uno
dei primi concetti affrontati. Tuttavia, i tipi di dati e gli altri argomenti che discuteremo qui non
sono importanti solo in programmazione, ma hanno un impatto significativo sulla nostra capacità di
sfruttare appieno gli strumenti dati.

All'inizio, questi concetti possono sembrare confusi, specialmente per i principianti, ma li renderemo
più accessibili concentrandoci su ciò che è veramente importante, in modo che tu possa massimizzare il
tuo lavoro con gli strumenti dati.

L'obiettivo di questa sezione non è acquisire una conoscenza tecnica dettagliata dei file di dati, dei
formati e dei tipi di dati, ma piuttosto demistificarli e comprendere perché sono così cruciali nell'ambito
degli strumenti dati. Esploreremo ciascuno di questi concetti, spiegandone l'importanza e l'impatto sul
lavoro con gli strumenti dati, fornendo anche esempi reali di come influenzano il lavoro degli analisti
dati.

Alla fine di questa sezione, sarai in grado di distinguere tra file di dati, formati di dati e tipi di
dati, e comprenderai il ruolo che giocano nell'ambito degli strumenti dati.

## Files di dati

Iniziamo con un'analisi dei file di dati, fondamentali per comprendere come vengono archiviati e
utilizzati i dati. Quando parliamo di file di dati, ci riferiamo al formato o all'estensione di file
in cui vengono salvati i dati. Ogni tipo di formato di file di dati ha un impatto significativo sul
modo in cui le diverse applicazioni software accedono e consumano i dati.

Ad esempio, prendiamo in considerazione l'interazione con un file Excel. Noterai che viene salvato con
estensioni come .xlsx o .csv. Ogni estensione rappresenta un formato specifico che Excel comprende e
può elaborare. Questo significa che il programma Excel è in grado di interpretare e manipolare i dati
memorizzati in questi formati.

Un altro aspetto da considerare sono i delimitatori utilizzati nei formati di file. Ad esempio, il
formato CSV (Comma-Separated Values) utilizza la virgola come delimitatore per separare i campi di dati,
mentre il formato TSV (Tab-Separated Values) utilizza la tabulazione.

```
Nome,Cognome,età
Davide,D’Antonio,40
Mario,Rossi,35
John,Doe,43
```

```
Nome	Cognome	età
Davide	D’Antonio	40
Mario	Rossi	35
John	Doe	43
```

### CSV vs TSV

Prendiamo ad esempio un'analisi più dettagliata dei formati CSV e TSV. Nel formato CSV, i campi di
dati sono separati da virgole, mentre nel formato TSV sono separati da tabulazioni. Questo influisce
sul modo in cui i dati sono strutturati e interpretati dalle applicazioni software. È importante notare
che, a seconda delle impostazioni dell'applicazione e del software utilizzato, l'estensione del file
potrebbe non corrispondere effettivamente al formato di dati utilizzato.

Per comprendere l'importanza di questi delimitatori, consideriamo un esempio pratico. Immagina di
dover salvare un elenco di ticket di assistenza clienti. Se uno dei ticket contiene una virgola nel
testo, il formato CSV potrebbe interpretarla erroneamente come un separatore di campo, compromettendo
l'integrità dei dati.

---

![](/img/tipi_dati/support_request.png)

---

In questo caso, utilizzare il formato TSV, che utilizza le tabulazioni come
delimitatori, potrebbe essere una scelta migliore per mantenere l'integrità dei dati.

In sintesi, i formati dei file di dati e i delimitatori utilizzati hanno un impatto significativo sulla
struttura e sull'interpretazione dei dati da parte delle applicazioni software. È importante selezionare
il formato e il delimitatore appropriati in base alle esigenze specifiche del tuo progetto per garantire
una gestione corretta e accurata dei dati.

### Excel ASX

Quando apriamo il file in Excel, è importante osservare come i dati vengono interpretati e organizzati
all'interno del foglio di lavoro. Ad esempio, se stai lavorando con un file CSV e salvando i dati con
l'estensione ".csv", dovresti prestare particolare attenzione alla corretta interpretazione dei dati da
parte di Excel. Potresti notare che il testo viene contenuto in una colonna specifica, ad esempio la
colonna B. Questo è un aspetto cruciale da considerare quando si salvano e si manipolano i dati in un file CSV,
specialmente se ci sono virgole all'interno dei dati stessi.

Infatti, se i tuoi dati contengono testo che include virgole, potrebbero verificarsi errori di interpretazione
se non si presti attenzione durante il salvataggio del file. È importante comprendere come Excel gestisce
i delimitatori e come ciò influisce sull'interpretazione dei dati contenuti nel foglio di lavoro.

Passando al formato Excel ASX generato da Excel, potremmo notare che la struttura dei dati appare illeggibile
quando visualizzata con uno strumento di modifica del testo di base. Questo è dovuto al fatto che il formato
ASX è progettato per essere letto e interpretato da software specifico, come Excel stesso. Pertanto, utilizzare
uno strumento di modifica del testo generico potrebbe non essere il modo più efficace per visualizzare i dati
in questo formato.

Quando si lavora con dati in formati specifici come CSV o Excel ASX, è importante comprendere
come vengono interpretati e organizzati all'interno del software utilizzato. Prestare attenzione ai dettagli
come la posizione del testo nelle colonne e la corretta interpretazione dei delimitatori è essenziale per
garantire una gestione accurata dei dati e evitare errori di interpretazione.

Quando Excel salva i dati in un formato specifico come il formato Excel XLSX, è importante comprendere
che tale formato è progettato per essere letto e interpretato correttamente solo da applicazioni software
dotate di un lettore integrato appositamente progettato per questo scopo.

Senza un lettore integrato compatibile con il formato XLSX, le applicazioni potrebbero visualizzare
semplicemente il codice di formattazione che circonda i dati anziché i dati stessi. Questo può rendere
difficile o addirittura impossibile l'accesso ai dati e la loro corretta interpretazione.

---

![](/img/tipi_dati/excel_code.png)

---

È importante tenere presente questo aspetto quando si lavora con file Excel XLSX e assicurarsi di
utilizzare software o strumenti che supportino questo formato specifico. Inoltre, è consigliabile
verificare la compatibilità del software con il formato di file desiderato prima di procedere con
l'elaborazione o lo scambio dei dati, per evitare inconvenienti e garantire una corretta gestione
dei dati.

## Formati dei dati

Passiamo ora a esplorare i formati di dati, concentrandoci su come i campi di dati vengono strutturati
all'interno dei file stessi, come discusso nella sezione precedente.

Quando parliamo di formati di file, è essenziale comprendere la differenza tra formati flat e formati
strutturati. I formati flat, come CSV (Comma-Separated Values) e TSV (Tab-Separated Values), presentano
una struttura lineare in cui i dati sono organizzati senza relazioni nidificate tra i record.

---

![](/img/tipi_dati/csv_tsv_excel.png)

---

Questo significa che non ci sono relazioni complesse tra i dati all'interno del file, rendendoli piatti e con
una struttura fissa.

Al contrario, formati come Excel consentono di memorizzare dati in una struttura più complessa e flessibile,
in cui i record di dati possono contenere relazioni nidificate. Ad esempio, consideriamo un caso in cui
vogliamo memorizzare informazioni su persone e le auto che possiedono. In un file CSV, potremmo avere
una riga per ogni persona, con i campi per nome, età e marca dell'auto.

---

![](/img/tipi_dati/csv_person_car.png)

---

Tuttavia, questo formato potrebbe non essere sufficientemente flessibile per gestire relazioni più
complesse, come ad esempio se una persona possiede più di un'auto.

---

![](/img/tipi_dati/csv_person_cars.png)

---

Noterete che, in questo caso, la struttura flat del formato CSV rende difficile rappresentare in modo
accurato le relazioni complesse tra i dati, come il possesso di più auto da parte di una persona.

### JSON

Invece, potremmo optare per un formato più strutturato, come un database relazionale o un file JSON
(JavaScript Object Notation), che consente di mantenere relazioni più complesse tra i dati. Ad esempio,
potremmo avere una struttura JSON in cui ogni oggetto rappresenta una persona, con campi per nome, età
e un array di auto possedute, ciascuna con marca e modello.

Considerando l'esempio di Davide, che possiede una Hyndai Kona, e Mario, che possiede una Jeep Renegade, potremmo
rappresentare questi dati in un formato JSON in cui ciascuna persona ha un elenco di auto possedute:

```json
[
  {
    "nome": "Davide",
    "cognome": "D'Antonio",
    "età": 40,
    "veicolo": ["Hyundai Kona", "Fiat Panda"]
  },
  {
    "nome": "Mario",
    "cognome": "Rossi",
    "età": 35,
    "veicolo": ["Jeep Renegade"]
  },
  {
    "nome": "John",
    "cognome": "Doe",
    "età": 43,
    "veicolo": ["Peugeot 208"]
  }
]
```

Questo formato consente di rappresentare in modo più accurato e flessibile le relazioni complesse
tra i dati, consentendo una migliore organizzazione e manipolazione dei dati stessi.

Se volessimo migliorare ulteriormente la struttura dei dati, potremmo utilizzare una struttura
personalizzata per rappresentare le informazioni delle auto.

```json
[
  {
    "nome": "Davide",
    "cognome": "D'Antonio",
    "età": 40,
    "veicoli": [
      {
        "marca": "Hyundai",
        "modello": "Kona",
        "anno": 2020
      },
      {
        "marca": "Fiat",
        "modello": "Panda",
        "anno": 2018
      }
    ]
  },
  {
    "nome": "Mario",
    "cognome": "Rossi",
    "età": 35,
    "veicoli": [
      {
        "marca": "Jeep",
        "modello": "Renegade",
        "anno": 2019
      }
    ]
  },
  {
    "nome": "John",
    "cognome": "Doe",
    "età": 43,
    "veicoli": [
      {
        "marca": "Peugeot",
        "modello": "208",
        "anno": 2017
      }
    ]
  }
]
```

## Tipi di dati

Infine, affronteremo il concetto di tipi di dati, fondamentale per comprendere la natura e la struttura delle
informazioni che manipoliamo. Un tipo di dato è semplicemente una categoria assegnata da uno strumento di dati
o un linguaggio di programmazione che fornisce informazioni sulla gamma di possibili valori che i dati possono
assumere.

Esaminiamo alcuni esempi per chiarire questo concetto. I tipi di dati possono essere generalmente suddivisi in
tre categorie principali: numerici, testuali e relativi alle date.

Il testo, ad esempio, è comunemente rappresentato come una stringa di caratteri e può variare in lunghezza. Le
stringhe possono contenere informazioni come i commenti nei sondaggi online e possono essere di lunghezza variabile
o fissa, come nel caso dei codici di paese o stato.

Per quanto riguarda i dati numerici, possiamo incontrare numeri interi o reali. I numeri interi rappresentano
valori interi senza parte decimale, mentre i numeri reali possono includere valori decimali. Inoltre, esiste un
tipo speciale chiamato booleano, che può assumere solo valori di vero o falso, spesso rappresentati come 0 o 1.

Le date sono un altro tipo importante di dato, che descrive il tempo e può essere memorizzato in diversi formati,
come il classico anno-mese-giorno o come timestamp, che rappresenta un momento specifico nel tempo.

La scelta del tipo di dato corretto è fondamentale per garantire la precisione e l'accuratezza delle analisi.
Ad esempio, se trattiamo dati finanziari come numeri interi anziché numeri reali, potremmo perdere la precisione
nei calcoli, portando a errori nella contabilità.

Anche le informazioni sul fuso orario sono cruciali quando si lavora con date e timestamp, poiché l'interpretazione
corretta del tempo può influenzare significativamente le analisi, specialmente nel monitoraggio del comportamento
degli utenti su scala globale.

In sintesi, comprendere i tipi di dati e come vengono gestiti dai vari strumenti di dati e linguaggi di
programmazione è una competenza fondamentale per gli analisti. Nella prossima lezione, esploreremo come i
dati si muovono da un luogo all'altro e come le diverse fasi di questo processo sono connesse, introducendo
il concetto di pipeline dati e infrastruttura dati.
