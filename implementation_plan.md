# Implementation Plan - Developer Mode & Ground Truth Benchmark Inspector

Build a discreet **Developer Mode** that allows users/judges to unlock developer privileges via an Easter egg (clicking the logo 5 times or pressing `Ctrl+Shift+D`), browse all 2,908 historical shipments from the SCMS dataset, load them 1-by-1 into the predictor, and inspect side-by-side comparisons between real-world ground truth and model predictions.

---

## User Review Required

> [!IMPORTANT]
> **Developer Passcode**:
> The default passcode will be set to `devpost2026` (configurable via `NEXT_PUBLIC_DEV_PASSCODE`).
> 
> **Easter Egg Trigger**:
> - Clicking the "SupplyPulse" logo in the Navbar **5 times within 3 seconds**, OR
> - Pressing keyboard shortcut `Ctrl + Shift + D` (or `Cmd + Shift + D` on Mac).

---

## Proposed Changes

### Backend

#### [NEW] [scms_benchmark.csv](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/data/scms_benchmark.csv)
- Generate a pre-processed, clean CSV containing the 2,908 valid rows from `ml/datasets/SCMS_Delivery_History_Dataset.csv`.
- Columns: `row_id`, all 18 input features (`country`, `managed_by`, `weight_kg`, etc.), and ground truth columns:
  - `scheduled_date`, `delivered_date`, `actual_delay_days`, `actual_risk_flag`, `actual_risk_label`.
- Pre-processing ensures instantaneous load time (<10ms) without parsing raw timestamps on every API request.

#### [NEW] [dev.py](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/routers/dev.py)
- FastAPI router providing:
  - `GET /api/dev/records`: Paginated list of benchmark records with optional query filters (`filter`: `all` | `delayed` | `ontime`, `search`: country/vendor string, `page`: int, `limit`: int).
  - `GET /api/dev/records/{row_id}`: Fetch single complete record with features and ground truth for 1-by-1 comparison.
  - `GET /api/dev/summary`: Benchmark summary stats (total valid rows, delayed count, on-time count, avg delay).

#### [MODIFY] [main.py](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/main.py)
- Mount `dev.py` router:
  ```python
  from backend.routers import dev as dev_router
  app.include_router(dev_router.router, prefix="/api/dev", tags=["Developer"])
  ```

---

### Frontend

#### [NEW] [DevModeContext.tsx](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/context/DevModeContext.tsx)
- React Context providing:
  - `isDevMode`: boolean state (synced with `localStorage`).
  - `isAuthModalOpen`: boolean to toggle modal.
  - `login(passcode)` / `logout()` functions.
- Wrapped inside `frontend/app/layout.tsx`.

#### [NEW] [DevAuthModal.tsx](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/DevAuthModal.tsx)
- Sleek dialog modal requesting developer passcode.
- Features password toggle, clear error message, and tip indicating default passcode `devpost2026`.

#### [MODIFY] [Navbar.tsx](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/Navbar.tsx)
- Attach click counter to the Logo (triggers modal on 5th click).
- Attach global `keydown` listener for `Ctrl+Shift+D`.
- When `isDevMode` is active:
  - Show floating/navbar indicator badge: `[ 🛠️ DEV BENCHMARK MODE ]` with an exit/logout button.

#### [MODIFY] [api.ts](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/lib/api.ts)
- Add TypeScript interfaces: `DevRecord`, `DevRecordsResponse`, `GroundTruthData`.
- Add API functions:
  - `fetchDevRecords(page, limit, filter, search)`
  - `fetchDevRecordById(rowId)`
  - `fetchDevSummary()`

#### [NEW] [DevDatasetNavigator.tsx](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/DevDatasetNavigator.tsx)
- Rendered on `/predict` directly above the form when `isDevMode === true`.
- Controls:
  - `[ ◀ Prev ]` `Row [ input ] / 2,908` `[ Next ▶ ]`
  - `[ 🎲 Random ]` button to jump to an arbitrary historical shipment.
  - Segmented toggle filter: `All (2,908)` | `Delayed Only (820)` | `On-Time Only (2,088)`.
  - `[ 📋 Open Table ]` button to launch the full dataset browser modal.
- Selecting any row pre-fills the form with its real historical parameters and passes its `groundTruth` object to the page.

#### [NEW] [DevTableModal.tsx](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/DevTableModal.tsx)
- Full modal view showing all 2,908 records:
  - Searchable by Country, Vendor, Shipment Mode.
  - Filterable by Outcome (All, Delayed, On-Time).
  - Shows table: `Row # | Country | Mode | Vendor | Real Scheduled | Real Delivered | Real Delay | Real Status | Action`.
  - "Load into Predictor" button loads the row and closes the modal.

#### [NEW] [DevValidationCard.tsx](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/DevValidationCard.tsx)
- Displays side-by-side comparison when prediction completes and ground truth is present:
  - **Metric Table**:
    - **Delay Days**: Model Prediction vs Actual Ground Truth (with signed error delta `Δ`).
    - **Risk Classification**: Predicted (High/Low) vs Actual (Delayed/On-Time).
    - **Timeline**: Scheduled Date vs Actual Delivered Date.
  - **Confusion Matrix Evaluation**:
    - `🎯 True Positive`: Predicted delay, shipment was genuinely delayed.
    - `✅ True Negative`: Predicted on-time, shipment arrived on-time.
    - `⚠️ False Positive` / `⚠️ False Negative`.
  - **Visual Delta Progress Bar / Gauge**.

#### [MODIFY] [page.tsx (predict)](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/app/predict/page.tsx)
- Integrate `useDevMode()` hook.
- When `isDevMode === true`:
  - Display `DevDatasetNavigator` at the top of the form column.
  - On row selection, populate form and store `groundTruth`.
  - In results column, render `DevValidationCard` alongside `RiskCard`, `ShapBreakdown`, and `ActionPlan`.

---

## Verification Plan

### Automated Verification
1. **Preprocess Script**:
   - Run Python script to generate `backend/data/scms_benchmark.csv` and verify 2,908 valid rows with ground truth.
2. **Backend API Tests**:
   - Query `GET /api/dev/records?page=1&limit=5` and verify JSON response.
   - Query `GET /api/dev/records/1` and verify feature mapping.
3. **Frontend Build**:
   - Run `npm run build` in `frontend/` to confirm zero TypeScript and Next.js bundling errors.

### Manual Verification
1. Open web application at `http://localhost:3000`.
2. Click the "SupplyPulse" logo 5 times:
   - Verify Developer Authentication modal appears.
   - Enter `devpost2026`, verify Dev Mode turns active and indicator badge appears in navbar.
3. Navigate to `/predict`:
   - Verify `DevDatasetNavigator` toolbar appears above the form.
   - Test `[ Next ]` and `[ Prev ]` buttons: verify form values update immediately.
   - Test filter "Delayed Only": verify row changes to delayed shipments.
   - Test `[ 📋 Open Table ]`: verify modal opens, search works, and "Load into Predictor" updates form.
4. Click "Analyze Shipment":
   - Verify `DevValidationCard` renders with side-by-side Model vs Ground Truth comparison, delta error, and classification match status.
