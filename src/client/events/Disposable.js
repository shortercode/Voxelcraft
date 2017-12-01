export class Disposable {
	constructor (action) {
		this.action = action;
	}
	get isDisposed () {
		return !!this.action;
	}
	dispose () {
		if (this.action)
			this.action();
		this.action = null;
	}
	static from (dispatcher, name, fn) {
		dispatcher.addEventListener(name, fn);
		return new Disposable(() => dispatcher.removeEventListener(name, fn));
	}
}
