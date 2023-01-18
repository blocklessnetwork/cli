import fs from 'fs'
import { mimeTypes } from '../store/constants'

export const getDirectoryContents = (dir: string, results = {} as { [key: string]: string }) => {
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