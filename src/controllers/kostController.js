const { pool } = require('../config/db');
const jwt = require('jsonwebtoken')

// Read User (Get all User)
const createKost = async (req, res) => {
    let client = null;
    
    try {
        client = await pool.connect();
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        await client.query("BEGIN");
        
        const {
            namaPemilik,
            namaKost,
            lokasi,
            jenisKost,
            jumlahKamar,
            nomorKamar,
            harga,
            hargaPertahun,
            fasilitasKamar,
            fasilitasKamarMandi,
            kebijakanProperti,
            kebijakanFasilitas,
            deskripsiProperti,
            informasiJarak,
            imageUrls,
            statusKamar = 'Tersedia',
            idPengguna = decoded.id
        } = req.body;

        const result = await client.query(
            `INSERT INTO public."Kamar_Kost" (
                "Nomor_Kamar", "Harga", "Fasilitas", "Foto_Kamar", "Status_Kamar", "ID_Pengguna",
                "Nama_Pemilik", "Nama_Kost", "Lokasi_Alamat", "Jenis_Kost", "Jumlah_Kamar",
                "Harga_Pertahun", "Fasilitas_Kamar_Mandi", "Kebijakan_Properti", 
                "Kebijakan_Fasilitas", "Deskripsi_Properti", "Informasi_Jarak"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING "ID_Kamar"`,
            [
                nomorKamar, 
                harga, 
                fasilitasKamar, 
                imageUrls, 
                statusKamar, 
                idPengguna,
                namaPemilik,
                namaKost,
                lokasi,
                jenisKost,
                jumlahKamar,
                hargaPertahun,
                fasilitasKamarMandi,
                kebijakanProperti,
                kebijakanFasilitas,
                deskripsiProperti,
                informasiJarak
            ]
        );

        const kamarId = result.rows[0].ID_Kamar;
        await client.query(
            `INSERT INTO public."Notifikasi" (
                "Judul_Notifikasi", "Isi_Notifikasi", "Tanggal_Waktu", "Jenis_Notifikasi", "ID_Referensi"
            ) VALUES ($1, $2, $3, $4, $5)`,
            [
                'Kamar Kost Baru Ditambahkan',
                `Kamar ${nomorKamar} di Kost ${namaKost} telah ditambahkan`,
                new Date(),
                'KAMAR_BARU',
                kamarId
            ]
        );
        
        await client.query('COMMIT');
        
        res.status(201).json({
            status: true,
            message: 'Kamar kost created successfully',
            data: { kamarId }
        });
    } catch (error) {
        console.error(error);
        
        if (client) {
            await client.query("ROLLBACK");
        }
        
        res.status(500).json({
            status: false,
            message: 'Error creating kost: ' + error.message
        });
    } finally {
        if (client) {
            client.release();
        }
    }
};

const getAllKost = async (req, res) => {
    let client = null;
    
    try {
        client = await pool.connect();
        const result = await client.query(`
            SELECT "Nama_Kost", "Lokasi_Alamat","ID_Pengguna", "Foto_Kamar"[1] as "Thumbnail" 
            FROM "Kamar_Kost" 
            WHERE "Terverifikasi" = \'1\' 
                AND "ID_Pengguna" IS NOT NULL`
        );
        
        res.status(200).json({
            status: true,
            message: 'Kost fetched successfully',
            data: result.rows
        });
    } catch (error) {
        console.error(error);
        
        res.status(500).json({
            status: false,
            message: 'Error fetching kost: ' + error.message
        });
    } finally {
        if (client) {
            client.release();
        }
    }
};

module.exports = { 
    createKost,
    getAllKost
};