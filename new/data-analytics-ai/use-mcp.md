---
sidebar_position: 7
---

# Come usare un MCP Server

Ora che abbiamo un server MCP funzionante, utilizziamolo!

Ti mostrerò come fare sia con Claude Desktop, ma in generale puoi semplicemente cercare su Google qualcosa come
“how do I use MCP server with …” per trovare le istruzioni specifiche per lo strumento che stai utilizzando.

:::info
Tieni presente che questa procedura potrebbe cambiare nel tempo. In particolare, è probabile che Claude Desktop renda tutto questo molto più semplice in futuro. Tuttavia, al momento in cui scriviamo, questo è il modo corretto per farlo.
:::

## Usare un MCP Server con Claude Desktop

1. Apri Claude Desktop e vai alla sezione "Connect your tools to Claude".
2. Clicca su "Add a new tool" e seleziona "MCP Server".
3. Inserisci un nome per il tuo server (ad esempio, "My MCP Server") e specifica il percorso del file del tuo server MCP (ad esempio, `./mcp.js`).
4. Salva le impostazioni e avvia il server MCP se non è già in esecuzione.
5. Ora puoi iniziare a interagire con il tuo server MCP direttamente da Claude Desktop. Ad esempio, puoi inviare una richiesta al tuo
   server per eseguire un'operazione specifica (ad esempio, sommare due numeri) e ricevere la risposta generata dal tuo server MCP.

Probabilmente verrai indirizzato direttamente al file da modificare: aprilo con VS Code o con l’editor che preferisci e inserisci al suo interno il seguente contenuto:

```javascript
{
  "mcpServers": {
    "demo-server": {
      "command": "[the fully path to your node binary]",
      "args": ["[the full path to your mcp.js file]"],
      "env": {
        "NODE_OPTIONS": "--no-deprecation"
      }
    }
  }
}
```

Digita `which node` per ottenere il percorso del tuo Node.js. Il mio è lungo e un po’ strano perché utilizzo `nvm` per gestire le
installazioni di Node.js. Il tuo potrebbe essere più semplice.

Nella directory in cui si trova il file mcp.js, esegui pwd. Copia il percorso restituito e aggiungi `/mcp.js` alla fine: quello
sarà il valore da usare negli args.

L’opzione `--no-deprecation` serve semplicemente a ridurre il rumore nei log, soprattutto se hai diverse dipendenze. Credo che
possa anche creare confusione in Claude. La vedo in molti esempi, quindi la utilizzo anch’io.

A questo punto, riavvia Claude Desktop (devi riavviarlo ogni volta che modifichi la configurazione) e dovresti essere in
grado di utilizzare il tuo server MCP.
