const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const prisma = require('./database');
const bcrypt = require('bcryptjs');

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    issuer: 'kosan-api',
    audience: 'kosan-client'
}, async (payload, done) => {
    try {
        const user = await prisma.users.findUnique({
            where: { user_id: payload.userId },
            select: {
                user_id: true,
                email: true,
                username: true,
                full_name: true,
                role: true,
                is_approved: true,
                is_guest: true,
                avatar: true
            }
        });

        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        console.error('❌ JWT Strategy Error:', error);
        return done(error, false);
    }
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.OAUTH_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    console.log('🔍 Google OAuth Strategy Called');
    console.log('📋 Profile ID:', profile.id);
    console.log('📧 Profile Email:', profile.emails?.[0]?.value);
    console.log('👤 Profile Name:', profile.displayName);

    try {
        let user = await prisma.users.findUnique({
            where: { google_id: profile.id }
        });

        if (user) {
            console.log('✅ Found existing Google user:', user.email);

            user = await prisma.users.update({
                where: { user_id: user.user_id },
                data: {
                    last_login: new Date(),
                    email_verified: true
                }
            });

            console.log('✅ Updated existing Google user');
            return done(null, user);
        }

        const existingUser = await prisma.users.findUnique({
            where: { email: profile.emails[0].value }
        });

        if (existingUser) {
            console.log('🔗 Linking Google account to existing user:', existingUser.email);

            user = await prisma.users.update({
                where: { user_id: existingUser.user_id },
                data: {
                    google_id: profile.id,
                    avatar: profile.photos[0]?.value,
                    email_verified: true,
                    last_login: new Date()
                }
            });

            console.log('✅ Google account linked successfully');
            return done(null, user);
        }

        console.log('👤 Creating new Google user');
        const username = await generateUniqueUsername(profile.emails[0].value.split('@')[0]);
        console.log('🏷️ Generated username:', username);

        user = await prisma.users.create({
            data: {
                email: profile.emails[0].value,
                username: username,
                full_name: profile.displayName,
                google_id: profile.id,
                role: 'PENGHUNI',
                avatar: profile.photos[0]?.value,
                email_verified: true,
                is_approved: true,
                last_login: new Date(),
                password: await bcrypt.hash(Math.random().toString(36), 12)
            }
        });

        console.log('✅ New Google user created:', user.email);
        return done(null, user);

    } catch (error) {
        console.error('❌ Google OAuth Strategy Error:', error);
        console.error('❌ Error Stack:', error.stack);
        return done(error, null);
    }
}));

async function generateUniqueUsername(baseUsername) {
    console.log('🏷️ Generating unique username for:', baseUsername);

    let username = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
    let counter = 1;

    while (await prisma.users.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
        console.log('🔄 Trying username:', username);
    }

    console.log('✅ Final username:', username);
    return username;
}

passport.serializeUser((user, done) => {
    console.log('📦 Serializing user:', user.user_id);
    done(null, user.user_id);
});

passport.deserializeUser(async (userId, done) => {
    console.log('📦 Deserializing user:', userId);
    try {
        const user = await prisma.users.findUnique({
            where: { user_id: userId }
        });

        if (user) {
            console.log('✅ User deserialized:', user.email);
        } else {
            console.log('❌ User not found during deserialization');
        }

        done(null, user);
    } catch (error) {
        console.error('❌ Deserialize error:', error);
        done(error, null);
    }
});

class PassportConfig {
    initialize() {
        console.log('🚀 Initializing Passport');
        return passport.initialize();
    }

    session() {
        console.log('🍪 Initializing Passport Session');
        return passport.session();
    }

    authenticateGoogle(options = {}) {
        console.log('🔐 Google Authentication Initiated');
        const defaultOptions = {
            scope: ['profile', 'email'],
            ...options
        };
        return passport.authenticate('google', defaultOptions);
    }

    authenticateGoogleCallback(options = {}) {
        console.log('🔄 Google Callback Authentication');
        const defaultOptions = {
            failureRedirect: '/api/v1/auth/google/failure',
            ...options
        };
        return passport.authenticate('google', defaultOptions);
    }
}

console.log('✅ Passport Configuration Complete');
module.exports = new PassportConfig();