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

// Middleware to log the requested URL and send a server error if database is not connected
app.use("*", (req: Request, res: Response, next: NextFunction) => {
	console.log(`${req.method}: ${req.originalUrl}`);
	if (mongoManager.isLive()) next();
	else res.sendStatus(500);
});

// GET request to get all the pokemons - options are passed in query
app.get("/api/pokemons", async (req: Request, res: Response) => {
	const searchTerm = req.query.searchTerm ? req.query.searchTerm : "";
	const types = req.query.types ? req.query.types.split(",") : [];
	const combinedTypes = req.query.combinedTypes ? req.query.combinedTypes === "true" : false;
	const sortType = req.query.sortType ? req.query.sortType : "id";
	const sortDirection = req.query.sortDirection ? req.query.sortDirection : 1;
	const start = req.query.start ? +req.query.start : 0;
	const pokemons = await mongoManager.getPokemonsByFilter(searchTerm, types, combinedTypes, sortType, sortDirection, start);
	res.json(pokemons);
});

// Get request to get a pokemon by id
app.get("/api/pokemons/:id", async (req: Request, res: Response) => {
	const id = +req.params.id;
	const pokemon = await mongoManager.getPokemonById(id);
	res.json(pokemon);
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
	console.log(`Body: ${req.body}`);
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
