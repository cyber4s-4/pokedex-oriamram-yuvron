import express, { Request, Response, NextFunction } from "express";
import { json, text } from "body-parser";
import path from "path";
import { MongoManager } from "./mongo";

const PORT = process.env.PORT || 3000;
const mongoManager = new MongoManager();
const app = express();

app.use(text());
app.use(json());

// Serves static files
app.use(express.static(path.join(__dirname, "../client"), { extensions: ["html"] }));

app.use("*", (req: Request, res: Response, next: NextFunction) => {
	console.log(`${req.method}: ${req.originalUrl}`);
	if (mongoManager.isLive()) next();
	else res.sendStatus(500);
});

// GET request to get all the pokemons
app.get("/api/pokemons", async (req: Request, res: Response) => {
	res.status(200).json(await mongoManager.getAllPokemons());
});

// GET request to create a new user and receive a token
app.get("/api/register", async (req: Request, res: Response) => {
	const newToken = await mongoManager.createUser();
	res.send(newToken);
});

// GET request to get the user's current favorite pokemons
app.get("/api/favorites/:token", async (req: Request, res: Response) => {
	const token = req.params.token;
	const favoritePokemons = await mongoManager.getUserFavoritePokemons(token);
	res.json(favoritePokemons);
});

// POST request to add a new pokemon to a user's favorite pokemons
app.post("/api/favorites/:token", async (req: Request, res: Response) => {
	const token = req.params.token;
	const pokemonId = +req.body;
	await mongoManager.addFavoriteToUser(token, pokemonId);
	res.sendStatus(201);
});

// DELETE request to remove a pokemon from the user's favorite pokemons list
app.delete("/api/favorites/:token/:pokemonId", async (req: Request, res: Response) => {
	const token = req.params.token;
	const pokemonId = +req.params.pokemonId;
	await mongoManager.removeFavoriteFromUser(token, pokemonId);
	res.sendStatus(204);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
