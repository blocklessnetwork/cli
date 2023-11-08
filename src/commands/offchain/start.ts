import Chalk from 'chalk'
import { store, get as storeGet, set as storeSet } from '../../store'
import { execSync } from 'child_process'
const fs = require('fs')

const headPrivateIdentity = `${store.system.homedir}/.bls/network/keys/head/priv.bin`
const workerPrivateIdentity = `${store.system.homedir}/.bls/network/keys/worker1/priv.bin`

const runtimePath = `${store.system.homedir}/.bls/runtime`

const readFirstLineSync = (filePath: string) => {
	try {
		const fileContent = fs.readFileSync(filePath, 'utf8')
		const lines = fileContent.split(/\r?\n/) // This regex handles both Windows (\r\n) and UNIX (\n) line endings
		return lines[0] || '' // Return an empty string if the first line does not exist
	} catch (error: any) {
		console.error(`Error reading the file: ${error.message}`)
		return '' // Return an empty string if an error occurs
	}
}

const peerIdFile = `${store.system.homedir}/.bls/network/keys/head/peerid.txt`
const headNodePeerId = readFirstLineSync(peerIdFile)
if (!headNodePeerId) {
	console.log('The file is empty or does not exist.')
}

const headCommand = [
	'--peer-db',
	'/tmp/b7s/head-peer-db',
	'--function-db',
	'/tmp/b7s/head-fdb',
	'--log-level',
	'debug',
	'--port',
	'9527',
	'--role',
	'head',
	'--workspace',
	'/tmp/debug/head',
	'--private-key',
	headPrivateIdentity,
	'--rest-api',
	':6000'
].join(' ')

const workerCommand = [
	'--peer-db',
	'/tmp/b7s/worker-peer-db',
	'--function-db',
	'/tmp/b7s/worker-fdb',
	'--log-level',
	'debug',
	'--port',
	'0',
	'--role',
	'worker',
	'--runtime',
	runtimePath,
	'--workspace',
	'/tmp/debug/worker',
	'--private-key',
	workerPrivateIdentity,
	'--boot-nodes',
	`/ip4/0.0.0.0/tcp/9527/p2p/${headNodePeerId}`
].join(' ')

export const run = (agentType: string = 'head') => {
	let type = 'head'

	switch (agentType) {
		case 'worker':
			type = 'worker'
			break
		case 'head':
			type = 'head'
			break
		default:
			type = 'head'
			break
	}

	console.log(`${Chalk.yellow('Off-Chain')} ... starting ${type} node`)

	try {
		execSync(
			`cd ${store.system.homedir}/.bls/network; ./b7s ${
				type == 'head' ? headCommand : workerCommand
			}`,
			{
				stdio: 'inherit'
			}
		)
		process.exit(0)
	} catch (error) {
		process.exit(0)
	}
}
