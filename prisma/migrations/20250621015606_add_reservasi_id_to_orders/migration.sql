-- AlterTable
ALTER TABLE "pesanan_catering" ADD COLUMN     "reservasi_id" UUID;

-- AlterTable
ALTER TABLE "pesanan_laundry" ADD COLUMN     "reservasi_id" UUID;

-- AddForeignKey
ALTER TABLE "pesanan_catering" ADD CONSTRAINT "pesanan_catering_reservasi_id_fkey" FOREIGN KEY ("reservasi_id") REFERENCES "reservasi"("reservasi_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan_laundry" ADD CONSTRAINT "pesanan_laundry_reservasi_id_fkey" FOREIGN KEY ("reservasi_id") REFERENCES "reservasi"("reservasi_id") ON DELETE SET NULL ON UPDATE CASCADE;
