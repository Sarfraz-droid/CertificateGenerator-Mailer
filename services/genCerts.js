import chalk from "chalk";
import Jimp from "jimp";
import * as path from "path";
import _ from 'lodash'

const gen_certs = async (head, para, _image) => {
    console.log();
    const HeadFont = await Jimp.loadFont(
        path.resolve("assets/fonts/HeadFont/HeadFont.fnt")
    );
    const ParaFont = await Jimp.loadFont(
        path.resolve("assets/fonts/Parafont/ParaFont.fnt")
    );

    const image = await Jimp.read(path.resolve(_image));

    if (head) {
        image.print(
            HeadFont,
            0,
            1130,
            {
                text: _.words(head).map(_.capitalize).join(' '),
                alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
            },
            3140
        );
    }
    if (para) {
        image.print(
            ParaFont,
            3140 - 2002,
            1365,
            {
                text: _.words(para).map(_.capitalize).join(' '),
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