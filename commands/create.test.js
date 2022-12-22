import {jest, describe, expect, test} from '@jest/globals';
import mock from 'mock-fs';
import create, {splitPath, getMatchingFiles, createMissingPath} from './create.js';
import {access, mkdir, readFile} from 'fs/promises';

describe('create', () => {
  beforeEach(() => {
    mock({
      './src/template2': {
        'Example2.js': 'export default function Example2() { return <p>Example2</p> }',
        'Example2.test.js': 'describe("<Example2 />", () => {})',
      },
      './src/template2/Example2': {
        'Example2.txt': 'This is in subfolder'
      },
      './src/template-component': {
        'ExampleComponent.js': 'export default function ExampleComponent() { return <p>ExampleComponent</p> }',
        'ExampleComponent.test.js': 'describe("<ExampleComponent />", () => {})',
        'OtherFile': '// This is another file that should be ignored',
        'ignored.txt': 'Ignores this as well',
      },
      './src/existing-component': {
        'Existing.js': '<Existing />',
        'Existing.test.js': 'describe("<Existing />", () => {})',
      },
      './src/half-existing-component': {
        'HalfExisting.js': '// Do not touch',
      },
      './srv/existing-empty': {}
    });
  });
  afterEach(() => {
    mock.restore();
  });

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
    test('./src/template-component/ExampleComponent', async () => {
      const files = await getMatchingFiles('./src/template-component', 'ExampleComponent');
      expect(files[0]).toBe('ExampleComponent.js');
      expect(files.length).toBe(2);
    });
  });

  describe('createMissingPath(dir)', () => {
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
  });

  describe('create(src, tgt)', () => {
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

    test('create ./src/template-component/ExampleComponent ./src/half-existing-component/HalfExisting', async () => {
      await create('./src/template-component/ExampleComponent', './src/half-existing-component/HalfExisting');
      expect(access('./src/half-existing-component')).resolves.not.toThrow();
      expect(access('./src/half-existing-component/HalfExisting.js')).resolves.not.toThrow();
      expect(access('./src/half-existing-component/HalfExisting.test.js')).resolves.not.toThrow();
      expect(access('./src/half-existing-component/OtherFile')).rejects.toThrow();
      const widgetData = await readFile('./src/half-existing-component/HalfExisting.js');
      expect(widgetData.toString()).toBe('// Do not touch'); // Should be the old data
      const widgetTestData = await readFile('./src/half-existing-component/HalfExisting.test.js');
      expect(widgetTestData.toString()).toBe('describe("<HalfExisting />", () => {})');
    });

    test('create ./src/template2/Example2 ./src/sub-dir-test/NoSubDir', async () => {
      await create('./src/template2/Example2', './src/sub-dir-test/NoSubDir');
      expect(access('./src/sub-dir-test')).resolves.not.toThrow();
      expect(access('./src/sub-dir-test/NoSubDir.js')).resolves.not.toThrow();
      expect(access('./src/sub-dir-test/NoSubDir.test.js')).resolves.not.toThrow();
      expect(access('./src/sub-dir-test/NoSubDir')).rejects.toThrow();
    });

    test('create src\\template2\\Example2 src\\sub-dir-test\\NoSubDir2', async () => {
      await create('create src\\template2\\Example2', 'src\\sub-dir-test\\NoSubDir2');
      expect(access('./src/sub-dir-test')).resolves.not.toThrow();
      expect(access('./src/sub-dir-test/NoSubDir2.js')).resolves.not.toThrow();
      expect(access('./src/sub-dir-test/NoSubDir2.test.js')).resolves.not.toThrow();
      expect(access('./src/sub-dir-test/NoSubDir2')).rejects.toThrow();
    });
  });
});