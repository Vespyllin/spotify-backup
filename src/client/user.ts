import axios from 'axios'

export const UserClient = (spotifyAPI: string) => {
	const axiosInstance = axios.create({
		baseURL: `${spotifyAPI}/v1/users`,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
	})

	const createPlaylist = async (
		access_token: string,
		user_id: string,
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
