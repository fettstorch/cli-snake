#!/usr/bin/env node

import { Board } from '../shared/model/Board'
import { Game } from '../shared/game/Game'
import { sleep } from '@fettstorch/jule'
import type { CellContent } from '../shared/model/Cell'
import { keyControls } from './keyControls'

const sleepTime = 100

async function main() {
	const terminalWidth = process.stdout.columns - 1
	const terminalHeight = process.stdout.rows - 1

	const boardWidth = Math.min(terminalWidth, 20)
	const boardHeight = Math.min(terminalHeight, 15)

	if (boardWidth < 2 || boardHeight < 2) {
		console.error('Terminal window too small. Minimum size is 2x2.')
		process.exit(1)
	}

	const board = new Board(boardWidth, boardHeight)
	const game = new Game(board)

	const { directionInput, cleanup } = keyControls()
	directionInput.subscribe((input) => {
		if (input === 'exit') {
			cleanup()
			process.exit(0)
		}

		game.snake.direction = input
	})

	while (game.process() === 'ongoing') {
		console.clear()
		console.log('Controls: ←↑↓→ or WASD')
		printBoardState(game.boardState)
		console.log('Score: ', game.score)
		await sleep(sleepTime)
	}
	cleanup()
	process.exit(0)

	function printBoardState(state: (CellContent | '●')[][]) {
		console.log(`╔${'═'.repeat(board.width)}╗`)
		for (const row of state) {
			console.log(`║${row.join('')}║`)
		}
		console.log(`╚${'═'.repeat(board.width)}╝`)
	}
}

main()
