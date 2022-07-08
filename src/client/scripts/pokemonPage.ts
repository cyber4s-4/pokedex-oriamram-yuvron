import { Utility } from "./utility";
import { Pokemon } from "./pokemon";

const urlParams = new URLSearchParams(window.location.search);
const URLid = +urlParams.get("id");
const pokedex = document.getElementsByClassName("pokedexContainer")[0] as HTMLElement;
const statsElement = document.querySelectorAll(".stats");
const pokedexImg = document.getElementsByClassName("pokedex")[0] as HTMLElement;
const miniDex = document.createElement("img");
miniDex.setAttribute("alt", "Pini Pokedex");
miniDex.setAttribute("src", "./images/miniDex.jpg");
miniDex.classList.add("pokedex");
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
let done = false;

function onResize(): void {
	if (window.innerWidth <= 600 && !done) {
		document.getElementsByClassName("pokedex")[0].remove();
		pokedex.appendChild(miniDex);
		done = true;
	} else if (window.innerWidth > 600 && done) {
		document.getElementsByClassName("pokedex")[0].remove();
		pokedex.appendChild(pokedexImg);
		done = false;
	}
}
