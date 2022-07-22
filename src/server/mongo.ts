import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";

export class MongoManager {
	client: MongoClient;
	db: Db;
	pokemonsCollection: Collection;
	usersCollection: Collection;

	constructor() {
		this.client = new MongoClient(process.env.mongoUrl);
		this.connect();
	}

	async connect(): Promise<void> {
		await this.client.connect();
		console.log("Database connected");
		this.db = this.client.db("pokedex");
		this.pokemonsCollection = this.db.collection("pokemons");
		this.usersCollection = this.db.collection("users");
		if ((await this.pokemonsCollection.countDocuments()) === 0) await this.addAllPokemons();
	}

	isLive(): boolean {
		return this.db !== undefined;
	}

	async addAllPokemons(): Promise<void> {
		this.removeAllPokemons();
		const allPokemonsPath = path.join(__dirname, "../../data/allPokemons.json");
		const allPokemons = JSON.parse(fs.readFileSync(allPokemonsPath, "utf8"));
		await this.pokemonsCollection.insertMany(allPokemons);
	}

	async removeAllPokemons(): Promise<void> {
		await this.pokemonsCollection.deleteMany({});
	}

	async getAllPokemons(): Promise<any[]> {
		return await this.pokemonsCollection.find({}).toArray();
	}

	async getPokemonsByFilter(token: string, searchTerm: string, types: String[], combinedTypes: boolean, sortType: string, sortDirection: number, start: number): Promise<any[]> {
		const findObject = {
			$or: [{ name: new RegExp(`.*${searchTerm}.*`, "i") }, { id: +searchTerm }],
		};
		if (types.length > 0) {
			if (combinedTypes) {
				findObject["specs.types"] = { $all: types };
			} else {
				findObject["specs.types"] = { $in: types };
			}
		}
		const matchingPokemons = await this.pokemonsCollection
			.find(findObject)
			// .sort({
			// 	[sortType]: sortDirection,
			// 	_id: 1,
			// })
			.skip(start)
			.limit(100)
			.toArray();
		if (start === 0) {
			const filterObject = { searchTerm, types, combinedTypes };
			const favorites = await this.getUserFavoritePokemons(token, filterObject);
			favorites.sort((a, b) => (a[sortType] > b[sortType] ? sortDirection * -1 : sortDirection));
			for (const favorite of favorites) {
				matchingPokemons.forEach((matchingPokemon, index) => {
					if (favorite.id === matchingPokemon.id) {
						matchingPokemons.splice(index, 1);
					}
				});
				matchingPokemons.unshift(favorite);
			}
		}
		matchingPokemons.forEach((pokemon) => delete pokemon["_id"]);
		return matchingPokemons;
	}

	async getPokemonById(id: number): Promise<any> {
		return await this.pokemonsCollection.findOne({ id: id });
	}

	async createUser(): Promise<string> {
		const insertedDocument = await this.usersCollection.insertOne({ favoritePokemons: [] });
		return insertedDocument.insertedId.toString();
	}

	async getUserFavoritePokemons(token: string, filterObject = { searchTerm: "", types: [], combinedTypes: false }): Promise<any[]> {
		const user = await this.usersCollection.findOne({ _id: new ObjectId(token) });
		const favoritePokemons = [];
		for (const pokemon of user.favoritePokemons) {
			if (!(pokemon.name.includes(filterObject.searchTerm) || pokemon.id === +filterObject.searchTerm)) continue;
			if (filterObject.types.length > 0) {
				if (filterObject.combinedTypes) {
					if (!filterObject.types.every((type) => pokemon.specs.types.includes(type))) continue;
				} else {
					if (!filterObject.types.some((type) => pokemon.specs.types.includes(type))) continue;
				}
			}
			favoritePokemons.push(pokemon);
		}
		return favoritePokemons;
	}

	async addFavoriteToUser(token: string, pokemonId: number): Promise<void> {
		const pokemon = await this.pokemonsCollection.findOne({ id: pokemonId });
		await this.usersCollection.updateOne({ _id: new ObjectId(token) }, { $push: { favoritePokemons: pokemon } });
	}

	async removeFavoriteFromUser(token: string, pokemonId: number): Promise<void> {
		const pokemon = await this.pokemonsCollection.findOne({ id: pokemonId });
		await this.usersCollection.updateOne({ _id: new ObjectId(token) }, { $pull: { favoritePokemons: pokemon } });
	}
}
