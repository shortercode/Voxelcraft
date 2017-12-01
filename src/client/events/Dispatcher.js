import { Disposable } from "./Disposable.js";

export class Dispatcher {
	constructor () {
		this.handlers = new Map();
	}
	clear () {
		this.handlers.clear();
	}
	on (name, fn) {
		let handlers = this.handlers.get(name);
		if (!handlers) {
			handlers = new Set();
			this.handlers.set(name, handlers);
		}
		handlers.add(fn);
		return new Disposable(() => handlers.delete(fn));
	}
	emit (name, ...values) {
		const handlers = this.handlers.get(name);
		if (handlers) {
			for (const fn of handlers) {
				fn(...values);
			}
		}
	}
}
