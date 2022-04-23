import axios from 'axios'

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

	return { addTracksToPlaylist }
}
