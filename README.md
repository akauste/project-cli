# project-cli

This is a small tool to create component files based on existing component.

## installation

npm install -g https://github.com/akauste/project-cli

## Example usage

  project create ./src/components/original-component/Original ./src/components/target-component/Target

This will copy all files from ./src/components/original-component directory that match the name **Original\** (Example: Original.js, Original.test.js, Original.mocks.js, etc.) If the folder has other files that do not match (ie. README), then those are not copied.

Files are copied to target folder ./src/components/target-component/ but renamed so, that Original is replaced with Target (Example: Original.test.js => Target.test.js). Also the file contents are matched and all occurances of Original will be replaced with Target.

If the source directory has sub-directories those will not be touched.

If the target directory does not not exist. It will be created. If the target directory
exists and contains some of the files, then those files will be skipped, but any missing target files will be created.
