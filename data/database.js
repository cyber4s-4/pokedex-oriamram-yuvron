const { MongoManager } = require("../dist/server/mongo.js");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv").config();
const db = new MongoManager();
async function addAllPokemons() {
	const allPokemonsPath = path.join(__dirname, "allPokemons.json");
	const allPokemons = JSON.parse(fs.readFileSync(allPokemonsPath, "utf8")).slice(0, 8000);
	let sql = `INSERT INTO pokemons (name, id, img, specs) VALUES `;
	for (let i = 0; i < allPokemons.length; i++) {
		const offset = i * 4;
		sql += `($${offset + 1},$${offset + 2},$${offset + 3},$${offset + 4}),`;
	}
	sql = sql.slice(0, -1);
	const pokemonValues = allPokemons.map((pokemon) => Object.values(pokemon));
	// await db.client.query(sql, pokemonValues.flat());
	console.log("SQL: INSERT INTO pokemons");
	// console.log(await db.getPokemonById(2));
	console.log((await db.client.query(`SELECT * FROM pokemons WHERE specs->'types' @>'["grass","fire"]'`)).rows);
}
db.init()
	.then(async () => {
		// await db.getPokemonsByFilter("", ["grass", "poison"], false, 0);
		addAllPokemons().then(() => db.client.end());
	})
	.catch((err) => {
		console.log(err.message);
		db.client.end();
	});
