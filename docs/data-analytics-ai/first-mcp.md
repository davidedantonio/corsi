---
sidebar_position: 6
---

# Il primo MCP Server

Senza ulteriori indugi, creiamo il nostro primo server MCP!

Per iniziare realizzeremo un server MCP locale, nel modo “classico”, cioè tramite STDIO — chiamalo come preferisci.

:::info
Nella sua forma più semplice, un server MCP è esattamente questo: un server. È un processo locale che gira sul tuo sistema e che
consente di ricevere input tramite standard input/output, in modo che un LLM possa interagire con esso.
:::

A dire il vero, i server MCP sono estremamente semplici nella loro essenza, e probabilmente ti sembrerà eccessivo tutto il “mistero”
che spesso li circonda (e sì, lo è davvero).

Si tratta di un tipo di server leggermente specializzato, nel senso che si aspetta input in un certo formato e restituisce risposte
con una struttura ben definita. Ma, al di là di questo, è un server assolutamente standard, tanto che puoi implementarlo tranquillamente
in Node.js, Bun, Python o qualsiasi altro linguaggio.

Noi utilizzeremo il pacchetto `@modelcontextprotocol/sdk`, che è un piccolo toolkit pensato per aiutarti a partire più velocemente.
Non è strettamente necessario, dato che il protocollo MCP è piuttosto semplice, ma ci aiuta a gestire correttamente tutti gli aspetti del flusso.

A questo punto, crea una nuova directory, esegui

```
npm init -y
```

e poi

```
npm install @modelcontextprotocol/sdk.
```

In un nuovo file chiamato `mcp.js`, aggiungi:

```javascript
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "add-server",
  version: "1.0.0",
});

// Add an addition tool
server.registerTool(
  "add",
  {
    title: "Addition Tool",
    description: "Add two numbers",
    inputSchema: { a: z.number(), b: z.number() },
  },
  async ({ a, b }) => {
    return {
      content: [{ type: "text", text: String(a + b) }],
    };
  },
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
```

Questo è probabilmente il server MCP più semplice che potrai trovare.

- Si registra come server MCP tramite l’istanza di McpServer.
- Successivamente aggiungiamo un solo tool, che serve a sommare due numeri. Ovviamente un LLM è già in grado di farlo, ma qui stiamo puntando alla semplicità.

- Specifichiamo poi che il transport utilizzato è stdio, cioè utilizziamo lo standard input della shell (stdin) per inviare informazioni al server
  MCP. L’altro tipo di transport è SSE, che vedremo più avanti.

- In questo esempio utilizziamo anche Zod. Zod è una libreria di validazione progettata principalmente per TypeScript. È molto utile perché
  consente di definire chiaramente gli schemi attesi e svolge diverse funzioni.

- Prima di tutto, comunica in modo esplicito al modello:

- “Qualsiasi input tu produca deve rispettare questa validazione Zod.”

- Gli LLM tendono a funzionare meglio quando ricevono vincoli chiari.

- Inoltre, funge da documentazione per il futuro: descrive in modo preciso quali dati sono richiesti da questo tool.

Infine, permette di aggiungere annotazioni che spiegano al modello:

- che una variabile chiamata X si aspetta un certo tipo Y
- e, in linguaggio naturale, qual è il significato di quella variabile

A questo punto, prova ad avviare il server: vedrai che apparentemente non succede nulla.
Questo perché devi utilizzare lo stdin per inviargli dei comandi.

Proviamo a farne uno.

```
# List available tools:
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {"name": "add", "arguments": {}}}' | node mcp.js | jq

# Call a tool:
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "add", "arguments": {"a": 5, "b": 3}}}' | node mcp.js
```

Ecco la traduzione in italiano, naturale e adatta a un contesto didattico:

⸻

- `jq` è uno strumento estremamente utile per processare JSON da riga di comando. Può fare molto più che formattare l’output, ma nel 99,99%
  dei casi lo utilizzo proprio per quello.

- In realtà non è necessario sapere come invocare manualmente il tuo server MCP tramite CLI: sarà l’LLM a farlo per te. Tuttavia, può essere
  molto utile in fase di testing. Personalmente, spesso faccio generare direttamente all’LLM il comando da eseguire da terminale.

- È sufficiente sapere che stai chiamando i tool tramite stdin, utilizzando un formato standard.
  Il client invia una richiesta per ottenere la lista dei tool disponibili (ed è così che gli LLM capiscono cosa possono utilizzare), e
  poi utilizza tools/call per invocare effettivamente un tool. C’è molto di più dietro MCP, ma è un livello abbastanza basso e, nella
  pratica, non è necessario conoscerlo in dettaglio. Questo
  però è il protocollo di base.
