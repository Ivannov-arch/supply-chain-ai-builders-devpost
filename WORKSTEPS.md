# WORKSTEPS.md
> Hackathon execution plan — 2 people, all times relative to T+0 (hackathon start).
> Both focus on backend & ML first. Frontend is assembled in the final phase.

---

## Phase 1 — Bootstrap & Backend Core (T+0 to T+16h)

### Hour 0–2: Project Bootstrap

1. Initialize Git repo, set `main` as default branch
2. Both clone repo and confirm local stack runs (Python venv + Node)
3. Copy `.env.example` → `.env`, fill in all real values (Gemini key, Supabase, etc.)
4. Confirm pre-trained models are in `backend/models/`
5. Run `uvicorn main:app --reload` — verify `/health` returns `{ "status": "ok" }`

---

### Hour 2–8: Core Prediction Endpoint

6. Create `backend/schemas/request.py` — define Pydantic models for input/output
7. Create `backend/services/model_service.py` — load `model_delay.json` and `model_risk.json` on startup
8. Create `backend/routers/predict.py` — implement `POST /predict`:
   - Accept: `origin`, `destination`, `cargo_type`, `shipment_date`, `transport_mode`
   - Run XGBoost inference → `delay_days` + `risk_level`
   - Return structured JSON:
     ```json
     {
       "delay_days": 3.8,
       "risk_level": "HIGH",
       "confidence": 0.82,
       "shap_breakdown": {},
       "action_plan": null
     }
     ```
9. Mount router in `main.py`, test with `curl` or Postman

---

### Hour 8–11: SHAP Integration

10. Create `backend/services/shap_service.py` — load `explainer.pkl` on startup
11. For each `/predict` call, run SHAP and extract top 3–5 feature contributions as percentages
12. Add `shap_breakdown` to the predict response:
    ```json
    "shap_breakdown": {
      "port_congestion": 0.45,
      "weather_index": 0.30,
      "route_distance": 0.15
    }
    ```
13. Verify SHAP values sum to approximately 100%

---

### Hour 11–14: Gemini Integration

14. Create `backend/services/gemini_service.py` — initialize `google-generativeai` client
15. Build prompt template that takes XGBoost output + SHAP breakdown as structured input:
    ```
    You are a logistics risk advisor. Given this data:
    - Risk Level: HIGH
    - Predicted Delay: 3.8 days
    - Top Risk Factors: Port Congestion (45%), Bad Weather (30%)

    Write a concise action plan (3 bullet points max) for the shipper.
    Be specific and practical. Do not restate the numbers.
    ```
16. Use `gemini-1.5-flash` model (fast, free-tier friendly)
17. Inject Gemini response as `action_plan` string into `/predict` response
18. Test full `/predict` end-to-end: input → XGBoost → SHAP → Gemini → JSON output

---

### Hour 14–16: Backend Phase 1 Verification

19. Test `/predict` with valid inputs — confirm all 4 fields populated (delay, risk, SHAP, action plan)
20. Test `/predict` with edge cases: missing fields, unknown routes, invalid dates
21. Measure response time — target under 3 seconds including Gemini call
22. Fix any errors before moving to bulk

---

## Phase 2 — Bulk Upload & Feedback (T+16h to T+32h)

### Hour 16–24: Bulk Prediction Endpoint

23. Implement `POST /predict-bulk` in `backend/routers/predict.py`:
    - Accept multipart file upload (`.csv` or `.xlsx`)
    - Parse with `pandas.read_csv()` / `pd.read_excel()`
    - Validate required columns — return clear error message if missing
    - Run prediction loop for each row (reuse same model pipeline as `/predict`)
    - Limit: max 200 rows per upload
24. Return aggregated response:
    ```json
    {
      "total": 30,
      "results": [
        { "row": 1, "origin": "Batam", "destination": "Singapore", "risk_level": "HIGH", "delay_days": 4.2 },
        ...
      ],
      "summary": { "high": 8, "medium": 15, "low": 7 }
    }
    ```
25. Create `ml/data/sample_manifest.csv` — 25 fake rows with mixed risk profiles for testing
26. Test `/predict-bulk` with the sample CSV, confirm correct output shape

---

### Hour 24–28: Feedback Endpoint

27. Create `backend/routers/feedback.py` — implement `POST /feedback`:
    - Accept: `origin`, `destination`, `predicted_delay`, `predicted_risk`, `was_delayed` (bool)
    - Save record to Supabase `feedback` table
    - Return `{ "success": true }`
28. Verify row appears in Supabase dashboard after POST
29. Mount feedback router in `main.py`

---

### Hour 28–32: Integration & Real-time Signal (Optional)

30. Connect all routers in `main.py`, run full end-to-end test of all 3 endpoints
31. Write a brief API test script (`backend/test_api.py`) to smoke-test all endpoints in sequence
32. *(If time allows)* Create `backend/services/weather_service.py`:
    - Call Open-Meteo API using destination coordinates (no API key required)
    - Add `weather_severity` score as an extra feature injected into `/predict` input
    - Show `"Live weather data included"` flag in response

---

## Phase 3 — Frontend & Deploy (T+32h to T+48h)

### Hour 32–38: Frontend Build

33. Scaffold Next.js 15 app in `frontend/` with Tailwind CSS and shadcn/ui
34. Install dependencies: `recharts`, `papaparse`, `lucide-react`
35. Set up design system in `app/globals.css`:
    - Dark navy base, amber accent for HIGH risk, green for LOW
    - Inter font from Google Fonts
36. Create `frontend/lib/api.ts` — typed fetch wrappers for `/predict`, `/predict-bulk`, `/feedback`
37. Build **Landing / Single Predict page** (`app/page.tsx`):
    - Form: Origin, Destination, Cargo Type, Date, Transport Mode
    - Submit → loading skeleton → result
    - Risk Score Card: HIGH/MEDIUM/LOW badge, delay days, confidence %
    - SHAP Breakdown: horizontal bar chart (Recharts) with labeled factors
    - Action Plan: Gemini text rendered as bullet points
    - Feedback buttons: "Was this delayed? ✅ Yes / ❌ No"
38. Build **Bulk Upload page** (`app/bulk/page.tsx`):
    - Drag-and-drop CSV zone (papaparse for client preview)
    - On upload → POST to `/predict-bulk` → render risk heatmap table
    - Summary cards: "8 HIGH RISK · 15 MEDIUM · 7 LOW"
    - Download results as CSV button

---

### Hour 38–42: Deploy

39. Deploy backend to Render:
    - Build: `pip install -r requirements.txt`
    - Start: `uvicorn main:app --host 0.0.0.0 --port 8000`
    - Add all env vars in Render dashboard
    - Verify `/health` returns 200 on live URL
40. Deploy frontend to Vercel:
    - Connect GitHub repo
    - Set `NEXT_PUBLIC_API_URL` to live Render URL
    - Verify all pages load correctly
41. Test full flow end-to-end on live URLs (not localhost)

---

### Hour 42–46: Demo Prep

42. Finalize `ml/data/sample_manifest.csv` — ensure 3 clear demo scenarios:
    - **Scenario A**: Single high-risk shipment → clear SHAP breakdown + strong Gemini advice
    - **Scenario B**: Bulk upload of 25 shipments → heatmap shows 8 HIGH RISK instantly
    - **Scenario C**: User clicks feedback → "Confirmed delay" saved to Supabase live
43. Rehearse demo flow — target 3 minutes total
44. Record screen recording as fallback in case of live demo failure
45. Review pitch narrative:
    - Problem (30s): SMEs have no affordable, accessible risk tool
    - Demo (90s): bulk upload → heatmap → single predict → SHAP + Gemini action plan
    - Architecture (30s): XGBoost predicts, SHAP explains, Gemini narrates
    - Business model (20s): freemium → B2B subscription
    - Roadmap (10s): real-time signals, model retraining loop

---

### Hour 46–48: Nice to Have (If Time Allows)

46. UI micro-animations: smooth page transitions, loading skeletons, feedback button animation
47. Mobile responsive layout check
48. Admin-style feedback summary page: table of all Supabase feedback rows + model accuracy %

---

## Quick Reference

| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `/health` | GET | — | `{ status: "ok" }` |
| `/predict` | POST | JSON shipment | delay, risk, SHAP, action plan |
| `/predict-bulk` | POST | CSV file | array of predictions + summary |
| `/feedback` | POST | validation data | `{ success: true }` |

| Service | URL |
|---------|-----|
| Frontend | `https://[project].vercel.app` |
| Backend | `https://[project].onrender.com` |
| Supabase | `https://[project].supabase.co` |
