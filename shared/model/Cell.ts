import { when } from '@fettstorch/jule'

export type CellContentSnakeHead = '>' | '<' | 'V' | 'A'
export type CellContentSnakeBody = 'O'
export type CellContentSwallowedFly = '█'
export type CellContentSnake =
	| CellContentSnakeHead
	| CellContentSnakeBody
	| CellContentSwallowedFly

export type CellContentFree = ' '

export type CellContentFly = '%'

export type CellContent = CellContentSnake | CellContentFree | CellContentFly

export type CellCoordinates = { x: number; y: number }

export function equals(a: CellCoordinates, b: CellCoordinates) {
	return a.x === b.x && a.y === b.y
}

export const getOppositeDirection = (direction: CellContentSnakeHead) =>
	when(direction)({
		'>': '<',
		'<': '>',
		V: 'A',
		A: 'V',
	} as const)
