import { Pokemon, PokemonData, PokemonSpecs } from "./Pokemon";

const ALL_POKEMONS_URL = "https://pokeapi.co/api/v2/pokemon?offset=0&limit=151";
const GET_POKEMON_URL = "https://pokeapi.co/api/v2/pokemon/";
const POKEMON_IMG_URL = "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/";
// const evolutions = "https://pokeapi.co/api/v2/evolution-chain/";
// const CHAIN_EVOLUTIONS_NUMBER = 78;

const pokemons: Pokemon[] = [];

renderAllPokemons(document.getElementById("cards-container"), pokemons);

// Calls the render function on all the pokemons
async function renderAllPokemons(container, pokemons): Promise<void> {
	if (!localStorage.getItem("pokemons")) {
		localStorage.clear();
		await createPokemons(pokemons);
		addToLocalStorage(pokemons);
	}
	addToLocalData(pokemons);
	pokemons.forEach((pokemon) => pokemon.render(container));
}

// Getting json from fetch
async function getFetch(url: string): Promise<{ results }> {
	return await fetch(url).then((res) => res.json());
}

// Creates pokemons and push them to the arr
async function createPokemons(pokemons): Promise<void> {
	const pokemonNames = await getFetch(ALL_POKEMONS_URL).then((res) => res.results);
	const promises = [];
	for (let i = 0; i < pokemonNames.length; i++) {
		promises.push(getFetch(GET_POKEMON_URL + (i + 1)));
	}
	for (let i = 0; i < promises.length; i++) {
		const pokemonObject = await promises[i];
		const pokemonSpecs: PokemonSpecs = {
			type: pokemonObject.types.map((type) => type.type.name),
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
function addToLocalStorage(pokemons): void {
	localStorage.setItem("pokemons", JSON.stringify(pokemons));
}

// Getting pokemons from local storage and pushing them to the local data
function addToLocalData(pokemons): void {
	pokemons.map((pokemon) => undefined);
	const storagedData = JSON.parse(localStorage.getItem("pokemons"));
	storagedData.forEach((pokemonObject) => {
		pokemons.push(new Pokemon(pokemonObject.data));
	});
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
