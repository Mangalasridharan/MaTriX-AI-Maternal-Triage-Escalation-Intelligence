# Pending / Next Steps

1. **Cloud Production Deployment**
   - Finalize the **AWS SageMaker** endpoint deployment for MedGemma 27B (on-the-fly quantization config).
   - Containerize all nodes with multi-stage Dockerfiles for Kubernetes/ECS deployment.

2. **Expanded Medical Guidelines Ingestion**
   - Parse and embed the complete text of the latest WHO Maternal Health Guidelines and ACOG Practice Bulletins into the edge RAG system.

3. **Clinician Testing & Safety Validation**
   - Conduct strict "red team" testing with real obstetricians to audit the **Critique Agent's** performance in identifying unsafe pill dosages.
   - Refine the self-correction logic based on professional feedback.

4. **Offline Mobile Port**
   - Convert the Njs PWAext. into a fully compiled React Native application to ensure the UI operates even when disconnected from the clinic network.

5. **Advanced Predictive Analytics**
   - Implement population-wide risk forecasting using historical triage data to predict outbreak or seasonal maternal health trends.
