import { Redis } from '@upstash/redis'

export async function POST(request: Request) {
	const redis = new Redis({
		url: process.env.KV_REST_API_URL,
		token: process.env.KV_REST_API_TOKEN,
	})

	const { user, score } = (await request.json()) as {
		user: string
		score: number
	}

	if (!user) {
		return new Response('Missing user parameter', { status: 400 })
	}

	// Get current score
	const currentScore = await redis.zscore('top:scores', user)

	// Only update if there's no existing score or the new score is higher
	if (!currentScore || score > currentScore) {
		await redis
			.pipeline()
			.zadd('top:scores', { score, member: user })
			.zremrangebyrank('top:scores', 0, -11)
			.exec()
		return new Response('Score updated', { status: 200 })
	}

	return new Response('Score not updated - current high score is better', {
		status: 200,
	})
}
