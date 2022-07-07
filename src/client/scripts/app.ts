import { Utility } from "./utility";
import { Pokemon, PokemonData, PokemonSpecs } from "./Pokemon";

const GET_POKEMON_URL = "https://pokeapi.co/api/v2/pokemon/";
const POKEMON_IMG_URL = "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/";
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

const filters = [];

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
	initializeEventListeners();
	loader.classList.remove("active");
	pokemonsCollectiveMethods.render();
}

function initializeEventListeners(): void {
	// Search button and Enter Key
	const searchButton = document.getElementById("search-button");
	searchButton.addEventListener("click", searchPokemons);
	document.addEventListener("keydown", (e) => {
		if (e.code === "Enter" && document.activeElement === searchBox) searchPokemons();
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
		sortPokemons(sortRequest[0], sortRequest[1]);
		pokemonsCollectiveMethods.remove();
		pokemonsCollectiveMethods.render();
		filterPokemons();
	});
	// Type filters
	document.querySelectorAll(".type-filter").forEach((element) =>
		element.addEventListener("click", () => {
			element.classList.toggle(element.innerHTML);
			if (filters.indexOf(element.innerHTML) === -1) filters.push(element.innerHTML);
			else filters.splice(filters.indexOf(element.innerHTML), 1);
			filterPokemons();
		})
	);
	// Combined Types
	combinedTypes.addEventListener("click", filterPokemons);
}

// Creates pokemons and push them to the arr
async function createPokemons(): Promise<void> {
	const promises = [];
	for (let i = 0; i < POKEMONS_AMOUNT; i++) {
		promises.push(getFetch(GET_POKEMON_URL + (i + 1)));
	}
	for (let i = 0; i < promises.length; i++) {
		const pokemonObject = await promises[i];
		const pokemonSpecs: PokemonSpecs = {
			types: pokemonObject.types.map((type) => type.type.name),
			height: pokemonObject.height / 10,
			weight: pokemonObject.weight / 10,
		};
		const pokemonData: PokemonData = {
			name: pokemonObject.species.name,
			id: pokemonObject.id,
			img: `${POKEMON_IMG_URL + "0".repeat(3 - String(i + 1).length) + (i + 1)}.png`,
			specs: pokemonSpecs,
		};
		pokemons.push(new Pokemon(pokemonData));
	}
}

function sortPokemons(sortType: "id" | "name", direction: "ascending" | "descending"): void {
	const directionNumber = direction === "ascending" ? 1 : -1;
	pokemons.sort((a, b) => (a.data[sortType] > b.data[sortType] ? directionNumber : directionNumber * -1));
}

function filterPokemons(): void {
	pokemonsCollectiveMethods.hide();
	pokemons.forEach((pokemon) => {
		if (filters.length === 0) pokemon.show();
		else {
			if (combinedTypes.checked) {
				if (filters.every((filter) => pokemon.data.specs.types.includes(filter))) pokemon.show();
			} else {
				if (filters.some((filter) => pokemon.data.specs.types.includes(filter))) pokemon.show();
			}
		}
	});
}

function searchPokemons(): void {
	const searchTerm = searchBox.value.toLowerCase();
	const matchingPokemons = pokemons.filter((pokemon) => pokemon.data.name.includes(searchTerm) || String(pokemon.data.id).includes(searchTerm));
	pokemonsCollectiveMethods.hide();
	notFound.classList.remove("active");
	if (matchingPokemons.length === 0) {
		notFound.innerHTML = `There isn't any pokemon matching "${searchTerm}"`;
		notFound.classList.add("active");
	} else {
		matchingPokemons.forEach((pokemon) => pokemon.show());
	}
}

// Getting json from fetch
async function getFetch(url: string): Promise<any> {
	return await fetch(url).then((res) => res.json());
}
