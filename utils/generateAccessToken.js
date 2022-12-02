import fs from 'fs'
import { google } from "googleapis";


const OAuth2 = google.auth.OAuth2;
let token;
const oauth2Client = new OAuth2(
    process.env.CLIENT_ID, // ClientID
    process.env.CLIENT_SECRET, // Client Secret
    process.env.REDIRECT_URL // Redirect URL
);

export const generateAccessToken = async () => {
    token = JSON.parse(fs.readFileSync("token.json"));

    oauth2Client.setCredentials({
        refresh_token: token.refresh_token,
    });
    const accessToken = await oauth2Client.getAccessToken();

    return accessToken;
};

export const getRefreshToken = () => token;

