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

export function ori() {}

export class Pokemon {
	//what a kaka
	data: PokemonData;

	constructor(data: PokemonData) {
		//oh no
		this.data = data;
	}

	render(parent: HTMLElement): void {
		const card = `
		<div class="card">
        	<img src=${this.data.img} />
        	<div class="pokemon-title">
            	<span class="name">${this.data.name}</span>
        	 	<span class="id">${this.data.id}</span>
       		</div>
    	</div>`;
		parent.innerHTML += card;
	}
}
