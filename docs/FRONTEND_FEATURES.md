# Frontend Features & Client-Side Application Logic

This document details the complete feature set, interactive UI components, and client-side business logic powering the **SupplyPulse** Next.js application.

---

## 1. Developer Mode Authentication & State Management

### Feature Overview
A discreet developer mode allowing judges and developers to unlock privilege mode, browse 2,908 historical benchmark shipments from the USAID SCMS dataset, and run side-by-side model vs ground-truth evaluations.

### Application & Business Logic
- **LocalStorage Sync & SSR Hydration:** State is persisted across browser sessions in `localStorage` (`supplypulse_dev_mode_active`) with hydration safeguards preventing React server-client mismatches.
- **Passcode Authentication:** Local verification using environment variable (`NEXT_PUBLIC_DEV_PASSCODE`) or default passcode (`devpost2026`).
- **Revocation / Logout:** Clean state wiping from both React state and browser storage.

### File References & Line Numbers
- [`frontend/context/DevModeContext.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/context/DevModeContext.tsx#L24-L34) — Initial state hydration from `localStorage`
- [`frontend/context/DevModeContext.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/context/DevModeContext.tsx#L36-L48) — Passcode verification & login logic
- [`frontend/context/DevModeContext.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/context/DevModeContext.tsx#L50-L57) — Logout & session termination logic

---

## 2. Easter Egg Detection & Global Shortcut Trigger

### Feature Overview
Secret entry points to trigger Developer Mode without intruding on standard user UI.

### Application & Business Logic
- **5-Click Window Counter Algorithm:** Click counter attached to the Navbar logo. If clicked 5 times within a 2.5-second rolling window (`NodeJS.Timeout`), triggers the Auth Modal.
- **Global Keyboard Listener:** Global `keydown` listener detecting `Ctrl + Shift + D` (or `Cmd + Shift + D` on Mac).

### File References & Line Numbers
- [`frontend/components/Navbar.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/Navbar.tsx#L34-L48) — 5-click counter algorithm & timer handle
- [`frontend/components/Navbar.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/Navbar.tsx#L51-L60) — Keyboard shortcut event listener
- [`frontend/components/Navbar.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/Navbar.tsx#L205-L244) — Dev Mode floating navbar badge rendering

---

## 3. Ground Truth Validation & Machine Learning Confusion Matrix

### Feature Overview
Renders side-by-side comparison between XGBoost predictions and real-world ground truth data.

### Application & Business Logic
- **Residual Error Delta ($\Delta$) Calculation:** Computes error delta $\Delta = \text{Predicted Delay} - \text{Actual Delay}$ rounded to 1 decimal place.
- **Confusion Matrix Evaluation Engine:** Automatically evaluates prediction vs actual outcome into one of 4 categories:
  - **True Positive (TP):** Model flagged risk (1), shipment was delayed (1).
  - **True Negative (TN):** Model predicted on-time (0), shipment arrived on-time (0).
  - **False Positive (FP):** Model alerted conservative risk (1), shipment arrived on-time (0).
  - **False Negative (FN):** Model predicted on-time (0), shipment delayed unexpectedly (1).
- **High Accuracy Indicator:** Flags predictions with residual error $|\Delta| \le 3.0$ days as high accuracy.

### File References & Line Numbers
- [`frontend/components/DevValidationCard.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/DevValidationCard.tsx#L15-L18) — Residual error delta calculation
- [`frontend/components/DevValidationCard.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/DevValidationCard.tsx#L33-L69) — Confusion matrix classification logic
- [`frontend/components/DevValidationCard.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/DevValidationCard.tsx#L174-L245) — Delay Days comparison card & delta display

---

## 4. Benchmark Dataset Stepper & Filtered Random Sampling

### Feature Overview
Toolbar mounted on `/predict` allowing instant navigation across all 2,908 benchmark shipments.

### Application & Business Logic
- **Row Boundary Input Control:** Validates user-typed row numbers (1–2,908) with auto-revert on invalid input.
- **Random Filtered Sampling Algorithm:** When a filter (`delayed` or `ontime`) is active, selects a random page (1–10) and samples a record from the returned array client-side.
- **Form Auto-Populate Integration:** Directly maps loaded record features into the single shipment predictor form.

### File References & Line Numbers
- [`frontend/components/DevDatasetNavigator.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/DevDatasetNavigator.tsx#L80-L101) — Random filtered sampling algorithm
- [`frontend/components/DevDatasetNavigator.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/DevDatasetNavigator.tsx#L103-L111) — Stepper & input validation submit
- [`frontend/components/DevDatasetNavigator.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/DevDatasetNavigator.tsx#L113-L127) — Filter pill state handler

---

## 5. Drag-and-Drop File Upload & Manifest Scanner

### Feature Overview
Bulk manifest upload zone supporting CSV and XLSX files.

### Application & Business Logic
- **File Type & Extension Validation:** Enforces `.csv` and `.xlsx` file extensions.
- **Byte Size Formatter:** Converts raw file byte size to human-readable strings (`B`, `KB`, `MB`).
- **HTML5 Drag Events:** Custom state management for `dragOver`, `dragLeave`, and `drop`.

### File References & Line Numbers
- [`frontend/components/BulkUpload.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/BulkUpload.tsx#L26-L33) — File drop & extension validation
- [`frontend/components/BulkUpload.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/BulkUpload.tsx#L53-L57) — File size formatting helper

---

## 6. Interactive Visualizations & Charting Logic

### Feature Overview
Dynamic feature importance breakdown charts and risk heatmaps.

### Application & Business Logic
- **SHAP Feature Contribution Formatting:** Converts raw SHAP values into absolute percentage contributions for visualization.
- **Color Metric Scale:** Dynamic color mapping based on risk severity (Red for High, Yellow for Medium, Green for Low).

### File References & Line Numbers
- [`frontend/components/ShapBreakdown.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/ShapBreakdown.tsx#L62-L95) — Label formatting & contribution percentage logic
- [`frontend/components/RiskHeatmap.tsx`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/components/RiskHeatmap.tsx#L15-L60) — Bulk predictions risk aggregation & filtering
