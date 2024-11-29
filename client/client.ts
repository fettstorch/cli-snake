export const BASE_URL = 'https://snake-three-beta.vercel.app/'

export async function clientSetScore(
	user: string,
	score: number,
): Promise<'setScore' | 'scoreNotUpdated'> {
	const response = await fetch(`${BASE_URL}/api/setScore`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ user, score }),
	})

	if (!response.ok) {
		throw new Error(`Failed to set score: ${response.statusText}`)
	}

	const message = await response.text()
	return message.includes('Score updated') ? 'setScore' : 'scoreNotUpdated'
}

export async function clientGetTopScores(): Promise<
	ReadonlyArray<{ user: string; score: number }>
> {
	const response = await fetch(`${BASE_URL}/api/getTopScores`)

	if (!response.ok) {
		throw new Error(`Failed to get top scores: ${response.statusText}`)
	}

	return response.json()
}
