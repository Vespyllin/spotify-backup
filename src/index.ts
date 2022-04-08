import { initAPI } from './api'
import { PORT } from './env'

const main = () => {
	initAPI(PORT, 'import')
}

main()
