import fs from "fs";
import path from "path"

const mimeTypes = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "font/eot",
  ".otf": "font/otf",
  ".json": "application/json",
  ".html": "text/html",
  ".txt": "text/plain",
  ".xml": "text/xml",
  ".pdf": "application/pdf",
} as any

/**
 * Read source folder's file recurrsively, pack all folder contents in a single .ts file
 * 
 * @param source 
 * @param dest 
 */
export const packFiles = (source: string, dest: string) => {
  const files = {} as { [key: string]: string }
  let fileContents = ``

  if (!!source && fs.existsSync(source) && fs.statSync(source).isDirectory()) {
    const contents = getDirectoryContents(source)
    
    fileContents += `const assets = new Map<string,string>()\n`

    for (const c in contents) {
      const fileName = c.replace(source, '')

      files[fileName] = contents[c]
      fileContents += `assets.set("${fileName}", "${contents[c]}")\n`
    }

    fileContents += `export default assets`
  }

  if (!!dest) {
    const dirname = path.dirname(dest);
    
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    fs.writeFileSync(dest, fileContents)
  }

  return files
}

function getDirectoryContents(dir: string, results = {} as { [key: string]: string }) {
  fs.readdirSync(dir).forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = getDirectoryContents(file, results);
    } else {
      const extension = `.${file.split(".").pop()}`;
      const contents = fs.readFileSync(file, { encoding: "base64" });

      results[file] = `data:${mimeTypes[extension]};base64,${contents}`
    }
  });

  return results;
}