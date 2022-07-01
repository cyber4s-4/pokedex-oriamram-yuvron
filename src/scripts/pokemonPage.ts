import { Pokemon, PokemonData, PokemonSpecs } from "./Pokemon";
const urlParams = new URLSearchParams(window.location.search);
const id = +urlParams.get("id");
const pokedex = document.getElementsByClassName("container")[0] as HTMLElement;
let pokemons: Pokemon[] = [];
getFromLocalStorage();
let POKEMON: Pokemon;
pokemons.forEach((pokemon) => {
	if (pokemon.data.id === id) POKEMON = pokemon;
});
pokedex.innerHTML += `<img src="${POKEMON.data.img}" alt="pokemon" class="pokemonImg" />`;
function addToLocalStorage(): void {
	localStorage.setItem("pokemons", JSON.stringify(pokemons.map((pokemon) => pokemon.data)));
}
// Getting pokemons from local storage and pushing them to the local data
export function getFromLocalStorage(): void {
	const storagedData = JSON.parse(localStorage.getItem("pokemons"));
	pokemons = storagedData.map((pokemonData) => new Pokemon(pokemonData));
}
