import { execSync } from "child_process"
import fs from 'fs'
import path from 'path'

interface IFrameworkConfig {
  build: string
  publicDir: string
}

interface IFramework {
  id: string
  name: string
  command: (pm: string, name: string) => string
  postCommand: ((pm: string, path: string) => void) | null
  config: IFrameworkConfig
}

const frameworks: IFramework[] = [
  {
    id: 'vite',
    name: 'Blank (Vite)',
    command: (pm, name) => `${pm} create-vite ${name} --template vanilla`,
    postCommand: null,
    config: {
      build: 'npm run build',
      publicDir: 'dist'
    }
  },
  {
    id: 'react',
    name: 'React',
    command: (pm, name) => `${pm} create-react-app ${name}`,
    postCommand: null,
    config: {
      build: 'npm run build',
      publicDir: 'build'
    }
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    command: (pm, name) => `${pm} create-next-app ${name}`,
    postCommand: (pm, installationPath) => {
      const nextConfigPath = path.resolve(installationPath, 'next.config.js');

      // Read the existing configuration file
      const nextConfig = require(nextConfigPath);

      // Make changes to the configuration object
      nextConfig.output = 'export';
      nextConfig.images = {
        unoptimized: true
      }

      // Write the updated configuration back to the file
      fs.writeFileSync(nextConfigPath, `module.exports = ${JSON.stringify(nextConfig, null, 2)};`, 'utf8');
    },
    config: {
      build: 'npm run build',
      publicDir: 'out'
    }
  },
  {
    id: 'vue',
    name: 'Vue',
    command: (pm, name) => `${pm} create-vue@3 ${name}`,
    postCommand: null,
    config: {
      build: 'npm run build',
      publicDir: 'dist'
    }
  }
]

/**
 * Fetch a list of supported site frameworks
 * 
 * @returns 
 */
export function listFrameworks() {
  return frameworks.map(f => ({ id: f.id, name: f.name }))
}

/**
 * 
 * @param id 
 * @param path 
 * @param name 
 */
export async function generateFramework({
  id,
  name,
  path,
  installationPath
}: {
  id: string,
  name: string,
  path: string,
  installationPath: string
}): Promise<IFrameworkConfig> {
  const framework = frameworks.find(f => f.id === id)
  if (!framework) throw new Error("Unable to detect framework.");
  
  // Run framework generation command
  execSync(framework.command('npx', name), { cwd: path, stdio: 'inherit' })

  // Run framework configuration command
  if (framework.postCommand) {
    framework.postCommand('npx', installationPath)
  }

  return framework.config
}