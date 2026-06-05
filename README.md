# 🌌 Peta Keluarga Politik Indonesia

Sebuah alat visualisasi interaktif untuk memetakan jaringan hubungan keluarga dan dinasti politik yang ada di Indonesia.

---

## 🏛️ Untuk Peneliti & Pengguna Umum (Non-Teknis)

### **Apa itu Peta Keluarga Politik Indonesia?**

Dalam politik Indonesia, pengaruh kekuasaan sering kali mengalir melalui hubungan kekeluargaan. Proyek ini memetakan hubungan tersebut secara visual—memperlihatkan bagaimana kekuasaan didistribusikan melalui pernikahan, hubungan orang tua-anak, dan kelompok keluarga besar (dinasti).

Proyek ini dirancang agar siapa saja (jurnalis, mahasiswa, peneliti, atau masyarakat umum) dapat menjelajahi data silsilah politik yang kompleks secara mudah dan menarik.

### **Fitur Utama:**

- **🌌 Konstelasi & Kelompok Keluarga Berwarna:** Setiap dinasti keluarga disajikan seperti gugusan bintang (konstelasi) di luar angkasa dengan warna yang berbeda-beda agar mudah dikenali.
- **🔍 Eksplorasi Interaktif:**
  - **Klik Dua Kali** pada lingkaran kelompok keluarga untuk membuka dan melihat seluruh anggota keluarga beserta hubungan detailnya.
  - **Klik Dua Kali** pada tokoh individu untuk merapikan/melipat kembali bagan keluarga tersebut.
- **✨ Detail Otomatis (Zoom Dinamis):** Nama tokoh dan garis hubungan akan memudar saat Anda memperkecil peta (zoom out) agar layar tidak penuh sesak, dan akan muncul kembali secara detail saat Anda memperbesar peta (zoom in).
- **📋 Pencarian Tokoh:** Ketik nama tokoh politik yang ingin dicari (misalnya: "Hatta", "Prabowo", "Soekarno") di kolom pencarian untuk langsung menemukan posisinya di dalam peta.
- **📊 Statistik Langsung:** Lihat jumlah total tokoh, total koneksi, dan pembagian jenis hubungan (Ayah, Ibu, Pasangan, Anak) melalui panel informasi di samping layar.
- **📱 Dukungan Android:** Aplikasi ini dapat diakses lewat browser komputer maupun diinstal langsung di handphone Android sebagai aplikasi mobile.
- **⌛ Layar Pemuatan yang Halus:** Menampilkan indikator loading ("Memuat Rasi Bintang...") secara akurat saat sistem sedang merapikan posisi bintang di layar.

---

## 💻 Untuk Pengembang & Praktisi Data (Teknis)

Aplikasi ini dibangun menggunakan arsitektur modern Next.js yang dikompilasi secara statis dan dibungkus menjadi aplikasi native menggunakan CapacitorJS.

### **Teknologi yang Digunakan:**

- **Framework Utama:** [Next.js 16](https://nextjs.org/) (App Router) & React 19.
- **Mesin Mobile:** [CapacitorJS 8](https://capacitorjs.com/) untuk membungkus kode web menjadi aplikasi Android native.
- **Visualisasi Grafik:** [vis-network 10](https://github.com/visjs/vis-network) untuk menggambar grafik interaktif berbasis Canvas dengan performa tinggi.
- **Desain & Tampilan:** [Tailwind CSS 4.2.0](https://tailwindcss.com/) dengan dukungan mode gelap otomatis (`next-themes`).
- **Bahasa Pemrograman:** TypeScript untuk pemodelan data silsilah yang ketat.

### **Sorotan Arsitektur:**

1. **Pengelompokan Berbasis Data (State-Driven Clustering):** Pengelompokan dinasti politik diproses menggunakan algoritma komponen terhubung (*connected-components*) di dalam berkas [network-utils.ts](file:///d:/01_Projects/peta-keluarga/lib/network-utils.ts). Perubahan tampilan grafis diatur sepenuhnya oleh React State untuk menghindari konflik rendering (ditulis pada [ADR 0015](file:///d:/01_Projects/peta-keluarga/docs/adr/0015-state-driven-clustering-stability.md)).
2. **Pembersihan Data Otomatis (Data Normalization):** Data hubungan keluarga di [family-data.ts](file:///d:/01_Projects/peta-keluarga/lib/family-data.ts) dibersihkan secara otomatis saat aplikasi dimuat. Hubungan anak yang duplikat dan pernikahan ganda dibersihkan agar kinerja pencarian informasi berjalan instan ($O(1)$) di panel samping (ditulis pada [ADR 0018](file:///d:/01_Projects/peta-keluarga/docs/adr/0018-data-normalization-lookups.md)).
3. **Sistem Keamanan Canvas (Defensive Rendering):** Menggunakan fungsi pengaman `safeFit` untuk memastikan aplikasi tidak mendadak eror (*crash*) ketika peta digeser dengan cepat atau saat halaman dimuat ulang (ditulis pada [ADR 0014](file:///d:/01_Projects/peta-keluarga/docs/adr/0014-runtime-stability.md)).
4. **Struktur Direktori yang Rapi:** Komponen antarmuka disimpan di dalam folder [components/ui](file:///d:/01_Projects/peta-keluarga/components/ui), logika fungsi di [lib](file:///d:/01_Projects/peta-keluarga/lib), fungsi kustom di [hooks](file:///d:/01_Projects/peta-keluarga/hooks), dan aset gambar di [public](file:///d:/01_Projects/peta-keluarga/public) (ditulis pada [ADR 0013](file:///d:/01_Projects/peta-keluarga/docs/adr/0013-project-restructuring.md)).

---

### **Cara Menjalankan Proyek**

#### **1. Menjalankan di Browser (Website)**

- **Instalasi library:**

  ```bash
  pnpm install
  ```

- **Jalankan mode pengembangan:**

  ```bash
  pnpm dev
  ```

- **Kompilasi web statis:**

  ```bash
  pnpm build
  ```

  *Hasil kompilasi akan berada di dalam direktori `/out`.*

#### **2. Menjalankan di Android (Aplikasi Mobile)**

- **Sinkronisasi kode web ke Android:**

  ```bash
  pnpm cap:sync
  ```

- **Buka proyek di Android Studio:**

  ```bash
  pnpm cap:open
  ```

- **Jalankan langsung di HP Android yang tersambung:**

  ```bash
  pnpm cap:run
  ```

---

## 📜 Log Keputusan Arsitektur (ADR)

Proyek ini mencatat setiap keputusan desain penting agar mudah dipahami perkembangannya. Anda bisa melihat arsip lengkap keputusan di folder [docs/adr](file:///d:/01_Projects/peta-keluarga/docs/adr).

| ID Keputusan | Judul Topik | Status | Ringkasan Penjelasan Sederhana |
| :--- | :--- | :--- | :--- |
| [ADR 0001](file:///d:/01_Projects/peta-keluarga/docs/adr/0001-foundational-tech-stack.md) | Fondational Tech Stack | Diterima | Menetapkan penggunaan Next.js, React, Tailwind CSS, dan vis-network untuk aplikasi. |
| [ADR 0002](file:///d:/01_Projects/peta-keluarga/docs/adr/0002-deployment-and-build-optimization.md) | Deployment & Optimization | Diterima | Mengonfigurasi web statis agar bisa dihosting gratis di GitHub Pages dengan gambar yang dioptimalkan. |
| [ADR 0003](file:///d:/01_Projects/peta-keluarga/docs/adr/0003-family-centric-data-modeling.md) | Family-Centric Data Modeling | Diterima | Membuat algoritma untuk mengelompokkan data hubungan datar menjadi kelompok dinasti keluarga besar. |
| [ADR 0004](file:///d:/01_Projects/peta-keluarga/docs/adr/0004-graph-interaction-and-clustering.md) | Graph Interaction | Diterima | Menambahkan fitur klik dua kali untuk membuka/menutup kelompok keluarga agar peta tidak terlihat penuh. |
| [ADR 0005](file:///d:/01_Projects/peta-keluarga/docs/adr/0005-component-organization.md) | Component Organization | Digantikan | Menyusun komponen di root proyek pada fase awal. Desain ini digantikan oleh susunan yang lebih rapi pada ADR 0013. |
| [ADR 0006](file:///d:/01_Projects/peta-keluarga/docs/adr/0006-placeholder-strategy.md) | Placeholder File Strategy | Diterima | Membuat file penanda kecil bernama `a` di tiap folder kosong agar sistem folder terbaca oleh Git. |
| [ADR 0007](file:///d:/01_Projects/peta-keluarga/docs/adr/0007-build-infrastructure.md) | Build Infrastructure | Diterima | Mengatur konfigurasi pnpm, TypeScript, dan PostCSS sebagai fondasi pengembangan aplikasi yang aman. |
| [ADR 0008](file:///d:/01_Projects/peta-keluarga/docs/adr/0008-network-visualization-architecture.md) | Network Vis Architecture | Diterima | Memisahkan komponen aplikasi menjadi: wadah utama, penampil peta grafis, dan panel menu informasi samping. |
| [ADR 0009](file:///d:/01_Projects/peta-keluarga/docs/adr/0009-data-processing-decoupling.md) | Data Layer Separation | Diterima | Memisahkan file penyimpanan data tokoh dari file algoritma silsilah agar kode lebih mudah dirawat. |
| [ADR 0010](file:///d:/01_Projects/peta-keluarga/docs/adr/0010-asset-organization.md) | Asset Directory Standard | Diterima | Memindahkan logo dan ikon aplikasi ke folder `public/` agar terbaca dengan benar sesuai standar Next.js. |
| [ADR 0011](file:///d:/01_Projects/peta-keluarga/docs/adr/0011-ui-component-library.md) | UI Component Library | Digantikan | Memasukkan 57 komponen dasar UI di folder utama proyek. Digantikan oleh struktur folder baru di ADR 0013. |
| [ADR 0012](file:///d:/01_Projects/peta-keluarga/docs/adr/0012-cicd-build-policy.md) | CI/CD Build Resilience | Diterima | Membuat sistem otomatisasi build agar setiap ada perubahan kode, web akan langsung terupdate di internet. |
| [ADR 0013](file:///d:/01_Projects/peta-keluarga/docs/adr/0013-project-restructuring.md) | Project Restructuring | Diterima | Merapikan workspace dengan memindahkan 55+ komponen dari folder root ke folder `/components/ui`. |
| [ADR 0014](file:///d:/01_Projects/peta-keluarga/docs/adr/0014-runtime-stability.md) | Runtime Stability Guards | Diterima | Membuat fungsi proteksi agar peta tidak macet saat pengguna menggeser atau memperbesar peta dengan cepat. |
| [ADR 0015](file:///d:/01_Projects/peta-keluarga/docs/adr/0015-state-driven-clustering-stability.md) | State-Driven Stability | Diterima | Mengatur buka-tutup dinasti keluarga melalui State React agar tampilan sinkron dan bebas eror render. |
| [ADR 0016](file:///d:/01_Projects/peta-keluarga/docs/adr/0016-constellation-zoom-levels.md) | Constellation Theme | Diterima | Mengubah desain visual peta menjadi berkonsep luar angkasa dan membuat nama tokoh memudar saat dizoom out. |
| [ADR 0017](file:///d:/01_Projects/peta-keluarga/docs/adr/0017-capacitor-android-porting.md) | Android Porting | Diterima | Menambahkan library CapacitorJS agar aplikasi web ini bisa dijadikan aplikasi handphone Android (.apk). |
| [ADR 0018](file:///d:/01_Projects/peta-keluarga/docs/adr/0018-data-normalization-lookups.md) | Data Indexing & Cleanups | Diterima | Menyederhanakan penyimpanan data silsilah agar memori HP/komputer pengguna tidak terbebani saat memuat peta. |
| [ADR 0019](file:///d:/01_Projects/peta-keluarga/docs/adr/0019-stabilization-loading-progress.md) | Monotonic Loading UX | Diterima | Memperbaiki tampilan layar loading ("Memuat Rasi Bintang...") agar persentase loading berjalan mulus dan konsisten. |

---

## ⚖️ Lisensi & Sumber Data

Data yang digunakan dalam proyek ini dihimpun dari dokumen publik resmi dan penelitian silsilah keluarga bersifat terbuka (*open-source*).
