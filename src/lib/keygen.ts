import { execSync } from 'child_process'
import Chalk from 'chalk'
import { store } from '../store'

export const generateKey = (identity: string) => {
	const os = store.system.platform === 'win32' ? 'windows' : store.system.platform

	const arch = store.system.arch === 'arm64' ? 'arm64' : 'amd64'

	if (!identity) {
		console.error(Chalk.red('You must provide an identity string.'))
		return
	}

	const keysDirectory = `${store.system.homedir}/.bls/network/keys/${identity}`

	console.log(`${Chalk.yellow('Generating')} ... identity key in ${keysDirectory}`)
	execSync(
		`mkdir -p ${keysDirectory}; cd ${keysDirectory}; ${store.system.homedir}/.bls/network/b7s-keyforge`,
		{
			stdio: 'ignore'
		}
	)
}
