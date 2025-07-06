import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';

function updateFederatedExtension(inputDir, jsonFilePath) {
  // 1. Find the remoteEntry.<hash>.js file
  const files = fs.readdirSync(inputDir);
  const remoteEntryFile = files.find(file =>
    /^remoteEntry\.[a-f0-9]+\.js$/.test(file)
  );

  if (!remoteEntryFile) {
    console.error('No matching remoteEntry.<hash>.js file found.');
    process.exit(1);
  }

  // 2. Load and parse the JSON file
  const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
  const json = JSON.parse(jsonContent);

  const extensions = json['jupyter-config-data'].federated_extensions;
  if (!Array.isArray(extensions)) {
    console.error(
      'Invalid JSON structure: missing "federated_extensions" array.'
    );
    process.exit(1);
  }

  // 3. Find the target extension dict and update it
  const target = extensions.find(ext => ext.name === 'jupyter-specta');

  if (!target) {
    console.error('Extension with name "jupyter-specta" not found.');
    process.exit(1);
  }

  target.load = `static/${remoteEntryFile}`;

  // 4. Save the updated JSON back
  fs.writeFileSync(jsonFilePath, JSON.stringify(json, null, 2));
  console.log(`Updated "load" value to: static/${remoteEntryFile}`);
}

async function cleanAndCopy(sourceDir, targetDir ) {
  try {
    if (fs.existsSync(targetDir)) {
      const entries = fs.readdirSync(targetDir);
      for (const entry of entries) {
        const fullPath = path.join(targetDir, entry);
        await fse.remove(fullPath);
      }
    } else {
      await fse.mkdirp(targetDir);
    }

    await fse.copy(sourceDir, targetDir, { overwrite: true });

    console.log(`✅ Copied from ${sourceDir} to ${targetDir}`);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

const inputPath = 'specta/labextension';
const outputPath = 'demo/_output/extensions/jupyter-specta';
const jsonPath = 'demo/_output/jupyter-lite.json';

updateFederatedExtension(`${inputPath}/static`, jsonPath);
cleanAndCopy(inputPath, outputPath);