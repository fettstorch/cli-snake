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

	get neck(): SnakeCell {
		return this.parts[1]
	}

	set direction(newDirection: CellContentSnakeHead) {
		const head = this.head
		const neck = this.parts[1]

		// prevent faulty 180° turns
		const horizontal = newDirection === '<' || newDirection === '>'
		const vertical = newDirection === 'A' || newDirection === 'V'

		if (horizontal && head.y === neck.y) {
			return
		}
		if (vertical && head.x === neck.x) {
			return
		}
		this.head.value = newDirection
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
