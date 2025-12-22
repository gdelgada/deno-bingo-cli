# Deno Bingo CLI

A modern, functional Bingo drum simulator built with Deno.

![Details](https://img.shields.io/badge/deno-v2.0-blue)
![License](https://img.shields.io/badge/license-GPLv3-green)

## Features

- **Customizable Drum Size**: Default is 90 balls, but you can choose any number.
- **Visual Board**: See the status of all numbers in a clean, color-coded grid.
- **History Tracking**: Always shows the last called number clearly.
- **Pure Functional Core**: Logic is separated from UI using pure functions.
- **Cross-platform**: Runs anywhere Deno runs (Windows, macOS, Linux).

## Prerequisites

- [Deno](https://deno.land/) (v1.30 or higher recommended).

## Installation

Clone the repository:

```bash
git clone https://github.com/gdelgada/deno-bingo-cli.git
cd deno-bingo-cli
```

## Usage

### Run Locally

To start the game immediately:

```bash
deno task dev
```

### Compile to Executable

You can compile the application to a standalone binary for your system:

```bash
deno task compile
```

The executable will be located in `output/bingo-cli` (or `bingo-cli.exe` on Windows).

## Development

The project includes tasks for common development workflows:

- **Run Tests**: `deno task test`
- **Lint Code**: `deno task lint`
- **Format Code**: `deno task fmt`
- **Type Check**: `deno task check`

## Project Structure

- `src/main.ts`: Entry point and game loop handling.
- `src/ui.ts`: UI rendering logic using `@std/fmt`.
- `src/services/drum.ts`: Core game logic (pure functions).
- `tests/`: Unit tests.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.