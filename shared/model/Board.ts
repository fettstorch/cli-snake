import { when } from '@fettstorch/jule'
import type { CellCoordinates, CellContentSnakeHead } from './Cell'

export class Board {
	constructor(
		readonly width: number,
		readonly height: number,
	) {}

	getCellInDirection(
		direction: CellContentSnakeHead,
		start: CellCoordinates,
	): CellCoordinates {
		return when(direction)({
			'>': { x: start.x - 1, y: start.y },
			'<': { x: start.x + 1, y: start.y },
			v: { x: start.x, y: start.y - 1 },
			A: { x: start.x, y: start.y + 1 },
		})
	}

	checkCoordinates(coordinates: CellCoordinates): 'valid' | 'outOfBounds' {
		if (
			coordinates.x < 0 ||
			coordinates.x >= this.width ||
			coordinates.y < 0 ||
			coordinates.y >= this.height
		) {
			return 'outOfBounds'
		}
		return 'valid'
	}
}
