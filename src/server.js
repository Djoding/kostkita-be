require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const kostRoutes = require('./routes/kostRoutes')
//api/auth/login -> username, password
app.use(cors())
app.use(express.json()); 
app.use('/api/user', userRoutes); 
app.use('/api/kost', kostRoutes)
app.use('/api', authRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});