import { Utility } from "./utility";
import { Pokemon } from "./pokemon";

const SMALL_WIDTH = 600;

const urlParams = new URLSearchParams(window.location.search);
const URLid = +urlParams.get("id");
const pokedex = document.getElementsByClassName("pokedex-container")[0] as HTMLElement;
const statsElement = document.querySelectorAll(".stats");
const typeContainer = document.getElementsByClassName("types")[0] as HTMLElement;
const nextPage = document.querySelector("#nextPage") as HTMLElement;
pokedex.addEventListener("click", (e) => {
	const element = e.target as HTMLElement;
	if (element.id === nextPage.id) window.location.href = `/pokemon.html?id=${POKEMON.data.id + 1}`;
	else if (element.id === prevPage.id) window.location.href = `/pokemon.html?id=${POKEMON.data.id - 1}`;
});
window.onresize = onResize;
window.onload = onResize;
const prevPage = document.getElementById("prevPage");
const pokemons: Pokemon[] = Utility.getPokemonsFromLocalStorage();
const POKEMON = pokemons.find((pokemon) => pokemon.data.id === URLid);

addStats();
function addStats(): void {
	statsElement.forEach((element) => {
		const starter = element.id === "name" || element.id === "id" ? POKEMON.data : POKEMON.data.specs;
		element.innerHTML = starter[element.id];
	});
	POKEMON.data.specs.types.forEach((type) => {
		const typeElement = `<span class="type ${type}">${type}</span>`;
		typeContainer.innerHTML += typeElement;
	});
}

pokedex.innerHTML += `<img src="${POKEMON.data.img}" alt="pokemon" id="image" />`;
let smallPokedex = false;

function onResize(): void {
	if (window.innerWidth <= SMALL_WIDTH && !smallPokedex) {
		(document.getElementById("pokedex-image") as HTMLImageElement).src = "../images/pokedex-small.jpg";
		smallPokedex = true;
	} else if (window.innerWidth > SMALL_WIDTH && smallPokedex) {
		(document.getElementById("pokedex-image") as HTMLImageElement).src = "../images/pokedex.png";
		smallPokedex = false;
	}
}
