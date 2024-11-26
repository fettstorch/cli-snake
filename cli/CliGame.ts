#!/usr/bin/env node

import { Board } from '../shared/model/Board'
import { Game } from '../shared/game/Game'
import { sleep } from '@fettstorch/jule'
import { keyControls } from './keyControls'

const sleepTime = 120

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
		printBoardState()
		console.log('Score: ', game.score)
		await sleep(sleepTime)
	}
	cleanup()
	process.exit(0)

	function boardStateSnapshot() {
		const snapshot = Array.from({ length: board.height }, () =>
			Array.from({ length: board.width }, () => ' '),
		)
		snapshot[game.fly.y][game.fly.x] = '%'
		for (let i = 0; i < game.snake.tail.length; i++) {
			const prev = game.snake.tail[i - 1] ?? game.snake.head
			const current = game.snake.tail[i]
			const next = game.snake.tail[i + 1]

			let content = '•'
			if (next === undefined) {
				content = '•'
			} else if (prev.x === current.x && current.x === next.x) {
				content = '║'
			} else if (prev.y === current.y && current.y === next.y) {
				content = '═'
			} else {
				// For corners, we need to determine which way we're turning
				const fromVertical = prev.x === current.x
				const goingRight = next.x > current.x
				const goingDown = next.y > current.y

				if (fromVertical) {
					// Coming from vertical (║) and turning
					content = goingRight
						? prev.y < current.y
							? '╚'
							: '╔' // ║ to right
						: prev.y < current.y
							? '╝'
							: '╗' // ║ to left
				} else {
					// Coming from horizontal (═) and turning
					content = goingDown
						? prev.x < current.x
							? '╗'
							: '╔' // ═ to down
						: prev.x < current.x
							? '╝'
							: '╚' // ═ to up
				}
			}
			snapshot[current.y][current.x] = content
		}

		for (const swallowedFly of game.swallowedFlies) {
			snapshot[swallowedFly.y][swallowedFly.x] = 'O' //'●'
		}
		snapshot[game.snake.head.y][game.snake.head.x] = game.snake.head.value

		return snapshot
	}

	function printBoardState() {
		console.log(`┌${'─'.repeat(board.width)}┐`)
		for (const row of boardStateSnapshot()) {
			console.log(`│${row.join('')}│`)
		}
		console.log(`└${'─'.repeat(board.width)}┘`)
	}
}

main()
