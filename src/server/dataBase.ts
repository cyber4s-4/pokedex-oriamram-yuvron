import { Client } from "pg";

export class DbManager {
	client: Client;

	constructor() {
		this.client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
	}

	async connect(): Promise<void> {
		await this.client.connect();
	}

	async getPokemonsByFilter(token: string, searchTerm: string, types: string[], combinedTypes: boolean, sortType: string, sortDirection: number, start: number): Promise<any[]> {
		let sql = "SELECT * FROM pokemons WHERE ";
		if (!isNaN(+searchTerm)) {
			sql += `(name LIKE '%${searchTerm}%' OR id = ${+searchTerm}) `;
		} else {
			sql += `name LIKE '%${searchTerm}%' `;
		}
		const stringifiedTypes = `'[${types.map((type) => `"${type}"`).join(",")}]'`;
		if (types.length > 0) {
			if (combinedTypes) {
				sql += `AND specs->'types' @> ${stringifiedTypes} `;
			} else {
				sql += `AND (${stringifiedTypes} @> (specs->'types')[0] OR ${stringifiedTypes} @> (specs->'types')[1]) `;
			}
		}
		sql += `ORDER BY "${sortType}" ${sortDirection === 1 ? "ASC" : "DESC"} OFFSET ${start} LIMIT 100`;
		let matchingPokemons = (await this.client.query(sql)).rows;
		if (start === 0) {
			const favoritePokemons = await this.getUserFavoritePokemons(token);
			const filteredFavoritePokemons = favoritePokemons.filter((pokemon) => {
				const checkSearchTerm = pokemon.name.includes(searchTerm) || pokemon.id === +searchTerm;
				let checkTypes = true;
				if (types.length > 0) {
					if (combinedTypes) {
						checkTypes = pokemon.specs.types.every((type) => types.includes(type));
					} else {
						checkTypes = pokemon.specs.types.some((type) => types.includes(type));
					}
				}
				return checkSearchTerm && checkTypes;
			});
			filteredFavoritePokemons.sort((a, b) => (a[sortType] > b[sortType] ? sortDirection : sortDirection * -1));
			for (const favoritePokemon of filteredFavoritePokemons) {
				for (const matchingPokemon of matchingPokemons) {
					if (matchingPokemon.id === favoritePokemon.id) {
						matchingPokemons.splice(matchingPokemons.indexOf(matchingPokemon), 1);
						break;
					}
				}
			}
			matchingPokemons = filteredFavoritePokemons.concat(matchingPokemons);
		}
		return matchingPokemons;
	}

	async getPokemonById(id: number): Promise<any> {
		return (await this.client.query("SELECT * FROM pokemons WHERE id = $1", [id])).rows[0];
	}

	async createUsersTable(): Promise<void> {
		await this.client.query(`CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			token TEXT NOT NULL,
			favorite_pokemons JSONB ARRAY DEFAULT '{}'
		)`);
	}

	async createUser(token: string): Promise<void> {
		await this.client.query("INSERT INTO users (token) VALUES ($1)", [token]);
	}

	async getUserFavoritePokemons(token: string): Promise<any> {
		const sql = `SELECT favorite_pokemons
		FROM users
		WHERE token = $1`;
		return (await this.client.query(sql, [token])).rows[0]["favorite_pokemons"];
	}

	async addFavoriteToUser(token: string, pokemonId: number): Promise<void> {
		const pokemonJson = await this.getPokemonById(pokemonId);
		const sql = `UPDATE users
		SET favorite_pokemons = ARRAY_APPEND(favorite_pokemons, '${JSON.stringify(pokemonJson)}')
		WHERE token = $1`;
		await this.client.query(sql, [token]);
	}

	async removeFavoriteFromUser(token: string, pokemonId: number): Promise<void> {
		const pokemonJson = await this.getPokemonById(pokemonId);
		const sql = `UPDATE users
		SET favorite_pokemons = ARRAY_REMOVE(favorite_pokemons,'${JSON.stringify(pokemonJson)}')
		WHERE token = $1`;
		await this.client.query(sql, [token]);
	}
}
