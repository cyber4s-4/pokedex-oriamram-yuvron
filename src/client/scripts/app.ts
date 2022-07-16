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

let pokemons: Pokemon[] = [];

const pokemonsCollectiveMethods = {
	render: (): void => pokemons.forEach((pokemon) => pokemon.render(cardsContainer)),
	remove: (): void => pokemons.forEach((pokemon) => pokemon.unrender()),
	show: (): void => pokemons.forEach((pokemon) => pokemon.show()),
	hide: (): void => pokemons.forEach((pokemon) => pokemon.hide()),
};

let myToken: string;
const filters: string[] = [];
let favoritePokemons: Pokemon[] = [];
let lastSort: ["id" | "name", "ascending" | "descending"] = ["id", "ascending"];

loadPage();

// Renders all the pokemons, getting the starred pokemon and initializes all the event listeners
async function loadPage(): Promise<void> {
	const loader = document.getElementById("loader");
	loader.classList.add("active");
	await createPokemons();
	if (localStorage.getItem("token")) {
		myToken = localStorage.getItem("token");
		const userFavorites = await fetchJson(GET_FAVORITES_URL.replace("<token>", myToken)).catch((err) => console.log("delete", err));
		favoritePokemons = userFavorites.map((pokemonId) => pokemons[pokemonId - 1]);
	} else {
		myToken = await fetchText(REGISTER_URL);
		localStorage.setItem("token", myToken);
	}
	GET_FAVORITES_URL = GET_FAVORITES_URL.replace("<token>", myToken);
	ADD_FAVORITE_URL = ADD_FAVORITE_URL.replace("<token>", myToken);
	DELETE_FAVORITE_URL = DELETE_FAVORITE_URL.replace("<token>", myToken);
	sortPokemons(lastSort[0], lastSort[1]);
	initializeEventListeners();
	loader.classList.remove("active");
	pokemonsCollectiveMethods.render();
	initializeStarListeners();
	markFavoritePokemons();
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

// Gets all the pokemons from the server and saves them
async function createPokemons(): Promise<void> {
	const serverPokemonsData: PokemonData[] = await fetchJson(GET_POKEMONS_URL);
	pokemons = serverPokemonsData.map((pokemonData) => new Pokemon(pokemonData));
}

// Applying all the filters
function applyAllFilters(): void {
	pokemonsCollectiveMethods.show();
	filterPokemons();
	searchPokemons();
	markFavoritePokemons();
	initializeStarListeners();
	checkIfNotFound();
}

// Sorts pokemons by given category and order
function sortPokemons(sortType: "id" | "name", direction: "ascending" | "descending"): void {
	const directionNumber = direction === "ascending" ? 1 : -1;
	pokemons.sort((a, b) => (a.data[sortType] > b.data[sortType] ? directionNumber : directionNumber * -1));
	if (favoritePokemons.length > 0) {
		favoritePokemons.sort((a, b) => (a.data[sortType] > b.data[sortType] ? directionNumber * -1 : directionNumber));
		favoritePokemons.forEach((favoritePokemon) => {
			pokemons.splice(pokemons.indexOf(favoritePokemon), 1);
			pokemons.unshift(favoritePokemon);
		});
	}
}

// Hides all the pokemons that don't match the filter by type
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

// Hides all the pokemons that don't match the search
function searchPokemons(): void {
	const searchTerm = searchBox.value.toLowerCase();
	if (!searchTerm) return;
	pokemons.forEach((pokemon) => {
		if (!pokemon.data.name.includes(searchTerm) && !String(pokemon.data.id).includes(searchTerm)) {
			pokemon.hide();
		}
	});
}

// Displaying not found message if needed after every filter or search
function checkIfNotFound(): void {
	const activePokemons = pokemons.filter((pokemon) => pokemon.isActive);
	if (activePokemons.length === 0) notFound.classList.add("active");
	else notFound.classList.remove("active");
}

// Sets the event listeners for the star buttons of each pokemon
function initializeStarListeners(): void {
	const stars = [...document.getElementsByClassName("star")];
	stars.forEach((star, index) =>
		star.addEventListener("click", (e) => {
			e.stopPropagation();
			if (star.classList.contains("active")) {
				deleteFavoritePokemon(pokemons[index]);
				favoritePokemons.splice(favoritePokemons.indexOf(pokemons[index]), 1);
			} else {
				addFavoritePokemon(pokemons[index]);
				favoritePokemons.push(pokemons[index]);
			}
			star.classList.toggle("active");
			sortPokemons(lastSort[0], lastSort[1]);
			pokemonsCollectiveMethods.remove();
			pokemonsCollectiveMethods.render();
			applyAllFilters();
		})
	);
}

function markFavoritePokemons(): void {
	favoritePokemons.forEach((pokemon) => {
		pokemon.element.querySelector(".star").classList.add("active");
	});
}

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
