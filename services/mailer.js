import chalk from "chalk";
import inquirer from "inquirer";
import path from "path";
import { get_csv } from "../utils/read_csv.js";
import { selectFiles } from "select-files-cli";
import { generateAccessToken } from "../utils/generateAccessToken.js";
import { sendMail } from "../utils/sendMail.js";
import { getBodyData, getMailPrompts } from "../utils/mailer-utils.js";


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
  console.clear();

  console.log(chalk.blue("\n\n\n"));
  console.log(chalk.bold("Welcome to the Mailer Service"));


  switch (res.action) {
    case mailChoices.Mail_Generated_Certificates:
      await mail_generated_certificates();
      break;

    case mailChoices.Mailer:
      await mailer();
  }
};


/**
 * @description Custom Mailer
 */
export const mailer = async () => {
  const accessToken = await generateAccessToken();
  const csv = await get_csv();
  const res = await getMailPrompts(csv);
  const body = await getBodyData(res.bodyOption);
  const files = await selectFiles({
    startingPath: "./assets",
    name: "files",
    directoryFilter: () => false,
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

/**
 * @description Mail Generated Certificates
 */
export const mail_generated_certificates = async () => {
  const accessToken = await generateAccessToken();
  const csv = await get_csv();
  const res = await getMailPrompts(csv, true);
  const body = await getBodyData(res.bodyOption);
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

