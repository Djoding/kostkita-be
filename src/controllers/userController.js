const { client, pool } = require('../config/db');

// Read User (Get all User)
const getUser = async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM "User"');
        res.status(200).json(result.rows); // Mengembalikan semua pengguna
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching User');
    }
};

// Get User by ID
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT * FROM "User" WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(result.rows[0]); // Mengembalikan data pengguna yang ditemukan
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching user');
    }
};

// Update User
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    try {
        const result = await client.query(
            'UPDATE "User" SET "Nama" = $1, "Email" = $2, "Password" = $3 WHERE "ID_Pengguna" = $4 RETURNING *',
            [name, email, password, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(result.rows[0]); // Mengembalikan data pengguna yang sudah diperbarui
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating user');
    }
};

// Delete User
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('DELETE FROM "User" WHERE ID_Pengguna = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).send('User not found');
        }
        res.status(200).json({ message: 'User deleted successfully' }); // Mengonfirmasi penghapusan
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting user');
    }
};

const test = async (req, res) => {
    try {
        // const result = await client.query('SELECT * FROM User');
        res.status(200).json("Ok"); // Mengembalikan semua pengguna
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching User');
    }
};

module.exports = { test, getUser, getUserById, updateUser, deleteUser};