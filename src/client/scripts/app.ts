import { writeSync } from "fs";
import { Pokemon, PokemonData } from "./pokemon";

const GET_POKEMONS_URL = "/api/pokemons";
const REGISTER_URL = "api/register";
let GET_FAVORITES_URL = "/api/favorites/<token>";
let ADD_FAVORITE_URL = "api/favorites/<token>";
let DELETE_FAVORITE_URL = "api/favorites/<token>/<pokemonId>";

const cardsContainer = document.getElementById("cards-container");
const searchBox = document.getElementById("search-box") as HTMLInputElement;
const combinedTypes = document.getElementById("combined-types") as HTMLInputElement;
const notFound = document.getElementById("not-found");
const loader = document.getElementById("loader");

let pokemons: Pokemon[] = [];

const pokemonsCollectiveMethods = {
	render: (): void => pokemons.forEach((pokemon) => pokemon.render(cardsContainer)),
	remove: (): void => pokemons.forEach((pokemon) => pokemon.unrender()),
	show: (): void => pokemons.forEach((pokemon) => pokemon.show()),
	hide: (): void => pokemons.forEach((pokemon) => pokemon.hide()),
};

const filters: string[] = [];
let favoritePokemons: string[] = [];
let lastSort: ["id" | "name", "ascending" | "descending"] = ["id", "ascending"];
let currentPokemonsUrl = GET_POKEMONS_URL;

loadPage();

// Renders all the pokemons, getting the starred pokemon and initializes all the event listeners
async function loadPage(): Promise<void> {
	loader.classList.add("active");
	await createPokemons();
	let token: string;
	if (localStorage.getItem("token")) {
		token = localStorage.getItem("token");
	} else {
		token = await fetchText(REGISTER_URL);
		localStorage.setItem("token", token);
	}
	GET_FAVORITES_URL = GET_FAVORITES_URL.replace("<token>", token);
	ADD_FAVORITE_URL = ADD_FAVORITE_URL.replace("<token>", token);
	DELETE_FAVORITE_URL = DELETE_FAVORITE_URL.replace("<token>", token);
	// favoritePokemons = await fetchJson(GET_FAVORITES_URL).catch((err) => console.log("delete", err));
	// favoritesToTop();
	initializeEventListeners();
	loader.classList.remove("active");
	pokemonsCollectiveMethods.render();
	// initializeStarListeners();
	// markFavoritePokemons();
}

// Initializes the event listeners of the different buttons in the page
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

// Gets all the pokemons from the server and saves them
async function createPokemons(): Promise<void> {
	const serverPokemonsData: PokemonData[] = await fetchJson(GET_POKEMONS_URL);
	pokemons = serverPokemonsData.map((pokemonData) => new Pokemon(pokemonData));
}

// Applying all the filters
async function applyAllFilters(): Promise<void> {
	pokemonsCollectiveMethods.remove();
	notFound.classList.remove("active");
	loader.classList.add("active");
	buildUrl();
	const pokemonsData: PokemonData[] = await fetchJson(currentPokemonsUrl);
	pokemons = pokemonsData.map((pokemonData) => new Pokemon(pokemonData));
	// favoritesToTop();
	loader.classList.remove("active");
	pokemonsCollectiveMethods.render();
	checkIfNotFound();
	// markFavoritePokemons();
	// initializeStarListeners();
}

// Builds the url to fetch the pokemons with the right queries
function buildUrl(start = 0): void {
	currentPokemonsUrl = `${GET_POKEMONS_URL}?start=${start}&`;
	sortPokemons(lastSort[0], lastSort[1]);
	filterPokemons();
	searchPokemons();
	if (currentPokemonsUrl[currentPokemonsUrl.length - 1] === "&") currentPokemonsUrl = currentPokemonsUrl.slice(0, -1);
}

// Adds the sort type and sort direction to the url that fetches pokemons
function sortPokemons(sortType: "id" | "name", direction: "ascending" | "descending"): void {
	const directionNumber = direction === "ascending" ? 1 : -1;
	currentPokemonsUrl += `sortType=${sortType}&sortDirection=${directionNumber}&`;
}

// Adds the active filter types and if combined types is checked to the url that fetches pokemons
function filterPokemons(): void {
	if (filters.length > 0) currentPokemonsUrl += `types=${filters.join(",")}&`;
	if (combinedTypes.checked) currentPokemonsUrl += "combinedTypes=true&";
}

// Adds the search term to the url that fetches pokemons
function searchPokemons(): void {
	const searchTerm = searchBox.value.toLowerCase();
	if (!searchTerm) return;
	else currentPokemonsUrl += `searchTerm=${searchTerm}&`;
}

// Displaying not found message if needed after every filter or search
function checkIfNotFound(): void {
	if (pokemons.length === 0) notFound.classList.add("active");
	else notFound.classList.remove("active");
}

function favoritesToTop(): void {
	favoritePokemons.forEach((favorite) => {
		// if(pokemons.)
	});
}

// Sets the event listeners for the star buttons of each pokemon
// function initializeStarListeners(): void {
// 	const stars = [...document.getElementsByClassName("star")];
// 	stars.forEach((star, index) =>
// 		star.addEventListener("click", (e) => {
// 			e.stopPropagation();
// 			if (star.classList.contains("active")) {
// 				deleteFavoritePokemon(pokemons[index]);
// 				favoritePokemons.splice(favoritePokemons.indexOf(pokemons[index]), 1);
// 			} else {
// 				addFavoritePokemon(pokemons[index]);
// 				favoritePokemons.push(pokemons[index]);
// 			}
// 			star.classList.toggle("active");
// 			sortPokemons(lastSort[0], lastSort[1]);
// 			pokemonsCollectiveMethods.remove();
// 			pokemonsCollectiveMethods.render();
// 			applyAllFilters();
// 		})
// 	);
// }

// function markFavoritePokemons(): void {
// 	favoritePokemons.forEach((pokemon) => {
// 		pokemon.element.querySelector(".star").classList.add("active");
// 	});
// }

// Updating the currently starred Pokemon
function addFavoritePokemon(pokemon: Pokemon): void {
	fetch(ADD_FAVORITE_URL, {
		method: "POST",
		body: String(pokemon.data.id),
	});
}

// Deleting the currently starred Pokemon
function deleteFavoritePokemon(pokemon: Pokemon): void {
	const url = DELETE_FAVORITE_URL.replace("<pokemonId>", String(pokemon.data.id));
	fetch(url, { method: "DELETE" });
}

// Getting json from fetch
async function fetchJson(url: string): Promise<any> {
	return await fetch(url).then((res) => res.json());
}

// Getting text from fetch
async function fetchText(url: string): Promise<any> {
	return await fetch(url).then((res) => res.text());
}

window.onscroll = async () => {
	if (scrollY >= document.body.scrollHeight - window.innerHeight) {
		buildUrl(pokemons.length);
		const newPokemons = await fetch(currentPokemonsUrl).then((res) => res.json());
		newPokemons.forEach((pokemon) => {
			let pokemonObject: Pokemon;
			pokemonObject = new Pokemon(pokemon);
			pokemonObject.render(cardsContainer);
			pokemons.push(pokemonObject);
		});
	}
};
