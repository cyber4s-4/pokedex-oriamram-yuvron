const { MongoClient } = require("mongodb");
const mongo = require("mongodb");
const fs = require("fs");
const uri = "mongodb+srv://user:user123@pokedex.pdhqb.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const all_pokemons = JSON.parse(fs.readFileSync("../../data/allPokemons.json"));
let db;
let collection;
onLoad();
async function onLoad() {
	await client.connect();
	await create("pokedex", "all_pokemons");
	await addAllPokemons(collection);
	console.log("done");
}
async function addAllPokemons(collection) {
	if ((await collection.count()) === 0) {
		await collection.insertMany(all_pokemons);
	}
}
async function create(dbName, collectionName) {
	db = await client.db(dbName);
	collection = await db.collection(collectionName);
	await collection.insertOne({ a: "a" });
	await collection.deleteMany({});
}
