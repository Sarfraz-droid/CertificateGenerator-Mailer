import chalk from "chalk";
import inquirer from "inquirer";
import "dotenv/config";
import inquirerfilepath from "inquirer-file-path";
import { main as mainCertGen } from "./services/certificateGenerator.js";
import { main as mainOauth } from "./services/mailer.js";

inquirer.registerPrompt("filePath", inquirerfilepath);

const init = async () => {
  chalk.green("Starting mailer...");

  console.log(chalk.bold("IEEE JMI Mailer"));
  console.log(chalk.bold("================="));
  console.log(chalk.bgBlack.white("To Generate OAuth token run npm run oauth"));
  console.log(chalk.blue("2. Generate Certificates"));
  console.log(chalk.blue("3. Send Mail"));
};

await init();

const getValues = async () => {
  const name = await inquirer.prompt({
    type: "number",
    name: "choice",
    message: "choose an option",
  });

  console.log(name);

  return name.choice;
};

const res = await getValues();

const choiceTaker = async (res) => {
  let temp;
  switch (res) {
    case 2:
      console.clear();
      await mainCertGen();
      break;
    case 3:
      console.clear();
      console.log(chalk.bold("Send Mail"));
      await mainOauth();
      break;

    default:
      console.clear();
      console.log(chalk.red("Invalid option"));
      await init();
      temp = await getValues();
      await choiceTaker(temp);
      break;
  }
  const { again } = await inquirer.prompt({
    type: "confirm",
    name: "again",
    message: "Do you want to continue?",
  });

  if (again) {
    console.clear();
    await init();
    const temp = await getValues();
    await choiceTaker(temp);
  }
};

await choiceTaker(res);
