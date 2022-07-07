import express, { Request, Response } from "express";
import { json } from "body-parser";
// import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";

const POKEMONS_AMOUNT = 151;
const POKEMONS_PATH = path.join(__dirname, "../../data/pokemons.json");
const pokemons = JSON.parse(fs.readFileSync(POKEMONS_PATH, "utf8"));

const app = express();
// app.use(cookieParser());
app.use(json());
app.use(express.static(path.join(__dirname, "../client"), { extensions: ["html"] }));
app.get("/api/:id", (req: Request, res: Response) => {
	const id = +req.params.id;
	if (id < 1 || id > POKEMONS_AMOUNT) res.send(404);
	else res.send(JSON.stringify(pokemons[id - 1]));
});
app.listen(3000, () => console.log("listening on port 3000"));
