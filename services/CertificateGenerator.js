import chalk from "chalk";
import { selectFiles } from "select-files-cli";
import { read_csv, write_csv } from "../utils/read_csv.js";
import inquirer from "inquirer";
import gen_certs from "./genCerts.js";

export const main = async () => {
  console.log(chalk.bold("Certificate Generator"));
  console.log(chalk.bold("======================"));
  const res = await inquirer.prompt({
    type: "list",
    name: "action",
    choices: ["Generate Certificate", "Generate Sample", "Exit"],
  });

  console.log(chalk.bold("Choose Image"));
  const files = await selectFiles({
    multi: false,
    startingPath: "./assets",
    directoryFilter: () => {
      return false;
    },
    fileFilter: (fileName) => {
      return fileName.endsWith(".png");
    },
  });

  if (files.selectedFiles.length === 0) {
    console.log(chalk.red("No files selected"));
    return;
  }

  const file = files.selectedFiles[0];
  let values;
  switch (res.action) {
    case "Generate Certificate":
      await generatorService(file);
      break;
    case "Generate Sample":
      values = await inquirer.prompt([
        {
          type: "input",
          name: "head",
          message: "Head",
        },
        {
          type: "input",
          name: "para",
          message: "Para",
        },
      ]);
      await gen_certs(values.head, values.para, file);
      break;
    case "Exit":
      return;
  }
};

const generatorService = async (image) => {
  console.log(chalk.blue("Choose File"));

  const files = await selectFiles({
    multi: false,
    startingPath: "./assets",
    directoryFilter: () => {
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

  console.log(chalk.green(`Selected file: ${file}`));

  const csv = await read_csv(file);
  console.log(csv);

  console.log(chalk.bgRed.white(Object.keys(csv[0]).join("\t")));
  csv.forEach((item) => {
    console.log(Object.values(item).join("\t"));
  });

  const res = await inquirer.prompt([
    {
      type: "list",
      name: "head",
      choices: Object.keys(csv[0]),
    },
    {
      type: "list",
      name: "para",
      choices: [...Object.keys(csv[0]), "none"],
    },
  ]);

  console.log(res);

  const new_csv = await Promise.all(
    csv.map(async (item) => {
      const path = await gen_certs(item[res.head], item[res?.para], image);
      console.log(path);

      return {
        ...item,
        path,
      };
    })
  );
  console.clear();
  console.log(chalk.bgWhite.black("!!Certificates Generated!!"));
  await write_csv(file, new_csv);
  console.log(chalk.bgWhite.black("!!CSV Updated!!"));
  console.log(new_csv);
};
