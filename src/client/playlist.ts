import axios from 'axios'

export const PlaylistClient = (spotifyAPI: string) => {
	const axiosInstance = axios.create({
		baseURL: `${spotifyAPI}/v1/users`,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			// Authorization: `Bearer ${access_token}`,
		},
	})

	const createPlaylist = async (
		user_id: string,
		access_token: string,
		payload: { name: string; description?: string; public: boolean }
	) => {
		axiosInstance.interceptors.request.use((config) => {
			if (config.headers) config.headers['Authorization'] = `Bearer ${access_token}`
			return config
		})

		return await axiosInstance.post(`/${user_id}/playlists`, { ...payload })
	}

	return { createPlaylist }
}
