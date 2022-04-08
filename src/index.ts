import { initAPI } from './api'
import { PORT } from './env'

const main = (mode: string, backupPath: string, backupTitle?: string) => {
	initAPI(PORT, mode, backupPath, backupTitle)
}

// CLI Interface
const args = process.argv.slice(2)
const DEFAULT_PATH = '../spotify-backup'
if ((args[0] != 'import' && args[0] != 'export') || args.length == 0)
	console.log('Specify import/export in the first argument')

switch (args.length) {
	case 1:
		main(args[0], DEFAULT_PATH)
		break
	case 2:
		main(args[0], args[1])
		break
	case 3:
		main(args[0], args[1], args[2])
		break
}
