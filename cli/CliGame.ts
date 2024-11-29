#!/usr/bin/env node

import { Board } from '../shared/model/Board'
import { Game } from '../shared/game/Game'
import { sleep, when } from '@fettstorch/jule'
import { keyControls } from './keyControls'
import {
	equals,
	getOppositeDirection,
	type CellContentSnakeHead,
} from 'shared/model/Cell'

const baseSleepTime = 120
const assumedTerminalCharacterAspectRatio = 1.3
const getSleepTime = (direction: CellContentSnakeHead) =>
	when(direction)({
		'<': baseSleepTime,
		'>': baseSleepTime,
		else: baseSleepTime * assumedTerminalCharacterAspectRatio,
	})
let bufferedInput: CellContentSnakeHead | undefined

const ANSI = {
	reset: '\x1b[0m',
	bold: '\x1b[1m',
	dim: '\x1b[2m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
} as const

async function animateText(text: string, charDelay = 30): Promise<void> {
	process.stdout.write('\r')
	for (const char of text) {
		process.stdout.write(char)
		await sleep(charDelay)
	}
	process.stdout.write('\n')
}

async function main() {
	const terminalWidth = process.stdout.columns - 1
	const terminalHeight = process.stdout.rows - 1

	const boardWidth = Math.min(terminalWidth, 20)
	const boardHeight = Math.min(terminalHeight, 10)

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

		const oppositeDirection = getOppositeDirection(game.snake.head.value)
		const oneFieldBehindHead = board.getCellInDirection(
			oppositeDirection,
			game.snake.head,
		)
		const isNeckBehindCurrentDirection = equals(
			oneFieldBehindHead,
			game.snake.neck,
		)

		if (isNeckBehindCurrentDirection) {
			game.snake.direction = input
		} else {
			bufferedInput = input
		}
	})

	while (game.process() === 'ongoing') {
		console.clear()
		console.log(`${ANSI.bold}🐍 Snake Game${ANSI.reset}`)
		console.log(`${ANSI.dim}Controls: ←↑↓→ or WASD${ANSI.reset}`)
		printBoardState()
		console.log(
			`${ANSI.cyan}Multiplier: ${ANSI.bold}${game.scoreMultiplier}${ANSI.reset}`,
		)
		console.log(`${ANSI.cyan}Score: ${ANSI.bold}${game.score}${ANSI.reset}`)
		if (bufferedInput) {
			game.snake.direction = bufferedInput
			bufferedInput = undefined
		}

		await sleep(getSleepTime(game.snake.head.value))
	}

	if (game.score > 69) {
		await animateText(MESSAGES.huh)
		await sleep(1000)
		await animateText(MESSAGES.legendaryFollow)
	} else if (game.score > 59) {
		await animateText(MESSAGES.god)
		await sleep(1000)
		await animateText(MESSAGES.legendaryFollow)
	} else if (game.score > 49) {
		await animateText(MESSAGES.demiGod)
		await sleep(1000)
		await animateText(MESSAGES.legendaryFollow)
	} else if (game.score > 39) {
		await animateText(MESSAGES.legendary)
		await sleep(1000)
		await animateText(MESSAGES.legendaryFollow)
	} else if (game.score > 29) {
		await animateText(MESSAGES.amazing)
		await sleep(1000)
		await animateText(MESSAGES.amazingFollow)
	} else if (game.score > 19) {
		await animateText(MESSAGES.great)
		await sleep(1000)
		await animateText(MESSAGES.greatFollow)
	} else if (game.score > 9) {
		await animateText(MESSAGES.good)
		await sleep(1000)
		await animateText(MESSAGES.goodFollow)
	} else {
		await animateText(MESSAGES.badInitial)
		await sleep(1000)
		await animateText(MESSAGES.badFollow)
	}
	cleanup()
	process.exit(0)

	function boardStateSnapshot() {
		const snapshot = Array.from({ length: board.height }, () =>
			Array.from({ length: board.width }, () => ' '),
		)
		snapshot[game.fly.y][game.fly.x] =
			`${ANSI.bold}${ANSI.magenta}%${ANSI.reset}`
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
			snapshot[current.y][current.x] = `${ANSI.green}${content}${ANSI.reset}`
		}

		for (const swallowedFly of game.swallowedFlies) {
			snapshot[swallowedFly.y][swallowedFly.x] = `${ANSI.green}●${ANSI.reset}`
		}
		snapshot[game.snake.head.y][game.snake.head.x] =
			`${ANSI.bold}${ANSI.green}${game.snake.head.value}${ANSI.reset}`

		return snapshot
	}

	function printBoardState() {
		console.log(`${ANSI.cyan}┌${'─'.repeat(board.width)}┐${ANSI.reset}`)
		for (const row of boardStateSnapshot()) {
			console.log(
				`${ANSI.cyan}│${ANSI.reset}${row.join('')}${ANSI.cyan}│${ANSI.reset}`,
			)
		}
		console.log(`${ANSI.cyan}└${'─'.repeat(board.width)}┘${ANSI.reset}`)
	}
}

const MESSAGES = {
	huh: `${ANSI.bold}${ANSI.green} Well.. maybe you should contribute to www.github.com/schnullerpip/cli-snake and make some more praise texts because you just made more points than what i thought would anyone care to do.. 🤷‍♂️${ANSI.reset}`,
	god: `${ANSI.bold}${ANSI.green} Ok. Thats it... I'm calling the police! 🚨👮‍♂️ These levels of skill are illegal!${ANSI.reset}`,
	demiGod: `${ANSI.bold}${ANSI.green} Your are growing too powerful... this shouldn't be possible... 😨 ${ANSI.reset}`,
	legendary: `${ANSI.bold}${ANSI.green}🎊 WOW! You are officially the best at this!🥇${ANSI.reset}`,
	legendaryFollow: `${ANSI.bold}${ANSI.green}Give @joolean.dev (🦋) a heads up to let me know how insane you are! 🤩🎉${ANSI.reset}`,
	amazing: `${ANSI.bold}${ANSI.green}Uhm.. why are you so good at this 🤯 👏👏👏!? ${ANSI.reset}`,
	amazingFollow: `${ANSI.bold}${ANSI.green}Are... you the one?... Could you actually reach 40!?!?...${ANSI.reset}`,
	great: `${ANSI.bold}${ANSI.green}Dayum! Well done! 😎🎉${ANSI.reset}`,
	greatFollow: `${ANSI.bold}${ANSI.green}I think maybe you have a chance to reach 30...👀${ANSI.reset}`,
	good: `${ANSI.bold}${ANSI.green}Nice score! 😊🎉${ANSI.reset}`,
	goodFollow: `${ANSI.bold}${ANSI.green}You're not too far off from 20...👀${ANSI.reset}`,
	badInitial: `${ANSI.bold}${ANSI.yellow}Not bad!..${ANSI.reset}`,
	badFollow: `${ANSI.bold}${ANSI.yellow}... jk... that was kinda bad 😊${ANSI.reset}`,
} as const

main()
