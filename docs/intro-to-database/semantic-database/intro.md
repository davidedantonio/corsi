---
sidebar_position: 1
---

# Database Semantici e Vettoriali

Prima di immergerci in **Qdrant**, è importante capire cosa sono i database semantici e perché
rappresentano un cambio di paradigma fondamentale nel modo in cui archiviamo e recuperiamo informazioni.

## Il problema della ricerca tradizionale

Immagina di avere un database di ricette. Con un database tradizionale (sia relazionale che NoSQL),
se cerchi "pasta al pomodoro", otterrai esattamente quello: ricette che contengono le parole
"pasta" e "pomodoro". Ma cosa succede se:

- Cerchi "spaghetti con salsa rossa" → nessun risultato (anche se è la stessa cosa!)
- Cerchi "primo piatto italiano semplice" → nessun risultato (anche se descrive perfettamente la pasta al pomodoro)
- Un utente scrive "penne" invece di "pasta" → risultati limitati o nulli

I database tradizionali fanno matching esatto (o al massimo fuzzy matching) sulle parole, ma non
capiscono il significato di ciò che cerchiamo.

## Come funziona la ricerca semantica

La ricerca semantica risolve questo problema trasformando testi, immagini, audio o qualsiasi altro dato
in **vettori numerici** (chiamati **embeddings**) che catturano il significato del contenuto.

Ad esempio, usando modelli di intelligenza artificiale come quelli di OpenAI, possiamo convertire
la frase "pasta al pomodoro" in un vettore come questo (semplificato per chiarezza):

```
[0.12, -0.34, 0.56, ..., 0.78]
```

Pensa a ogni parola o frase come a un punto in uno spazio a centinaia (o migliaia) di dimensioni, dove:

- Concetti simili sono **vicini** nello spazio
- Concetti diversi sono **distanti**

In realtà gli embeddings hanno centinaia di dimensioni (384, 768, 1536...), ma per capire il concetto immaginiamo
uno spazio 2D dove ogni asse rappresenta una "caratteristica semantica":

![Spazio vettoriale 2D](/img/semantic/semantic_search.png)

**Osservazioni importanti**:

1. Cane e gatto sono vicini (8-9 su entrambi gli assi). Entrambi animali domestici comuni
2. Leone e tigre sono vicini tra loro (7, 3-4). Animali, ma più selvaggi/esotici. Distanti da cane/gatto perché meno "domestici"
3. Pizza, pasta e burger sono vicini (1-2, 1-2). Tutti cibi, poco "animali". Molto "familiari/domestici" nel senso di quotidiani
4. Cibo e animali sono lontani. Occupano regioni diverse dello spazio

**Esempio più realistico: Spazio 3D**

Aggiungiamo una terza dimensione per rendere l'esempio più ricco:

![Ricerca 3D](/img/semantic/semantic_search_3d.png)

**Calcolo distanze (Euclidea semplificata):**

- Distanza cane ↔ gatto: √[(9-8)² + (8-9)² + (4-3)²] = √3 ≈ 1.73 ✅ Molto vicini!
- Distanza cane ↔ leone: √[(9-9)² + (8-2)² + (4-9)²] = √61 ≈ 7.81 ❌ Distanti
- Distanza cane ↔ pizza: √[(9-0)² + (8-8)² + (4-3)²] = √82 ≈ 9.06 ❌ Molto distanti
- Distanza pizza ↔ pasta: √[(0-0)² + (8-9)² + (3-2)²] = √2 ≈ 1.41 ✅ Molto vicini!

**Nel mondo reale**

I modelli di embedding non usano 2-3 dimensioni, ma 384, 768 o anche 1536 dimensioni, dove ogni dimensione cattura sfumature semantiche complesse:

- Dimensione 47: "relazione con il cibo"
- Dimensione 128: "aspetto emotivo positivo/negativo"
- Dimensione 203: "concetti astratti vs concreti"
- Dimensione 391: "contesto formale vs informale"
  ... e così via per centinaia di dimensioni

Questo permette di catturare **significati ricchissimi e sfumati** che nessun umano potrebbe progettare manualmente!

Esempio pratico con query

![Ricerca 3D](/img/semantic/semantic_search_query.png)

## Come si generano gli embeddings?

Gli embeddings vengono generati da modelli di machine learning addestrati su enormi quantità di dati.
Questi modelli "imparano" il significato dei concetti analizzando:

- **Co-occorrenze**: parole che appaiono spesso insieme probabilmente hanno significati correlati
- **Contesto**: il significato di una parola dipende dalle parole circostanti
- **Relazioni semantiche**: sinonimi, antonimi, iperonymi, ecc.

Modelli popolari per generare embeddings testuali:

- **OpenAI Ada** (proprietario, molto potente)
- **Sentence Transformers** (open-source, famiglia BERT)
- **Nomic Embed** (open-source, ottimo per uso locale)
- **Cohere Embed** (proprietario, ottimizzato per lingue multiple)
