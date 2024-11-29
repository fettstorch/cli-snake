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

	await redis
		.pipeline()
		.zadd('top:scores', { score, member: user })
		.zremrangebyrank('top:scores', 0, -11)
		.exec()

	return new Response('OK', { status: 200 })
}