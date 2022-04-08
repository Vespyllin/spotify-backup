import * as fs from 'fs'

export const generateRandomString = (length: number) => {
	let result = ''
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	const charactersLength = characters.length

	for (let i = 0; i < length; i++)
		result += characters.charAt(Math.floor(Math.random() * charactersLength))

	return result
}

export const stringifyQueries = (queries: { [query: string]: any }) => {
	let queryString: string = ''

	let index = 0
	for (const query in queries) {
		if (index++ !== 0) queryString += '&'
		queryString += `${query}=${queries[`${query}`]}`
	}

	return queryString
}

export const sleep = (ms: number) => new Promise(() => setTimeout(() => {}, ms))

export const getTimehash = () => {
	return Date.now()
		.toString(36)
		.split('')
		.filter((x) => isNaN(parseInt(x)))
		.reverse()
		.slice(0, 6)
		.reverse()
		.reduce((acc, val) => (acc += val))
		.toLowerCase()
}

export const createDirectory = (folderPath: string) => {
	const folders = folderPath.split('/')
	let path = folders[0]
	let created = false
	folders.slice(1).forEach((folder) => {
		path = `${path}/${folder}`
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path)
			created = true
		}
	})

	return created
}
