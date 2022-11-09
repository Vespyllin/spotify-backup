import * as fs from 'fs'
import path from 'path'

import { createDirectory, getTimehash } from '../util'

export const FileService = (folderPath: string) => {
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
		const retrievedBackupTitle = !title
			? backupMetadata.reduce(
					(acc, val) => (acc.lastUpdated > val.lastUpdated ? acc : val),
					{ file: '', lastUpdated: 0 }
			  ).file
			: backupMetadata.find((metadata) => metadata.file == title)?.file ?? ''

		if (retrievedBackupTitle === '') return null

		const fullPath = path.resolve(`${checkDirectory}/${retrievedBackupTitle}`)

		// Return backup without whitespace
		return {
			backupTitle: retrievedBackupTitle,
			data: fs.readFileSync(fullPath).toString(),
		}
	}

	const backupData = async (data: any, subfolder?: string) => {
		const dataJSON = JSON.stringify(data)

		const finalFolderPath = `${folderPath}${subfolder ? `/${subfolder}` : ''}/`
		const commitData =
			createDirectory(finalFolderPath) ||
			getBackupContent(finalFolderPath)?.data.replace(/\s+/g, '') !=
				dataJSON.replace(/\s+/g, '')

		if (commitData)
			fs.writeFileSync(
				`${finalFolderPath}${getTimehash()}-${dataJSON.length}.json`,
				dataJSON
			)

		return commitData
	}

	return { getBackupContent, backupData }
}
