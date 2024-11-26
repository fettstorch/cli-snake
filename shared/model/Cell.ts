export type CellContentSnakeHead = '>' | '<' | 'v' | 'A'
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
