---
sidebar_position: 1
---

# NoSQL

Entriamo subito nel nostro secondo paradigma di database, i **database NoSQL**.  
Il termine "NoSQL" è sicuramente una parola di moda e in realtà non significa molto.  
Quando dici NoSQL, stai semplicemente dicendo che **non è un database relazionale**.  
La cosa può diventare ancora più confusa quando ti rendi conto che alcuni database NoSQL possono gestire query SQL.  
In definitiva, è un termine di marketing poco utile che inserisco qui solo perché lo troverai ovunque.

È più utile distinguere **che tipo** di database NoSQL stiamo per trattare.  
In questa sezione parleremo di un database **documentale** usando **MongoDB**.  
Esistono molti altri database NoSQL e spesso sono molto diversi tra loro, ma vengono comunque raggruppati tutti sotto l’etichetta “NoSQL”.

---

## Perché scegliere un database documentale

Ci sono una miriade di ragioni per scegliere uno di questi database e molte si sovrappongono.  
La maggior parte di quelli che vedremo oggi sono quelli che chiamerei database “da lavoro”: possono gestire carichi
generici e non hai necessariamente bisogno di una caratteristica specifica; ti serve solo un database.

Con i database documentali, uno dei vantaggi più evidenti e importanti è che i tuoi dati sono **totalmente non strutturati** — e va bene così.  
Con un database relazionale, devi definire in anticipo la forma dei tuoi dati.
Ad esempio, diresti che questa tabella ha tre colonne: `name` che è una stringa, `age` che è un numero intero.  
Con un database documentale puoi semplicemente iniziare a scrivere oggetti nel database e lui li accetterà.  
Alcuni documenti possono avere certi campi e altri documenti campi diversi. È totalmente a tua scelta.  
Può persino essere un problema se sbagli a scrivere un nome di campo, perché il database accetterà comunque il campo scritto male (non che io l’abbia mai fatto 😅).

I database documentali risultano molto familiari agli sviluppatori **JavaScript**: è come prendere i normali oggetti JavaScript e salvarli nel database per recuperarli in seguito.

---

## Altri database NoSQL da conoscere

Ci sono moltissimi altri tipi di database NoSQL là fuori e ne vengono creati di nuovi piuttosto spesso.  
Oggi ci concentreremo su **MongoDB**, ma vale la pena esplorare anche altri database NoSQL come **Cassandra**, **Couchbase**, **ReThinkDB** e altri ancora.
