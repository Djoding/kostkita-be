const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { client, _ } = require('../config/db');
const { validationResult } = require('express-validator')
const { client: googleClient } = require('../config/googleOauth')


const login = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
        const result = await client.query('SELECT * FROM "User" WHERE "Email" = $1', [email])
        console.log("result.rows", result.rows)
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        console.log("result.rows[0]", result.rows[0])
        const user = result.rows[0]
        const isMatch = await bcrypt.compare(password, user.Password)

        console.log("isMatch", isMatch)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const token = jwt.sign({ 
            id: user.ID_Pengguna,
            nama: user.Nama,
            email: user.Email,
            role: user.Role
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION })

        res.status(200).json({
            status: true,
            message: 'Login successful',
            token,
            user: {
                id: user.ID_Pengguna,
                name: user.Nama,
                email: user.Email,
                role: user.Role
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}



const register = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    const { name, email, password, role } = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await client.query(
            'INSERT INTO "User"("Nama", "Email", "Password", "Role") VALUES($1, $2, $3, $4) RETURNING *',
            [name, email, hashedPassword, role]
        )

        const user = result.rows[0]

        res.status(201).json({
            status: true,
            message: 'Registration successful',
            user: {
                id: user.ID_Pengguna,
                name: user.Nama,
                email: user.Email,
                role: user.Role
            }
        })
    } catch (error) {
        console.error(error)

        if (error.code === '23505') {
            return res.status(409).json({ message: 'Account already exists' })
        }

        res.status(500).json({ message: 'Server error' })
    }
}

const loginWithGoogle = async (req, res) => {
    

    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }
        
        const requestBody = req.body
        const ticket = await googleClient.verifyIdToken({
            idToken: requestBody.token,
            audience: process.env.GOOGLE_CLIENT_ID
        })

        const payload = ticket.getPayload()
        if (!payload) {
            return res.status(401).json({ message: 'Invalid token' })
        }

        console.log('Payload:', payload)
        const dataPayload = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
        }

        const result = await client.query('SELECT * FROM "User" WHERE "Email" = $1 AND "Role" = $2', [dataPayload.email, requestBody.role])
        if (result.rows.length > 0) {
            const user = result.rows[0]
            const token = jwt.sign({ 
                id: user.ID_Pengguna,
                nama: user.Nama,
                email: user.Email,
                role: user.Role
            }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION })

            return res.status(200).json({
                status: true,
                message: 'Login with Google successful',
                token,
                user: {
                    id: user.ID_Pengguna,
                    name: user.Nama,
                    email: user.Email,
                    role: user.Role
                }
            })
        }
        
        const defaultPassword = 'googleAccountYes'
        const hashedPassword = await bcrypt.hash(defaultPassword, 10)
        
        const resultInsert = await client.query(
            'INSERT INTO "User"("Nama", "Email", "Password", "Role", "IsGoogle", "PhotoUrl") VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
            [dataPayload.name, dataPayload.email, hashedPassword, requestBody.role, true, dataPayload.picture]
        )
        const user = resultInsert.rows[0]
        const token = jwt.sign({ 
            id: user.ID_Pengguna,
            nama: user.Nama,
            email: user.Email,
            role: user.Role
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION })
        res.status(201).json({
            status: true,
            message: 'Registration successful',
            token,
            user: {
                id: user.ID_Pengguna,
                name: user.Nama,
                email: user.Email,
                role: user.Role
            }
        })
        
    } catch (error) {
        console.error(error)

        if (error.code === '23505') {
            return res.status(409).json({ message: 'Account already exists' })
        }

        res.status(500).json({ message: 'Server error' })
    }
}

module.exports = {
    login,
    register,
    loginWithGoogle
}