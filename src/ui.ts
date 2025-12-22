import {
	bgBlue,
	bgGreen,
	bgRed,
	black,
	blue,
	bold,
	cyan,
	dim,
	gray,
	green,
	magenta,
	red,
	white,
	yellow,
} from '@std/fmt/colors';

export const CLEAR_SCREEN = '\x1b[2J\x1b[H';

export function clearScreen() {
	console.log(CLEAR_SCREEN);
}

function centerText(text: string, width: number): string {
	// deno-lint-ignore no-control-regex
	const len = text.replace(/\x1b\[[0-9;]*m/g, '').length; // Strip ansi codes for length
	if (len >= width) return text;
	const left = Math.floor((width - len) / 2);
	const right = width - len - left;
	return ' '.repeat(left) + text + ' '.repeat(right);
}

function getProgressBar(current: number, total: number, width: number = 40): string {
	const percentage = current / total;
	const filledChars = Math.round(percentage * width);
	const emptyChars = width - filledChars;
	
	const filled = bgGreen(' '.repeat(filledChars));
	const empty = gray('░'.repeat(emptyChars));
	
	return `${filled}${empty} ${Math.round(percentage * 100)}%`;
}

export function printTitle() {
	const width = 60;
	console.log(cyan('╔' + '═'.repeat(width) + '╗'));
	console.log(cyan('║') + centerText(magenta(bold('  B I N G O   M A S T E R  ')), width) + cyan('║'));
	console.log(cyan('╚' + '═'.repeat(width) + '╝'));
}

export function printBoard(drum: boolean[]) {
	const columns = 10;
	const rows = Math.ceil(drum.length / columns);

	console.log(bold(white('\n  BOARD STATUS')));
	console.log(dim('  ' + '─'.repeat(45)));

	for (let i = 0; i < rows; i++) {
		let rowStr = '  ';
		for (let j = 0; j < columns; j++) {
			const index = i * columns + j;
			if (index >= drum.length) break;

			const number = index + 1;
			const isCalled = drum[index];
			const numStr = number.toString().padStart(3, ' ');

			if (isCalled) {
				// Called number: Green background, black text
				rowStr += bgGreen(black(numStr)) + ' ';
			} else {
				// Uncalled: Dimmed
				rowStr += dim(numStr) + ' ';
			}
		}
		console.log(rowStr);
	}
	console.log('');
}

export function printStatus(
	lastNumber: number | null,
	remaining: number,
	total: number,
) {
	const calledCount = total - remaining;
	const width = 60;

	// Draw Big Number Box
	console.log(yellow('┌' + '─'.repeat(width) + '┐'));
	
	if (lastNumber !== null) {
		const numStr = lastNumber.toString().padStart(2, '0');
		console.log(yellow('│') + centerText(dim('LATEST BALL'), width) + yellow('│'));
		console.log(yellow('│') + centerText(bgRed(white(bold(`  ${numStr}  `))), width) + yellow('│'));
	} else {
		console.log(yellow('│') + centerText(dim('WAITING FOR START...'), width) + yellow('│'));
		console.log(yellow('│') + centerText(dim(' -- '), width) + yellow('│'));
	}
	
	console.log(yellow('└' + '─'.repeat(width) + '┘'));

	// Progress
	console.log('\n  ' + bold('Progress:'));
	console.log('  ' + getProgressBar(calledCount, total, 45));
	console.log('  ' + dim(`Called: ${calledCount} | Remaining: ${remaining}`));
	console.log('');
}
