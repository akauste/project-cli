import {jest, describe, expect, test} from '@jest/globals';
import mock from 'mock-fs';
import create, {splitPath, getMatchingFiles, createMissingPath} from './create.js';
import {access, mkdir, readFile} from 'fs/promises';

describe('create', () => {
  describe('splitPath(path)', () => {
    test('./some/simple/Path', () => {
      const [path, baseName] = splitPath('./some/simple/Path');
      expect(path).toBe('./some/simple');
      expect(baseName).toBe('Path');
    });

    test('ignore extension ./some/simple/Path.js', () => {
      const [path, baseName] = splitPath('./some/simple/Path.js');
      expect(path).toBe('./some/simple');
      expect(baseName).toBe('Path');
    });
    
    test('ignore multipart extension ./some/other/Component.test.js', () => {
      const [path, baseName] = splitPath('./some/other/Component.test.js');
      expect(path).toBe('./some/other');
      expect(baseName).toBe('Component');
    });
  });

  describe('getMatchingFiles(dir, baseName)', () => {

    beforeEach(() => {
      mock({
        './src/template-component': {
          'ExampleComponent.js': '<ExampleComponent />',
          'ExampleComponent.test.js': 'describe("<ExampleComponent />", () => {})',
          'OtherFile': '// This is another file that should be ignored',
          'ignored.txt': 'Ignores this as well',
        }
      });
    });

    test('./src/template-component/ExampleComponent', async () => {
      const files = await getMatchingFiles('./src/template-component', 'ExampleComponent');
      expect(files[0]).toBe('ExampleComponent.js');
      expect(files.length).toBe(2);
    });

    afterEach(() => {
      mock.restore();
    });
  });

  describe('createMissingPath(dir)', () => {
    beforeEach(() => {
      mock({
        './src/template-component': {
          'ExampleComponent.js': 'export default function ExampleComponent() { return <p>ExampleComponent</p> }',
          'ExampleComponent.test.js': 'describe("<ExampleComponent />", () => {})',
        },
        './src/existing-component': {
          'Existing.js': '<Existing />',
          'Existing.test.js': 'describe("<Existing />", () => {})',
        },
        './srv/existing-empty': {}
      });
    });
    afterEach(() => {
      mock.restore();
    });

    test('./src/new-component is missing & gets created', async () => {
      const newPath = './src/new-component';
      await createMissingPath(newPath);
      await expect(access(newPath)).resolves.not.toThrow();
    });

    test('./src/existing-component', async () => {
      const newPath = './src/existing-component';
      await createMissingPath(newPath);
      await expect(access(newPath)).resolves.not.toThrow();
    });

    test('create ./src/template-component/ExampleComponent ./src/new-component/Widget', async () => {
      await create('./src/template-component/ExampleComponent', './src/new-component/Widget');
      expect(access('./src/new-component')).resolves.not.toThrow();
      expect(access('./src/new-component/Widget.js')).resolves.not.toThrow();
      expect(access('./src/new-component/Widget.test.js')).resolves.not.toThrow();
      expect(access('./src/new-component/OtherFile')).rejects.toThrow();
      const widgetData = await readFile('./src/new-component/Widget.js');
      expect(widgetData.toString()).toBe('export default function Widget() { return <p>Widget</p> }');
      const widgetTestData = await readFile('./src/new-component/Widget.test.js');
      expect(widgetTestData.toString()).toBe('describe("<Widget />", () => {})');
    });
  });
});