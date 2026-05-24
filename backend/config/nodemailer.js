const nodemailer = require("nodemailer");
const { google } = require("googleapis");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("GOOGLE_REFRESH_TOKEN exists:", !!process.env.GOOGLE_REFRESH_TOKEN);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function createTransporter() {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    console.log("ACCESS TOKEN:", accessToken?.token ? "GENERATED" : "FAILED");

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

  } catch (err) {
    console.error("OAUTH ERROR:", err);
    throw err;
  }
}

module.exports = createTransporter;