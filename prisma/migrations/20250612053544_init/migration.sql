-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PENGELOLA', 'PENGHUNI', 'TAMU');

-- CreateEnum
CREATE TYPE "FasilitasKategori" AS ENUM ('UMUM', 'KAMAR', 'KAMAR_MANDI', 'PARKIR');

-- CreateEnum
CREATE TYPE "PeraturanKategori" AS ENUM ('TIPE_KAMAR', 'KOST_UMUM');

-- CreateEnum
CREATE TYPE "KamarStatus" AS ENUM ('TERSEDIA', 'TERISI', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ReservasiStatus" AS ENUM ('PENDING_PAYMENT', 'WAITING_VALIDATION', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PenghuniStatus" AS ENUM ('AKTIF', 'KELUAR');

-- CreateEnum
CREATE TYPE "CateringKategori" AS ENUM ('MAKANAN_BERAT', 'SNACK', 'MINUMAN');

-- CreateEnum
CREATE TYPE "PesananCateringStatus" AS ENUM ('PENDING', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PesananLaundryStatus" AS ENUM ('ORDER', 'DITERIMA', 'PROSES', 'SELESAI', 'DIAMBIL');

-- CreateEnum
CREATE TYPE "MetodeBayar" AS ENUM ('QRIS', 'TRANSFER', 'CASH');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('PENDING', 'UPLOADED', 'VERIFIED', 'FAILED');

-- CreateTable
CREATE TABLE "master_fasilitas" (
    "fasilitas_id" UUID NOT NULL,
    "nama_fasilitas" VARCHAR(255) NOT NULL,
    "kategori" "FasilitasKategori" NOT NULL,
    "icon" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_fasilitas_pkey" PRIMARY KEY ("fasilitas_id")
);

-- CreateTable
CREATE TABLE "master_tipe_kamar" (
    "tipe_id" UUID NOT NULL,
    "nama_tipe" VARCHAR(100) NOT NULL,
    "ukuran" VARCHAR(50),
    "kapasitas" INTEGER NOT NULL,
    "deskripsi" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_tipe_kamar_pkey" PRIMARY KEY ("tipe_id")
);

-- CreateTable
CREATE TABLE "master_peraturan" (
    "peraturan_id" UUID NOT NULL,
    "nama_peraturan" VARCHAR(255) NOT NULL,
    "kategori" "PeraturanKategori" NOT NULL,
    "icon" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_peraturan_pkey" PRIMARY KEY ("peraturan_id")
);

-- CreateTable
CREATE TABLE "master_layanan_laundry" (
    "layanan_id" UUID NOT NULL,
    "nama_layanan" VARCHAR(255) NOT NULL,
    "satuan" VARCHAR(20) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_layanan_laundry_pkey" PRIMARY KEY ("layanan_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255),
    "role" "UserRole" NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "whatsapp_number" VARCHAR(20),
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_guest" BOOLEAN NOT NULL DEFAULT false,
    "google_id" TEXT,
    "avatar" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "kost" (
    "kost_id" UUID NOT NULL,
    "pengelola_id" UUID NOT NULL,
    "nama_kost" VARCHAR(255) NOT NULL,
    "alamat" TEXT NOT NULL,
    "gmaps_link" TEXT,
    "deskripsi" TEXT,
    "total_kamar" INTEGER NOT NULL,
    "daya_listrik" VARCHAR(50),
    "sumber_air" VARCHAR(100),
    "wifi_speed" VARCHAR(100),
    "kapasitas_parkir_motor" INTEGER NOT NULL DEFAULT 0,
    "kapasitas_parkir_mobil" INTEGER NOT NULL DEFAULT 0,
    "kapasitas_parkir_sepeda" INTEGER NOT NULL DEFAULT 0,
    "biaya_tambahan" DECIMAL(10,2),
    "jam_survey" VARCHAR(50),
    "foto_kost" JSONB DEFAULT '[]',
    "qris_image" TEXT,
    "rekening_info" JSONB,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kost_pkey" PRIMARY KEY ("kost_id")
);

-- CreateTable
CREATE TABLE "kamar" (
    "kamar_id" UUID NOT NULL,
    "kost_id" UUID NOT NULL,
    "tipe_id" UUID NOT NULL,
    "nomor_kamar" VARCHAR(20) NOT NULL,
    "harga_bulanan" DECIMAL(10,2) NOT NULL,
    "deposit" DECIMAL(10,2) NOT NULL,
    "foto_kamar" JSONB DEFAULT '[]',
    "status" "KamarStatus" NOT NULL DEFAULT 'TERSEDIA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kamar_pkey" PRIMARY KEY ("kamar_id")
);

-- CreateTable
CREATE TABLE "kost_fasilitas" (
    "kost_id" UUID NOT NULL,
    "fasilitas_id" UUID NOT NULL,

    CONSTRAINT "kost_fasilitas_pkey" PRIMARY KEY ("kost_id","fasilitas_id")
);

-- CreateTable
CREATE TABLE "kamar_fasilitas" (
    "kamar_id" UUID NOT NULL,
    "fasilitas_id" UUID NOT NULL,

    CONSTRAINT "kamar_fasilitas_pkey" PRIMARY KEY ("kamar_id","fasilitas_id")
);

-- CreateTable
CREATE TABLE "kost_peraturan" (
    "kost_id" UUID NOT NULL,
    "peraturan_id" UUID NOT NULL,
    "keterangan_tambahan" TEXT,

    CONSTRAINT "kost_peraturan_pkey" PRIMARY KEY ("kost_id","peraturan_id")
);

-- CreateTable
CREATE TABLE "kamar_peraturan" (
    "kamar_id" UUID NOT NULL,
    "peraturan_id" UUID NOT NULL,
    "keterangan_tambahan" TEXT,

    CONSTRAINT "kamar_peraturan_pkey" PRIMARY KEY ("kamar_id","peraturan_id")
);

-- CreateTable
CREATE TABLE "reservasi" (
    "reservasi_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "kamar_id" UUID NOT NULL,
    "tanggal_check_in" DATE NOT NULL,
    "durasi_bulan" INTEGER NOT NULL,
    "total_harga" DECIMAL(12,2) NOT NULL,
    "bukti_bayar" TEXT,
    "status" "ReservasiStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "metode_bayar" "MetodeBayar",
    "catatan" TEXT,
    "rejection_reason" TEXT,
    "validated_by" UUID,
    "validated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservasi_pkey" PRIMARY KEY ("reservasi_id")
);

-- CreateTable
CREATE TABLE "penghuni" (
    "penghuni_id" UUID NOT NULL,
    "reservasi_id" UUID NOT NULL,
    "tanggal_masuk" DATE NOT NULL,
    "tanggal_keluar" DATE,
    "deposit" DECIMAL(10,2) NOT NULL,
    "status" "PenghuniStatus" NOT NULL DEFAULT 'AKTIF',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penghuni_pkey" PRIMARY KEY ("penghuni_id")
);

-- CreateTable
CREATE TABLE "catering" (
    "catering_id" UUID NOT NULL,
    "kost_id" UUID NOT NULL,
    "nama_catering" VARCHAR(255) NOT NULL,
    "alamat" TEXT NOT NULL,
    "whatsapp_number" VARCHAR(20),
    "qris_image" TEXT,
    "rekening_info" JSONB,
    "is_partner" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catering_pkey" PRIMARY KEY ("catering_id")
);

-- CreateTable
CREATE TABLE "catering_menu" (
    "menu_id" UUID NOT NULL,
    "catering_id" UUID NOT NULL,
    "nama_menu" VARCHAR(255) NOT NULL,
    "kategori" "CateringKategori" NOT NULL,
    "harga" DECIMAL(8,2) NOT NULL,
    "foto_menu" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catering_menu_pkey" PRIMARY KEY ("menu_id")
);

-- CreateTable
CREATE TABLE "pesanan_catering" (
    "pesanan_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "menu_id" UUID NOT NULL,
    "jumlah_porsi" INTEGER NOT NULL DEFAULT 1,
    "total_harga" DECIMAL(8,2) NOT NULL,
    "status" "PesananCateringStatus" NOT NULL DEFAULT 'PENDING',
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pesanan_catering_pkey" PRIMARY KEY ("pesanan_id")
);

-- CreateTable
CREATE TABLE "pembayaran_catering" (
    "pembayaran_id" UUID NOT NULL,
    "pesanan_id" UUID NOT NULL,
    "jumlah" DECIMAL(8,2) NOT NULL,
    "metode" "MetodeBayar" NOT NULL,
    "bukti_bayar" TEXT,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'PENDING',
    "verified_by" UUID,
    "verified_at" TIMESTAMP(3),
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pembayaran_catering_pkey" PRIMARY KEY ("pembayaran_id")
);

-- CreateTable
CREATE TABLE "laundry" (
    "laundry_id" UUID NOT NULL,
    "kost_id" UUID NOT NULL,
    "nama_laundry" VARCHAR(255) NOT NULL,
    "alamat" TEXT NOT NULL,
    "whatsapp_number" VARCHAR(20),
    "qris_image" TEXT,
    "rekening_info" JSONB,
    "is_partner" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laundry_pkey" PRIMARY KEY ("laundry_id")
);

-- CreateTable
CREATE TABLE "laundry_harga" (
    "harga_id" UUID NOT NULL,
    "laundry_id" UUID NOT NULL,
    "layanan_id" UUID NOT NULL,
    "harga_per_satuan" DECIMAL(8,2) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laundry_harga_pkey" PRIMARY KEY ("harga_id")
);

-- CreateTable
CREATE TABLE "pesanan_laundry" (
    "pesanan_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "laundry_id" UUID NOT NULL,
    "detail_layanan" JSONB NOT NULL,
    "total_estimasi" DECIMAL(8,2) NOT NULL,
    "total_final" DECIMAL(8,2),
    "berat_actual" DECIMAL(5,2),
    "tanggal_antar" TIMESTAMP(3),
    "estimasi_selesai" TIMESTAMP(3),
    "status" "PesananLaundryStatus" NOT NULL DEFAULT 'ORDER',
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pesanan_laundry_pkey" PRIMARY KEY ("pesanan_id")
);

-- CreateTable
CREATE TABLE "pembayaran_laundry" (
    "pembayaran_id" UUID NOT NULL,
    "pesanan_id" UUID NOT NULL,
    "jumlah" DECIMAL(8,2) NOT NULL,
    "metode" "MetodeBayar" NOT NULL,
    "bukti_bayar" TEXT,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'PENDING',
    "verified_by" UUID,
    "verified_at" TIMESTAMP(3),
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pembayaran_laundry_pkey" PRIMARY KEY ("pembayaran_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "kamar_kost_id_nomor_kamar_key" ON "kamar"("kost_id", "nomor_kamar");

-- CreateIndex
CREATE UNIQUE INDEX "penghuni_reservasi_id_key" ON "penghuni"("reservasi_id");

-- CreateIndex
CREATE UNIQUE INDEX "pembayaran_catering_pesanan_id_key" ON "pembayaran_catering"("pesanan_id");

-- CreateIndex
CREATE UNIQUE INDEX "pembayaran_laundry_pesanan_id_key" ON "pembayaran_laundry"("pesanan_id");

-- AddForeignKey
ALTER TABLE "kost" ADD CONSTRAINT "kost_pengelola_id_fkey" FOREIGN KEY ("pengelola_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kamar" ADD CONSTRAINT "kamar_kost_id_fkey" FOREIGN KEY ("kost_id") REFERENCES "kost"("kost_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kamar" ADD CONSTRAINT "kamar_tipe_id_fkey" FOREIGN KEY ("tipe_id") REFERENCES "master_tipe_kamar"("tipe_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kost_fasilitas" ADD CONSTRAINT "kost_fasilitas_kost_id_fkey" FOREIGN KEY ("kost_id") REFERENCES "kost"("kost_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kost_fasilitas" ADD CONSTRAINT "kost_fasilitas_fasilitas_id_fkey" FOREIGN KEY ("fasilitas_id") REFERENCES "master_fasilitas"("fasilitas_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kamar_fasilitas" ADD CONSTRAINT "kamar_fasilitas_kamar_id_fkey" FOREIGN KEY ("kamar_id") REFERENCES "kamar"("kamar_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kamar_fasilitas" ADD CONSTRAINT "kamar_fasilitas_fasilitas_id_fkey" FOREIGN KEY ("fasilitas_id") REFERENCES "master_fasilitas"("fasilitas_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kost_peraturan" ADD CONSTRAINT "kost_peraturan_kost_id_fkey" FOREIGN KEY ("kost_id") REFERENCES "kost"("kost_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kost_peraturan" ADD CONSTRAINT "kost_peraturan_peraturan_id_fkey" FOREIGN KEY ("peraturan_id") REFERENCES "master_peraturan"("peraturan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kamar_peraturan" ADD CONSTRAINT "kamar_peraturan_kamar_id_fkey" FOREIGN KEY ("kamar_id") REFERENCES "kamar"("kamar_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kamar_peraturan" ADD CONSTRAINT "kamar_peraturan_peraturan_id_fkey" FOREIGN KEY ("peraturan_id") REFERENCES "master_peraturan"("peraturan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservasi" ADD CONSTRAINT "reservasi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservasi" ADD CONSTRAINT "reservasi_kamar_id_fkey" FOREIGN KEY ("kamar_id") REFERENCES "kamar"("kamar_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservasi" ADD CONSTRAINT "reservasi_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penghuni" ADD CONSTRAINT "penghuni_reservasi_id_fkey" FOREIGN KEY ("reservasi_id") REFERENCES "reservasi"("reservasi_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catering" ADD CONSTRAINT "catering_kost_id_fkey" FOREIGN KEY ("kost_id") REFERENCES "kost"("kost_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catering_menu" ADD CONSTRAINT "catering_menu_catering_id_fkey" FOREIGN KEY ("catering_id") REFERENCES "catering"("catering_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan_catering" ADD CONSTRAINT "pesanan_catering_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan_catering" ADD CONSTRAINT "pesanan_catering_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "catering_menu"("menu_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran_catering" ADD CONSTRAINT "pembayaran_catering_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "pesanan_catering"("pesanan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran_catering" ADD CONSTRAINT "pembayaran_catering_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laundry" ADD CONSTRAINT "laundry_kost_id_fkey" FOREIGN KEY ("kost_id") REFERENCES "kost"("kost_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laundry_harga" ADD CONSTRAINT "laundry_harga_layanan_id_fkey" FOREIGN KEY ("layanan_id") REFERENCES "master_layanan_laundry"("layanan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laundry_harga" ADD CONSTRAINT "laundry_harga_laundry_id_fkey" FOREIGN KEY ("laundry_id") REFERENCES "laundry"("laundry_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan_laundry" ADD CONSTRAINT "pesanan_laundry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan_laundry" ADD CONSTRAINT "pesanan_laundry_laundry_id_fkey" FOREIGN KEY ("laundry_id") REFERENCES "laundry"("laundry_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran_laundry" ADD CONSTRAINT "pembayaran_laundry_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "pesanan_laundry"("pesanan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran_laundry" ADD CONSTRAINT "pembayaran_laundry_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
