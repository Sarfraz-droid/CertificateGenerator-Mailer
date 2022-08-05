import chalk from "chalk";
import inquirer from "inquirer";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { get_csv, read_csv, write_csv } from "../utils/read_csv.js";
import { selectFiles } from "select-files-cli";

const OAuth2 = google.auth.OAuth2;
let token;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID, // ClientID
  process.env.CLIENT_SECRET, // Client Secret
  process.env.REDIRECT_URL // Redirect URL
);

const mailChoices = {
  Mail_Generated_Certificates: "Mail Generated Certificates",
  Mailer: "Mailer",
  Exit: "Exit",
};

export const main = async () => {
  console.clear();
  console.log(chalk.bold("Mailer"));
  console.log(chalk.bold("================="));
  console.log(Object.keys(mailChoices), Object.values(mailChoices));
  const res = await inquirer.prompt({
    type: "list",
    name: "action",

    choices: Object.values(mailChoices),
  });

  switch (res.action) {
    case mailChoices.Mail_Generated_Certificates:
      await mail_generated_certificates();
      break;

    case mailChoices.Mailer:
      await mailer();
  }
};

const generateAccessToken = async () => {
  token = JSON.parse(fs.readFileSync("token.json"));

  oauth2Client.setCredentials({
    refresh_token: token.refresh_token,
  });
  const accessToken = await oauth2Client.getAccessToken();

  return accessToken;
};

const get_body = async (option) => {

  console.log(option);
  let body = "";
  if(option === "Enter your message here"){
    body = await inquirer.prompt({
      type: "editor",
      name: "body",
    });
  }else{
    const bodyFile = await selectFiles({
      startingPath: "./assets",
      directoryFilter: (directoryName) => false,
      fileFilter: (fileName) => fileName.endsWith(".txt"),
      multi: false
    })

    // console.log(fs.readFileSync(path.resolve(bodyFile.selectedFiles[0]),"utf8"));

    if(bodyFile.selectedFiles.length > 0){
      body = fs.readFileSync(path.resolve(`./${bodyFile.selectedFiles[0]}`), "utf8");
    }
  }

  return body;

}

export const mailer = async () => {
  console.clear();
  console.log(chalk.bold("Mailer"));
  console.log(chalk.bold("================="));

  const accessToken = await generateAccessToken();

  const csv = await get_csv();

  const res = await inquirer.prompt([
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
      type: "list",
      name: "bodyOption",
      choices: [
          "Enter your message here",
          "Fetch from a .txt file",
      ]
    }
    // {
    //   type: "editor",
    //   name: "body",
    // },
  ]);
  const body = await get_body(res.bodyOption);
  const files = await selectFiles({
    startingPath: "./assets",
    name: "files",
    directoryFilter: (directoryName) => false,
  });

  const filesData = files.selectedFiles.map((file) => {
    return {
      filename: path.basename(file),
      path: path.resolve(file),
    };
  });

  for (let i = 0; i < csv.length; i++) {
    await sendMail(
      csv[i][res.name],
      csv[i][res.email],
      body,
      res.subject,
      filesData,
      accessToken
    );
  }
};

export const mail_generated_certificates = async () => {
  console.log(chalk.blue("\n\n\n"));
  console.log(chalk.bold("Welcome to the Mailer Service"));

  const accessToken = await generateAccessToken();

  console.log(chalk.greenBright("Choose CSV File"));
  const csv = await get_csv();

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
    // {
    //   type: "editor",
    //   name: "body",
    // },
    {
      type: "list",
      name: "bodyOption",
      choices: [
        "Enter your message here",
        "Fetch from a .txt file",
      ]
    }
  ]);

  const body = await get_body(res.bodyOption);
  for (let i = 0; i < csv.length; i++) {
    await sendMail(
      csv[i][res.name],
      csv[i][res.email],
      body,
      res.subject,
      {
        filename: `${csv[i][res.name]}.png`,
        path: csv[i][res.filepath],
      },
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
    user: process.env.user,
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
    from: process.env.user,
    to: email,
    subject: subject,
    text: message,
    html: `${message}`,
    attachments: attachment,
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
