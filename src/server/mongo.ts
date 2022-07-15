import { MongoClient, Db, Collection } from "mongodb";
import fs from "fs";

export class MongoManager {
	client: MongoClient;
	db: Db;
	pokemonsCollection: Collection;
	constructor() {
		const uri = "mongodb+srv://user:user123@pokedex.pdhqb.mongodb.net/?retryWrites=true&w=majority";
		this.client = new MongoClient(uri);
		this.connect();
	}

	async connect(): Promise<void> {
		await this.client.connect();
		this.db = this.client.db("pokedex");
		this.pokemonsCollection = this.db.collection("pokemons");
		if ((await this.pokemonsCollection.countDocuments()) === 0) await this.addAllPokemons();
	}

	isLive(): boolean {
		return this.db !== undefined;
	}

	async addAllPokemons(): Promise<void> {
		this.removeAll();
		const allPokemons = JSON.parse(fs.readFileSync("allPokemons.json", "utf8"));
		await this.pokemonsCollection.insertMany(allPokemons);
	}

	async removeAll(): Promise<void> {
		await this.pokemonsCollection.deleteMany({});
	}

	async getAllPokemons(): Promise<any[]> {
		return await this.pokemonsCollection.find({}).toArray();
	}

	async updatePokemon(id: number, newData): Promise<void> {
		await this.pokemonsCollection.updateOne({ id: id }, { $set: { name: newData.name, id: newData.id, image: newData.image, specs: newData.specs } });
	}
}
