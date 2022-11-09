import path from 'path'
import { Dump_Data } from '../types/dump'

import { sleep } from '../util'
import { FileService } from './fileService'
import { SpotifyInterfaceService } from './spotifyInterfaceService'

export const BackupService = (
	access_token: string,
	folderPath: string = '../',
	backupTitle?: string
) => {
	const fileService = FileService(folderPath)
	const spotifyInterface = SpotifyInterfaceService(access_token)

	// Store liked tracks/albums' Spotify ID, name, publishing artist and date saved
	const backupToFolder = async () => {
		const absoluteFolderPath = path.resolve(folderPath)

		const likedTrackData = await spotifyInterface.getLikedTrackData()
		const tracksCommitted = await fileService.backupData(likedTrackData, 'tracks')

		const likedAlbumData = await spotifyInterface.getLikedAlbumData()
		const albumsCommitted = await fileService.backupData(likedAlbumData, 'albums')

		const playlistData = await spotifyInterface.getUserPlaylistData()
		const playlistsCommitted = await fileService.backupData(playlistData, 'playlists')

		// Format output string
		const whatCommitted: string[] = []
		if (tracksCommitted) whatCommitted.push('tracks')
		if (albumsCommitted) whatCommitted.push('albums')
		if (playlistsCommitted) whatCommitted.push('playlists')

		if (whatCommitted.length === 0) {
			console.log(`No changes to backups at ${absoluteFolderPath}`)
		} else {
			const commitConcat = whatCommitted.join(' & ')
			const formattedCommitString =
				commitConcat.charAt(0).toUpperCase() + commitConcat.slice(1)
			console.log(`${formattedCommitString} backed up to ${absoluteFolderPath}`)
		}

		await sleep(5000)
	}

	const importToPlaylist = async () => {
		const retrievedData = fileService.getBackupContent(folderPath, backupTitle)

		if (!retrievedData)
			return console.log(`Could not resolve backup at ${path.resolve(folderPath)}`)

		await spotifyInterface.createPlaylist(
			retrievedData.backupTitle,
			JSON.parse(retrievedData.data) as Dump_Data[]
		)

		console.log(
			`${
				backupTitle ? `Backup ${retrievedData.backupTitle}` : 'Latest backup'
			} imported to playlist ${retrievedData.backupTitle}`
		)

		await sleep(5000)
	}
	return { backupToFolder, importToPlaylist }
}
