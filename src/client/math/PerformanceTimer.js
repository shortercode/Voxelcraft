import { Dispatcher } from "../events/Dispatcher.js";

export class PerformanceTimer extends Dispatcher {
	constructor (name) {
		this.name = name;
		this.min = Infinity;
		this.max = -Infinity;
		this.average = 0;
		this.count = 0;
		this.total = 0;
	}
	record () {
		const start = performance.now();

		return () => {
			const duration = performance.now() - start;
			this.total += duration;
			this.count += 1;

			this.average = this.total / this.count;

			if (this.count == 100) {
				this.total /= 2;
				this.count = 50;
			}

			if (duration < this.min) {
				this.min = duration;
			}
			if (duration > this.max) {
				this.max = duration;
			}

			this.emit("update", this);
		}
	}
}