export interface PokemonData {
	name: string;
	id: number;
	img: string;
	specs: PokemonSpecs;
	// evolutions: Pokemon[];
}
export interface PokemonSpecs {
	type: string[];
	height: number;
	weight: number;
}

export class Pokemon {
	constructor(public data: PokemonData) {}

	render(perent: HTMLElement) {
		const card = `
        <div class="card">
        <img src=${this.data.img} />
        <div class="pokemon-title">
            <span class="name">${this.data.name}</span>
            <span class="id">${this.data.id}</span>
        </div>
    </div>
        `;
		perent.innerHTML += card;
	}
}
