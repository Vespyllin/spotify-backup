import axios from 'axios'
import { stringifyQueries } from '../util'

export const AuthClient = (
	spotifyURL: string,
	CLIENT_ID: string,
	SECRET_BUFFER_B64: string,
	REDIRECT_URI: string
) => {
	const axiosInstance = axios.create({
		baseURL: `${spotifyURL}/api/token`,
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${SECRET_BUFFER_B64}`,
		},
	})

	const getAuthorizationToken = async (code: string) => {
		return (
			await axiosInstance.post(
				``,
				stringifyQueries({
					grant_type: 'authorization_code',
					code: code as string,
					redirect_uri: REDIRECT_URI,
				})
			)
		).data
	}

	const refreshToken = async (refresh_token: string) => {
		return (
			await axiosInstance.post(
				``,
				stringifyQueries({
					grant_type: 'refresh_token',
					refresh_token,
				})
			)
		).data
	}

	const getRedirectPayload = (scopes: string[], state?: string) => {
		const queries = {
			client_id: CLIENT_ID,
			response_type: 'code',
			redirect_uri: REDIRECT_URI,
			scope: scopes,
		}

		if (state) queries['state'] = state

		return `${spotifyURL}/authorize?${stringifyQueries(queries)}`
	}

	return {
		getAuthorizationToken,
		refreshToken,
		getRedirectPayload,
	}
}
