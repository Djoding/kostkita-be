// db.js
const { Client, Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};


const client = new Client(dbConfig);

client.connect()
    .then(() => console.log('Client connected to database'))
    .catch(err => console.error('Client connection error', err));

const pool = new Pool(dbConfig);

module.exports = {
    client,
    pool
};