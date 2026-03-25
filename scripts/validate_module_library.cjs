const fs = require('fs');
const path = require('path');

const root = process.cwd();
const publicDir = path.join(root, 'public');
const manifestPath = path.join(publicDir, 'module-library', 'manifest.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
}

function exactEntryExists(absPath) {
  const dir = path.dirname(absPath);
  const base = path.basename(absPath);
  if (!fs.existsSync(dir)) {
    return false;
  }

  return fs.readdirSync(dir).includes(base);
}

function resolvePublicUrlToAbs(urlPath) {
  const trimmed = urlPath.replace(/^\/+/, '');
  const decoded = decodeURIComponent(trimmed);
  return path.join(publicDir, decoded.replace(/\//g, path.sep));
}

function collectIssues() {
  const manifest = readJson(manifestPath);
  const issues = [];

  for (const entry of manifest) {
    const tmjAbs = resolvePublicUrlToAbs(entry.tmjPath);
    const imageAbs = resolvePublicUrlToAbs(entry.imagePath);

    if (!exactEntryExists(tmjAbs)) {
      issues.push({
        type: 'missing_tmj',
        label: entry.label,
        category: entry.category,
        tmjPath: entry.tmjPath,
      });
      continue;
    }

    if (!exactEntryExists(imageAbs)) {
      issues.push({
        type: 'missing_manifest_image',
        label: entry.label,
        category: entry.category,
        imagePath: entry.imagePath,
      });
    }

    let tmj;
    try {
      tmj = readJson(tmjAbs);
    } catch (error) {
      issues.push({
        type: 'invalid_tmj_json',
        label: entry.label,
        category: entry.category,
        tmjPath: entry.tmjPath,
        error: error.message,
      });
      continue;
    }

    const imageLayer = (tmj.layers || []).find((layer) => layer.type === 'imagelayer' && layer.image);
    if (!imageLayer) {
      issues.push({
        type: 'missing_imagelayer',
        label: entry.label,
        category: entry.category,
        tmjPath: entry.tmjPath,
      });
      continue;
    }

    const tmjImageAbs = path.join(path.dirname(tmjAbs), imageLayer.image);
    if (!exactEntryExists(tmjImageAbs)) {
      issues.push({
        type: 'missing_tmj_image',
        label: entry.label,
        category: entry.category,
        tmjPath: entry.tmjPath,
        referencedImage: imageLayer.image,
      });
    }
  }

  return {
    totalModules: manifest.length,
    issueCount: issues.length,
    issues,
  };
}

const report = collectIssues();
console.log(JSON.stringify(report, null, 2));
