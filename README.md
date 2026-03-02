# ESWC-2026-Demo
# Water Lock Monitoring: A Semantic Dashboard for the Dessel–Kwaadmechelen Canal

This repository contains the source code and documentation for our **ESWC 2026 Demo**. We present an interactive dashboard specialized in monitoring **river stage** and **river discharge** for the water lock located on the Dessel–Kwaadmechelen canal, utilizing Linked Data Event Streams (LDES) and specialized compression techniques.

---

## 🌊 Overview

The dashboard serves as a bridge between raw sensor data from the [Waterinfo](https://www.waterinfo.be/) platform and high-performance semantic querying.

### Key Features:
* **Use Case Context:** Detailed explanation of the water lock monitoring requirements at the Dessel–Kwaadmechelen canal.
* **Data Browser:** Tabular view of raw timestamped observations fetched via government endpoints.
* **SPARQL Query Interface:** A built-in query form with pre-configured examples to explore the knowledge graph.
* **Interactive Analytics:** Real-time graphing of river stage and discharge levels.
* **Benchmarking Suite:** Side-by-side performance comparison of different triple stores and data formats.

---

## ⚙️ Technical Architecture

Our demo focuses on the efficiency of **Linked Data Event Streams (LDES)** combined with the **TSS (Tree-based Snapshot Scheme)**.



### Storage Backends
We compare three distinct storage environments to evaluate ingestion and query speed:
1.  **Virtuoso:** High-performance universal server for RDF data.
2.  **Oxigraph:** A specialized SPARQL graph database optimized for performance.
3.  **PostgreSQL:** Used as a relational baseline to provide a "Typical Data" performance comparison.

### Optimization: LDES with TSS
To handle the high frequency of sensor data, we implement **LDES with TSS**. This technique:
* Reduces the physical size of the data on disk.
* Significantly speeds up data ingestion.
* Optimizes query response times for time-series sensor observations.

---

## 📊 Performance Benchmarks

The dashboard includes a dedicated benchmark section comparing:
* **Ingestion Time:** (Virtuoso vs. Oxigraph vs. PostgreSQL)
* **Query Latency:** Time to retrieve river stage/discharge across different formats.
* **Format Impact:** Performance differences between standard LDES and LDES with TSS.



---