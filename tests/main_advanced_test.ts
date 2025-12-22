import { assertEquals, assertRejects } from '@std/assert';
import { flushStdin, play } from '../src/main.ts';

// ===========================
// Tests for flushStdin
// ===========================

Deno.test('flushStdin: executes without errors when stdin is not terminal', async () => {
	// Mock isTerminal to return false
	const originalIsTerminal = Deno.stdin.isTerminal;
	Deno.stdin.isTerminal = () => false;

	try {
		// Should return immediately without doing anything
		await flushStdin();
		// If we get here, it means no error was thrown
		assertEquals(true, true);
	} finally {
		Deno.stdin.isTerminal = originalIsTerminal;
	}
});

Deno.test({
	name: 'flushStdin: attempts to flush when stdin is terminal',
	sanitizeOps: false,
	sanitizeResources: false,
	fn: async () => {
		// This test is tricky because it interacts with real stdin
		// We'll just verify it doesn't crash
		const originalIsTerminal = Deno.stdin.isTerminal;
		const originalSetRaw = Deno.stdin.setRaw;
		const originalRead = Deno.stdin.read;

		let rawModeCalled = false;
		let rawModeRestored = false;

		try {
			// Mock the stdin methods
			Deno.stdin.isTerminal = () => true;
			Deno.stdin.setRaw = (mode: boolean) => {
				if (mode) {
					rawModeCalled = true;
				} else {
					rawModeRestored = true;
				}
			};

			// Mock read to return null immediately (no data)
			Deno.stdin.read = (_buffer: Uint8Array) => {
				return Promise.resolve(null);
			};

			await flushStdin();

			// Verify that raw mode was set and restored
			assertEquals(rawModeCalled, true, 'Should enable raw mode');
			assertEquals(rawModeRestored, true, 'Should restore normal mode');
		} finally {
			Deno.stdin.isTerminal = originalIsTerminal;
			Deno.stdin.setRaw = originalSetRaw;
			Deno.stdin.read = originalRead;
		}
	},
});

Deno.test({
	name: 'flushStdin: restores stdin even if error occurs',
	sanitizeOps: false,
	sanitizeResources: false,
	fn: async () => {
		const originalIsTerminal = Deno.stdin.isTerminal;
		const originalSetRaw = Deno.stdin.setRaw;
		const originalRead = Deno.stdin.read;

		let rawModeRestored = false;

		try {
			Deno.stdin.isTerminal = () => true;
			Deno.stdin.setRaw = (mode: boolean) => {
				if (!mode) {
					rawModeRestored = true;
				}
			};

			// Mock read to throw an error
			Deno.stdin.read = (_buffer: Uint8Array) => {
				return Promise.reject(new Error('Read error simulation'));
			};

			// Should not throw despite the error
			await flushStdin();

			// Verify raw mode was restored despite error
			assertEquals(rawModeRestored, true, 'Should restore mode even on error');
		} finally {
			Deno.stdin.isTerminal = originalIsTerminal;
			Deno.stdin.setRaw = originalSetRaw;
			Deno.stdin.read = originalRead;
		}
	},
});

Deno.test({
	name: 'flushStdin: handles data in buffer correctly',
	sanitizeOps: false,
	sanitizeResources: false,
	fn: async () => {
		const originalIsTerminal = Deno.stdin.isTerminal;
		const originalSetRaw = Deno.stdin.setRaw;
		const originalRead = Deno.stdin.read;

		let readCallCount = 0;

		try {
			Deno.stdin.isTerminal = () => true;
			Deno.stdin.setRaw = (_mode: boolean) => {};

			// Mock read to return data first, then null
			Deno.stdin.read = (_buffer: Uint8Array) => {
				readCallCount++;
				if (readCallCount === 1) {
					return Promise.resolve(5); // Simulate 5 bytes read
				}
				return Promise.resolve(null); // No more data
			};

			await flushStdin();

			// Should have called read at least once
			assertEquals(readCallCount >= 1, true, 'Should attempt to read buffer');
		} finally {
			Deno.stdin.isTerminal = originalIsTerminal;
			Deno.stdin.setRaw = originalSetRaw;
			Deno.stdin.read = originalRead;
		}
	},
});

// ===========================
// Tests for play function
// ===========================

Deno.test('play: handles invalid drum length input', async () => {
	// Save original functions
	const originalPrompt = globalThis.prompt;
	const originalConsoleError = console.error;
	const originalConsoleLog = console.log;

	let errorMessage = '';

	try {
		// Mock console functions to suppress output
		console.log = () => {};
		console.error = (msg: string) => {
			errorMessage = msg;
		};

		// Mock prompt to return invalid input
		globalThis.prompt = (_message?: string, _defaultValue?: string): string | null => {
			return 'invalid';
		};

		await play();

		// Should have captured an error message
		assertEquals(
			errorMessage.includes('Invalid input'),
			true,
			'Should show invalid input error',
		);
	} finally {
		globalThis.prompt = originalPrompt;
		console.error = originalConsoleError;
		console.log = originalConsoleLog;
	}
});

Deno.test('play: handles zero drum length', async () => {
	const originalPrompt = globalThis.prompt;
	const originalConsoleError = console.error;
	const originalConsoleLog = console.log;

	let errorMessage = '';

	try {
		console.log = () => {};
		console.error = (msg: string) => {
			errorMessage = msg;
		};

		// Mock prompt to return zero
		globalThis.prompt = (_message?: string, _defaultValue?: string): string | null => {
			return '0';
		};

		await play();

		assertEquals(
			errorMessage.includes('Invalid input'),
			true,
			'Should reject zero length',
		);
	} finally {
		globalThis.prompt = originalPrompt;
		console.error = originalConsoleError;
		console.log = originalConsoleLog;
	}
});

Deno.test('play: handles negative drum length', async () => {
	const originalPrompt = globalThis.prompt;
	const originalConsoleError = console.error;
	const originalConsoleLog = console.log;

	let errorMessage = '';

	try {
		console.log = () => {};
		console.error = (msg: string) => {
			errorMessage = msg;
		};

		// Mock prompt to return negative number
		globalThis.prompt = (_message?: string, _defaultValue?: string): string | null => {
			return '-5';
		};

		await play();

		assertEquals(
			errorMessage.includes('Invalid input'),
			true,
			'Should reject negative length',
		);
	} finally {
		globalThis.prompt = originalPrompt;
		console.error = originalConsoleError;
		console.log = originalConsoleLog;
	}
});

Deno.test({
	name: 'play: uses default value when input is empty',
	sanitizeOps: false,
	sanitizeResources: false,
	fn: async () => {
		const originalPrompt = globalThis.prompt;
		const originalConsoleLog = console.log;

		let promptCalled = false;
		let gameStarted = false;

		try {
			console.log = (msg?: string) => {
				if (msg?.includes('Rolling')) {
					gameStarted = true;
				}
			};

			let promptCallCount = 0;
			globalThis.prompt = (
				message?: string,
				defaultValue?: string,
			): string | null => {
				promptCallCount++;
				promptCalled = true;

				// First call is for drum length, return default value
				if (promptCallCount === 1) {
					return defaultValue ?? null; // Use default (90)
				}

				// Second call is during game - press enter to get a ball
				if (promptCallCount === 2) {
					return ''; // Press enter
				}

				// Third call - exit the game
				return 'exit';
			};

			await play();

			assertEquals(promptCalled, true, 'Prompt should be called');
			assertEquals(gameStarted, true, 'Game should start with default value');
		} finally {
			globalThis.prompt = originalPrompt;
			console.log = originalConsoleLog;
		}
	},
});

Deno.test('play: exits when user types exit', async () => {
	const originalPrompt = globalThis.prompt;
	const originalConsoleLog = console.log;

	let exitDetected = false;

	try {
		console.log = () => {};

		let promptCallCount = 0;
		globalThis.prompt = (message?: string, _defaultValue?: string): string | null => {
			promptCallCount++;

			// First call: set drum length
			if (promptCallCount === 1) {
				return '10';
			}

			// Second call: exit the game
			if (
				message?.includes('Press Enter for next ball') ||
				message?.includes('exit')
			) {
				exitDetected = true;
				return 'exit';
			}

			return '';
		};

		await play();

		assertEquals(exitDetected, true, 'Should detect exit command');
	} finally {
		globalThis.prompt = originalPrompt;
		console.log = originalConsoleLog;
	}
});

Deno.test('play: handles error gracefully', async () => {
	const originalPrompt = globalThis.prompt;
	const originalConsoleError = console.error;
	const originalConsoleLog = console.log;

	let errorCaught = false;

	try {
		console.log = () => {};
		console.error = (msg: string, error?: unknown) => {
			if (msg.includes('An error occurred')) {
				errorCaught = true;
			}
		};

		// Mock prompt to throw an error
		globalThis.prompt = (): string | null => {
			throw new Error('Simulated error');
		};

		await play();

		assertEquals(errorCaught, true, 'Should catch and log errors');
	} finally {
		globalThis.prompt = originalPrompt;
		console.error = originalConsoleError;
		console.log = originalConsoleLog;
	}
});

// ===========================
// Integration Tests
// ===========================

Deno.test({
	name: 'Integration: flushStdin can be called multiple times safely',
	sanitizeOps: false,
	sanitizeResources: false,
	fn: async () => {
		const originalIsTerminal = Deno.stdin.isTerminal;
		const originalSetRaw = Deno.stdin.setRaw;
		const originalRead = Deno.stdin.read;

		try {
			Deno.stdin.isTerminal = () => false;
			Deno.stdin.setRaw = () => {};
			Deno.stdin.read = () => Promise.resolve(null);

			// Call multiple times
			await flushStdin();
			await flushStdin();
			await flushStdin();

			// Should complete without errors
			assertEquals(true, true);
		} finally {
			Deno.stdin.isTerminal = originalIsTerminal;
			Deno.stdin.setRaw = originalSetRaw;
			Deno.stdin.read = originalRead;
		}
	},
});
