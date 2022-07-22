// import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import { Client } from "pg";
import fs from "fs";
import path, { format } from "path";

export class MongoManager {
	client: Client;
	db;
	// pokemonsCollection: Collection;
	// usersCollection: Collection;

	constructor() {
		this.client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
	}

	async init(): Promise<void> {
		await this.client.connect();
		await this.createTable("pokemons");
	}

	async createTable(name: string) {
		await this.client.query(`CREATE TABLE IF NOT EXISTS ${name} (
			id INT PRIMARY KEY,
			name VARCHAR(50) NOT NULL,
			img TEXT NOT NULL,
			specs JSON NOT NULL
		)`);
	}

	async getPokemonsByFilter(
		token: string,
		searchTerm: string,
		types: String[],
		combinedTypes: boolean,
		sortType: string,
		sortDirection: number,
		start: number
	): Promise<any[]> {
		// const findObject = {
		// 	$or: [{ name: new RegExp(`.*${searchTerm}.*`, "i") }, { id: +searchTerm }],
		// };
		let sql = `SELECT * FROM pokemons WHERE (name LIKE '%${searchTerm}%' OR id = ${+searchTerm}) `;
		if (types.length > 0) {
			if (combinedTypes) {
				// findObject["specs.types"] = { $all: types };
				sql += `AND `;
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
		return (await this.client.query(`SELECT * FROM pokemons WHERE id = ${id}`)).rows[0];
	}

	// async createUser(): Promise<string> {
	// 	const insertedDocument = await this.usersCollection.insertOne({
	// 		favoritePokemons: [],
	// 	});
	// 	return insertedDocument.insertedId.toString();
	// }

	// 	async getUserFavoritePokemons(token: string, filterObject = { searchTerm: "", types: [], combinedTypes: false }): Promise<any[]> {
	// 		const user = await this.usersCollection.findOne({
	// 			_id: new ObjectId(token),
	// 		});
	// 		const favoritePokemons = [];
	// 		for (const pokemon of user.favoritePokemons) {
	// 			if (!(pokemon.name.includes(filterObject.searchTerm) || pokemon.id === +filterObject.searchTerm)) continue;
	// 			if (filterObject.types.length > 0) {
	// 				if (filterObject.combinedTypes) {
	// 					if (!filterObject.types.every((type) => pokemon.specs.types.includes(type))) continue;
	// 				} else {
	// 					if (!filterObject.types.some((type) => pokemon.specs.types.includes(type))) continue;
	// 				}
	// 			}
	// 			favoritePokemons.push(pokemon);
	// 		}
	// 		return favoritePokemons;
	// 	}

	// 	async addFavoriteToUser(token: string, pokemonId: number): Promise<void> {
	// 		const pokemon = await this.pokemonsCollection.findOne({
	// 			id: pokemonId,
	// 		});
	// 		await this.usersCollection.updateOne({ _id: new ObjectId(token) }, { $push: { favoritePokemons: pokemon } });
	// 	}

	// 	async removeFavoriteFromUser(token: string, pokemonId: number): Promise<void> {
	// 		const pokemon = await this.pokemonsCollection.findOne({
	// 			id: pokemonId,
	// 		});
	// 		await this.usersCollection.updateOne({ _id: new ObjectId(token) }, { $pull: { favoritePokemons: pokemon } });
	// 	}
}
