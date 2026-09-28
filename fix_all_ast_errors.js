const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function getAllFiles(dir, ext) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, ext));
    } else if (file.endsWith(ext)) {
      results.push(fullPath);
    }
  });
  return results;
}

const pagesDir = 'e:/d_drive_data/antigravity_anjana/timeandattendance/apps/web/src/pages';
const files = getAllFiles(pagesDir, '.tsx');

files.forEach(filePath => {
  let pass = 0;
  let maxPasses = 15;

  while (pass < maxPasses) {
    let content = fs.readFileSync(filePath, 'utf8');
    let sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let diags = sf.parseDiagnostics;

    if (diags.length === 0) {
      break;
    }

    let lines = content.split('\n');
    let modified = false;

    // Process diagnostics from bottom to top or per line
    diags.forEach(d => {
      const { line, character } = sf.getLineAndCharacterOfPosition(d.start);
      if (line >= lines.length) return;
      let lineText = lines[line];

      // Rule A: `)</tag>` or `})</tag>` missing `}` -> `)}</tag>` or `})}</tag>`
      if (/(\)|\}\))\s*<\/[a-zA-Z0-9]+>/.test(lineText)) {
        let newLine = lineText.replace(/((\)|\}\))\s*)(<\/[a-zA-Z0-9]+>)/, '$1}$3');
        if (newLine !== lineText) {
          lines[line] = newLine;
          modified = true;
          return;
        }
      }

      // Rule B: `{expr</tag>` missing `}` -> `{expr}</tag>`
      if (/\{[^{}\n]+<\/[a-zA-Z0-9]+>/.test(lineText)) {
        let newLine = lineText.replace(/\{([^{}\n]+)(<\/[a-zA-Z0-9]+>)/, '{$1}$2');
        if (newLine !== lineText) {
          lines[line] = newLine;
          modified = true;
          return;
        }
      }

      // Rule C: `{expr<tag` e.g. `{user.department</strong>` -> `{user.department}</strong>`
      if (/\{[a-zA-Z0-9_.]+\s*<[a-zA-Z0-9]+/.test(lineText)) {
        let newLine = lineText.replace(/(\{([a-zA-Z0-9_.]+))(\s*<[a-zA-Z0-9]+)/, '$1}$3');
        if (newLine !== lineText) {
          lines[line] = newLine;
          modified = true;
          return;
        }
      }

      // Rule D: line ends with `}` before `};` or `)}` extra token
      if (/\}\s*\)\}/.test(lineText)) {
        let newLine = lineText.replace(/\}\s*\)\}/, ')}');
        if (newLine !== lineText) {
          lines[line] = newLine;
          modified = true;
          return;
        }
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      pass++;
    } else {
      break;
    }
  }
});

console.log('Finished AST auto-fixer passes.');
