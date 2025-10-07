---
sidebar_position: 5
---

# Paginazione dei risultati

A volte hai bisogno di recuperare molti punti dal database senza fare una ricerca semantica. Ad esempio:

- Esportare tutti i dati per un backup
- Analizzare statistiche su tutta la collezione
- Migrare dati verso un altro sistema
- Processare batch di documenti

Per questi casi, Qdrant offre l'operazione scroll che funziona come un cursore/iteratore,
permettendoti di recuperare i punti in modo paginato senza sovraccaricare la memoria.

## Differenza tra search e scroll

| Caratteristica       | search                 | scroll                             |
| -------------------- | ---------------------- | ---------------------------------- |
| **Scopo**            | Trovare punti simili   | Recuperare punti in batch          |
| **Richiede vettore** | ✅ Sì (per similarità) | ❌ No (opzionale)                  |
| **Ordinamento**      | Per similarità         | Per ID o inserimento               |
| **Performance**      | Ottimizzato per top-K  | Ottimizzato per scansione completa |
| **Uso tipico**       | Query utente           | Export, analisi, migrazione        |

## Come funziona lo scroll

Lo scroll utilizza un offset (cursore) che indica da dove riprendere nella prossima iterazione:

```javascript
1° chiamata → offset: null     → restituisce punti 1-100  + offset: "abc123"
2° chiamata → offset: "abc123" → restituisce punti 101-200 + offset: "def456"
3° chiamata → offset: "def456" → restituisce punti 201-300 + offset: null (fine)
```

Quando `next_page_offset` è `null`, significa che hai raggiunto la fine della collezione.

## Opzioni principali

- `collection_name`: nome della collezione da scorrere
- `limit`: numero massimo di punti da restituire per chiamata (default 100, max 1000)
- `offset`: cursore per la pagina successiva (null per la prima chiamata)
- `with_payload`: se includere i payload nei risultati (default false)
- `with_vector`: se includere i vettori nei risultati (default false)

**Pro tip**: Imposta with_vector: false se non ti servono i vettori.
I vettori occupano molta memoria (es. 768 float = ~3KB per punto)!
