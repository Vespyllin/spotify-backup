import axios from 'axios'
import { stringifyQueries } from '../util'

export const PlaylistClient = (spotifyAPI: string) => {
	const axiosInstance = axios.create({
		baseURL: `${spotifyAPI}/v1/playlists`,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
	})

	const addTracksToPlaylist = async (
		access_token: string,
		playlist_id: string,
		trackURIs: string
	) => {
		axiosInstance.interceptors.request.use((config) => {
			if (config.headers) config.headers['Authorization'] = `Bearer ${access_token}`
			return config
		})

		return await axiosInstance.post(`/${playlist_id}/tracks`, undefined, {
			params: { uris: trackURIs },
		})
		// ${stringifyQueries({ uris: trackURIs })}`
	}

	const getPlaylistTracks = async (
		access_token: string,
		playlist_id: string,
		limit: number,
		offset: number
	) => {
		axiosInstance.interceptors.request.use((config) => {
			if (config.headers) config.headers['Authorization'] = `Bearer ${access_token}`
			return config
		})

		return await axiosInstance.get(
			`/${playlist_id}/tracks?${stringifyQueries({ limit, offset })}`
		)
	}

	const getUserPlaylists = async (
		access_token: string,
		offset: number,
		limit: number
	) => {
		const _axiosInstance = axios.create({
			baseURL: `${spotifyAPI}/v1/me/playlists`,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		})

		_axiosInstance.interceptors.request.use((config) => {
			if (config.headers) config.headers['Authorization'] = `Bearer ${access_token}`
			return config
		})

		return await _axiosInstance.get(`?${stringifyQueries({ limit, offset })}`)
	}

	return { addTracksToPlaylist, getUserPlaylists, getPlaylistTracks }
}
