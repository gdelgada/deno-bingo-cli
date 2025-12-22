export function createDrum(length: number): boolean[] {
	return new Array(length).fill(false);
}

export function hitDrum(drum: boolean[], index: number): boolean[] {
	const newDrum = [...drum];
	newDrum[index] = true;
	return newDrum;
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
	const positions: number[] = [];
	for (let i = 0; i < drum.length; i++) {
		if (!drum[i]) {
			positions.push(i);
		}
	}
	return positions;
}
