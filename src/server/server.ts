import express, { Request, Response } from "express";
import { json } from "body-parser";
import path from "path";
import fs from "fs";
const { MongoClient, ServerApiVersion } = require("mongodb");
const mongo = require("mongodb");
const uri = "mongodb+srv://user:123@pokedex.pdhqb.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
let db;
let collection;
onLoad();
async function onLoad() {
	await client.connect();
	db = await client.db("pokedex");
	collection = await db.collection("all_pokemons");
}
const PORT = process.env.PORT || 3000;
// const POKEMONS_PATH = path.join(__dirname, "../../data/originalPokemons.json");
const STAR_PATH = path.join(__dirname, "../../data/star.json");
// const pokemons = JSON.parse(fs.readFileSync(POKEMONS_PATH, "utf8"));
let star = JSON.parse(fs.readFileSync(STAR_PATH, "utf8"));

const app = express();
app.use(json());
// Serves static files
app.use(express.static(path.join(__dirname, "../client"), { extensions: ["html"] }));

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
	res.send(JSON.stringify(await collection.find({}).toArray()));
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
