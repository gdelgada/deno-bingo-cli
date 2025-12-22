import {
	createDrum,
	getFalseCount,
	getFalsePositions,
	hitDrum,
} from './services/drum.ts';
import { clearScreen, printBoard, printStatus, printTitle } from './ui.ts';

function getRandomIndex(array: number[]): number {
	return Math.floor(Math.random() * array.length);
}

async function play() {
	try {
		clearScreen();
		printTitle();

		const drumLengthInput = prompt(
			'Enter numbers count (default 90):',
			'90',
		);
		const drumLength = parseInt(drumLengthInput || '90', 10);

		if (isNaN(drumLength) || drumLength <= 0) {
			console.error('Invalid input. Please enter a positive integer.');
			return;
		}

		let drum = createDrum(drumLength);
		let lastBall: number | null = null;

		while (true) {
			const falsePositions = getFalsePositions(drum);
			const remaining = falsePositions.length;

			clearScreen();
			printTitle();
			printBoard(drum);
			printStatus(lastBall, remaining, drumLength);

			if (remaining === 0) {
				console.log('\nGame Over! All numbers called.\n');
				break;
			}

			// Wait for user input
			const answer = prompt(
				'\nPress Enter for next ball (or type "exit" to quit):',
			);
			if (answer?.toLowerCase() === 'exit') {
				break;
			}

			console.log('\nRolling...');
			await new Promise((resolve) => setTimeout(resolve, 600));

			const index = getRandomIndex(falsePositions);
			const actualIndex = falsePositions[index]; // Map back to original index

			drum = hitDrum(drum, actualIndex);
			lastBall = actualIndex + 1;
		}
	} catch (error) {
		console.error('An error occurred:', error);
	}
}

if (import.meta.main) {
	while (true) {
		clearScreen();
		printTitle();
		console.log('Welcome to Deno Bingo CLI!\n');

		const shouldPlay = confirm('Do you want to start a new game?');
		if (!shouldPlay) {
			console.log('Goodbye!');
			Deno.exit(0);
		}

		await play();
	}
}
