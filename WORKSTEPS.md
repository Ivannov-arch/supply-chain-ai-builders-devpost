# WORKSTEPS.md
> Hackathon execution plan â€” 2-person team structure.
> Focus on backend & ML core first. Frontend is assembled in Phase 3.

---

## Phase 1 â€” Bootstrap & Backend Core

### Step 1.1: Project Bootstrap (Completed [x])

1. [x] Initialize Git repo, set main as default branch
2. [x] Both clone repo and confirm local stack runs (Python venv + Node)
3. [x] Copy .env.example â†’ .env, fill in all real values (Gemini key, Supabase, etc.)
4. [x] Confirm pre-trained models are in ackend/models/
5. [x] Run uvicorn main:app --reload â€” verify /health returns { "status": "ok" }

---

### Step 1.2: Core Prediction Endpoint

6. Create ackend/schemas/request.py â€” define Pydantic models for input/output matching SCMS dataset schema
7. Create ackend/services/model_service.py â€” load model_delay.json, model_risk.json, label_encoders.pkl on startup
8. Create ackend/routers/predict.py â€” implement POST /predict:
   - Accept SCMS supply chain input fields (Country, Shipment Mode, Vendor INCO Term, Weight, Freight Cost, Line Item Value, Quantity, etc.)
   - Run XGBoost inference â†’ delay_days (regression) + isk ON TIME / DELAYED (classification)
   - Return structured JSON:
     `json
     {
       "delay_days": 3.5,
       "risk": "DELAYED",
       "confidence": 0.82,
       "shap_breakdown": {},
       "action_plan": null
     }
     `
9. Mount router in main.py, test with curl or Postman

---

### Step 1.3: SHAP Integration

10. Create ackend/services/shap_service.py â€” load explainer.pkl on startup
11. For each /predict call, run SHAP and extract top 3â€“5 feature contributions as percentages
12. Add shap_breakdown to the predict response:
    `json
    "shap_breakdown": {
      "Line Item Value": 29.5,
      "Line Item Quantity": 26.2,
      "Vendor INCO Term": 16.9
    }
    `
13. Verify SHAP values sum to approximately 100%

---

### Step 1.4: Gemini AI Integration

14. Create ackend/services/gemini_service.py â€” initialize google-generativeai client
15. Build prompt template specific to customs clearance context:
    `
    You are a customs clearance risk advisor for cross-border trade.
    Given this shipment analysis:
    - Risk Level: DELAYED
    - Predicted Customs Delay: 3.5 days
    - Top Risk Factors: Line Item Value (29.5%), Line Item Quantity (26.2%), Vendor INCO Term (16.9%)

    Write a concise action plan (3 bullet points max) for the exporter.
    Focus on: customs documentation, timeline buffer, and cargo preparation steps.
    Be specific and practical. Do not restate the numbers.
    `
16. Use gemini-1.5-flash model (fast, free-tier friendly)
17. Inject Gemini response as ction_plan string into /predict response
18. Test full /predict end-to-end: input â†’ XGBoost â†’ SHAP â†’ Gemini â†’ JSON output

---

### Step 1.5: Backend Phase 1 Verification

19. Test /predict with valid inputs â€” confirm all 4 fields populated (delay, risk, SHAP, action plan)
20. Test /predict with edge cases: missing fields, unknown routes, invalid dates
21. Measure response time â€” target under 3 seconds including Gemini call
22. Fix any errors before moving to bulk

---

## Phase 2 â€” Bulk Upload & Feedback

### Step 2.1: Bulk Prediction Endpoint

23. Implement POST /predict-bulk in ackend/routers/predict.py:
    - Accept multipart file upload (.csv or .xlsx)
    - Parse with pandas.read_csv() / pd.read_excel()
    - Validate required columns â€” return clear error message if missing
    - Run prediction loop for each row (reuse same model pipeline as /predict)
    - Limit: max 200 rows per upload
24. Return aggregated response:
    `json
    {
      "total": 30,
      "results": [
        { "row": 1, "origin": "Batam", "destination": "Singapore", "risk_level": "HIGH", "delay_days": 4.2 },
        ...
      ],
      "summary": { "high": 8, "medium": 15, "low": 7 }
    }
    `
25. Create ml/data/sample_manifest.csv â€” 25 fake rows with mixed risk profiles for testing
26. Test /predict-bulk with the sample CSV, confirm correct output shape

---

### Step 2.2: Feedback Endpoint

27. Create ackend/routers/feedback.py â€” implement POST /feedback:
    - Accept: origin, destination, predicted_delay, predicted_risk, was_delayed (bool)
    - Save record to Supabase eedback table
    - Return { "success": true }
28. Verify row appears in Supabase dashboard after POST
29. Mount feedback router in main.py

---

### Step 2.3: Integration & Real-time Signal (Optional)

30. Connect all routers in main.py, run full end-to-end test of all 3 endpoints
31. Write a brief API test script (ackend/test_api.py) to smoke-test all endpoints in sequence
32. *(If time allows)* Create ackend/services/weather_service.py:
    - Call Open-Meteo API using destination coordinates (no API key required)
    - Add weather_severity score as an extra feature injected into /predict input
    - Show "Live weather data included" flag in response

---

## Phase 3 â€” Frontend & Deploy

### Step 3.1: Frontend Application Build

33. Scaffold Next.js 15 app in rontend/ with Tailwind CSS and shadcn/ui
34. Install dependencies: echarts, papaparse, lucide-react
35. Set up design system in pp/globals.css:
    - Dark navy base, amber accent for HIGH risk, green for LOW
    - Inter font from Google Fonts
36. Create rontend/lib/api.ts â€” typed fetch wrappers for /predict, /predict-bulk, /feedback
37. Build **Landing / Single Predict page** (pp/page.tsx):
    - Form: Origin, Destination, Cargo Type, Date, Transport Mode
    - Submit â†’ loading skeleton â†’ result
    - Risk Score Card: HIGH/MEDIUM/LOW badge, delay days, confidence %
    - SHAP Breakdown: horizontal bar chart (Recharts) with labeled factors
    - Action Plan: Gemini text rendered as bullet points
    - Feedback buttons: "Was this delayed? âœ… Yes / âŒ No"
38. Build **Bulk Upload page** (pp/bulk/page.tsx):
    - Drag-and-drop CSV zone (papaparse for client preview)
    - On upload â†’ POST to /predict-bulk â†’ render risk heatmap table
    - Summary cards: "8 HIGH RISK Â· 15 MEDIUM Â· 7 LOW"
    - Download results as CSV button

---

### Step 3.2: Cloud Deployment

39. Deploy backend to Render:
    - Build: pip install -r requirements.txt
    - Start: uvicorn main:app --host 0.0.0.0 --port 8000
    - Add all env vars in Render dashboard
    - Verify /health returns 200 on live URL
40. Deploy frontend to Vercel:
    - Connect GitHub repo
    - Set NEXT_PUBLIC_API_URL to live Render URL
    - Verify all pages load correctly
41. Test full flow end-to-end on live URLs (not localhost)

---

### Step 3.3: Demo & Pitch Preparation

42. Finalize ml/data/sample_manifest.csv â€” ensure 3 clear demo scenarios:
    - **Scenario A**: Single high-risk shipment â†’ clear SHAP breakdown + strong Gemini advice
    - **Scenario B**: Bulk upload of 25 shipments â†’ heatmap shows 8 HIGH RISK instantly
    - **Scenario C**: User clicks feedback â†’ "Confirmed delay" saved to Supabase live
43. Rehearse demo flow â€” target 3 minutes total
44. Record screen recording as fallback in case of live demo failure
45. Review pitch narrative:
    - Problem (30s): SMEs have no affordable, accessible risk tool
    - Demo (90s): bulk upload â†’ heatmap â†’ single predict â†’ SHAP + Gemini action plan
    - Architecture (30s): XGBoost predicts, SHAP explains, Gemini narrates
    - Business model (20s): freemium â†’ B2B subscription
    - Roadmap (10s): real-time signals, model retraining loop

---

### Step 3.4: Optional Enhancements

46. UI micro-animations: smooth page transitions, loading skeletons, feedback button animation
47. Mobile responsive layout check
48. Admin-style feedback summary page: table of all Supabase feedback rows + model accuracy %

---

## Quick Reference

| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| /health | GET | â€” | { status: "ok" } |
| /predict | POST | JSON shipment | delay, risk, SHAP, action plan |
| /predict-bulk | POST | CSV file | array of predictions + summary |
| /feedback | POST | validation data | { success: true } |

| Service | URL |
|---------|-----|
| Frontend | https://[project].vercel.app |
| Backend | https://[project].onrender.com |
| Supabase | https://[project].supabase.co |