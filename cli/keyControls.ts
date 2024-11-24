import { Observable } from '@fettstorch/jule'
import type { CellContentSnakeHead as Direction } from '../shared/model/Cell'
import * as readline from 'node:readline'

export function keyControls() {
	const observable = new Observable<Direction | 'exit'>()

	process.stdin.setRawMode(true)
	readline.emitKeypressEvents(process.stdin)

	process.stdin.on('keypress', (_, key) => {
		switch (key.name) {
			case 'up':
			case 'w':
				return observable.emit('v')
			case 'down':
			case 's':
				return observable.emit('A')
			case 'left':
			case 'a':
				return observable.emit('>')
			case 'right':
			case 'd':
				return observable.emit('<')
			case 'c':
			case 'escape':
				return observable.emit('exit')
		}
	})

	function cleanup() {
		process.stdin.setRawMode(false)
	}

	return {
		directionInput: observable,
		cleanup,
	}
}
