---
sidebar_position: 1
---

# Introduzione ai database SQL

Prima di tutto: quando parlo di **database SQL**, intendo i **database relazionali** (spesso abbreviati come **RDBMS**, _Relational Database Management System_). È importante notare
che **non tutti i database relazionali usano SQL** e che **non tutti i database non relazionali non usano SQL** (alcuni database NoSQL usano comunque SQL). Tuttavia, qui utilizzo
la terminologia più comune per aiutarti a integrarti con le informazioni già disponibili su Internet. Questo è uno di quei casi (come con il termine _serverless_) in cui il
**marketing ha avuto la meglio** e ci siamo ritrovati con una terminologia un po’ strana.

---

## Che cos’è un database relazionale

Il modo migliore che posso pensare per descrivere un **database relazionale** è immaginare un foglio di calcolo come **Excel, Numbers o Google Sheets**.  
È una grande tabella con molte colonne e righe. Ogni riga rappresenta una singola voce del database e ogni colonna rappresenta un campo.

La maggior parte dei database relazionali ha uno **schema strutturato**; non puoi inventare campi al volo come con MongoDB. Devi seguire uno schema predefinito quando inserisci dati.  
Ad esempio, se crei un database per gli indirizzi, esso conterrà `indirizzo`, `città` e `stato`. Se qualcuno tenta di inserire una colonna “commento”, non sarà consentito perché non
è nello schema definito. Questo può essere un vantaggio, perché impone disciplina all’applicazione, ma può anche risultare poco flessibile.

Il vero potere dei database relazionali è proprio nella loro natura: puoi avere più tabelle che **si relazionano tra loro**. (In effetti è nel nome, quindi non è un segreto!)
Mentre in MongoDB è sconsigliato unire documenti tra diverse collezioni, nei database relazionali è **normale e utile fare JOIN** tra tabelle diverse.

---

## Che cos’è SQL

**SQL** sta per _Structured Query Language_.

È sostanzialmente un linguaggio per porre domande e inviare istruzioni a un database, al fine di **creare, leggere, aggiornare ed eliminare** record. Ogni database relazionale ha
una propria “variante” di SQL, ma in generale le differenze non sono enormi. Con MongoDB mandavamo oggetti JSON come query, qui invieremo **stringhe SQL** che il database leggerà ed eseguirà.

È un linguaggio **potente e flessibile**, ma anche molto vasto — [tecnicamente SQL è Turing Complete][turing]. Mi ricordo il mio primo lavoro, uno stage, in cui passavo
giornate a scrivere query lunghissime (decine di righe). Noi qui non andremo così in profondità: vedremo le basi, poi potrai approfondire quando servirà.

L’obiettivo è che tu capisca:

- come funzionano i database relazionali,
- come modellare i dati in relazioni,
- come scrivere query corrette.

---

## Il panorama SQL

Parleremo **PostgreSQL** e voglio spiegarti perché ho scelto proprio questo. Nel mondo SQL ci sono varie alternative (mentre nel mondo NoSQL MongoDB era praticamente la scelta più ovvia).
Prima di spiegarti i vantaggi di PostgreSQL, diamo uno sguardo alle altre opzioni.

---

## MySQL / MariaDB

L’altra scelta “ovvia” sarebbe stata **MySQL**, ed è in realtà quello che ho usato di più nella mia carriera. MySQL alimenta WordPress (popolarissimo) ed è largamente diffuso,
con grandi aziende come Facebook, Google e Netflix che lo utilizzano.

È una scelta assolutamente valida ancora oggi: altamente scalabile, con una base di codice matura e stabile, e con tutte le funzionalità necessarie. L’unico appunto è che ora è di proprietà **Oracle**, e questo a volte fa riflettere alcuni utenti.

Dopo l’acquisizione da parte di Oracle, alcuni creatori originali di MySQL hanno fatto un fork dando vita a **MariaDB**, che è in gran parte compatibile con MySQL.  
Anche MariaDB è una scelta ottima e molto diffusa.

---

## SQLite

Un altro database **molto comune**. **SQLite** è leggerissimo, compatto e veloce. Non è pensato per essere un server indipendente ma per essere **incluso direttamente** nelle applicazioni.

Poiché non ha codice di rete o di replica, è perfetto per dispositivi IoT, sistemi operativi, console di gioco (sia PlayStation che Xbox lo usano!), frigoriferi e praticamente ovunque.

Però non è molto utile nello sviluppo web moderno: è semplice da avviare ma non regge grandi carichi e non può scalare in modo indipendente. È utile conoscerlo per casi embedded, ma
non per ambienti di produzione web.

---

## Microsoft SQL Server / Oracle / DB2

Questi sono prodotti **commerciali** e molto datati. Funzionano bene su larga scala, ma i costi possono essere elevati. Io non li tratto qui perché non li ho mai usati e perché
esistono ottime alternative open source.

---

## PostgreSQL

Arriviamo quindi a **PostgreSQL** (si pronuncia “post-gress”). È un altro eccellente database **open source**, in costante crescita di popolarità e ricco di funzionalità avanzate.

Vedremo alcune di queste caratteristiche nel corso, ma sappi che:

- **scala bene**,
- ha **feature molto potenti**,
- ed è oggi una delle scelte più popolari.

Tra i suoi utenti ci sono aziende come **Apple, Microsoft, Etsy** e molte altre.

[turing]: https://stackoverflow.com/a/7580013
