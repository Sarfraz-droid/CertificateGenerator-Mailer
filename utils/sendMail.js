import chalk from "chalk";
import { getRefreshToken } from "./generateAccessToken.js";
import nodemailer from "nodemailer";

export async function sendMail(
    name,
    email,
    message,
    subject,
    attachment,
    accessToken
) {
    const oauth = {
        type: "OAuth2",
        user: process.env.user,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: getRefreshToken(),
        accessToken: accessToken.token,
    };

    console.log(chalk.greenBright(`Sending Mail to ${email}`));

    const smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: oauth,
    });

    const mailOptions = {
        from: process.env.user,
        to: email,
        subject: subject,
        text: message,
        html: `${message}`,
        attachments: attachment,
    };

    return new Promise((resolve, reject) => {
        try {
            smtpTransport.sendMail(mailOptions).then((res) => {
                console.log(
                    `Message sent to ${chalk.redBright(email)}: %s`,
                    res.messageId
                );
                resolve(res);
            })
        } catch (err) {
            console.log("ERROR SENDING MAIL!", err);
            reject(err);
        }
    });
}
