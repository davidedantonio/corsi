---
sidebar_position: 2
---

# Terminologia

Prima di iniziare a lavorare con questi diversi tipi di database, voglio assicurarci che alcuni termini comuni siano chiari
e che siano chiari anche gli obiettivi di oggi: cosa tratteremo e cosa no.

---

## Che cos’è un database e altri termini comuni

Un **database** è un luogo dove conservare dati.  
Un altro modo per pensarci è come un posto dove salvare lo **stato della tua applicazione**, così da poterlo recuperare in seguito.  
Questo ti permette di avere server **stateless** (senza stato), perché tutte le informazioni vengono mantenute nel database.  
Molti oggetti possono essere visti come un tipo di database: per esempio un foglio Excel o persino un semplice file di testo con dei dati.

Una **query** è un comando che invii a un database per fargli fare qualcosa: recuperare informazioni, aggiungerle, aggiornarle o cancellarle.  
Può anche servire ad aggregare informazioni in una vista riepilogativa.

---

## Schema

Se immagini un database come una tabella Excel, lo **schema** è l’insieme delle colonne: una struttura rigida che serve a modellare i dati.

Esempio: se ho un oggetto JSON come

```json
{ "name": "Davide", "city": "Salerno", "region": "Campania" }
```

lo **schema** è composto da `name`, `city` e `region`.
Alcuni database, come **PostgreSQL**, richiedono uno schema definito in anticipo.  
Altri, come **MongoDB**, ti permettono di definire la struttura “al volo”.

---

## Tipi di database

Oggi esistono molti tipi di database. Noi ne tratteremo quattro, ma è utile sapere che ne esistono altri.

Nel corso parleremo di:

- **Database relazionali (RDBMS, SQL)**
- **Database documentali (NoSQL)**
- **Database chiave-valore**

---

## ACID

ACID è un acronimo che sta per **Atomicita, Consistenza, Isolamento, Durabilita**. Sono quattro proprietà fondamentali per valutare come un database gestisce le transazioni.

- **Atomicità** → un’operazione deve avvenire tutta insieme o non avvenire affatto.
- **Atomicità** → un’operazione deve avvenire tutta insieme o non avvenire affatto.
  > Es.: trasferimento bancario: togli soldi da un conto e aggiungili all’altro; non può fallire a metà.
- **Consistenza** → dopo un’operazione i dati devono rimanere coerenti tra più server/repliche.
- **Isolamento** → l’esecuzione concorrente di query deve dare lo stesso risultato di un’esecuzione sequenziale.
- **Durabilità** → i dati devono sopravvivere a crash o riavvii; ciò spesso richiede scrittura su disco (più lenta ma sicura).

⚖️ Non tutto deve essere sempre **ACID**: è sicuro ma può essere lento. Molti database permettono di scegliere per singola query quanto “ACID” deve essere l’operazione, bilanciando sicurezza e performance.

---

## Transazioni

Le **transazioni** permettono di raggruppare più operazioni in un unico blocco indivisibile: o si eseguono tutte, o nessuna.

Durante una transazione:

- tutte le query vengono eseguite come un unico pacchetto,
- nessun’altra query può inserirsi “in mezzo”,
- se qualcosa fallisce, tutto viene annullato.

> Esempio: nel bonifico bancario, la transazione garantisce che i soldi vengano tolti da un conto e aggiunti all’altro nello stesso momento, evitando inconsistenze.
