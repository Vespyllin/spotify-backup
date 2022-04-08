import { config } from 'dotenv'

config()
if (
	!process.env.CLIENT_ID ||
	!process.env.CLIENT_SECRET ||
	!process.env.PORT ||
	!process.env.REDIRECT_URI
)
	throw new Error('Missing environment variable/s.')

export const CLIENT_ID = process.env.CLIENT_ID
export const CLIENT_SECRET = process.env.CLIENT_SECRET
export const PORT = process.env.PORT
export const REDIRECT_URI = process.env.REDIRECT_URI
