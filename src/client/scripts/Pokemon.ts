export class Pokemon {
	data: PokemonData;
	element: HTMLElement;
	isActive: boolean;

	constructor(data: PokemonData) {
		this.data = data;
	}

	render(parent: HTMLElement): void {
		this.element = document.createElement("div");
		this.element.classList.add("card");
		this.element.addEventListener("click", () => (window.location.href = `pokemon.html?id=${this.data.id}`));
		this.element.innerHTML = `
        <img src=${this.data.img} />
        <div class="pokemon-title">
            <span class="name">${this.data.name}</span>
        	<span class="id">${this.data.id}</span>
       	</div>`;
		let types = "<div class='types'>";
		for (const type of this.data.specs.types) {
			types += `<span class="${type}">${type}</span>`;
		}
		types += "</div>";
		this.element.innerHTML += types;
		parent.appendChild(this.element);
		this.isActive = true;
	}

	unrender(): void {
		this.element.remove();
		this.isActive = false;
	}

	show(): void {
		this.element.style.display = "block";
		this.isActive = true;
	}

	hide(): void {
		this.element.style.display = "none";
		this.isActive = false;
	}
}

export interface PokemonData {
	name: string;
	id: number;
	img: string;
	specs: PokemonSpecs;
}

export interface PokemonSpecs {
	types: string[];
	height: number;
	weight: number;
}
