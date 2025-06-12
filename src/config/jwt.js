const jwt = require('jsonwebtoken');

class JWTService {
    constructor() {
        this.secret = process.env.JWT_SECRET;
        this.refreshSecret = process.env.JWT_REFRESH_SECRET;
        this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
        this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

        if (!this.secret || !this.refreshSecret) {
            throw new Error('JWT secrets are required');
        }
    }

    generateTokens(payload) {
        const accessToken = jwt.sign(payload, this.secret, {
            expiresIn: this.expiresIn,
            issuer: 'kosan-api',
            audience: 'kosan-client'
        });

        const refreshToken = jwt.sign(payload, this.refreshSecret, {
            expiresIn: this.refreshExpiresIn,
            issuer: 'kosan-api',
            audience: 'kosan-client'
        });

        return { accessToken, refreshToken };
    }

    verifyAccessToken(token) {
        try {
            return jwt.verify(token, this.secret, {
                issuer: 'kosan-api',
                audience: 'kosan-client'
            });
        } catch (error) {
            throw new Error('Invalid access token');
        }
    }

    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, this.refreshSecret, {
                issuer: 'kosan-api',
                audience: 'kosan-client'
            });
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    decodeToken(token) {
        return jwt.decode(token);
    }
}

module.exports = new JWTService();