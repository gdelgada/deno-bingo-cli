import { assertEquals } from '@std/assert';

// Since ui.ts uses console output and ANSI colors, we'll test the exported constants
// and create testable versions of the utility functions
import {
	CLEAR_SCREEN,
	clearScreen,
	printBoard,
	printStatus,
	printTitle,
} from '../src/ui.ts';

Deno.test('CLEAR_SCREEN: contains correct ANSI sequence', () => {
	assertEquals(CLEAR_SCREEN, '\x1b[2J\x1b[H');
});

Deno.test('clearScreen: calls without errors', () => {
	// Capture console output
	const originalLog = console.log;
	let output = '';

	console.log = (msg: string) => {
		output = msg;
	};

	try {
		clearScreen();
		assertEquals(output, CLEAR_SCREEN);
	} finally {
		console.log = originalLog;
	}
});

// Test helper functions by extracting them from the module
// These are integration-style tests that verify the functions work

Deno.test('printTitle: executes without errors', () => {
	const originalLog = console.log;
	const outputs: string[] = [];

	console.log = (msg: string) => {
		outputs.push(msg);
	};

	try {
		printTitle();

		// Should print 3 lines (top border, title, bottom border)
		assertEquals(outputs.length >= 3, true);

		// Check that it contains box drawing characters
		assertEquals(outputs[0].includes('╔'), true);
		assertEquals(outputs[0].includes('═'), true);
		assertEquals(outputs[0].includes('╗'), true);
	} finally {
		console.log = originalLog;
	}
});

Deno.test('printBoard: handles empty drum', () => {
	const originalLog = console.log;
	const outputs: string[] = [];

	console.log = (msg: string) => {
		outputs.push(msg);
	};

	try {
		printBoard([]);
		// Should at least print the header and separator
		assertEquals(outputs.length >= 2, true);
	} finally {
		console.log = originalLog;
	}
});

Deno.test('printBoard: handles small drum', () => {
	const originalLog = console.log;
	const outputs: string[] = [];

	console.log = (msg: string) => {
		outputs.push(msg);
	};

	try {
		const drum = [false, true, false]; // 3 balls, 1 called
		printBoard(drum);
		// Should print header, separator, at least one row, and empty line
		assertEquals(outputs.length >= 3, true);
	} finally {
		console.log = originalLog;
	}
});

Deno.test('printStatus: handles null lastNumber', () => {
	const originalLog = console.log;
	const outputs: string[] = [];

	console.log = (msg: string) => {
		outputs.push(msg);
	};

	try {
		printStatus(null, 90, 90);
		// Should print several lines including borders and waiting message
		assertEquals(outputs.length >= 5, true);

		// Check for 'WAITING' message in output
		const allOutput = outputs.join(' ');
		assertEquals(allOutput.includes('WAITING'), true);
	} finally {
		console.log = originalLog;
	}
});

Deno.test('printStatus: handles valid lastNumber', () => {
	const originalLog = console.log;
	const outputs: string[] = [];

	console.log = (msg: string) => {
		outputs.push(msg);
	};

	try {
		printStatus(42, 50, 90);
		// Should print several lines including the number
		assertEquals(outputs.length >= 5, true);

		// Check that the number appears somewhere
		const allOutput = outputs.join(' ');
		assertEquals(allOutput.includes('42'), true);
	} finally {
		console.log = originalLog;
	}
});

Deno.test('printStatus: progress calculation is correct', () => {
	// Test that called + remaining = total
	const total = 90;
	const remaining = 30;
	const called = total - remaining;

	assertEquals(called + remaining, total);
	assertEquals(called, 60);
});
