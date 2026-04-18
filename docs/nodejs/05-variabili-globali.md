---
sidebar_position: 5
---

# Variabili Globali

Esattamante come i browsers, Node.js possiede alcune variabili globali che 
possiamo utilizzare nelle nostre applicazioni.

## Le più comuni

* `global`
pensate a `global` in Node.js come a `window` per il browser. **NON ABUSATENE**!

![](./img/ch-5/01.png)

* `__dirname`
contiene una stringa il cui valore rappresenta il percorso della directory del 
file che stiamo editando.

* `__filename`
il nome del file del modulo corrente. Questo è il percorso assoluto del file del modulo corrente con i collegamenti simbolici risolti. 
Per un programma principale questo non è necessariamente lo stesso del nome del file utilizzato nella riga di comando.

* `process`
Questo è un oggetto globale che contiene tutte le informazioni sul processo in esecuzione.
Variabili d'ambiente, informazioni sulla macchina che sta eseguendo lo script, 
riferimenti agli standard I/O e così via.

* `exports` `module` `require`
Queste variabili vengono utilizzate per importare ed esportare moduli. 
Li vedremo in dettaglio a breve.

## Altro ancora

A seconda della versione di Node.js che si sta eseguendo, ci sono diversi globals.
Non tantissimi come quelli del broser, ma tanti che probabilmente non utilizzerete mai.
Se volete avere conoscenza di tutte le variabili globali di Node.js date uno sguardo
alla [documentazione ufficiale](https://nodejs.org/api/globals.html).
