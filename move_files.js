const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'app', 'img');
const destDir = path.join(__dirname, 'public', 'img');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
for (const file of files) {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  fs.renameSync(srcPath, destPath);
  console.log(`Moved ${file} to public/img`);
}
