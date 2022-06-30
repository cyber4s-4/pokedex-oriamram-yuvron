import { Pokemon, PokemonData, PokemonSpecs } from "./Pokemon";

const GET_POKEMON_URL = "https://pokeapi.co/api/v2/pokemon/";
const POKEMON_IMG_URL = "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/";
const POKEMONS_AMOUNT = 151;
// const evolutions = "https://pokeapi.co/api/v2/evolution-chain/";
// const CHAIN_EVOLUTIONS_NUMBER = 78;
const searchBox = document.getElementById("search-box") as HTMLInputElement;
const searchButton = document.getElementById("search-button");
const cardsContainer = document.getElementById("cards-container");
const loader = document.getElementById("loader");
const notFound = document.getElementById("not-found");
const sort = document.getElementById("sort") as HTMLInputElement;
const sortBtn = document.getElementById("sortBtn");
const fTypes1 = document.getElementById("types") as HTMLInputElement;
const fTypes2 = document.getElementById("types2") as HTMLInputElement;
const samePokemonBtn = document.getElementById("samePokemon");
samePokemonBtn.addEventListener("click", () => {
	samePokemonBtn.classList.toggle("same");
	filterByTypes(filterByType);
});
fTypes1.addEventListener("change", () => {
	filterByType.type1 = fTypes1.value;
	filterByTypes(filterByType);
});
fTypes2.addEventListener("change", () => {
	filterByType.type2 = fTypes2.value;
	filterByTypes(filterByType);
});
const filterByType = {
	type1: "",
	type2: "",
};
let pokemons: Pokemon[] = [];

loadPage();

function filterByTypes(types): void {
	pokemons.forEach((pokemon) => {
		pokemon.hide();
		if (samePokemonBtn.classList.contains("same")) {
			if (types.type1 && types.type2) {
				if (pokemon.data.specs.types.includes(types.type1) && pokemon.data.specs.types.includes(types.type2)) pokemon.show();
			} else if (types.type1) {
				if (pokemon.data.specs.types.includes(types.type1)) pokemon.show();
			} else if (types.type2) {
				if (pokemon.data.specs.types.includes(types.type2)) pokemon.show();
			} else pokemon.show();
		} else {
			if (types.type1) {
				if (pokemon.data.specs.types.includes(types.type1)) pokemon.show();
			}
			if (types.type2) {
				if (pokemon.data.specs.types.includes(types.type2)) pokemon.show();
			}
			if (!types.type1 && !types.type2) pokemon.show();
		}
	});
}
// Calls the render function on all the pokemons
async function loadPage(): Promise<void> {
	loader.classList.add("active");
	if (!localStorage.getItem("pokemons")) {
		await createPokemons();
		addToLocalStorage();
	}
	getFromLocalStorage();
	loader.classList.remove("active");
	renderAllPokemons(cardsContainer);
}

sort.addEventListener("change", () => {
	const sortRequest = sort.value.split("-") as ["id" | "name", "ascending" | "descending"];
	sortBy(sortRequest[0], sortRequest[1]);
	removeAllPokemons();
	renderAllPokemons(cardsContainer);
	filterByTypes(filterByType);
});

searchButton.addEventListener("click", searchPokemons);

document.addEventListener("keydown", (e) => {
	if (e.code === "Enter" && document.activeElement === searchBox) searchPokemons();
});

function sortBy(sortType: "id" | "name", direction: "ascending" | "descending"): void {
	const directionNumber = direction === "ascending" ? 1 : -1;
	pokemons.sort((a, b) => (a.data[sortType] > b.data[sortType] ? directionNumber : directionNumber * -1));
}

// Calls the render function on all the pokemons
async function renderAllPokemons(container): Promise<void> {
	pokemons.forEach((pokemon) => pokemon.render(container));
}

function removeAllPokemons(): void {
	pokemons.forEach((pokemon) => pokemon.unrender());
}
// Getting json from fetch
async function getFetch(url: string): Promise<{ results }> {
	return await fetch(url).then((res) => res.json());
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
			img: `${POKEMON_IMG_URL + formatNumber(i + 1)}.png`,
			specs: pokemonSpecs,
		};
		pokemons.push(new Pokemon(pokemonData));
	}
}

// Puts zeros before a number if needed
function formatNumber(i: number): string {
	if (i / 10 < 1) return "0".repeat(2) + i;
	else if (i / 100 < 1) return "0".repeat(1) + i;
	else if (i / 1000 < 1) return `${i}`;
}

// Adds to local storage
function addToLocalStorage(): void {
	localStorage.setItem("pokemons", JSON.stringify(pokemons.map((pokemon) => pokemon.data)));
}

// Getting pokemons from local storage and pushing them to the local data
function getFromLocalStorage(): void {
	const storagedData = JSON.parse(localStorage.getItem("pokemons"));
	pokemons = storagedData.map((pokemonData) => new Pokemon(pokemonData));
}

function hideAllPokemons(): void {
	pokemons.forEach((pokemon) => pokemon.hide());
}

function searchPokemons(): void {
	const searchTerm = searchBox.value.toLowerCase();
	const matchingPokemons = pokemons.filter((pokemon) => pokemon.data.name.includes(searchTerm));
	hideAllPokemons();
	notFound.classList.remove("active");
	if (matchingPokemons.length === 0) {
		notFound.innerHTML = `There isn't any pokemon matching "${searchTerm}"`;
		notFound.classList.add("active");
	} else {
		matchingPokemons.forEach((pokemon) => pokemon.show());
	}
}

// }

// let pokemonObjects: Object[] = [];
// for (let i = 0; i < pokemonNames.length; i++) {
// 	pokemonObjects[i] = await promises[i];
//     pokemons
// async function a(index) {

// 	const evoloutions: { chain }[] = [await getFetch(evolutions + index + 1)];
// 	for (const evol of evoloutions) {
// 		const chain = evol.chain;
// 		const b = (chain) => {
// 			if (!chain) return [];
// 			return [chain.species.name, ...b(chain.evolves_to[0])];
// 		};
// 		return b(chain);
// 	}
// }

// async function addEvolutions(evolutions: []) {}
