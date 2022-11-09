import { spotifyClient } from '../client'
import { Dump_Data } from '../types/dump'

// Interfaces with the SpotifyClient to provide usable data
export const SpotifyInterfaceService = (access_token: string) => {
	const getUserPlaylistData = async (
		limit: number = 50,
		offset: number = 0,
		total: number = 0
	) => {
		const rawPlaylistMetadata = await spotifyClient.playlist.getUserPlaylists(
			access_token,
			2,
			10
		)

		const playlistMetadata = rawPlaylistMetadata.data.items.map((x) => {
			const { name, description, id } = x
			return { name, description, id }
		})

		const playlistData: {
			playlistName: string
			description: string
			trackData: Dump_Data[]
		}[] = []

		for (let i = 0; i < playlistMetadata.length; i++) {
			const {
				name: playlistName,
				description,
				id: playlistId,
			} = playlistMetadata[i]

			const playlistTrackData: Dump_Data[] = []

			let subscopedLimit = limit
			let subscopedOffset = offset
			let subscopedTotal = total
			do {
				const playlistTracks = await spotifyClient.playlist.getPlaylistTracks(
					access_token,
					playlistId,
					subscopedLimit,
					subscopedOffset
				)

				const { data } = playlistTracks

				subscopedTotal = subscopedTotal === 0 ? data.total : subscopedTotal
				const remaining = subscopedTotal - subscopedOffset
				subscopedLimit = remaining > 50 ? 50 : remaining
				subscopedOffset += subscopedLimit

				data.items.forEach((x) => {
					const { track, added_at } = x
					const { id: trackId, name: trackName, artists } = track

					playlistTrackData.push({
						id: trackId,
						name: trackName,
						artist: artists[0].name,
						added_at,
					})
				})
			} while (subscopedOffset <= subscopedTotal && subscopedLimit != 0)

			playlistData.push({
				playlistName,
				description,
				trackData: playlistTrackData,
			})
		}

		return playlistData
	}

	const getLikedTrackData = async (
		limit: number = 50,
		offset: number = 0,
		total: number = 0
	) => {
		const trackData: Dump_Data[] = []

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

		return trackData
	}

	const getLikedAlbumData = async (
		limit: number = 50,
		offset: number = 0,
		total: number = 0
	) => {
		const albumData: Dump_Data[] = []

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
		return albumData
	}

	const createPlaylist = async (
		playlistTitle: string,
		backupContent: Dump_Data[],
		isPublic: boolean = false
	) => {
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

	return { getLikedTrackData, getLikedAlbumData, createPlaylist, getUserPlaylistData }
}
