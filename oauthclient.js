import "dotenv/config"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import express from "express";
import { runAuth } from "./OAuth/GetToken.js";
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static("public"));
app.set("view engine", "ejs");

runAuth();

app.get("/", (req, res) => {
  res.json(req.query);
});

app.listen(process.env.PORT || 8001, function (req, res) {
  console.log("listening on port 8001");
});
