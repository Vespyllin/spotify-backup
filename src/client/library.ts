import axios from 'axios'
import { stringifyQueries } from '../util'

export const LibraryClient = (spotifyAPI: string) => {
	const axiosInstance = axios.create({
		baseURL: `${spotifyAPI}/v1/me`,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			// Authorization: `Bearer ${access_token}`,
		},
	})

	const getLikedTracks = async (
		access_token: string,
		limit: number = 50,
		offset: number = 0
	) => {
		axiosInstance.interceptors.request.use((config) => {
			if (config.headers) config.headers['Authorization'] = `Bearer ${access_token}`
			return config
		})

		return await axiosInstance.get(`/tracks?${stringifyQueries({ limit, offset })}`)
	}

	const getSavedAlbums = async (
		access_token: string,
		limit: number = 50,
		offset: number = 0
	) => {
		axiosInstance.interceptors.request.use((config) => {
			if (config.headers) config.headers['Authorization'] = `Bearer ${access_token}`
			return config
		})

		return await axiosInstance.get(`/albums?${stringifyQueries({ limit, offset })}`)
	}

	return { getLikedTracks, getSavedAlbums }
}
