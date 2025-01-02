import {
	createDrum,
	getBallRandomly,
	getFalsePositions,
} from './services/drum.ts';

if (import.meta.main) {
	const numberLength = 5;
	let drum = createDrum(numberLength);
	while (getFalsePositions(drum).length > 0) {
		console.log();
		drum = getBallRandomly(drum);
		console.log(drum);
	}
}
