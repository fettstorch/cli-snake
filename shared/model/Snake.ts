import { when } from '@fettstorch/jule'
import type {
	CellContentSnake,
	CellContentSnakeHead,
	CellCoordinates,
} from './Cell'

type SnakeCell = CellCoordinates & { value: CellContentSnake }
type SnakeHeadCell = SnakeCell & { value: CellContentSnakeHead }

export class Snake {
	readonly parts: [SnakeHeadCell, ...SnakeCell[]]
	constructor(snakeHeadStart: CellCoordinates) {
		this.parts = [
			{ ...snakeHeadStart, value: '>' },
			{ x: snakeHeadStart.x + 1, y: snakeHeadStart.y, value: 'O' },
		]
	}

	get head(): SnakeHeadCell {
		return this.parts[0]
	}

	get length(): number {
		return this.parts.length
	}

	get tail(): SnakeCell[] {
		return this.parts.slice(1)
	}

	set direction(newDirection: CellContentSnakeHead) {
		const currentDir = this.head.value
		this.head.value =
			when(newDirection)({
				'<': (it) => currentDir !== '>' && it,
				'>': (it) => currentDir !== '<' && it,
				A: (it) => currentDir !== 'v' && it,
				v: (it) => currentDir !== 'A' && it,
			}) || currentDir
	}

	moveTo(cell: CellCoordinates) {
		this.parts.unshift({ ...this.head, ...cell })
		this.parts[1].value = 'O'
		this.parts.pop()
	}

	grow(cell: CellCoordinates) {
		this.parts.push({ ...cell, value: 'O' })
	}
}
