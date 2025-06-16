const kostService = require('../services/kostService');
const { asyncHandler } = require('../middleware/errorHandler');

class KostController{

    /**
     * get All Kost
     */
    getKost = asyncHandler(async (req, res) => {
        const {nama_kost} = req.query;
        const kost = await kostService.getAllKost(nama_kost);
        res.json({
            success: true,
            message: 'Kost retrieved successfully',
            data: kost
        });
    });

    /**
     * Create Kost
     */
    createKost = asyncHandler(async (req, res) => {
        const data = req.body;
        const kost = await kostService.createKost(data);
        res.json({
            success: true,
            message: 'Kost created successfully',
            data: kost
        });
    });

    /**
     * Update Kost
     */
    updateKost = asyncHandler(async (req, res) => {
        const {kost_id} = req.params;
        const data = req.body;
        const kost = await kostService.updateKost(kost_id, data);
        res.json({
            success: true,
            message: 'Kost updated successfully',
            data: kost
        });
    });


    /**
     * Delete Kost
     */

    deleteKost = asyncHandler(async (req, res) => {
        const {kost_id} = req.params;
        await kostService.deleteKost(kost_id);
        res.json({
            success: true,
            message: 'Kost deleted successfully'
        });
    });
}