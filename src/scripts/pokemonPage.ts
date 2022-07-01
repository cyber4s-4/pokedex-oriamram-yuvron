import { Pokemon, PokemonData, PokemonSpecs } from "./Pokemon";
const urlParams = new URLSearchParams(window.location.search);
const URLid = +urlParams.get("id");
const pokedex = document.getElementsByClassName("container")[0] as HTMLElement;
const name = document.getElementById("name") as HTMLElement;
const id = document.getElementById("id") as HTMLElement;
const weight = document.getElementById("weight") as HTMLElement;
const height = document.getElementById("height") as HTMLElement;
const statsElement = document.querySelectorAll(".stats");

let pokemons: Pokemon[] = [];
getFromLocalStorage();
let POKEMON: Pokemon;
pokemons.forEach((pokemon) => {
	if (pokemon.data.id === URLid) POKEMON = pokemon;
});
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

pokedex.innerHTML += `<img src="${POKEMON.data.img}" alt="pokemon" class="pokemonImg" />`;

function addToLocalStorage(): void {
	localStorage.setItem("pokemons", JSON.stringify(pokemons.map((pokemon) => pokemon.data)));
}
// Getting pokemons from local storage and pushing them to the local data
export function getFromLocalStorage(): void {
	const storagedData = JSON.parse(localStorage.getItem("pokemons"));
	pokemons = storagedData.map((pokemonData) => new Pokemon(pokemonData));
}
