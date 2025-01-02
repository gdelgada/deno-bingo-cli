export function createDrum(length: number): boolean[] {
	return new Array(length).fill(false);
}

export function hitDrum(drum: boolean[], index: number): boolean[] {
	return drum.map((value, i) => i === index ? !value : value);
}

export function isDrumHit(drum: boolean[], index: number): boolean {
	return drum[index];
}

export function getFalseCount(drum: boolean[]): number {
	return drum.filter((value) => !value).length;
}

export function getTrueCount(drum: boolean[]): number {
	return drum.filter((value) => value).length;
}

export function getFalsePositions(drum: boolean[]): number[] {
	return drum.reduce(
		(acc, value, i) => !value ? [...acc, i] : acc,
		[] as number[],
	);
}

function getRandomIndex(array: number[]): number {
	const result = Math.floor(Math.random() * array.length);
	return result;
}

export function getBallRandomly(drum: boolean[]): boolean[] {
	const falsePositions = getFalsePositions(drum);
	const index = getRandomIndex(falsePositions);
	console.log('Ball:', falsePositions[index] + 1);
	return drum = hitDrum(drum, falsePositions[index]);
}
