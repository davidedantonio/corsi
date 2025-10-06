---
sidebar_position: 1
---

# Installazione

In questo corso useremo quattro database diversi: MongoDB, PostgreSQL e Redis.
Questi sono pacchetti software che dovrai scaricare e avviare, e hai diverse opzioni per farlo.
Tutti funzionano su macOS, Windows e Linux. Io spiegherò in modo dettagliato come farlo su macOS e Windows, e presumo che tutti
gli amici che usano Linux possano adattare le istruzioni per macOS alle loro esigenze.

In ogni caso, assicurati di scaricare la versione quanto più vicina alla mia.
Se non lo fai, potresti avere problemi perché la sintassi e le query possono cambiare da una versione all’altra.
Ecco le versioni che utilizzeremo in questo corso:

- MongoDB v8.2.1
- PostgreSQL v17.0
- Redis v8.2

Ecco alcune delle opzioni che hai a disposizione:

## Docker

Questo è il metodo che userò io e ti mostrerò i comandi Docker corretti per far funzionare tutto in questo modo.
Anche se i container non ti sono molto familiari, se installi Docker e segui i comandi indicati, dovrebbe funzionare tutto senza problemi.
[Vai qui](https://www.docker.com/products/docker-desktop/) per installare Docker Desktop, che gestirà tutto ciò di cui hai bisogno.

⸻

## Package manager

Un’altra opzione altrettanto valida è installare i database tramite un gestore di pacchetti.
Su macOS puoi usare [Homebrew](https://brew.sh/); su Windows puoi usare [winget](https://docs.microsoft.com/en-us/windows/package-manager/winget/#install-winget)
oppure [Chocolatey](https://chocolatey.org/).

Su Linux userai il package manager della tua distribuzione.
Se stai usando Linux come desktop, presumo che tu sappia già come fare. 😄

⸻

## Scaricare e installare manualmente i file binari

Puoi anche semplicemente andare sui siti ufficiali e scaricare i database manualmente!
Io preferisco farlo tramite un package manager, ma non c’è nessun motivo per cui tu non possa scegliere questa strada se preferisci.

Qui trovi tutti gli URL corretti.

- [MongoDB](https://www.mongodb.com/try/download/community)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Redis](https://redis.io/downloads/)

Assicurati di scaricare la stessa versione che indico io, altrimenti potresti avere problemi (probabilmente non sarà la versione più recente).

## Versione di Node.js

Eseguiremo alcuni esempi di codice con Node.js.
Non è molto importante quale versione scegli, purché sia superiore alla versione 20.
Io utilizzerò l’ultima LTS per questo corso, v20.x.x.
Sentiti libero di installarla dal [sito ufficiale](https://nodejs.org/en/download) oppure tramite un gestore di versioni come nvm.
