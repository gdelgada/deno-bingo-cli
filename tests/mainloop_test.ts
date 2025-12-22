import { assertEquals } from '@std/assert';
import { mainLoop } from '../src/main.ts';

// ===========================
// Tests for mainLoop (main entry point)
// ===========================

Deno.test({
	name: 'mainLoop: displays welcome message',
	sanitizeOps: false,
	sanitizeResources: false,
	fn: async () => {
		const originalConfirm = globalThis.confirm;
		const originalConsoleLog = console.log;
		const originalPrompt = globalThis.prompt;
		const originalExit = Deno.exit;

		const logMessages: string[] = [];
		let confirmCalled = false;
		let exitCalled = false;

		try {
			// Capture console.log
			console.log = (msg?: string) => {
				if (msg) logMessages.push(msg);
			};

			// Mock confirm to decline and exit
			globalThis.confirm = (_message?: string) => {
				confirmCalled = true;
				return false; // Don't play
			};

			// Mock Deno.exit to prevent actual exit
			Deno.exit = (code?: number) => {
				exitCalled = true;
				throw new Error('EXIT_CALLED'); // Use error to break the loop
			};

			// Mock prompt in case it gets called
			globalThis.prompt = () => null;

			try {
				await mainLoop();
			} catch (e: unknown) {
				// Expected exit throw
				if (e instanceof Error && e.message === 'EXIT_CALLED') {
					// This is expected
				} else {
					throw e;
				}
			}

			// Verify welcome message was displayed
			assertEquals(confirmCalled, true, 'Confirm should be called');
			assertEquals(exitCalled, true, 'Exit should be called');
			assertEquals(
				logMessages.some((msg) =>
					msg.includes('Welcome to Deno Bingo CLI')
				),
				true,
				'Should display welcome message',
			);
			assertEquals(
				logMessages.some((msg) => msg.includes('Goodbye')),
				true,
				'Should display goodbye message',
			);
		} finally {
			globalThis.confirm = originalConfirm;
			console.log = originalConsoleLog;
			globalThis.prompt = originalPrompt;
			Deno.exit = originalExit;
		}
	},
});

Deno.test({
	name: 'mainLoop: calls play when user confirms',
	sanitizeOps: false,
	sanitizeResources: false,
	fn: async () => {
		const originalConfirm = globalThis.confirm;
		const originalConsoleLog = console.log;
		const originalPrompt = globalThis.prompt;
		const originalExit = Deno.exit;

		let confirmCallCount = 0;
		let playWasCalled = false;

		try {
			console.log = () => {}; // Suppress output

			// Mock confirm to accept once, then decline
			globalThis.confirm = (_message?: string) => {
				confirmCallCount++;
				if (confirmCallCount === 1) {
					return true; // Play the game
				}
				return false; // Exit on second call
			};

			// Mock prompt for the play function
			let promptCallCount = 0;
			globalThis.prompt = (
				_message?: string,
				_defaultValue?: string,
			): string | null => {
				promptCallCount++;
				playWasCalled = true;

				// First prompt: drum size
				if (promptCallCount === 1) {
					return '5'; // Small drum
				}

				// Second prompt: exit game
				return 'exit';
			};

			// Mock Deno.exit
			Deno.exit = () => {
				throw new Error('EXIT_CALLED');
			};

			try {
				await mainLoop();
			} catch (e: unknown) {
				if (e instanceof Error && e.message === 'EXIT_CALLED') {
					// Expected
				} else {
					throw e;
				}
			}

			assertEquals(confirmCallCount, 2, 'Confirm should be called twice');
			assertEquals(playWasCalled, true, 'Play function should be called');
		} finally {
			globalThis.confirm = originalConfirm;
			console.log = originalConsoleLog;
			globalThis.prompt = originalPrompt;
			Deno.exit = originalExit;
		}
	},
});

Deno.test({
	name: 'mainLoop: exits with code 0 when user declines',
	sanitizeOps: false,
	sanitizeResources: false,
	fn: async () => {
		const originalConfirm = globalThis.confirm;
		const originalConsoleLog = console.log;
		const originalPrompt = globalThis.prompt;
		const originalExit = Deno.exit;

		let exitCode: number | undefined;

		try {
			console.log = () => {};

			globalThis.confirm = () => false; // Decline to play

			globalThis.prompt = () => null;

			Deno.exit = (code?: number) => {
				exitCode = code;
				throw new Error('EXIT_CALLED');
			};

			try {
				await mainLoop();
			} catch (e: unknown) {
				if (e instanceof Error && e.message === 'EXIT_CALLED') {
					// Expected
				} else {
					throw e;
				}
			}

			assertEquals(exitCode, 0, 'Should exit with code 0');
		} finally {
			globalThis.confirm = originalConfirm;
			console.log = originalConsoleLog;
			globalThis.prompt = originalPrompt;
			Deno.exit = originalExit;
		}
	},
});

Deno.test({
	name: 'mainLoop: loops back to menu after game ends',
	sanitizeOps: false,
	sanitizeResources: false,
	fn: async () => {
		const originalConfirm = globalThis.confirm;
		const originalConsoleLog = console.log;
		const originalPrompt = globalThis.prompt;
		const originalExit = Deno.exit;

		let confirmCallCount = 0;
		let gamesPlayed = 0;

		try {
			console.log = () => {};

			// Accept first two times, decline third time
			globalThis.confirm = () => {
				confirmCallCount++;
				return confirmCallCount < 3;
			};

			let promptCallCount = 0;
			globalThis.prompt = (): string | null => {
				promptCallCount++;
				gamesPlayed = Math.floor((promptCallCount + 1) / 2);

				// Odd calls: drum size
				if (promptCallCount % 2 === 1) {
					return '5';
				}

				// Even calls: exit game
				return 'exit';
			};

			Deno.exit = () => {
				throw new Error('EXIT_CALLED');
			};

			try {
				await mainLoop();
			} catch (e: unknown) {
				if (e instanceof Error && e.message === 'EXIT_CALLED') {
					// Expected
				} else {
					throw e;
				}
			}

			assertEquals(confirmCallCount, 3, 'Should loop back to menu');
			assertEquals(gamesPlayed >= 2, true, 'Should play multiple games');
		} finally {
			globalThis.confirm = originalConfirm;
			console.log = originalConsoleLog;
			globalThis.prompt = originalPrompt;
			Deno.exit = originalExit;
		}
	},
});
