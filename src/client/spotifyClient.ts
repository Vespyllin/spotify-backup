import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from '../env'
import { AuthClient, LibraryClient, PlaylistClient, UserClient } from '.'

export const SpotifyClient = () => {
	const spotifyAPI = `https://api.spotify.com`
	const spotifyURL = `https://accounts.spotify.com`
	const SECRET_BUFFER_B64 = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
		'base64'
	)

	return {
		auth: AuthClient(spotifyURL, CLIENT_ID, SECRET_BUFFER_B64, REDIRECT_URI),
		library: LibraryClient(spotifyAPI),
		user: UserClient(spotifyAPI),
		playlist: PlaylistClient(spotifyAPI),
	}
}
