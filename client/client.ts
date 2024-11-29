export const BASE_URL = 'https://snake-three-beta.vercel.app/'

export async function setScore(user: string, score: number): Promise<void> {
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
}

export async function getTopScores(): Promise<
	ReadonlyArray<{ user: string; score: number }>
> {
	const response = await fetch(`${BASE_URL}/api/getTopScores`)

	if (!response.ok) {
		throw new Error(`Failed to get top scores: ${response.statusText}`)
	}

	return response.json()
}
