import fs from 'fs'
import { mimeTypes } from '../store/constants'
import path from 'path'

export const getDirectoryContents = (dir: string, results = {} as { [key: string]: string }) => {
	fs.readdirSync(dir).forEach((file) => {
		file = dir + '/' + file
		const stat = fs.statSync(file)
		if (stat && stat.isDirectory()) {
			results = getDirectoryContents(file, results)
		} else {
			const extension = `.${file.split('.').pop()}`
			const contents = fs.readFileSync(file, { encoding: 'base64' })

			results[file] = `data:${mimeTypes[extension]};base64,${contents}`
		}
	})

	return results
}

export function copyFileSync(sourcePath: string, targetPath: string) {
	const data = fs.readFileSync(sourcePath)

	const targetDir = path.dirname(targetPath)
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true })
	}

	fs.writeFileSync(targetPath, data)
}
