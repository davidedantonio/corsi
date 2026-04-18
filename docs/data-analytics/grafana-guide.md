---
sidebar_position: 7
---

# Introduzione a Grafana

Benvenuti in questa lezione dedicata a **Grafana**, uno degli strumenti di visualizzazione e monitoraggio più potenti e utilizzati nel mondo della Business Intelligence e del Data Analytics. Grafana è una piattaforma open-source che consente di creare dashboard interattive, visualizzare dati in tempo reale e configurare alert avanzati.

In questa sezione esploreremo cosa è Grafana, perché è così importante nel panorama degli strumenti BI, e come utilizzarlo per creare visualizzazioni efficaci dei dati provenienti da PostgreSQL.

## Cos'è Grafana?

Grafana è una piattaforma di analisi e visualizzazione open-source che consente di:

- **Visualizzare dati** da multiple sorgenti in dashboard interattive
- **Monitorare metriche** in tempo reale
- **Creare alert** basati su condizioni specifiche
- **Condividere dashboard** con team e stakeholder
- **Esplorare dati** attraverso query dinamiche

Grafana è nato nel 2014 come fork di Kibana e si è rapidamente evoluto diventando uno standard de facto per il monitoraggio e la visualizzazione di metriche, in particolare in ambito DevOps, ma ora è ampiamente utilizzato anche per Business Intelligence e Data Analytics.

### Perché Grafana nel nostro corso?

Nel contesto del **Triangolo degli Strumenti dell'Analista**, Grafana rappresenta il terzo componente essenziale insieme ai fogli di calcolo e ai database. Ecco perché abbiamo scelto Grafana:

1. **Open Source e Gratuito**: Grafana è completamente gratuito e open-source, rendendolo accessibile a tutti
2. **Ampiamente utilizzato**: Molto richiesto nel mercato del lavoro, specialmente in ambito tech e DevOps
3. **Connessione nativa con PostgreSQL**: Si integra perfettamente con il database che utilizziamo nel corso
4. **Visualizzazioni potenti**: Offre una vasta gamma di grafici e visualizzazioni interattive
5. **Curva di apprendimento**: Più accessibile rispetto a Tableau o Power BI per iniziare

## Caratteristiche Principali di Grafana

### 1. Data Sources (Sorgenti Dati)

Grafana può connettersi a numerose sorgenti di dati, tra cui:

- **Database relazionali**: PostgreSQL, MySQL, SQL Server, Oracle
- **Time-series databases**: Prometheus, InfluxDB, Graphite
- **Cloud services**: AWS CloudWatch, Google Cloud Monitoring, Azure Monitor
- **Other sources**: Elasticsearch, MongoDB, e molti altri tramite plugin

Per il nostro corso utilizzeremo **PostgreSQL** come data source principale.

### 2. Dashboard

Le dashboard sono il cuore di Grafana. Una dashboard è una raccolta di **panel** (pannelli) organizzati in una griglia. Ogni panel può contenere:

- **Grafici temporali** (time series)
- **Grafici a barre** e **grafici a torta**
- **Tabelle** di dati
- **Gauge** e **indicatori** numerici
- **Mappe geografiche**
- **Grafici personalizzati**

### 3. Query Editor

Grafana offre un editor di query visuale e testuale che consente di:

- Scrivere query SQL direttamente per PostgreSQL
- Utilizzare variabili dinamiche
- Applicare trasformazioni ai dati
- Creare query complesse con join e aggregazioni

### 4. Variabili e Filtri

Le variabili permettono di creare dashboard dinamiche e interattive:

- **Dropdown dinamici**: Filtra per regione, categoria, periodo
- **Intervalli temporali**: Seleziona range di date personalizzati
- **Multi-selezione**: Confronta più elementi contemporaneamente
- **Variabili concatenate**: Una variabile dipende dall'altra

### 5. Alerting

Grafana permette di configurare alert basati su condizioni specifiche:

- Alert quando le vendite scendono sotto una soglia
- Notifiche via email, Slack, Teams, webhook
- Alert multi-condizione
- Silencing temporaneo degli alert

## Installazione di Grafana

### Opzione 1: Docker (Consigliata)

```bash
# Avvia Grafana con Docker
docker run -d \
  --name=grafana \
  -p 3000:3000 \
  grafana/grafana-oss:latest

# Accedi a http://localhost:3000
# Username: admin
# Password: admin (ti verrà chiesto di cambiarla)
```

### Opzione 2: Installazione Diretta su macOS

```bash
# Con Homebrew
brew install grafana

# Avvia Grafana
brew services start grafana

# Accedi a http://localhost:3000
```

### Opzione 3: Installazione su Linux

```bash
# Ubuntu/Debian
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install grafana

# Avvia il servizio
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

### Opzione 4: Windows

1. Scarica l'installer da: https://grafana.com/grafana/download
2. Esegui il file `.msi`
3. Grafana si avvierà automaticamente come servizio Windows
4. Accedi a http://localhost:3000

## Primo Accesso a Grafana

1. Apri il browser e vai su **http://localhost:3000**
2. Login iniziale:
   - Username: `admin`
   - Password: `admin`
3. Ti verrà chiesto di cambiare la password (puoi anche saltare questo passaggio per ora)
4. Benvenuto in Grafana! 🎉

## Configurare PostgreSQL come Data Source

### Passo 1: Accedere alle Data Sources

1. Clicca sull'icona **⚙️** (ingranaggio) nella sidebar sinistra
2. Seleziona **Data sources**
3. Clicca su **Add data source**
4. Cerca e seleziona **PostgreSQL**

### Passo 2: Configurazione della Connessione

Inserisci i seguenti parametri:

```
Name: PostgreSQL Ecommerce
Host: localhost:5432
Database: ecommerce_ita
User: postgres (o il tuo username)
Password: [la tua password]
SSL Mode: disable (per sviluppo locale)
Version: 15+ (o la tua versione)
```

### Passo 3: Test e Salvataggio

1. Clicca su **Save & test**
2. Se tutto è configurato correttamente vedrai: ✅ **Database Connection OK**
3. Se ricevi un errore, verifica:
   - Che PostgreSQL sia in esecuzione
   - Che le credenziali siano corrette
   - Che il database esista

## Creare la Prima Dashboard

### Passo 1: Nuova Dashboard

1. Clicca sull'icona **+** nella sidebar
2. Seleziona **Dashboard**
3. Clicca su **Add visualization**
4. Seleziona il data source **PostgreSQL Ecommerce**

### Passo 2: Prima Visualizzazione - Vendite Totali

Creiamo un semplice indicatore del totale vendite:

```sql
SELECT
    SUM(totale) as vendite_totali
FROM ordini
WHERE stato = 'Completato';
```

**Configurazione Panel:**

- Visualization: **Stat**
- Title: "Vendite Totali 2024"
- Unit: Currency → Euro (€)
- Show: Value

### Passo 3: Grafico Temporale - Vendite nel Tempo

```sql
SELECT
    DATE_TRUNC('month', data_ordine) as mese,
    SUM(totale) as vendite
FROM ordini
WHERE stato = 'Completato'
GROUP BY mese
ORDER BY mese;
```

**Configurazione Panel:**

- Visualization: **Time series**
- Title: "Andamento Vendite Mensili"
- Unit: Currency → Euro (€)

### Passo 4: Top Prodotti - Tabella

```sql
SELECT
    p.nome as prodotto,
    SUM(d.quantita) as quantita_venduta,
    SUM(d.quantita * d.prezzo_unitario) as ricavo
FROM dettagli_ordini d
JOIN prodotti p ON d.prodotto_id = p.id
JOIN ordini o ON d.ordine_id = o.id
WHERE o.stato = 'Completato'
GROUP BY p.nome
ORDER BY ricavo DESC
LIMIT 10;
```

**Configurazione Panel:**

- Visualization: **Table**
- Title: "Top 10 Prodotti"

### Passo 5: Salvare la Dashboard

1. Clicca sull'icona **💾** (salva) in alto a destra
2. Dai un nome alla dashboard: "Dashboard E-commerce"
3. Clicca su **Save**

## Tipi di Visualizzazioni in Grafana

### 1. Time Series (Grafici Temporali)

Ideali per visualizzare l'andamento nel tempo:

- Vendite giornaliere/mensili
- Numero di ordini
- Nuovi clienti registrati

**Esempio Query:**

```sql
SELECT
    data_ordine as time,
    COUNT(*) as numero_ordini
FROM ordini
GROUP BY data_ordine
ORDER BY data_ordine;
```

### 2. Stat (Indicatori Numerici)

Perfetti per KPI e metriche singole:

- Totale vendite
- Numero clienti
- Ticket medio
- Conversione

**Esempio Query:**

```sql
SELECT
    COUNT(*) as totale_clienti
FROM clienti;
```

### 3. Bar Chart (Grafici a Barre)

Utili per confronti tra categorie:

- Vendite per regione
- Prodotti per categoria
- Ordini per stato

**Esempio Query:**

```sql
SELECT
    regione,
    COUNT(*) as numero_clienti
FROM clienti
GROUP BY regione
ORDER BY numero_clienti DESC;
```

### 4. Pie Chart (Grafici a Torta)

Per mostrare proporzioni:

- Distribuzione ordini per stato
- Quote mercato per categoria
- Ripartizione clienti per regione

**Esempio Query:**

```sql
SELECT
    stato,
    COUNT(*) as numero_ordini
FROM ordini
GROUP BY stato;
```

### 5. Gauge (Indicatori a Manometro)

Per visualizzare progress verso un obiettivo:

- Vendite vs target
- Tasso di completamento ordini
- Livello di giacenza

### 6. Table (Tabelle)

Per dati dettagliati:

- Lista clienti
- Dettagli prodotti
- Report completi

### 7. Heatmap (Mappe di Calore)

Per pattern temporali:

- Ordini per giorno della settimana e ora
- Attività utenti
- Seasonal patterns

## Utilizzare le Variabili

Le variabili rendono le dashboard dinamiche e riutilizzabili.

### Creare una Variabile per le Regioni

1. Vai nelle **Dashboard settings** (⚙️ in alto a destra)
2. Seleziona **Variables**
3. Clicca su **Add variable**

**Configurazione:**

```
Name: regione
Type: Query
Data source: PostgreSQL Ecommerce
Query: SELECT DISTINCT regione FROM clienti ORDER BY regione
Multi-value: Yes
Include All option: Yes
```

### Usare la Variabile in una Query

```sql
SELECT
    SUM(o.totale) as vendite_totali
FROM ordini o
JOIN clienti c ON o.cliente_id = c.id
WHERE c.regione IN ($regione);
```

La variabile `$regione` verrà sostituita dinamicamente con i valori selezionati dal dropdown.

## Variabili Temporali

Grafana include variabili temporali built-in:

- `$__timeFilter(column_name)`: Filtra automaticamente per il time range selezionato
- `$__timeFrom()`: Timestamp iniziale
- `$__timeTo()`: Timestamp finale

**Esempio:**

```sql
SELECT
    data_ordine as time,
    SUM(totale) as vendite
FROM ordini
WHERE $__timeFilter(data_ordine)
GROUP BY data_ordine
ORDER BY data_ordine;
```

## Trasformazioni dei Dati

Grafana permette di trasformare i dati prima della visualizzazione, senza modificare la query.

### Trasformazioni Comuni:

1. **Rename fields**: Rinomina colonne
2. **Filter by value**: Filtra righe
3. **Calculate field**: Crea campi calcolati
4. **Group by**: Aggrega dati
5. **Join**: Unisce dataset
6. **Sort**: Ordina risultati

**Esempio Pratico:**

Query originale:

```sql
SELECT
    regione,
    SUM(totale) as vendite
FROM ordini o
JOIN clienti c ON o.cliente_id = c.id
GROUP BY regione;
```

Trasformazione:

- Aggiungi **Calculate field**
- Formula: `vendite * 0.22` (calcola IVA)
- Output field: `iva`

## Best Practices per Dashboard Efficaci

### 1. Organizzazione della Dashboard

- **Layout a griglia**: Organizza i panel in modo ordinato
- **Gerarchia visiva**: KPI principali in alto, dettagli sotto
- **Gruppi logici**: Raggruppa panel correlati con Row
- **Spazio bianco**: Non sovraffollare la dashboard

### 2. Scelta delle Visualizzazioni

- **KPI**: Usa Stat per metriche singole importanti
- **Trend**: Time series per andamenti temporali
- **Confronti**: Bar chart per comparazioni
- **Dettagli**: Table per dati granulari
- **Proporzioni**: Pie chart con parsimonia (max 5-7 categorie)

### 3. Colori e Temi

- **Consistenza**: Usa una palette coerente
- **Significato**: Verde = positivo, Rosso = negativo, Giallo = warning
- **Contrasto**: Assicura leggibilità
- **Dark mode**: Grafana offre temi chiari e scuri

### 4. Performance

- **Limita le query**: Usa LIMIT nelle query esplorative
- **Cache**: Configura cache intervals appropriati
- **Aggregazioni**: Pre-aggrega i dati quando possibile
- **Time ranges**: Evita range troppo ampi senza necessità

### 5. Interattività

- **Variabili**: Permetti agli utenti di filtrare i dati
- **Drill-down**: Collega dashboard per dettagli progressivi
- **Tooltip**: Configura tooltip informativi
- **Links**: Aggiungi link a risorse esterne

## Alert e Notifiche

Grafana permette di configurare alert per monitorare condizioni critiche.

### Configurare un Alert

1. Modifica un panel esistente
2. Vai nella tab **Alert**
3. Clicca su **Create alert**

**Esempio: Alert su Vendite Basse**

```sql
SELECT
    SUM(totale) as vendite_giornaliere
FROM ordini
WHERE DATE(data_ordine) = CURRENT_DATE
  AND stato = 'Completato';
```

**Condizione Alert:**

- WHEN `vendite_giornaliere` IS BELOW `5000`
- FOR `15m`

**Notifica:**

- Send to: Email, Slack, Teams, Webhook
- Message: "⚠️ Le vendite di oggi sono sotto i €5.000"

## Condividere Dashboard

### 1. Link Diretto

- Clicca sull'icona **Share** in alto a destra
- Copia il link
- Imposta time range e variabili nel link

### 2. Snapshot

Crea uno snapshot immutabile della dashboard:

- Clicca su **Share** → **Snapshot**
- Imposta durata di validità
- Pubblica su Grafana Cloud o esporta

### 3. Export JSON

Esporta la configurazione della dashboard:

- Dashboard settings → **JSON Model**
- Copia o scarica il JSON
- Importa su altre istanze Grafana

### 4. Embedding

Incorpora panel in altre applicazioni:

- **Share** → **Embed**
- Copia l'iframe code
- Incolla nella tua applicazione web

## Plugins e Estensioni

Grafana supporta un ecosistema di plugin per estendere le funzionalità.

### Plugin Popolari:

1. **Worldmap Panel**: Mappe geografiche interattive
2. **Clock Panel**: Orologio e calendario
3. **Pie Chart v2**: Grafici a torta avanzati
4. **Flowcharting**: Diagrammi di flusso
5. **Apache ECharts**: Grafici complessi

### Installare un Plugin:

```bash
# Via Grafana CLI
grafana-cli plugins install <plugin-id>

# Riavvia Grafana
sudo systemctl restart grafana-server
```

## Esercizi Pratici

### Esercizio 1: Dashboard KPI

Crea una dashboard con i seguenti KPI:

1. Totale vendite (Stat)
2. Numero ordini (Stat)
3. Ticket medio (Stat - calcolato)
4. Tasso di completamento ordini (Gauge)

### Esercizio 2: Analisi Temporale

Crea visualizzazioni temporali:

1. Vendite giornaliere (Time series)
2. Ordini per giorno della settimana (Bar chart)
3. Crescita clienti nel tempo (Time series)

### Esercizio 3: Analisi Geografica

Analizza i dati per regione:

1. Vendite per regione (Bar chart)
2. Top 5 città per numero ordini (Table)
3. Distribuzione clienti per regione (Pie chart)

### Esercizio 4: Analisi Prodotti

Crea un'analisi dei prodotti:

1. Top 10 prodotti per ricavo (Table)
2. Prodotti più venduti per categoria (Bar chart)
3. Andamento vendite per categoria (Time series)

### Esercizio 5: Dashboard con Variabili

Crea una dashboard interattiva con:

1. Variabile per selezionare la regione
2. Variabile per selezionare la categoria prodotto
3. Tutte le visualizzazioni che reagiscono ai filtri

## Risorse Aggiuntive

### Documentazione Ufficiale

- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [PostgreSQL Data Source](https://grafana.com/docs/grafana/latest/datasources/postgres/)
- [Query Editor](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/)

### Community e Supporto

- [Grafana Community Forum](https://community.grafana.com/)
- [Grafana GitHub](https://github.com/grafana/grafana)
- [Grafana YouTube Channel](https://www.youtube.com/c/Grafana)

### Dashboard Templates

- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- Cerca dashboard per PostgreSQL
- Importa e personalizza dashboard esistenti

## Conclusioni

Grafana è uno strumento potente e flessibile che completa perfettamente il nostro stack di Data Analytics con PostgreSQL. Le sue caratteristiche principali includono:

- ✅ **Open source e gratuito**
- ✅ **Integrazione nativa con PostgreSQL**
- ✅ **Visualizzazioni interattive e personalizzabili**
- ✅ **Dashboard condivisibili**
- ✅ **Alert e notifiche**
- ✅ **Ampia adozione nel mercato del lavoro**

Nel contesto del **Triangolo degli Strumenti dell'Analista**, Grafana rappresenta il componente di visualizzazione e presentazione che trasforma i dati grezzi del database in insights comprensibili e azionabili.

Nei prossimi moduli, utilizzeremo Grafana per costruire dashboard complete sul nostro dataset e-commerce, esplorando casi d'uso reali e best practices per la visualizzazione dei dati.

Buon lavoro!

