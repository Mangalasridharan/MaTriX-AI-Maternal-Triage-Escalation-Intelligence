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
2. **Step 1:** Enter Patient Demographics (Name, Age, Gestational Age).
3. **Step 2:** Enter Vitals (Systolic, Diastolic, HR, Proteinuria).
4. **Step 3:** Select specific Symptoms (e.g., Heavy bleeding, blurred vision, fever).
5. The clinician clicks **"Dispatch to Swarm"**.

## 4. Triage Execution & Display

1. The app displays loading indicators as the Edge Node queries guidelines and runs inference.
2. The user is presented with a **Fullscreen Spatial Results Modal**.
3. **Risk Gauge:** Instantly shows Risk Level (Low, Moderate, High, Severe) and a numeric score / 10.
4. If severe, an **Escalation Banner** automatically triggers, indicating the Cloud AI is synthesizing a transport plan.
5. Below the gauge, the user reads the **Guideline Panel**, containing explicit Stabilization Plans and Drug Dosage instructions cited directly from WHO sources.

## 5. History and Re-evaluation

1. After acknowledging the care plan, the case is saved to the database.
2. The clinician can navigate to the **History Timeline**.
3. They can review past cases, search for specific patients, or track the overall BP and risk distribution trends over the clinic population.
