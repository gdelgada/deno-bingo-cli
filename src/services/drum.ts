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
