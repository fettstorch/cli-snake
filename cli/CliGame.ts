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
import { clientSetScore, clientGetTopScores } from '../client/client'
import * as readline from 'node:readline'
import { animateText, text } from './out'

const baseSleepTime = 120
const assumedTerminalCharacterAspectRatio = 1.3
const getSleepTime = (direction: CellContentSnakeHead) =>
	when(direction)({
		'<': baseSleepTime,
		'>': baseSleepTime,
		else: baseSleepTime * assumedTerminalCharacterAspectRatio,
	})
let bufferedInput: CellContentSnakeHead | undefined

main()

// --- module private

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
	const cleanupDirectionInput = directionInput.subscribe((input) => {
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
		console.log(text('🐍 Snake Game', 'bold'))
		console.log(text('Controls: ←↑↓→ or WASD', 'dim'))
		printBoardState()
		console.log(
			text('Multiplier:', 'cyan') + text(game.scoreMultiplier, 'bold', 'cyan'),
		)
		console.log(text('Score:', 'cyan') + text(game.score, 'bold', 'cyan'))
		if (bufferedInput) {
			game.snake.direction = bufferedInput
			bufferedInput = undefined
		}

		await sleep(getSleepTime(game.snake.head.value))
	}

	cleanupDirectionInput()

	const { praise, followUp } = choosePraiseText(game.score)
	await animateText(praise)
	await sleep(1000)
	await animateText(followUp)

	await animateText(text('Enter your name: ', 'cyan'))
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	const userName = await new Promise<string>((resolve) => {
		rl.question(text('> ', 'cyan'), (answer) => {
			rl.close()
			resolve(
				answer.trim() || `user-${Math.random().toString(36).substring(2, 15)}`,
			)
		})
	})
	const updateResult = await clientSetScore(userName, game.score)
	const topScores = clientGetTopScores()

	await animateText(text('✨ Leaderboard ✨\n', 'bold', 'yellow'), 50)
	await topScores.then(async (scoreEntries) => {
		let i = 0
		const thatsYou = text(
			`<-- ${updateResult === 'setScore' ? 'THATS YOU! 🎉🤯' : 'Still here 🙂'}`,
			'bold',
			'yellow',
		)
		for (const { user, score } of scoreEntries) {
			const medal = when(i)({
				0: '🥇',
				1: '🥈',
				2: '🥉',
				else: '',
			}).padEnd(2)
			await animateText(
				` ${score.toString().padStart(3)} - ${i++ < 3 ? medal : ''}${user} ${user === userName ? thatsYou : ''}`,
				7,
			)
		}
	})

	cleanup()
	process.exit(0)

	function printBoardState() {
		console.log(text(`┌${'─'.repeat(board.width)}┐`, 'cyan'))
		for (const row of boardStateSnapshot()) {
			console.log(text('│', 'cyan') + row.join('') + text('│', 'cyan'))
		}
		console.log(text(`└${'─'.repeat(board.width)}┘`, 'cyan'))
	}

	function boardStateSnapshot() {
		const snapshot = Array.from({ length: board.height }, () =>
			Array.from({ length: board.width }, () => ' '),
		)
		snapshot[game.fly.y][game.fly.x] = text('%', 'bold', 'magenta')
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
			snapshot[current.y][current.x] = text(content, 'green')
		}

		for (const swallowedFly of game.swallowedFlies) {
			snapshot[swallowedFly.y][swallowedFly.x] = text('●', 'green')
		}
		snapshot[game.snake.head.y][game.snake.head.x] = text(
			game.snake.head.value,
			'bold',
			'green',
		)

		return snapshot
	}
}

function choosePraiseText(score: number): {
	praise: string
	followUp: string
} {
	switch (true) {
		case score > 69:
			return {
				praise: MESSAGES.huh,
				followUp: MESSAGES.legendaryFollow,
			}
		case score > 59:
			return {
				praise: MESSAGES.god,
				followUp: MESSAGES.legendaryFollow,
			}
		case score > 49:
			return {
				praise: MESSAGES.demiGod,
				followUp: MESSAGES.legendaryFollow,
			}
		case score > 39:
			return {
				praise: MESSAGES.legendary,
				followUp: MESSAGES.legendaryFollow,
			}
		case score > 29:
			return {
				praise: MESSAGES.amazing,
				followUp: MESSAGES.amazingFollow,
			}
		case score > 19:
			return {
				praise: MESSAGES.great,
				followUp: MESSAGES.greatFollow,
			}
		case score > 9:
			return {
				praise: MESSAGES.good,
				followUp: MESSAGES.goodFollow,
			}
		default:
			return {
				praise: MESSAGES.bad,
				followUp: MESSAGES.badFollow,
			}
	}
}

const MESSAGES = {
	huh: text(
		'WOW.. maybe you should contribute to www.github.com/fettstorch/cli-snake and make some more praise texts because you just made more points than what i thought would anyone care to do.. 🤷‍♂️',
		'bold',
		'green',
	),
	god: text(
		"Ok. Thats it... These levels of skill are illegal! I'm calling the police! 🚨👮‍♂️ ",
		'bold',
		'green',
	),
	demiGod: text(
		"Your are growing too powerful... this shouldn't be possible... 😨 ",
		'bold',
		'green',
	),
	legendary: text('🎊 WOW! You are officially amazing!!! 🏆', 'bold', 'green'),
	legendaryFollow: text(
		'Give @fettstorch.com (🦋) a heads up to let me know how insane you are! 🤩🎉',
		'bold',
		'green',
	),
	amazing: text(
		'Uhm.. why are you so good at this 🤯 👏👏👏!? ',
		'bold',
		'green',
	),
	amazingFollow: text(
		'Are... you the one?... Could you actually reach 40!?!?...',
		'bold',
		'green',
	),
	great: text('Dayum! Well done! 😎🎉', 'bold', 'green'),
	greatFollow: text(
		'I think maybe you have a chance to reach 30...👀',
		'bold',
		'green',
	),
	good: text('Nice score! 😊🎉', 'bold', 'green'),
	goodFollow: text("You're not too far off from 20...👀", 'bold', 'green'),
	bad: text('Not bad!..', 'bold', 'yellow'),
	badFollow: text('... jk... that was kinda bad 😊', 'bold', 'yellow'),
} as const
