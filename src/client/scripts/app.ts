import { Utility } from "./utility";
import { Pokemon, PokemonData, PokemonSpecs } from "./pokemon";

const GET_POKEMON_URL = "/api/";
const POKEMONS_AMOUNT = 151;
const cardsContainer = document.getElementById("cards-container");
const searchBox = document.getElementById("search-box") as HTMLInputElement;
const combinedTypes = document.getElementById("combined-types") as HTMLInputElement;
const notFound = document.getElementById("not-found");

let pokemons: Pokemon[] = [];

const pokemonsCollectiveMethods = {
	render: (): void => pokemons.forEach((pokemon) => pokemon.render(cardsContainer)),
	remove: (): void => pokemons.forEach((pokemon) => pokemon.unrender()),
	show: (): void => pokemons.forEach((pokemon) => pokemon.show()),
	hide: (): void => pokemons.forEach((pokemon) => pokemon.hide()),
};

const filters: string[] = [];
let currentStarPokemon: Pokemon;
let currentStar: HTMLElement;
let lastSort: ["id" | "name", "ascending" | "descending"] = ["id", "ascending"];

loadPage();

// Renders all the pokemons and initializes all the event listeners
async function loadPage(): Promise<void> {
	const loader = document.getElementById("loader");
	loader.classList.add("active");
	if (!localStorage.getItem("pokemons")) {
		await createPokemons();
		Utility.addPokemonsToLocalStorage(pokemons);
	}
	pokemons = Utility.getPokemonsFromLocalStorage();
	const serverStar = await fetchJson("/api/star");
	initializeEventListeners();
	loader.classList.remove("active");
	if (serverStar.id) {
		currentStarPokemon = pokemons[+serverStar.id - 1];
		sortPokemons(lastSort[0], lastSort[1]);
	}
	pokemonsCollectiveMethods.render();
	initializeStarListeners();
	starCurrentPokemon();
}

function initializeEventListeners(): void {
	// Search button and Enter Key
	const searchButton = document.getElementById("search-button");
	searchButton.addEventListener("click", applyAllFilters);
	document.addEventListener("keydown", (e) => {
		if (e.code === "Enter" && document.activeElement === searchBox) applyAllFilters();
	});
	// Side menu toggler
	const sideMenuToggler = document.getElementById("side-menu-toggler");
	sideMenuToggler.addEventListener("click", () => {
		document.getElementById("side-menu").classList.toggle("active");
	});
	// Sorter
	const sorter = document.getElementById("sorter") as HTMLSelectElement;
	sorter.addEventListener("change", () => {
		const sortRequest = sorter.value.split("-") as ["id" | "name", "ascending" | "descending"];
		lastSort = sortRequest;
		sortPokemons(sortRequest[0], sortRequest[1]);
		pokemonsCollectiveMethods.remove();
		pokemonsCollectiveMethods.render();
		applyAllFilters();
	});
	// Type filters
	document.querySelectorAll(".type-filter").forEach((element) =>
		element.addEventListener("click", () => {
			element.classList.toggle(element.innerHTML);
			if (filters.indexOf(element.innerHTML) === -1) filters.push(element.innerHTML);
			else filters.splice(filters.indexOf(element.innerHTML), 1);
			applyAllFilters();
		})
	);
	// Combined Types
	combinedTypes.addEventListener("click", applyAllFilters);
}

// Creates pokemons and push them to the arr
async function createPokemons(): Promise<void> {
	const promises = [];
	for (let i = 0; i < POKEMONS_AMOUNT; i++) {
		promises.push(fetchJson(GET_POKEMON_URL + (i + 1)));
	}
	for (let i = 0; i < promises.length; i++) {
		const pokemonData = await promises[i];
		pokemons.push(new Pokemon(pokemonData));
	}
}

function applyAllFilters(): void {
	pokemonsCollectiveMethods.show();
	filterPokemons();
	searchPokemons();
	starCurrentPokemon();
	initializeStarListeners();
	checkIfNotFound();
}

function sortPokemons(sortType: "id" | "name", direction: "ascending" | "descending"): void {
	const directionNumber = direction === "ascending" ? 1 : -1;
	pokemons.sort((a, b) => (a.data[sortType] > b.data[sortType] ? directionNumber : directionNumber * -1));
	if (currentStarPokemon) {
		pokemons.splice(pokemons.indexOf(currentStarPokemon), 1);
		pokemons.unshift(currentStarPokemon);
	}
}

function filterPokemons(): void {
	pokemons.forEach((pokemon) => {
		if (filters.length > 0) {
			if (combinedTypes.checked) {
				if (!filters.every((filter) => pokemon.data.specs.types.includes(filter))) {
					pokemon.hide();
				}
			} else {
				if (!filters.some((filter) => pokemon.data.specs.types.includes(filter))) {
					pokemon.hide();
				}
			}
		}
	});
}

function searchPokemons(): void {
	const searchTerm = searchBox.value.toLowerCase();
	if (!searchTerm) return;
	pokemons.forEach((pokemon) => {
		if (!pokemon.data.name.includes(searchTerm) && !String(pokemon.data.id).includes(searchTerm)) {
			pokemon.hide();
		}
	});
}

function checkIfNotFound(): void {
	const activePokemons = pokemons.filter((pokemon) => pokemon.isActive);
	if (activePokemons.length === 0) notFound.classList.add("active");
	else notFound.classList.remove("active");
}

function initializeStarListeners(): void {
	const stars = [...document.getElementsByClassName("star")];
	stars.forEach((star, index) =>
		star.addEventListener("click", (e) => {
			e.stopPropagation();
			star.classList.toggle("active");
			if (currentStar === star) {
				currentStar = null;
				deleteStar();
			} else {
				if (currentStar) currentStar.classList.remove("active");
				currentStar = star as HTMLElement;
				updateStar(pokemons[index]);
			}
			sortPokemons(lastSort[0], lastSort[1]);
			pokemonsCollectiveMethods.remove();
			pokemonsCollectiveMethods.render();
			applyAllFilters();
		})
	);
}

function starCurrentPokemon(): void {
	if (currentStarPokemon) {
		currentStarPokemon.element.classList.add("star-pokemon");
		currentStar = currentStarPokemon.element.querySelector(".star") as HTMLElement;
		currentStar.classList.add("active");
	}
}
function updateStar(pokemon: Pokemon): void {
	fetch("/api/star", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(pokemon.data),
	});
	pokemon.element.classList.add("star-pokemon");
	if (currentStarPokemon) currentStarPokemon.element.classList.remove("star-pokemon");
	currentStarPokemon = pokemon;
}

function deleteStar(): void {
	fetch("/api/star", { method: "DELETE" });
	currentStarPokemon.element.classList.remove("star-pokemon");
	currentStarPokemon = null;
}

// Getting json from fetch
async function fetchJson(url: string): Promise<any> {
	return await fetch(url).then((res) => res.json());
}
