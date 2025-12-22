import { bgGreen, black, bold, dim, green, white } from '@std/fmt/colors';

export const CLEAR_SCREEN = '\x1b[2J\x1b[H';

export function clearScreen() {
	console.log(CLEAR_SCREEN);
}

export function printTitle() {
	console.log(bold(green(`
  ____  _                  
 |  _ \\(_) _ __   __ _  ___ 
 | |_) | || '_ \\ / _\` |/ _ \\
 |  __/| || | | | (_| | (_) |
 |_|   |_||_| |_|\\__, |\\___/ 
                 |___/       
`)));
	console.log(dim('----------------------------------------'));
}

export function printBoard(drum: boolean[]) {
	const columns = 10;
	const rows = Math.ceil(drum.length / columns);

	console.log(white(bold('Board Status:')));
	console.log('');

	for (let i = 0; i < rows; i++) {
		let rowStr = '';
		for (let j = 0; j < columns; j++) {
			const index = i * columns + j;
			if (index >= drum.length) break;

			const number = index + 1;
			const isCalled = drum[index];

			const numberStr = number.toString().padStart(3, ' ');

			if (isCalled) {
				rowStr += bgGreen(black(numberStr)) + ' ';
			} else {
				rowStr += dim(numberStr) + ' ';
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
	console.log(dim('----------------------------------------'));
	if (lastNumber !== null) {
		console.log(bold('Last Ball: ') + bgGreen(black(` ${lastNumber} `)));
	} else {
		console.log(bold('Last Ball: ') + dim(' - '));
	}
	console.log(bold(`Remaining: ${remaining}/${total}`));
	console.log(dim('----------------------------------------'));
}
