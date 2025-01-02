import { assertEquals } from '@std/assert';
import {
	createDrum,
	getFalseCount,
	getFalsePositions,
	getTrueCount,
	hitDrum,
	isDrumHit,
} from '../../src/services/drum.ts';

Deno.test(function createDrumTest() {
	const numberLength = 10;
	const drum = createDrum(numberLength);
	assertEquals(drum.length, numberLength);
	assertEquals(getFalseCount(drum), numberLength);
	assertEquals(getTrueCount(drum), 0);
});

Deno.test(function getBallTest() {
	const numberLength = 10;
	let drum = createDrum(numberLength);
	drum = hitDrum(drum, 3);

	const falsePositions = getFalsePositions(drum);
	assertEquals(falsePositions.length, numberLength - 1);

	assertEquals(drum.length, numberLength);
	assertEquals(isDrumHit(drum, 3), true);
	assertEquals(getFalseCount(drum), numberLength - 1);
	assertEquals(getTrueCount(drum), 1);
});
