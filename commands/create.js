//import chalk from 'chalk';

export default function create(src, tgt) {

}

export function splitPath(fullPath) {
  let [full,path, baseName, ext] = fullPath.match(/^(.*)\/([^\.\/]*?)(?:(\..*))?$/);
  return [path, baseName];
}