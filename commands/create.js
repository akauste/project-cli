//import chalk from 'chalk';
//import { readdir } from 'fs/promises';
import fs from 'fs/promises';

export default function create(src, tgt) {

}

export function splitPath(fullPath) {
  let [full,path, baseName, ext] = fullPath.match(/^(.*)\/([^\.\/]*?)(?:(\..*))?$/);
  return [path, baseName];
}

export async function getMatchingFiles(path, baseName) {
  try {
    const allFiles = await fs.readdir(path);
    const files = allFiles.filter(f => (f.match(baseName)));
    if(files.length < allFiles.length) {
      //console.warn(chalk.yellow('[Warning] Rejected files: ', allFiles.filter(f => (!f.match(baseName)))));
    }
    return files;
  }
  catch(err) {
    console.log(err);
    //console.log(chalk.red('Failed to readdir: ', err));
  }
  //console.log(chalk.red('Failed to readdir'));
  return [];
}

export function createPath(path) {

}