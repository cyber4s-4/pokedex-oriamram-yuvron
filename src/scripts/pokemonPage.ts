import { Utility } from "./utility";
import { Pokemon, PokemonData, PokemonSpecs } from "./Pokemon";

const urlParams = new URLSearchParams(window.location.search);
const URLid = +urlParams.get("id");
const pokedex = document.getElementsByClassName("pokedexContainer")[0] as HTMLElement;
const statsElement = document.querySelectorAll(".stats");
const typeContainer = document.getElementsByClassName("types")[0] as HTMLElement;

const pokemons: Pokemon[] = Utility.getPokemonsFromLocalStorage();
const POKEMON = pokemons.find((pokemon) => pokemon.data.id === URLid);

addStats();
function addStats(): void {
	statsElement.forEach((element) => {
		let starter;
		element.id === "name" || element.id === "id" ? (starter = POKEMON.data) : (starter = POKEMON.data.specs);
		element.innerHTML = starter[element.id];
	});
	POKEMON.data.specs.types.forEach((type) => {
		const typeElement = document.createElement("h1");
		typeElement.innerHTML = type;
		typeElement.classList.add(type);
		typeElement.classList.add("type");
		typeContainer.appendChild(typeElement);
	});
}
pokedex.innerHTML += `<img src="${POKEMON.data.img}" alt="pokemon" class="pokemonImg" />`;
