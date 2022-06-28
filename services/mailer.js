import chalk from "chalk";
import inquirer from "inquirer";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { read_csv, write_csv } from "../utils/read_csv.js";
import { selectFiles } from "select-files-cli";

const OAuth2 = google.auth.OAuth2;
let token;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID, // ClientID
  process.env.CLIENT_SECRET, // Client Secret
  process.env.REDIRECT_URL // Redirect URL
);

export const main = async () => {
  console.log(chalk.blue("\n\n\n"));
  console.log(chalk.bold("Welcome to the Mailer Service"));

  token = JSON.parse(fs.readFileSync("token.json"));

  oauth2Client.setCredentials({
    refresh_token: token.refresh_token,
  });
  const accessToken = await oauth2Client.getAccessToken();

  console.log(chalk.greenBright("Choose CSV File"));
  const files = await selectFiles({
    multi: false,
    startingPath: "./assets",
    directoryFilter: (directoryName) => {
      return false;
    },
    fileFilter: (fileName) => {
      return fileName.endsWith(".csv");
    },
  });

  if (files.selectedFiles.length === 0) {
    console.log(chalk.red("No files selected"));
    return;
  }

  const file = files.selectedFiles[0];
  const csv = await read_csv(file);

  const res = await inquirer.prompt([
    {
      type: "list",
      name: "filepath",
      choices: Object.keys(csv[0]),
    },
    {
      type: "list",
      name: "name",
      choices: Object.keys(csv[0]),
    },
    {
      type: "list",
      name: "email",
      choices: Object.keys(csv[0]),
    },
    {
      type: "input",
      name: "subject",
      message: "Subject",
    },
    {
      type: "editor",
      name: "body",
    },
  ]);

  console.log(`Token: ${chalk.greenBright(token.access_token)}`);

  for (let i = 0; i < csv.length; i++) {
    await sendMail(
      csv[i][res.name],
      csv[i][res.email],
      res.body,
      res.subject,
      csv[i][res.filepath],
      accessToken
    );
  }
};

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
    user: "ieeejmiteam@gmail.com",
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: token.refresh_token,
    accessToken: accessToken.token,
  };

  console.log(chalk.greenBright(`Sending Mail to ${email}`));

  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: oauth,
  });

  const mailOptions = {
    from: "ieeejmiteam@gmail.com",
    to: email,
    subject: subject,
    text: message,
    html: `<b>${message}</b>`,
    attachments: [
      {
        filename: `${name}.png`,
        path: attachment,
      },
    ],
  };

  return new Promise(async (resolve, reject) => {
    try {
      const res = await smtpTransport.sendMail(mailOptions);
      console.log(
        `Message sent to ${chalk.redBright(email)}: %s`,
        res.messageId
      );
      resolve(res);
    } catch (err) {
      console.log("ERROR SENDING MAIL!", err);
      reject(err);
    }
  });
}
