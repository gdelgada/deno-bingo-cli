import { assertEquals } from '@std/assert';
import {
	createDrum,
	getFalsePositions,
	hitDrum,
} from '../src/services/drum.ts';

/**
 * Test helper that simulates the getRandomIndex function from main.ts
 */
function getRandomIndex(array: number[]): number {
	return Math.floor(Math.random() * array.length);
}

// === Random Index Selection Tests ===

Deno.test('getRandomIndex: returns valid index', () => {
	const testArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

	for (let i = 0; i < 100; i++) {
		const index = getRandomIndex(testArray);
		assertEquals(index >= 0, true);
		assertEquals(index < testArray.length, true);
		assertEquals(Number.isInteger(index), true);
	}
});

Deno.test('getRandomIndex: covers all possible indices', () => {
	const testArray = [0, 1, 2];
	const seen = new Set<number>();

	// Run enough times to likely hit all indices
	for (let i = 0; i < 100; i++) {
		const index = getRandomIndex(testArray);
		seen.add(index);
	}

	// Should have seen multiple different indices (probabilistic test)
	assertEquals(seen.size >= 2, true);
});

// === Game Flow Simulation Tests ===

Deno.test('Game flow: complete game with small drum', () => {
	const drumSize = 5;
	let drum = createDrum(drumSize);
	let ballsCalled = 0;
	const calledNumbers: number[] = [];

	// Simulate drawing all balls
	while (getFalsePositions(drum).length > 0) {
		const falsePositions = getFalsePositions(drum);
		const index = getRandomIndex(falsePositions);
		const actualIndex = falsePositions[index];

		drum = hitDrum(drum, actualIndex);
		ballsCalled++;
		calledNumbers.push(actualIndex + 1); // Convert to 1-indexed
	}

	// All balls should be called
	assertEquals(ballsCalled, drumSize);
	assertEquals(getFalsePositions(drum).length, 0);

	// All called numbers should be unique
	const uniqueNumbers = new Set(calledNumbers);
	assertEquals(uniqueNumbers.size, drumSize);

	// All numbers should be in valid range
	calledNumbers.forEach((num) => {
		assertEquals(num >= 1, true);
		assertEquals(num <= drumSize, true);
	});
});

Deno.test('Game flow: partial game simulation', () => {
	const drumSize = 20;
	let drum = createDrum(drumSize);
	const ballsToCall = 10;

	for (let i = 0; i < ballsToCall; i++) {
		const falsePositions = getFalsePositions(drum);
		const index = getRandomIndex(falsePositions);
		const actualIndex = falsePositions[index];
		drum = hitDrum(drum, actualIndex);
	}

	// Should have called exactly 10 balls
	assertEquals(getFalsePositions(drum).length, drumSize - ballsToCall);
});

Deno.test('Game flow: no duplicate balls are drawn', () => {
	const drumSize = 30;
	let drum = createDrum(drumSize);
	const drawnBalls = new Set<number>();

	// Draw 20 balls
	for (let i = 0; i < 20; i++) {
		const falsePositions = getFalsePositions(drum);
		const index = getRandomIndex(falsePositions);
		const actualIndex = falsePositions[index];

		// Check this ball hasn't been drawn before
		assertEquals(drawnBalls.has(actualIndex), false);

		drum = hitDrum(drum, actualIndex);
		drawnBalls.add(actualIndex);
	}

	assertEquals(drawnBalls.size, 20);
});

// === Edge Cases ===

Deno.test('Edge case: single ball drum', () => {
	let drum = createDrum(1);
	const falsePositions = getFalsePositions(drum);

	assertEquals(falsePositions.length, 1);
	assertEquals(falsePositions[0], 0);

	drum = hitDrum(drum, 0);
	assertEquals(getFalsePositions(drum).length, 0);
});

Deno.test('Edge case: standard bingo drum (90 balls)', () => {
	let drum = createDrum(90);

	// Draw 10 balls
	for (let i = 0; i < 10; i++) {
		const falsePositions = getFalsePositions(drum);
		const index = getRandomIndex(falsePositions);
		const actualIndex = falsePositions[index];
		drum = hitDrum(drum, actualIndex);
	}

	assertEquals(getFalsePositions(drum).length, 80);
});

// === State Consistency Tests ===

Deno.test('State consistency: drum state never corrupts', () => {
	let drum = createDrum(10);
	const operations = 50;

	for (let i = 0; i < operations; i++) {
		const falsePositions = getFalsePositions(drum);

		if (falsePositions.length === 0) break;

		const index = getRandomIndex(falsePositions);
		const actualIndex = falsePositions[index];

		// Verify index is valid
		assertEquals(actualIndex >= 0, true);
		assertEquals(actualIndex < 10, true);

		// Hit the drum
		drum = hitDrum(drum, actualIndex);

		// Verify drum length hasn't changed
		assertEquals(drum.length, 10);
	}

	// Final state should be valid
	assertEquals(drum.length, 10);
	assertEquals(
		drum.filter((v) => v === true).length +
			drum.filter((v) => v === false).length,
		10,
	);
});

Deno.test('State consistency: immutability check', () => {
	const original = createDrum(5);
	const originalCopy = [...original];

	let current = original;

	// Perform several operations
	current = hitDrum(current, 0);
	current = hitDrum(current, 2);
	current = hitDrum(current, 4);

	// Original should be unchanged
	assertEquals(original, originalCopy);
	assertEquals(original.every((v) => v === false), true);
});
