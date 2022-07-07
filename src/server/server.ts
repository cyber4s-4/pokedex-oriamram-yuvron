import express, { Request, Response } from "express";
import { json } from "body-parser";
// import cookieParser from "cookie-parser";
import path from "path";

const app = express();

// app.use(cookieParser());
app.use(json());

app.use(express.static(path.join(__dirname, "../client"), { extensions: ["html"] }));

// eslint-disable-next-line no-console
app.listen(3000, () => console.log("listening on port 3000"));
