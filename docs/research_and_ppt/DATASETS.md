Berikut dataset **spesifik** yang paling cocok untuk MVP Ide 7: *prediksi delay + risk scoring supply chain untuk SME/eksportir*.

## Pilihan utama: Kaggle

### 1. DataCo Supply Chain Dataset — terbaik untuk MVP awal
**Link:** [https://www.kaggle.com/datasets/evilspirit05/datasupplychain](https://www.kaggle.com/datasets/evilspirit05/datasupplychain)

- Sekitar **140.000+ record** pengiriman dan **53 kolom**.
- Memiliki target yang sangat siap pakai: `Late_delivery_risk` dan `Delivery Status`.
- Fitur mencakup waktu pengiriman aktual vs terjadwal, lokasi pelanggan, kategori produk, metode pembayaran, nilai transaksi, profit, dan status delivery.
- Lisensi tercantum **MIT**, sehingga relatif aman untuk eksperimen dan MVP. [kaggle](https://www.kaggle.com/datasets/evilspirit05/datasupplychain)

**Pakai ini jika MVP-mu adalah:**  
> “Prediksi apakah sebuah shipment berisiko terlambat.”

**Target model:**  
- Klasifikasi: `Late_delivery_risk` (0/1)  
- Alternatif: klasifikasi `Delivery Status` (late / on-time / early)

**Catatan penting:** jangan gunakan `Days for shipping (real)` sebagai input bila targetnya `Late_delivery_risk`, karena itu berpotensi data leakage—informasi aktual baru diketahui setelah shipment selesai.

***

### 2. Cross-Border Trade & Customs Delay Dataset — terbaik untuk narasi ekspor-impor
**Link:** [https://www.kaggle.com/datasets/ziya07/cross-border-trade-and-customs-delay-dataset](https://www.kaggle.com/datasets/ziya07/cross-border-trade-and-customs-delay-dataset)

- **10.000+ shipment record** untuk perdagangan lintas negara.
- Memiliki dua target yang langsung relevan:
  - `Customs_Delay_Days` untuk prediksi jumlah hari keterlambatan.
  - `Risk_Flag` untuk klasifikasi risiko.
- Fiturnya mencakup origin/destination country, transport mode (termasuk laut), carrier, jenis kargo, detail inspeksi bea cukai, compliance score, prior offense count, dan teks alasan delay.
- Berlisensi **CC0 / Public Domain**, jadi gratis dan paling aman untuk dipakai/demo. [kaggle](https://www.kaggle.com/datasets/ziya07/cross-border-trade-and-customs-delay-dataset)

**Pakai ini jika MVP-mu adalah:**  
> “Early-warning untuk eksportir: prediksi keterlambatan customs dan risiko shipment lintas negara.”

**Ini paling cocok untuk positioning ASEAN/SME**, walaupun datanya disimulasikan dan tidak khusus Asia Tenggara.

***

### 3. Supply Chain Disruptions (2015–2024) — pelengkap untuk layer disruption
**Link:** [https://www.kaggle.com/datasets/devpassive/supply-chain-disruptions-2015-2024](https://www.kaggle.com/datasets/devpassive/supply-chain-disruptions-2015-2024)

- Dataset ini dideskripsikan sebagai **sinyal gangguan tingkat pelabuhan mingguan**, bersama freight rates dan delay, dari 2015–2024. [kaggle](https://www.kaggle.com/datasets/devpassive/supply-chain-disruptions-2015-2024/code)
- Cocok sebagai layer tambahan untuk dashboard: tren gangguan, alert per pelabuhan, atau forecasting disruption.

**Catatan:** halaman Kaggle sedang gagal dimuat dari sumber yang saya cek, jadi sebelum memilihnya cek langsung kolom, lisensi, dan file yang tersedia di akun Kaggle-mu. [kaggle](https://www.kaggle.com/datasets/devpassive/supply-chain-disruptions-2015-2024)

***

## Pilihan utama: data.gov

### 4. Supply Chain and Freight Indicators — indikator supply chain resmi
**Link:** [https://catalog.data.gov/dataset/supply-chain-and-freight-indicators](https://catalog.data.gov/dataset/supply-chain-and-freight-indicators)

- Dataset resmi dari **U.S. Department of Transportation / Bureau of Transportation Statistics**.
- Mencakup empat kelompok indikator:
  - Aktivitas pelabuhan di dalam gerbang (*inside the gate*).
  - Kondisi di luar pelabuhan (*outside the gate*).
  - Pergerakan freight.
  - Tenaga kerja dan kapasitas transportasi.
- Tersedia resource termasuk **CSV**, JSON, dan XML; dataset terakhir diperbarui pada September 2026. [catalog.data](https://catalog.data.gov/dataset/supply-chain-and-freight-indicators)

**Pakai ini untuk:**  
- Memberi **konteks eksternal** pada prediksi: apakah freight activity atau kapasitas pelabuhan sedang terganggu.
- Membuat dashboard tren supply-chain, bukan sebagai dataset label shipment per-order utama.

***

### 5. Freight Indicators (Weekly) — ringan dan mudah untuk time series
**Link dataset:** [https://catalog.data.gov/dataset/freight-indicators-weekly](https://catalog.data.gov/dataset/freight-indicators-weekly)  
**CSV langsung:** [https://data.transportation.gov/api/views/h7pv-kjj5/rows.csv?accessType=DOWNLOAD](https://data.transportation.gov/api/views/h7pv-kjj5/rows.csv?accessType=DOWNLOAD)

- Mengandung tiga indikator freight mingguan dibanding baseline pra-COVID.
- Secara eksplisit ditujukan untuk akses dan penggunaan publik. [catalog.data](https://catalog.data.gov/dataset/freight-indicators-weekly)
- CSV dan data dictionary tersedia melalui endpoint resmi Department of Transportation. [catalog.data](https://catalog.data.gov/dataset/freight-indicators-weekly/resource/e4d0911c-54d6-461d-96a7-6549904fa4be)

**Pakai ini untuk:**  
- Grafik tren mingguan.
- Deteksi anomali sederhana.
- Menambah “market condition score” ke dashboard MVP.

***

## Kombinasi yang saya sarankan

### Opsi paling realistis: satu dataset saja
Pakai **Cross-Border Trade & Customs Delay Dataset**.

Alasannya:
- Langsung punya target regresi (`Customs_Delay_Days`) dan klasifikasi (`Risk_Flag`).
- Ringan, hanya sekitar 1,88 MB.
- CC0/Public Domain.
- Narasinya paling dekat dengan eksportir/importir dan pengiriman lintas negara. [kaggle](https://www.kaggle.com/datasets/ziya07/cross-border-trade-and-customs-delay-dataset)

### Opsi demo lebih kuat: dua sumber data
- **Model utama:** Cross-Border Trade & Customs Delay Dataset dari Kaggle.  
- **Dashboard eksternal:** Freight Indicators (Weekly) dari data.gov.

Dengan begitu demo-mu bisa berkata:

> “Untuk shipment laut makanan dari negara A ke negara B, sistem memperkirakan keterlambatan 3 hari dengan risiko tinggi. Selain faktor shipment dan compliance, dashboard juga menunjukkan tekanan freight mingguan sedang meningkat.”

Dataset Kaggle menangani prediksi di level shipment; data.gov memberi kredibilitas indikator publik di level sistem/logistik.

***

## Scope MVP yang tepat

Jangan langsung klaim “memprediksi seluruh supply chain dunia.” Klaim yang lebih kuat dan jujur:

> **AI early-warning tool untuk memprediksi risiko delay customs pada shipment lintas batas, lalu menjelaskan faktor risiko utama secara transparan.**

**Input MVP:**
- Negara asal dan tujuan  
- Moda transportasi  
- Jenis kargo  
- Carrier  
- Nilai shipment  
- Compliance score  
- Riwayat pelanggaran  
- Jenis inspeksi  

**Output MVP:**
- Risiko: low / medium / high  
- Estimasi hari delay  
- Tiga faktor pendorong risiko terbesar  
- Rekomendasi operasional yang bersifat hati-hati, misalnya “periksa kelengkapan dokumen” atau “tambahkan buffer waktu pengiriman”  

Untuk model, gunakan **XGBoost atau scikit-learn Gradient Boosting**, dilatih offline lalu di-deploy hanya untuk inference. Ini ringan dan masuk akal untuk backend FastAPI di Render/Railway.