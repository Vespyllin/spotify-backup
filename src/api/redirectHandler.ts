import { Application } from 'express'
import path from 'path'
import { spotifyClient } from '../client'
import { backupService } from '../service'
import { generateRandomString, sleep } from '../util'

export const redirectHandler = (
	app: Application,
	shutdown: () => void,
	backupPath: string,
	backupTitle?: string
) => {
	let stateVal: string

	app.get('/export', async (_req, res) => {
		stateVal = generateRandomString(16)

		res.cookie('mode', 'export')
		const scopes = ['user-library-read']

		res.redirect(
			spotifyClient.auth.getRedirectPayload(scopes, stateVal) + '&mode=export'
		)
	})

	app.get('/import', async (_req, res) => {
		stateVal = generateRandomString(16)

		res.cookie('mode', 'import')
		const scopes = ['playlist-modify-private', 'user-library-read']

		res.redirect(
			spotifyClient.auth.getRedirectPayload(scopes, stateVal) + '&mode=import'
		)
	})

	app.get('/callback', async (req, res) => {
		try {
			const { code, state } = req.query
			const { mode } = req.cookies
			if (state !== stateVal) throw new Error('Mismatched state values.')

			const authReq = await spotifyClient.auth.getAuthorizationToken(code as string)
			const { access_token } = authReq

			if (mode == 'export') {
				backupService.backupToFolder(access_token, backupPath)
			} else if (mode == 'import') {
				backupService.importToPlaylist(access_token, backupPath, { backupTitle })
			} else {
				throw new Error('Mode not set to import/export.')
			}
		} catch (error) {
			console.log(error)
			await sleep(5000)
		}

		// Send closing tab
		res.sendFile(path.join(__dirname, '../../index.html'))
		// Close down server to allow the script to end automatically
		shutdown()
	})
}
