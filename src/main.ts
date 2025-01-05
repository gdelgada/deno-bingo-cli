import {
	createDrum,
	getBallRandomly,
	getFalsePositions,
} from './services/drum.ts';

function printDrum(drum: boolean[]) {
	const columns = 10;
	const rows = Math.ceil(drum.length / columns);
	const table = [];

	for (let i = 0; i < rows; i++) {
		const rowValues = drum.slice(i * columns, (i + 1) * columns);
		const row: (number | null | string | undefined)[] = [];
		for (let index = 0; index < rowValues.length; index++) {
			const ball = i * columns + index + 1;
			row.push(rowValues[index] ? ball : '');
		}
		table.push(row);
	}
	console.table(table);
}

function play() {
	try {
		const drumLengthInput = prompt('Drum length:', '90');
		const drumLength = parseInt(drumLengthInput!);
		if (isNaN(drumLength)) {
			throw new Error('The input is not a valid integer.');
		}
		let drum = createDrum(drumLength);
		console.clear();
		printDrum(drum);
		while (getFalsePositions(drum).length > 0) {
			alert('New ball?');
			console.clear();
			drum = getBallRandomly(drum);
			printDrum(drum);
		}
	} catch (error) {
		console.error('Error:', error);
	}
}

if (import.meta.main) {
	while (true) {
		if (confirm('Do you want to play?')) {
			play();
		}
	}
}
