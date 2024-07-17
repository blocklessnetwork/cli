import Chalk from 'chalk'
import { getRuntime, getNetworking, getBlsJavy } from '../../lib/binaries'
import { generateKey } from '../../lib/keygen'
import { headConfigJSON, saveConfig, workerConfigJSON } from '../../lib/configs'
import { store, get as storeGet, set as storeSet } from '../../store'
import prompRuntimeInstall from '../../prompts/runtime/install'
import { logger } from '../../lib/logger'

const install = async function ({ path, inline = false }: { path?: string; inline: boolean }) {
	const opts = storeGet('opts')

	// @TODO: Validate path and swap for installation.
	storeSet('ops', {
		...opts,
		installPath: `${store.system.homedir}/.bls`
	})

	console.log('')
	console.log('')
	console.log(`${Chalk.yellow('Installing')} ... installing to ${store.ops.installPath}`)

	console.log(
		`${Chalk.yellow('Installing')} ... installing for ${store.system.platform}_${store.system.arch}`
	)

	console.log(`${Chalk.yellow('Installing')} ... downloading runtime environment`)

	await getRuntime()
	console.log(`${Chalk.green('Installing')} ... done`)
	console.log(`${Chalk.yellow('Installing')} ... downloading networking agent`)

	await getNetworking()
	console.log(`${Chalk.green('Installing')} ... done`)
	console.log(`${Chalk.yellow('Installing')} ... downloading bls-javy tool`)

	await getBlsJavy()
	console.log(`${Chalk.green('Installing')} ... done`)

	console.log(`${Chalk.yellow('Installing')} ... downloading keygen identity tool`)
	console.log(`${Chalk.green('Installing')} ... done`)
	generateKey('head')
	generateKey('worker1')

	;(headConfigJSON as any).node.key_path = `${store.system.homedir}/.bls/network/keys/priv.bin`
	// saveConfig(headConfigJSON, "head-config")
	// saveConfig(workerConfigJSON, "worker-config")

	console.log(`${Chalk.green('Generating')} ... done`)

	if (!inline) {
		console.log('')
		console.log(`Use the following commands to start blockless daemon:`)
		console.log('')
		console.log(`\t ${Chalk.blue('bls components start head')} to start the head agent`)
		console.log(`\t ${Chalk.blue('bls components start worker')} to start the worker agent`)
		console.log('')
	}
}

export const run = async (options: any) => {
	const { yes = false, inline = false } = options

	console.log(
		Chalk.green(`                                                 
                *%%%%%%%%%.         
            (%%%%%%*   #%%%%%%*     
         #%%%%%##  %%%%#   (%%%%%(  
        (%%%  (%%#   #%%%%%%  (%%%, 
        (%%%  %%%%%%%%   /%%%  %%%* 
        (%%%  %%%  %%%%%%%   .%%%%* 
        (%%%  %%%  %%#   #%%%  %%%* 
        (%%%. ,%%  %%%%%%%%#  #%%%, 
         #%%%%%##  #%%%/   #%%%%%,  
            ,%%%%%%(  *%%%%%%%      
                 #%%%%%%%#                            
    `)
	)

	try {
		if (!yes) {
			const { path } = await prompRuntimeInstall()
			await install({ path, inline })
		} else {
			await install({ inline })
		}
	} catch (error: any) {
		logger.error('Failed to install local runtime.', error.message)
	}
}
