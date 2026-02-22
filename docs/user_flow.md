# User Flow

The MaTriX-AI user journey is designed to be frictionless for clinicians under high stress.

## 1. Authentication

1. **Login/Signup:** The clinic staff opens the app and logs in securely.
2. A JWT token is stored securely in the browser to maintain the session.

## 2. General Dashboard

1. The user lands on the primary Dashboard.
2. They see high-level statistics: Total Monitored metrics, recent Escalations, and system connectivity statuses.
3. They click the prominent **"Start New Triage"** button.

## 3. Immersive Intake Wizard

1. The app transitions to a clean, single-column step wizard.
2. **Step 1:** Enter Patient Demographics.
3. **Step 2:** Enter Vitals.
4. **Step 3:** Select specific Symptoms.
5. The clinician clicks **"Dispatch to Swarm"**.

## 4. Agentic Triage & Visualizer

1. The clinician clicks **"Dispatch to Swarm"**.
2. The **Agentic Swarm Visualizer** appears, showing real-time feedback as the system moves through:
   - `Risk Agent` (Analyzing vitals).
   - `Guideline RAG` (Retrieving protocols).
   - `Critique Agent` (Audit & Self-Correction).
   - `Router` (Evaluating escalation).
3. The user is presented with the final results.
4. **Risk Gauge:** Instantly shows Risk Level and numeric score.
5. **Guideline Panel:** Detailed, audited care plans with WHO citations.
6. If severe, a **Cloud Executive Plan** appears via SageMaker synthesis.

## 5. Intelligence Analytics

1. Clinicians can navigate to the **Analytics** tab.
2. They view the **Spatial Risk Heatmap** to see high-density risk areas.
3. They track regional risk trajectory and severity distribution trends.

## 6. Case History

1. All cases are saved to the **History Timeline**.
2. Clinicians can review past results, search for patients, and monitor recovery progress.
