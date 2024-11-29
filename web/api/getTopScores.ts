import { Redis } from '@upstash/redis'

export async function GET() {
	const redis = new Redis({
		url: process.env.KV_REST_API_URL,
		token: process.env.KV_REST_API_READ_ONLY_TOKEN,
	})

	const result = (await redis.zrange('top:scores', 0, -1, {
		rev: true,
		withScores: true,
	})) as number[]

	return Response.json(
		Array.from({ length: result.length / 2 }, (_, i) => ({
			user: result[i * 2],
			score: Number(result[i * 2 + 1]),
		})),
		{ status: 200 },
	)
}
