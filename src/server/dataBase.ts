import e from "express";
import { Client } from "pg";

export class DataBase {
	client: Client;
	db;
	// pokemonsCollection: Collection;
	// usersCollection: Collection;
	//
	constructor() {
		this.client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
	}

	async init(): Promise<void> {
		await this.client.connect();
		await this.createTable("pokemons");
	}

	async createTable(name: string): Promise<void> {
		await this.client.query(`CREATE TABLE IF NOT EXISTS ${name} (
			id INT PRIMARY KEY,
			name VARCHAR(50) NOT NULL,
			img TEXT NOT NULL,
			specs JSONB NOT NULL
		)`);
	}

	async getPokemonsByFilter(
		// token: string,
		searchTerm: string,
		types: string[],
		combinedTypes: boolean,
		// sortType: string,
		// sortDirection: number,
		start: number
	) {
		const strType: string =
			`'[` +
			types
				.map((type) => {
					return `"` + type + `"`;
				})
				.join(",") +
			`]'`;

		let sql = `SELECT * FROM pokemons WHERE `;

		if (!isNaN(+searchTerm)) {
			sql += `(name LIKE '%${searchTerm}%' OR id = ${+searchTerm}) `;
		} else {
			sql += `name LIKE '%${searchTerm}%' `;
		}

		if (types.length > 0) {
			if (combinedTypes) {
				sql += ` AND specs->'types' @> ${strType} `;
			} else {
				sql += ` AND (${strType} @> (specs->'types')[0] OR ${strType} @> (specs->'types')[1]) `;
			}
		}

		const matchingPokemons = (await this.client.query(sql)).rows.slice(start, start + 100);
		// if (start === 0) {
		// 	const filterObject = { searchTerm, types, combinedTypes };
		// const favorites = await this.getUserFavoritePokemons(token, filterObject);
		// 		favorites.sort((a, b) => (a[sortType] > b[sortType] ? sortDirection * -1 : sortDirection));
		// 		for (const favorite of favorites) {
		// 			matchingPokemons.forEach((matchingPokemon, index) => {
		// 				if (favorite.id === matchingPokemon.id) {
		// 					matchingPokemons.splice(index, 1);
		// 				}
		// 			});
		// 			matchingPokemons.unshift(favorite);
		// 		}
		// 	}
		// 	matchingPokemons.forEach((pokemon) => delete pokemon["_id"]);
		// 	return matchingPokemons;
	}

	async getPokemonById(id: number): Promise<any> {
		return (await this.client.query(`SELECT * FROM pokemons WHERE id = ${id}`)).rows[0];
	}

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

	async createUsersTable(): Promise<void> {
		await this.client.query(`CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			token TEXT NOT NULL,
			favorite_pokemons JSONB ARRAY DEFAULT '{}'
		)`);
	}

	async createUser(token: string): Promise<void> {
		await this.client.query(`INSERT INTO users (token) VALUES ('${token}')`);
	}

	async getUserFavoritePokemons(token: string): Promise<any> {
		const sql = `SELECT favorite_pokemons
		FROM users
		WHERE token = '${token}'`;
		return (await this.client.query(sql)).rows[0]["favorite_pokemons"];
	}

	async addFavoriteToUser(token: string, pokemonId: number): Promise<void> {
		const pokemonJson = await this.getPokemonById(pokemonId);
		const sql = `UPDATE users
		SET favorite_pokemons = ARRAY_APPEND(favorite_pokemons, '${JSON.stringify(pokemonJson)}')
		WHERE token = '${token}'`;
		await this.client.query(sql);
	}

	async removeFavoriteFromUser(token: string, pokemonId: number): Promise<void> {
		const pokemonJson = await this.getPokemonById(pokemonId);
		const sql = `UPDATE users
		SET favorite_pokemons = ARRAY_REMOVE(favorite_pokemons,'${JSON.stringify(pokemonJson)}')
		WHERE token = '${token}'`;
		await this.client.query(sql);
	}
}
