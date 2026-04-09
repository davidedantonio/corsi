---
sidebar_position: 1
---

# Introduzione agli LLM

Quando si parla di intelligenza artificiale oggi, è impossibile non imbattersi nei **Large Language Models**, spesso abbreviati in LLM.
Sono i sistemi che stanno dietro a strumenti come ChatGPT, assistenti di codice, sistemi di traduzione avanzata e molte altre applicazioni
che fino a pochi anni fa sembravano fantascienza.

Ma cosa sono davvero? E soprattutto: perché funzionano così bene?

Per rispondere a queste domande dobbiamo fare un passo indietro e guardare il problema da una prospettiva più fondamentale: il linguaggio

## Il linguaggio come sequenza

Per un essere umano, il linguaggio è qualcosa di naturale. Leggiamo una frase e ne comprendiamo il significato quasi istantaneamente. Ma
per una macchina, il linguaggio è solo una sequenza di simboli.

Prendiamo una frase semplice:

> "Il gatto è sul divano."

Per un LLM, questa frase è solo una sequenza di parole:

```
["Il", "gatto", "è", "sul", "divano"].
```

Il primo grande problema diventa quindi: **come possiamo trasformare il linguaggio in qualcosa che una macchina possa elaborare?**

La risposta è: **numeri**.

## Tokenizzazione

Il primo passo nel funzionamento di un LLM è la tokenizzazione.

Un token è un’unità di testo. Non necessariamente una parola: può essere una parola intera, una parte di parola, o persino un singolo carattere.

Ad esempio, la frase:

“programmazione”

potrebbe essere suddivisa così:

```
["program", "mazione"]
```

Oppure, se usiamo una tokenizzazione più fine:

```
["p", "r", "o", "g", "r", "a", "m", "m", "a", "z", "i", "o", "n", "e"]
```

Ad ogni token poi viene assegnato un numero, che è ciò che il modello realmente elabora. Ad esempio:

```
"Il" -> 1
"gatto" -> 2
"è" -> 3
"sul" -> 4
"divano" -> 5
```

La tokenizzazione è un processo fondamentale perché consente al modello di lavorare con unità di testo più gestibili.

## L'idea alla base degli LLM: prevedere il prossimo token

Un LLM è addestrato su una quantità enorme di testo (libri, articoli, siti web, codice…). Durante l'addestramento impara a
**predire la parola successiva** in una sequenza.

```
"Il cielo è di colore ___" → azzurro
```

Ripetendo questo processo miliardi di volte su miliardi di frasi, il modello sviluppa una comprensione profonda del
linguaggio — grammatica, fatti, ragionamento, stili.

:::info In breve
Un LLM non "capisce" come un umano. Ma ha imparato così tante associazioni tra parole e concetti da sembrare capirlo.
:::

---

## L'architettura di base: il Transformer

Tutti i principali LLM si basano su un'architettura chiamata **Transformer**, introdotta da Google nel 2017 nel paper _"Attention is All You Need"_.

Il meccanismo chiave si chiama **Attention**: permette al modello di capire quali parole in una frase sono rilevanti rispetto alle altre.

Esempio:

> _"La banca era piena di gente. Decisi di aspettare fuori."_

Il Transformer capisce che "banca" si riferisce a un istituto finanziario (e non alla riva di un fiume) grazie al contesto delle parole circostanti.

---

## I parametri: la "memoria" del modello

Quando si parla di LLM si sentono spesso numeri come **7 miliardi**, **70 miliardi**, **405 miliardi di parametri**.

I **parametri** sono i valori numerici che il modello ha appreso durante l'addestramento. Più parametri, in generale:

- Maggiore capacità di ragionamento
- Migliore comprensione del contesto
- Maggiore costo computazionale

:::tip Analogia
Pensa ai parametri come ai "neuroni" di una rete: non memorizzano frasi specifiche, ma codificano pattern e relazioni tra concetti.
:::

---

## Cosa sa (e cosa non sa) un LLM

Un LLM sa tutto ciò su cui è stato addestrato — ma con dei limiti importanti:

| Cosa sa fare                   | Cosa non sa fare (di default)         |
| ------------------------------ | ------------------------------------- |
| Rispondere a domande generali  | Accedere a internet in tempo reale    |
| Scrivere, riassumere, tradurre | Conoscere eventi dopo il suo training |
| Ragionare su problemi logici   | Accedere ai tuoi dati privati         |
| Generare codice                | Eseguire azioni nel mondo reale       |

:::note
Questi limiti si possono superare con tecniche come **RAG** e **Tool Use** — che vedremo nei prossimi capitoli.
:::

---

## Le fasi di vita di un LLM

```
1. Pre-training     → Addestramento su enormi corpus di testo
2. Fine-tuning      → Specializzazione su task specifici
3. RLHF             → Allineamento tramite feedback umano
4. Deployment       → Messo a disposizione via API o interfaccia
```

**RLHF** (Reinforcement Learning from Human Feedback) è la fase che rende un LLM "educato" e utile: umani valutano le risposte e il modello impara a preferire quelle migliori.

---

## I principali modelli oggi

| Modello    | Azienda    | Note                                     |
| ---------- | ---------- | ---------------------------------------- |
| GPT-4o     | OpenAI     | Multimodale, molto diffuso               |
| Claude 3.x | Anthropic  | Forte nel ragionamento e nella sicurezza |
| Gemini     | Google     | Integrato nell'ecosistema Google         |
| LLaMA 3    | Meta       | Open source, eseguibile in locale        |
| Mistral    | Mistral AI | Europeo, efficiente, open                |

---

## Riepilogo

- Un LLM è un modello statistico addestrato su enormi quantità di testo
- Funziona predicendo il token successivo, su scala massiva
- Si basa sull'architettura **Transformer** e il meccanismo di **Attention**
- Ha limiti intrinseci: conosce solo ciò su cui è stato addestrato
- Questi limiti si superano con **RAG** e **Tool Use** — argomenti che tratteremo più avanti
