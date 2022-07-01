import { Pokemon, PokemonData, PokemonSpecs } from "./Pokemon";
const urlParams = new URLSearchParams(window.location.search);
const URLid = +urlParams.get("id");
const pokedex = document.getElementsByClassName("pokedexContainer")[0] as HTMLElement;
const statsElement = document.querySelectorAll(".stats");
const typeContainer = document.getElementsByClassName("types")[0] as HTMLElement;

let pokemons: Pokemon[] = [];
getFromLocalStorage();
let POKEMON: Pokemon;
pokemons.forEach((pokemon) => {
	if (pokemon.data.id === URLid) POKEMON = pokemon;
});
// addStats();
// function addStats() {
statsElement.forEach((element) => {
	const stat = document.createElement("h1");
	let starter;
	element.id === "name" || element.id === "id" ? (starter = POKEMON.data) : (starter = POKEMON.data.specs);
	switch (element.id) {
		case "name":
			stat.innerHTML = starter.name;
			break;
		case "id":
			stat.innerHTML = starter.id.toString();
			break;
		case "weight":
			stat.innerHTML = starter.weight.toString();
			break;
		case "height":
			stat.innerHTML = starter.height.toString();
			break;
	}
	element.appendChild(stat);
});
POKEMON.data.specs.types.forEach((type) => {
	const typeElement = document.createElement("h1");
	typeElement.innerHTML = type;
	typeElement.classList.add(type);
	typeContainer.appendChild(typeElement);
});
// }
pokedex.innerHTML += `<img src="${POKEMON.data.img}" alt="pokemon" class="pokemonImg" />`;

function addToLocalStorage(): void {
	localStorage.setItem("pokemons", JSON.stringify(pokemons.map((pokemon) => pokemon.data)));
}
// Getting pokemons from local storage and pushing them to the local data
export function getFromLocalStorage(): void {
	const storagedData = JSON.parse(localStorage.getItem("pokemons"));
	pokemons = storagedData.map((pokemonData) => new Pokemon(pokemonData));
}
