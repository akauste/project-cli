import chalk from 'chalk';
import path from 'path';
import {access, readdir, readFile, mkdir, writeFile} from 'fs/promises';
import console from 'console';

export default async function create(src, tgt) {
  const [srcPath, oldBaseName] = splitPath(src);
  const [tgtPath, newBaseName] = splitPath(tgt);

  const files = await getMatchingFiles(srcPath, oldBaseName);
  await createMissingPath(tgtPath);
  for(const file of files) {
    const newFileName = file.toString().replace(oldBaseName, newBaseName);
    const newPath = path.join(tgtPath, newFileName);
    try {
      await access(newPath);
      console.warn(chalk.red.bold('[Skip existing file] ', newPath));
    } catch(err) {
      const data = await readFile(path.join(srcPath, file));
      const newData = data.toString().replaceAll(oldBaseName, newBaseName);
      await writeFile(newPath, newData);
      console.log(chalk.green('[Create] ', newPath));
    }
  }
}

export function splitPath(fullPath) {
  let [full,path, baseName, ext] = fullPath.match(/^(.*)\/([^\.\/]*?)(?:(\..*))?$/);
  return [path, baseName];
}

export async function getMatchingFiles(path, baseName) {
  try {
    const allFiles = await readdir(path);
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

export async function createMissingPath(path) {
  try {
    await access(path);
  } catch(err) {
    await mkdir(path, {recursive: true});
  }
}
