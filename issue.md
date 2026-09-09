# Issue: Setup Project Website Waxing

## Overview

Buat project backend baru untuk **Website Waxing** (salon kecantikan) menggunakan stack berikut:

- **Runtime**: Bun
- **Framework**: ElysiaJS
- **ORM**: Drizzle ORM
- **Database**: MySQL

Project ini adalah REST API backend untuk mengelola layanan waxing salon, termasuk manajemen layanan, booking/reservasi, dan informasi pelanggan.

---

## Task 1: Project Initialization

- Inisialisasi project Bun baru di folder ini (`bun init`)
- Install dependencies:
  - `elysia` dan `@elysiajs/cors`
  - `drizzle-orm` dan `drizzle-kit`
  - `mysql2` (driver MySQL untuk Drizzle)
- Setup TypeScript config (`tsconfig.json`) yang kompatibel dengan Bun
- Buat file `.env` dan `.env.example` untuk menyimpan config database (host, port, user, password, db name)
- Tambahkan `.gitignore` (node_modules, .env, dist, dll)

---

## Task 2: Setup Database Connection & Drizzle Config

- Buat file `src/db/index.ts` untuk koneksi database MySQL menggunakan `mysql2` + Drizzle
- Buat file `drizzle.config.ts` di root untuk konfigurasi Drizzle Kit (migration, schema path, dll)
- Pastikan koneksi membaca credentials dari environment variables

---

## Task 3: Definisi Schema Database

Buat schema Drizzle di folder `src/db/schema/`. Tabel yang dibutuhkan:

### `services` — Daftar layanan waxing
- `id` (int, PK, auto increment)
- `name` (varchar) — nama layanan (contoh: "Brazilian Wax", "Underarm Wax")
- `description` (text, nullable)
- `price` (decimal) — harga layanan
- `duration_minutes` (int) — estimasi durasi dalam menit
- `is_active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `customers` — Data pelanggan
- `id` (int, PK, auto increment)
- `name` (varchar)
- `phone` (varchar)
- `email` (varchar, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `bookings` — Reservasi/booking
- `id` (int, PK, auto increment)
- `customer_id` (int, FK → customers)
- `service_id` (int, FK → services)
- `booking_date` (date)
- `booking_time` (time)
- `status` (enum: `pending`, `confirmed`, `completed`, `cancelled`)
- `notes` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

Setelah schema dibuat, generate dan jalankan migration menggunakan Drizzle Kit.

---

## Task 4: Setup ElysiaJS Server

- Buat entry point di `src/index.ts`
- Setup Elysia app dengan:
  - CORS plugin
  - Global error handler
  - Health check endpoint (`GET /health`)
- Server listen di port dari env variable (default: `3000`)

---

## Task 5: Buat API Routes (CRUD)

Organisasi routes di folder `src/routes/`. Setiap resource punya file route sendiri.

### `src/routes/services.ts`
- `GET /api/services` — list semua layanan aktif
- `GET /api/services/:id` — detail satu layanan
- `POST /api/services` — tambah layanan baru
- `PUT /api/services/:id` — update layanan
- `DELETE /api/services/:id` — soft delete (set `is_active = false`)

### `src/routes/customers.ts`
- `GET /api/customers` — list pelanggan
- `GET /api/customers/:id` — detail pelanggan
- `POST /api/customers` — tambah pelanggan baru
- `PUT /api/customers/:id` — update data pelanggan

### `src/routes/bookings.ts`
- `GET /api/bookings` — list semua booking (support filter by status, date)
- `GET /api/bookings/:id` — detail booking
- `POST /api/bookings` — buat booking baru
- `PUT /api/bookings/:id` — update booking (termasuk ubah status)
- `DELETE /api/bookings/:id` — cancel booking (set status = `cancelled`)

---

## Task 6: Request Validation

- Gunakan Elysia built-in validation (schema `t` dari `elysia`) untuk validasi body, params, dan query di setiap endpoint
- Pastikan semua input ter-validasi sebelum masuk ke logic / database

---

## Task 7: Scripts & Developer Experience

Tambahkan scripts di `package.json`:

```json
{
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "start": "bun run src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## Struktur Folder Akhir

```
website_waxing/
├── src/
│   ├── index.ts              # Entry point, setup Elysia
│   ├── db/
│   │   ├── index.ts          # Koneksi database
│   │   └── schema/
│   │       ├── services.ts
│   │       ├── customers.ts
│   │       └── bookings.ts
│   └── routes/
│       ├── services.ts
│       ├── customers.ts
│       └── bookings.ts
├── drizzle/                   # Auto-generated migrations
├── drizzle.config.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Notes

- Belum perlu authentication/authorization di tahap ini
- Belum perlu unit test, fokus ke fungsionalitas dulu
- Pastikan semua endpoint bisa ditest via REST client (Postman/Insomnia/curl)
- File lama (`index.html`, `style.css`, `script.js`) boleh dihapus karena project ini murni backend API
