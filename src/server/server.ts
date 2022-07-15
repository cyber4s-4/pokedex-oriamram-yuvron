import express, { Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import path from "path";
import fs from "fs";
import { MongoManager } from "./mongo";

const PORT = process.env.PORT || 3000;
const STAR_PATH = path.join(__dirname, "../../data/star.json");
let star = JSON.parse(fs.readFileSync(STAR_PATH, "utf8"));

const mongoManager = new MongoManager();

const app = express();

app.use(json());
// Serves static files
app.use(express.static(path.join(__dirname, "../client"), { extensions: ["html"] }));

app.use("*", (req: Request, res: Response, next: NextFunction) => {
	if (mongoManager.isLive()) next();
	else res.sendStatus(500);
});

// Handles a request to get the currently starred pokemon
app.get("/api/star", (req: Request, res: Response) => {
	res.send(JSON.stringify(star));
});

// Handles a request to update the currently starred pokemon
app.post("/api/star", (req: Request, res: Response) => {
	star = req.body;
	fs.writeFileSync(STAR_PATH, JSON.stringify(star));
	res.sendStatus(201);
});

// Handles a request to delete the currently starred pokemon
app.delete("/api/star", (req: Request, res: Response) => {
	star = {};
	fs.writeFileSync(STAR_PATH, JSON.stringify(star));
	res.sendStatus(204);
});

// Handles a request to get all the pokemons
app.get("/api/pokemons", async (req: Request, res: Response) => {
	res.status(200).json(await mongoManager.getAllPokemons());
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
