# MaTriX-AI: User Triage Flow

## The Core Interaction

1. **Clinic Admission:**
   A maternal patient enters an under-resourced clinic in a remote region. The clinical nurse opens the **MaTriX-AI** browser dashboard (connected directly to the Edge node on `localhost:3000`).

2. **Data Entry Phase:**
   The nurse accesses the Spatial Triage Wizard, and inputs basic vital metrics (Age, Blood Pressure, Glucose, Body Temperature, Heart Rate) and types a short descriptive note of any reported symptoms.
   _(Optional)_: If the patient brought a historical CTG paper or ultrasound, the nurse can take a photo and drop the `.jpg` directly into the system. The local node will forward this directly to **PaliGemma** to analyze.

3. **Risk Calculation (Instant Action):**
   When the nurse presses "Calculate Risk," the Edge Node invokes **MedGemma 4B** completely offline.
   Within less than 2 seconds, the dashboard calculates a structured JSON Risk Score, animating a Red/Orange/Green hazard severity flag.

4. **Guideline Association:**
   The **Guideline Agent** immediately kicks in. It takes the outputted Risk level and asks the local `pgvector` database for the nearest corresponding WHO clinical manual snippet. It presents a simple bullet-point list showing the exact stabilization protocol (e.g. Magnesium Sulfate loading dose) and explicitly states if the patient must be transferred.

5. **Cloud Escalation (Conditional):**
   If the Edge Node scored the patient above `0.65` or identified strict red flags (Ruptured Ectopic, Pre-Eclampsia, Severe Hemorrhage), the system triggers a flashing "Escalation Initiated" UI banner.
   - Behind the scenes, the Edge Node sent an outbound REST command to the AWS API Gateway (`cloud:9000`).
   - **AWS SageMaker MedGemma 27B** acts as a senior doctor. It takes the complete data profile and rapidly returns detailed logistics.
   - The UI updates, showing the nearest extraction hospital transfer timeline and advanced pharmacological recommendations.

6. **Action & Audit:**
   The final plan is shown to the attending nurse. The moment it spawned on the UI, the `governance.py` node wrapped the entire interaction into a strictly typed SQL log with a cryptographically enforced trace hash, ensuring total regulatory protection and audit traceability.
