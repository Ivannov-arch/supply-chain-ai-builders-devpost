# Debug Log & Error History

Dokumen ini mencatat error non-minor (logika, skema, env, runtime, tipe data, dependensi) yang terjadi selama pengembangan beserta solusinya.

---

## 1. Schema & Feature Column Structure Mismatch (`models/feature_columns.json`)
- **Masalah:** File `feature_columns.json` tidak hanya berisi list nama fitur, melainkan object JSON dengan struktur metadata/kamus data lengkap. Membaca file tersebut secara mentah sebagai `list[str]` menyebabkan error tipe data atau kegagalan mapping saat inferensi.
- **Penyebab:** Asumsi awal bahwa file hanya berisi array string nama kolom.
- **Perbaikan:** Menyesuaikan parsing `feature_columns.json` agar mengekstrak keys/fitur yang sesuai dengan skema input model machine learning secara tepat.

---

## 2. Inconsistent Feature Naming Casing between Schemas & Model
- **Masalah:** Adanya ketidakcocokan antara penamaan atribut pada Pydantic request model (`PredictionRequest`) dengan kolom fitur training pada model (`models/`).
- **Penyebab:** Perbedaan konvensi penamaan (snake_case vs CamelCase / format fitur pada dataset training).
- **Perbaikan:** Menyelaraskan field di `backend/schemas/request.py` dan menambahkan mapping/normalisasi di `backend/services/predictor.py` agar nama fitur pas dengan ekspektasi model scikit-learn / XGBoost.

---

## 3. Environment Variable Loading (`GEMINI_API_KEY` Not Found)
- **Masalah:** Service Gemini (`gemini_service.py`) mencoba mengakses `os.environ["GEMINI_API_KEY"]`, namun variabel bernilai kosong atau melempar `KeyError` saat Uvicorn dijalankan dari root workspace.
- **Penyebab:** `.env` file berada di direktori `backend/.env` dan belum di-load secara eksplisit oleh `python-dotenv` sebelum service di-import.
- **Perbaikan:**
  1. Menambahkan `from dotenv import load_dotenv` dan memanggil `load_dotenv()` di bagian paling atas `backend/main.py` dan `backend/services/gemini_service.py`.
  2. Memastikan konfigurasi `google.generativeai` mengecek dan memberikan error message yang jelas jika API key belum dikonfigurasi.

---

## 4. Input Encoding & Preprocessing Shape Mismatch (`predictor.py`)
- **Masalah:** Data input single-request dari FastAPI berupa dictionary, sementara XGBoost/Scikit-Learn model membutuhkan array 2D `(1, n_features)` dengan urutan kolom yang presisi sesuai training set.
- **Penyebab:** Langsung mengumpankan dictionary request tanpa transformasi matriks 2D dan encoding categorical variables (`LabelEncoder`).
- **Perbaikan:** Membuat helper function `_encode_input()` di `predictor.py` untuk mengonversi dictionary menjadi 2D `numpy.ndarray` sesuai dengan daftar `FEATURE_COLUMNS`.

---

## 5. Model Persistence & Version Warning (`InconsistentVersionWarning`)
- **Masalah:** Warning saat unpickling estimator: *Trying to unpickle estimator LabelEncoder from version 1.6.1 when using version 1.5.2*.
- **Penyebab:** Artifact `.pkl` / `.joblib` dibuat menggunakan scikit-learn versi 1.6.1 sedangkan environment virtual (`venv`) menggunakan scikit-learn 1.5.2.
- **Perbaikan/Mitigasi:** Dipastikan aman untuk inferensi dasar, namun disarankan untuk menyamakan versi `scikit-learn==1.6.1` pada `requirements.txt` / virtual environment untuk menghindari potensi pembacaan atribut internal yang terdepresiasi.

---

## 6. `NameError: name 'load_dotenv' is not defined` (`gemini_service.py`)
- **Masalah:** Uvicorn crash saat startup dengan error `NameError: name 'load_dotenv' is not defined`.
- **Penyebab:** Modifikasi kode sebelumnya secara tidak sengaja menghapus statement import `from dotenv import load_dotenv`.
- **Perbaikan:** Menambahkan kembali import `from dotenv import load_dotenv` di bagian atas file `backend/services/gemini_service.py`.

---

## 7. Gemini Model Deprecation & Dynamic AI Model Selection Feature
- **Masalah:** Versi lama Gemini (seperti `gemini-1.5-flash` / `gemini-2.0-flash`) berisiko terdepresiasi atau tidak tersedia di API v1beta Google. Saat diuji dengan model versi terbaru (`gemini-3.0-flash` dan `gemini-3.6`), respons berhasil didapatkan namun dibutuhkan fleksibilitas untuk memilih model AI.
- **Penyebab:** Model ID di-hardcode secara static di service backend (`gemini_service.py`).
- **Perbaikan & Solusi Arsitektur:**
  1. Menambahkan opsional atribut `model_name: str | None = Field(default="gemini-2.5-flash")` di Pydantic schema `PredictionRequest` ([`request.py`](file:///c:/Coding/Hackathons/Distribution/backend/schemas/request.py)).
  2. Mengubah `generate_action_plan()` di [`gemini_service.py`](file:///c:/Coding/Hackathons/Distribution/backend/services/gemini_service.py) agar menerima parameter `model_name` kustom dari request payload (misal `gemini-3.5-flash`, `gemini-3.6`-flash`, atau model pro lainnya).
  3. Memperbaiki `_encode_input()` di [`predictor.py`](file:///c:/Coding/Hackathons/Distribution/backend/services/predictor.py) dengan memfilter `if k in FIELD_MAP` saat dictionary remapping, untuk mencegah `KeyError: 'model_name'` saat meng-encode matriks fitur ML.
  4. Memungkinkan frontend di kemudian hari menyajikan dropdown pemilihan model AI secara dinamis tanpa perlu mengubah kode backend.



