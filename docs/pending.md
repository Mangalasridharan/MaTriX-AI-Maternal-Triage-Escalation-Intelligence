# Pending / Next Steps

1. **Production Deployment**
   - Containerize the Next.js frontend, Edge API, and Cloud API with optimized multi-stage Dockerfiles.
   - Deploy the Cloud API to a managed service (e.g., AWS Fargate or Render) connecting to a HuggingFace Inference Endpoint.

2. **Expanded Medical Guidelines Ingestion**
   - Currently, the RAG database holds sample embeddings. We need to parse and embed the complete text of the latest WHO Maternal Health Guidelines and ACOG Practice Bulletins.

3. **Clinician Testing & Safety Validation**
   - Conduct strict "red team" and edge-case testing with real obstetricians to ensure the LLM never hallucinates critical drug dosages (e.g., MgSO4 administration).
   - Tune the RAG system's cosine similarity thresholds to enforce strict adherence to the embedded guidelines.

4. **Offline Mobile Port**
   - Convert the Next.js PWA into a fully compiled React Native application to ensure the UI operates even when disconnected from the local Edge server for brief periods.

5. **Advanced Analytics**
   - Implement the actual Recharts UI for `BpChart` and `RiskDistributionChart` in the Analytics tab, pulling aggregated data from the Edge database.
