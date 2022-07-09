import express, { Request, Response } from "express";
import { json } from "body-parser";
import path from "path";
import fs from "fs";

const POKEMONS_AMOUNT = 151;
const POKEMONS_PATH = path.join(__dirname, "../../data/pokemons.json");
const STAR_PATH = path.join(__dirname, "../../data/star.json");
const pokemons = JSON.parse(fs.readFileSync(POKEMONS_PATH, "utf8"));
let star = JSON.parse(fs.readFileSync(STAR_PATH, "utf8"));

const app = express();
app.use(json());
app.use(express.static(path.join(__dirname, "../client"), { extensions: ["html"] }));
app.get("/api/star", (req: Request, res: Response) => {
	res.send(JSON.stringify(star));
});
app.post("/api/star", (req: Request, res: Response) => {
	star = req.body;
	fs.writeFileSync(STAR_PATH, JSON.stringify(star));
	res.sendStatus(201);
});
app.delete("/api/star", (req: Request, res: Response) => {
	star = {};
	fs.writeFileSync(STAR_PATH, JSON.stringify(star));
	res.sendStatus(204);
});
app.get("/api/:id", (req: Request, res: Response) => {
	const id = +req.params.id;
	if (id < 1 || id > POKEMONS_AMOUNT) res.sendStatus(404);
	else res.send(JSON.stringify(pokemons[id - 1]));
});
app.listen(3000, () => console.log("listening on port 3000"));
