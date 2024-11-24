import { Board } from '../model/Board'
import type { CellContent, CellCoordinates } from '../model/Cell'
import { Snake } from '../model/Snake'

export class Game {
	readonly snake: Snake
	readonly board: Board
	fly!: CellCoordinates
	swallowedFlies: CellCoordinates[] = []
	pendingGrowth: CellCoordinates | undefined
	freeCells: CellCoordinates[]
	gameOver = false

	constructor(board: { width: number; height: number }) {
		this.board = new Board(board.width, board.height)
		const boardCenter: CellCoordinates = {
			x: Math.floor(board.width / 2),
			y: Math.floor(board.height / 2),
		}
		this.snake = new Snake(boardCenter)

		this.freeCells = Array.from(
			{ length: board.width * board.height - 1 },
			(_, i) => ({
				x: i % board.width,
				y: Math.floor(i / board.width),
			}),
		).filter((cell) => cell.x !== boardCenter.x || cell.y !== boardCenter.y)
		this.positionFly()
	}

	get score() {
		return this.snake.length
	}

	get boardState() {
		const boardSnapshot: (CellContent | '●')[][] = Array.from(
			{ length: this.board.height },
			() => Array.from({ length: this.board.width }, () => ' '),
		)
		boardSnapshot[this.fly.y][this.fly.x] = '🪰'
		for (const part of this.snake.tail) {
			boardSnapshot[part.y][part.x] = part.value
		}
		for (const swallowedFly of this.swallowedFlies) {
			boardSnapshot[swallowedFly.y][swallowedFly.x] = '●'
		}
		boardSnapshot[this.snake.head.y][this.snake.head.x] = this.snake.head.value
		return boardSnapshot
	}

	positionFly() {
		const randomIndex = Math.floor(Math.random() * this.freeCells.length)
		this.fly = this.freeCells[randomIndex]
		this.freeCells.splice(randomIndex, 1)
	}

	/** Move the snake, update the free cells, position a fly */
	process(): 'ongoing' | 'gameOver' {
		const snakesTailEndPosition: CellCoordinates =
			this.snake.parts[this.snake.length - 1]
		const newHeadPosition = this.board.getCellInDirection(
			this.snake.head.value,
			this.snake.head,
		)
		const newHeadPositionStatus = this.board.checkCoordinates(newHeadPosition)
		if (newHeadPositionStatus === 'outOfBounds') {
			return 'gameOver'
		}

		this.snake.moveTo(newHeadPosition)

		// check for collision with own body
		if (
			this.snake.tail.find(
				(part) => part.x === newHeadPosition.x && part.y === newHeadPosition.y,
			)
		) {
			return 'gameOver'
		}

		// consume pending growth
		if (this.pendingGrowth) {
			this.snake.grow(this.pendingGrowth)
			this.pendingGrowth = undefined
		}

		// check if snake should grow next tick
		const nextFlyToProcess = this.swallowedFlies[0]
		const lastTailElement = this.snake.parts[this.snake.parts.length - 1]
		if (
			nextFlyToProcess &&
			lastTailElement.x === nextFlyToProcess.x &&
			lastTailElement.y === nextFlyToProcess.y
		) {
			this.swallowedFlies.shift()
			this.pendingGrowth = nextFlyToProcess
		}

		// update free cells
		this.freeCells = this.freeCells.filter(
			(cell) => cell.x !== newHeadPosition.x || cell.y !== newHeadPosition.y,
		)
		this.freeCells.push(snakesTailEndPosition)

		// handle eating a fly
		if (this.snake.head.x === this.fly.x && this.snake.head.y === this.fly.y) {
			this.swallowedFlies.push(this.fly)
			this.positionFly()
		}

		return 'ongoing'
	}
}
