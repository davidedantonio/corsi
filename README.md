# Introduzione ai Database, Data Analytics e AI

Argomenti trattati durante le lezioni tenute per il percorso **IFTS Business Data Analyst**.

- Ecco un link al sito del corso: [https:/mcg-consulting2026.vercel.app/](https://mcg-consulting2026.vercel.app)

## Step 1: Installare Node.js

Installare Node.js è un processo abbastanza semplice e varia leggermente a seconda del sistema operativo che stai utilizzando. Ecco le istruzioni per i sistemi operativi più comuni:

### Su Windows

1. **Scarica il programma di installazione:**
   - Vai al sito ufficiale di Node.js: [https://nodejs.org](https://nodejs.org)
   - Scarica l'installer per Windows (LTS è raccomandata per la maggior parte degli utenti).

2. **Esegui il programma di installazione:**
   - Apri il file `.msi` scaricato.
   - Segui le istruzioni della procedura guidata di installazione.
   - Accetta il contratto di licenza, seleziona le opzioni predefinite e fai clic su "Next".
   - Puoi scegliere di installare Node.js e npm (Node Package Manager) insieme.

3. **Verifica l'installazione:**
   - Apri il Prompt dei comandi (cmd) o PowerShell.
   - Esegui il comando `node -v` per verificare la versione di Node.js installata.
   - Esegui il comando `npm -v` per verificare la versione di npm installata.

### Su macOS

1. **Usa il programma di installazione:**
   - Vai al sito ufficiale di Node.js: [https://nodejs.org](https://nodejs.org)
   - Scarica l'installer per macOS (LTS è raccomandata per la maggior parte degli utenti).
   - Apri il file `.pkg` scaricato e segui le istruzioni.

2. **Usa Homebrew (alternativa raccomandata):**
   - Apri il Terminale.
   - Se non hai Homebrew installato, installalo con:
     ```sh
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     ```
   - Installa Node.js usando Homebrew:
     ```sh
     brew install node
     ```

3. **Verifica l'installazione:**
   - Apri il Terminale.
   - Esegui il comando `node -v` per verificare la versione di Node.js installata.
   - Esegui il comando `npm -v` per verificare la versione di npm installata.

### Su Linux

1. **Usa il gestore di pacchetti del sistema (Debian/Ubuntu):**
   - Apri il Terminale.
   - Aggiorna il sistema:
     ```sh
     sudo apt update
     ```
   - Installa Node.js dai repository ufficiali:
     ```sh
     sudo apt install nodejs npm
     ```
   - Potrebbe essere necessario installare anche `build-essential` per compilare pacchetti npm nativi:
     ```sh
     sudo apt install build-essential
     ```

2. **Usa NodeSource (per ottenere versioni più recenti):**
   - Apri il Terminale.
   - Aggiungi il repository NodeSource:
     ```sh
     curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
     ```
   - Installa Node.js:
     ```sh
     sudo apt-get install -y nodejs
     ```

3. **Verifica l'installazione:**
   - Apri il Terminale.
   - Esegui il comando `node -v` per verificare la versione di Node.js installata.
   - Esegui il comando `npm -v` per verificare la versione di npm installata.

### Su altre distribuzioni Linux

Il processo può variare leggermente. Per esempio, su Fedora, puoi usare:

```sh
sudo dnf install nodejs
```

Oppure puoi usare il gestore di versioni `nvm` (Node Version Manager) che funziona su molte piattaforme:

1. **Installa nvm:**

   ```sh
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
   ```

   - Riavvia il Terminale o esegui:
     ```sh
     source ~/.bashrc
     ```

2. **Installa Node.js con nvm:**

   ```sh
   nvm install --lts
   ```

3. **Verifica l'installazione:**
   - Esegui `node -v` e `npm -v` per confermare l'installazione.

Seguendo queste istruzioni dovresti essere in grado di installare Node.js con successo sul tuo sistema operativo preferito.

## Scaricare questo progetto

Per scaricare questo progetto da GitHub in formato ZIP, segui questi semplici passaggi:

1. **Vai alla pagina del repository su GitHub:**
   - Apri il browser e vai alla pagina del repository che vuoi scaricare. Ad esempio, se vuoi scaricare il repository `https://github.com/davidedantonio/data-analytics`.

2. **Trova il pulsante "Code":**
   - Sulla pagina del repository, cerca un pulsante verde o blu etichettato "Code". Questo pulsante si trova generalmente in alto a destra, sopra l'elenco dei file.

3. **Scarica il file ZIP:**
   - Clicca sul pulsante "Code".
   - Nel menu a discesa, vedrai un'opzione "Download ZIP". Cliccala.

4. **Salva il file ZIP:**
   - Il download del file ZIP inizierà immediatamente. Una volta completato, salva il file sul tuo computer.

5. **Estrai il contenuto del file ZIP:**
   - Una volta scaricato il file ZIP, naviga alla cartella in cui è stato salvato.
   - Usa il tuo software di decompressione preferito (come WinRAR, 7-Zip, o l'utility di decompressione incorporata nel sistema operativo) per estrarre il contenuto del file ZIP in una cartella.

### Passaggi Dettagliati con Immagini

1. **Vai alla pagina del repository:**
   - Ad esempio, se vuoi scaricare un repository specifico, il link potrebbe essere qualcosa come `https://github.com/davidedantonio/corsi`.

2. **Trova e clicca sul pulsante "Code":**
   ![Step 2](https://docs.github.com/assets/images/help/repository/code-button.png)

3. **Clicca su "Download ZIP":**
   ![Step 3](https://docs.github.com/assets/images/help/repository/download-zip-button.png)

4. **Salva e decomprimi il file ZIP:**
   - Salva il file ZIP in una posizione facilmente accessibile sul tuo computer.
   - Utilizza un software di decompressione per estrarre il contenuto del file ZIP.

Dopo aver completato questi passaggi, avrai una copia locale del progetto GitHub che potrai esplorare e utilizzare come desideri.

## Installare YARN

Dalla console dei comandi digitare quanto segue:

```
npm install -g yarn
```

## Installare le dipendenze del progetto con Yarn

Installare le dipendenze di un progetto Node.js con Yarn è un processo semplice. Ecco i passaggi dettagliati per farlo:

1. Apri il Terminale (su macOS o Linux) o il Prompt dei comandi (su Windows).
2. Naviga nella directory del progetto:
   ```sh
   cd /path/to/corsi
   ```
3. Esegui il comando per installare le dipendenze:
   ```sh
   yarn install
   ```

## Eseguire il progetto in locale

Ecco i passaggi per farlo:

1. Apri il Terminale (su macOS o Linux) o il Prompt dei comandi (su Windows).
2. Naviga nella directory del progetto:

   ```sh
   cd /path/to/corsi
   ```

3. Esegui il comando per avviare il progetto in locale:
   ```sh
   yarn dev
   ```
