const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
)

module.exports = {
    client
}
// const { tokens } = await client.getToken(auth_code);

// const ticket = await client.verifyIdToken({
//       idToken: tokens.id_token,
//       audience: process.env.GOOGLE_CLIENT_ID
//     });

// const googleId = payload.sub;
//     const email = payload.email;
//     const name = payload.name;
//     const picture = payload.picture;