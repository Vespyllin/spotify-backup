import path from 'path'
import { SpotifyClient } from '../client/spotify'
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

	const test = async () => {
		console.log(await SpotifyClient().playlist.getUserPlaylists(access_token))
	}

	// Store liked tracks/albums' Spotify ID, name, publishing artist and date saved
	const backupToFolder = async () => {
		const absoluteFolderPath = path.resolve(folderPath)

		const likedTrackData = await spotifyInterface.getLikedTrackData()
		const tracksCommitted = await fileService.backupData(likedTrackData, 'tracks')

		const likedAlbumData = await spotifyInterface.getLikedAlbumData()
		const albumsCommitted = await fileService.backupData(likedAlbumData, 'albums')

		if (!tracksCommitted && !albumsCommitted) {
			console.log(`No changes to backups at ${absoluteFolderPath}`)
		} else {
			const whatCommitted = tracksCommitted
				? 'Tracks'
				: tracksCommitted && albumsCommitted
				? '& albums'
				: 'Albums'
			console.log(`${whatCommitted} backed up to ${absoluteFolderPath}`)
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
	return { test, backupToFolder, importToPlaylist }
}
