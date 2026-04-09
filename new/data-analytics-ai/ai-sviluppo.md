---
sidebar_position: 4
---

# Sviluppo SW & AI

Faccio sviluppo web da oltre quindici anni ormai: ho iniziato con PHP, poi sono passato al frontend, Python, JavaScript e molte altre tecnologie.
Ho scritto, rilasciato, mantenuto e debuggato una grande quantità di codice. E lo adoro. Lo amo così tanto che lo faccio anche nel tempo libero e lo insegno ad altri.

Quindi, cosa penso dell’AI nello sviluppo software? Me lo chiedono spesso e, visto che questo è un corso focalizzato sull’intelligenza artificiale,
mi sembra il momento giusto per condividere qualche riflessione sul futuro del settore.

Prima di tutto, non credo che questa professione scomparirà. Non penso che il ruolo di sviluppatore software sparirà a breve. Se oggi lavori nello
sviluppo software, credo che tu abbia ancora davanti a te una carriera ricca di opportunità.

Detto questo, penso che l’intelligenza artificiale cambierà profondamente il settore nei prossimi anni — e in parte lo ha già fatto. Sempre più
codice verrà generato e gestito da agenti AI, e molte delle attività su cui in passato ci concentravamo (come scrivere test di integrazione)
verranno in gran parte assorbite e automatizzate dagli strumenti di AI. Credo che, più uno sviluppatore abbraccia questo cambiamento invece di opporvisi,
migliori saranno le prospettive per la sua carriera.

Sono convinto che chi saprà utilizzare al meglio gli strumenti di AI emergerà nel settore. Queste persone saranno in grado di combinare il cosiddetto
“vibe coding” con la scrittura manuale del codice, sapendo quando affidarsi a un agente per generare codice — nei casi in cui l’AI è efficace —
e quando invece intervenire direttamente, soprattutto in contesti più complessi dove l’AI performa meno, pur continuando a usare strumenti di supporto.

Questi sviluppatori continueranno comunque ad assumersi la responsabilità del codice che producono, indipendentemente dal fatto che sia
stato scritto da loro o generato dall’AI. Continueranno a lavorare in modo affidabile, riflessivo, con codice revisionato e testato.

Abbiamo assistito a una vera e propria esplosione — quasi “cambriana” — nel progresso degli strumenti di AI. È facile pensare che questa crescita
continuerà in modo esponenziale (dato che finora è stato così), ma il mio consiglio è di restare al passo con l’innovazione e cercare di padroneggiare
ogni fase di questo percorso. Nessuno sa cosa riserverà il futuro, ma concentrarsi troppo su ciò che verrà può essere paralizzante, distraendoci da ciò
che possiamo costruire oggi.

Sono tempi entusiasmanti, e io sono entusiasta dell’AI. Non sono né un estremista né uno scettico: cerco semplicemente di restare focalizzato su ciò
che posso fare adesso e su come posso usare questi strumenti per accelerare me stesso e il mio team.

## Gli agenti

Voglio soffermarmi un attimo sul termine “agent” o “agentic”, perché è un’espressione che probabilmente senti spesso e di cui potresti chiederti il
significato preciso. La useremo anche qui, quindi vale la pena chiarirla.

Personalmente, all’inizio ero confuso su cosa fosse esattamente un agente rispetto a un semplice LLM. Quando possiamo dire che si tratta di un
agente e non solo di un modello linguistico?

Partiamo da un punto importante: “agent” è in gran parte una buzzword. Dare una definizione precisa è difficile, perché non esiste uno standard
condiviso e il marketing ne ha abusato parecchio. Questo rende complicato definirlo, perché bisogna separare il concetto reale dall’hype.

Una possibile definizione è questa: un agente è un LLM, oppure un insieme di LLM, progettato per portare a termine un compito, spesso attraverso
più iterazioni. È una definizione volutamente ampia e non completamente precisa (con questa definizione, ad esempio, si potrebbe chiamare agente anche
Claude Desktop, cosa che probabilmente non è del tutto corretta). Ma il concetto chiave è il seguente:

gli dici:

“Ehi agente, fai X per me”

e il sistema:

- ragiona sul problema
- costruisce un piano di azione
- esegue i vari passaggi
- itera finché non raggiunge l’obiettivo

Prendiamo come esempio un agente di coding, come quelli presenti in strumenti tipo Replit, v0, Create.xyz, Same.new, Databutton o app.build.

Se gli chiedi di costruire un’applicazione:

- prima elabora un piano su cosa deve fare
- poi inizia a generare il codice
- testa le funzionalità man mano che le produce
- continua a iterare finché il risultato non è completo

Questo ciclo di:

**pianificazione → generazione → valutazione → iterazione**

supportato da uno o più LLM, è ciò che rende un sistema “agentic”.

Un LLM (Large Language Model), invece, è molto più focalizzato sulla generazione di testo a partire da un input. Può essere una componente di
un sistema agentico, ma non è di per sé un agente.

In altre parole:

- puoi avere LLM senza agenti
- ma è difficile avere agenti senza LLM

Nel nostro caso utilizzeremo agenti integrati negli IDE di sviluppo. Se non hai ancora provato uno di questi strumenti online di coding agent,
ti consiglio di farlo: sono estremamente interessanti da usare e permettono di imparare moltissimo in poco tempo.
