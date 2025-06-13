const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/errorHandler');

class JWTService {
    constructor() {
        this.accessTokenSecret = process.env.JWT_SECRET;
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
        this.accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
        this.refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        this.issuer = 'kosan-api';
        this.audience = 'kosan-client';

        if (!this.accessTokenSecret || !this.refreshTokenSecret) {
            throw new Error('JWT secrets are not configured');
        }
    }

    /**
     * Generate access and refresh tokens
     */
    generateTokens(payload) {
        const accessToken = jwt.sign(
            payload,
            this.accessTokenSecret,
            {
                expiresIn: this.accessTokenExpiresIn,
                issuer: this.issuer,
                audience: this.audience
            }
        );

        const refreshToken = jwt.sign(
            payload,
            this.refreshTokenSecret,
            {
                expiresIn: this.refreshTokenExpiresIn,
                issuer: this.issuer,
                audience: this.audience
            }
        );

        const decoded = jwt.decode(accessToken);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

        return {
            accessToken,
            refreshToken,
            expiresIn,
            tokenType: 'Bearer'
        };
    }

    /**
     * Verify access token
     */
    verifyAccessToken(token) {
        try {
            return jwt.verify(token, this.accessTokenSecret, {
                issuer: this.issuer,
                audience: this.audience
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new AppError('Access token has expired', 401);
            } else if (error.name === 'JsonWebTokenError') {
                throw new AppError('Invalid access token', 401);
            } else {
                throw new AppError('Token verification failed', 401);
            }
        }
    }

    /**
     * Verify refresh token
     */
    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, this.refreshTokenSecret, {
                issuer: this.issuer,
                audience: this.audience
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new AppError('Refresh token has expired', 401);
            } else if (error.name === 'JsonWebTokenError') {
                throw new AppError('Invalid refresh token', 401);
            } else {
                throw new AppError('Refresh token verification failed', 401);
            }
        }
    }

    /**
     * Generate access token only (for refresh endpoint)
     */
    generateAccessToken(payload) {
        return jwt.sign(
            payload,
            this.accessTokenSecret,
            {
                expiresIn: this.accessTokenExpiresIn,
                issuer: this.issuer,
                audience: this.audience
            }
        );
    }

    /**
     * Decode token without verification (for getting payload)
     */
    decodeToken(token) {
        return jwt.decode(token);
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(token) {
        try {
            const decoded = jwt.decode(token);
            if (!decoded || !decoded.exp) {
                return true;
            }
            return decoded.exp < Math.floor(Date.now() / 1000);
        } catch (error) {
            return true;
        }
    }
}

module.exports = new JWTService();