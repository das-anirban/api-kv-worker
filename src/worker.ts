/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Hono } from "hono"

type Bindings = {
	CACHE: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>();

app.get("/:username", async c => {
	const username = c.req.param("username")
	const cachedResp = await c.env.CACHE.get(username, "json")

	if(cachedResp) {
		return c.json(cachedResp)
	}

	const resp = await fetch(`https://api.github.com/users/${username}/repos`, {
		headers: {
			"User-Agent": "CF-Worker"
		}
	})
	const data = await resp.json()
	await c.env.CACHE.put(username, JSON.stringify(data))
	return c.json(data)
})

export default app