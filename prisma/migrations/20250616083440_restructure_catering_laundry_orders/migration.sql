/*
  Warnings:

  - You are about to drop the column `jumlah_porsi` on the `pesanan_catering` table. All the data in the column will be lost.
  - You are about to drop the column `menu_id` on the `pesanan_catering` table. All the data in the column will be lost.
  - You are about to drop the column `detail_layanan` on the `pesanan_laundry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "pesanan_catering" DROP CONSTRAINT "pesanan_catering_menu_id_fkey";

-- AlterTable
ALTER TABLE "pesanan_catering" DROP COLUMN "jumlah_porsi",
DROP COLUMN "menu_id";

-- AlterTable
ALTER TABLE "pesanan_laundry" DROP COLUMN "detail_layanan";

-- CreateTable
CREATE TABLE "detail_pesanan_catering" (
    "detail_id" UUID NOT NULL,
    "pesanan_id" UUID NOT NULL,
    "menu_id" UUID NOT NULL,
    "jumlah_porsi" INTEGER NOT NULL,
    "harga_satuan" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "detail_pesanan_catering_pkey" PRIMARY KEY ("detail_id")
);

-- CreateTable
CREATE TABLE "detail_pesanan_laundry" (
    "detail_id" UUID NOT NULL,
    "pesanan_id" UUID NOT NULL,
    "layanan_id" UUID NOT NULL,
    "jumlah_satuan" INTEGER NOT NULL,
    "harga_per_satuan" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "detail_pesanan_laundry_pkey" PRIMARY KEY ("detail_id")
);

-- AddForeignKey
ALTER TABLE "detail_pesanan_catering" ADD CONSTRAINT "detail_pesanan_catering_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "pesanan_catering"("pesanan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_pesanan_catering" ADD CONSTRAINT "detail_pesanan_catering_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "catering_menu"("menu_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_pesanan_laundry" ADD CONSTRAINT "detail_pesanan_laundry_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "pesanan_laundry"("pesanan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_pesanan_laundry" ADD CONSTRAINT "detail_pesanan_laundry_layanan_id_fkey" FOREIGN KEY ("layanan_id") REFERENCES "master_layanan_laundry"("layanan_id") ON DELETE CASCADE ON UPDATE CASCADE;
