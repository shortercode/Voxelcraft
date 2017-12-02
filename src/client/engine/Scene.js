import { Entity } from "./Entity.js";

export class Scene {
	constructor () {
		this.elements = new Set();
	}
	add (entity) {
		this.elements.add(entity);
		return this;
	}
	remove (entity) {
		this.elements.delete(entity);
		return this;
	}
	*entities () {
		for (const element of this.elements) {
			if (element instanceof Scene)
				yield* element.entities();
			else
				yield element;
		}
	}
}
