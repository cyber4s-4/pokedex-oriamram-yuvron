// const { MongoClient } = require("mongodb");
import { MongoClient } from "mongodb";
const mongo = require("mongodb");
const fs = require("fs");
const uri = "mongodb+srv://user:user123@pokedex.pdhqb.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const all_pokemons = JSON.parse(fs.readFileSync("data/allPokemons.json"));
let db;
let collection;
onLoad();
async function onLoad() {
	await client.connect();
	await create("pokedex", "all_pokemons");
	await addAllPokemons(collection);
	console.log("done");
}
//adding all pokemons to the database
async function addAllPokemons(collection) {
	if ((await collection.count()) === 0) {
		await collection.insertMany(all_pokemons);
	}
}
//creates new database
async function create(dbName, collectionName) {
	db = client.db(dbName);
	collection = db.collection(collectionName);
	await collection.insertOne({ a: "a" });
	await collection.deleteMany({});
}
//updates a pokemon
export async function updateDocument(id: number, req) {
	await collection.updateOne({ id: id }, { $set: { name: req.name, id: req.id, img: req.img, specs: req.specs } });
}
//remove all pokemons from database
async function removeAll() {
	collection.deleteMany();
}
