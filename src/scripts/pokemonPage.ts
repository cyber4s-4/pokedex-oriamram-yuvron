import { Utility } from "./utility";
import { Pokemon, PokemonData, PokemonSpecs } from "./Pokemon";

const urlParams = new URLSearchParams(window.location.search);
const URLid = +urlParams.get("id");
const pokedex = document.getElementsByClassName("pokedexContainer")[0] as HTMLElement;
const statsElement = document.querySelectorAll(".stats");
const typeContainer = document.getElementsByClassName("types")[0] as HTMLElement;
const nextPage = document.querySelector("#nextPage") as HTMLElement;
pokedex.addEventListener("click", (e) => {
	let element = e.target as HTMLElement;
	element.id === nextPage.id ? (window.location.href = `/pokemon.html?id=${POKEMON.data.id + 1}`) : null;
});

const prevPage = document.getElementById("prevPage");
const pokemons: Pokemon[] = Utility.getPokemonsFromLocalStorage();
const POKEMON = pokemons.find((pokemon) => pokemon.data.id === URLid);

pokedex.addEventListener("click", (e) => {
	let element = e.target as HTMLElement;
	element.id === prevPage.id ? (window.location.href = `/pokemon.html?id=${POKEMON.data.id - 1}`) : null;
});

addStats();
function addStats(): void {
	statsElement.forEach((element) => {
		const starter = element.id === "name" || element.id === "id" ? POKEMON.data : POKEMON.data.specs;
		element.innerHTML += starter[element.id];
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
