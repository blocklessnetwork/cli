import { exec, execSync } from 'child_process'
import git, { TaskOptions, SimpleGitProgressEvent } from 'simple-git'

/**
 * Returns whether the environment has Git available.
 * @returns {Promise<boolean>} A promise that resolves with the value.
 */
export async function hasGit(): Promise<boolean> {
    try {
        await exec('git --version')
        return true
    } catch {
        return false
    }
}

export async function validateGitOrAbort() {
    if (!(await hasGit())) {
        console.log('Git not present')
    }
}

/**
 * 
 * @param destination 
 * @returns 
 */
export async function cleanGitRepository(destination = '.'): Promise<boolean> {
    try {
        await exec(`cd ${destination}; rm -rf .git`)
        await exec(`cd ${destination}; rm -rf .github`)
        
        return true
    } catch (error) {
        return false
    }
}

export async function downloadRepository({
    repoUrl,
    destination,
    shallow,
}: {
    repoUrl: string
    destination: string
    shallow?: boolean
}) {
    await validateGitOrAbort()
    
    const [repository, branch] = repoUrl.split('#')
    const options: TaskOptions = { '--recurse-submodules': null }
    
    if (branch) {
        options['--branch'] = branch
    }
    
    if (shallow) {
        options['--depth'] = 1
    }

    try {
        await git().clone(repository!, destination, options)
        await cleanGitRepository(destination)
    } catch (err) {
        throw err
    }
}
