import { Application } from 'express'
import path from 'path'
import { spotifyClient } from '../client'
import { backupService } from '../service'
import { generateRandomString } from '../util'

export const redirectHandler = (app: Application, shutdown: () => void) => {
	let stateVal: string

	app.get('/export', async (req, res) => {
		stateVal = generateRandomString(16)

		res.cookie('mode', 'export')
		const scopes = ['user-library-read']

		res.redirect(
			spotifyClient.auth.getRedirectPayload(scopes, stateVal) + '&mode=export'
		)
	})

	app.get('/import', async (req, res) => {
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

			const backupPath = '../spotify-backup'

			const authReq = await spotifyClient.auth.getAuthorizationToken(code as string)
			const { access_token } = authReq

			res.sendFile(path.join(__dirname, '../../index.html'))
			if (mode == 'export') {
				backupService.backupToFolder(access_token, backupPath)
			} else if (mode == 'import') {
				backupService.importToPlaylist(access_token, backupPath)
			}
		} catch (error) {
			console.log(error)
			res.json(error)
		}

		// Send closing tab
		// Close down server to allow the script to end automatically
		shutdown()
	})
}
