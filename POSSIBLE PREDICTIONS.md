Berikut **prediction yang bisa dilakukan** untuk masing-masing dataset, lengkap dengan **tipe model**, **target variable**, dan **use case bisnis**:

***

## 1. Cross-Border Trade & Customs Delay Dataset (Kaggle)
**Link:** [https://www.kaggle.com/datasets/ziya07/cross-border-trade-and-customs-delay-dataset](https://www.kaggle.com/datasets/ziya07/cross-border-trade-and-customs-delay-dataset)

### A. **Prediksi Jumlah Hari Delay Customs** (Regresi)

**Target:** `Customs_Delay_Days` (angka kontinu, mis. 0, 1, 2, 5 hari)

**Tipe Model:**
- Regresi: XGBoost Regressor, Random Forest Regressor, Gradient Boosting, Linear Regression

**Fitur Input:**
- `Origin_Country`, `Destination_Country`
- `Transport_Mode` (sea, air, land)
- `Carrier_ID`
- `Cargo_Type` (perishable, electronics, textiles, dll.)
- `Shipment_Value`
- `Compliance_Score`
- `Prior_Offense_Count`
- `Inspection_Type` (X-ray, physical, document, dll.)
- `Is_High_Risk_Cargo`
- `Trade_Agreement` (FTA, non-FTA)

**Output Model:**
```json
{
  "predicted_delay_days": 3.2,
  "confidence_interval": [2.5, 4.0],
  "risk_level": "high"
}
```

**Use Case Bisnis:**
- Eksportir bisa **plan buffer time** lebih akurat.
- Importir bisa **antisipasi keterlambatan** & informasikan ke customer.
- Logistics provider bisa **prioritize shipment** yang berpotensi delay panjang.

***

### B. **Klasifikasi Risiko Delay** (Klasifikasi Biner / Multi-class)

**Target:** `Risk_Flag` (0 = low risk, 1 = high risk)  
**Atau:** Buat kategori sendiri dari `Customs_Delay_Days`:
- 0–1 hari = Low
- 2–4 hari = Medium
- 5+ hari = High

**Tipe Model:**
- Klasifikasi: XGBoost Classifier, Random Forest Classifier, Logistic Regression

**Fitur Input:** (sama seperti regresi)

**Output Model:**
```json
{
  "risk_category": "high",
  "probability_high_risk": 0.87,
  "top_risk_factors": ["low_compliance_score", "physical_inspection", "high_risk_cargo"]
}
```

**Use Case Bisnis:**
- **Early warning system**: "Shipment ini berisiko tinggi delay, pertimbangkan tindakan preventif."
- **Prioritas inspeksi**: Customs authority bisa fokus ke shipment high-risk.
- **Dynamic pricing**: Logistics provider bisa charge premium untuk high-risk shipment.

***

### C. **Prediksi Jenis Inspeksi yang Akan Diterima** (Klasifikasi Multi-class)

**Target:** `Inspection_Type` (none, x-ray, document, physical)

**Tipe Model:**
- Multi-class Classification: XGBoost, Random Forest, Neural Network

**Fitur Input:**
- Sama seperti di atas, plus:
  - `Cargo_Type`
  - `Origin_Country` (negara tertentu lebih sering di-inspect)
  - `Prior_Offense_Count`

**Output Model:**
```json
{
  "predicted_inspection": "physical",
  "probability": {
    "none": 0.10,
    "x-ray": 0.25,
    "document": 0.30,
    "physical": 0.35
  }
}
```

**Use Case Bisnis:**
- Eksportir bisa **persiapkan dokumen lebih awal** jika diprediksi physical inspection.
- Estimasi **waktu tambahan** untuk clearance berdasarkan jenis inspeksi.

***

### D. **Prediksi Apakah Shipment Akan Melebihi SLA** (Klasifikasi Biner)

**Target:** Buat variabel baru: `Exceeds_SLA` (1 jika `Customs_Delay_Days` > threshold SLA, mis. 3 hari)

**Tipe Model:**
- Binary Classification: XGBoost, Logistic Regression

**Output Model:**
```json
{
  "will_exceed_sla": true,
  "probability": 0.82,
  "recommended_action": "add_buffer_time"
}
```

**Use Case Bisnis:**
- **Contract compliance**: Apakah shipment akan melanggar SLA dengan customer?
- **Penalty avoidance**: Antisipasi penalty karena late delivery.

***

## 2. DataCo Supply Chain Dataset (Kaggle)
**Link:** [https://www.kaggle.com/datasets/evilspirit05/datasupplychain](https://www.kaggle.com/datasets/evilspirit05/datasupplychain)

### A. **Prediksi Risiko Late Delivery** (Klasifikasi Biner)

**Target:** `Late_delivery_risk` (0 = no risk, 1 = risk)

**Tipe Model:**
- Binary Classification: XGBoost Classifier, Random Forest, Logistic Regression

**Fitur Input:**
- `Days_for_shipping_scheduled`
- `Order_City`, `Order_State`, `Order_Country`
- `Market_Name`
- `Product_Category`
- `Order_Profit`
- `Sales`
- `Payment_Type`
- `Shipping_Mode` (Standard Class, First Class, Same Day)
- `Customer_Segment` (Consumer, Corporate, SME)

**Output Model:**
```json
{
  "late_delivery_risk": 1,
  "probability": 0.78,
  "top_factors": ["long_scheduled_days", "standard_shipping", "high_order_volume"]
}
```

**Use Case Bisnis:**
- E-commerce bisa **prioritize fulfillment** untuk order high-risk.
- Customer service bisa **proaktif informasikan** potensi delay.
- Operations bisa **optimize shipping mode** (mis. upgrade ke First Class untuk order critical).

***

### B. **Prediksi Status Delivery** (Klasifikasi Multi-class)

**Target:** `Delivery Status` (Late shipment, On time, Early, Delivery in progress)

**Tipe Model:**
- Multi-class Classification: XGBoost, Random Forest

**Output Model:**
```json
{
  "predicted_status": "Late shipment",
  "probability": {
    "Late shipment": 0.65,
    "On time": 0.25,
    "Early": 0.05,
    "Delivery in progress": 0.05
  }
}
```

**Use Case Bisnis:**
- **Dashboard operasional**: Monitor persentase late shipment per periode.
- **Root cause analysis**: Identifikasi pola order yang sering late.

***

### C. **Prediksi Waktu Pengiriman Aktual** (Regresi)

**Target:** `Days_for_shipping_real` (angka kontinu)

**Tipe Model:**
- Regresi: XGBoost Regressor, Gradient Boosting

**⚠️ Catatan Penting:**
- **Jangan gunakan `Days_for_shipping_real` sebagai input** jika targetnya `Late_delivery_risk` atau `Delivery Status` → ini **data leakage** (karena informasi ini baru diketahui setelah shipment selesai).
- Gunakan dataset ini **hanya untuk use case terpisah**: prediksi berapa hari shipment akan benar-benar tiba.

**Output Model:**
```json
{
  "predicted_actual_days": 5.3,
  "scheduled_days": 4.0,
  "delay_vs_scheduled": 1.3
}
```

**Use Case Bisnis:**
- **ETA prediction**: Berapa hari lagi barang akan sampai?
- **Customer expectation**: Informasikan ETA yang lebih realistis.

***

### D. **Prediksi Profitabilitas Order** (Regresi / Klasifikasi)

**Target:** `Order_Profit` (regresi) atau `Is_Profitable` (klasifikasi biner)

**Tipe Model:**
- Regresi: XGBoost Regressor
- Klasifikasi: XGBoost Classifier (profitable vs loss)

**Fitur Input:**
- `Sales`, `Discount`, `Shipping_Cost`
- `Product_Category`
- `Customer_Segment`
- `Shipping_Mode`

**Use Case Bisnis:**
- **Pricing optimization**: Order mana yang margin-nya tipis?
- **Customer segmentation**: Segment mana yang paling profitable?

***

## 3. Freight Indicators (Weekly) - data.gov
**Link:** [https://catalog.data.gov/dataset/freight-indicators-weekly](https://catalog.data.gov/dataset/freight-indicators-weekly)

### A. **Forecast Trend Freight Activity** (Time Series Forecasting)

**Target:** Nilai indikator freight per minggu (mis. `Inside_Gate_Index`, `Outside_Gate_Index`, `Freight_Movement_Index`)

**Tipe Model:**
- Time Series: Prophet, ARIMA, Exponential Smoothing, LSTM (opsional)

**Fitur Input:**
- `Week_End_Date` (timestamp)
- Historical values (lag features)
- Musiman (week, month, quarter)

**Output Model:**
```json
{
  "forecast_next_week": {
    "inside_gate_index": 105.3,
    "outside_gate_index": 98.7,
    "freight_movement_index": 102.1
  },
  "trend": "increasing",
  "anomaly_detected": false
}
```

**Use Case Bisnis:**
- **Dashboard konteks eksternal**: "Freight activity sedang meningkat, kemungkinan congestion di pelabuhan."
- **Early warning**: Deteksi anomali (mis. penurunan tajam = kemungkinan disruption).

***

### B. **Deteksi Anomali** (Anomaly Detection)

**Target:** Apakah minggu ini ada anomali (penurunan/peningkatan tidak wajar)?

**Tipe Model:**
- Statistical: Z-score, IQR
- ML: Isolation Forest, One-Class SVM

**Output Model:**
```json
{
  "anomaly_detected": true,
  "anomaly_type": "sharp_decline",
  "affected_indicator": "outside_gate_index",
  "severity": "high"
}
```

**Use Case Bisnis:**
- **Alert system**: "Ada penurunan tidak wajar di freight movement minggu ini."
- **Investigasi disruption**: Apakah ada event khusus (cuaca, strike, dll.)?

***

## 4. Supply Chain Disruptions (2015–2024) - Kaggle
**Link:** [https://www.kaggle.com/datasets/devpassive/supply-chain-disruptions-2015-2024](https://www.kaggle.com/datasets/devpassive/supply-chain-disruptions-2015-2024)

### A. **Prediksi Disruption di Pelabuhan Tertentu** (Klasifikasi Biner)

**Target:** `Disruption` (0 = no disruption, 1 = disruption) per pelabuhan per minggu

**Tipe Model:**
- Binary Classification: XGBoost, Random Forest

**Fitur Input:**
- `Port_ID`
- `Week`, `Month`, `Year`
- `Freight_Rate`
- `Historical_Disruption_Count`
- `Region` (Asia, Europe, Americas)

**Output Model:**
```json
{
  "disruption_predicted": true,
  "probability": 0.72,
  "affected_ports": ["SGSIN", "HKHKG", "CNSHA"]
}
```

**Use Case Bisnis:**
- **Route planning**: Hindari pelabuhan yang diprediksi disruption.
- **Alternative sourcing**: Cari supplier dari region yang lebih stabil.

***

### B. **Forecast Freight Rate** (Regresi / Time Series)

**Target:** `Freight_Rate` (angka kontinu)

**Tipe Model:**
- Regresi: XGBoost Regressor
- Time Series: Prophet, ARIMA

**Output Model:**
```json
{
  "predicted_freight_rate": 2850.5,
  "change_vs_last_week": "+5.2%",
  "trend": "increasing"
}
```

**Use Case Bisnis:**
- **Cost estimation**: Berapa biaya freight minggu depan?
- **Contract negotiation**: Lock rate sekarang jika diprediksi naik.

***

## Ringkasan: Rekomendasi untuk Hackathon 48 Jam

| Dataset | Prediction Terbaik untuk MVP | Kompleksitas | Rekomendasi |
|---------|------------------------------|--------------|-------------|
| **Cross-Border Trade (Kaggle)** | **Regresi: `Customs_Delay_Days`** + **Klasifikasi: `Risk_Flag`** | ⭐⭐ (menengah) | ✅ **Paling direkomendasikan** |
| **DataCo Supply Chain (Kaggle)** | Klasifikasi: `Late_delivery_risk` | ⭐⭐ (menengah) | ✅ Alternatif bagus |
| **Freight Indicators (data.gov)** | Forecast trend + anomaly detection | ⭐ (mudah) | ✅ Tambahan dashboard |
| **Supply Chain Disruptions (Kaggle)** | Klasifikasi disruption pelabuhan | ⭐⭐⭐ (lebih kompleks) | ⚠️ Opsional, cek dulu ketersediaan data |

***

## Kombinasi Ideal untuk Hackathon

**Opsi 1 (Paling Fokus):**
- **1 dataset utama:** Cross-Border Trade
- **Prediction:** Regresi `Customs_Delay_Days` + Klasifikasi `Risk_Flag`
- **Dashboard:** Tampilkan hasil prediksi + fitur importance

**Opsi 2 (Lebih Kaya):**
- **1 dataset utama:** Cross-Border Trade (untuk model)
- **1 dataset tambahan:** Freight Indicators (data.gov) untuk dashboard tren
- **Prediction:** Sama seperti Opsi 1 + grafik tren freight mingguan

**Opsi 3 (Alternatif):**
- **1 dataset utama:** DataCo Supply Chain
- **Prediction:** `Late_delivery_risk` + `Delivery Status`
- **Dashboard:** Breakdown per shipping mode, customer segment, product category

***

Kalau kamu mau, saya bisa bantu:
- Tulis **kode training model** untuk dataset pilihanmu.
- Rancang **schema API** (`/predict` request/response).
- Buat **daftar fitur MVP** yang spesifik untuk 48 jam.


Berikut **analisis lengkap ISOMORPH dataset** dan **prediction yang bisa dilakukan**:

***

## ISOMORPH Dataset Overview

**Link:** [https://huggingface.co/datasets/Isomorph2026/isomorph-supply-chain-benchmark](https://huggingface.co/datasets/Isomorph2026/isomorph-supply-chain-benchmark)

**Karakteristik:**
- **Digital twin** dari jaringan logistik multi-echelon (13 node di AS).
- **Time series** dengan resolusi harian, horizon **52.560 hari** (~144 tahun).
- **2 ukuran katalog:** C=50 items & C=200 items.
- **49 rollouts total:**
  - 2 baseline (C=50 & C=200)
  - 27 mixture scenarios (variasi parameter: drift, shock, burst, capacity, buffer, lead time)
  - 20 UQ perturbations (Latin Hypercube sampling untuk uncertainty quantification)
- **Lisensi:** CC-BY-4.0 (gratis, boleh untuk komersial dengan atribusi)
- **Ukuran:** ~99 GB (full), tapi bisa download subset saja

***

## Struktur File per Rollout

Setiap rollout directory berisi:

| File | Shape/Format | Konten |
|------|--------------|--------|
| `daily_records.parquet` | T × C rows | Per-day, per-item: `demand`, `served_from_stock`, `new_backlog_today`, `dest_on_hand_end_before_ship`, `dest_backlog_end_before_ship` |
| `shipments.parquet` | Variable rows | Per-shipment: `day`, `arrival_day`, `from`, `to`, `item`, `units`, `path_nodes`, `edge_times` |
| `service_summary.parquet` | C rows | Per-item totals: `total_demand`, `served_from_stock`, `new_backlog_added`, `fill_rate_stock_only` |
| `inventory_history.parquet` | T rows | On-hand inventory over time (aggregated) |
| `backlog_history.parquet` | T rows | Backlog over time (aggregated) |
| `intransit_history.parquet` | T rows | In-transit units over time (aggregated) |
| `demand_signals.npy` | T × C array | Item-level demand series (dense) |
| `edge_list.parquet` | E rows | Edge metadata: `from`, `to`, `travel_time_days`, `container_volume`, `num_containers`, `cap_per_day` |
| `edge_utilisation.npy` | T × E array | Per-edge fractional utilisation |
| `edge_saturation.npy` | T × E array | Per-edge fractional saturation |
| `scenario.json` | JSON | Exact simulator knobs used |

**Network topology:**
- 3 factories: San Francisco, St. Louis, Orlando
- 9 warehouses (5 tiers)
- 1 destination: New York
- Total edges: ~20–30 (tergantung routing)

***

## Prediction yang Bisa Dilakukan

### A. **Forecast Demand per Item** (Time Series Forecasting)

**Target:** `demand` kolom di `daily_records.parquet` (per item, per hari)

**Tipe Model:**
- Time Series Foundation Models: Chronos, Moirai, TimesFM, Lag-Llama (seperti di paper)
- Classical: Prophet, ARIMA, Exponential Smoothing
- Deep Learning: LSTM, GRU, Transformer

**Input Features:**
- Historical demand (lag features: t-1, t-7, t-30)
- Seasonality: day_of_week, month, quarter
- Demand drift (AR(1) coefficient dari `scenario.json`)
- Shock indicators (dari `scenario.json`: `shock_count_scale`, `shock_height_scale`)

**Output:**
```json
{
  "item_id": "I001",
  "forecast_next_7_days": [120, 115, 130, 125, 140, 135, 150],
  "confidence_interval_95": {
    "lower": [100, 95, 110, 105, 120, 115, 130],
    "upper": [140, 135, 150, 145, 160, 155, 170]
  },
  "trend": "increasing",
  "seasonality_detected": true
}
```

**Use Case:**
- Warehouse planning: berapa stok yang perlu di-order untuk 7 hari ke depan.
- Production scheduling: factory perlu produksi berapa untuk meet forecasted demand.

***

### B. **Prediksi Backlog di Destination** (Time Series Forecasting / Regresi)

**Target:** `dest_backlog_end_before_ship` dari `daily_records.parquet` atau `backlog_history.parquet`

**Tipe Model:**
- Time Series Forecasting: sama seperti di atas
- Regresi: XGBoost, Gradient Boosting (dengan lag features)

**Input Features:**
- Historical backlog (lag: t-1, t-7)
- Demand yang tidak terpenuhi
- Inventory level di destination
- In-transit units (akan arrival dalam X hari)
- Edge capacity/saturation (dari `edge_saturation.npy`)

**Output:**
```json
{
  "predicted_backlog_7_days": [50, 45, 60, 55, 70, 65, 80],
  "risk_of_stockout": "high",
  "days_until_stockout": 3,
  "recommended_action": "increase_replenishment"
}
```

**Use Case:**
- Early warning: "Backlog akan meningkat 60 unit dalam 3 hari ke depan."
- Inventory optimization: kapan harus reorder untuk avoid stockout.

***

### C. **Deteksi Bullwhip Effect** (Anomaly Detection / System Analysis)

**Target:** Variance amplification dari downstream → upstream

**Metode:**
- Hitung variance demand di destination vs variance order di warehouse vs variance production di factory.
- Bullwhip ratio = Variance(upstream) / Variance(downstream)
- Jika ratio > threshold (mis. 2.0) → bullwhip effect terdeteksi

**Input:**
- Demand series di destination (`daily_records.parquet`)
- Order series di warehouse (dari `shipments.parquet` atau `inventory_history.parquet`)
- Production series di factory (dari `shipments.parquet`)

**Output:**
```json
{
  "bullwhip_detected": true,
  "bullwhip_ratio": 3.2,
  "most_affected_item": "I042",
  "amplification_chain": {
    "destination_variance": 100,
    "warehouse_variance": 180,
    "factory_variance": 320
  },
  "root_cause": "high_demand_drift_and_low_buffer"
}
```

**Use Case:**
- System diagnostics: "Ada bullwhip effect di item I042, variance production 3.2x lebih besar dari demand."
- Policy recommendation: "Tingkatkan safety stock di warehouse tier 3."

***

### D. **Prediksi Edge Saturation / Congestion** (Klasifikasi Biner / Regresi)

**Target:** `edge_saturation` atau `edge_utilisation` dari `edge_saturation.npy`

**Tipe Model:**
- Klasifikasi: Edge akan saturated (>80%) dalam 7 hari ke depan? (Yes/No)
- Regresi: Berapa % saturation edge tertentu di hari t+7?

**Input Features:**
- Historical saturation (lag: t-1, t-7)
- Shipment volume di edge tersebut (dari `shipments.parquet`)
- Edge capacity (`cap_per_day` dari `edge_list.parquet`)
- Lead time scale (dari `scenario.json`)
- Container scale (dari `scenario.json`)

**Output:**
```json
{
  "edge_id": "E007",
  "from": "Warehouse_Tier2_Chicago",
  "to": "Warehouse_Tier3_Pittsburgh",
  "predicted_saturation_7_days": [0.65, 0.72, 0.81, 0.88, 0.92, 0.85, 0.78],
  "will_exceed_80_percent": true,
  "days_until_congestion": 3,
  "alternative_routes": ["E012", "E015"]
}
```

**Use Case:**
- Route planning: "Edge E007 akan congestion dalam 3 hari, pertimbangkan route alternatif E012."
- Capacity planning: "Edge ini consistently saturated, perlu tambah container capacity."

***

### E. **Prediksi Fill Rate / Service Level** (Regresi / Klasifikasi)

**Target:** `fill_rate_stock_only` dari `service_summary.parquet` atau hitung dari `daily_records.parquet`

**Fill Rate** = `served_from_stock` / `total_demand`

**Tipe Model:**
- Regresi: Prediksi fill rate untuk periode berikutnya
- Klasifikasi: Fill rate akan < 80%? (Yes/No = service level breach)

**Input Features:**
- Historical fill rate
- Inventory level di destination
- Demand forecast
- Lead time (dari `edge_list.parquet`)
- Safety stock scale (dari `scenario.json`)

**Output:**
```json
{
  "item_id": "I023",
  "predicted_fill_rate_next_7_days": 0.72,
  "service_level_breach": true,
  "threshold": 0.80,
  "recommended_safety_stock_increase": "+25%",
  "impact_if_no_action": "15% demand akan backlog"
}
```

**Use Case:**
- Service level monitoring: "Item I023 akan miss SLA (fill rate 72% < threshold 80%)."
- Inventory policy: "Tingkatkan safety stock 25% untuk avoid service breach."

***

### F. **Scenario Comparison / What-If Analysis** (Comparative Analytics)

**Target:** Bandingkan metrics antar scenario (dari `manifest.csv`)

**Metrics yang bisa dibandingkan:**
- Average backlog per item
- Average fill rate
- Bullwhip ratio
- Edge saturation %
- Total served demand vs total demand

**Input:**
- Multiple rollouts dari `output_mixture/` (mis. baseline vs chaos_compound)
- Parameter knobs dari `manifest.csv`

**Output:**
```json
{
  "comparison": {
    "baseline": {
      "avg_fill_rate": 0.92,
      "avg_backlog": 35,
      "bullwhip_ratio": 1.8
    },
    "chaos_compound": {
      "avg_fill_rate": 0.65,
      "avg_backlog": 120,
      "bullwhip_ratio": 4.5
    }
  },
  "impact_of_scenario": {
    "fill_rate_drop": "-27%",
    "backlog_increase": "+243%",
    "bullwhip_amplification": "+150%"
  },
  "key_drivers": ["high_drift", "severe_shocks", "low_buffer"]
}
```

**Use Case:**
- Stress testing: "Jika terjadi chaos compound scenario, fill rate turun 27%, backlog naik 243%."
- Policy evaluation: "Scenario dengan buffer 2x lebih baik dari baseline dalam mengurangi backlog."

***

### G. **Prediksi Arrival Time Shipment** (Regresi / Time Series)

**Target:** `arrival_day` - `day` dari `shipments.parquet` (actual lead time)

**Tipe Model:**
- Regresi: XGBoost Regressor, Gradient Boosting
- Time Series: LSTM untuk sequence prediction

**Input Features:**
- `from` node, `to` node
- `travel_time_days` (dari `edge_list.parquet`)
- `edge_saturation` di route tersebut
- `containers_scale` (dari `scenario.json`)
- `leadtime_scale` (dari `scenario.json`)
- Shipment volume (`units`)

**Output:**
```json
{
  "shipment_id": "S12345",
  "from": "SanFrancisco",
  "to": "NewYork",
  "predicted_lead_time_days": 8.5,
  "baseline_lead_time_days": 7.0,
  "delay_vs_baseline": "+1.5 days",
  "confidence_interval": [7.2, 9.8],
  "delay_reason": "high_edge_saturation_on_route"
}
```

**Use Case:**
- ETA prediction: "Shipment ini akan tiba dalam 8.5 hari (delay 1.5 hari dari baseline)."
- Customer communication: "Barang Anda akan terlambat 1.5 hari karena congestion di route."

***

## Ringkasan: Prediction yang Paling Feasible untuk Hackathon

| Prediction | Kompleksitas | Data yang Dibutuhkan | Rekomendasi untuk 48 Jam |
|------------|--------------|----------------------|--------------------------|
| **A. Forecast Demand per Item** | ⭐⭐⭐ (tinggi) | `daily_records.parquet`, `demand_signals.npy` | ⚠️ Hanya jika tim punya pengalaman time series |
| **B. Prediksi Backlog** | ⭐⭐ (menengah) | `backlog_history.parquet`, `daily_records.parquet` | ✅ **Direkomendasikan** |
| **C. Deteksi Bullwhip Effect** | ⭐⭐ (menengah) | `daily_records.parquet`, `shipments.parquet` | ✅ **Direkomendasikan** (analisis sistem) |
| **D. Edge Saturation Prediction** | ⭐⭐ (menengah) | `edge_saturation.npy`, `edge_list.parquet`, `shipments.parquet` | ✅ **Direkomendasikan** (routing focus) |
| **E. Fill Rate Prediction** | ⭐⭐ (menengah) | `service_summary.parquet`, `daily_records.parquet` | ✅ **Direkomendasikan** (SLA focus) |
| **F. Scenario Comparison** | ⭐ (mudah) | `manifest.csv`, multiple rollouts | ✅ **Sangat direkomendasikan** untuk dashboard |
| **G. ETA Shipment Prediction** | ⭐⭐ (menengah) | `shipments.parquet`, `edge_list.parquet` | ✅ **Direkomendasikan** |

***

## Kombinasi Ideal untuk Hackathon

**Opsi 1 (Focus pada Early Warning):**
- **Prediction B:** Backlog forecast
- **Prediction E:** Fill rate prediction
- **Dashboard:** Scenario comparison (F) untuk konteks

**Output MVP:**
> "Backlog di New York diprediksi meningkat 60 unit dalam 3 hari. Fill rate item I023 akan turun ke 72% (below SLA 80%). Rekomendasi: increase safety stock 25%."

**Opsi 2 (Focus pada Routing & Congestion):**
- **Prediction D:** Edge saturation prediction
- **Prediction G:** ETA shipment prediction
- **Dashboard:** Network visualization dengan edge saturation heatmap

**Output MVP:**
> "Edge E007 (Chicago → Pittsburgh) akan saturated dalam 3 hari. Shipment S12345 akan delay 1.5 hari. Rekomendasi: gunakan route alternatif E012."

**Opsi 3 (Focus pada System Dynamics):**
- **Prediction C:** Bullwhip effect detection
- **Prediction F:** Scenario comparison
- **Dashboard:** Bullwhip ratio per item, variance amplification chart

**Output MVP:**
> "Bullwhip effect terdeteksi di item I042 (ratio 3.2x). Chaos compound scenario menyebabkan fill rate turun 27%, backlog naik 243%. Root cause: high drift + severe shocks + low buffer."

***

## Catatan Penting

1. **Ukuran dataset sangat besar (~99 GB).**
   - Untuk hackathon, **download subset saja**:
     - 1 baseline rollout (mis. `output_mixture/baseline`)
     - 2–3 scenario rollouts (mis. `chaos_compound`, `burst` scenario)
   - Total: ~5–10 GB, masih manageable.

2. **Format Parquet & NumPy.**
   - Butuh library: `pandas`, `pyarrow`, `numpy`
   - Load time bisa lama untuk file besar → prepare di awal.

3. **Simulator bisa dijalankan ulang.**
   - Kalau mau generate scenario custom, bisa run simulator sendiri (code di GitHub).
   - Tapi untuk hackathon, lebih baik pakai rollout yang sudah ada.

4. **Lisensi CC-BY-4.0.**
   - Bebas dipakai, tapi **harus atribusi** ke paper & repo ISOMORPH.

***

## Kesimpulan

ISOMORPH adalah dataset **paling kaya & realistis** untuk supply chain dynamics, tapi juga **paling kompleks**. Untuk hackathon 48 jam:

- **Pilih 1–2 prediction** saja (mis. Backlog + Fill Rate).
- **Download subset** rollout (baseline + 2–3 scenarios).
- **Fokus pada insight bisnis**, bukan hanya akurasi model.

Kalau kamu mau, saya bisa bantu:
- Tulis **kode load & EDA** untuk ISOMORPH.
- Rancang **pipeline training** untuk prediction pilihanmu.
- Buat **mockup dashboard** yang menunjukkan insight dari dataset ini.