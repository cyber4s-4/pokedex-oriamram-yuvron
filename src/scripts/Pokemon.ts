export interface PokemonData {
	name: string;
	id: number;
	img: string;
	specs: PokemonSpecs;
	// evolutions: Pokemon[];
}
export interface PokemonSpecs {
	types: string[];
	height: number;
	weight: number;
}

export class Pokemon {
	data: PokemonData;
	element: HTMLElement;

	constructor(data: PokemonData) {
		this.data = data;
	}

	render(parent: HTMLElement): void {
		this.element = document.createElement("div");
		this.element.classList.add("card");
		this.element.addEventListener("click", () => (window.location.href = `/pokemon?id=${this.data.id}`));
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
	}

	unrender(): void {
		this.element.remove();
	}

	show(): void {
		this.element.style.display = "block";
	}

	hide(): void {
		this.element.style.display = "none";
	}
}
