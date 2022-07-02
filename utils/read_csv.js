import csv from "csv-parser";
import converter from "json-2-csv";
import fs from "fs";
import { selectFiles } from "select-files-cli";

export const get_csv = async () => {
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

  return csv;
};

export const read_csv = async (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        return resolve(results);
      })
      .on("error", (err) => {
        return reject(err);
      });
  });
};

export const write_csv = async (filePath, data) => {
  return new Promise((resolve, reject) => {
    converter.json2csv(data, (err, csv) => {
      if (err) {
        return reject(err);
      }
      fs.writeFile(filePath, csv, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  });
};
