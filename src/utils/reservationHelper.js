const prisma = require('../config/database');

class ReservationHelper {
    /**
     * Get active reservation ID for a user
     */
    static async getActiveReservationId(userId) {
        const currentDate = new Date();

        const activeReservation = await prisma.reservasi.findFirst({
            where: {
                user_id: userId,
                status: 'APPROVED',
                tanggal_check_in: {
                    lte: currentDate
                },
                OR: [
                    { tanggal_keluar: null },
                    { tanggal_keluar: { gte: currentDate } },
                    { status_penghunian: 'AKTIF' }
                ]
            },
            select: {
                reservasi_id: true
            },
            orderBy: { tanggal_check_in: 'desc' }
        });

        return activeReservation?.reservasi_id || null;
    }
}

module.exports = ReservationHelper;