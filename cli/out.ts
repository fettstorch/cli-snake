import { sleep } from '@fettstorch/jule'

export async function animateText(text: string, charDelay = 30): Promise<void> {
	process.stdout.write('\r')
	for (const char of text) {
		process.stdout.write(char)
		await sleep(charDelay)
	}
	process.stdout.write('\n')
}

export function text<T extends keyof typeof ANSI>(
	text: unknown,
	...mod: T[]
): string {
	const prefix = mod.map((it) => ANSI[it]).join('')
	const postfix = ANSI.reset
	return `${prefix}${text}${postfix}`
}

const ANSI = {
	reset: '\x1b[0m',
	bold: '\x1b[1m',
	dim: '\x1b[2m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
} as const
