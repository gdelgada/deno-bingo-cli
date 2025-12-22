import {
	createDrum,
	getFalseCount,
	getFalsePositions,
	hitDrum,
} from './services/drum.ts';
import { clearScreen, printBoard, printStatus, printTitle } from './ui.ts';

export function getRandomIndex(array: number[]): number {
	return Math.floor(Math.random() * array.length);
}

/**
 * Flushes any pending input from stdin to prevent buffered keypresses
 * from being processed in subsequent prompts.
 */
export async function flushStdin(): Promise<void> {
	if (!Deno.stdin.isTerminal()) return;

	Deno.stdin.setRaw(true);

	try {
		const buffer = new Uint8Array(1024);
		// Non-blocking read loop to drain any buffered input
		const drain = async () => {
			try {
				// Read with a short timeout - if nothing is pending, this will return quickly
				const result = await Promise.race([
					Deno.stdin.read(buffer),
					new Promise<null>((resolve) =>
						setTimeout(() => resolve(null), 20)
					),
				]);

				// If we got data, there might be more, so keep draining
				if (result !== null && result > 0) {
					await drain();
				}
			} catch {
				// Ignore read errors
			}
		};

		await drain();
	} finally {
		Deno.stdin.setRaw(false);
	}
}

export async function play() {
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
				console.log('\nGame Over! All numbers called.');
				prompt('\nPress Enter to return to main menu...');
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

			// Flush any pending input that was pressed during the rolling animation
			await flushStdin();

			const index = getRandomIndex(falsePositions);
			const actualIndex = falsePositions[index]; // Map back to original index

			drum = hitDrum(drum, actualIndex);
			lastBall = actualIndex + 1;
		}
	} catch (error) {
		console.error('An error occurred:', error);
	}
}

/**
 * Main loop that runs the game menu
 */
export async function mainLoop(): Promise<void> {
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

if (import.meta.main) {
	await mainLoop();
}
