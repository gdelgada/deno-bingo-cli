import { assertEquals, assertNotEquals } from '@std/assert';
import {
	createDrum,
	getFalseCount,
	getFalsePositions,
	getTrueCount,
	hitDrum,
	isDrumHit,
} from '../../src/services/drum.ts';

// === createDrum Tests ===

Deno.test('createDrum: creates array with correct length', () => {
	const drum = createDrum(10);
	assertEquals(drum.length, 10);
});

Deno.test('createDrum: initializes all values to false', () => {
	const drum = createDrum(5);
	assertEquals(drum.every((val) => val === false), true);
});

Deno.test('createDrum: handles edge case of length 1', () => {
	const drum = createDrum(1);
	assertEquals(drum.length, 1);
	assertEquals(drum[0], false);
});

Deno.test('createDrum: handles standard bingo drum size (90)', () => {
	const drum = createDrum(90);
	assertEquals(drum.length, 90);
	assertEquals(getFalseCount(drum), 90);
});

// === hitDrum Tests ===

Deno.test('hitDrum: sets specified index to true', () => {
	const drum = createDrum(10);
	const newDrum = hitDrum(drum, 5);
	assertEquals(newDrum[5], true);
});

Deno.test('hitDrum: does not mutate original drum', () => {
	const drum = createDrum(10);
	const newDrum = hitDrum(drum, 3);
	assertEquals(drum[3], false);
	assertEquals(newDrum[3], true);
	assertNotEquals(drum, newDrum);
});

Deno.test('hitDrum: hitting first index works', () => {
	const drum = createDrum(10);
	const newDrum = hitDrum(drum, 0);
	assertEquals(newDrum[0], true);
});

Deno.test('hitDrum: hitting last index works', () => {
	const drum = createDrum(10);
	const newDrum = hitDrum(drum, 9);
	assertEquals(newDrum[9], true);
});

Deno.test('hitDrum: hitting same index twice maintains true', () => {
	let drum = createDrum(10);
	drum = hitDrum(drum, 3);
	drum = hitDrum(drum, 3);
	assertEquals(drum[3], true);
	assertEquals(getTrueCount(drum), 1);
});

// === isDrumHit Tests ===

Deno.test('isDrumHit: returns false for unhit position', () => {
	const drum = createDrum(10);
	assertEquals(isDrumHit(drum, 5), false);
});

Deno.test('isDrumHit: returns true for hit position', () => {
	const drum = hitDrum(createDrum(10), 5);
	assertEquals(isDrumHit(drum, 5), true);
});

// === getFalseCount Tests ===

Deno.test('getFalseCount: returns full length for new drum', () => {
	const drum = createDrum(10);
	assertEquals(getFalseCount(drum), 10);
});

Deno.test('getFalseCount: decreases after hitting', () => {
	let drum = createDrum(10);
	drum = hitDrum(drum, 3);
	assertEquals(getFalseCount(drum), 9);
});

Deno.test('getFalseCount: returns 0 when all hit', () => {
	let drum = createDrum(3);
	drum = hitDrum(drum, 0);
	drum = hitDrum(drum, 1);
	drum = hitDrum(drum, 2);
	assertEquals(getFalseCount(drum), 0);
});

// === getTrueCount Tests ===

Deno.test('getTrueCount: returns 0 for new drum', () => {
	const drum = createDrum(10);
	assertEquals(getTrueCount(drum), 0);
});

Deno.test('getTrueCount: increases after hitting', () => {
	let drum = createDrum(10);
	drum = hitDrum(drum, 3);
	assertEquals(getTrueCount(drum), 1);
});

Deno.test('getTrueCount: returns full length when all hit', () => {
	let drum = createDrum(3);
	drum = hitDrum(drum, 0);
	drum = hitDrum(drum, 1);
	drum = hitDrum(drum, 2);
	assertEquals(getTrueCount(drum), 3);
});

// === getFalsePositions Tests ===

Deno.test('getFalsePositions: returns all indices for new drum', () => {
	const drum = createDrum(5);
	const positions = getFalsePositions(drum);
	assertEquals(positions, [0, 1, 2, 3, 4]);
});

Deno.test('getFalsePositions: excludes hit positions', () => {
	let drum = createDrum(5);
	drum = hitDrum(drum, 2);
	const positions = getFalsePositions(drum);
	assertEquals(positions, [0, 1, 3, 4]);
});

Deno.test('getFalsePositions: returns empty array when all hit', () => {
	let drum = createDrum(3);
	drum = hitDrum(drum, 0);
	drum = hitDrum(drum, 1);
	drum = hitDrum(drum, 2);
	const positions = getFalsePositions(drum);
	assertEquals(positions, []);
});

Deno.test('getFalsePositions: handles multiple hits correctly', () => {
	let drum = createDrum(10);
	drum = hitDrum(drum, 1);
	drum = hitDrum(drum, 5);
	drum = hitDrum(drum, 9);
	const positions = getFalsePositions(drum);
	assertEquals(positions, [0, 2, 3, 4, 6, 7, 8]);
});

// === Integration Tests ===

Deno.test('Integration: simulating complete game flow', () => {
	const size = 10;
	let drum = createDrum(size);

	// Initial state
	assertEquals(getFalseCount(drum), size);
	assertEquals(getTrueCount(drum), 0);

	// Hit some positions
	const hits = [3, 7, 1, 9];
	hits.forEach((pos) => {
		drum = hitDrum(drum, pos);
	});

	// Check counts
	assertEquals(getTrueCount(drum), hits.length);
	assertEquals(getFalseCount(drum), size - hits.length);

	// Check positions
	const falsePositions = getFalsePositions(drum);
	assertEquals(falsePositions.length, size - hits.length);

	hits.forEach((pos) => {
		assertEquals(isDrumHit(drum, pos), true);
		assertEquals(falsePositions.includes(pos), false);
	});
});

Deno.test('Integration: consistency between count methods', () => {
	let drum = createDrum(20);

	// Hit random positions
	const positions = [0, 5, 10, 15, 19];
	positions.forEach((pos) => {
		drum = hitDrum(drum, pos);
	});

	// Verify consistency
	assertEquals(getTrueCount(drum) + getFalseCount(drum), drum.length);
	assertEquals(getFalsePositions(drum).length, getFalseCount(drum));
});
