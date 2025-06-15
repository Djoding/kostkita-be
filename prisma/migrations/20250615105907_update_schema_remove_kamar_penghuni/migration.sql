/*
  Warnings:

  - The values [CASH] on the enum `MetodeBayar` will be removed. If these variants are still used in the database, this will fail.
  - The values [CONFIRMED,READY,COMPLETED,CANCELLED] on the enum `PesananCateringStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ORDER,SELESAI,DIAMBIL] on the enum `PesananLaundryStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_PAYMENT,WAITING_VALIDATION,EXPIRED] on the enum `ReservasiStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [UPLOADED,FAILED] on the enum `StatusPembayaran` will be removed. If these variants are still used in the database, this will fail.
  - The values [TAMU] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `kamar_id` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the `kamar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kamar_fasilitas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kamar_peraturan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `penghuni` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `harga_bulanan` to the `kost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `harga_final` to the `kost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipe_id` to the `kost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kost_id` to the `reservasi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MetodeBayar_new" AS ENUM ('QRIS', 'TRANSFER');
ALTER TABLE "reservasi" ALTER COLUMN "metode_bayar" TYPE "MetodeBayar_new" USING ("metode_bayar"::text::"MetodeBayar_new");
ALTER TABLE "pembayaran_catering" ALTER COLUMN "metode" TYPE "MetodeBayar_new" USING ("metode"::text::"MetodeBayar_new");
ALTER TABLE "pembayaran_laundry" ALTER COLUMN "metode" TYPE "MetodeBayar_new" USING ("metode"::text::"MetodeBayar_new");
ALTER TYPE "MetodeBayar" RENAME TO "MetodeBayar_old";
ALTER TYPE "MetodeBayar_new" RENAME TO "MetodeBayar";
DROP TYPE "MetodeBayar_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PesananCateringStatus_new" AS ENUM ('PENDING', 'PROSES', 'DITERIMA');
ALTER TABLE "pesanan_catering" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "pesanan_catering" ALTER COLUMN "status" TYPE "PesananCateringStatus_new" USING ("status"::text::"PesananCateringStatus_new");
ALTER TYPE "PesananCateringStatus" RENAME TO "PesananCateringStatus_old";
ALTER TYPE "PesananCateringStatus_new" RENAME TO "PesananCateringStatus";
DROP TYPE "PesananCateringStatus_old";
ALTER TABLE "pesanan_catering" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PesananLaundryStatus_new" AS ENUM ('PENDING', 'PROSES', 'DITERIMA');
ALTER TABLE "pesanan_laundry" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "pesanan_laundry" ALTER COLUMN "status" TYPE "PesananLaundryStatus_new" USING ("status"::text::"PesananLaundryStatus_new");
ALTER TYPE "PesananLaundryStatus" RENAME TO "PesananLaundryStatus_old";
ALTER TYPE "PesananLaundryStatus_new" RENAME TO "PesananLaundryStatus";
DROP TYPE "PesananLaundryStatus_old";
ALTER TABLE "pesanan_laundry" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReservasiStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "reservasi" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "reservasi" ALTER COLUMN "status" TYPE "ReservasiStatus_new" USING ("status"::text::"ReservasiStatus_new");
ALTER TYPE "ReservasiStatus" RENAME TO "ReservasiStatus_old";
ALTER TYPE "ReservasiStatus_new" RENAME TO "ReservasiStatus";
DROP TYPE "ReservasiStatus_old";
ALTER TABLE "reservasi" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StatusPembayaran_new" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
ALTER TABLE "pembayaran_catering" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "pembayaran_laundry" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "pembayaran_catering" ALTER COLUMN "status" TYPE "StatusPembayaran_new" USING ("status"::text::"StatusPembayaran_new");
ALTER TABLE "pembayaran_laundry" ALTER COLUMN "status" TYPE "StatusPembayaran_new" USING ("status"::text::"StatusPembayaran_new");
ALTER TYPE "StatusPembayaran" RENAME TO "StatusPembayaran_old";
ALTER TYPE "StatusPembayaran_new" RENAME TO "StatusPembayaran";
DROP TYPE "StatusPembayaran_old";
ALTER TABLE "pembayaran_catering" ALTER COLUMN "status" SET DEFAULT 'PENDING';
ALTER TABLE "pembayaran_laundry" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'PENGELOLA', 'PENGHUNI');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "kamar" DROP CONSTRAINT "kamar_kost_id_fkey";

-- DropForeignKey
ALTER TABLE "kamar" DROP CONSTRAINT "kamar_tipe_id_fkey";

-- DropForeignKey
ALTER TABLE "kamar_fasilitas" DROP CONSTRAINT "kamar_fasilitas_fasilitas_id_fkey";

-- DropForeignKey
ALTER TABLE "kamar_fasilitas" DROP CONSTRAINT "kamar_fasilitas_kamar_id_fkey";

-- DropForeignKey
ALTER TABLE "kamar_peraturan" DROP CONSTRAINT "kamar_peraturan_kamar_id_fkey";

-- DropForeignKey
ALTER TABLE "kamar_peraturan" DROP CONSTRAINT "kamar_peraturan_peraturan_id_fkey";

-- DropForeignKey
ALTER TABLE "penghuni" DROP CONSTRAINT "penghuni_reservasi_id_fkey";

-- DropForeignKey
ALTER TABLE "reservasi" DROP CONSTRAINT "reservasi_kamar_id_fkey";

-- AlterTable
ALTER TABLE "kost" ADD COLUMN     "deposit" DECIMAL(10,2),
ADD COLUMN     "harga_bulanan" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "harga_final" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "tipe_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "pesanan_laundry" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "reservasi" DROP COLUMN "kamar_id",
ADD COLUMN     "deposit_amount" DECIMAL(10,2),
ADD COLUMN     "kost_id" UUID NOT NULL,
ADD COLUMN     "status_penghunian" "PenghuniStatus",
ADD COLUMN     "tanggal_keluar" DATE,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- DropTable
DROP TABLE "kamar";

-- DropTable
DROP TABLE "kamar_fasilitas";

-- DropTable
DROP TABLE "kamar_peraturan";

-- DropTable
DROP TABLE "penghuni";

-- DropEnum
DROP TYPE "KamarStatus";

-- AddForeignKey
ALTER TABLE "kost" ADD CONSTRAINT "kost_tipe_id_fkey" FOREIGN KEY ("tipe_id") REFERENCES "master_tipe_kamar"("tipe_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservasi" ADD CONSTRAINT "reservasi_kost_id_fkey" FOREIGN KEY ("kost_id") REFERENCES "kost"("kost_id") ON DELETE CASCADE ON UPDATE CASCADE;
