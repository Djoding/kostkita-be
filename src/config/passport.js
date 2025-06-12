const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const prisma = require('./database');

// JWT Strategy
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
        return done(error, false);
    }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.OAUTH_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // check if user already exists
        let user = await prisma.users.findUnique({
            where: { google_id: profile.id }
        });

        if (user) {
            // update last login
            user = await prisma.users.update({
                where: { user_id: user.user_id },
                data: {
                    last_login: new Date(),
                    email_verified: true
                }
            });
            return done(null, user);
        }

        // check if email exists 
        const existingUser = await prisma.users.findUnique({
            where: { email: profile.emails[0].value }
        });

        if (existingUser) {
            // link google account to existing user
            user = await prisma.users.update({
                where: { user_id: existingUser.user_id },
                data: {
                    google_id: profile.id,
                    avatar: profile.photos[0]?.value,
                    email_verified: true,
                    last_login: new Date()
                }
            });
            return done(null, user);
        }

        // create new user
        const username = await generateUniqueUsername(profile.emails[0].value.split('@')[0]);

        user = await prisma.users.create({
            data: {
                email: profile.emails[0].value,
                username: username,
                full_name: profile.displayName,
                google_id: profile.id,
                role: 'PENGHUNI', // default role: Penghuni
                avatar: profile.photos[0]?.value,
                email_verified: true,
                is_approved: true, // auto-approve OAuth
                last_login: new Date()
            }
        });

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// helper function to generate unique username
async function generateUniqueUsername(baseUsername) {
    let username = baseUsername;
    let counter = 1;

    while (await prisma.users.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
    }

    return username;
}

passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (userId, done) => {
    try {
        const user = await prisma.users.findUnique({
            where: { user_id: userId }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;