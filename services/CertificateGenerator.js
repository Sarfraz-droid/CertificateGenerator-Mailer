import chalk from "chalk";
import { selectFiles } from "select-files-cli";
import Jimp from "jimp";
import * as path from "path";

import { read_csv, write_csv } from "../utils/read_csv.js";
import inquirer from "inquirer";

export const main = async () => {
  console.log(chalk.bold("Certificate Generator"));
  console.log(chalk.bold("======================"));

  console.log(chalk.blue("Choose File"));

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
      choices: Object.keys(csv[0]),
    },
  ]);

  console.log(res);

  const new_csv = await Promise.all(
    csv.map(async (item) => {
      const path = await gen_certs(item[res.head], item[res.para]);
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

const gen_certs = async (head, para) => {
  console.log();
  const HeadFont = await Jimp.loadFont(
    path.resolve("assets/fonts/HeadFont/HeadFont.fnt")
  );
  const ParaFont = await Jimp.loadFont(
    path.resolve("assets/fonts/Parafont/ParaFont.fnt")
  );

  const image = await Jimp.read(path.resolve("assets/Template.png"));

  image.print(
    HeadFont,
    0,
    1130,
    {
      text: head,
      alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
    },
    3140
  );
  image.print(
    ParaFont,
    0,
    1360,
    {
      text: para,
      alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
    },
    3140
  );

  const filename = path.resolve(`assets/certs/${encodeURI(head)}.png`);
  image.write(filename);

  console.log(chalk.green(`Certificate generated - ${head} - ${para}`));

  return filename;
};
