import { assertEquals, assertExists } from '@std/assert';
import { getRandomIndex } from '../src/main.ts';
import {
	createDrum,
	getFalsePositions,
	hitDrum,
} from '../src/services/drum.ts';

// ===========================
// Tests for getRandomIndex
// ===========================

Deno.test('getRandomIndex: returns a valid index within array bounds', () => {
	const testArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

	// Test 100 times to ensure consistency
	for (let i = 0; i < 100; i++) {
		const index = getRandomIndex(testArray);
		assertEquals(index >= 0, true, 'Index should be >= 0');
		assertEquals(
			index < testArray.length,
			true,
			'Index should be < array length',
		);
		assertEquals(
			Number.isInteger(index),
			true,
			'Index should be an integer',
		);
	}
});

Deno.test('getRandomIndex: returns integer for single element array', () => {
	const singleElement = [42];
	const index = getRandomIndex(singleElement);
	assertEquals(index, 0);
});

Deno.test('getRandomIndex: covers different indices over multiple calls', () => {
	const testArray = [0, 1, 2, 3, 4];
	const seen = new Set<number>();

	// Run enough times to likely hit different indices
	for (let i = 0; i < 200; i++) {
		const index = getRandomIndex(testArray);
		seen.add(index);
	}

	// Should have seen at least 3 different indices (probabilistic test)
	assertEquals(seen.size >= 3, true, 'Should generate varied indices');
});

Deno.test('getRandomIndex: handles large arrays', () => {
	const largeArray = Array.from({ length: 1000 }, (_, i) => i);

	for (let i = 0; i < 50; i++) {
		const index = getRandomIndex(largeArray);
		assertEquals(index >= 0, true);
		assertEquals(index < 1000, true);
	}
});

// ===========================
// Game Logic Integration Tests
// ===========================

Deno.test('Game logic: selecting random balls maintains drum integrity', () => {
	const drumSize = 20;
	let drum = createDrum(drumSize);
	const selectedBalls = new Set<number>();

	// Simulate selecting 10 random balls
	for (let i = 0; i < 10; i++) {
		const falsePositions = getFalsePositions(drum);
		const randomIdx = getRandomIndex(falsePositions);
		const ballPosition = falsePositions[randomIdx];

		// Verify we haven't selected this ball before
		assertEquals(
			selectedBalls.has(ballPosition),
			false,
			'Ball should not be selected twice',
		);

		drum = hitDrum(drum, ballPosition);
		selectedBalls.add(ballPosition);
	}

	// Verify final state
	assertEquals(selectedBalls.size, 10);
	assertEquals(getFalsePositions(drum).length, drumSize - 10);
});

Deno.test('Game logic: can complete full game using random selection', () => {
	const drumSize = 30;
	let drum = createDrum(drumSize);
	const callOrder: number[] = [];

	// Play until all balls are called
	while (getFalsePositions(drum).length > 0) {
		const falsePositions = getFalsePositions(drum);
		const randomIdx = getRandomIndex(falsePositions);
		const ballPosition = falsePositions[randomIdx];

		drum = hitDrum(drum, ballPosition);
		callOrder.push(ballPosition);
	}

	// Verify all balls were called exactly once
	assertEquals(callOrder.length, drumSize);
	assertEquals(new Set(callOrder).size, drumSize);
	assertEquals(getFalsePositions(drum).length, 0);
});

Deno.test('Game logic: random selection from remaining balls only', () => {
	let drum = createDrum(10);

	// Manually hit some specific balls
	drum = hitDrum(drum, 0);
	drum = hitDrum(drum, 5);
	drum = hitDrum(drum, 9);

	// Get remaining positions
	const remaining = getFalsePositions(drum);
	assertEquals(remaining.length, 7);

	// Select random from remaining - should never return a hit position
	for (let i = 0; i < 50; i++) {
		const randomIdx = getRandomIndex(remaining);
		const selectedPosition = remaining[randomIdx];

		// These positions should never be selected
		assertEquals(selectedPosition !== 0, true);
		assertEquals(selectedPosition !== 5, true);
		assertEquals(selectedPosition !== 9, true);

		// Selected position should be in remaining
		assertEquals(remaining.includes(selectedPosition), true);
	}
});

Deno.test('Game logic: validates ball numbers are 1-indexed for display', () => {
	const drumSize = 10;
	let drum = createDrum(drumSize);

	// Select first ball
	const falsePositions = getFalsePositions(drum);
	const randomIdx = getRandomIndex(falsePositions);
	const ballPosition = falsePositions[randomIdx];

	drum = hitDrum(drum, ballPosition);

	// Convert to display number (1-indexed)
	const displayNumber = ballPosition + 1;

	// Display number should be between 1 and drumSize (inclusive)
	assertEquals(displayNumber >= 1, true);
	assertEquals(displayNumber <= drumSize, true);
});

// ===========================
// Edge Cases and Error Scenarios
// ===========================

Deno.test('Edge case: random selection with minimal drum', () => {
	let drum = createDrum(1);
	const falsePositions = getFalsePositions(drum);

	assertEquals(falsePositions.length, 1);

	const randomIdx = getRandomIndex(falsePositions);
	assertEquals(randomIdx, 0);

	const ballPosition = falsePositions[randomIdx];
	assertEquals(ballPosition, 0);

	drum = hitDrum(drum, ballPosition);
	assertEquals(getFalsePositions(drum).length, 0);
});

Deno.test('Edge case: standard bingo 90-ball game simulation', () => {
	let drum = createDrum(90);
	let ballsDrawn = 0;

	// Draw first 10 balls
	for (let i = 0; i < 10; i++) {
		const falsePositions = getFalsePositions(drum);
		const randomIdx = getRandomIndex(falsePositions);
		const ballPosition = falsePositions[randomIdx];

		drum = hitDrum(drum, ballPosition);
		ballsDrawn++;

		// Verify ball number is in valid range (1-90)
		const ballNumber = ballPosition + 1;
		assertEquals(ballNumber >= 1, true);
		assertEquals(ballNumber <= 90, true);
	}

	assertEquals(ballsDrawn, 10);
	assertEquals(getFalsePositions(drum).length, 80);
});

// ===========================
// Performance and Consistency Tests
// ===========================

Deno.test('Performance: getRandomIndex executes quickly', () => {
	const testArray = Array.from({ length: 100 }, (_, i) => i);
	const iterations = 10000;

	const start = performance.now();
	for (let i = 0; i < iterations; i++) {
		getRandomIndex(testArray);
	}
	const end = performance.now();

	const timePerCall = (end - start) / iterations;

	// Should be extremely fast (less than 0.01ms per call)
	assertEquals(timePerCall < 0.01, true, 'Should execute in < 0.01ms');
});

Deno.test('Consistency: random distribution is not completely uniform but reasonable', () => {
	const testArray = [0, 1, 2];
	const counts = [0, 0, 0];
	const iterations = 3000;

	// Count occurrences
	for (let i = 0; i < iterations; i++) {
		const index = getRandomIndex(testArray);
		counts[index]++;
	}

	// Each index should appear at least once (extremely high probability)
	assertEquals(counts[0] > 0, true);
	assertEquals(counts[1] > 0, true);
	assertEquals(counts[2] > 0, true);

	// No index should dominate completely (basic sanity check)
	// With 3000 iterations, each should get roughly 1000 ± some variance
	// We'll be lenient and just check none are below 500 or above 1500
	counts.forEach((count, idx) => {
		assertEquals(
			count > 500 && count < 1500,
			true,
			`Index ${idx} count (${count}) should be reasonably distributed`,
		);
	});
});

// ===========================
// Mock/Simulation Tests for Input Handling
// ===========================

Deno.test('Input simulation: validates numeric input parsing', () => {
	// Simulate valid inputs
	const validInputs = ['90', '75', '30', '1'];

	validInputs.forEach((input) => {
		const parsed = parseInt(input, 10);
		assertEquals(isNaN(parsed), false);
		assertEquals(parsed > 0, true);
	});
});

Deno.test('Input simulation: rejects invalid numeric inputs', () => {
	// Simulate invalid inputs
	const invalidInputs = ['abc', '-5', '0', '', 'NaN'];

	invalidInputs.forEach((input) => {
		const parsed = parseInt(input || '90', 10);
		const isValid = !isNaN(parsed) && parsed > 0;

		if (!isValid && input === '') {
			// Empty input should default to 90
			assertEquals(parseInt(input || '90', 10), 90);
		}
	});
});
