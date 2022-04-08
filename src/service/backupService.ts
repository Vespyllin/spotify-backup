import { spotifyClient } from '../client'
import * as fs from 'fs'
import path from 'path'
import { getTimehash, createDirectory, sleep } from '../util'
import { Dump_Data } from '../types/dump'

export const BackupService = () => {
	const getLikedTrackData = async (
		access_token: string,
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
		access_token: string,
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

	// Store liked tracks/albums' Spotify ID, name, publishing artist and date saved
	const backupToFolder = async (access_token: string, folderPath: string = '../') => {
		const timeHash = getTimehash()

		const likedTracks = await getLikedTrackData(access_token)
		const likedAlbums = await getLikedAlbumData(access_token)

		const likedTracksJSON = JSON.stringify(likedTracks).replace(/\s+/g, '')
		const likedAlbumsJSON = JSON.stringify(likedAlbums).replace(/\s+/g, '')

		const commitTracks =
			createDirectory(`${folderPath}/tracks/`) ||
			getBackupContent(`${folderPath}/tracks/`) != likedTracksJSON
		const commitAlbums =
			createDirectory(`${folderPath}/albums/`) ||
			getBackupContent(`${folderPath}/albums/`) != likedAlbumsJSON

		console.log(commitTracks, commitAlbums)
		// importToPlaylist(access_token, `${folderPath}/tracks/`)

		if (commitTracks)
			fs.writeFileSync(
				`${folderPath}/tracks/${timeHash}-${likedTracks.length}.json`,
				likedTracksJSON
			)

		if (commitAlbums)
			fs.writeFileSync(
				`${folderPath}/albums/${timeHash}-${likedAlbums.length}.json`,
				likedAlbumsJSON
			)

		const absoluteFolderPath = path.resolve(folderPath)

		if (!commitTracks && !commitAlbums) {
			console.log(`No changes to backups at ${absoluteFolderPath}`)
		} else {
			const updateString = commitTracks
				? 'Tracks'
				: commitTracks && commitAlbums
				? '& albums'
				: 'Albums'

			console.log(`${updateString} backed up to ${absoluteFolderPath}`)
		}

		await sleep(1000)
	}

	const getBackupContent = (checkDirectory: string, title?: string) => {
		// Get titles of all files in directory
		const backups = fs.readdirSync(checkDirectory)

		// Find metadata of files in folder
		const backupMetadata = backups.map((file) => {
			return {
				file,
				lastUpdated: fs.statSync(`${checkDirectory}/${file}`).birthtimeMs,
			}
		})

		// Get title of latest backup/verify if supplied title exists
		const backup = !title
			? backupMetadata.reduce(
					(acc, val) => (acc.lastUpdated > val.lastUpdated ? acc : val),
					{ file: '', lastUpdated: 0 }
			  ).file
			: backupMetadata.find((metadata) => metadata.file == title) ?? ''

		if (backup === '') return ''

		// Return backup without whitespace
		console.log(backup)
		return fs
			.readFileSync(`${checkDirectory}/${backup}`)
			.toString()
			.replace(/\s+/g, '')
	}

	const importToPlaylist = async (
		access_token: string,
		backupFolderPath: string = '../',
		data?: {
			backupTitle?: string
			playlistTitle?: string
		}
	) => {
		const a = `${backupFolderPath}/tracks/${data?.backupTitle ?? ''}`
		if (!fs.existsSync(a)) return console.log('Folder does not exist')

		const backupContent: Dump_Data[] = JSON.parse(
			getBackupContent(`${backupFolderPath}/tracks`, data?.backupTitle)
		)

		console.log(backupContent.map((x) => x.added_at))

		const playlistUri = (
			await spotifyClient.playlist.createPlaylist('esoryx', access_token, {
				name: getTimehash(),
				description: `Backup of liked tracks made at ${new Date().toISOString()}`,
				public: false,
			})
		).data.uri
	}

	return { getLikedTrackData, getLikedAlbumData, backupToFolder, importToPlaylist }
}
