# Debug Log & Resolution Record

This document logs non-minor issues (logic, schema, environment, runtime, data types, dependencies) encountered during development along with their root causes and verified resolutions.

---

## 1. Schema & Feature Column Structure Mismatch (`models/feature_columns.json`)
- **Issue:** The `feature_columns.json` file did not contain a flat array of feature names, but rather a full metadata JSON object dictionary. Reading the file directly as `list[str]` caused data type errors during feature mapping.
- **Root Cause:** Initial assumption that the JSON artifact contained only an array of column name strings.
- **Resolution:** Updated parsing logic in `predictor.py` to extract `_fc["feature_cols"]` correctly, aligning with the expected ML model input schema.

---

## 2. Inconsistent Feature Naming Casing Between Schemas & Model
- **Issue:** Mismatch between snake_case attribute names in Pydantic request models (`PredictionRequest`) and the training feature names expected by the scikit-learn / XGBoost models.
- **Root Cause:** Naming convention differences (snake_case vs raw training column headers like `Vendor INCO Term`).
- **Resolution:** Aligned fields in `backend/schemas/request.py` and implemented `FIELD_MAP` dictionary in `backend/services/predictor.py` to remap incoming attributes to exact model features.

---

## 3. Environment Variable Loading (`GEMINI_API_KEY` Not Found)
- **Issue:** The Gemini service (`gemini_service.py`) threw `KeyError: 'GEMINI_API_KEY'` or received empty values when Uvicorn was launched from the workspace root.
- **Root Cause:** Environment variables in `backend/.env` were not explicitly loaded by `python-dotenv` before service modules were imported.
- **Resolution:** Added `from dotenv import load_dotenv` and invoked `load_dotenv()` at the very top of `backend/main.py` and `backend/services/gemini_service.py`.

---

## 4. Input Encoding & Preprocessing Shape Mismatch (`predictor.py`)
- **Issue:** Single-request JSON inputs from FastAPI were received as flat dictionaries, whereas XGBoost / Scikit-Learn models require a 2D numpy array `(1, n_features)` with exact column ordering and encoded categorical variables.
- **Root Cause:** Direct passing of request dictionaries without 2D array matrix transformation or `LabelEncoder` application.
- **Resolution:** Built the `_encode_input()` helper function in `predictor.py` to apply fitted `LabelEncoder` objects and format inputs into a ordered 2D `np.ndarray`.

---

## 5. Model Persistence & Version Warning (`InconsistentVersionWarning`)
- **Issue:** Scikit-learn emitted an unpickling warning: *Trying to unpickle estimator LabelEncoder from version 1.6.1 when using version 1.5.2*.
- **Root Cause:** Pickled artifacts (`.pkl`) were generated with scikit-learn 1.6.1 while the runtime virtual environment had scikit-learn 1.5.2 installed.
- **Resolution:** Verified basic inference stability and updated `backend/requirements.txt` to align `scikit-learn==1.6.1`.

---

## 6. `NameError: name 'load_dotenv' is not defined` (`gemini_service.py`)
- **Issue:** Uvicorn startup crashed with `NameError: name 'load_dotenv' is not defined`.
- **Root Cause:** Accidental removal of the import statement during code refactoring.
- **Resolution:** Restored `from dotenv import load_dotenv` at the top of `backend/services/gemini_service.py`.

---

## 7. Gemini Model Deprecation & Dynamic AI Model Selection Feature
- **Issue:** Legacy Gemini model IDs (`gemini-1.5-flash`) risked deprecation or unavailability on Google's API. Testing with newer models (`gemini-2.5-flash`, `gemini-3.0-flash`) required flexible model selection.
- **Root Cause:** Hardcoded model ID string inside `gemini_service.py`.
- **Resolution:**
  1. Added optional `model_name: str | None = Field(default="gemini-2.5-flash")` attribute to `PredictionRequest` ([`request.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/schemas/request.py)).
  2. Updated `generate_action_plan()` in [`gemini_service.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/services/gemini_service.py) to accept dynamic model selection.
  3. Modified `_encode_input()` in [`predictor.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/services/predictor.py) with filtering (`if k in FIELD_MAP`) to prevent `KeyError: 'model_name'` during ML matrix transformation.

---

## 8. Indonesian Localization Cleanup Across Backend & Docs
- **Issue:** Several backend error detail strings and documentation files contained leftover Indonesian text, violating the project rule requiring code and documentation to be written in English.
- **Root Cause:** Early prototyping notes and backend error handlers written in Indonesian.
- **Resolution:** 
  1. Translated all error details in [`backend/routers/predict.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/routers/predict.py) to English (`"Only .csv or .xlsx file formats are supported"`, `"Failed to read file"`, `"Missing required columns"`).
  2. Translated research and planning documentation into English in `docs/`.

---

## 9. Linux Container XGBoost Shared Library Dependency Missing (`libgomp.so.1`)
- **Issue:** When containerizing and deploying the FastAPI backend via Docker or Linux-based cloud hosts (Render / Cloud Run), Uvicorn crashed on startup during `import xgboost` with `OSError: libgomp.so.1: cannot open shared object file: No such file or directory`.
- **Root Cause:** XGBoost relies on OpenMP (`libgomp1`) for multi-threaded parallel computation. The minimal `python:3.12-slim` base image does not bundle OpenMP libraries by default.
- **Resolution:** Added `apt-get update && apt-get install -y --no-install-recommends libgomp1 build-essential curl` to the [`Dockerfile`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/Dockerfile), ensuring XGBoost runtime C-libraries are present in container builds.

---

## 10. HTTP 405 Method Not Allowed on Uptime Monitors & Keep-Alive Probes (`UptimeRobot`)
- **Issue:** Automated uptime monitoring services (such as UptimeRobot or cloud load balancers) reported the backend service as DOWN or failing with HTTP `405 Method Not Allowed`.
- **Root Cause:** Standard uptime monitors and cloud ping probes send HTTP `HEAD` requests rather than `GET` requests to conserve bandwidth. FastAPI routes defined solely with `@app.get("/health")` reject `HEAD` requests by default with a `405` status.
- **Resolution:** Added explicit `@app.head("/")` and `@app.head("/health")` decorators alongside the `@app.get()` routes in [`backend/main.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/main.py), returning `200 OK` without a response body for lightweight health probing.

---

## 11. Benchmark Dataset Cloud Latency & Memory Footprint (Dual-Source Supabase / CSV Fallback)
- **Issue:** Loading the full 2,908 historical SCMS benchmark dataset exclusively into in-memory pandas DataFrames consumed unnecessary container RAM. Conversely, relying solely on Supabase REST endpoints introduced network latency and demo failure risks if network connectivity dropped or credentials were unconfigured.
- **Root Cause:** Monolithic data access layer in early developer mode prototypes.
- **Resolution:** Implemented a resilient dual-source fallback architecture in [`backend/routers/dev.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/routers/dev.py). The API queries Supabase REST (`/rest/v1/scms_benchmark`) first; if unreachable, timed out, or unconfigured, it instantly falls back to the local `backend/data/scms_benchmark.csv` in-memory slice without failing the request.

---

## 12. Merge Conflict Remnants & Corrupted JSON in Frontend Configurations
- **Issue:** Next.js failed to build or lint due to syntax errors and duplicated dependency declarations in `package.json`, `tsconfig.json`, and `package-lock.json`.
- **Root Cause:** Git merge conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`) were accidentally committed during multi-contributor branch synchronization.
- **Resolution:** Cleaned up all configuration files, unified dependencies (React 19, Next.js 16, Tailwind CSS v4, Lucide, Recharts, PapaParse), and regenerated clean lockfiles.

---

## 13. Production Backend URL Resolution & CORS Configuration in Frontend
- **Issue:** Frontend deployed on Vercel was unable to communicate with the hosted Render backend, resulting in failed API requests or attempts to connect to `http://localhost:8000`.
- **Root Cause:** The API URL fallback in `frontend/lib/api.ts` defaulted to `http://localhost:8000` when `NEXT_PUBLIC_API_URL` was unset in remote deployment environments, and trailing slashes caused double-slash URL path errors.
- **Resolution:** Configured fallback to the live production Render domain (`https://devpost-ai-builders-supply-chain.onrender.com`) with automated `.replace(/\/$/, "")` sanitization in [`frontend/lib/api.ts`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/frontend/lib/api.ts), and confirmed wildcard CORS middleware in [`backend/main.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/main.py).

