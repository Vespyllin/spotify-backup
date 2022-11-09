import { spotifyClient } from '../client'
import { Dump_Data } from '../types/dump'

// Interfaces with the SpotifyClient to provide usable data
export const SpotifyInterfaceService = (access_token: string) => {
	// const getPlaylistData = async (playlistID: string) => {}

	const getLikedTrackData = async (
		limit: number = 50,
		offset: number = 0,
		total: number = 0
	) => {
		const trackData: any[] = []

		do {
			const likedTracks = await spotifyClient.library.getLikedTracks(
				access_token,
				limit,
				offset
			)

			const { data } = likedTracks
			total = total === 0 ? data.total : total

			const remaining = total - offset
			limit = remaining > 50 ? 50 : remaining
			offset += limit

			data.items.forEach((x) => {
				const { track, added_at } = x
				const { id, artists, name } = track
				trackData.push({
					id,
					name,
					artist: artists[0].name,
					added_at,
				})
			})
		} while (offset <= total && limit != 0)

		return trackData as Dump_Data[]
	}

	const getLikedAlbumData = async (
		limit: number = 50,
		offset: number = 0,
		total: number = 0
	) => {
		const albumData: any[] = []

		do {
			const likedAlbums = await spotifyClient.library.getSavedAlbums(
				access_token,
				limit,
				offset
			)

			const { data } = likedAlbums
			total = total === 0 ? data.total : total

			const remaining = total - offset
			limit = remaining > 50 ? 50 : remaining
			offset += limit

			data.items.forEach((x) => {
				const { album, added_at } = x
				const { id, artists, name } = album
				albumData.push({
					id,
					name,
					artist: artists[0].name,
					added_at,
				})
			})
		} while (offset <= total && limit != 0)
		return albumData as Dump_Data[]
	}

	const createPlaylist = async (
		playlistTitle: string,
		backupContent: Dump_Data[],
		isPublic: boolean = false
	) => {
		// const playlistTitle = retrievedData.backupTitle

		const playlistID = (
			await spotifyClient.user.createPlaylist(access_token, 'esoryx', {
				name: playlistTitle,
				description: `Tracks from backup ${playlistTitle}`,
				public: isPublic,
			})
		).data.id

		const backupURIs = backupContent.map((x) => `spotify:track:${x.id}`)
		const batchConstant = 100
		for (let i = 0; i < Math.ceil(backupURIs.length / batchConstant); i++) {
			const currentBatch = backupURIs
				.slice(i * batchConstant, (i + 1) * batchConstant)
				.toString()

			await spotifyClient.playlist.addTracksToPlaylist(
				access_token,
				playlistID,
				currentBatch
			)
		}
	}

	return { getLikedTrackData, getLikedAlbumData, createPlaylist }
}
