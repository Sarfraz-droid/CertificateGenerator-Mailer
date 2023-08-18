import chalk from "chalk";
import Jimp from "jimp";
import * as path from "path";
import _ from "lodash";
import inquirer from "inquirer";

export class fontValues {
    static values = null;

    static resetValues() {
        this.values = null;
    }


    static async promptValues() {
        this.values = await inquirer.prompt([
            {
              type: "number",
              name: "X",
            },
            {
              type: "number",
              name: "Y",
            },
            {
              type: "list",
              name: "list",
              choices: ["right", "center", "left"],
            },
            {
              type: "number",
              name: "maxWidth",
            },
          ]);
    
    }
}

const gen_certs = async (head, para, _image) => {
//   console.log();
  const HeadFont = await Jimp.loadFont(
    path.resolve("assets/fonts/Halimun/helium.fnt")
  );
  const ParaFont = await Jimp.loadFont(
    path.resolve("assets/fonts/Parafont/ParaFont.fnt")
  );

  const image = await Jimp.read(path.resolve(_image));

  if (head) {
    console.log(`Header Info`);

    if (fontValues.values == null) {
        fontValues.promptValues()
    }

    const headerValues = fontValues.values

    const alignmentX = () => {
      switch (headerValues["list"]) {
        case "right":
          return Jimp.HORIZONTAL_ALIGN_RIGHT;
        case "center":
          return Jimp.HORIZONTAL_ALIGN_CENTER;
        case "left":
          return Jimp.HORIZONTAL_ALIGN_LEFT;
      }
    };

    console.log(headerValues);

    image.print(
      HeadFont,
      headerValues["X"],
      headerValues["Y"],
      {
        text: _.words(head).map(_.capitalize).join(" "),
        alignmentX: alignmentX(),
      },
      headerValues["maxWidth"]
    );
  }
  if (para != undefined) {
    image.print(
      ParaFont,
      3140 - 2002,
      1365,
      {
        text: para,
        alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
      },
      2000
    );
  }
  const filename = path.resolve(`assets/certs/${encodeURI(head)}.png`);
  image.write(filename);

  console.log(chalk.green(`Certificate generated - ${head} - ${para}`));

  return filename;
};

export default gen_certs;
