import { Pokemon } from "./Pokemon";

export class Utility {
	static addPokemonsToLocalStorage(pokemons: Pokemon[]): void {
		const pokemonsData = JSON.stringify(pokemons.map((pokemon) => pokemon.data));
		localStorage.setItem("pokemons", pokemonsData);
	}

	static getPokemonsFromLocalStorage(): Pokemon[] {
		const storagedData = JSON.parse(localStorage.getItem("pokemons"));
		return storagedData.map((pokemonData) => new Pokemon(pokemonData));
	}
}
