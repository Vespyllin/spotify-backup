import { exec } from 'child_process'
import express from 'express'
import { Server } from 'http'
import { redirectHandler } from './redirectHandler'

import cookieparser from 'cookie-parser'

export const initAPI = (port: string, initEndpoint: string) => {
	const app = express()

	app.use(cookieparser())
	redirectHandler(app, () => server.close())

	const server: Server = app.listen(port, () => {
		exec(`start http://localhost:${port}/${initEndpoint}`)
	})
}
