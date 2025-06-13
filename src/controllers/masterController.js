const masterService = require('../services/masterService');
const { asyncHandler } = require('../middleware/errorHandler');

class MasterController {
    /**
     * Get all fasilitas
     */
    getFasilitas = asyncHandler(async (req, res) => {
        const { kategori } = req.query;
        const fasilitas = await masterService.getAllFasilitas(kategori);

        res.json({
            success: true,
            message: 'Fasilitas retrieved successfully',
            data: fasilitas
        });
    });

    /**
     * Get all tipe kamar
     */
    getTipeKamar = asyncHandler(async (req, res) => {
        const tipeKamar = await masterService.getAllTipeKamar();

        res.json({
            success: true,
            message: 'Tipe kamar retrieved successfully',
            data: tipeKamar
        });
    });

    /**
     * Get all peraturan
     */
    getPeraturan = asyncHandler(async (req, res) => {
        const { kategori } = req.query;
        const peraturan = await masterService.getAllPeraturan(kategori);

        res.json({
            success: true,
            message: 'Peraturan retrieved successfully',
            data: peraturan
        });
    });

    /**
     * Get all layanan laundry
     */
    getLayananLaundry = asyncHandler(async (req, res) => {
        const layanan = await masterService.getAllLayananLaundry();

        res.json({
            success: true,
            message: 'Layanan laundry retrieved successfully',
            data: layanan
        });
    });

    /**
     * Create fasilitas (Admin only)
     */
    createFasilitas = asyncHandler(async (req, res) => {
        const fasilitas = await masterService.createFasilitas(req.body);

        res.status(201).json({
            success: true,
            message: 'Fasilitas created successfully',
            data: fasilitas
        });
    });

    /**
     * Create tipe kamar (Admin only)
     */
    createTipeKamar = asyncHandler(async (req, res) => {
        const tipeKamar = await masterService.createTipeKamar(req.body);

        res.status(201).json({
            success: true,
            message: 'Tipe kamar created successfully',
            data: tipeKamar
        });
    });

    /**
     * Create peraturan (Admin only)
     */
    createPeraturan = asyncHandler(async (req, res) => {
        const peraturan = await masterService.createPeraturan(req.body);

        res.status(201).json({
            success: true,
            message: 'Peraturan created successfully',
            data: peraturan
        });
    });

    /**
     * Create layanan laundry (Admin only)
     */
    createLayananLaundry = asyncHandler(async (req, res) => {
        const layanan = await masterService.createLayananLaundry(req.body);

        res.status(201).json({
            success: true,
            message: 'Layanan laundry created successfully',
            data: layanan
        });
    });

    /**
     * Update fasilitas (Admin only)
     */
    updateFasilitas = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const fasilitas = await masterService.updateFasilitas(id, req.body);

        res.json({
            success: true,
            message: 'Fasilitas updated successfully',
            data: fasilitas
        });
    });

    /**
     * Delete fasilitas (Admin only)
     */
    deleteFasilitas = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await masterService.deleteFasilitas(id);

        res.json({
            success: true,
            message: 'Fasilitas deleted successfully'
        });
    });

    /**
     * Get master data summary (Admin only)
     */
    getMasterDataSummary = asyncHandler(async (req, res) => {
        const summary = await masterService.getMasterDataSummary();

        res.json({
            success: true,
            message: 'Master data summary retrieved successfully',
            data: summary
        });
    });

    /**
     * Get all master data (for mobile app)
     */
    getAllMasterData = asyncHandler(async (req, res) => {
        const [fasilitas, tipeKamar, peraturan, layananLaundry] = await Promise.all([
            masterService.getAllFasilitas(),
            masterService.getAllTipeKamar(),
            masterService.getAllPeraturan(),
            masterService.getAllLayananLaundry()
        ]);

        res.json({
            success: true,
            message: 'All master data retrieved successfully',
            data: {
                fasilitas,
                tipeKamar,
                peraturan,
                layananLaundry
            }
        });
    });
}

module.exports = new MasterController();