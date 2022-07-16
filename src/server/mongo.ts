import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";

export class MongoManager {
	client: MongoClient;
	db: Db;
	pokemonsCollection: Collection;
	usersCollection: Collection;

	constructor() {
		const uri = "mongodb+srv://user:user123@pokedex.pdhqb.mongodb.net/?retryWrites=true&w=majority";
		this.client = new MongoClient(uri);
		this.connect();
	}

	async connect(): Promise<void> {
		await this.client.connect();
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

	async updatePokemon(id: number, newData): Promise<void> {
		await this.pokemonsCollection.updateOne({ id: id }, { $set: { name: newData.name, id: newData.id, image: newData.image, specs: newData.specs } });
	}

	async createUser(): Promise<string> {
		const insertedDocument = await this.usersCollection.insertOne({ favoritePokemons: [] });
		return insertedDocument.insertedId.toString();
	}

	async getUserFavoritePokemons(token: string): Promise<string[]> {
		const user = await this.usersCollection.findOne({ _id: new ObjectId(token) });
		return user.favoritePokemons;
	}

	async addFavoriteToUser(token: string, pokemonId: number): Promise<void> {
		await this.usersCollection.updateOne({ _id: new ObjectId(token) }, { $push: { favoritePokemons: pokemonId } });
	}

	async removeFavoriteFromUser(token: string, pokemonId: number): Promise<void> {
		await this.usersCollection.updateOne({ _id: new ObjectId(token) }, { $pull: { favoritePokemons: pokemonId } });
	}
}
