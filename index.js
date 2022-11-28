import { Command } from 'commander';
import create from './commands/create.js';

const program = new Command();

program
  .command('create <src> <tgt>')
  .description("Create a copy from src folder where file's basename is replaced with tgt's basename\n"+
    "Example:\n"+
    " # project create ./src/template-component/ExampleComponent ./src/my/fancy/widget/Widget\n"+
    " => Any file in ./src/template-component/ directory where filename contains ExampleComponent\n"+
    "    will be copied to ./src/my/fancy/widget directory with a new name where ExampleComponent is\n"+
    "    replaced with Widget and file content's are replaced with the same change\n"+
    "    ExampleComponent.ts => Widget.ts\n"+
    "    ExampleComponent.test.ts => Widget.test.ts etc...")
  .action(create);

program.parse();